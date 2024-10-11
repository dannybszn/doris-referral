import type { NextApiRequest, NextApiResponse } from 'next'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import { connectToDatabase } from '@/lib/db'
import { User } from '@/models/User'
import { SignupCode } from '@/models/SignupCode'
import formidable from 'formidable'
import fs from 'fs'
import path from 'path'

export const config = {
  api: {
    bodyParser: false,
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
    await connectToDatabase()

    const form = new formidable.IncomingForm()
    form.parse(req, async (err, fields, files) => {
      if (err) {
        return res.status(500).json({ message: 'Error parsing form data' })
      }

      const firstName = fields.firstName?.[0] || ''
      const lastName = fields.lastName?.[0] || ''
      const companyName = fields.companyName?.[0] || ''
      const email = fields.email?.[0] || ''
      const phoneNumber = fields.phoneNumber?.[0] || ''
      const password = fields.password?.[0] || ''
      const role = fields.role?.[0] || 'model'
      const signupCode = fields.signupCode?.[0] || ''
      const avatarFile = files.avatar as formidable.File | undefined

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

      // Handle avatar upload for models
      let avatarPath = ''
      if (role === 'model' && avatarFile) {
        const uploadDir = path.join(process.cwd(), 'public', 'uploads')
        if (!fs.existsSync(uploadDir)) {
          fs.mkdirSync(uploadDir, { recursive: true })
        }
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9)
        avatarPath = path.join('uploads', `${uniqueSuffix}-${avatarFile.originalFilename}`)
        const newPath = path.join(process.cwd(), 'public', avatarPath)
        fs.copyFileSync(avatarFile.filepath, newPath)
      }

      user = new User({
        firstName: role === 'model' ? firstName : undefined,
        lastName: role === 'model' ? lastName : undefined,
        companyName: role === 'agency' ? companyName : undefined,
        email,
        phoneNumber,
        password: await bcrypt.hash(password, 10),
        avatar: avatarPath,
        role
      })

      await user.save()

      const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET!, { expiresIn: '1h' })

      res.status(201).json({ token })
    })
  } catch (error) {
    console.error('Registration error:', error)
    res.status(500).json({ message: 'Server error' })
  }
}