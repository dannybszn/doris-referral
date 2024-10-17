import type { NextApiRequest, NextApiResponse } from 'next'
import bcrypt from 'bcryptjs'
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

  try {
    await connectToDatabase()

    const { email, password } = req.body

    console.log('Login attempt for email:', email);

    const user = await User.findOne({ email })
    if (!user) {
      console.log('User not found');
      return res.status(400).json({ message: 'Invalid credentials' })
    }

    const isMatch = await bcrypt.compare(password, user.password)
    if (!isMatch) {
      console.log('Password does not match');
      return res.status(400).json({ message: 'Invalid credentials' })
    }

    console.log('Login successful for user:', user._id);

    const token = jwt.sign(
      { userId: user._id, role: user.role },
      process.env.JWT_SECRET!,
      { expiresIn: '1h' }
    )

    res.status(200).json({ token, role: user.role })
  } catch (error) {
    console.error('Login error:', error)
    res.status(500).json({ message: 'Server error' })
  }
}