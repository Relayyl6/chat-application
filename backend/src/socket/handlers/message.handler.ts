import { Server } from 'socket.io';
import channelModel from '../../models/Channel.ts';
import messageModel from '../../models/Message.ts';
import { AuthSocket } from '../socket.manager.ts';

export const handleMessage = async (io: Server, socket: AuthSocket, data: any) => {
  try {
    const { channelId, content, type = 'text', replyTo } = data;

    // Get channel and increment autoId
    const channel = await channelModel.findByIdAndUpdate(
      channelId,
      { $inc: { messageAutoId: 1 } },
      { new: true }
    );

    if (!channel) {
      return socket.emit('error', { message: 'Channel not found' });
    }

    // Create message
    const message = await messageModel.create({
      channelId,
      senderId: socket.userId,
      content,
      type,
      autoId: channel.messageAutoId,
      replyTo,
      deliveredTo: [socket.userId]
    });

    // Populate sender info
    await message.populate('senderId', 'username avatar');
    if (replyTo) {
      await message.populate('replyTo');
    }

    // Update channel's last message
    await channelModel.updateOne(
      { _id: channelId },
      {
        $set: {
          lastMessage: {
            content: message.content,
            senderId: socket.userId,
            sentAt: message.createdAt,
            autoId: message.autoId
          }
        }
      }
    );

    // Increment unread count for other users
    await channelModel.updateMany(
      {
        _id: channelId,
        'users.userId': { $ne: socket.userId }
      },
      {
        $inc: { 'users.$.unreadCount': 1 }
      }
    );

    // Emit to channel
    io.to(`channel:${channelId}`).emit('message:new', message);

    // Send delivery confirmation
    socket.emit('message:sent', { tempId: data.tempId, message });

    io.to(`channel:${channelId}`).emit("message:delivered", {
      messageId: message._id,
      userId: socket.userId
    });

    socket.on("message:read", async ({ messageId, channelId }) => {
      socket.to(`channel:${channelId}`).emit("message:read", {
        messageId,
        userId: socket.userId
      });
    });
  } catch (error) {
    console.error('Error sending message:', error);
    socket.emit('error', { message: 'Failed to send message' });
  }
};