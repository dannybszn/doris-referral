import { NextApiRequest, NextApiResponse } from 'next';
import { connectToDatabase } from '@/lib/db';
import { Message } from '@/models/Message';
import jwt from 'jsonwebtoken';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  const token = req.query.token as string;
  if (!token) {
    return res.status(401).json({ message: 'Unauthorized' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as { userId: string };
    await connectToDatabase();

    res.writeHead(200, {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive',
    });

    const changeStream = Message.watch();
    changeStream.on('change', async (change) => {
      if (change.operationType === 'insert') {
        const newMessage = await Message.findById(change.documentKey._id)
          .populate('sender', 'firstName lastName companyName')
          .populate('conversation');

        if (newMessage.conversation.participants.includes(decoded.userId)) {
          res.write(`data: ${JSON.stringify(newMessage)}\n\n`);
        }
      }
    });

    req.on('close', () => {
      changeStream.close();
      res.end();
    });
  } catch (error) {
    console.error('SSE error:', error);
    res.status(500).json({ message: 'Server error' });
  }
}