import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import axios from 'axios';
import {
  createFamily,
  getFamilies,
  getFamilyById,
  inviteMember,
  acceptInvitation,
  removeMember,
  CreateFamilyRequest,
  InviteMemberRequest,
  FamilyResponse,
  FamiliesResponse,
  InvitationResponse,
  Family,
  FamilyMember
} from '../../services/familyService';

// Mock axios
vi.mock('axios');

describe('Family Service', () => {
  // Test data
  const familyId = '507f1f77bcf86cd799439011';
  const userId = '507f1f77bcf86cd799439022';
  const mockFamilyMember: FamilyMember = {
    user: {
      _id: userId,
      email: 'user@example.com',
      firstName: 'John',
      lastName: 'Doe'
    },
    role: 'parent',
    joinedAt: new Date().toISOString()
  };

  const mockFamily: Family = {
    _id: familyId,
    name: 'Test Family',
    members: [mockFamilyMember],
    pendingInvitations: [],
    createdBy: {
      _id: userId,
      email: 'user@example.com',
      firstName: 'John',
      lastName: 'Doe'
    },
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };

  const mockFamilyResponse: FamilyResponse = {
    message: 'Success',
    family: mockFamily
  };

  const mockFamiliesResponse: FamiliesResponse = {
    message: 'Success',
    families: [mockFamily]
  };

  const mockInvitationResponse: InvitationResponse = {
    message: 'Invitation sent',
    invitation: {
      email: 'invited@example.com',
      role: 'child',
      invitedAt: new Date().toISOString()
    }
  };

  beforeEach(() => {
    vi.resetAllMocks();
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('createFamily', () => {
    it('should create a family successfully', async () => {
      // Arrange
      const createFamilyRequest: CreateFamilyRequest = {
        name: 'Test Family'
      };
      
      vi.mocked(axios.post).mockResolvedValueOnce({
        data: mockFamilyResponse
      });

      // Act
      const result = await createFamily(createFamilyRequest);

      // Assert
      expect(axios.post).toHaveBeenCalledWith('/api/families', createFamilyRequest);
      expect(result).toEqual(mockFamilyResponse);
    });

    it('should handle API errors correctly', async () => {
      // Arrange
      const createFamilyRequest: CreateFamilyRequest = {
        name: 'Test Family'
      };
      
      const errorMessage = 'Failed to create family';
      vi.mocked(axios.post).mockRejectedValueOnce({
        response: {
          data: {
            message: errorMessage
          }
        }
      });

      // Act & Assert
      await expect(createFamily(createFamilyRequest)).rejects.toEqual(errorMessage);
      expect(axios.post).toHaveBeenCalledWith('/api/families', createFamilyRequest);
    });

    it('should use fallback error message when error response is incomplete', async () => {
      // Arrange
      const createFamilyRequest: CreateFamilyRequest = {
        name: 'Test Family'
      };
      
      vi.mocked(axios.post).mockRejectedValueOnce(new Error('Network error'));

      // Act & Assert
      await expect(createFamily(createFamilyRequest)).rejects.toEqual('Failed to create family');
      expect(axios.post).toHaveBeenCalledWith('/api/families', createFamilyRequest);
    });
  });

  describe('getFamilies', () => {
    it('should get all families successfully', async () => {
      // Arrange
      vi.mocked(axios.get).mockResolvedValueOnce({
        data: mockFamiliesResponse
      });

      // Act
      const result = await getFamilies();

      // Assert
      expect(axios.get).toHaveBeenCalledWith('/api/families');
      expect(result).toEqual(mockFamiliesResponse);
    });

    it('should handle API errors correctly', async () => {
      // Arrange
      const errorMessage = 'Failed to fetch families';
      vi.mocked(axios.get).mockRejectedValueOnce({
        response: {
          data: {
            message: errorMessage
          }
        }
      });

      // Act & Assert
      await expect(getFamilies()).rejects.toEqual(errorMessage);
      expect(axios.get).toHaveBeenCalledWith('/api/families');
    });
  });

  describe('getFamilyById', () => {
    it('should get a family by ID successfully', async () => {
      // Arrange
      vi.mocked(axios.get).mockResolvedValueOnce({
        data: mockFamilyResponse
      });

      // Act
      const result = await getFamilyById(familyId);

      // Assert
      expect(axios.get).toHaveBeenCalledWith(`/api/families/${familyId}`);
      expect(result).toEqual(mockFamilyResponse);
    });

    it('should handle API errors correctly', async () => {
      // Arrange
      const errorMessage = 'Family not found';
      vi.mocked(axios.get).mockRejectedValueOnce({
        response: {
          data: {
            message: errorMessage
          }
        }
      });

      // Act & Assert
      await expect(getFamilyById(familyId)).rejects.toEqual(errorMessage);
      expect(axios.get).toHaveBeenCalledWith(`/api/families/${familyId}`);
    });
  });

  describe('inviteMember', () => {
    it('should invite a member successfully', async () => {
      // Arrange
      const inviteRequest: InviteMemberRequest = {
        email: 'invited@example.com',
        role: 'child'
      };
      
      vi.mocked(axios.post).mockResolvedValueOnce({
        data: mockInvitationResponse
      });

      // Act
      const result = await inviteMember(familyId, inviteRequest);

      // Assert
      expect(axios.post).toHaveBeenCalledWith(`/api/families/${familyId}/invite`, inviteRequest);
      expect(result).toEqual(mockInvitationResponse);
    });

    it('should handle API errors correctly', async () => {
      // Arrange
      const inviteRequest: InviteMemberRequest = {
        email: 'invited@example.com',
        role: 'child'
      };
      
      const errorMessage = 'Email already invited';
      vi.mocked(axios.post).mockRejectedValueOnce({
        response: {
          data: {
            message: errorMessage
          }
        }
      });

      // Act & Assert
      await expect(inviteMember(familyId, inviteRequest)).rejects.toEqual(errorMessage);
      expect(axios.post).toHaveBeenCalledWith(`/api/families/${familyId}/invite`, inviteRequest);
    });
  });

  describe('acceptInvitation', () => {
    it('should accept an invitation successfully', async () => {
      // Arrange
      const token = 'invitation-token-123';
      
      vi.mocked(axios.post).mockResolvedValueOnce({
        data: mockFamilyResponse
      });

      // Act
      const result = await acceptInvitation(token);

      // Assert
      expect(axios.post).toHaveBeenCalledWith('/api/families/accept-invitation', { token });
      expect(result).toEqual(mockFamilyResponse);
    });

    it('should handle API errors correctly', async () => {
      // Arrange
      const token = 'invalid-token';
      const errorMessage = 'Invalid or expired invitation';
      vi.mocked(axios.post).mockRejectedValueOnce({
        response: {
          data: {
            message: errorMessage
          }
        }
      });

      // Act & Assert
      await expect(acceptInvitation(token)).rejects.toEqual(errorMessage);
      expect(axios.post).toHaveBeenCalledWith('/api/families/accept-invitation', { token });
    });
  });

  describe('removeMember', () => {
    it('should remove a member successfully', async () => {
      // Arrange
      vi.mocked(axios.delete).mockResolvedValueOnce({
        data: { message: 'Member removed successfully' }
      });

      // Act
      const result = await removeMember(familyId, userId);

      // Assert
      expect(axios.delete).toHaveBeenCalledWith(`/api/families/${familyId}/members/${userId}`);
      expect(result).toEqual({ message: 'Member removed successfully' });
    });

    it('should handle API errors correctly', async () => {
      // Arrange
      const errorMessage = 'Cannot remove the last admin';
      vi.mocked(axios.delete).mockRejectedValueOnce({
        response: {
          data: {
            message: errorMessage
          }
        }
      });

      // Act & Assert
      await expect(removeMember(familyId, userId)).rejects.toEqual(errorMessage);
      expect(axios.delete).toHaveBeenCalledWith(`/api/families/${familyId}/members/${userId}`);
    });
  });
}); 