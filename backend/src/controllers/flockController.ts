import { Request, Response, NextFunction } from 'express';
import { Flock, IFlock } from '../models/Flock';
import { User } from '../models/User';
import { AuthRequest } from '../types/auth';
import {
  ValidationError,
  AuthenticationError,
  NotFoundError,
  DatabaseError
} from '../types/errors';
import crypto from 'crypto';
import { sendEmail } from '../utils/email';
import mongoose from 'mongoose';

interface CreateFlockBody {
  name: string;
}

export interface InviteMemberBody {
  email: string;
  role: 'admin' | 'member';
}

// Create a new flock
export const createFlock = async (
  req: AuthRequest<{}, {}, CreateFlockBody>,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { name } = req.body;
    const userId = req.user?.userId;

    if (!userId) {
      throw new AuthenticationError('User not authenticated');
    }

    // Create new flock with the current user as the first admin member
    const flock = new Flock({
      name,
      members: [{
        user: new mongoose.Types.ObjectId(userId),
        role: 'admin',
        joinedAt: new Date()
      }],
      createdBy: new mongoose.Types.ObjectId(userId)
    });

    await flock.save();

    // Populate the user information for the response
    await flock.populate('members.user', 'email firstName lastName');
    await flock.populate('createdBy', 'email firstName lastName');

    res.status(201).json({
      message: 'Flock created successfully',
      flock
    });
  } catch (error) {
    next(error);
  }
};

// Get all flocks for a user
export const getFlocks = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const userId = req.user?.userId;

    if (!userId) {
      throw new AuthenticationError('User not authenticated');
    }

    const flocks = await Flock.find({ 'members.user': new mongoose.Types.ObjectId(userId) })
      .populate('members.user', 'email firstName lastName')
      .populate('createdBy', 'email firstName lastName');

    res.json({
      message: 'Flocks retrieved successfully',
      flocks
    });
  } catch (error) {
    next(error);
  }
};

// Alias for getFlocks for compatibility with older code
export const getFamilies = getFlocks;

// Get a specific flock by ID
export const getFlockById = async (
  req: AuthRequest<{ id: string }>,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { id } = req.params;
    const userId = req.user?.userId;
    
    console.log(`getFlockById: Retrieving flock ${id} for user ${userId}`);

    if (!userId) {
      throw new AuthenticationError('User not authenticated');
    }

    const flock = await Flock.findById(new mongoose.Types.ObjectId(id))
      .populate('members.user', 'email firstName lastName')
      .populate('createdBy', 'email firstName lastName');

    if (!flock) {
      console.log(`getFlockById: Flock ${id} not found`);
      throw new NotFoundError('Flock not found');
    }

    console.log(`getFlockById: Flock found, checking membership`);
    console.log(`getFlockById: Flock members count: ${flock.members.length}`);
    
    // Check if user is a member using a safer approach
    let isMember = false;
    
    // Check in members array
    if (flock.members && flock.members.length > 0) {
      isMember = flock.members.some(member => {
        if (!member.user) return false;
        
        // Convert ObjectId to string safely
        const memberUserId = typeof member.user === 'object' && member.user._id 
          ? member.user._id.toString() 
          : String(member.user);
        
        return memberUserId === userId;
      });
    }
    
    // If not in members, check if user is the creator
    if (!isMember && flock.createdBy) {
      // Convert ObjectId to string safely
      const creatorId = typeof flock.createdBy === 'object' && flock.createdBy._id
        ? flock.createdBy._id.toString()
        : String(flock.createdBy);
      
      isMember = creatorId === userId;
    }
    
    console.log(`getFlockById: User ${userId} is member: ${isMember}`);

    if (!isMember) {
      throw new AuthenticationError('Not authorized to view this flock');
    }

    res.json({
      message: 'Flock retrieved successfully',
      flock
    });
  } catch (error) {
    console.error(`getFlockById error:`, error);
    next(error);
  }
};

