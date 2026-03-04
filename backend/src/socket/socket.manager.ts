import { Server as HTTPServer } from "http";
import { Server, Socket } from "socket.io";
import { SocketMiddleware } from "./socket.authmidleware";
import { Connection } from "./socket.connection";
import { createClient } from "redis";
import { createAdapter } from "@socket.io/redis-adapter";

export interface AuthSocket extends Socket {
    userId?: string
}

// ✅ Export io so controllers can access it without going through app.get('io')
let io: Server;

export const getIO = (): Server => {
    if (!io) throw new Error('Socket.IO not initialized');
    return io;
}

export const initializeSocket = async (httpServer: HTTPServer): Promise<Server> => {
    const allowedOrigins = process.env.ALLOWED_ORIGINS?.split(',').map(o => o.trim())
        || ['http://localhost:3000', 'http://localhost:3001'];

    io = new Server(httpServer, {
        cors: {
            origin: allowedOrigins,
            credentials: true,
            methods: ['GET', 'POST']
        },
        // ✅ Ping settings to keep connections alive on Render
        pingTimeout: 60000,
        pingInterval: 25000,
    });

    const pubClient = createClient({ url: process.env.REDIS_URL });
    const subClient = pubClient.duplicate();

    pubClient.on('error', (err) => console.error('Redis Pub Client error:', err));
    subClient.on('error', (err) => console.error('Redis Sub Client error:', err));

    await Promise.all([pubClient.connect(), subClient.connect()]);

    io.adapter(createAdapter(pubClient, subClient));

    io.use(SocketMiddleware);

    io.on('connection', (socket: AuthSocket) => Connection(socket, io));

    console.log('✅ Socket.IO initialized');
    return io;
}