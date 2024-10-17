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

    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as { userId: string, role: string }
    await connectToDatabase()

    const { search } = req.query
    const currentUser = await User.findById(decoded.userId)

    if (!currentUser) {
      return res.status(404).json({ message: 'User not found' })
    }

    const searchRegex = new RegExp(search as string, 'i')
    const talents = await User.find({
      $and: [
        { _id: { $ne: decoded.userId } },
        { role: currentUser.role === 'model' ? 'agency' : 'model' },
        {
          $or: [
            { firstName: searchRegex },
            { lastName: searchRegex },
            { companyName: searchRegex }
          ]
        }
      ]
    }).select('_id firstName lastName companyName avatar role')

    res.status(200).json(talents)
  } catch (error) {
    console.error('Error searching talents:', error)
    res.status(500).json({ message: 'Server error' })
  }
}