import type { NextApiRequest, NextApiResponse } from 'next'
import { connectToDatabase } from '@/lib/db'
import { Conversation } from '@/models/Conversation'
import { User } from '@/models/User'
import jwt from 'jsonwebtoken'

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  console.log(`API Route Hit: ${req.method} /api/conversations`);
  console.log('Request body:', req.body);
  console.log('Request headers:', req.headers);

  try {
    const token = req.headers.authorization?.split(' ')[1]
    if (!token) {
      return res.status(401).json({ message: 'Unauthorized' })
    }

    let decoded;
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET!) as { userId: string, role: string }
    } catch (error) {
      console.error('JWT verification failed:', error);
      return res.status(401).json({ message: 'Invalid token' })
    }

    await connectToDatabase()

    if (req.method === 'GET') {
      const conversations = await Conversation.find({ participants: decoded.userId })
        .populate('participants', '_id firstName lastName companyName avatar role')
        .populate('lastMessage')
        .sort({ updatedAt: -1 })

      return res.status(200).json(conversations)
    } else if (req.method === 'POST') {
      const { recipientId } = req.body

      if (!recipientId) {
        return res.status(400).json({ message: 'Missing recipientId' })
      }

      // Check if both users exist
      const [currentUser, recipientUser] = await Promise.all([
        User.findById(decoded.userId),
        User.findById(recipientId)
      ])

      if (!currentUser || !recipientUser) {
        return res.status(404).json({ message: 'User not found' })
      }

      // Check if conversation already exists
      let conversation = await Conversation.findOne({
        participants: { $all: [decoded.userId, recipientId] }
      })

      if (conversation) {
        // If conversation exists, return it
        await conversation.populate('participants', '_id firstName lastName companyName avatar role')
        return res.status(200).json(conversation)
      }

      // Create new conversation
      conversation = new Conversation({
        participants: [decoded.userId, recipientId]
      })
      await conversation.save()
      console.log('New conversation created:', conversation._id)

      // Populate participant details
      await conversation.populate('participants', '_id firstName lastName companyName avatar role')

      return res.status(201).json(conversation)
    } else {
      return res.status(405).json({ message: `Method ${req.method} Not Allowed` })
    }
  } catch (error) {
    console.error('Error in conversations API:', error)
    return res.status(500).json({ message: 'Server error', error: error.message })
  }
}