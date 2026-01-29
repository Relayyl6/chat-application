import { Server as HTTPServer } from "http";
import { Server, Socket } from "socket.io";
import { SocketMiddleware } from "./socket.authmidleware.ts";
import { Connection } from "./socket.connection.ts";
import { createClient } from "redis";
import { createAdapter } from "@socket.io/redis-adapter";
export interface AuthSocket extends Socket {
    userId?: string
}

export const initializeSocket = async (httpServer: HTTPServer) => {
    const io = new Server(httpServer, {
        cors: {
            origin: process.env.ALLOWED_ORIGINS?.split(',') || '*',
            credentials: true
        }
    })

    // 🔴 CREATE SEPARATE REDIS CLIENTS FOR SOCKET.IO ADAPTER
    const pubClient = createClient({ url: process.env.REDIS_URL });
    const subClient = pubClient.duplicate();

    await Promise.all([
        pubClient.connect(),
        subClient.connect()
    ]);

    io.adapter(createAdapter(pubClient, subClient)); // 🔥 THIS enables multi-server sockets

    io.use(SocketMiddleware)

    io.on('connection', (socket: AuthSocket) => Connection(socket, io))

    return io;
}