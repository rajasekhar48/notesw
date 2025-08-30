// File: server/src/models/User.ts
import mongoose, { Document, Schema } from 'mongoose';
import bcrypt from 'bcryptjs';

export interface IUser extends Document {
  name: string;
  email: string;
  dateOfBirth: Date;
  password?: string | undefined;
  googleId?: string | undefined;
  isEmailVerified: boolean;
  otp?: string | undefined;
  otpExpires?: Date | undefined;
  createdAt: Date;
  updatedAt: Date;
  comparePassword(candidatePassword: string): Promise<boolean>;
}

const userSchema = new Schema<IUser>({
  name: {
    type: String,
    trim: true,
    minlength: 2,
    maxlength: 50
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true,
  },
  dateOfBirth: {
    type: Date,
    validate: {
      validator: function(date: Date) {
        // Check if user is at least 13 years old
        const minAge = new Date();
        minAge.setFullYear(minAge.getFullYear() - 13);
        return date <= minAge;
      },
      message: 'User must be at least 13 years old'
    }
  },
  password: {
    type: String,
    minlength: 6,
    validate: {
      validator: function(this: IUser) {
        // Password is required only if googleId is not present
        return !!(this.googleId || this.password);
      },
      message: 'Password is required for email registration'
    }
  },
  googleId: {
    type: String,
    sparse: true // Allows multiple null values but ensures uniqueness for non-null values
  },
  isEmailVerified: {
    type: Boolean,
    default: false
  },
  otp: {
    type: String,

  },
  otpExpires: {
    type: Date,

  }
}, {
  timestamps: true
});

// Hash password before saving
userSchema.pre('save', async function(next) {
  if (!this.isModified('password') || !this.password) return next();
  
  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error as Error);
  }
});

// Compare password method
userSchema.methods.comparePassword = async function(candidatePassword: string): Promise<boolean> {
  if (!this.password) return false;
  return bcrypt.compare(candidatePassword, this.password);
};

// Index for better query performance
userSchema.index({ email: 1 });
userSchema.index({ googleId: 1 });

export const User = mongoose.model<IUser>('User', userSchema);