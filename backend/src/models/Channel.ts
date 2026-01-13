import { model, Schema, Types } from "mongoose";

const channelSchema = new Schema({
    name: {
        type: String,
        required: function() {
            return this.type === 'group' || this.type === 'channel';
        },
        trim: true,
        maxLength: 100
    },
    type: {
        type: String,
        enum: ['group', 'channel', 'direct'],
        required: true
    },
    avatar: {
        type: String,
        default: null
    },
    description: {
        type: String,
        maxLength: 100
    },
    members: [{
        userId: {
            type: Types.ObjectId,
            ref: 'User',
            required: true
        },
        role: {
            type: String,
            enum: ['admin', 'user'],
            default: 'user'
        },
        joinedAt: {
            type: Date,
            default: Date.now
        },
        lastRead: {
            type: Number,
            default: 0
        },
        unreadCount: {
            type: Number,
            default: 0
        }
    }],
    lastMessageAt: {
        content: String,
        senderId: {
            type: Types.ObjectId,
            ref: 'User'
        },
        sendAt: Date,
        autoId: Number
    },
    messageAutoId: {
        type: Number,
        default: 0
    },
    createdBy: {
        type: Types.ObjectId,
        ref: 'User',
        required: true
    }
}, {
    timestamps: true
})

channelSchema.index({ 'members.userId': 1 });
channelSchema.index({ type: 1, 'members.userId': 1 });

const channelModel = model('Channel', channelSchema);

export default channelModel;