import channelModel from '../models/Channel';
import userModel from '../models/User';
import messageModel from '../models/Message';
import { AppError } from '../utils/AppError';
import { Types } from 'mongoose';

interface CreateChannelPayload {
    name?: string;
    type: 'direct' | 'group' | 'channel';
    avatar?: string;
    userIds: string[];
    description?: string;
}

/**
 * Create a new channel
 * @param userId - Current user ID
 * @param payload - { name, type, avatar, userIds, description }
 * @returns Created channel
 */
export const createChannel = async (userId: string, payload: CreateChannelPayload) => {
    try {
        const { name, type, avatar, userIds, description } = payload;

        // For direct messages, check if channel already exists
        if (type === 'direct') {
            if (userIds.length !== 1) {
                throw new AppError("Direct channels must have exactly one other user", 400);
            }

            const existingChannel = await channelModel.findOne({
                type: 'direct',
                'members.userId': { $all: [userId, userIds[0]] }
            }).populate('members.userId', 'username email avatar status');

            if (existingChannel) {
                return existingChannel;
            }
        }

        // Validate users exist
        const users = await userModel.find({ _id: { $in: userIds } });
        if (users.length !== userIds.length) {
            throw new AppError("One or more users not found", 400);
        }

        // Create channel
        const channel = await channelModel.create({
            name: type === 'direct' ? null : name,
            type,
            avatar,
            description,
            createdBy: userId,
            members: [
                {
                    userId,
                    role: 'admin'
                },
                ...userIds.map((id) => ({
                    userId: id,
                    role: 'member'
                }))
            ]
        });

        const populatedChannel = await channelModel.findById(channel._id)
            .populate('members.userId', 'username email avatar status')
            .populate('createdBy', 'username');

        return populatedChannel;
    } catch (error) {
        if (error instanceof AppError) throw error;
        throw new AppError("Error creating channel", 500);
    }
};

/**
 * Get all channels for a user
 * @param userId - User ID
 * @returns Array of channels
 */
export const getUserChannels = async (userId: string) => {
    try {
        const channels = await channelModel.find({
            'members.userId': userId
        })
            .populate('members.userId', 'username email avatar status')
            .populate('lastMessageAt.senderId', 'username')
            .sort({ 'lastMessageAt.sendAt': -1 });

        return channels;
    } catch (error) {
        throw new AppError("Error fetching channels", 500);
    }
};

/**
 * Get single channel details
 * @param channelId - Channel ID
 * @param userId - Current user ID (for access verification)
 * @returns Channel details
 */
export const getChannelById = async (channelId: string, userId: string) => {
    try {
        const channel = await channelModel.findOne({
            _id: channelId,
            'members.userId': userId
        }).populate('members.userId', 'username email avatar status');

        if (!channel) {
            throw new AppError("Channel not found or access denied", 404);
        }

        return channel;
    } catch (error) {
        if (error instanceof AppError) throw error;
        throw new AppError("Error fetching channel", 500);
    }
};

/**
 * Rename a channel (admin only)
 * @param channelId - Channel ID
 * @param userId - Current user ID
 * @param newName - New channel name
 * @returns Updated channel
 */
export const renameChannel = async (channelId: string, userId: string, newName: string) => {
    try {
        // Verify user is admin
        const channel = await channelModel.findOne({
            _id: channelId,
            members: { $elemMatch: { userId, role: 'admin' } }
        });

        if (!channel) {
            throw new AppError("Only admins can rename channel", 403);
        }

        const updatedChannel = await channelModel.findByIdAndUpdate(
            channelId,
            { name: newName },
            { new: true }
        ).populate('members.userId', 'username email avatar status');

        return updatedChannel;
    } catch (error) {
        if (error instanceof AppError) throw error;
        throw new AppError("Error renaming channel", 500);
    }
};

/**
 * Add members to a channel
 * @param channelId - Channel ID
 * @param userId - Current user ID
 * @param userIds - Array of user IDs to add
 * @returns Updated channel
 */
export const addMembersToChannel = async (channelId: string, userId: string, userIds: string[]) => {
    try {
        // Verify user is admin or creator
        const channel = await channelModel.findOne({
            _id: channelId,
            $or: [
                { createdBy: userId },
                { members: { $elemMatch: { userId, role: 'admin' } } }
            ]
        });

        if (!channel) {
            throw new AppError("Only admins can add members", 403);
        }

        // Validate users exist
        const users = await userModel.find({ _id: { $in: userIds } });
        if (users.length !== userIds.length) {
            throw new AppError("One or more users not found", 400);
        }

        // Add new members
        const newMembers = userIds.map((id) => ({
            userId: id,
            role: 'member'
        }));

        const updatedChannel = await channelModel.findByIdAndUpdate(
            channelId,
            { $push: { members: { $each: newMembers } } },
            { new: true }
        ).populate('members.userId', 'username email avatar status');

        return updatedChannel;
    } catch (error) {
        if (error instanceof AppError) throw error;
        throw new AppError("Error adding members", 500);
    }
};

