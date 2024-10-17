import type { NextApiRequest, NextApiResponse } from 'next'
import { serialize } from 'cookie'

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' })
  }

  // Clear cookies
  res.setHeader('Set-Cookie', [
    serialize('token', '', {
      httpOnly: true,
      secure: process.env.NODE_ENV !== 'development',
      sameSite: 'strict',
      maxAge: -1,
      path: '/'
    }),
    serialize('refreshToken', '', {
      httpOnly: true,
      secure: process.env.NODE_ENV !== 'development',
      sameSite: 'strict',
      maxAge: -1,
      path: '/'
    })
  ]);

  res.status(200).json({ message: 'Logged out successfully' })
}