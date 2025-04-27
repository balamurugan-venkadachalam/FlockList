import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import mongoose from 'mongoose';

// Mock dependencies before importing them
vi.mock('../../../models/Flock', () => {
  // Create a mock Flock constructor
  const FlockMock = vi.fn().mockImplementation((data) => {
    const mockInstance = {
      ...data,
      save: vi.fn().mockResolvedValue(true),
      populate: vi.fn().mockReturnThis(),
      isMember: vi.fn().mockReturnValue(true),
      hasRole: vi.fn().mockReturnValue(true),
      hasPendingInvitation: vi.fn().mockReturnValue(false)
    };
    return mockInstance;
  });
  
  // Type assertion to prevent TypeScript errors
  Object.assign(FlockMock, {
    findById: vi.fn(),
    findOne: vi.fn(),
    find: vi.fn()
  });
  
  return { Flock: FlockMock };
});

vi.mock('../../../models/User', () => {
  // Create a mock User constructor
  const UserMock = vi.fn();
  
  // Type assertion to prevent TypeScript errors
  Object.assign(UserMock, {
    findById: vi.fn(),
    findOne: vi.fn()
  });
  
  return { User: UserMock };
});

vi.mock('../../../utils/email', () => ({
  sendEmail: vi.fn().mockResolvedValue(true)
}));

// Mock the crypto module
vi.mock('crypto', () => {
  return {
    default: {
      randomBytes: vi.fn().mockReturnValue({
        toString: vi.fn().mockReturnValue('mock-token')
      })
    },
    randomBytes: vi.fn().mockReturnValue({
      toString: vi.fn().mockReturnValue('mock-token')
    })
  };
});

// Import mocked modules after mocking
import * as flockService from '../../../services/flockService';
import { Flock } from '../../../models/Flock';
import { User } from '../../../models/User';
import { sendEmail } from '../../../utils/email';
import {
  ValidationError,
  AuthenticationError,
  NotFoundError,
  DatabaseError,
  AuthorizationError
} from '../../../types/errors';

const mockFlockDoc = (overrides: any = {}) => {
  const mockDoc = {
    _id: new mongoose.Types.ObjectId(),
    name: 'Test Flock',
    members: [
      {
        user: new mongoose.Types.ObjectId('507f1f77bcf86cd799439011'),
        role: 'admin',
        joinedAt: new Date()
      }
    ],
    pendingInvitations: [],
    createdBy: new mongoose.Types.ObjectId('507f1f77bcf86cd799439011'),
    createdAt: new Date(),
    updatedAt: new Date(),
    save: vi.fn().mockResolvedValue(true),
    populate: vi.fn().mockReturnThis(),
    isMember: vi.fn().mockReturnValue(true),
    hasRole: vi.fn().mockReturnValue(true),
    hasPendingInvitation: vi.fn().mockReturnValue(false)
  };
  
  return Object.assign({}, mockDoc, overrides);
};

const mockUserDoc = (overrides: any = {}) => ({
  _id: new mongoose.Types.ObjectId('507f1f77bcf86cd799439011'),
  email: 'test@example.com',
  firstName: 'Test',
  lastName: 'User',
  ...overrides
});

