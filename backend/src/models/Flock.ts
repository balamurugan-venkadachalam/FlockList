import mongoose, { Document, Schema } from 'mongoose';
import { IUser } from './User';

// Interface for flock member with role
interface IFlockMember {
  user: mongoose.Types.ObjectId | IUser;
  role: 'admin' | 'member';
  joinedAt: Date;
}

// Interface for pending invitations
interface IFlockInvitation {
  email: string;
  role: 'admin' | 'member';
  token: string;
  expiresAt: Date;
}

// Main Flock interface
export interface IFlock extends Document {
  name: string;
  members: IFlockMember[];
  pendingInvitations: IFlockInvitation[];
  createdBy: mongoose.Types.ObjectId | IUser;
  createdAt: Date;
  updatedAt: Date;
  isMember(userId: mongoose.Types.ObjectId | string): boolean;
  hasRole(userId: mongoose.Types.ObjectId | string, role: 'admin' | 'member'): boolean;
  hasPendingInvitation(email: string): boolean;
}

const flockSchema = new Schema<IFlock>(
  {
    name: {
      type: String,
      required: [true, 'Flock name is required'],
      trim: true,
      maxlength: [50, 'Flock name cannot be more than 50 characters']
    },
    members: [{
      user: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true
      },
      role: {
        type: String,
        enum: ['admin', 'member'],
        required: true
      },
      joinedAt: {
        type: Date,
        default: Date.now
      }
    }],
    pendingInvitations: [{
      email: {
        type: String,
        required: true,
        match: [/^\S+@\S+\.\S+$/, 'Please enter a valid email address']
      },
      role: {
        type: String,
        enum: ['admin', 'member'],
        required: true
      },
      token: {
        type: String,
        required: true
      },
      expiresAt: {
        type: Date,
        required: true,
        default: () => new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // 7 days from now
      }
    }],
    createdBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true
    }
  },
  {
    timestamps: true
  }
);

// Indexes for better query performance
flockSchema.index({ 'members.user': 1 });
flockSchema.index({ 'pendingInvitations.email': 1 });
flockSchema.index({ createdBy: 1 });

// Method to check if a user is a member of the flock
flockSchema.methods.isMember = function(userId: mongoose.Types.ObjectId | string): boolean {
  // Ensure userId is a string for comparison
  const userIdStr = userId.toString();
  
  // First check if user is a member
  const isMember = this.members.some((member: IFlockMember) => {
    // Handle cases where member.user could be an ObjectId or a populated user object
    const memberUser: any = member.user;
    const memberId = typeof memberUser === 'object' && memberUser !== null 
      ? (memberUser._id ? memberUser._id.toString() : memberUser.toString())
      : memberUser.toString();
    
    return memberId === userIdStr;
  });
  
  // If not found in members, check if user is the creator (as a fallback)
  if (!isMember && this.createdBy) {
    const creatorId: any = this.createdBy;
    const creatorIdStr = typeof creatorId === 'object' && creatorId !== null
      ? (creatorId._id ? creatorId._id.toString() : creatorId.toString())
      : creatorId.toString();
    
    return creatorIdStr === userIdStr;
  }
  
  return isMember;
};

// Method to check if a user has a specific role in the flock
flockSchema.methods.hasRole = function(userId: mongoose.Types.ObjectId | string, role: 'admin' | 'member'): boolean {
  // Ensure userId is a string for comparison
  const userIdStr = userId.toString();
  
  // Find the member
  const member = this.members.find((m: IFlockMember) => {
    const memberUser: any = m.user;
    const memberId = typeof memberUser === 'object' && memberUser !== null 
      ? (memberUser._id ? memberUser._id.toString() : memberUser.toString())
      : memberUser.toString();
    
    return memberId === userIdStr;
  });
  
  return member?.role === role;
};

// Method to check if an email has a pending invitation
flockSchema.methods.hasPendingInvitation = function(email: string): boolean {
  return this.pendingInvitations.some(
    (invite: IFlockInvitation) => invite.email === email && invite.expiresAt > new Date()
  );
};

// Clean up expired invitations before saving
flockSchema.pre('save', function(next) {
  const now = new Date();
  this.pendingInvitations = this.pendingInvitations.filter(
    invite => invite.expiresAt > now
  );
  next();
});

export const Flock = mongoose.model<IFlock>('Flock', flockSchema); 