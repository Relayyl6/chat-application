import messageModel from '../models/Message';
import channelModel from '../models/Channel';
import userModel from '../models/User';
import { AppError } from '../utils/AppError';
import { Types } from 'mongoose';

interface SendMessagePayload {
    content: string;
    replyTo?: string;
    type?: 'text' | 'image' | 'file' | 'system';
    attachments?: Array<{ url: string; type: string; name: string; size: number }>;
}

/**
 * Send a message in a channel
 * @param channelId - Channel ID
 * @param senderId - Sender user ID
 * @param payload - { content, replyTo?, type?, attachments? }
 * @returns Created message
 */
export const sendMessage = async (channelId: string, senderId: string, payload: SendMessagePayload) => {
    try {
        const { content, replyTo, type = 'text', attachments } = payload;

        // Verify user is in channel
        const channel = await channelModel.findOne({
            _id: channelId,
            'members.userId': senderId
        });

        if (!channel) {
            throw new AppError("Channel not found or access denied", 404);
        }

        // Validate content
        if (!content || content.trim().length === 0) {
            throw new AppError("Message content cannot be empty", 400);
        }

        // Get next autoId for this channel
        const lastMessage = await messageModel
            .findOne({ channelId })
            .sort({ autoId: -1 })
            .select('autoId');

        const nextAutoId = lastMessage ? lastMessage.autoId + 1 : 1;

        // Validate replyTo if provided
        if (replyTo) {
            const replyMessage = await messageModel.findById(replyTo);
            if (!replyMessage) {
                throw new AppError("Reply message not found", 404);
            }
        }

        // Create message
        const message = await messageModel.create({
            channelId,
            senderId,
            content: content.trim(),
            type,
            autoId: nextAutoId,
            replyTo: replyTo || null,
            attachments: attachments || [],
            readBy: [senderId], // Sender has read their own message
            deliveredTo: [senderId]
        });

        // Update channel last message
        await channelModel.updateOne(
            { _id: channelId },
            {
                $set: {
                    lastMessageAt: {
                        content,
                        senderId,
                        sendAt: new Date(),
                        autoId: nextAutoId
                    }
                }
            }
        );

        // Increment unread count for other members
        await channelModel.updateOne(
            { _id: channelId },
            {
                $inc: {
                    'members.$[elem].unreadCount': 1
                }
            },
            {
                arrayFilters: [{ 'elem.userId': { $ne: senderId } }]
            }
        );

        const populatedMessage = await messageModel.findById(message._id)
            .populate('senderId', 'username avatar status')
            .populate('replyTo');

        return populatedMessage;
    } catch (error) {
        if (error instanceof AppError) throw error;
        throw new AppError("Error sending message", 500);
    }
};

/**
 * Get messages from a channel
 * @param channelId - Channel ID
 * @param userId - Current user ID (for access verification)
 * @param options - { before?, limit?, skip? }
 * @returns Array of messages
 */
export const getMessages = async (
    channelId: string,
    userId: string,
    options: { before?: number; limit?: number; skip?: number } = {}
) => {
    try {
        const { before, limit = 50, skip = 0 } = options;

        // Verify user is in channel
        const channel = await channelModel.findOne({
            _id: channelId,
            'members.userId': userId
        });

        if (!channel) {
            throw new AppError("Channel not found or access denied", 404);
        }

        // Build query
        const query: any = { channelId };
        if (before) {
            query.autoId = { $lt: parseInt(before.toString(), 10) };
        }

        // Fetch messages
        const messages = await messageModel.find(query)
            .sort({ autoId: -1 })
            .skip(skip)
            .limit(parseInt(limit.toString()))
            .populate('senderId', 'username avatar status')
            .populate('replyTo');

        return messages.reverse();
    } catch (error) {
        if (error instanceof AppError) throw error;
        throw new AppError("Error fetching messages", 500);
    }
};

/**
 * Mark messages as read
 * @param channelId - Channel ID
 * @param userId - Current user ID
 * @param messageAutoId - Auto ID of last read message
 * @returns Success message
 */
export const markMessagesAsRead = async (channelId: string, userId: string, messageAutoId: number) => {
    try {
        // Update user's last read in channel
        const channelUpdate = await channelModel.updateOne(
            {
                _id: channelId,
                'members.userId': userId
            },
            {
                $set: {
                    'members.$.lastRead': messageAutoId,
                    'members.$.unreadCount': 0
                }
            }
        );

        if (channelUpdate.modifiedCount === 0) {
            throw new AppError("Channel not found", 404);
        }

        // Mark messages as read by user
        await messageModel.updateMany(
            {
                channelId,
                autoId: { $lte: messageAutoId },
                readBy: { $ne: userId }
            },
            {
                $addToSet: { readBy: userId },
                $set: { deliveredTo: userId }
            }
        );

        return { message: "Messages marked as read" };
    } catch (error) {
        if (error instanceof AppError) throw error;
        throw new AppError("Error marking messages as read", 500);
    }
};

