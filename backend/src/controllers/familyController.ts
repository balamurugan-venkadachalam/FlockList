import { Request, Response, NextFunction } from 'express';
import { Family, IFamily } from '../models/Family';
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

interface CreateFamilyBody {
  name: string;
}

interface InviteMemberBody {
  email: string;
  role: 'parent' | 'child';
}

// Create a new family
export const createFamily = async (
  req: AuthRequest<{}, {}, CreateFamilyBody>,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { name } = req.body;
    const userId = req.user?.userId;

    if (!userId) {
      throw new AuthenticationError('User not authenticated');
    }

    // Create new family with the current user as the first parent member
    const family = new Family({
      name,
      members: [{
        user: new mongoose.Types.ObjectId(userId),
        role: 'parent',
        joinedAt: new Date()
      }],
      createdBy: new mongoose.Types.ObjectId(userId)
    });

    await family.save();

    // Populate the user information for the response
    await family.populate('members.user', 'email firstName lastName');
    await family.populate('createdBy', 'email firstName lastName');

    res.status(201).json({
      message: 'Family created successfully',
      family
    });
  } catch (error) {
    next(error);
  }
};

// Get all families for a user
export const getFamilies = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const userId = req.user?.userId;

    if (!userId) {
      throw new AuthenticationError('User not authenticated');
    }

    const families = await Family.find({ 'members.user': new mongoose.Types.ObjectId(userId) })
      .populate('members.user', 'email firstName lastName')
      .populate('createdBy', 'email firstName lastName');

    res.json({
      message: 'Families retrieved successfully',
      families
    });
  } catch (error) {
    next(error);
  }
};

// Get a single family by ID
export const getFamilyById = async (
  req: AuthRequest<{ id: string }>,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { id } = req.params;
    const userId = req.user?.userId;

    console.log(`getFamilyById: Retrieving family ${id} for user ${userId}`);

    if (!userId) {
      throw new AuthenticationError('User not authenticated');
    }

    const family = await Family.findById(new mongoose.Types.ObjectId(id))
      .populate('members.user', 'email firstName lastName')
      .populate('createdBy', 'email firstName lastName');

    if (!family) {
      console.log(`getFamilyById: Family ${id} not found`);
      throw new NotFoundError('Family not found');
    }

    console.log(`getFamilyById: Family found, checking membership`);
    console.log(`getFamilyById: Family members count: ${family.members.length}`);
    console.log(`getFamilyById: Family created by: ${family.createdBy}`);

    // Log members details to debug
    family.members.forEach((member, index) => {
      console.log(`getFamilyById: Member ${index}: ${JSON.stringify({
        userId: member.user._id || member.user,
        userIdType: typeof member.user,
        role: member.role
      })}`);
    });

    // Check if user is a member
    const isMember = family.isMember(userId);
    console.log(`getFamilyById: User ${userId} is member: ${isMember}`);

    if (!isMember) {
      throw new AuthenticationError('Not authorized to view this family');
    }

    res.json({
      message: 'Family retrieved successfully',
      family
    });
  } catch (error) {
    console.error(`getFamilyById error:`, error);
    next(error);
  }
};

