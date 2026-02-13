import {z, ZodError } from 'zod';
import { NextFunction, Request, Response } from 'express';
import { AppError } from '../utils/AppError.ts';
import userModel from '../models/User.ts';
import { generateToken } from '../utils/helper.ts';

const registerSchema = z.object({
    username: z.string().min(3).max(20),
    email: z.email({ message: "Invalid email address" }),
    password: z.string().min(6, { message: "Password must be at least 6 characters" })
})

const loginSchema = z.object({
    email: z.email({ message: "Invalid email address" }),
    password: z.string().min(6, { message: "Password must be at least 6 characters" })
})

export const SignUp = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { username, email, password } = registerSchema.parse(req.body);

        const existingUser = await userModel.findOne({ $or: [{ email }, { username }]});

        if (existingUser) {
            return next(new AppError("User with given email or username already exists", 400));
        }

        // Create user
        const newUser = await userModel.create({ username, email, password });

        // generate token
        const token = await generateToken(newUser._id);
        await newUser.save();

        res.status(201).json({
            user: newUser,
            token
        });
    } catch (err) {
        if (err instanceof z.ZodError) {
            //@ts-ignore
          return res.status(400).json({ errors: (err as ZodError).errors });
        }
        next(new AppError("Server error while registering", 500));
    }
}

export const LogIn = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { email, password } = loginSchema.parse(req.body);

        // find user
        const user = await userModel.findOne({ email });

        if (!user) {
            return next(new AppError("Invalid credentials", 401))
        }

        const isMatch = await user.comparePassword(password)

        if (!isMatch) {
            return next(new AppError("Invalid credentials", 401))
        }

        user.status = 'online';
        await user.save();
        
        const token = generateToken(user._id);

        res.status(200).json({ user, token });
    } catch (error) {
        if (error instanceof z.ZodError) {
            //@ts-ignore
            return res.status(400).json({ errors: error.errors });
        }
        next(new AppError("Server error while loggin in", 500));
    }
}