// Invite a new member to the flock
export const inviteMember = async (
  req: AuthRequest<{ id: string }, {}, InviteMemberBody>,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { id } = req.params;
    const { email, role } = req.body;
    const userId = req.user?.userId;

    console.log(`inviteMember: User ${userId} inviting ${email} to flock ${id} with role ${role}`);

    if (!userId) {
      throw new AuthenticationError('User not authenticated');
    }

    const flock = await Flock.findById(new mongoose.Types.ObjectId(id));
    if (!flock) {
      console.log(`inviteMember: Flock ${id} not found`);
      throw new NotFoundError('Flock not found');
    }

    // Check if the inviting user is an admin in the flock
    const hasAdminRole = flock.hasRole(userId, 'admin');
    console.log(`inviteMember: User ${userId} has admin role: ${hasAdminRole}`);
    
    if (!hasAdminRole) {
      throw new AuthenticationError('Only admins can invite new members');
    }

    // Check if the email is already a member
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      const isExistingMember = flock.isMember(existingUser._id);
      console.log(`inviteMember: User with email ${email} exists, is member: ${isExistingMember}`);
      
      if (isExistingMember) {
        throw new ValidationError('User is already a member of this flock');
      }
    }

    // Check if there's already a pending invitation
    if (flock.hasPendingInvitation(email)) {
      throw new ValidationError('An invitation is already pending for this email');
    }

    // Generate invitation token
    const token = crypto.randomBytes(32).toString('hex');

    // Add invitation to flock
    flock.pendingInvitations.push({
      email,
      role,
      token,
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // 7 days from now
    });

    await flock.save();

    // Get the inviter's name for the email
    const inviterUser = await User.findById(userId).select('firstName lastName email');
    const inviterName = inviterUser 
      ? `${inviterUser.firstName} ${inviterUser.lastName}`.trim() || inviterUser.email
      : 'A flock admin';

    // Send invitation email
    const inviteUrl = `${process.env.FRONTEND_URL}/invitation?token=${token}`;
    
    await sendEmail({
      to: email,
      subject: `You've been invited to join a flock on TaskMaster`,
      text: `${inviterName} has invited you to join their flock "${flock.name}" on TaskMaster. Click this link to accept: ${inviteUrl}`,
      html: `
        <h2>Flock Invitation</h2>
        <p>${inviterName} has invited you to join their flock "${flock.name}" on TaskMaster.</p>
        <p>Click the link below to accept the invitation:</p>
        <p><a href="${inviteUrl}" style="padding: 10px 15px; background-color: #4CAF50; color: white; text-decoration: none; border-radius: 4px;">Accept Invitation</a></p>
        <p>This invitation will expire in 7 days.</p>
        <p>If you don't have an account yet, you'll be able to create one after clicking the link.</p>
      `
    });

    res.json({
      message: 'Invitation sent successfully',
      email,
      role
    });
  } catch (error) {
    next(error);
  }
};

// Accept an invitation to join a flock
export const acceptInvitation = async (
  req: AuthRequest<{}, {}, { token: string }>,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { token } = req.body;
    const userId = req.user?.userId;

    if (!userId) {
      throw new AuthenticationError('User not authenticated');
    }

    // Find the flock with the given invitation token
    const flock = await Flock.findOne({
      'pendingInvitations.token': token,
      'pendingInvitations.expiresAt': { $gt: new Date() } // Not expired
    });

    if (!flock) {
      throw new NotFoundError('Invalid or expired invitation token');
    }

    // Find the invitation
    const invitation = flock.pendingInvitations.find(inv => inv.token === token && inv.expiresAt > new Date());
    if (!invitation) {
      throw new NotFoundError('Invitation not found');
    }

    // Get user details
    const user = await User.findById(userId);
    if (!user) {
      throw new DatabaseError('User not found');
    }

    // Check if user is already a member
    if (flock.isMember(userId)) {
      throw new ValidationError('You are already a member of this flock');
    }

    // Add user to flock members
    flock.members.push({
      user: new mongoose.Types.ObjectId(userId),
      role: invitation.role,
      joinedAt: new Date()
    });

    // Remove invitation
    flock.pendingInvitations = flock.pendingInvitations.filter(inv => inv.token !== token);

    await flock.save();
    await flock.populate('members.user', 'email firstName lastName');

    res.json({
      message: 'Successfully joined flock',
      flock
    });
  } catch (error) {
    next(error);
  }
};

