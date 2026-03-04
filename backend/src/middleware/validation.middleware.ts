import { z } from 'zod';
import { Request, Response, NextFunction } from 'express';
import { AppError } from '../utils/AppError';

/**
 * ========================
 * VALIDATION SCHEMAS
 * ========================
 */

// ===== AUTH SCHEMAS =====
export const registerSchema = z.object({
    username: z.string()
        .min(3, 'Username must be at least 3 characters')
        .max(20, 'Username must be at most 20 characters')
        .regex(/^[a-zA-Z0-9_-]+$/, 'Username can only contain letters, numbers, underscore, and dash'),
    email: z.string()
        .email('Invalid email address')
        .min(5, 'Email too short'),
    password: z.string()
        .min(6, 'Password must be at least 6 characters')
        .max(50, 'Password too long')
        .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
        .regex(/[0-9]/, 'Password must contain at least one number')
});

export const loginSchema = z.object({
    email: z.string().email('Invalid email address'),
    password: z.string().min(1, 'Password is required')
});

export const updateProfileSchema = z.object({
    username: z.string()
        .min(3, 'Username must be at least 3 characters')
        .max(20, 'Username must be at most 20 characters')
        .regex(/^[a-zA-Z0-9_-]+$/, 'Username can only contain letters, numbers, underscore, and dash')
        .optional(),
    avatar: z.string()
        .url('Invalid avatar URL')
        .optional()
});

// ===== CHANNEL SCHEMAS =====
export const createChannelSchema = z.object({
    name: z.string()
        .min(3, 'Channel name must be at least 3 characters')
        .max(50, 'Channel name must be at most 50 characters')
        .optional(),
    type: z.enum(['direct', 'group', 'channel']),
    avatar: z.string().url('Invalid avatar URL').optional(),
    userIds: z.array(
        z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid user ID format')
    ).min(1, 'At least one user must be selected'),
    description: z.string()
        .max(500, 'Description must be at most 500 characters')
        .optional()
});

export const renameChannelSchema = z.object({
    name: z.string()
        .min(3, 'Channel name must be at least 3 characters')
        .max(50, 'Channel name must be at most 50 characters')
});

export const addMembersSchema = z.object({
    userIds: z.array(
        z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid user ID format')
    ).min(1, 'At least one user must be provided').max(10, 'Cannot add more than 10 users at once')
});

export const updateMemberRoleSchema = z.object({
    memberId: z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid member ID'),
    role: z.enum(['admin', 'member'])
});

// ===== MESSAGE SCHEMAS =====
export const sendMessageSchema = z.object({
    content: z.string()
        .min(1, 'Message cannot be empty')
        .max(10000, 'Message must be at most 10000 characters')
        .refine(val => val.trim().length > 0, 'Message cannot be only whitespace'),
    replyTo: z.string()
        .regex(/^[0-9a-fA-F]{24}$/, 'Invalid message ID')
        .optional(),
    type: z.enum(['text', 'image', 'file', 'system']).optional().default('text'),
    attachments: z.array(
        z.object({
            url: z.string().url('Invalid attachment URL'),
            type: z.string().min(1, 'Attachment type required'),
            name: z.string().min(1, 'Attachment name required'),
            size: z.number().positive('Attachment size must be positive').max(52428800, 'File too large (max 50MB)')
        })
    ).optional().default([])
});

export const markAsReadSchema = z.object({
    messageAutoId: z.number().int().positive('Message ID must be a positive integer')
});

export const editMessageSchema = z.object({
    content: z.string()
        .min(1, 'Message cannot be empty')
        .max(10000, 'Message must be at most 10000 characters')
});

export const reactMessageSchema = z.object({
    emoji: z.string()
        .min(1, 'Emoji is required')
        .max(2, 'Invalid emoji')
});

export const searchSchema = z.object({
    q: z.string()
        .min(1, 'Search query cannot be empty')
        .max(100, 'Search query too long'),
    limit: z.string()
        .transform(val => parseInt(val, 10))
        .refine(val => !isNaN(val) && val > 0 && val <= 100, 'Limit must be between 1 and 100')
        .optional()
});

