import type { NextApiRequest, NextApiResponse } from 'next'
import { connectToDatabase } from '@/lib/db'
import { Message } from '@/models/Message'
import jwt from 'jsonwebtoken'

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method not allowed' })
  }

  try {
    const token = req.headers.authorization?.split(' ')[1]
    if (!token) {
      return res.status(401).json({ message: 'Unauthorized' })
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as { userId: string }
    await connectToDatabase()

    const { conversationId } = req.query
    const messages = await Message.find({ conversation: conversationId })
      .sort({ timestamp: -1 })
      .limit(20)
      .populate('sender', '_id firstName lastName companyName avatar role')

    res.status(200).json(messages.reverse())
  } catch (error) {
    console.error('Error fetching messages:', error)
    res.status(500).json({ message: 'Server error' })
  }
}