/**
 * Remove member from channel
 * @param channelId - Channel ID
 * @param userId - Current user ID
 * @param memberIdToRemove - User ID to remove
 * @returns Updated channel
 */
export const removeMemberFromChannel = async (channelId: string, userId: string, memberIdToRemove: string) => {
    try {
        // Verify user is admin or creator
        const channel = await channelModel.findOne({
            _id: channelId,
            $or: [
                { createdBy: userId },
                { members: { $elemMatch: { userId, role: 'admin' } } }
            ]
        });

        if (!channel) {
            throw new AppError("Only admins can remove members", 403);
        }

        // Prevent removing creator
        if (channel.createdBy.toString() === memberIdToRemove) {
            throw new AppError("Cannot remove channel creator", 400);
        }

        const updatedChannel = await channelModel.findByIdAndUpdate(
            channelId,
            { $pull: { members: { userId: memberIdToRemove } } },
            { new: true }
        ).populate('members.userId', 'username email avatar status');

        return updatedChannel;
    } catch (error) {
        if (error instanceof AppError) throw error;
        throw new AppError("Error removing member", 500);
    }
};

/**
 * Leave a channel
 * @param channelId - Channel ID
 * @param userId - Current user ID
 * @returns Success message
 */
export const leaveChannel = async (channelId: string, userId: string) => {
    try {
        const channel = await channelModel.findOne({
            _id: channelId,
            'members.userId': userId
        });

        if (!channel) {
            throw new AppError("Channel not found", 404);
        }

        // If user is the only member, delete the channel
        if (channel.members.length === 1) {
            await channelModel.deleteOne({ _id: channelId });
            return { message: "Channel deleted" };
        }

        // Otherwise, remove user from members
        await channelModel.findByIdAndUpdate(
            channelId,
            { $pull: { members: { userId } } },
            { new: true }
        );

        return { message: "Left channel successfully" };
    } catch (error) {
        if (error instanceof AppError) throw error;
        throw new AppError("Error leaving channel", 500);
    }
};

/**
 * Get channel members
 * @param channelId - Channel ID
 * @param userId - Current user ID (for access verification)
 * @returns Array of members
 */
export const getChannelMembers = async (channelId: string, userId: string) => {
    try {
        const channel = await channelModel.findOne({
            _id: channelId,
            'members.userId': userId
        }).populate('members.userId', 'username email avatar status');

        if (!channel) {
            throw new AppError("Channel not found or access denied", 404);
        }

        return channel.members;
    } catch (error) {
        if (error instanceof AppError) throw error;
        throw new AppError("Error fetching members", 500);
    }
};

/**
 * Update member role
 * @param channelId - Channel ID
 * @param userId - Current user ID
 * @param memberId - Member ID to update
 * @param newRole - New role ('admin' | 'member')
 * @returns Updated channel
 */
export const updateMemberRole = async (channelId: string, userId: string, memberId: string, newRole: 'admin' | 'member') => {
    try {
        // Verify user is admin or creator
        const channel = await channelModel.findOne({
            _id: channelId,
            $or: [
                { createdBy: userId },
                { members: { $elemMatch: { userId, role: 'admin' } } }
            ]
        });

        if (!channel) {
            throw new AppError("Only admins can update roles", 403);
        }

        const updatedChannel = await channelModel.findByIdAndUpdate(
            channelId,
            { $set: { 'members.$[elem].role': newRole } },
            {
                new: true,
                arrayFilters: [{ 'elem.userId': memberId }]
            }
        ).populate('members.userId', 'username email avatar status');

        return updatedChannel;
    } catch (error) {
        if (error instanceof AppError) throw error;
        throw new AppError("Error updating member role", 500);
    }
};

/**
 * Search channels
 * @param userId - User ID
 * @param query - Search query
 * @returns Array of matching channels
 */
export const searchChannels = async (userId: string, query: string) => {
    try {
        const channels = await channelModel.find({
            'members.userId': userId,
            $or: [
                { name: { $regex: query, $options: 'i' } },
                { description: { $regex: query, $options: 'i' } }
            ]
        })
            .populate('members.userId', 'username email avatar status')
            .limit(20);

        return channels;
    } catch (error) {
        throw new AppError("Error searching channels", 500);
    }
};
