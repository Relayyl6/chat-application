import { Router } from 'express';
// import { getMessages, markAsRead } from '../controllers/messageController.ts';
import { authMiddleware } from '../middleware/auth.middleware.ts';
import { deleteMessage, getMessages, markAsRead, sendMessage } from '../controller/message.controller.ts';

const messageRouter = Router();

messageRouter.use(authMiddleware);

messageRouter.get('/:channelId', getMessages);
messageRouter.post('/:channelId/read', markAsRead);
messageRouter.post('/:channelId/send', sendMessage);
messageRouter.delete('/:channelId/delete', deleteMessage);

export default messageRouter;