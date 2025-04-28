import { Response, NextFunction } from 'express';
import { AuthRequest } from '../types/auth';
import * as flockService from '../services/flockService';
import { HTTP_STATUS } from '../constants/httpStatus';

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
    const userId = req.user.userId;
    
    const flock = await flockService.createFlock({
      name,
      userId
    });

    res.status(HTTP_STATUS.CREATED).json({
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
    const userId = req.user.userId;
    
    const flocks = await flockService.getFlocks(userId);

    // Return the flocks array directly to match OpenAPI spec
    res.status(HTTP_STATUS.OK).json(flocks);
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
    const userId = req.user.userId;
    
    console.log(`getFlockById: Retrieving flock ${id} for user ${userId}`);

    const flock = await flockService.getFlockById(id, userId);

    res.status(HTTP_STATUS.OK).json({
      message: 'Flock retrieved successfully',
      flock
    });
  } catch (error) {
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
    const userId = req.user.userId;

    console.log(`inviteMember: User ${userId} inviting ${email} to flock ${id} with role ${role}`);

    const result = await flockService.inviteMember({
      flockId: id,
      email,
      role,
      inviterId: userId
    });

    res.status(HTTP_STATUS.OK).json(result);
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
    const userId = req.user.userId;

    console.log(`acceptInvitation: User ${userId} accepting invitation with token ${token}`);

    const result = await flockService.acceptInvitation({
      token,
      userId
    });

    res.status(HTTP_STATUS.OK).json(result);
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
    const userId = req.user.userId;

    console.log(`removeMember: User ${userId} removing member ${memberIdToRemove} from flock ${id}`);

    const result = await flockService.removeMember({
      flockId: id,
      memberIdToRemove,
      requesterId: userId
    });

    res.status(HTTP_STATUS.OK).json(result);
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
    const userId = req.user.userId;

    const result = await flockService.getUserInvitations(userId);

    res.status(HTTP_STATUS.OK).json(result);
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
    const userId = req.user.userId;

    console.log(`cancelInvitation: User ${userId} canceling invitation for ${email} in flock ${id}`);

    const result = await flockService.cancelInvitation({
      flockId: id,
      email,
      requesterId: userId
    });

    res.status(HTTP_STATUS.OK).json(result);
  } catch (error) {
    console.error('cancelInvitation error:', error);
    next(error);
  }
}; 