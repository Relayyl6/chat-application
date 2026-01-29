import { Router } from 'express';
import { authMiddleware } from '../middleware/auth.middleware.ts';
import { createChannel, getChannels, getChannel, renameChannel, removeMember, leaveChannel, addMembers, updateMemberRole, getMembers } from '../controller/channel.controller.ts';

const channelRouter = Router();

channelRouter.use(authMiddleware);

channelRouter.post('/', createChannel);
channelRouter.get('/', getChannels);
channelRouter.get('/:channelId', getChannel);

channelRouter.post('/:channelId/rename', renameChannel)
channelRouter.post('/:channelId/add-members', addMembers)
channelRouter.post('/:channelId/:userId/remove-member', removeMember)
channelRouter.patch('/:channelId/members/role', updateMemberRole);
channelRouter.post('/:channelId/leave', leaveChannel)
channelRouter.get('/:channelId/members', getMembers)


export default channelRouter;