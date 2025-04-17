import mongoose, { Document, Schema } from 'mongoose';
import { IUser } from './User';

// Interface for family member with role
interface IFamilyMember {
  user: mongoose.Types.ObjectId | IUser;
  role: 'parent' | 'child';
  joinedAt: Date;
}

// Interface for pending invitations
interface IFamilyInvitation {
  email: string;
  role: 'parent' | 'child';
  token: string;
  expiresAt: Date;
}

// Main Family interface
export interface IFamily extends Document {
  name: string;
  members: IFamilyMember[];
  pendingInvitations: IFamilyInvitation[];
  createdBy: mongoose.Types.ObjectId | IUser;
  createdAt: Date;
  updatedAt: Date;
  isMember(userId: mongoose.Types.ObjectId | string): boolean;
  hasRole(userId: mongoose.Types.ObjectId | string, role: 'parent' | 'child'): boolean;
  hasPendingInvitation(email: string): boolean;
}

const familySchema = new Schema<IFamily>(
  {
    name: {
      type: String,
      required: [true, 'Family name is required'],
      trim: true,
      maxlength: [50, 'Family name cannot be more than 50 characters']
    },
    members: [{
      user: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true
      },
      role: {
        type: String,
        enum: ['parent', 'child'],
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
        enum: ['parent', 'child'],
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
familySchema.index({ 'members.user': 1 });
familySchema.index({ 'pendingInvitations.email': 1 });
familySchema.index({ createdBy: 1 });

// Method to check if a user is a member of the family
familySchema.methods.isMember = function(userId: mongoose.Types.ObjectId | string): boolean {
  // Ensure userId is a string for comparison
  const userIdStr = userId.toString();
  
  // First check if user is a member
  const isMember = this.members.some((member: IFamilyMember) => {
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

// Method to check if a user has a specific role in the family
familySchema.methods.hasRole = function(userId: mongoose.Types.ObjectId | string, role: 'parent' | 'child'): boolean {
  // Ensure userId is a string for comparison
  const userIdStr = userId.toString();
  
  // Find the member
  const member = this.members.find((m: IFamilyMember) => {
    const memberUser: any = m.user;
    const memberId = typeof memberUser === 'object' && memberUser !== null 
      ? (memberUser._id ? memberUser._id.toString() : memberUser.toString())
      : memberUser.toString();
    
    return memberId === userIdStr;
  });
  
  return member?.role === role;
};

// Method to check if an email has a pending invitation
familySchema.methods.hasPendingInvitation = function(email: string): boolean {
  return this.pendingInvitations.some(
    (invite: IFamilyInvitation) => invite.email === email && invite.expiresAt > new Date()
  );
};

// Clean up expired invitations before saving
familySchema.pre('save', function(next) {
  const now = new Date();
  this.pendingInvitations = this.pendingInvitations.filter(
    invite => invite.expiresAt > now
  );
  next();
});

export const Family = mongoose.model<IFamily>('Family', familySchema); 