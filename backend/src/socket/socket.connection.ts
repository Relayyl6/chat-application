import getRedisClient from "../config/redis";
import channelModel from "../models/Channel";
import userModel from "../models/User";
import { handleMessage } from "./handlers/message.handler";
import { handleTyping } from "./handlers/typing.handler";
import { AuthSocket } from "./socket.manager";
import { Server } from 'socket.io'

export const getUserchannels = async (userId: string): Promise<string[]> => {
    const channels = await channelModel.find({ 'members.userId': userId }).select('_id');
    return channels.map(channel => channel._id.toString());
}

export const Connection = async (socket: AuthSocket, io: Server) => {
    console.log("New client connected:", socket.id, "User ID:", socket.userId);

    socket.join(`user:${socket.userId}`);

    const redisClient = getRedisClient();

    try {
        await userModel.findByIdAndUpdate(socket.userId, { status: 'online' });
        await redisClient.hSet(`user:${socket.userId}`, 'socketId', socket.id);

        const userChannels = await getUserchannels(socket.userId!);

        // Auto-join all channels this user belongs to
        userChannels.forEach((channelId) => {
            socket.join(`channel:${channelId}`);
        });

        // Notify others in those channels that this user is online
        userChannels.forEach((channelId) => {
            socket.to(`channel:${channelId}`).emit('user:status', {
                userId: socket.userId,
                status: 'online',
            });
        });

        // ─── Rate limiter ──────────────────────────────────────────────────
        const messageTimestamps = new Map<string, number>();

        // ─── Message: send ─────────────────────────────────────────────────
        socket.on('message:send', async (data, callback) => {
            try {
                const now = Date.now();
                const last = messageTimestamps.get(socket.userId!) || 0;
                if (now - last < 300) {
                    if (typeof callback === 'function') callback({ status: 'error', reason: 'rate_limited' });
                    return;
                }
                messageTimestamps.set(socket.userId!, now);

                const msg = await handleMessage(io, socket, data);
                if (typeof callback === 'function') callback({ status: 'ok', messageId: (msg as any)?._id });
            } catch (err) {
                console.error('[socket] message:send error:', err);
                if (typeof callback === 'function') callback({ status: 'error' });
            }
        });

        // ─── Message: read ─────────────────────────────────────────────────
        // Placed here (not inside message.handler) so it's registered once
        // per connection, not once per message sent.
        socket.on('message:read', async ({ messageId, channelId }) => {
            try {
                socket.to(`channel:${channelId}`).emit('messages:read', {
                    messageId,
                    channelId,
                    userId: socket.userId,
                });
            } catch (err) {
                console.error('[socket] message:read error:', err);
            }
        });

        // ─── Typing ────────────────────────────────────────────────────────
        socket.on('message:typing', (data) => handleTyping(io, socket, data));

        // ─── Channel: join (for freshly created channels) ──────────────────
        // When a user navigates to a new channel that wasn't in their list
        // at connection time, the client emits this to join the room.
        socket.on('channel:join', async ({ channelId }) => {
            try {
                // Verify the user is actually a member before joining
                const channel = await channelModel.findOne({
                    _id: channelId,
                    'members.userId': socket.userId,
                });
                if (!channel) {
                    socket.emit('error', { message: 'Not a member of this channel' });
                    return;
                }
                socket.join(`channel:${channelId}`);
                console.log(`[socket] User ${socket.userId} joined room channel:${channelId}`);
            } catch (err) {
                console.error('[socket] channel:join error:', err);
            }
        });

        // ─── Channel: leave ────────────────────────────────────────────────
        socket.on('channel:leave', ({ channelId }) => {
            socket.leave(`channel:${channelId}`);
            console.log(`[socket] User ${socket.userId} left room channel:${channelId}`);
        });

        // ─── Disconnect ────────────────────────────────────────────────────
        socket.on('disconnect', async () => {
            console.log("Client disconnected:", socket.id);
            try {
                await userModel.findByIdAndUpdate(socket.userId, { status: 'offline' });
                await redisClient.hDel(`user:${socket.userId}`, 'socketId');

                userChannels.forEach((channelId) => {
                    socket.to(`channel:${channelId}`).emit('user:offline', {
                        userId: socket.userId,
                        status: 'offline',
                    });
                });
            } catch (err) {
                console.error('[socket] disconnect cleanup error:', err);
            }
        });

    } catch (error) {
        console.error('[socket] Connection setup error:', error);
        socket.disconnect();
    }
};