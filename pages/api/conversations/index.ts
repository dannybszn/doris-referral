import type { NextApiRequest, NextApiResponse } from 'next'
import { connectToDatabase } from '@/lib/db'
import { Conversation } from '@/models/Conversation'
import jwt from 'jsonwebtoken'

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method === 'GET') {
    // Existing GET logic for fetching conversations
  } else if (req.method === 'POST') {
    try {
      const token = req.headers.authorization?.split(' ')[1]
      if (!token) {
        return res.status(401).json({ message: 'Unauthorized' })
      }

      const decoded = jwt.verify(token, process.env.JWT_SECRET!) as { userId: string }
      await connectToDatabase()

      const { recipientId } = req.body

      // Check if conversation already exists
      let conversation = await Conversation.findOne({
        participants: { $all: [decoded.userId, recipientId] }
      })

      if (!conversation) {
        // Create new conversation
        conversation = new Conversation({
          participants: [decoded.userId, recipientId]
        })
        await conversation.save()
      }

      // Populate participant details
      await conversation.populate('participants', '_id firstName lastName companyName avatar role')

      res.status(201).json(conversation)
    } catch (error) {
      console.error('Error creating conversation:', error)
      res.status(500).json({ message: 'Server error' })
    }
  } else {
    res.setHeader('Allow', ['GET', 'POST'])
    res.status(405).end(`Method ${req.method} Not Allowed`)
  }
}