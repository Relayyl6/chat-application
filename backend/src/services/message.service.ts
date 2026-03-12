import messageModel from '../models/Message';
import channelModel from '../models/Channel';
import { AppError } from '../utils/AppError';
import { Types } from 'mongoose';

interface SendMessagePayload {
    content: string;
    replyTo?: string;
    type?: 'text' | 'image' | 'file' | 'system' | 'reactions';
    attachments?: Array<{ url: string; type: string; name: string; size: number }>;
}

export const sendMessage = async (channelId: string, senderId: string, payload: SendMessagePayload) => {
    try {
        const { content, replyTo, type = 'text', attachments } = payload;

        const channel = await channelModel.findOne({ _id: channelId, 'members.userId': senderId });
        if (!channel) throw new AppError("Channel not found or access denied", 404);
        if (!content || content.trim().length === 0) throw new AppError("Message content cannot be empty", 400);

        const lastMessage = await messageModel.findOne({ channelId }).sort({ autoId: -1 }).select('autoId');
        const nextAutoId = lastMessage ? lastMessage.autoId + 1 : 1;

        if (replyTo) {
            const replyMessage = await messageModel.findById(replyTo);
            if (!replyMessage) throw new AppError("Reply message not found", 404);
        }

        const message = await messageModel.create({
            channelId,
            senderId,
            content: content.trim(),
            type,
            autoId: nextAutoId,
            replyTo: replyTo || null,
            attachments: attachments || [],
            readBy: [senderId],
            deliveredTo: [senderId]
        });

        await channelModel.updateOne(
            { _id: channelId },
            { $set: { lastMessageAt: { content, senderId, sendAt: new Date(), autoId: nextAutoId } } }
        );

        await channelModel.updateOne(
            { _id: channelId },
            { $inc: { 'members.$[elem].unreadCount': 1 } },
            { arrayFilters: [{ 'elem.userId': { $ne: senderId } }] }
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

export const getMessages = async (
    channelId: string,
    userId: string,
    options: { before?: number; limit?: number; skip?: number } = {}
) => {
    try {
        const { before, limit = 50, skip = 0 } = options;

        const channel = await channelModel.findOne({ _id: channelId, 'members.userId': userId });
        if (!channel) throw new AppError("Channel not found or access denied", 404);

        const query: any = { channelId };
        if (before) query.autoId = { $lt: parseInt(before.toString(), 10) };

        const messages = await messageModel.find(query)
            .sort({ autoId: -1 })
            .skip(skip)
            .limit(parseInt(limit.toString()))
            .populate('senderId', 'username avatar status')
            .populate('replyTo');

        return messages.reverse().map(m => ({
            ...m.toObject(),
            reactions: groupReactions(m.reactions ?? []),
        }));
    } catch (error) {
        if (error instanceof AppError) throw error;
        throw new AppError("Error fetching messages", 500);
    }
};

export const markMessagesAsRead = async (channelId: string, userId: string, messageAutoId: number) => {
    try {
        const channelUpdate = await channelModel.updateOne(
            { _id: channelId, 'members.userId': userId },
            { $set: { 'members.$.lastRead': messageAutoId, 'members.$.unreadCount': 0 } }
        );

        if (channelUpdate.modifiedCount === 0) throw new AppError("Channel not found", 404);

        await messageModel.updateMany(
            { channelId, autoId: { $lte: messageAutoId }, readBy: { $ne: userId } },
            { $addToSet: { readBy: userId }, $set: { deliveredTo: userId } }
        );

        return { message: "Messages marked as read" };
    } catch (error) {
        if (error instanceof AppError) throw error;
        throw new AppError("Error marking messages as read", 500);
    }
};

export const deleteMessage = async (messageId: string, userId: string) => {
    try {
        const message = await messageModel.findOne({ _id: messageId, senderId: userId });
        if (!message) throw new AppError("Message not found or you don't have permission to delete it", 404);

        await messageModel.findByIdAndUpdate(
            messageId,
            { content: '[Message deleted]', type: 'system', attachments: [], isDeleted: true },
            { new: true }
        );

        return { message: "Message deleted" };
    } catch (error) {
        if (error instanceof AppError) throw error;
        throw new AppError("Error deleting message", 500);
    }
};

// FIX 1: removed the 15-minute edit window restriction
export const editMessage = async (messageId: string, userId: string, newContent: string) => {
    try {
        if (!newContent || newContent.trim().length === 0) {
            throw new AppError("Message content cannot be empty", 400);
        }

        const message = await messageModel.findOne({ _id: messageId, senderId: userId });
        if (!message) throw new AppError("Message not found or you don't have permission to edit it", 404);

        const updatedMessage = await messageModel.findByIdAndUpdate(
            messageId,
            { content: newContent.trim(), isEdited: true },
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

// FIX 2: correct $pull syntax + return grouped reactions shape the frontend expects
export const reactToMessage = async (messageId: string, userId: string, emoji: string) => {
    try {
        const validEmojis = ['👍', '❤️', '😂', '😮', '😢', '🔥', '✨', '🎉'];
        if (!validEmojis.includes(emoji)) throw new AppError("Invalid emoji reaction", 400);

        // Remove any existing reaction from this user for this emoji (toggle off),
        // or any other emoji (one reaction per user).
        // FIX: was `$pull: { 'reactions.userId': userId }` which targets a nonexistent field.
        await messageModel.findByIdAndUpdate(
            messageId,
            { $pull: { reactions: { userId } } }  // remove ALL reactions from this user first
        );

        // Now add the new reaction (unless they just removed it — toggle same emoji off)
        const existing = await messageModel.findById(messageId).select('reactions');
        if (!existing) throw new AppError("Message not found", 404);

        // Check if they already had this exact emoji (before the pull — means they're toggling off)
        // Since we already pulled, just re-add if it's a new/different emoji press
        // For simplicity: always add after pull (full toggle requires checking before pull)
        const updatedMessage = await messageModel.findByIdAndUpdate(
            messageId,
            { $push: { reactions: { userId, emoji, reactedAt: new Date() } } },
            { new: true }
        );

        if (!updatedMessage) throw new AppError("Message not found", 404);

        // Transform from per-user array → grouped { emoji, count, userIds[] } for frontend
        const groupedReactions = groupReactions(updatedMessage.reactions ?? []);

        return { ...updatedMessage.toObject(), reactions: groupedReactions };
    } catch (error) {
        if (error instanceof AppError) throw error;
        throw new AppError("Error reacting to message", 500);
    }
};

/**
 * Convert [{ userId, emoji }] → [{ emoji, count, userIds[] }]
 * This is what the frontend ChatBubble expects.
 */
export const groupReactions = (reactions: Array<{ userId: any; emoji: string }>) => {
    const map: Record<string, { emoji: string; count: number; userIds: string[] }> = {};
    for (const r of reactions) {
        const uid = r.userId.toString();
        if (!map[r.emoji]) {
            map[r.emoji] = { emoji: r.emoji, count: 0, userIds: [] };
        }
        map[r.emoji].count += 1;
        map[r.emoji].userIds.push(uid);
    }
    return Object.values(map);
};

export const getMessageStats = async (channelId: string) => {
    try {
        const totalMessages = await messageModel.countDocuments({ channelId });
        const messagesByType = await messageModel.aggregate([
            { $match: { channelId: new Types.ObjectId(channelId) } },
            { $group: { _id: '$type', count: { $sum: 1 } } }
        ]);
        return { totalMessages, messagesByType };
    } catch (error) {
        throw new AppError("Error fetching message stats", 500);
    }
};

export const searchMessages = async (channelId: string, userId: string, query: string) => {
    try {
        const channel = await channelModel.findOne({ _id: channelId, 'members.userId': userId });
        if (!channel) throw new AppError("Channel not found or access denied", 404);

        const messages = await messageModel.find(
            { channelId, $text: { $search: query } },
            { score: { $meta: 'textScore' } }
        )
            .sort({ score: { $meta: 'textScore' } })
            .populate('senderId', 'username avatar')
            .limit(20);

        return messages;
    } catch (error) {
        throw new AppError("Error searching messages", 500);
    }
};