describe('FlockService', () => {
  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('createFlock', () => {
    it('should create and save a new flock', async () => {
      // Setup
      const save = vi.fn().mockResolvedValue(true);
      const mockFlock = { ...mockFlockDoc(), save };
      
      // Mock Flock constructor
      (Flock as any).mockImplementation(() => mockFlock);
      
      // Execute
      const result = await flockService.createFlock({
        name: 'Test Flock',
        userId: '507f1f77bcf86cd799439011'
      });
      
      // Assert
      expect(Flock).toHaveBeenCalled();
      expect(save).toHaveBeenCalled();
      expect(result).toEqual(mockFlock);
    });
    
    it('should throw ValidationError for missing name', async () => {
      await expect(flockService.createFlock({ 
        name: '', 
        userId: '507f1f77bcf86cd799439011' 
      })).rejects.toThrow(ValidationError);
    });
    
    it('should throw AuthenticationError for missing userId', async () => {
      await expect(flockService.createFlock({ 
        name: 'Test Flock', 
        userId: '' 
      })).rejects.toThrow(AuthenticationError);
    });
  });

  describe('getFlocks', () => {
    it('should return flocks for a user', async () => {
      // Setup
      const mockFlocks = [mockFlockDoc()];
      const mockPopulate = vi.fn().mockReturnThis();
      mockPopulate.mockImplementation(() => ({
        populate: vi.fn().mockResolvedValue(mockFlocks)
      }));
      (Flock.find as any).mockReturnValue({
        populate: mockPopulate
      });
      
      // Execute
      const result = await flockService.getFlocks('507f1f77bcf86cd799439011');
      
      // Assert
      expect(Flock.find).toHaveBeenCalled();
      expect(result).toEqual(mockFlocks);
    });
    
    it('should throw AuthenticationError for missing userId', async () => {
      await expect(flockService.getFlocks('')).rejects.toThrow(AuthenticationError);
    });
  });

  describe('getFlockById', () => {
    it('should return a flock if user is a member', async () => {
      // Setup
      const mockFlock = mockFlockDoc();
      const mockPopulate = vi.fn().mockReturnThis();
      mockPopulate.mockImplementation(() => ({
        populate: vi.fn().mockResolvedValue(mockFlock)
      }));
      (Flock.findById as any).mockReturnValue({
        populate: mockPopulate
      });
      
      // Mock the isMember method
      mockFlock.members.some = vi.fn().mockReturnValue(true);
      
      // Execute
      const result = await flockService.getFlockById(
        '507f1f77bcf86cd799439011', 
        '507f1f77bcf86cd799439011'
      );
      
      // Assert
      expect(Flock.findById).toHaveBeenCalled();
      expect(result).toEqual(mockFlock);
    });
    
    it('should throw NotFoundError if flock not found', async () => {
      // Setup
      const mockPopulate = vi.fn().mockReturnThis();
      mockPopulate.mockImplementation(() => ({
        populate: vi.fn().mockResolvedValue(null)
      }));
      (Flock.findById as any).mockReturnValue({
        populate: mockPopulate
      });
      
      // Execute & Assert
      await expect(flockService.getFlockById(
        '507f1f77bcf86cd799439011', 
        '507f1f77bcf86cd799439011'
      )).rejects.toThrow(NotFoundError);
    });
    
    it('should throw AuthorizationError if user is not a member', async () => {
      // Setup
      const mockFlock = mockFlockDoc({
        members: [{
          user: new mongoose.Types.ObjectId('507f1f77bcf86cd799439022'), // Different user
          role: 'admin',
          joinedAt: new Date()
        }]
      });
      
      const mockPopulate = vi.fn().mockReturnThis();
      mockPopulate.mockImplementation(() => ({
        populate: vi.fn().mockResolvedValue(mockFlock)
      }));
      (Flock.findById as any).mockReturnValue({
        populate: mockPopulate
      });
      
      // Mock the members.some method to return false (user is not a member)
      mockFlock.members.some = vi.fn().mockReturnValue(false);
      
      // Execute & Assert
      await expect(flockService.getFlockById(
        '507f1f77bcf86cd799439011', 
        '507f1f77bcf86cd799439033' // Different user ID
      )).rejects.toThrow(AuthorizationError);
    });
  });

  describe('inviteMember', () => {
    it('should create and send an invitation', async () => {
      // Setup
      const save = vi.fn().mockResolvedValue(true);
      const mockFlock = mockFlockDoc({ save });
      
      (Flock.findById as any).mockResolvedValue(mockFlock);
      (User.findById as any).mockResolvedValue(mockUserDoc());
      (User.findOne as any).mockResolvedValue(null); // User not found, so not already a member
      
      mockFlock.hasRole.mockReturnValue(true); // User is admin
      mockFlock.hasPendingInvitation.mockReturnValue(false); // No pending invitation
      
      // Execute
      const result = await flockService.inviteMember({
        flockId: '507f1f77bcf86cd799439011',
        email: 'new@example.com',
        role: 'member',
        inviterId: '507f1f77bcf86cd799439011'
      });
      
      // Assert
      expect(Flock.findById).toHaveBeenCalled();
      expect(mockFlock.hasRole).toHaveBeenCalled();
      expect(mockFlock.hasPendingInvitation).toHaveBeenCalled();
      expect(save).toHaveBeenCalled();
      expect(sendEmail).toHaveBeenCalled();
      expect(result.email).toBe('new@example.com');
      expect(result.role).toBe('member');
    });
    
    it('should throw ValidationError for invalid email', async () => {
      await expect(flockService.inviteMember({
        flockId: '507f1f77bcf86cd799439011',
        email: 'invalid-email',
        role: 'member',
        inviterId: '507f1f77bcf86cd799439011'
      })).rejects.toThrow(ValidationError);
    });
    
    it('should throw NotFoundError if flock not found', async () => {
      // Setup
      (Flock.findById as any).mockResolvedValue(null);
      
      // Execute & Assert
      await expect(flockService.inviteMember({
        flockId: '507f1f77bcf86cd799439011',
        email: 'new@example.com',
        role: 'member',
        inviterId: '507f1f77bcf86cd799439011'
      })).rejects.toThrow(NotFoundError);
    });
    
    it('should throw AuthorizationError if inviter is not admin', async () => {
      // Setup
      const mockFlock = mockFlockDoc();
      (Flock.findById as any).mockResolvedValue(mockFlock);
      mockFlock.hasRole.mockReturnValue(false); // User is not admin
      
      // Execute & Assert
      await expect(flockService.inviteMember({
        flockId: '507f1f77bcf86cd799439011',
        email: 'new@example.com',
        role: 'member',
        inviterId: '507f1f77bcf86cd799439011'
      })).rejects.toThrow(AuthorizationError);
    });
    
    it('should throw ValidationError if user is already a member', async () => {
      // Setup
      const mockFlock = mockFlockDoc();
      const existingUser = mockUserDoc();
      
      (Flock.findById as any).mockResolvedValue(mockFlock);
      (User.findOne as any).mockResolvedValue(existingUser);
      
      mockFlock.hasRole.mockReturnValue(true); // User is admin
      mockFlock.members.some = vi.fn().mockReturnValue(true); // User is already a member
      
      // Execute & Assert
      await expect(flockService.inviteMember({
        flockId: '507f1f77bcf86cd799439011',
        email: 'test@example.com',
        role: 'member',
        inviterId: '507f1f77bcf86cd799439011'
      })).rejects.toThrow(ValidationError);
    });
    
    it('should throw ValidationError if invitation already exists', async () => {
      // Setup
      const mockFlock = mockFlockDoc();
      
      (Flock.findById as any).mockResolvedValue(mockFlock);
      (User.findOne as any).mockResolvedValue(null);
      
      mockFlock.hasRole.mockReturnValue(true); // User is admin
      mockFlock.hasPendingInvitation.mockReturnValue(true); // Invitation already exists
      
      // Execute & Assert
      await expect(flockService.inviteMember({
        flockId: '507f1f77bcf86cd799439011',
        email: 'new@example.com',
        role: 'member',
        inviterId: '507f1f77bcf86cd799439011'
      })).rejects.toThrow(ValidationError);
    });
  });

  describe('acceptInvitation', () => {
    it('should accept an invitation and add user to flock', async () => {
      // Setup
      const save = vi.fn().mockResolvedValue(true);
      const mockFlock = mockFlockDoc({
        pendingInvitations: [{
          email: 'test@example.com',
          role: 'member',
          token: 'mock-token',
          expiresAt: new Date(Date.now() + 86400000) // 1 day in the future
        }],
        save
      });
      
      (Flock.findOne as any).mockResolvedValue(mockFlock);
      (User.findById as any).mockResolvedValue(mockUserDoc());
      
      // Mock the members.some method to return false (user is not already a member)
      mockFlock.members.some = vi.fn().mockReturnValue(false);
      
      // Execute
      const result = await flockService.acceptInvitation({
        token: 'mock-token',
        userId: '507f1f77bcf86cd799439011'
      });
      
      // Assert
      expect(Flock.findOne).toHaveBeenCalled();
      expect(User.findById).toHaveBeenCalled();
      expect(save).toHaveBeenCalled();
      expect(result.message).toContain('Successfully joined');
    });
    
    it('should throw NotFoundError if invitation not found', async () => {
      // Setup
      (Flock.findOne as any).mockResolvedValue(null);
      
      // Execute & Assert
      await expect(flockService.acceptInvitation({
        token: 'invalid-token',
        userId: '507f1f77bcf86cd799439011'
      })).rejects.toThrow(NotFoundError);
    });
    
    it('should throw AuthorizationError if invitation email does not match user', async () => {
      // Setup
      const mockFlock = mockFlockDoc({
        pendingInvitations: [{
          email: 'different@example.com', // Different email
          role: 'member',
          token: 'mock-token',
          expiresAt: new Date(Date.now() + 86400000)
        }]
      });
      
      (Flock.findOne as any).mockResolvedValue(mockFlock);
      (User.findById as any).mockResolvedValue(mockUserDoc());
      
      // Execute & Assert
      await expect(flockService.acceptInvitation({
        token: 'mock-token',
        userId: '507f1f77bcf86cd799439011'
      })).rejects.toThrow(AuthorizationError);
    });
    
    it('should throw ValidationError if user is already a member', async () => {
      // Setup
      const save = vi.fn().mockResolvedValue(true);
      const mockFlock = mockFlockDoc({
        pendingInvitations: [{
          email: 'test@example.com',
          role: 'member',
          token: 'mock-token',
          expiresAt: new Date(Date.now() + 86400000)
        }],
        save
      });
      
      (Flock.findOne as any).mockResolvedValue(mockFlock);
      (User.findById as any).mockResolvedValue(mockUserDoc());
      
      // Mock the members.some method to return true (user is already a member)
      mockFlock.members.some = vi.fn().mockReturnValue(true);
      
      // Execute & Assert
      await expect(flockService.acceptInvitation({
        token: 'mock-token',
        userId: '507f1f77bcf86cd799439011'
      })).rejects.toThrow(ValidationError);
    });
  });

  describe('removeMember', () => {
    it('should remove a member from the flock', async () => {
      // Setup
      const save = vi.fn().mockResolvedValue(true);
      const mockFlock = mockFlockDoc({
        save,
        members: [
          {
            user: new mongoose.Types.ObjectId('507f1f77bcf86cd799439011'),
            role: 'admin',
            joinedAt: new Date()
          },
          {
            user: new mongoose.Types.ObjectId('507f1f77bcf86cd799439013'),
            role: 'admin',
            joinedAt: new Date()
          },
          {
            user: new mongoose.Types.ObjectId('507f1f77bcf86cd799439022'),
            role: 'member',
            joinedAt: new Date()
          }
        ],
        hasRole: vi.fn().mockReturnValue(true) // Explicitly set hasRole
      });

      const mockPopulate = vi.fn().mockResolvedValue(mockFlock);
      
      //Directly mock findById to return the mockFlock
      (Flock.findById as any).mockImplementation(() => ({
        populate: vi.fn().mockResolvedValue(mockFlock)
      }))


      
      mockFlock.members.some = vi.fn().mockReturnValue(true); // Member exists
      
      // Mock the filter method to properly remove a member
      mockFlock.members.filter = vi.fn().mockReturnValue([
        {
          user: new mongoose.Types.ObjectId('507f1f77bcf86cd799439011'),
          role: 'admin',
          joinedAt: new Date()
        },
        {
          user: new mongoose.Types.ObjectId('507f1f77bcf86cd799439013'),
          role: 'admin',
          joinedAt: new Date()
        },
      ]);
      
      // Execute
      const result = await flockService.removeMember({
        flockId: '507f1f77bcf86cd799439011',
        memberIdToRemove: '507f1f77bcf86cd799439022',
        requesterId: '507f1f77bcf86cd799439011'
      });
      
      // Assert
      expect(Flock.findById).toHaveBeenCalled();
      expect(mockFlock.hasRole).toHaveBeenCalled();
      expect(save).toHaveBeenCalled();
      expect(result.message).toContain('removed successfully');
    });
    
    it('should throw NotFoundError if flock not found', async () => {
      // Setup
      (Flock.findById as any).mockReturnValue({
        populate: vi.fn().mockResolvedValue(null)
      });
      
      // Execute & Assert
      await expect(flockService.removeMember({
        flockId: '507f1f77bcf86cd799439011',
        memberIdToRemove: '507f1f77bcf86cd799439022',
        requesterId: '507f1f77bcf86cd799439011'
      })).rejects.toThrow(NotFoundError);
    });
    
    it('should throw AuthorizationError if requester is not admin', async () => {
      // Setup
      const mockFlock = mockFlockDoc();
      
      (Flock.findById as any).mockReturnValue({
        populate: vi.fn().mockResolvedValue(mockFlock)
      });
      
      mockFlock.hasRole.mockReturnValue(false); // Requester is not admin
      
      // Execute & Assert
      await expect(flockService.removeMember({
        flockId: '507f1f77bcf86cd799439011',
        memberIdToRemove: '507f1f77bcf86cd799439022',
        requesterId: '507f1f77bcf86cd799439033' // Different user
      })).rejects.toThrow(AuthorizationError);
    });
    
    it('should throw NotFoundError if member not found', async () => {
      // Setup
      const mockFlock = mockFlockDoc();
      
      (Flock.findById as any).mockReturnValue({
        populate: vi.fn().mockResolvedValue(mockFlock)
      });
      
      mockFlock.hasRole.mockReturnValue(true); // Requester is admin
      mockFlock.members.some = vi.fn().mockReturnValue(false); // Member does not exist
      
      // Execute & Assert
      await expect(flockService.removeMember({
        flockId: '507f1f77bcf86cd799439011',
        memberIdToRemove: 'non-existent-id',
        requesterId: '507f1f77bcf86cd799439011'
      })).rejects.toThrow(NotFoundError);
    });
    
    it('should throw ValidationError if removing the last admin', async () => {
      // Setup
      const mockFlock = mockFlockDoc({
        members: [{
          user: new mongoose.Types.ObjectId('507f1f77bcf86cd799439011'),
          role: 'admin',
          joinedAt: new Date()
        }],
        hasRole: vi.fn().mockImplementation((userId: string, role: string) => {
          // Return true if checking if the member to remove is admin
          if (userId === '507f1f77bcf86cd799439011' && role === 'admin') {
            return true;
          }
          return false;
        })
      });
      
      // Directly mock findById to return the mockFlock
      (Flock.findById as any).mockReturnValue({
        populate: vi.fn().mockResolvedValue(mockFlock)
      });
      
      mockFlock.members.some = vi.fn().mockReturnValue(true); // Member exists
      mockFlock.members.filter = vi.fn().mockReturnValue([{ role: 'admin' }]); // Only one admin
      
      // Execute & Assert
      await expect(flockService.removeMember({
        flockId: '507f1f77bcf86cd799439011',
        memberIdToRemove: '507f1f77bcf86cd799439011', // Removing the only admin
        requesterId: '507f1f77bcf86cd799439011'
      })).rejects.toThrow(ValidationError);
    });
  });

  describe('getUserInvitations', () => {
    it('should return all pending invitations for a user', async () => {
      // Setup
      const mockUser = mockUserDoc();
      const mockFlocks = [
        mockFlockDoc({
          name: 'Flock 1',
          pendingInvitations: [{
            email: 'test@example.com',
            role: 'member',
            token: 'token-1',
            expiresAt: new Date(Date.now() + 86400000)
          }]
        }),
        mockFlockDoc({
          name: 'Flock 2',
          pendingInvitations: [{
            email: 'test@example.com',
            role: 'admin',
            token: 'token-2',
            expiresAt: new Date(Date.now() + 86400000)
          }]
        })
      ];
      
      (User.findById as any).mockResolvedValue(mockUser);
      const mockSelect = vi.fn().mockResolvedValue(mockFlocks);
      (Flock.find as any).mockReturnValue({
        select: mockSelect
      });
      
      // Execute
      const result = await flockService.getUserInvitations('507f1f77bcf86cd799439011');
      
      // Assert
      expect(User.findById).toHaveBeenCalled();
      expect(Flock.find).toHaveBeenCalled();
      expect(result.invitations).toHaveLength(2);
      expect(result.invitations[0].flockName).toBe('Flock 1');
      expect(result.invitations[1].flockName).toBe('Flock 2');
    });
    
    it('should throw AuthenticationError for missing userId', async () => {
      await expect(flockService.getUserInvitations('')).rejects.toThrow(AuthenticationError);
    });
    
    it('should throw DatabaseError if user not found', async () => {
      // Setup
      (User.findById as any).mockResolvedValue(null);
      
      // Execute & Assert
      await expect(flockService.getUserInvitations('507f1f77bcf86cd799439011')).rejects.toThrow(DatabaseError);
    });
  });

  describe('cancelInvitation', () => {
    it('should cancel a pending invitation', async () => {
      // Setup
      const save = vi.fn().mockResolvedValue(true);
      const mockFlock = mockFlockDoc({
        pendingInvitations: [{
          email: 'test@example.com',
          role: 'member',
          token: 'mock-token',
          expiresAt: new Date(Date.now() + 86400000)
        }],
        save
      });
      
      (Flock.findById as any).mockResolvedValue(mockFlock);
      mockFlock.hasRole.mockReturnValue(true); // Requester is admin
      mockFlock.hasPendingInvitation.mockReturnValue(true); // Invitation exists
      
      // Execute
      const result = await flockService.cancelInvitation({
        flockId: '507f1f77bcf86cd799439011',
        email: 'test@example.com',
        requesterId: '507f1f77bcf86cd799439011'
      });
      
      // Assert
      expect(Flock.findById).toHaveBeenCalled();
      expect(mockFlock.hasRole).toHaveBeenCalled();
      expect(mockFlock.hasPendingInvitation).toHaveBeenCalled();
      expect(save).toHaveBeenCalled();
      expect(result.message).toContain('cancelled successfully');
    });
    
    it('should throw NotFoundError if flock not found', async () => {
      // Setup
      (Flock.findById as any).mockResolvedValue(null);
      
      // Execute & Assert
      await expect(flockService.cancelInvitation({
        flockId: '507f1f77bcf86cd799439011',
        email: 'test@example.com',
        requesterId: '507f1f77bcf86cd799439011'
      })).rejects.toThrow(NotFoundError);
    });
    
    it('should throw AuthorizationError if requester is not admin', async () => {
      // Setup
      const mockFlock = mockFlockDoc();
      
      (Flock.findById as any).mockResolvedValue(mockFlock);
      mockFlock.hasRole.mockReturnValue(false); // Requester is not admin
      
      // Execute & Assert
      await expect(flockService.cancelInvitation({
        flockId: '507f1f77bcf86cd799439011',
        email: 'test@example.com',
        requesterId: '507f1f77bcf86cd799439033' // Different user
      })).rejects.toThrow(AuthorizationError);
    });
    
    it('should throw NotFoundError if invitation not found', async () => {
      // Setup
      const mockFlock = mockFlockDoc();
      
      (Flock.findById as any).mockResolvedValue(mockFlock);
      mockFlock.hasRole.mockReturnValue(true); // Requester is admin
      mockFlock.hasPendingInvitation.mockReturnValue(false); // Invitation does not exist
      
      // Execute & Assert
      await expect(flockService.cancelInvitation({
        flockId: '507f1f77bcf86cd799439011',
        email: 'non-existent@example.com',
        requesterId: '507f1f77bcf86cd799439011'
      })).rejects.toThrow(NotFoundError);
    });
  });
});
