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

    const uploadDir = path.join(process.cwd(), 'public', 'uploads')
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true })
    }

    const form = formidable({
      uploadDir: uploadDir,
      keepExtensions: true,
    });

    form.parse(req, async (err, fields, files) => {
      if (err) {
        console.error('Error parsing form data:', err);
        return res.status(500).json({ message: 'Error parsing form data' })
      }

      console.log('Parsed fields:', fields);

      const getField = (field: string | string[] | undefined): string => {
        return Array.isArray(field) ? field[0] : field || '';
      };

      const firstName = getField(fields.firstName)
      const lastName = getField(fields.lastName)
      const companyName = getField(fields.companyName)
      const email = getField(fields.email)
      const phoneNumber = getField(fields.phoneNumber)
      const password = getField(fields.password)
      const role = getField(fields.role) || 'model'
      const signupCode = getField(fields.signupCode)
      const avatarFile = files.avatar as formidable.File | undefined

      console.log('Password type:', typeof password);
      console.log('Password value:', password);

      if (!password) {
        console.error('Invalid password:', password);
        return res.status(400).json({ message: 'Invalid password' })
      }

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
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9)
        avatarPath = path.join('uploads', `${uniqueSuffix}-${avatarFile.originalFilename}`)
      }

      try {
        // Hash the password
        const hashedPassword = await bcrypt.hash(password, 10)

        user = new User({
          firstName: role === 'model' ? firstName : undefined,
          lastName: role === 'model' ? lastName : undefined,
          companyName: role === 'agency' ? companyName : undefined,
          email,
          phoneNumber,
          password: hashedPassword,
          avatar: avatarPath,
          role
        })

        await user.save()

        const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET!, { expiresIn: '1h' })

        res.status(201).json({ token })
      } catch (error) {
        console.error('Error during user creation:', error);
        res.status(500).json({ message: 'Error creating user' })
      }
    })
  } catch (error) {
    console.error('Registration error:', error)
    res.status(500).json({ message: 'Server error' })
  }
}