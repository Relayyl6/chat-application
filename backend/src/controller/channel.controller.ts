import { AuthRequest } from '../middleware/auth.middleware';
import { Response, NextFunction } from 'express';
import { AppError } from '../utils/AppError';
import {
    createChannel as createChannelService,
    getUserChannels,
    getChannelById as getChannelByIdService,
    renameChannel as renameChannelService,
    addMembersToChannel,
    removeMemberFromChannel,
    leaveChannel as leaveChannelService,
    getChannelMembers,
    updateMemberRole as updateMemberRoleService,
    searchChannels
} from '../services/channel.service';

/**
 * Create new channel
 */
export const createChannel = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
        const { name, type, avatar, userIds, description } = req.body;

        if (!req.user?._id) return next(new AppError('Not authenticated', 401));

        // ✅ For DMs, don't generate an avatar from name (name is null)
        let finalAvatar = avatar?.trim() || null;
        if (type !== 'direct' && !finalAvatar) {
            const displayName = name || 'Channel';
            finalAvatar = `https://ui-avatars.com/api/?name=${encodeURIComponent(displayName)}&background=random&size=128`;
        }

        const channel = await createChannelService(req.user._id, {
            name,
            type,
            avatar: finalAvatar,
            userIds,
            description
        });

        // ✅ Broadcast to ALL members, not just creator
        const io = req.app.get('io');
        if (io && channel) {
            const allMemberIds = [
                req.user._id.toString(),
                ...userIds
            ];
            allMemberIds.forEach(memberId => {
                io.to(`user:${memberId}`).emit('channel:created', { channel });
            });
        }

        res.status(201).json({
            success: true,
            data: { channel },
            message: type === 'direct' ? 'Direct message created successfully' : 'Channel created successfully'
        });
    } catch (error) {
        next(error);
    }
};

/**
 * Get all user's channels
 */
export const getChannels = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
        const channels = await getUserChannels(req.user._id);

        res.status(200).json({
            success: true,
            data: { channels, count: channels.length },
            message: 'Channels retrieved successfully'
        });
    } catch (error) {
        next(error);
    }
};

/**
 * Get single channel
 */
export const getChannel = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
        const { channelId } = req.params;
        const channel = await getChannelByIdService(channelId, req.user._id);

        res.status(200).json({
            success: true,
            data: { channel },
            message: 'Channel retrieved successfully'
        });
    } catch (error) {
        next(error);
    }
};

/**
 * Rename channel (admin only)
 */
export const renameChannel = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
        const { channelId } = req.params;
        const { name } = req.body;

        const updatedChannel = await renameChannelService(channelId, req.user._id, name);

        // Broadcast via Socket.IO
        const io = req.app.get('io');
        if (io) {
            io.to(`channel:${channelId}`).emit('channel:renamed', {
                channelId,
                name,
                renamedBy: req.user._id
            });
        }

        res.status(200).json({
            success: true,
            data: { channel: updatedChannel },
            message: 'Channel renamed successfully'
        });
    } catch (error) {
        next(error);
    }
};

/**
 * Add members to channel
 */
export const addMembers = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
        const { channelId } = req.params;
        const { userIds } = req.body;

        const updatedChannel = await addMembersToChannel(channelId, req.user._id, userIds);

        if (!updatedChannel) {
            return next(new AppError('Channel not found', 404));
        }

        // Broadcast via Socket.IO
        const io = req.app.get('io');
        if (io) {
            io.to(`channel:${channelId}`).emit('channel:members-added', {
                channelId,
                members: updatedChannel.members
            });
        }

        res.status(200).json({
            success: true,
            data: { channel: updatedChannel },
            message: 'Members added successfully'
        });
    } catch (error) {
        next(error);
    }
};

/**
 * Remove member from channel
 */
export const removeMember = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
        const { channelId, userId } = req.params;

        const updatedChannel = await removeMemberFromChannel(channelId, req.user._id, userId);

        if (!updatedChannel) {
            return next(new AppError('Channel not found', 404));
        }

        // Broadcast via Socket.IO
        const io = req.app.get('io');
        if (io) {
            io.to(`channel:${channelId}`).emit('channel:member-removed', {
                channelId,
                removedUserId: userId,
                members: updatedChannel.members
            });
        }

        res.status(200).json({
            success: true,
            data: { channel: updatedChannel },
            message: 'Member removed successfully'
        });
    } catch (error) {
        next(error);
    }
};

/**
 * Leave channel
 */
export const leaveChannel = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
        const { channelId } = req.params;

        const result = await leaveChannelService(channelId, req.user._id);

        // Broadcast via Socket.IO
        const io = req.app.get('io');
        if (io) {
            io.to(`channel:${channelId}`).emit('channel:member-left', {
                channelId,
                userId: req.user._id
            });
        }

        res.status(200).json({
            success: true,
            data: result,
            message: 'Left channel successfully'
        });
    } catch (error) {
        next(error);
    }
};

/**
 * Get channel members
 */
export const getMembers = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
        const { channelId } = req.params;

        const members = await getChannelMembers(channelId, req.user._id);

        res.status(200).json({
            success: true,
            data: { members, count: members.length },
            message: 'Members retrieved successfully'
        });
    } catch (error) {
        next(error);
    }
};

/**
 * Update member role
 */
export const updateMemberRole = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
        const { channelId } = req.params;
        const { memberId, role } = req.body;

        const updatedChannel = await updateMemberRoleService(channelId, req.user._id, memberId, role);

        // Broadcast via Socket.IO
        const io = req.app.get('io');
        if (io) {
            io.to(`channel:${channelId}`).emit('channel:member-role-updated', {
                channelId,
                memberId,
                role
            });
        }

        res.status(200).json({
            success: true,
            data: { channel: updatedChannel },
            message: 'Member role updated successfully'
        });
    } catch (error) {
        next(error);
    }
};

/**
 * Search channels
 */
export const searchChannelsController = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
        const { q } = req.query;

        if (!q) {
            return next(new AppError('Search query is required', 400));
        }

        const channels = await searchChannels(req.user._id, String(q));

        res.status(200).json({
            success: true,
            data: { channels, count: channels.length },
            message: 'Search completed successfully'
        });
    } catch (error) {
        next(error);
    }
};
