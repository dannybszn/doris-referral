import type { NextApiRequest, NextApiResponse } from 'next'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import { connectToDatabase } from '@/lib/db'
import { User } from '@/models/User'
import { SignupCode } from '@/models/SignupCode'

export const config = {
  api: {
    bodyParser: {
      sizeLimit: '2mb',
    },
  },
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' })
  }

  try {
    console.log('Connecting to database...');
    await connectToDatabase()
    console.log('Connected to database');

    const { 
      firstName, 
      lastName, 
      companyName, 
      email, 
      phoneNumber, 
      password, 
      role, 
      avatar, 
      signupCode 
    } = req.body;

    console.log('Received registration data:', { 
      firstName, 
      lastName, 
      companyName, 
      email, 
      phoneNumber, 
      role, 
      signupCode,
      hasAvatar: !!avatar 
    });

    let user = await User.findOne({ email })
    if (user) {
      return res.status(400).json({ message: 'User already exists' })
    }

    if (role === 'agency') {
      if (!signupCode) {
        return res.status(400).json({ message: 'Signup code is required for agency registration' })
      }

      const validCode = await SignupCode.findOne({ 
        code: signupCode, 
        isValid: true, 
        expiresAt: { $gt: new Date() } 
      })

      if (!validCode) {
        return res.status(400).json({ message: 'Invalid or expired sign-up code' })
      }
    }

    try {
      console.log('Hashing password...');
      const hashedPassword = await bcrypt.hash(password, 10)
      console.log('Password hashed');

      console.log('Creating new user...');
      user = new User({
        firstName: role === 'model' ? firstName : undefined,
        lastName: role === 'model' ? lastName : undefined,
        companyName: role === 'agency' ? companyName : undefined,
        email,
        phoneNumber,
        password: hashedPassword,
        avatar,
        role
      })

      await user.save()
      console.log('User saved successfully:', user._id);

      const token = jwt.sign({ userId: user._id, role: user.role }, process.env.JWT_SECRET!, { expiresIn: '1h' })

      res.status(201).json({ token, role: user.role })
    } catch (error) {
      console.error('Error during user creation:', error);
      res.status(500).json({ message: 'Error creating user' })
    }
  } catch (error) {
    console.error('Registration error:', error)
    res.status(500).json({ message: 'Server error' })
  }
}