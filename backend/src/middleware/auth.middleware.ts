import { Request, Response, NextFunction } from 'express';
import {jwt} from 'jsonwebtoken';
import { JWT_SECRET } from '../config/env.js';
import userModel from '../models/User.ts';

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
        // return res.status(401).json({ message: "Invalid token" });
        const errorMsg = new Error(`Invalid token : ${error}`);
        // @ts-ignore
        errorMsg.statusCode = 401
        return next(errorMsg)
      }

      if (!decoded || !decoded.userId) {
          res.status(401).json({
            message: "Inavlid or expired token"
          })
        }

      let user = await userModel.findById(decoded.userId).select('-password') 
    
      let statusCode;
      if (!user) {
        const error = new Error("User not found, Invalid Token");
        (error as any).statusCode = 401
        return next(error)
      }
      req.user = user;
      next();
    } catch (error: unknown) {
      console.error("Authentication Error", (error as Error).message)
      const errorMsg: Error = new Error(`Token is not valid`)
      (errorMsg as Error).statusCode = 400;
      return next(errorMsg)
    }
};
