import mongoose from 'mongoose';
import { Flock } from '../models/Flock';
import { User } from '../models/User';
import crypto from 'crypto';
import { sendEmail } from '../utils/email';
import {
  ValidationError,
  AuthenticationError,
  NotFoundError,
  DatabaseError,
  AuthorizationError
} from '../types/errors';

/**
 * Interface for creating a new flock
 */
export interface CreateFlockParams {
  name: string;
  userId: string;
}

/**
 * Interface for inviting a member to a flock
 */
export interface InviteMemberParams {
  flockId: string;
  email: string;
  role: 'admin' | 'member';
  inviterId: string;
}

/**
 * Interface for accepting a flock invitation
 */
export interface AcceptInvitationParams {
  token: string;
  userId: string;
}

/**
 * Interface for removing a member from a flock
 */
export interface RemoveMemberParams {
  flockId: string;
  memberIdToRemove: string;
  requesterId: string;
}

/**
 * Interface for canceling a pending invitation
 */
export interface CancelInvitationParams {
  flockId: string;
  email: string;
  requesterId: string;
}

/**
 * Create a new flock
 */
export async function createFlock(params: CreateFlockParams) {
  const { name, userId } = params;

  if (!name) {
    throw new ValidationError('Flock name is required');
  }

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

  return flock;
}

/**
 * Get all flocks for a user
 */
export async function getFlocks(userId: string) {
  if (!userId) {
    throw new AuthenticationError('User not authenticated');
  }

  const flocks = await Flock.find({ 'members.user': new mongoose.Types.ObjectId(userId) })
    .populate('members.user', 'email firstName lastName')
    .populate('createdBy', 'email firstName lastName');

  return flocks;
}

/**
 * Get a specific flock by ID
 */
export async function getFlockById(flockId: string, userId: string) {
  if (!userId) {
    throw new AuthenticationError('User not authenticated');
  }

  const flock = await Flock.findById(new mongoose.Types.ObjectId(flockId))
    .populate('members.user', 'email firstName lastName')
    .populate('createdBy', 'email firstName lastName');

  if (!flock) {
    throw new NotFoundError('Flock not found');
  }

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

  if (!isMember) {
    throw new AuthorizationError('You are not a member of this flock');
  }

  return flock;
}

/**
 * Invite a new member to the flock
 */
export async function inviteMember(params: InviteMemberParams) {
  const { flockId, email, role, inviterId } = params;

  if (!inviterId) {
    throw new AuthenticationError('User not authenticated');
  }

  // Validate email format
  const emailRegex = /^\S+@\S+\.\S+$/;
  if (!emailRegex.test(email)) {
    throw new ValidationError('Invalid email format');
  }

  // Find the flock
  const flock = await Flock.findById(new mongoose.Types.ObjectId(flockId));
  if (!flock) {
    throw new NotFoundError('Flock not found');
  }

  // Check if the inviter is an admin in the flock
  const isAdmin = flock.hasRole(inviterId, 'admin');
  if (!isAdmin) {
    throw new AuthorizationError('Only admins can invite new members');
  }

  // Check if the user is already a member
  const existingUser = await User.findOne({ email });
  if (existingUser) {
    const existingMember = flock.members.some(member => {
      const memberUser = member.user;
      let memberId: string;
      
      if (typeof memberUser === 'object' && memberUser !== null) {
        if ('_id' in memberUser && memberUser._id) {
          memberId = memberUser._id.toString();
        } else {
          memberId = (memberUser as mongoose.Types.ObjectId).toString();
        }
      } else {
        memberId = String(memberUser);
      }
      
      return memberId === existingUser._id.toString();
    });

    if (existingMember) {
      throw new ValidationError('User is already a member of this flock');
    }
  }

  // Check if there's already a pending invitation for this email
  const hasPendingInvitation = flock.hasPendingInvitation(email);
  if (hasPendingInvitation) {
    throw new ValidationError('There is already a pending invitation for this email');
  }

  // Generate a unique token for the invitation
  const token = crypto.randomBytes(32).toString('hex');
  
  // Set expiration date (7 days from now)
  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + 7);

  // Add the invitation to the flock
  flock.pendingInvitations.push({
    email,
    role,
    token,
    expiresAt
  });

  await flock.save();

  // Get the inviter's name for the email
  const inviter = await User.findById(new mongoose.Types.ObjectId(inviterId));
  if (!inviter) {
    throw new DatabaseError('Inviter not found');
  }

  // Send invitation email
  const inviterName = `${inviter.firstName} ${inviter.lastName}`;
  const subject = `Invitation to join ${flock.name} on TaskMaster`;
  const acceptUrl = `${process.env.FRONTEND_URL || 'http://localhost:3000'}/invitations/accept?token=${token}`;
  
  const htmlMessage = `
    <p>Hello,</p>
    <p>${inviterName} has invited you to join their flock "${flock.name}" on TaskMaster.</p>
    <p>Click <a href="${acceptUrl}">here</a> to accept the invitation.</p>
    <p>This invitation will expire in 7 days.</p>
    <p>If you don't have an account yet, you'll be able to create one after accepting the invitation.</p>
    <p>Best regards,<br>The TaskMaster Team</p>
  `;
  
  const textMessage = `
    Hello,
    ${inviterName} has invited you to join their flock "${flock.name}" on TaskMaster.
    Visit this link to accept the invitation: ${acceptUrl}
    This invitation will expire in 7 days.
    If you don't have an account yet, you'll be able to create one after accepting the invitation.
    Best regards,
    The TaskMaster Team
  `;

  try {
    await sendEmail({
      to: email,
      subject,
      html: htmlMessage,
      text: textMessage
    });
  } catch (error) {
    // If email fails, still return success but log the error
    console.error('Failed to send invitation email:', error);
  }

  return {
    message: 'Invitation sent successfully',
    flockId: flock._id.toString(),
    email,
    role
  };
}

