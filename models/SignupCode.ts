import mongoose from 'mongoose'

const SignupCodeSchema = new mongoose.Schema({
  code: { type: String, required: true, unique: true },
  isValid: { type: Boolean, default: true },
  expiresAt: { type: Date, required: true },
})

export const SignupCode = mongoose.models.SignupCode || mongoose.model('SignupCode', SignupCodeSchema)