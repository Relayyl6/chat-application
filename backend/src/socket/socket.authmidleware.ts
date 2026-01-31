import { JWT_SECRET } from "../config/env.config.ts";
import userModel from "../models/User.ts";
import { AppError } from "../utils/AppError.ts";
import { AuthSocket } from "./socket.manager.ts";
import * as jwt from 'jsonwebtoken'

export const SocketMiddleware = async (socket: AuthSocket, next: any) => {
    try {
        const token = socket.handshake.auth.token;
        if (!token) {
            return next(new AppError("Authentication error: No token provided", 400));
        }
        const secretKey = process.env.JWT_SECRET || 'your_secret_key';
        const decoded = jwt.verify(token, secretKey) as { userId: string };
        const user = await userModel.findById(decoded.userId);
        if (!user) {
            return next(new AppError("Authentication error: User not found", 400));
        }
        socket.userId = user._id.toString();
        next();
    } catch (error) {
        next(new AppError("Authentication error: Invalid token", 401));
    }
}