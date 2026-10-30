import { Schema, model, Document } from 'mongoose'

export interface IUserDocument extends Document {
  name: string
  email: string
  passwordHash?: string
  avatarUrl?: string
  role: 'super_admin' | 'admin' | 'member' | 'guest'
  organizationId?: Schema.Types.ObjectId
  isActive: boolean
  preferences: {
    theme: 'light' | 'dark' | 'system'
    defaultMicEnabled: boolean
    defaultCamEnabled: boolean
    transcriptionLanguage: string
  }
  lastLoginAt?: Date
  createdAt: Date
  updatedAt: Date
}

const UserSchema = new Schema<IUserDocument>(
  {
    name: {
      type: String,
      required: [true, 'Name is required'],
      trim: true,
      minlength: [2, 'Name must be at least 2 characters'],
      maxlength: [100, 'Name cannot exceed 100 characters'],
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      trim: true,
      lowercase: true,
      match: [/^\S+@\S+\.\S+$/, 'Please provide a valid email address'],
      index: true,
    },
    passwordHash: {
      type: String,
      select: false,
    },
    avatarUrl: {
      type: String,
      default: '',
    },
    role: {
      type: String,
      enum: ['super_admin', 'admin', 'member', 'guest'],
      default: 'member',
      index: true,
    },
    organizationId: {
      type: Schema.Types.ObjectId,
      ref: 'Organization',
      index: true,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    preferences: {
      theme: {
        type: String,
        enum: ['light', 'dark', 'system'],
        default: 'dark',
      },
      defaultMicEnabled: {
        type: Boolean,
        default: true,
      },
      defaultCamEnabled: {
        type: Boolean,
        default: true,
      },
      transcriptionLanguage: {
        type: String,
        default: 'en-US',
      },
    },
    lastLoginAt: {
      type: Date,
    },
  },
  {
    timestamps: true,
  }
)

UserSchema.index({ organizationId: 1, role: 1 })

export const User = model<IUserDocument>('User', UserSchema)
