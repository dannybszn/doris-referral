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

      const decoded = jwt.verify(token, process.env.JWT_SECRET!) as { userId: string }
      await connectToDatabase()

      const conversation = await Conversation.findOne({
        _id: conversationId,
        participants: decoded.userId
      })

      if (!conversation) {
        return res.status(404).json({ message: 'Conversation not found' })
      }

      // Remove the user from the participants array
      conversation.participants = conversation.participants.filter(
        (participantId) => participantId.toString() !== decoded.userId
      )

      if (conversation.participants.length === 0) {
        // If no participants left, delete the conversation and its messages
        await Message.deleteMany({ conversation: conversationId })
        await Conversation.findByIdAndDelete(conversationId)
      } else {
        // Otherwise, just save the updated conversation
        await conversation.save()
      }

      res.status(200).json({ message: 'Conversation removed successfully' })
    } catch (error) {
      console.error('Error removing conversation:', error)
      res.status(500).json({ message: 'Server error' })
    }
  } else {
    res.setHeader('Allow', ['GET', 'DELETE'])
    res.status(405).end(`Method ${req.method} Not Allowed`)
  }
}