import mongoose from 'mongoose'

const ConversationSchema = new mongoose.Schema({
  participants: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  lastMessage: { type: mongoose.Schema.Types.ObjectId, ref: 'Message' },
  updatedAt: { type: Date, default: Date.now }
}, { timestamps: true })

export const Conversation = mongoose.models.Conversation || mongoose.model('Conversation', ConversationSchema)