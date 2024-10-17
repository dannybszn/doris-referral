import type { NextApiRequest, NextApiResponse } from 'next'
import { connectToDatabase } from '@/lib/db'
import { Conversation } from '@/models/Conversation'
import { Message } from '@/models/Message'
import jwt from 'jsonwebtoken'

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const { conversationId } = req.query

  if (req.method === 'GET') {
    try {
      const token = req.headers.authorization?.split(' ')[1]
      if (!token) {
        return res.status(401).json({ message: 'Unauthorized' })
      }

      const decoded = jwt.verify(token, process.env.JWT_SECRET!) as { userId: string }
      await connectToDatabase()

      const conversation = await Conversation.findOne({
        _id: conversationId,
        participants: decoded.userId
      }).populate('participants', '_id firstName lastName companyName avatar role')
        .populate('lastMessage')

      if (!conversation) {
        return res.status(404).json({ message: 'Conversation not found' })
      }

      res.status(200).json(conversation)
    } catch (error) {
      console.error('Error fetching conversation:', error)
      res.status(500).json({ message: 'Server error' })
    }
  } else if (req.method === 'DELETE') {
    try {
      const token = req.headers.authorization?.split(' ')[1]
      if (!token) {
        return res.status(401).json({ message: 'Unauthorized' })
      }

      const decoded = jwt.verify(token, process.env.JWT_SECRET!) as { userId: string, role: string }
      await connectToDatabase()

      console.log('User role:', decoded.role); // Add this line for debugging

      // Check if the user has the required role
      if (decoded.role !== 'agency' && decoded.role !== 'admin') {
        console.log('Insufficient permissions. User role:', decoded.role); // Add this line for debugging
        return res.status(403).json({ message: 'Forbidden: Insufficient permissions' })
      }

      // Delete the conversation
      const deletedConversation = await Conversation.findByIdAndDelete(conversationId)

      if (!deletedConversation) {
        return res.status(404).json({ message: 'Conversation not found' })
      }

      // Delete all messages associated with the conversation
      await Message.deleteMany({ conversation: conversationId })

      console.log('Conversation deleted successfully'); // Add this line for debugging
      res.status(200).json({ message: 'Conversation and associated messages deleted successfully' })
    } catch (error) {
      console.error('Error deleting conversation:', error)
      res.status(500).json({ message: 'Server error' })
    }
  } else {
    res.setHeader('Allow', ['GET', 'DELETE'])
    res.status(405).end(`Method ${req.method} Not Allowed`)
  }
}