/**
 * Delete a message
 * @param messageId - Message ID
 * @param userId - Current user ID (must be sender)
 * @returns Deleted message ID
 */
export const deleteMessage = async (messageId: string, userId: string) => {
    try {
        const message = await messageModel.findOne({
            _id: messageId,
            senderId: userId
        });

        if (!message) {
            throw new AppError("Message not found or you don't have permission to delete it", 404);
        }

        // Soft delete or permanent delete
        await messageModel.findByIdAndUpdate(
            messageId,
            {
                content: '[Message deleted]',
                type: 'system',
                attachments: [],
                isDeleted: true
            },
            { new: true }
        );

        return { message: "Message deleted" };
    } catch (error) {
        if (error instanceof AppError) throw error;
        throw new AppError("Error deleting message", 500);
    }
};

/**
 * Edit a message
 * @param messageId - Message ID
 * @param userId - Current user ID (must be sender)
 * @param newContent - New message content
 * @returns Updated message
 */
export const editMessage = async (messageId: string, userId: string, newContent: string) => {
    try {
        if (!newContent || newContent.trim().length === 0) {
            throw new AppError("Message content cannot be empty", 400);
        }

        const message = await messageModel.findOne({
            _id: messageId,
            senderId: userId
        });

        if (!message) {
            throw new AppError("Message not found or you don't have permission to edit it", 404);
        }

        // Check if message is too old to edit (optional: 15 minutes)
        const editWindow = 15 * 60 * 1000; // 15 minutes in milliseconds
        if (Date.now() - message.createdAt.getTime() > editWindow) {
            throw new AppError("Message is too old to edit", 400);
        }

        const updatedMessage = await messageModel.findByIdAndUpdate(
            messageId,
            {
                content: newContent.trim(),
                isEdited: true
            },
            { new: true }
        )
            .populate('senderId', 'username avatar status')
            .populate('replyTo');

        return updatedMessage;
    } catch (error) {
        if (error instanceof AppError) throw error;
        throw new AppError("Error editing message", 500);
    }
};

/**
 * React to a message
 * @param messageId - Message ID
 * @param userId - Current user ID
 * @param emoji - Emoji reaction
 * @returns Updated message
 */
export const reactToMessage = async (messageId: string, userId: string, emoji: string) => {
    try {
        const validEmojis = ['👍', '❤️', '😂', '😮', '😢', '🔥', '✨', '🎉'];
        if (!validEmojis.includes(emoji)) {
            throw new AppError("Invalid emoji reaction", 400);
        }

        // Add or update reaction
        const updatedMessage = await messageModel.findByIdAndUpdate(
            messageId,
            {
                $pull: { 'reactions.userId': userId }, // Remove if already reacted
                $push: {
                    reactions: {
                        userId,
                        emoji,
                        reactedAt: new Date()
                    }
                }
            },
            { new: true }
        );

        if (!updatedMessage) {
            throw new AppError("Message not found", 404);
        }

        return updatedMessage;
    } catch (error) {
        if (error instanceof AppError) throw error;
        throw new AppError("Error reacting to message", 500);
    }
};

/**
 * Get message statistics for a channel
 * @param channelId - Channel ID
 * @returns Message stats
 */
export const getMessageStats = async (channelId: string) => {
    try {
        const totalMessages = await messageModel.countDocuments({ channelId });

        const messagesByType = await messageModel.aggregate([
            { $match: { channelId: new Types.ObjectId(channelId) } },
            { $group: { _id: '$type', count: { $sum: 1 } } }
        ]);

        return {
            totalMessages,
            messagesByType
        };
    } catch (error) {
        throw new AppError("Error fetching message stats", 500);
    }
};

/**
 * Search messages in a channel
 * @param channelId - Channel ID
 * @param userId - Current user ID (for access verification)
 * @param query - Search query
 * @returns Array of matching messages
 */
export const searchMessages = async (channelId: string, userId: string, query: string) => {
    try {
        // Verify user is in channel
        const channel = await channelModel.findOne({
            _id: channelId,
            'members.userId': userId
        });

        if (!channel) {
            throw new AppError("Channel not found or access denied", 404);
        }

        const messages = await messageModel.find(
            {
                channelId,
                $text: { $search: query }
            },
            {
                score: { $meta: 'textScore' }
            }
        )
            .sort({ score: { $meta: 'textScore' } })
            .populate('senderId', 'username avatar')
            .limit(20);

        return messages;
    } catch (error) {
        throw new AppError("Error searching messages", 500);
    }
};
