import type { NextApiRequest, NextApiResponse } from 'next'
import { connectToDatabase } from '@/lib/db'
import { Message } from '@/models/Message'
import { Conversation } from '@/models/Conversation'
import jwt from 'jsonwebtoken'

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  console.log(`API Route Hit: ${req.method} /api/messages`);
  console.log('Request body:', req.body);
  console.log('Request headers:', req.headers);

  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' })
  }

  try {
    const token = req.headers.authorization?.split(' ')[1]
    if (!token) {
      return res.status(401).json({ message: 'Unauthorized' })
    }

    let decoded;
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET!) as { userId: string }
    } catch (error) {
      console.error('JWT verification failed:', error);
      return res.status(401).json({ message: 'Invalid token' })
    }

    await connectToDatabase()

    console.log('Decoded userId:', decoded.userId);
    const { conversationId, content } = req.body
    console.log('Conversation ID:', conversationId);
    console.log('Message content:', content);

    const conversation = await Conversation.findById(conversationId)
    if (!conversation) {
      console.error('Conversation not found:', conversationId);
      return res.status(404).json({ message: 'Conversation not found' })
    }

    const newMessage = new Message({
      sender: decoded.userId,
      conversation: conversationId,
      content,
      timestamp: new Date(),
      read: false
    })

    console.log('New message object:', newMessage);

    await newMessage.save()

    console.log('Message saved successfully');

    // Update conversation with last message
    conversation.lastMessage = newMessage._id
    conversation.updatedAt = new Date()
    await conversation.save()

    // Populate the sender information
    await newMessage.populate('sender', '_id firstName lastName companyName avatar role')

    console.log('Populated message:', newMessage);

    res.status(201).json(newMessage)
  } catch (error) {
    console.error('Error sending message:', error)
    res.status(500).json({ message: 'Server error', error: error.message })
  }
}