import { NextFunction, Request, Response } from 'express';
import { AuthRequest } from '../middleware/auth.middleware';
import { AppError } from '../utils/AppError';
import {
    registerUser,
    loginUser,
    updateUserStatus,
    updateUserProfile,
    findUserByUsername
} from '../services/auth.service';

/**
 * Sign up / Register new user
 */
export const SignUp = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { username, email, password } = req.body;

        const result = await registerUser({ username, email, password });

        res.status(201).json({
            success: true,
            data: {
                user: result.user,
                token: result.token
            },
            message: 'User registered successfully'
        });
    } catch (error) {
        next(error);
    }
};

/**
 * Login user
 */
export const LogIn = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { email, password } = req.body;

        const result = await loginUser({ email, password });

        res.status(200).json({
            success: true,
            data: {
                user: result.user,
                token: result.token
            },
            message: 'Logged in successfully'
        });
    } catch (error) {
        next(error);
    }
};

/**
 * Update user profile
 */
export const updateProfile = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
        const { username, avatar } = req.body;
        const userId = req.user._id;

        const updatedUser = await updateUserProfile(userId, { username, avatar });

        res.status(200).json({
            success: true,
            data: { user: updatedUser },
            message: 'Profile updated successfully'
        });
    } catch (error) {
        next(error);
    }
};

/**
 * Change user status
 */
export const changeStatus = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
        const { status } = req.body;
        const userId = req.user._id;

        if (!['online', 'offline', 'away'].includes(status)) {
            return next(new AppError('Invalid status', 400));
        }

        const updatedUser = await updateUserStatus(userId, status as 'online' | 'offline' | 'away');

        res.status(200).json({
            success: true,
            data: { user: updatedUser },
            message: 'Status updated successfully'
        });
    } catch (error) {
        next(error);
    }
};

/**
 * Get current user
 */
export const getCurrentUser = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
        res.status(200).json({
            success: true,
            data: { user: req.user },
            message: 'Current user retrieved'
        });
    } catch (error) {
        next(error);
    }
};

export const searchUserByUsername = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
        const { username } = req.query;

        if (!username || typeof username !== 'string' || !username.trim()) {
            return next(new AppError('Username query param is required', 400));
        }

        const user = await findUserByUsername(username, req.user._id.toString());

        res.status(200).json({
            success: true,
            data: { user },
            message: 'User found successfully',
        });
    } catch (error) {
        next(error);
    }
};