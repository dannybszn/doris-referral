import type { NextApiRequest, NextApiResponse } from 'next'
import { mockMessages } from '@/lib/mockData'

export default function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method === 'GET') {
    const { conversationId } = req.query
    const messages = mockMessages.filter(
      message => message.sender === conversationId || message.recipient === conversationId
    )
    res.status(200).json(messages)
  } else {
    res.setHeader('Allow', ['GET'])
    res.status(405).end(`Method ${req.method} Not Allowed`)
  }
}