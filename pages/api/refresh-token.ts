import type { NextApiRequest, NextApiResponse } from 'next'
import jwt from 'jsonwebtoken'
import { connectToDatabase } from '@/lib/db'
import { User } from '@/models/User'

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' })
  }

  const { refreshToken } = req.body

  if (!refreshToken) {
    return res.status(400).json({ message: 'Refresh token is required' })
  }

  try {
    const decoded = jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET!) as { userId: string }
    await connectToDatabase()
    const user = await User.findById(decoded.userId)

    if (!user) {
      return res.status(404).json({ message: 'User not found' })
    }

    const newToken = jwt.sign({ userId: user._id }, process.env.JWT_SECRET!, { expiresIn: '1h' })
    const newRefreshToken = jwt.sign({ userId: user._id }, process.env.REFRESH_TOKEN_SECRET!, { expiresIn: '7d' })

    res.status(200).json({ token: newToken, refreshToken: newRefreshToken })
  } catch (error) {
    console.error(error)
    res.status(401).json({ message: 'Invalid refresh token' })
  }
}