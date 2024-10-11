import type { NextApiRequest, NextApiResponse } from 'next'
import { connectToDatabase } from '@/lib/db'
import { SignupCode } from '@/models/SignupCode'

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' })
  }

  try {
    await connectToDatabase()

    const { code, expiresAt, isValid = true } = req.body

    const signupCode = new SignupCode({
      code,
      expiresAt: new Date(expiresAt),
      isValid,
    })

    await signupCode.save()

    res.status(201).json({ message: 'Signup code created successfully' })
  } catch (error) {
    console.error(error)
    res.status(500).json({ message: 'Server error' })
  }
}