import userModel from '../models/User';
import { generateToken } from '../utils/helper';
import { AppError } from '../utils/AppError';

interface RegisterPayload {
    username: string;
    email: string;
    password: string;
}

interface LoginPayload {
    email: string;
    password: string;
}

interface AuthResponse {
    user: any;
    token: string;
}

/**
 * Register a new user
 * @param payload - { username, email, password }
 * @returns { user, token }
 */
export const registerUser = async (payload: RegisterPayload): Promise<AuthResponse> => {
    try {
        const { username, email, password } = payload;

        // Check if user already exists
        const existingUser = await userModel.findOne({
            $or: [{ email }, { username }]
        });

        if (existingUser) {
            throw new AppError("User with given email or username already exists", 400);
        }

        // Create new user
        const newUser = await userModel.create({
            username,
            email,
            password
        });

        // Generate JWT token
        const token = generateToken(newUser._id);
        await newUser.save();

        return {
            user: newUser,
            token
        };
    } catch (error) {
        if (error instanceof AppError) throw error;
        throw new AppError("Error during user registration", 500);
    }
};

/**
 * Login user
 * @param payload - { email, password }
 * @returns { user, token }
 */
export const loginUser = async (payload: LoginPayload): Promise<AuthResponse> => {
    try {
        const { email, password } = payload;

        // Find user by email
        const user = await userModel.findOne({ email });

        if (!user) {
            throw new AppError("Invalid credentials", 401);
        }

        // Compare password
        const isPasswordMatch = await user.comparePassword(password);

        if (!isPasswordMatch) {
            throw new AppError("Invalid credentials", 401);
        }

        // Update user status to online
        user.status = 'online';
        await user.save();

        // Generate JWT token
        const token = generateToken(user._id);

        return {
            user,
            token
        };
    } catch (error) {
        if (error instanceof AppError) throw error;
        throw new AppError("Error during login", 500);
    }
};

/**
 * Get user by ID
 * @param userId - User ID
 * @returns User document
 */
export const getUserById = async (userId: string) => {
    try {
        const user = await userModel.findById(userId).select('-password');
        if (!user) {
            throw new AppError("User not found", 404);
        }
        return user;
    } catch (error) {
        if (error instanceof AppError) throw error;
        throw new AppError("Error fetching user", 500);
    }
};

/**
 * Update user status
 * @param userId - User ID
 * @param status - 'online' | 'offline' | 'away'
 * @returns Updated user
 */
export const updateUserStatus = async (userId: string, status: 'online' | 'offline' | 'away') => {
    try {
        const user = await userModel.findByIdAndUpdate(
            userId,
            { status, lastSeen: Date.now() },
            { new: true }
        ).select('-password');

        if (!user) {
            throw new AppError("User not found", 404);
        }

        return user;
    } catch (error) {
        if (error instanceof AppError) throw error;
        throw new AppError("Error updating user status", 500);
    }
};

/**
 * Update user profile
 * @param userId - User ID
 * @param updates - { username?, avatar? }
 * @returns Updated user
 */
export const updateUserProfile = async (userId: string, updates: { username?: string; avatar?: string }) => {
    try {
        if (updates.username) {
            const existingUser = await userModel.findOne({
                username: updates.username,
                _id: { $ne: userId }
            });

            if (existingUser) {
                throw new AppError("Username already taken", 400);
            }
        }

        const user = await userModel.findByIdAndUpdate(
            userId,
            updates,
            { new: true }
        ).select('-password');

        if (!user) {
            throw new AppError("User not found", 404);
        }

        return user;
    } catch (error) {
        if (error instanceof AppError) throw error;
        throw new AppError("Error updating user profile", 500);
    }
};

/**
 * Logout user (set status to offline)
 * @param userId - User ID
 * @returns Updated user
 */
export const logoutUser = async (userId: string) => {
    try {
        const user = await userModel.findByIdAndUpdate(
            userId,
            { status: 'offline', lastSeen: Date.now() },
            { new: true }
        ).select('-password');

        if (!user) {
            throw new AppError("User not found", 404);
        }

        return user;
    } catch (error) {
        if (error instanceof AppError) throw error;
        throw new AppError("Error during logout", 500);
    }
};

/**
 * Search for a user by exact username (case-insensitive).
 * Excludes the requesting user from results.
 */
export const findUserByUsername = async (
    username: string,
    requestingUserId: string
) => {
    const user = await userModel
        .findOne({ username: { $regex: `^${username.trim()}$`, $options: 'i' } })
        .select('_id username avatar status');

    if (!user) throw new AppError('User not found', 404);

    if (user._id.toString() === requestingUserId) {
        throw new AppError('User not found', 404);
    }

    return user;
};