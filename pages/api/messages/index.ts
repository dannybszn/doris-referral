import type { NextApiRequest, NextApiResponse } from 'next'
import { connectToDatabase } from '@/lib/db'
import { Message } from '@/models/Message'
import { Conversation } from '@/models/Conversation'
import jwt from 'jsonwebtoken'

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' })
  }

  try {
    const token = req.headers.authorization?.split(' ')[1]
    if (!token) {
      return res.status(401).json({ message: 'Unauthorized' })
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as { userId: string }
    await connectToDatabase()

    const { recipientId, content } = req.body

    // Find or create conversation
    let conversation = await Conversation.findOne({
      participants: { $all: [decoded.userId, recipientId] }
    })

    if (!conversation) {
      conversation = new Conversation({
        participants: [decoded.userId, recipientId]
      })
      await conversation.save()
    }

    const newMessage = new Message({
      sender: decoded.userId,
      recipient: recipientId,
      content,
      conversation: conversation._id,
      timestamp: new Date(),
      read: false
    })

    await newMessage.save()

    // Update conversation with last message
    conversation.lastMessage = newMessage._id
    conversation.updatedAt = new Date()
    await conversation.save()

    res.status(201).json(newMessage)
  } catch (error) {
    console.error('Error sending message:', error)
    res.status(500).json({ message: 'Server error' })
  }
}