import type { NextApiRequest, NextApiResponse } from 'next'
import { connectToDatabase } from '@/lib/db'
import { User } from '@/models/User'
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

    // Fetch all users with the role 'model'
    const talents = await User.find({ role: 'model' })
      .select('_id firstName lastName companyName avatar role')

    res.status(200).json(talents)
  } catch (error) {
    console.error('Error fetching talents:', error)
    res.status(500).json({ message: 'Server error' })
  }
}