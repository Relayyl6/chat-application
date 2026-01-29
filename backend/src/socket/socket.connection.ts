import redisClient from "../config/redis.ts";
import channelModel from "../models/Channel.ts";
import userModel from "../models/User.ts";
import { handleMessage } from "./handlers/message.handler.ts";
import { handleTyping } from "./handlers/typing.handler.ts";
import { AuthSocket } from "./socket.manager.ts";
import { Server } from 'socket.io'

export const getUserchannels = async (userId: string): Promise<string[]> => {
    // Implementation here
    const channels = await channelModel.find({ 'members.userId': userId }).select('_id');
    return channels.map(channel => channel._id.toString());
}

export const Connection = async (socket: AuthSocket, io: Server) => {
    console.log(
        "New client connected:", socket.id,
        "User ID:", socket.userId
    );

    await userModel.findByIdAndUpdate(socket.userId, { status: 'online' });

    // store socket in redis for scaling
    await redisClient.hSet(`user: ${socket.userId}`, 'socketId', socket.id);

    // join user's channel
    const userChannels = await getUserchannels(socket.userId!);
    userChannels.forEach((channelId: any) => {
        socket.join(`channel:${channelId}`);
    })

    // emit online status to friends
    userChannels.forEach(channelId => {
        socket.to(`channel:${channelId}`).emit("user:status", {
            userId: socket.userId,
            status: "online",
        });
    });

    const messageTimestamps = new Map<string, number>();
    // message handler
    socket.on('message:send', (data) => {
        
        handleMessage(io, socket, data);
    });

    socket.on("message:send", async (data, callback) => {
        try {
            const now = Date.now();
            const last = messageTimestamps.get(socket.userId!) || 0;
            if (now - last < 300) return; // 0.3s spam protection
            messageTimestamps.set(socket.userId!, now);
            const msg = await handleMessage(io, socket, data);
            callback({ status: "ok", messageId: (msg as any)?._id});
        } catch {
            callback({ status: "error" });
        }
    });
    socket.on('message:typing', (data) => handleTyping(io, socket, data));

    // presence handlers
    socket.on('channel:join', async (data) => socket.join(`channel:${data.channelId}`));

    // Handle user leaving channel
    socket.on('channel:leave', async (data) => {
      const { channelId } = data;
      socket.leave(`channel:${channelId}`);
    });

    socket.on('disconnect', async () => {
        console.log("Client disconnected:", socket.id);

        await userModel.findByIdAndUpdate(socket.userId, { status: 'offline' });
        await redisClient.hDel(`user: ${socket.userId}`, 'socketId');
        userChannels.forEach(channelId => {
            socket.to(`channel:${channelId}`).emit("user:status", {
                userId: socket.userId,
                status: "offline",
            });
        });
    })
}