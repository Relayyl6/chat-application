import { Router } from 'express';
import { authMiddleware } from '../middleware/auth.middleware';
import {
    createChannel,
    getChannels,
    getChannel,
    renameChannel,
    removeMember,
    leaveChannel,
    addMembers,
    updateMemberRole,
    getMembers,
    searchChannelsController
} from '../controller/channel.controller';
import {
    validate,
    validateObjectId,
    createChannelSchema,
    sanitizeInputs
} from '../middleware/validation.middleware';

const channelRouter = Router();

// Apply authentication and sanitization middleware
channelRouter.use(authMiddleware);
channelRouter.use(sanitizeInputs);

/**
 * @swagger
 * /api/channels:
 *   post:
 *     summary: Create a new channel
 *     tags: [Channels]
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               type:
 *                 type: string
 *                 enum: [direct, group, channel]
 *               name:
 *                 type: string
 *               userIds:
 *                 type: array
 *                 items:
 *                   type: string
 *     responses:
 *       201:
 *         description: Channel created
 *       400:
 *         description: Validation error
 */
channelRouter.post('/', validate(createChannelSchema), createChannel);

/**
 * @swagger
 * /api/channels:
 *   get:
 *     summary: Get all user channels
 *     tags: [Channels]
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: List of channels
 */
channelRouter.get('/', getChannels);

/**
 * @swagger
 * /api/channels/search:
 *   get:
 *     summary: Search channels
 *     tags: [Channels]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: query
 *         name: q
 *         schema:
 *           type: string
 *         required: true
 *     responses:
 *       200:
 *         description: Search results
 */
channelRouter.get('/search', (req, res, next) => {
    next();
}, searchChannelsController);

/**
 * @swagger
 * /api/channels/{channelId}:
 *   get:
 *     summary: Get channel details
 *     tags: [Channels]
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
 *         description: Channel details
 */
channelRouter.get('/:channelId', validateObjectId('channelId'), getChannel);

/**
 * @swagger
 * /api/channels/{channelId}/rename:
 *   post:
 *     summary: Rename channel
 *     tags: [Channels]
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
 *               name:
 *                 type: string
 *     responses:
 *       200:
 *         description: Channel renamed
 */
channelRouter.post('/:channelId/rename', validateObjectId('channelId'), renameChannel);

/**
 * @swagger
 * /api/channels/{channelId}/add-members:
 *   post:
 *     summary: Add members to channel
 *     tags: [Channels]
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
 *               userIds:
 *                 type: array
 *                 items:
 *                   type: string
 *     responses:
 *       200:
 *         description: Members added
 */
channelRouter.post('/:channelId/add-members', validateObjectId('channelId'), addMembers);

/**
 * @swagger
 * /api/channels/{channelId}/{userId}/remove-member:
 *   post:
 *     summary: Remove member from channel
 *     tags: [Channels]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: channelId
 *         required: true
 *         schema:
 *           type: string
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Member removed
 */
channelRouter.post('/:channelId/:userId/remove-member', validateObjectId('channelId'), validateObjectId('userId'), removeMember);

/**
 * @swagger
 * /api/channels/{channelId}/members/role:
 *   patch:
 *     summary: Update member role
 *     tags: [Channels]
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
 *               memberId:
 *                 type: string
 *               role:
 *                 type: string
 *                 enum: [admin, member]
 *     responses:
 *       200:
 *         description: Role updated
 */
channelRouter.patch('/:channelId/members/role', validateObjectId('channelId'), updateMemberRole);

/**
 * @swagger
 * /api/channels/{channelId}/leave:
 *   post:
 *     summary: Leave channel
 *     tags: [Channels]
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
 *         description: Left channel
 */
channelRouter.post('/:channelId/leave', validateObjectId('channelId'), leaveChannel);

/**
 * @swagger
 * /api/channels/{channelId}/members:
 *   get:
 *     summary: Get channel members
 *     tags: [Channels]
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
 *         description: List of members
 */
channelRouter.get('/:channelId/members', validateObjectId('channelId'), getMembers);

export default channelRouter;