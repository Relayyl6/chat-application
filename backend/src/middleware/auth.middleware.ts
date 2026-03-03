import { Request, Response, NextFunction } from 'express';
import * as jwt from 'jsonwebtoken'
import { JWT_SECRET } from '../config/env.config';
import userModel from '../models/User';
import { AppError } from '../utils/AppError';

export interface AuthRequest extends Request {
    user?: any
}

export const authMiddleware = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      let token;

      const header = req.headers.authorization;

      if (header && header.startsWith("Bearer ")) {
        token = header.substring(7); // Skip "Bearer " (7 characters)
      }

      if (!token && req.cookies) {
          token = req.cookies.token
      }

      if (!token) {
        return res.status(401).json({
          message: "Not authenticated"
        });
      }

      let decoded;
      const secretKey = process.env.JWT_SECRET;
      if (!secretKey) {
        return next(new AppError('JWT_SECRET environment variable is not set', 500));
      }
      try {
        decoded = jwt.verify(token, secretKey) as { userId: string };
        // req.userId = decoded.id;
      } catch (error) {
        return next(new AppError(`Invalid token : ${error}`, 401))
      }

      if (!decoded || !decoded.userId) {
          return next(new AppError("Invalid or expired token", 401));
        }

      let user = await userModel.findById(decoded.userId).select('-password') 
    
      if (!user) {
        return next(new AppError("User not found, Invalid Token", 401));
      }
      req.user = user;
      next();
    } catch (error: unknown) {
      console.error("Authentication Error", (error as Error).message)
      return next(new AppError(`An error occurred in the auth middleware ${error}`, 400));
    }
};
