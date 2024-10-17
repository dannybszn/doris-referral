import mongoose from 'mongoose'

const ConversationSchema = new mongoose.Schema({
  participants: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  lastMessage: { type: mongoose.Schema.Types.ObjectId, ref: 'Message' },
  updatedAt: { type: Date, default: Date.now }
}, { timestamps: true })

// Add a method to remove a participant
ConversationSchema.methods.removeParticipant = function(userId: string) {
  this.participants = this.participants.filter(
    (participantId: mongoose.Types.ObjectId) => participantId.toString() !== userId
  );
  return this.save();
};

export const Conversation = mongoose.models.Conversation || mongoose.model('Conversation', ConversationSchema)