// Invite a new member to the family
export const inviteMember = async (
  req: AuthRequest<{ id: string }, {}, InviteMemberBody>,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { id } = req.params;
    const { email, role } = req.body;
    const userId = req.user?.userId;

    console.log(`inviteMember: User ${userId} inviting ${email} to family ${id} with role ${role}`);

    if (!userId) {
      throw new AuthenticationError('User not authenticated');
    }

    const family = await Family.findById(new mongoose.Types.ObjectId(id));
    if (!family) {
      console.log(`inviteMember: Family ${id} not found`);
      throw new NotFoundError('Family not found');
    }

    // Check if the inviting user is a parent in the family
    const hasParentRole = family.hasRole(userId, 'parent');
    console.log(`inviteMember: User ${userId} has parent role: ${hasParentRole}`);
    
    if (!hasParentRole) {
      throw new AuthenticationError('Only parents can invite new members');
    }

    // Check if the email is already a member
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      const isExistingMember = family.isMember(existingUser._id);
      console.log(`inviteMember: User with email ${email} exists, is member: ${isExistingMember}`);
      
      if (isExistingMember) {
        throw new ValidationError('User is already a member of this family');
      }
    }

    // Check if there's already a pending invitation
    if (family.hasPendingInvitation(email)) {
      throw new ValidationError('An invitation is already pending for this email');
    }

    // Generate invitation token
    const token = crypto.randomBytes(32).toString('hex');

    // Add invitation to family
    family.pendingInvitations.push({
      email,
      role,
      token,
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // 7 days from now
    });

    await family.save();

    // Send invitation email
    const invitationLink = `${process.env.FRONTEND_URL}/join-family/${token}`;
    await sendEmail({
      to: email,
      subject: `Invitation to join ${family.name}`,
      text: `You've been invited to join ${family.name} as a ${role}. Click here to accept: ${invitationLink}`,
      html: `
        <h1>Family Invitation</h1>
        <p>You've been invited to join <strong>${family.name}</strong> as a <strong>${role}</strong>.</p>
        <p><a href="${invitationLink}">Click here to accept the invitation</a></p>
        <p>This invitation will expire in 7 days.</p>
      `
    });

    res.json({
      message: 'Invitation sent successfully',
      invitation: {
        email,
        role,
        expiresAt: family.pendingInvitations[family.pendingInvitations.length - 1].expiresAt
      }
    });
  } catch (error) {
    next(error);
  }
};

// Accept a family invitation
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

    // Find the family with this invitation token
    const family = await Family.findOne({
      'pendingInvitations.token': token,
      'pendingInvitations.expiresAt': { $gt: new Date() }
    });

    if (!family) {
      throw new ValidationError('Invalid or expired invitation token');
    }

    const invitation = family.pendingInvitations.find(inv => inv.token === token);
    if (!invitation) {
      throw new ValidationError('Invalid invitation');
    }

    // Get the user's email
    const user = await User.findById(new mongoose.Types.ObjectId(userId));
    if (!user) {
      throw new DatabaseError('User not found');
    }

    // Verify the invitation was for this user
    if (user.email !== invitation.email) {
      throw new ValidationError('This invitation was not meant for you');
    }

    // Add user to family members
    family.members.push({
      user: new mongoose.Types.ObjectId(userId),
      role: invitation.role,
      joinedAt: new Date()
    });

    // Remove the invitation
    family.pendingInvitations = family.pendingInvitations.filter(
      inv => inv.token !== token
    );

    await family.save();

    // Populate member information
    await family.populate('members.user', 'email firstName lastName');
    await family.populate('createdBy', 'email firstName lastName');

    res.json({
      message: 'Successfully joined family',
      family
    });
  } catch (error) {
    next(error);
  }
};

// Remove a member from the family
export const removeMember = async (
  req: AuthRequest<{ id: string; userId: string }>,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { id, userId: memberIdToRemove } = req.params;
    const userId = req.user?.userId;

    if (!userId) {
      throw new AuthenticationError('User not authenticated');
    }

    const family = await Family.findById(new mongoose.Types.ObjectId(id));
    if (!family) {
      throw new NotFoundError('Family not found');
    }

    // Check if the requesting user is a parent
    const userObjectId = new mongoose.Types.ObjectId(userId);
    if (!family.hasRole(userObjectId, 'parent')) {
      throw new AuthenticationError('Only parents can remove family members');
    }

    // Cannot remove the last parent
    const parents = family.members.filter(m => m.role === 'parent');
    const memberObjectId = new mongoose.Types.ObjectId(memberIdToRemove);
    if (parents.length === 1 && parents[0].user.toString() === memberObjectId.toString()) {
      throw new ValidationError('Cannot remove the last parent from the family');
    }

    // Remove the member
    family.members = family.members.filter(
      member => member.user.toString() !== memberObjectId.toString()
    );

    await family.save();

    res.json({
      message: 'Member removed successfully',
      familyId: family._id.toString()
    });
  } catch (error) {
    next(error);
  }
}; 