import type { NextApiRequest, NextApiResponse } from 'next'
import { mockMessages } from '@/lib/mockData'

export default function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method === 'POST') {
    const { recipientId, content } = req.body
    const newMessage = {
      _id: (mockMessages.length + 1).toString(),
      sender: 'currentUser',
      recipient: recipientId,
      content,
      timestamp: new Date().toISOString(),
    }
    mockMessages.push(newMessage)
    res.status(201).json(newMessage)
  } else {
    res.setHeader('Allow', ['POST'])
    res.status(405).end(`Method ${req.method} Not Allowed`)
  }
}