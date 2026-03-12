import { Server } from 'socket.io';
import channelModel from '../../models/Channel';
import messageModel from '../../models/Message';
import { AuthSocket } from '../socket.manager';

export const handleMessage = async (io: Server, socket: AuthSocket, data: any) => {
  try {
    const { channelId, content, type = 'text', replyTo, tempId } = data;

    const channel = await channelModel.findByIdAndUpdate(
      channelId,
      { $inc: { messageAutoId: 1 } },
      { new: true }
    );

    if (!channel) {
      socket.emit('error', { message: 'Channel not found' });
      return null;
    }

    const message = await messageModel.create({
      channelId,
      senderId: socket.userId,
      content,
      type,
      autoId: channel.messageAutoId,
      replyTo,
      deliveredTo: [socket.userId],
    });

    await message.populate('senderId', 'username avatar');
    if (replyTo) await message.populate('replyTo');

    await channelModel.updateOne(
      { _id: channelId },
      {
        $set: {
          lastMessageAt: {
            content: message.content,
            senderId: socket.userId,
            sentAt: message.createdAt,
            autoId: message.autoId,
          },
        },
      }
    );

    await channelModel.updateMany(
      { _id: channelId, 'members.userId': { $ne: socket.userId } },
      { $inc: { 'members.$.unreadCount': 1 } }
    );

    // Broadcast the full message object to everyone in the room (including sender).
    // Client listens for 'message:sent' and checks message.channelId to filter.
    io.to(`channel:${channelId}`).emit('message:sent', {
      ...message.toObject(),
      tempId, // so sender can replace their optimistic bubble
    });

    return message;
  } catch (error) {
    console.error('Error sending message:', error);
    socket.emit('error', { message: 'Failed to send message' });
    return null;
  }
};