import userModel from "../models/User";
import { AppError } from "../utils/AppError";
import { AuthSocket } from "./socket.manager";
import * as jwt from 'jsonwebtoken'

export const SocketMiddleware = async (socket: AuthSocket, next: (err?: any) => void) => {
    try {
        // ✅ Check both auth.token and handshake query as fallback
        const token = socket.handshake.auth?.token || socket.handshake.query?.token;

        if (!token) {
            return next(new AppError("Authentication error: No token provided", 401));
        }

        const secretKey = process.env.JWT_SECRET;
        if (!secretKey) {
            return next(new AppError("Server misconfiguration: JWT_SECRET missing", 500));
        }

        const decoded = jwt.verify(token as string, secretKey) as { userId: string };

        if (!decoded?.userId) {
            return next(new AppError("Authentication error: Invalid token payload", 401));
        }

        const user = await userModel.findById(decoded.userId).select('_id');
        if (!user) {
            return next(new AppError("Authentication error: User not found", 401));
        }

        socket.userId = user._id.toString();
        next();
    } catch (error: any) {
        console.error('[SocketMiddleware] Auth error:', error.message);
        if (error.name === 'TokenExpiredError') {
            return next(new AppError("Authentication error: Token expired", 401));
        }
        next(new AppError("Authentication error: Invalid token", 401));
    }
}