/**
 * Accept an invitation to join a flock
 */
export async function acceptInvitation(params: AcceptInvitationParams) {
  const { token, userId } = params;

  if (!userId) {
    throw new AuthenticationError('User not authenticated');
  }

  // Find the flock with this invitation token
  const flock = await Flock.findOne({
    'pendingInvitations.token': token,
    'pendingInvitations.expiresAt': { $gt: new Date() } // Not expired
  });

  if (!flock) {
    throw new NotFoundError('Invalid or expired invitation token');
  }

  // Find the specific invitation
  const invitation = flock.pendingInvitations.find(inv => 
    inv.token === token && new Date(inv.expiresAt) > new Date()
  );

  if (!invitation) {
    throw new NotFoundError('Invitation not found');
  }

  // Get the user's email
  const user = await User.findById(new mongoose.Types.ObjectId(userId));
  if (!user) {
    throw new DatabaseError('User not found');
  }

  // Check if the invitation email matches the user's email
  if (user.email !== invitation.email) {
    throw new AuthorizationError('This invitation was sent to a different email address');
  }

  // Check if user is already a member
  const isAlreadyMember = flock.members.some(member => {
    const memberUser = member.user;
    let memberId: string;
    
    if (typeof memberUser === 'object' && memberUser !== null) {
      if ('_id' in memberUser && memberUser._id) {
        memberId = memberUser._id.toString();
      } else {
        memberId = (memberUser as mongoose.Types.ObjectId).toString();
      }
    } else {
      memberId = String(memberUser);
    }
    
    return memberId === userId;
  });

  if (isAlreadyMember) {
    // Remove the invitation
    flock.pendingInvitations = flock.pendingInvitations.filter(inv => inv.token !== token);
    await flock.save();
    
    throw new ValidationError('You are already a member of this flock');
  }

  // Add the user as a member with the specified role
  flock.members.push({
    user: new mongoose.Types.ObjectId(userId),
    role: invitation.role,
    joinedAt: new Date()
  });

  // Remove the invitation
  flock.pendingInvitations = flock.pendingInvitations.filter(inv => inv.token !== token);

  await flock.save();

  return {
    message: 'Successfully joined the flock',
    flockId: flock._id.toString(),
    flockName: flock.name,
    role: invitation.role
  };
}

/**
 * Remove a member from the flock
 */
export async function removeMember(params: RemoveMemberParams) {
  const { flockId, memberIdToRemove, requesterId } = params;

  if (!requesterId) {
    throw new AuthenticationError('User not authenticated');
  }

  // Find the flock
  const flock = await Flock.findById(new mongoose.Types.ObjectId(flockId))
    .populate('members.user', 'email firstName lastName');

  if (!flock) {
    throw new NotFoundError('Flock not found');
  }

  // Check if the requester is an admin in the flock
  const isAdmin = flock.hasRole(requesterId, 'admin');
  if (!isAdmin && requesterId !== memberIdToRemove) {
    throw new AuthorizationError('Only admins can remove other members');
  }

  // Check if the member exists in the flock
  const memberExists = flock.members.some(member => {
    const memberUser = member.user;
    let memberId: string;
    
    if (typeof memberUser === 'object' && memberUser !== null) {
      if ('_id' in memberUser && memberUser._id) {
        memberId = memberUser._id.toString();
      } else {
        memberId = (memberUser as mongoose.Types.ObjectId).toString();
      }
    } else {
      memberId = String(memberUser);
    }
    
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
    const memberUser = member.user;
    let memberId: string;
    
    if (typeof memberUser === 'object' && memberUser !== null) {
      if ('_id' in memberUser && memberUser._id) {
        memberId = memberUser._id.toString();
      } else {
        memberId = (memberUser as mongoose.Types.ObjectId).toString();
      }
    } else {
      memberId = String(memberUser);
    }
    
    return memberId !== memberIdToRemove;
  });

  await flock.save();

  return {
    message: 'Member removed successfully',
    flockId: flock._id.toString()
  };
}

/**
 * Get all pending invitations for the current user
 */
export async function getUserInvitations(userId: string) {
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

  return {
    message: 'Invitations retrieved successfully',
    invitations
  };
}

/**
 * Cancel a pending invitation
 */
export async function cancelInvitation(params: CancelInvitationParams) {
  const { flockId, email, requesterId } = params;

  if (!requesterId) {
    throw new AuthenticationError('User not authenticated');
  }

  const flock = await Flock.findById(new mongoose.Types.ObjectId(flockId));
  if (!flock) {
    throw new NotFoundError('Flock not found');
  }

  // Check if the requesting user is an admin in the flock
  const isAdmin = flock.hasRole(requesterId, 'admin');
  
  if (!isAdmin) {
    throw new AuthorizationError('Only admins can cancel invitations');
  }

  // Check if the invitation exists
  const invitationExists = flock.hasPendingInvitation(email);
  
  if (!invitationExists) {
    throw new NotFoundError('Invitation not found');
  }

  // Remove the invitation
  flock.pendingInvitations = flock.pendingInvitations.filter(inv => inv.email !== email);
  await flock.save();

  return {
    message: 'Invitation cancelled successfully',
    flockId: flock._id.toString(),
    email
  };
}