// Remove a member from the flock
export const removeMember = async (
  req: AuthRequest<{ id: string; userId: string }>,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { id, userId: memberIdToRemove } = req.params;
    const requestingUserId = req.user?.userId;

    if (!requestingUserId) {
      throw new AuthenticationError('User not authenticated');
    }

    const flock = await Flock.findById(new mongoose.Types.ObjectId(id));
    if (!flock) {
      throw new NotFoundError('Flock not found');
    }

    // Check if the requesting user is an admin in the flock
    const isAdmin = flock.hasRole(requestingUserId, 'admin');
    if (!isAdmin) {
      throw new AuthenticationError('Only admin members can remove other members');
    }

    // Check if the member to remove exists
    const memberExists = flock.members.some(member => {
      const memberId = typeof member.user === 'object' 
        ? (member.user as mongoose.Types.ObjectId | { _id: mongoose.Types.ObjectId })._id?.toString() 
          || (member.user as mongoose.Types.ObjectId).toString()
        : (member.user as mongoose.Types.ObjectId | string).toString();
      return memberId === memberIdToRemove;
    });

    if (!memberExists) {
      throw new NotFoundError('Member not found in this flock');
    }

    // Check if removing the last admin
    const memberToRemoveRole = flock.hasRole(memberIdToRemove, 'admin');
    const adminMembers = flock.members.filter(member => member.role === 'admin');

    if (memberToRemoveRole && adminMembers.length <= 1) {
      throw new ValidationError('Cannot remove the last admin from the flock');
    }

    // Remove the member
    flock.members = flock.members.filter(member => {
      const memberId = typeof member.user === 'object' 
        ? (member.user as mongoose.Types.ObjectId | { _id: mongoose.Types.ObjectId })._id?.toString() 
          || (member.user as mongoose.Types.ObjectId).toString()
        : (member.user as mongoose.Types.ObjectId | string).toString();
      return memberId !== memberIdToRemove;
    });

    await flock.save();

    res.json({
      message: 'Member removed successfully',
      flockId: flock._id.toString()
    });
  } catch (error) {
    next(error);
  }
};

// Get all pending invitations for the current user
export const getUserInvitations = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const userId = req.user?.userId;

    if (!userId) {
      throw new AuthenticationError('User not authenticated');
    }

    // Get the user's email
    const user = await User.findById(new mongoose.Types.ObjectId(userId));
    if (!user) {
      throw new DatabaseError('User not found');
    }

    // Find all flocks that have pending invitations for this user's email
    const flocks = await Flock.find({
      'pendingInvitations.email': user.email,
      'pendingInvitations.expiresAt': { $gt: new Date() } // Not expired
    }).select('name pendingInvitations');

    // Extract only the relevant invitation data
    const invitations = flocks.map(flock => {
      const invitation = flock.pendingInvitations.find(inv => 
        inv.email === user.email && new Date(inv.expiresAt) > new Date()
      );
      
      return {
        flockId: flock._id,
        flockName: flock.name,
        token: invitation?.token,
        role: invitation?.role,
        email: user.email,
        expiresAt: invitation?.expiresAt
      };
    });

    res.json({
      message: 'Invitations retrieved successfully',
      invitations
    });
  } catch (error) {
    console.error('getUserInvitations error:', error);
    next(error);
  }
};

// Cancel a pending invitation
export const cancelInvitation = async (
  req: AuthRequest<{ id: string; email: string }>,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { id, email } = req.params;
    const userId = req.user?.userId;

    console.log(`cancelInvitation: User ${userId} canceling invitation for ${email} in flock ${id}`);

    if (!userId) {
      throw new AuthenticationError('User not authenticated');
    }

    const flock = await Flock.findById(new mongoose.Types.ObjectId(id));
    if (!flock) {
      console.log(`cancelInvitation: Flock ${id} not found`);
      throw new NotFoundError('Flock not found');
    }

    // Check if the requesting user is an admin in the flock
    const isAdmin = flock.hasRole(userId, 'admin');
    console.log(`cancelInvitation: User ${userId} has admin role: ${isAdmin}`);
    
    if (!isAdmin) {
      throw new AuthenticationError('Only admins can cancel invitations');
    }

    // Check if the invitation exists
    const invitationExists = flock.hasPendingInvitation(email);
    console.log(`cancelInvitation: Invitation exists for ${email}: ${invitationExists}`);
    
    if (!invitationExists) {
      throw new NotFoundError('Invitation not found');
    }

    // Remove the invitation
    flock.pendingInvitations = flock.pendingInvitations.filter(inv => inv.email !== email);
    await flock.save();

    res.json({
      message: 'Invitation cancelled successfully',
      flockId: flock._id.toString(),
      email
    });
  } catch (error) {
    console.error('cancelInvitation error:', error);
    next(error);
  }
}; 