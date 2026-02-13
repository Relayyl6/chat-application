import { AuthRequest } from "../middleware/auth.middleware.ts";
import { Response, NextFunction } from "express";
import { AppError } from "../utils/AppError.ts";
import messageModel from "../models/Message.ts";
import channelModel from "../models/Channel.ts";

export const getMessages = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
        const { channelId } = req.params;
        const { before, limit = 50 } = req.query;

        const query: any = { channelId };
        if (before) {
            query.autoId = { $lt: parseInt(before as string, 10) };
        }

        const messages = await messageModel.find(query)
            .sort({ autoId: -1 })
            .limit(parseInt(limit as string))
            .populate('senderId', 'username avatar status')
            .populate('replyTo')

        res.status(200).json({
            status: "success",
            data: messages.reverse()
        });

    } catch (error) {
        return next(new AppError("server Errror while fetching messages", 500));
    }
}

export const markAsRead = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
        const { channelId } = req.params;
        const { messageAutoId } = req.body;
        const userId = req.user._id;

        await channelModel.updateOne(
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
        )

        await messageModel.updateMany(
            {
                channelId,
                autoId: { $lte: messageAutoId },
                readBy: { $ne: userId }
            },
            {
                $addToSet: { readBy: userId }
            }
        )

        res.status(200).json({
            success: true
        })
    } catch (error) {
        return next(new AppError("server Errror while arking message as read", 500));
    }
}

export const sendMessage = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { channelId } = req.params;
    const { content, replyTo } = req.body;
    const senderId = req.user._id;

    // 1️⃣ Verify user is in channel
    const channel = await channelModel.findOne({
      _id: channelId,
      'members.userId': senderId
    });

    if (!channel) {
      return next(new AppError("Channel not found or access denied", 404));
    }

    // 2️⃣ Generate autoId (increment per channel)
    const lastMessage = await messageModel
      .findOne({ channelId })
      .sort({ autoId: -1 })
      .select('autoId');

    const nextAutoId = lastMessage ? lastMessage.autoId + 1 : 1;

    // 3️⃣ Create message
    const message = await messageModel.create({
      channelId,
      senderId,
      content,
      autoId: nextAutoId,
      replyTo: replyTo || null,
      readBy: [senderId] // sender has read their own message
    });

    // 4️⃣ Update channel last message preview
    await channelModel.updateOne(
      { _id: channelId },
      {
        $set: {
          lastMessageAt: {
            content,
            senderId,
            sentAt: Date.now(),
            autoId: nextAutoId 
          }
        }
      }
    );

    // 5️⃣ Increment unread count for OTHER members
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

    const populatedMessage = await message.populate('senderId', 'username avatar');

    res.status(201).json({
      success: true,
      message: populatedMessage
    });

  } catch (error) {
    return next(new AppError("Server error while sending message", 500));
  }
};

export const deleteMessage = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { messageId } = req.params;
    const userId = req.user._id;

    const message = await messageModel.findOneAndUpdate(
      { _id: messageId, senderId: userId },
      { isDeleted: true, deletedAt: Date.now(), content: "" },
      { new: true }
    );

    if (!message) {
      return next(new AppError("Message not found or not yours", 404));
    }

    res.status(200).json({ success: true });

  } catch (error) {
    return next(new AppError("Server error while deleting message", 500));
  }
};