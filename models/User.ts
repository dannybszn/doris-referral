import mongoose from 'mongoose'

const UserSchema = new mongoose.Schema({
  firstName: String,
  lastName: String,
  companyName: String,
  email: { type: String, unique: true },
  phoneNumber: String,
  password: String,
  avatar: String,
  role: { type: String, enum: ['model', 'agency'], default: 'model' },
  bio: String,
  age: Number,
  height: String,
  hairColor: String,
  birthday: Date,
  positiveKeywords: [String],
  negativeKeywords: [String],
  profileLink: String,
  additionalPhotos: [String],
  price: { type: Number, default: 0 },
  conversations: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }]
}, { timestamps: true })

export const User = mongoose.models.User || mongoose.model('User', UserSchema)