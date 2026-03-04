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
    console.log(
        "New client connected:", socket.id,
        "User ID:", socket.userId
    );

    // Join personal room so user receives direct notifications
    socket.join(`user:${socket.userId}`);

    const redisClient = getRedisClient(); // Get Redis client instance

    try {
        await userModel.findByIdAndUpdate(socket.userId, { status: 'online' });

        await redisClient.hSet(`user:${socket.userId}`, 'socketId', socket.id);

        const userChannels = await getUserchannels(socket.userId!);
        userChannels.forEach((channelId: any) => {
            socket.join(`channel:${channelId}`);
        })

        userChannels.forEach(channelId => {
            socket.to(`channel:${channelId}`).emit("user:status", {
                userId: socket.userId,
                status: "online",
            });
        });

        const messageTimestamps = new Map<string, number>();

        // ✅ Single handler
        socket.on('message:send', async (data, callback) => {
            try {
                const now = Date.now();
                const last = messageTimestamps.get(socket.userId!) || 0;
                if (now - last < 300) {
                    if (typeof callback === 'function') {
                        callback({ status: "error", reason: "rate_limited" });
                    }
                    return;
                }
                messageTimestamps.set(socket.userId!, now);
                const msg = await handleMessage(io, socket, data);
                if (typeof callback === 'function') {
                    callback({ status: "ok", messageId: (msg as any)?._id });
                }
            } catch (err) {
                console.error('[socket] message:send error:', err);
                if (typeof callback === 'function') {
                    callback({ status: "error" });
                }
            }
        });

        socket.on('message:typing', (data) => handleTyping(io, socket, data));

        socket.on('channel:join', async (data) => socket.join(`channel:${data.channelId}`));

        socket.on('channel:leave', async (data) => {
            const { channelId } = data;
            socket.leave(`channel:${channelId}`);
        });

        socket.on('disconnect', async () => {
            console.log("Client disconnected:", socket.id);
            try {
                await userModel.findByIdAndUpdate(socket.userId, { status: 'offline' });
                // ✅ Fix 2: consistent key without space
                await redisClient.hDel(`user:${socket.userId}`, 'socketId');
                userChannels.forEach((channelId) => {
                    socket.to(`channel:${channelId}`).emit("user:offline", {
                        userId: socket.userId,
                        status: "offline",
                    });
                });
            } catch (err) {
                console.error('[socket] disconnect cleanup error:', err);
            }
        });
    } catch(error) {
        console.error('[socket] Connection setup error:', error);
        socket.disconnect();
    }
}