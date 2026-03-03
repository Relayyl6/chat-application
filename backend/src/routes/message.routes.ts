import { Router } from 'express';
import { authMiddleware } from '../middleware/auth.middleware';
import {
    deleteMessage,
    getChannelMessages,
    markAsRead,
    sendMessage,
    editMessage,
    reactToMessage,
    searchChannelMessages
} from '../controller/message.controller';
import {
    validate,
    validateObjectId,
    sendMessageSchema,
    sanitizeInputs
} from '../middleware/validation.middleware';

const messageRouter = Router();

// Apply authentication and sanitization middleware
messageRouter.use(authMiddleware);
messageRouter.use(sanitizeInputs);

/**
 * @swagger
 * /api/messages/{channelId}:
 *   get:
 *     summary: Get channel messages
 *     tags: [Messages]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: channelId
 *         required: true
 *         schema:
 *           type: string
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: List of messages
 */
messageRouter.get('/:channelId', validateObjectId('channelId'), getChannelMessages);

/**
 * @swagger
 * /api/messages/{channelId}/send:
 *   post:
 *     summary: Send message
 *     tags: [Messages]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: channelId
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               content:
 *                 type: string
 *               attachments:
 *                 type: array
 *               replyTo:
 *                 type: string
 *     responses:
 *       201:
 *         description: Message sent
 */
messageRouter.post('/:channelId/send', validateObjectId('channelId'), validate(sendMessageSchema), sendMessage);

/**
 * @swagger
 * /api/messages/{channelId}/read:
 *   post:
 *     summary: Mark messages as read
 *     tags: [Messages]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: channelId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Messages marked as read
 */
messageRouter.post('/:channelId/read', validateObjectId('channelId'), markAsRead);

/**
 * @swagger
 * /api/messages/{channelId}/{messageId}/delete:
 *   delete:
 *     summary: Delete message
 *     tags: [Messages]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: channelId
 *         required: true
 *         schema:
 *           type: string
 *       - in: path
 *         name: messageId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Message deleted
 */
messageRouter.delete('/:channelId/:messageId/delete', validateObjectId('channelId'), validateObjectId('messageId'), deleteMessage);

/**
 * @swagger
 * /api/messages/{channelId}/{messageId}/edit:
 *   put:
 *     summary: Edit message
 *     tags: [Messages]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: channelId
 *         required: true
 *         schema:
 *           type: string
 *       - in: path
 *         name: messageId
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               content:
 *                 type: string
 *     responses:
 *       200:
 *         description: Message edited
 */
messageRouter.put('/:channelId/:messageId/edit', validateObjectId('channelId'), validateObjectId('messageId'), validate(sendMessageSchema), editMessage);

/**
 * @swagger
 * /api/messages/{channelId}/{messageId}/react:
 *   post:
 *     summary: React to message
 *     tags: [Messages]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: channelId
 *         required: true
 *         schema:
 *           type: string
 *       - in: path
 *         name: messageId
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               emoji:
 *                 type: string
 *     responses:
 *       200:
 *         description: Reaction added
 */
messageRouter.post('/:channelId/:messageId/react', validateObjectId('channelId'), validateObjectId('messageId'), reactToMessage);

/**
 * @swagger
 * /api/messages/{channelId}/search:
 *   get:
 *     summary: Search messages
 *     tags: [Messages]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: channelId
 *         required: true
 *         schema:
 *           type: string
 *       - in: query
 *         name: q
 *         required: true
 *         schema:
 *           type: string
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Search results
 */
messageRouter.get('/:channelId/search', validateObjectId('channelId'), searchChannelMessages);

export default messageRouter;