import { Server } from 'socket.io';
import { AuthSocket } from '../socket.manager.ts';

export const handleTyping = async (io: Server, socket: AuthSocket, data: any) => {
  const { channelId, isTyping } = data;

  socket.to(`channel:${channelId}`).emit('user:typing', {
    channelId,
    userId: socket.userId,
    isTyping
  });
};