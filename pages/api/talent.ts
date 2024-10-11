import type { NextApiRequest, NextApiResponse } from 'next'
import { connectToDatabase } from '@/lib/db'
import { User } from '@/models/User'
import { mockTalents } from '@/lib/mockData'

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method not allowed' })
  }

  try {
    if (process.env.NODE_ENV === 'development') {
      // Use mock data in development mode
      return res.status(200).json(mockTalents)
    }

    // Connect to the database
    await connectToDatabase()

    // Fetch all users with the role 'model'
    const talents = await User.find({ role: 'model' }).select('-password -email -phoneNumber')

    res.status(200).json(talents)
  } catch (error) {
    console.error('Error fetching talents:', error)
    res.status(500).json({ message: 'Server error' })
  }
}