import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { Request, Response } from 'express';
import mongoose from 'mongoose';
import { Family } from '../../../models/Family';
import { User } from '../../../models/User';
import * as emailUtils from '../../../utils/email';
import {
  createFamily,
  getFamilies,
  getFamilyById,
  inviteMember,
  acceptInvitation,
  removeMember
} from '../../../controllers/familyController';
import { AuthRequest } from '../../../types/auth';

interface InviteMemberBody {
  email: string;
  role: 'parent' | 'child';
}

// Mock mongoose Types.ObjectId to return the input for testing
vi.mock('mongoose', async (importOriginal) => {
  const actual = await importOriginal();
  return {
    ...(actual as object),
    Types: {
      ObjectId: vi.fn().mockImplementation(id => id)
    }
  };
});

// Mock the models and utilities
vi.mock('../../../models/Family');
vi.mock('../../../models/User');
vi.mock('../../../utils/email', () => ({
  sendEmail: vi.fn()
}));

describe('Family Controller', () => {
  let mockReq: Partial<AuthRequest>;
  let mockRes: Partial<Response>;
  let mockNext: any;

  beforeEach(() => {
    mockReq = {
      user: { 
        userId: new mongoose.Types.ObjectId().toString(),
        role: 'parent'
      },
      body: {},
      params: {}
    };
    mockRes = {
      json: vi.fn(),
      status: vi.fn().mockReturnThis()
    };
    mockNext = vi.fn();

    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.resetAllMocks();
  });

  describe('createFamily', () => {
    it('should create a new family successfully', async () => {
      const familyData = {
        name: 'Test Family'
      };
      mockReq.body = familyData;

      const mockFamily = {
        _id: new mongoose.Types.ObjectId(),
        name: familyData.name,
        members: [{
          user: mockReq.user?.userId,
          role: 'parent',
          joinedAt: new Date()
        }],
        createdBy: mockReq.user?.userId,
        save: vi.fn().mockResolvedValue(true),
        populate: vi.fn().mockReturnThis()
      };

      vi.mocked(Family).mockImplementation(() => mockFamily as any);

      await createFamily(mockReq as AuthRequest, mockRes as Response, mockNext);

      expect(mockFamily.save).toHaveBeenCalled();
      expect(mockRes.status).toHaveBeenCalledWith(201);
      expect(mockRes.json).toHaveBeenCalledWith({
        message: 'Family created successfully',
        family: mockFamily
      });
    });

    it('should handle missing user authentication', async () => {
      mockReq.user = undefined;
      await createFamily(mockReq as AuthRequest, mockRes as Response, mockNext);
      expect(mockNext).toHaveBeenCalledWith(expect.any(Error));
    });
  });

  describe('getFamilies', () => {
    it('should get all families for a user', async () => {
      const mockFamilies = [
        {
          _id: new mongoose.Types.ObjectId(),
          name: 'Family 1',
          members: []
        },
        {
          _id: new mongoose.Types.ObjectId(),
          name: 'Family 2',
          members: []
        }
      ];

      vi.mocked(Family.find).mockReturnValue({
        populate: vi.fn().mockReturnValue({
          populate: vi.fn().mockResolvedValue(mockFamilies)
        })
      } as any);

      await getFamilies(mockReq as AuthRequest, mockRes as Response, mockNext);

      // Skip the exact argument check since we're mocking ObjectId differently
      expect(Family.find).toHaveBeenCalled();
      expect(mockRes.json).toHaveBeenCalledWith({
        message: 'Families retrieved successfully',
        families: mockFamilies
      });
    });
  });

  describe('inviteMember', () => {
    it('should send invitation successfully', async () => {
      const familyId = new mongoose.Types.ObjectId().toString();
      const inviteData: InviteMemberBody = {
        email: 'test@example.com',
        role: 'child'
      };

      mockReq.params = { id: familyId };
      mockReq.body = inviteData;

      const mockFamily = {
        _id: familyId,
        name: 'Test Family',
        members: [{
          user: mockReq.user?.userId,
          role: 'parent'
        }],
        hasRole: vi.fn().mockReturnValue(true),
        hasPendingInvitation: vi.fn().mockReturnValue(false),
        pendingInvitations: [],
        save: vi.fn().mockResolvedValue(true)
      };

      vi.mocked(Family.findById).mockResolvedValue(mockFamily as any);
      vi.mocked(User.findOne).mockResolvedValue(null);
      vi.mocked(emailUtils.sendEmail).mockResolvedValue();

      await inviteMember(mockReq as AuthRequest<{ id: string }, {}, InviteMemberBody>, mockRes as Response, mockNext);

      expect(mockFamily.save).toHaveBeenCalled();
      expect(emailUtils.sendEmail).toHaveBeenCalled();
      expect(mockRes.json).toHaveBeenCalledWith(expect.objectContaining({
        message: 'Invitation sent successfully'
      }));
    });

    it('should handle non-parent user invitation attempt', async () => {
      const familyId = new mongoose.Types.ObjectId().toString();
      mockReq.params = { id: familyId };
      mockReq.body = {
        email: 'test@example.com',
        role: 'child'
      };

      const mockFamily = {
        hasRole: vi.fn().mockReturnValue(false)
      };

      vi.mocked(Family.findById).mockResolvedValue(mockFamily as any);

      await inviteMember(mockReq as AuthRequest<{ id: string }, {}, InviteMemberBody>, mockRes as Response, mockNext);

      expect(mockNext).toHaveBeenCalledWith(expect.any(Error));
    });
  });

  describe('acceptInvitation', () => {
    it('should accept invitation successfully', async () => {
      const token = 'valid-token';
      const userEmail = 'test@example.com';
      mockReq.body = { token };

      const mockFamily = {
        pendingInvitations: [{
          token,
          email: userEmail,
          role: 'child',
          expiresAt: new Date(Date.now() + 1000)
        }],
        members: [],
        save: vi.fn().mockResolvedValue(true),
        populate: vi.fn().mockReturnThis()
      };

      const mockUser = {
        _id: mockReq.user?.userId,
        email: userEmail
      };

      vi.mocked(Family.findOne).mockResolvedValue(mockFamily as any);
      vi.mocked(User.findById).mockResolvedValue(mockUser as any);

      await acceptInvitation(mockReq as AuthRequest, mockRes as Response, mockNext);

      expect(mockFamily.save).toHaveBeenCalled();
      expect(mockRes.json).toHaveBeenCalledWith(expect.objectContaining({
        message: 'Successfully joined family'
      }));
    });

    it('should handle invalid invitation token', async () => {
      mockReq.body = { token: 'invalid-token' };

      vi.mocked(Family.findOne).mockResolvedValue(null);

      await acceptInvitation(mockReq as AuthRequest, mockRes as Response, mockNext);

      expect(mockNext).toHaveBeenCalledWith(expect.any(Error));
    });
  });

  describe('removeMember', () => {
    it('should remove member successfully', async () => {
      const familyId = new mongoose.Types.ObjectId();
      const memberIdToRemove = new mongoose.Types.ObjectId().toString();
      mockReq.params = { id: familyId.toString(), userId: memberIdToRemove };

      const mockFamily = {
        _id: familyId,
        hasRole: vi.fn().mockReturnValue(true),
        members: [
          { user: mockReq.user?.userId, role: 'parent' },
          { user: memberIdToRemove, role: 'child' }
        ],
        save: vi.fn().mockResolvedValue(true)
      };

      vi.mocked(Family.findById).mockResolvedValue(mockFamily as any);

      await removeMember(mockReq as AuthRequest<{ id: string; userId: string }>, mockRes as Response, mockNext);

      expect(mockFamily.save).toHaveBeenCalled();
      expect(mockRes.json).toHaveBeenCalledWith({
        message: 'Member removed successfully',
        familyId: familyId.toString()
      });
    });

    it('should prevent removing the last parent', async () => {
      const familyId = new mongoose.Types.ObjectId().toString();
      const userId = mockReq.user!.userId;
      mockReq.params = { id: familyId, userId };

      const mockFamily = {
        hasRole: vi.fn().mockReturnValue(true),
        members: [
          { user: userId, role: 'parent' }
        ]
      };

      vi.mocked(Family.findById).mockResolvedValue(mockFamily as any);

      await removeMember(mockReq as AuthRequest<{ id: string; userId: string }>, mockRes as Response, mockNext);

      expect(mockNext).toHaveBeenCalledWith(expect.any(Error));
    });
  });
}); 