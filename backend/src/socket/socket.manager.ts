import { Server as HTTPServer } from "http";
import { Server, Socket } from "socket.io";
import { SocketMiddleware } from "./socket.authmidleware";
import { Connection } from "./socket.connection";
import { createClient } from "redis";
import { createAdapter } from "@socket.io/redis-adapter";
export interface AuthSocket extends Socket {
    userId?: string
}

export const initializeSocket = async (httpServer: HTTPServer) => {
    const allowedOrigins = process.env.ALLOWED_ORIGINS?.split(',') || ['http://localhost:3000', 'http://localhost:3001'];
    const io = new Server(httpServer, {
        cors: {
            origin: allowedOrigins,
            credentials: true
        }
    })

    // 🔴 CREATE SEPARATE REDIS CLIENTS FOR SOCKET.IO ADAPTER
    const pubClient = createClient({ url: process.env.REDIS_URL });
    const subClient = pubClient.duplicate();

    // Add error handlers for Redis clients
    pubClient.on('error', (err) => console.error('Redis Pub Client error:', err));
    subClient.on('error', (err) => console.error('Redis Sub Client error:', err));

    await Promise.all([
        pubClient.connect(),
        subClient.connect()
    ]);

    io.adapter(createAdapter(pubClient, subClient)); // 🔥 THIS enables multi-server sockets

    io.use(SocketMiddleware)

    io.on('connection', (socket: AuthSocket) => Connection(socket, io))

    return io;
}