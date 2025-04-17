import { Request, Response } from 'express';
import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';
import * as familyController from '../../../controllers/familyController';
import { Family } from '../../../models/Family';
import { User } from '../../../models/User';
import { AuthRequest } from '../../../types/auth';
import { sendEmail } from '../../../utils/email';

// Mock the email sending functionality
vi.mock('../../../utils/email', () => ({
  sendEmail: vi.fn().mockResolvedValue(true)
}));

describe('Family Controller - Integration Tests', () => {
  let mongoServer: MongoMemoryServer;
  
  // Test users
  const parentUser = {
    _id: new mongoose.Types.ObjectId(),
    userId: '',
    email: 'parent@example.com',
    firstName: 'Parent',
    lastName: 'User',
    role: 'parent'
  };
  
  const childUser = {
    _id: new mongoose.Types.ObjectId(),
    userId: '',
    email: 'child@example.com',
    firstName: 'Child',
    lastName: 'User',
    role: 'child'
  };
  
  const nonMemberUser = {
    _id: new mongoose.Types.ObjectId(),
    userId: '',
    email: 'nonmember@example.com',
    firstName: 'Non',
    lastName: 'Member',
    role: 'parent'
  };

  // Test family
  let testFamily: any;
  
  // Setup mock request and response
  let mockRequest: Partial<AuthRequest>;
  let mockResponse: Partial<Response>;
  let mockNext: ReturnType<typeof vi.fn>;

  beforeAll(async () => {
    // Setup MongoDB Memory Server
    mongoServer = await MongoMemoryServer.create();
    const uri = mongoServer.getUri();
    await mongoose.connect(uri);

    // Set user IDs
    parentUser.userId = parentUser._id.toString();
    childUser.userId = childUser._id.toString();
    nonMemberUser.userId = nonMemberUser._id.toString();

    // Create test users in the database
    await User.create({
      _id: parentUser._id,
      email: parentUser.email,
      firstName: parentUser.firstName,
      lastName: parentUser.lastName,
      password: 'password123',
      role: parentUser.role,
    });

    await User.create({
      _id: childUser._id,
      email: childUser.email,
      firstName: childUser.firstName,
      lastName: childUser.lastName,
      password: 'password123',
      role: childUser.role,
    });
    
    await User.create({
      _id: nonMemberUser._id,
      email: nonMemberUser.email,
      firstName: nonMemberUser.firstName,
      lastName: nonMemberUser.lastName,
      password: 'password123',
      role: nonMemberUser.role,
    });
  });

  afterAll(async () => {
    await mongoose.disconnect();
    await mongoServer.stop();
  });

  beforeEach(() => {
    mockResponse = {
      status: vi.fn().mockReturnThis(),
      json: vi.fn(),
    };
    mockNext = vi.fn();
  });

  afterEach(async () => {
    // Clean up families after each test
    await Family.deleteMany({});
    vi.clearAllMocks();
  });

  describe('createFamily', () => {
    it('should create a new family with the current user as parent', async () => {
      mockRequest = {
        user: { userId: parentUser.userId },
        body: { name: 'Test Family' },
      } as AuthRequest;

      await familyController.createFamily(
        mockRequest as AuthRequest,
        mockResponse as Response,
        mockNext
      );

      expect(mockResponse.status).toHaveBeenCalledWith(201);
      expect(mockResponse.json).toHaveBeenCalled();
      
      const jsonFn = mockResponse.json as ReturnType<typeof vi.fn>;
      const responseData = jsonFn.mock.calls[0][0];
      expect(responseData.message).toBe('Family created successfully');
      expect(responseData.family.name).toBe('Test Family');
      expect(responseData.family.members.length).toBe(1);
      expect(responseData.family.members[0].role).toBe('parent');
      
      // Save the created family for later tests
      testFamily = responseData.family;
    });

    it('should throw an error if user is not authenticated', async () => {
      mockRequest = {
        user: undefined,
        body: { name: 'Test Family' },
      } as AuthRequest;

      await familyController.createFamily(
        mockRequest as AuthRequest,
        mockResponse as Response,
        mockNext
      );

      expect(mockNext).toHaveBeenCalled();
      const error = mockNext.mock.calls[0][0];
      expect(error.message).toBe('User not authenticated');
      expect(error.statusCode).toBe(401);
    });
  });

  describe('getFamilies', () => {
    beforeEach(async () => {
      // Create a test family for the parent user
      const family = new Family({
        name: 'Parent Family',
        members: [{
          user: parentUser._id,
          role: 'parent',
          joinedAt: new Date()
        }],
        createdBy: parentUser._id
      });
      
      testFamily = await family.save();
    });

    it('should return all families for a user', async () => {
      mockRequest = {
        user: { userId: parentUser.userId },
      } as AuthRequest;

      await familyController.getFamilies(
        mockRequest as AuthRequest,
        mockResponse as Response,
        mockNext
      );

      expect(mockResponse.json).toHaveBeenCalled();
      const jsonFn = mockResponse.json as ReturnType<typeof vi.fn>;
      const responseData = jsonFn.mock.calls[0][0];
      expect(responseData.message).toBe('Families retrieved successfully');
      expect(responseData.families.length).toBe(1);
      expect(responseData.families[0].name).toBe('Parent Family');
    });

    it('should return empty array if user has no families', async () => {
      mockRequest = {
        user: { userId: nonMemberUser.userId },
      } as AuthRequest;

      await familyController.getFamilies(
        mockRequest as AuthRequest,
        mockResponse as Response,
        mockNext
      );

      expect(mockResponse.json).toHaveBeenCalled();
      const jsonFn = mockResponse.json as ReturnType<typeof vi.fn>;
      const responseData = jsonFn.mock.calls[0][0];
      expect(responseData.message).toBe('Families retrieved successfully');
      expect(responseData.families.length).toBe(0);
    });

    it('should throw an error if user is not authenticated', async () => {
      mockRequest = {
        user: undefined,
      } as AuthRequest;

      await familyController.getFamilies(
        mockRequest as AuthRequest,
        mockResponse as Response,
        mockNext
      );

      expect(mockNext).toHaveBeenCalled();
      const error = mockNext.mock.calls[0][0];
      expect(error.message).toBe('User not authenticated');
      expect(error.statusCode).toBe(401);
    });
  });

  describe('getFamilyById', () => {
    beforeEach(async () => {
      // Create a test family with both parent and child users
      const family = new Family({
        name: 'Test Family',
        members: [
          {
            user: parentUser._id,
            role: 'parent',
            joinedAt: new Date()
          },
          {
            user: childUser._id,
            role: 'child',
            joinedAt: new Date()
          }
        ],
        createdBy: parentUser._id
      });
      
      testFamily = await family.save();
    });

    it('should return family details if user is a member', async () => {
      mockRequest = {
        user: { userId: parentUser.userId },
        params: { id: testFamily._id.toString() },
      } as unknown as AuthRequest;

      await familyController.getFamilyById(
        mockRequest as AuthRequest,
        mockResponse as Response,
        mockNext
      );

      expect(mockResponse.json).toHaveBeenCalled();
      const jsonFn = mockResponse.json as ReturnType<typeof vi.fn>;
      const responseData = jsonFn.mock.calls[0][0];
      expect(responseData.message).toBe('Family retrieved successfully');
      expect(responseData.family._id.toString()).toBe(testFamily._id.toString());
      expect(responseData.family.name).toBe('Test Family');
      expect(responseData.family.members.length).toBe(2);
    });

    it('should throw an error if user is not a member of the family', async () => {
      mockRequest = {
        user: { userId: nonMemberUser.userId },
        params: { id: testFamily._id.toString() },
      } as unknown as AuthRequest;

      await familyController.getFamilyById(
        mockRequest as AuthRequest,
        mockResponse as Response,
        mockNext
      );

      expect(mockNext).toHaveBeenCalled();
      const error = mockNext.mock.calls[0][0];
      expect(error.message).toBe('Not authorized to view this family');
      expect(error.statusCode).toBe(401);
    });

    it('should throw an error if family is not found', async () => {
      const nonExistentId = new mongoose.Types.ObjectId();
      mockRequest = {
        user: { userId: parentUser.userId },
        params: { id: nonExistentId.toString() },
      } as unknown as AuthRequest;

      await familyController.getFamilyById(
        mockRequest as AuthRequest,
        mockResponse as Response,
        mockNext
      );

      expect(mockNext).toHaveBeenCalled();
      const error = mockNext.mock.calls[0][0];
      expect(error.message).toBe('Family not found');
      expect(error.statusCode).toBe(404);
    });
  });

  describe('inviteMember', () => {
    beforeEach(async () => {
      // Create a test family with parent user
      const family = new Family({
        name: 'Invitation Test Family',
        members: [
          {
            user: parentUser._id,
            role: 'parent',
            joinedAt: new Date()
          }
        ],
        createdBy: parentUser._id
      });
      
      testFamily = await family.save();
    });

    it('should send an invitation to a new email', async () => {
      mockRequest = {
        user: { userId: parentUser.userId },
        params: { id: testFamily._id.toString() },
        body: { 
          email: 'newinvite@example.com',
          role: 'child'
        },
      } as unknown as AuthRequest;

      await familyController.inviteMember(
        mockRequest as AuthRequest,
        mockResponse as Response,
        mockNext
      );

      expect(mockResponse.json).toHaveBeenCalled();
      expect(sendEmail).toHaveBeenCalled();
      
      const jsonFn = mockResponse.json as ReturnType<typeof vi.fn>;
      const responseData = jsonFn.mock.calls[0][0];
      expect(responseData.message).toBe('Invitation sent successfully');
      expect(responseData.invitation.email).toBe('newinvite@example.com');
      expect(responseData.invitation.role).toBe('child');
      
      // Check the database
      const updatedFamily = await Family.findById(testFamily._id);
      expect(updatedFamily?.pendingInvitations.length).toBe(1);
      expect(updatedFamily?.pendingInvitations[0].email).toBe('newinvite@example.com');
    });

    it('should not allow non-parent members to send invitations', async () => {
      // Add child user to the family
      testFamily.members.push({
        user: childUser._id,
        role: 'child',
        joinedAt: new Date()
      });
      await testFamily.save();
      
      mockRequest = {
        user: { userId: childUser.userId },
        params: { id: testFamily._id.toString() },
        body: { 
          email: 'newinvite@example.com',
          role: 'child'
        },
      } as unknown as AuthRequest;

      await familyController.inviteMember(
        mockRequest as AuthRequest,
        mockResponse as Response,
        mockNext
      );

      expect(mockNext).toHaveBeenCalled();
      const error = mockNext.mock.calls[0][0];
      expect(error.message).toBe('Only parents can invite new members');
      expect(error.statusCode).toBe(401);
    });

    it('should prevent inviting existing members', async () => {
      mockRequest = {
        user: { userId: parentUser.userId },
        params: { id: testFamily._id.toString() },
        body: { 
          email: childUser.email,
          role: 'child'
        },
      } as unknown as AuthRequest;

      // First add the child user to the family
      testFamily.members.push({
        user: childUser._id,
        role: 'child',
        joinedAt: new Date()
      });
      await testFamily.save();

      await familyController.inviteMember(
        mockRequest as AuthRequest,
        mockResponse as Response,
        mockNext
      );

      expect(mockNext).toHaveBeenCalled();
      const error = mockNext.mock.calls[0][0];
      expect(error.message).toBe('User is already a member of this family');
      expect(error.statusCode).toBe(400);
    });
  });

  describe('acceptInvitation', () => {
    const invitationToken = 'test-token-123';
    const invitedEmail = nonMemberUser.email;
    
    beforeEach(async () => {
      // Create a test family with a pending invitation
      const family = new Family({
        name: 'Invitation Accept Test Family',
        members: [
          {
            user: parentUser._id,
            role: 'parent',
            joinedAt: new Date()
          }
        ],
        pendingInvitations: [
          {
            email: invitedEmail,
            role: 'parent',
            token: invitationToken,
            expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // 7 days from now
          }
        ],
        createdBy: parentUser._id
      });
      
      testFamily = await family.save();
    });

    it('should accept a valid invitation', async () => {
      mockRequest = {
        user: { userId: nonMemberUser.userId },
        body: { token: invitationToken },
      } as AuthRequest;

      await familyController.acceptInvitation(
        mockRequest as AuthRequest,
        mockResponse as Response,
        mockNext
      );

      expect(mockResponse.json).toHaveBeenCalled();
      const jsonFn = mockResponse.json as ReturnType<typeof vi.fn>;
      const responseData = jsonFn.mock.calls[0][0];
      expect(responseData.message).toBe('Successfully joined family');
      
      // Check updated family in database
      const updatedFamily = await Family.findById(testFamily._id);
      expect(updatedFamily?.members.length).toBe(2);
      expect(updatedFamily?.pendingInvitations.length).toBe(0);
      
      // Check the new member
      const newMember = updatedFamily?.members.find(
        m => m.user.toString() === nonMemberUser._id.toString()
      );
      expect(newMember).toBeDefined();
      expect(newMember?.role).toBe('parent');
    });

    it('should reject an invalid token', async () => {
      mockRequest = {
        user: { userId: nonMemberUser.userId },
        body: { token: 'invalid-token' },
      } as AuthRequest;

      await familyController.acceptInvitation(
        mockRequest as AuthRequest,
        mockResponse as Response,
        mockNext
      );

      expect(mockNext).toHaveBeenCalled();
      const error = mockNext.mock.calls[0][0];
      expect(error.message).toBe('Invalid or expired invitation token');
      expect(error.statusCode).toBe(400);
    });

    it('should reject if invitation was for a different email', async () => {
      mockRequest = {
        user: { userId: childUser.userId }, // Different user than the invited one
        body: { token: invitationToken },
      } as AuthRequest;

      await familyController.acceptInvitation(
        mockRequest as AuthRequest,
        mockResponse as Response,
        mockNext
      );

      expect(mockNext).toHaveBeenCalled();
      const error = mockNext.mock.calls[0][0];
      expect(error.message).toBe('This invitation was not meant for you');
      expect(error.statusCode).toBe(400);
    });
  });

  describe('removeMember', () => {
    beforeEach(async () => {
      // Create a test family with both parent and child members
      const family = new Family({
        name: 'Remove Member Test Family',
        members: [
          {
            user: parentUser._id,
            role: 'parent',
            joinedAt: new Date()
          },
          {
            user: childUser._id,
            role: 'child',
            joinedAt: new Date()
          }
        ],
        createdBy: parentUser._id
      });
      
      testFamily = await family.save();
    });

    it('should allow a parent to remove a child member', async () => {
      mockRequest = {
        user: { userId: parentUser.userId },
        params: { 
          id: testFamily._id.toString(),
          userId: childUser.userId
        },
      } as unknown as AuthRequest;

      await familyController.removeMember(
        mockRequest as AuthRequest,
        mockResponse as Response,
        mockNext
      );

      expect(mockResponse.json).toHaveBeenCalled();
      const jsonFn = mockResponse.json as ReturnType<typeof vi.fn>;
      const responseData = jsonFn.mock.calls[0][0];
      expect(responseData.message).toBe('Member removed successfully');
      
      // Check the family in database
      const updatedFamily = await Family.findById(testFamily._id);
      expect(updatedFamily?.members.length).toBe(1);
      
      // Ensure only the parent remains
      const remainingMember = updatedFamily?.members[0];
      expect(remainingMember?.user.toString()).toBe(parentUser._id.toString());
    });

    it('should not allow a child to remove members', async () => {
      mockRequest = {
        user: { userId: childUser.userId },
        params: { 
          id: testFamily._id.toString(),
          userId: parentUser.userId
        },
      } as unknown as AuthRequest;

      await familyController.removeMember(
        mockRequest as AuthRequest,
        mockResponse as Response,
        mockNext
      );

      expect(mockNext).toHaveBeenCalled();
      const error = mockNext.mock.calls[0][0];
      expect(error.message).toBe('Only parents can remove family members');
      expect(error.statusCode).toBe(401);
    });

    it('should prevent removing the last parent', async () => {
      mockRequest = {
        user: { userId: parentUser.userId },
        params: { 
          id: testFamily._id.toString(),
          userId: parentUser.userId // Trying to remove self
        },
      } as unknown as AuthRequest;

      await familyController.removeMember(
        mockRequest as AuthRequest,
        mockResponse as Response,
        mockNext
      );

      expect(mockNext).toHaveBeenCalled();
      const error = mockNext.mock.calls[0][0];
      expect(error.message).toBe('Cannot remove the last parent from the family');
      expect(error.statusCode).toBe(400);
    });

    it('should allow removing a parent if there are multiple parents', async () => {
      // Add another parent to the family
      testFamily.members.push({
        user: nonMemberUser._id,
        role: 'parent',
        joinedAt: new Date()
      });
      await testFamily.save();
      
      mockRequest = {
        user: { userId: nonMemberUser.userId }, // The new parent
        params: { 
          id: testFamily._id.toString(),
          userId: parentUser.userId // Removing the original parent
        },
      } as unknown as AuthRequest;

      await familyController.removeMember(
        mockRequest as AuthRequest,
        mockResponse as Response,
        mockNext
      );

      expect(mockResponse.json).toHaveBeenCalled();
      
      // Check the family in database
      const updatedFamily = await Family.findById(testFamily._id);
      expect(updatedFamily?.members.length).toBe(2); // Child + new parent
      
      // Ensure original parent is removed
      const originalParentStillPresent = updatedFamily?.members.some(
        m => m.user.toString() === parentUser._id.toString()
      );
      expect(originalParentStillPresent).toBe(false);
    });
  });
}); 