import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken'
import { JWT_SECRET } from '../config/env.config.js';
import userModel from '../models/User.ts';
import { AppError } from '../utils/AppError.ts';

export interface AuthRequest extends Request {
    user?: any
}

export const authMiddleware = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      let token;

      let header = req.headers.authorization;

      if (header && header.startsWith("Bearer" )) {
        token = header?.[0].replace("Bearer ", "")
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

      try {
        decoded = jwt.verify(token, JWT_SECRET);
        // req.userId = decoded.id;
      } catch (error) {
        return next(new AppError(`Invalid token : ${error}`, 401))
      }

      if (!decoded || !decoded.userId) {
          res.status(401).json({
            message: "Inavlid or expired token"
          })
        }

      let user = await userModel.findById(decoded.userId).select('-password') 
    
      let statusCode;
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
