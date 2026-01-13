import { Document, Types } from "mongoose";

export interface IUser extends Document {
    _id: Types.ObjectId,
    username: string,
    email: string,
    password: string,
    avatar?: string,
    status: 'online' | 'offline' | 'away',
    lastSeen: Date,
    createdAt: Date,
    comparePassword(candidatePassword: string): Promise<boolean>;
}

export interface IChannelUser {
    userId: Types.ObjectId,
    role: 'admin' | 'user',
    joinedAt: Date,
    lastRead: number,
    unReadCount: number
}

export interface IChannel extends Document {
    _id: Types.ObjectId,
    name: string,
    type: 'direct' | 'group' | 'channel',
    avatar: string,
    description: string,
    members: IChannelUser[],
    lastMessageAt?: {
        content: string,
        senderId: Types.ObjectId,
        sendAt: Date,
        autoId: number
    },
    messageAutoId: number,
    createdBy: Types.ObjectId,
    isPrivate: boolean,
    createdAt: Date,
    updatedAt: Date
}

export interface IMessage extends Document {
  _id: Types.ObjectId;
  channelId: Types.ObjectId;
  senderId: Types.ObjectId;
  content: string;
  type: 'text' | 'image' | 'file' | 'system';
  autoId: number;
  readBy: Types.ObjectId[];
  deliveredTo: Types.ObjectId[];
  replyTo?: Types.ObjectId;
  attachments?: {
    url: string;
    type: string;
    name: string;
    size: number;
  }[];
  createdAt: Date;
  updatedAt: Date;
}