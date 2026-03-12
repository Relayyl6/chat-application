import { AuthRequest } from '../middleware/auth.middleware';
import { Response, NextFunction } from 'express';
import { AppError } from '../utils/AppError';
import {
    sendMessage as sendMessageService,
    getMessages,
    markMessagesAsRead,
    deleteMessage as deleteMessageService,
    editMessage as editMessageService,
    reactToMessage as reactToMessageService,
    searchMessages
} from '../services/message.service';

export const sendMessage = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
        const { channelId } = req.params;
        const { content, attachments, replyTo } = req.body;
        const message = await sendMessageService(channelId, req.user._id, { content, attachments, replyTo });
        const io = req.app.get('io');
        if (io) io.to(`channel:${channelId}`).emit('message:sent', {
            ...message?.toObject(),
            tempId: req.body.tempId ?? null,
        });
        res.status(201).json({ success: true, data: { message }, message: 'Message sent successfully' });
    } catch (error) {
        next(error);
    }
};

export const getChannelMessages = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
        const { channelId } = req.params;
        const { page = 1, limit = 50 } = req.query;
        const result = await getMessages(channelId, req.user._id, {
            skip: (Number(page) - 1) * Number(limit),
            limit: Number(limit)
        });
        res.status(200).json({ success: true, data: result, message: 'Messages retrieved successfully' });
    } catch (error) {
        next(error);
    }
};

export const markAsRead = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
        const { channelId } = req.params;
        const result = await markMessagesAsRead(channelId, req.user._id, 0);
        const io = req.app.get('io');
        if (io) io.to(`channel:${channelId}`).emit('messages:read', { channelId, userId: req.user._id });
        res.status(200).json({ success: true, data: result, message: 'Messages marked as read' });
    } catch (error) {
        next(error);
    }
};

export const deleteMessage = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
        const { channelId, messageId } = req.params;
        const result = await deleteMessageService(messageId, req.user._id);
        const io = req.app.get('io');
        if (io) io.to(`channel:${channelId}`).emit('message:deleted', { channelId, messageId, deletedBy: req.user._id });
        res.status(200).json({ success: true, data: result, message: 'Message deleted successfully' });
    } catch (error) {
        next(error);
    }
};

export const editMessage = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
        const { channelId, messageId } = req.params;
        const { content } = req.body;
        const updatedMessage = await editMessageService(messageId, req.user._id, content);
        if (!updatedMessage) return next(new AppError('Message not found', 404));

        const io = req.app.get('io');
        if (io) {
            io.to(`channel:${channelId}`).emit('message:edited', {
                channelId,
                messageId,
                // Use the trimmed content from the DB, not raw req.body
                content: updatedMessage.content,
                editedBy: req.user._id,
                updatedAt: updatedMessage.updatedAt,
            });
        }

        res.status(200).json({ success: true, data: { message: updatedMessage }, message: 'Message edited successfully' });
    } catch (error) {
        next(error);
    }
};

export const reactToMessage = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
        const { channelId, messageId } = req.params;
        const { emoji } = req.body;
        const updatedMessage = await reactToMessageService(messageId, req.user._id, emoji);

        const io = req.app.get('io');
        if (io) {
            // Broadcast the fully grouped reactions array so all clients
            // can update their state without computing it themselves
            io.to(`channel:${channelId}`).emit('message:reaction-added', {
                channelId,
                messageId,
                emoji,
                userId: req.user._id,
                // updatedMessage already has grouped reactions from the service
                reactions: updatedMessage.reactions,
            });
        }

        res.status(200).json({ success: true, data: { message: updatedMessage }, message: 'Reaction added successfully' });
    } catch (error) {
        next(error);
    }
};

export const searchChannelMessages = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
        const { channelId } = req.params;
        const { q, page = 1, limit = 50 } = req.query;
        if (!q) return next(new AppError('Search query is required', 400));
        const result = await searchMessages(channelId, req.user._id, String(q));
        res.status(200).json({ success: true, data: result, message: 'Search completed successfully' });
    } catch (error) {
        next(error);
    }
};