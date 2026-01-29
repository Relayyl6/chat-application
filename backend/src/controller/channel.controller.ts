import { z } from 'zod';
import { AuthRequest } from '../middleware/auth.middleware.ts';
import { Response, NextFunction } from 'express';
import { AppError } from '../utils/AppError.ts';
import channelModel from '../models/Channel.ts';
import messageModel from '../models/Message.ts';
import userModel from '../models/User.ts';

const createChannelSchema = z.object({
    name: z.string().min(3).max(50).optional(),
    type: z.enum(['direct', 'group', 'channel']),
    avatar: z.string().url().optional(),
    userIds: z.array(z.string()).min(1),
    description: z.string().max(500).optional()
})

export const createChannel = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
        const { name, type, avatar, userIds, description } = createChannelSchema.parse(req.body);
        const currentUserId = req.user._id;

        // for direct message, check if channel already exists
        if (type === 'direct') {
            if (userIds.length !== 1) {
                return next(new AppError("Direct channels must have exactly one other user", 400));
            }

            const existingChannel = await channelModel.findOne({
                type: 'direct',
                'members.userId': { $all: [currentUserId, userIds[0]], $size: 2 }
            }).populate('members.userId', 'username email avatar status');

            if (existingChannel) {
                return res.status(200).json({ channel: existingChannel });
            }
        }

        const channel = await channelModel.create({
            name : type === 'direct' ? null : name,
            type,
            avatar,
            description,
            createdBy: currentUserId,
            members: [
                {
                    userId: currentUserId,
                    role: 'admin'
                },
                ...userIds.map((id: any) => ({userId: id, role: "member"}))
            ]
        })

        const populatedChannel = await channelModel.findById(channel._id).populate('members.userId', 'username email avatar status')

        res.status(200).json({
            success: true,
            channel: populatedChannel
        })
    } catch (error: any) {
        if (error instanceof z.ZodError) {
            return res.status(400).json({ errors: error.errors });
        }
        next(new AppError("Server error while loggin in", 500));
    }
}

export const renameChannel = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { channelId } = req.params;
    const { name } = req.body;
    const userId = req.user._id;

    const channel = await channelModel.findOne({
      _id: channelId,
      members: { $elemMatch: { userId, role: 'admin' } }
    });

    if (!channel) {
      return next(new AppError("Only admins can rename channel", 403));
    }

    await channelModel.updateOne(
      { _id: channelId },
      { $set: { name } }
    );

    res.status(200).json({ success: true });

  } catch (error) {
    return next(new AppError("Server error while renaming channel", 500));
  }
};

export const getChannel = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
        const { channelId } = req.params;
        const currentUserId = req.user._id;

        const channel = await channelModel.findOne({
            _id: channelId,
            'members.userId': currentUserId
        }).populate('members.userId', 'username email avatar status');

        if (!channel) {
            return next(new AppError("Channel not found or access denied", 404));
        }

        res.status(200).json({
            success: true,
            channel: channel
        });
    } catch (error) {
        return next(new AppError("Server Error", 500))
    }
}

export const getChannels = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
        const userId = req.user._id;

        const channels = await channelModel.find({
            'members.userId': userId
        })
        .populate('members.userId', 'username email avatar status')
        .populate('lastMessageAt.senderId', 'username')
        .sort({ 'lastMessageAt.sendAt': -1 });

        res.status(200).json({
            success: true,
            channels: channels
        });
    } catch (error) {
        return next(new AppError("Server Error", 500))
    }
}

// ===== ADD MEMBERS TO CHANNEL =====

const addMembersSchema = z.object({
  userIds: z.array(z.string()).min(1).max(10) // Add up to 10 users at once
});