// ===== PAGINATION SCHEMAS =====
export const paginationSchema = z.object({
    limit: z.string()
        .transform(val => parseInt(val, 10))
        .refine(val => !isNaN(val) && val > 0 && val <= 100, 'Limit must be between 1 and 100')
        .optional(),
    skip: z.string()
        .transform(val => parseInt(val, 10))
        .refine(val => !isNaN(val) && val >= 0, 'Skip must be non-negative')
        .optional(),
    before: z.string()
        .transform(val => parseInt(val, 10))
        .refine(val => !isNaN(val) && val > 0, 'Before must be a positive integer')
        .optional()
});

/**
 * ========================
 * VALIDATION MIDDLEWARE
 * ========================
 */

/**
 * Generic validation middleware factory
 * @param schema - Zod schema to validate against
 * @param target - 'body' | 'query' | 'params'
 */
export const validate = (schema: z.ZodSchema, target: 'body' | 'query' | 'params' = 'body') => {
    return (req: Request, res: Response, next: NextFunction) => {
        try {
            const dataToValidate = target === 'body' ? req.body : target === 'query' ? req.query : req.params;
            const validatedData = schema.parse(dataToValidate);

            // Replace original data with validated/coerced data
            if (target === 'body') {
                req.body = validatedData as any;
            } else if (target === 'query') {
                //@ts-ignore
                Object.keys(validatedData).forEach(key => {
                    (req.query as any)[key] = (validatedData as any)[key];
                });
            } else {
                req.params = validatedData as any;
            }

            next();
        } catch (error) {
            if (error instanceof z.ZodError) {
                const messages = (error as z.ZodError<any>).issues.map((err: any) => ({
                    field: err.path.join('.'),
                    message: err.message
                }));
                return res.status(400).json({
                    success: false,
                    error: 'Validation failed',
                    details: messages
                });
            }
            next(new AppError('Validation error', 400));
        }
    };
};

/**
 * Middleware to validate MongoDB ObjectID
 */
export const validateObjectId = (paramName: string = 'id') => {
    return (req: Request, res: Response, next: NextFunction) => {
        const id = req.params[paramName];
        if (!id || !/^[0-9a-fA-F]{24}$/.test(id)) {
            return next(new AppError(`Invalid ${paramName} format`, 400));
        }
        next();
    };
};

/**
 * Middleware to sanitize and trim string inputs
 */
export const sanitizeInputs = (req: Request, res: Response, next: NextFunction) => {
    const sanitizeValue = (value: any): any => {
        if (typeof value === 'string') {
            return value.trim().replace(/[<>]/g, '');
        }
        if (Array.isArray(value)) {
            return value.map(sanitizeValue);
        }
        if (typeof value === 'object' && value !== null) {
            return Object.keys(value).reduce((acc, key) => {
                acc[key] = sanitizeValue(value[key]);
                return acc;
            }, {} as any);
        }
        return value;
    };

    req.body = sanitizeValue(req.body);

    // ✅ Express 5: req.query is read-only, mutate in place instead
    const sanitizedQuery = sanitizeValue(req.query);
    Object.keys(sanitizedQuery).forEach(key => {
        (req.query as any)[key] = sanitizedQuery[key];
    });

    next();
};

/**
 * Middleware to rate limit by user
 */
const userRateLimits = new Map<string, { count: number; resetTime: number }>();

export const rateLimitByUser = (maxRequests: number = 30, windowMs: number = 60000) => {
    return (req: any, res: Response, next: NextFunction) => {
        const userId = req.user?._id?.toString() || req.ip;
        const now = Date.now();

        if (!userRateLimits.has(userId)) {
            userRateLimits.set(userId, { count: 1, resetTime: now + windowMs });
            return next();
        }

        const limit = userRateLimits.get(userId)!;

        if (now > limit.resetTime) {
            limit.count = 1;
            limit.resetTime = now + windowMs;
            return next();
        }

        limit.count++;

        if (limit.count > maxRequests) {
            return res.status(429).json({
                success: false,
                error: 'Too many requests',
                retryAfter: Math.ceil((limit.resetTime - now) / 1000)
            });
        }

        res.setHeader('X-RateLimit-Limit', maxRequests);
        res.setHeader('X-RateLimit-Remaining', maxRequests - limit.count);
        next();
    };
};

/**
 * Middleware to check request size
 */
export const validateRequestSize = (maxSizeMb: number = 10) => {
    return (req: Request, res: Response, next: NextFunction) => {
        const contentLength = req.get('content-length');
        if (contentLength && parseInt(contentLength, 10) > maxSizeMb * 1024 * 1024) {
            return next(new AppError(`Request body too large (max ${maxSizeMb}MB)`, 413));
        }
        next();
    };
};
