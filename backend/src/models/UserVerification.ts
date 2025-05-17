import mongoose, { Schema, Document } from 'mongoose';

// Rule: TypeScript Usage - Use TypeScript for all code; prefer interfaces over types

export interface IUserVerification extends Document {
  userId: mongoose.Types.ObjectId;
  token: string;
  createdAt: Date;
  expiresAt: Date;
}

const userVerificationSchema = new Schema<IUserVerification>({
  userId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  token: {
    type: String,
    required: true
  },
  createdAt: {
    type: Date,
    default: Date.now,
    expires: 3600 // 1 hour
  },
  expiresAt: {
    type: Date,
    required: true
  }
});

export const UserVerification = mongoose.model<IUserVerification>('UserVerification', userVerificationSchema);
