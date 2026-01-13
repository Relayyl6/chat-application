import { model, Schema } from "mongoose";

const messageSchema = new Schema({
  channelId: {
    type: Schema.Types.ObjectId,
    ref: 'Channel',
    required: true,
    index: true
  },
  senderId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  content: {
    type: String,
    required: true,
    maxlength: 10000
  },
  type: {
    type: String,
    enum: ['text', 'image', 'file', 'system'],
    default: 'text'
  },
  autoId: {
    type: Number,
    required: true
  },
  readBy: [{
    type: Schema.Types.ObjectId,
    ref: 'User'
  }],
  deliveredTo: [{
    type: Schema.Types.ObjectId,
    ref: 'User'
  }],
  replyTo: {
    type: Schema.Types.ObjectId,
    ref: 'Message'
  },
  attachments: [{
    url: String,
    type: String,
    name: String,
    size: Number
  }]
}, {
  timestamps: true
});

// Compound index for efficient message queries
messageSchema.index({ channelId: 1, autoId: -1 });
messageSchema.index({ channelId: 1, createdAt: -1 });

const messageModel = model('Message', messageSchema);

export default messageModel;