export const addMembers = async (req: AuthRequest, res: Response) => {
  try {
    const { channelId } = req.params;
    const { userIds } = addMembersSchema.parse(req.body);
    const currentUserId = req.user._id;

    // 1. Find the channel and verify user is admin or creator
    const channel = await channelModel.findById(channelId);

    if (!channel) {
      return res.status(404).json({ error: 'Channel not found' });
    }

    // Only allow adding members to group chats
    if (channel.type !== 'group') {
      return res.status(400).json({ 
        error: 'Cannot add members to direct messages' 
      });
    }

    // Check if current user is admin or creator
    const currentUserInChannel = channel.members.find(
      u => u.userId.toString() === currentUserId.toString()
    );

    if (!currentUserInChannel) {
      return res.status(403).json({ error: 'You are not a member of this channel' });
    }

    if (currentUserInChannel.role !== 'admin' && 
        channel.createdBy.toString() !== currentUserId.toString()) {
      return res.status(403).json({ 
        error: 'Only admins can add members' 
      });
    }

    // 2. Check which users are already in the channel
    const existingUserIds = channel.members.map((u: any) => u.userId.toString());
    const newUserIds = userIds.filter(id => !existingUserIds.includes(id));

    if (newUserIds.length === 0) {
      return res.status(400).json({ 
        error: 'All users are already members of this channel' 
      });
    }

    // 3. Verify all new users exist in database
    const validUsers = await userModel.find({ _id: { $in: newUserIds } });

    if (validUsers.length !== newUserIds.length) {
      return res.status(400).json({ error: 'Some users do not exist' });
    }

    // 4. Add new members to channel
    const newMembers = newUserIds.map(userId => ({
      userId,
      role: 'member' as const,
      joinedAt: new Date(),
      lastRead: channel.messageAutoId, // Mark all previous messages as read
      unreadCount: 0
    }));

    channel.members.push(...newMembers);
    await channel.save();

    // 5. Create system message about new members
    const addedUsernames = validUsers.map(u => u.username).join(', ');
    const systemMessage = await messageModel.create({
      channelId: channel._id,
      senderId: currentUserId,
      content: `${req.user.username} added ${addedUsernames} to the group`,
      type: 'system',
      autoId: ++channel.messageAutoId
    });

    await channel.save(); // Save updated messageAutoId

    // Populate the system message
    await systemMessage.populate('senderId', 'username avatar');

    // 6. Emit socket events
    const io = req.app.get('io'); // You'll need to set this in app.ts
    
    // Notify all existing members about new members
    io.to(`channel:${channelId}`).emit('channel:members:added', {
      channelId,
      newMembers: validUsers.map((u: any) => ({
        _id: u._id,
        username: u.username,
        email: u.email,
        avatar: u.avatar,
        status: u.status
      })),
      addedBy: {
        _id: currentUserId,
        username: req.user.username
      },
      message: systemMessage
    });

    // Notify new members that they were added
    newUserIds.forEach(userId => {
      io.to(`user:${userId}`).emit('channel:added', {
        channel: channel.toObject()
      });
    });

    // 7. Return updated channel
    const updatedChannel = await channelModel.findById(channelId)
      .populate('members.userId', 'username email avatar status');

    res.json({
      channel: updatedChannel,
      systemMessage
    });

  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: error.errors });
    }
    console.error('Error adding members:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

const removeMemberSchema = z.object({
  userId: z.string()
});

export const removeMember = async (req: AuthRequest, res: Response) => {
  try {
    const { channelId } = req.params;
    const { userId } = removeMemberSchema.parse(req.body);
    const currentUserId = req.user._id;

    // 1. Find the channel
    const channel = await channelModel.findById(channelId);

    if (!channel) {
      return res.status(404).json({ error: 'Channel not found' });
    }

    if (channel.type !== 'group') {
      return res.status(400).json({ 
        error: 'Cannot remove members from direct messages' 
      });
    }

    // 2. Check permissions
    const currentUserInChannel = channel.members.find(
      (u: any) => u.userId.toString() === currentUserId.toString()
    );

    if (!currentUserInChannel) {
      return res.status(403).json({ error: 'You are not a member of this channel' });
    }

    const userToRemove = channel.members.find(
      (u: any) => u.userId.toString() === userId
    );

    if (!userToRemove) {
      return res.status(404).json({ error: 'User is not a member of this channel' });
    }

    // Only admins can remove others, or users can remove themselves
    const isAdmin = currentUserInChannel.role === 'admin' || 
                   channel.createdBy.toString() === currentUserId.toString();
    const isSelf = userId === currentUserId.toString();

    if (!isAdmin && !isSelf) {
      return res.status(403).json({ 
        error: 'Only admins can remove other members' 
      });
    }

    // Can't remove the creator
    if (channel.createdBy.toString() === userId && !isSelf) {
      return res.status(403).json({ 
        error: 'Cannot remove the channel creator' 
      });
    }

    // 3. Remove the user
    channel.members = channel.members.filter(
      (u: any) => u.userId.toString() !== userId
    );
    await channel.save();

    // 4. Create system message
    const removedUser = await userModel.findById(userId);
    
    const systemMessage = await messageModel.create({
      channelId: channel._id,
      senderId: currentUserId,
      content: isSelf 
        ? `${req.user.username} left the group`
        : `${req.user.username} removed ${removedUser?.username} from the group`,
      type: 'system',
      autoId: ++channel.messageAutoId
    });

    await channel.save();
    await systemMessage.populate('senderId', 'username avatar');

    // 5. Emit socket events
    const io = req.app.get('io');
    
    // Notify remaining members
    io.to(`channel:${channelId}`).emit('channel:member:removed', {
      channelId,
      userId,
      removedBy: currentUserId,
      message: systemMessage
    });

    // Notify the removed user
    io.to(`user:${userId}`).emit('channel:removed', {
      channelId
    });

    res.json({
      success: true,
      systemMessage
    });

  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: error.errors });
    }
    console.error('Error removing member:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

const updateRoleSchema = z.object({
  userId: z.string(),
  role: z.enum(['admin', 'member'])
});

export const updateMemberRole = async (req: AuthRequest, res: Response) => {
  try {
    const { channelId } = req.params;
    const { userId, role } = updateRoleSchema.parse(req.body);
    const currentUserId = req.user._id;

    const channel = await channelModel.findById(channelId);

    if (!channel) {
      return res.status(404).json({ error: 'Channel not found' });
    }

    // Only channel creator can change roles
    if (channel.createdBy.toString() !== currentUserId.toString()) {
      return res.status(403).json({ 
        error: 'Only the channel creator can change member roles' 
      });
    }

    // Find the user in channel
    const userIndex = channel.members.findIndex(
      u => u.userId.toString() === userId
    );

    if (userIndex === -1) {
      return res.status(404).json({ error: 'User is not a member of this channel' });
    }

    // Update role
    channel.members[userIndex].role = role;
    await channel.save();

    // Create system message
    const targetUser = await userModel.findById(userId);
    
    const systemMessage = await messageModel.create({
      channelId: channel._id,
      senderId: currentUserId,
      content: `${req.user.username} made ${targetUser?.username} ${role === 'admin' ? 'an admin' : 'a member'}`,
      type: 'system',
      autoId: ++channel.messageAutoId
    });

    await channel.save();
    await systemMessage.populate('senderId', 'username avatar');

    // Emit socket event
    const io = req.app.get('io');
    io.to(`channel:${channelId}`).emit('channel:member:role-updated', {
      channelId,
      userId,
      role,
      message: systemMessage
    });

    res.json({
      success: true,
      systemMessage
    });

  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: error.errors });
    }
    console.error('Error updating role:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

export const getMembers = async (req: AuthRequest, res: Response) => {
  try {
    const { channelId } = req.params;
    const currentUserId = req.user._id;

    const channel = await channelModel.findById(channelId)
      .populate('users.userId', 'username email avatar status lastSeen');

    if (!channel) {
      return res.status(404).json({ error: 'Channel not found' });
    }

    // Check if user is a member
    const isMember = channel.members.some(
      (u: any) => u.userId._id.toString() === currentUserId.toString()
    );

    if (!isMember) {
      return res.status(403).json({ error: 'You are not a member of this channel' });
    }

    res.json({
      members: channel.members
    });

  } catch (error) {
    console.error('Error getting members:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

export const leaveChannel = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { channelId } = req.params;
    const userId = req.user._id;

    await channelModel.updateOne(
      { _id: channelId },
      { $pull: { members: { userId } } }
    );

    res.status(200).json({ success: true });

  } catch (error) {
    return next(new AppError("Server error while leaving channel", 500));
  }
};