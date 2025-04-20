import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import axios from 'axios';
import {
  createFlock,
  getFamilies,
  getFlockById,
  inviteMember,
  acceptInvitation,
  removeMember,
  CreateFlockRequest,
  InviteMemberRequest,
  FlockResponse,
  FamiliesResponse,
  InvitationResponse,
  Flock,
  FlockMember
} from '../../services/flockService';

// Mock axios
vi.mock('axios');

describe('Flock Service', () => {
  // Test data
  const flockId = '507f1f77bcf86cd799439011';
  const userId = '507f1f77bcf86cd799439022';
  const mockFlockMember: FlockMember = {
    user: {
      _id: userId,
      email: 'user@example.com',
      firstName: 'John',
      lastName: 'Doe'
    },
    role: 'admin',
    joinedAt: new Date().toISOString()
  };

  const mockFlock: Flock = {
    _id: flockId,
    name: 'Test Flock',
    members: [mockFlockMember],
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

  const mockFlockResponse: FlockResponse = {
    message: 'Success',
    flock: mockFlock
  };

  const mockFamiliesResponse: FamiliesResponse = {
    message: 'Success',
    families: [mockFlock]
  };

  const mockInvitationResponse: InvitationResponse = {
    message: 'Invitation sent',
    invitation: {
      email: 'invited@example.com',
      role: 'member',
      invitedAt: new Date().toISOString()
    }
  };

  beforeEach(() => {
    vi.resetAllMocks();
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('createFlock', () => {
    it('should create a flock successfully', async () => {
      // Arrange
      const createFlockRequest: CreateFlockRequest = {
        name: 'Test Flock'
      };
      
      vi.mocked(axios.post).mockResolvedValueOnce({
        data: mockFlockResponse
      });

      // Act
      const result = await createFlock(createFlockRequest);

      // Assert
      expect(axios.post).toHaveBeenCalledWith('/api/families', createFlockRequest);
      expect(result).toEqual(mockFlockResponse);
    });

    it('should handle API errors correctly', async () => {
      // Arrange
      const createFlockRequest: CreateFlockRequest = {
        name: 'Test Flock'
      };
      
      const errorMessage = 'Failed to create flock';
      vi.mocked(axios.post).mockRejectedValueOnce({
        response: {
          data: {
            message: errorMessage
          }
        }
      });

      // Act & Assert
      await expect(createFlock(createFlockRequest)).rejects.toEqual(errorMessage);
      expect(axios.post).toHaveBeenCalledWith('/api/families', createFlockRequest);
    });

    it('should use fallback error message when error response is incomplete', async () => {
      // Arrange
      const createFlockRequest: CreateFlockRequest = {
        name: 'Test Flock'
      };
      
      vi.mocked(axios.post).mockRejectedValueOnce(new Error('Network error'));

      // Act & Assert
      await expect(createFlock(createFlockRequest)).rejects.toEqual('Failed to create flock');
      expect(axios.post).toHaveBeenCalledWith('/api/families', createFlockRequest);
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

  describe('getFlockById', () => {
    it('should get a flock by ID successfully', async () => {
      // Arrange
      vi.mocked(axios.get).mockResolvedValueOnce({
        data: mockFlockResponse
      });

      // Act
      const result = await getFlockById(flockId);

      // Assert
      expect(axios.get).toHaveBeenCalledWith(`/api/families/${flockId}`);
      expect(result).toEqual(mockFlockResponse);
    });

    it('should handle API errors correctly', async () => {
      // Arrange
      const errorMessage = 'Flock not found';
      vi.mocked(axios.get).mockRejectedValueOnce({
        response: {
          data: {
            message: errorMessage
          }
        }
      });

      // Act & Assert
      await expect(getFlockById(flockId)).rejects.toEqual(errorMessage);
      expect(axios.get).toHaveBeenCalledWith(`/api/families/${flockId}`);
    });
  });

  describe('inviteMember', () => {
    it('should invite a member successfully', async () => {
      // Arrange
      const inviteRequest: InviteMemberRequest = {
        email: 'invited@example.com',
        role: 'member'
      };
      
      vi.mocked(axios.post).mockResolvedValueOnce({
        data: mockInvitationResponse
      });

      // Act
      const result = await inviteMember(flockId, inviteRequest);

      // Assert
      expect(axios.post).toHaveBeenCalledWith(`/api/families/${flockId}/invite`, inviteRequest);
      expect(result).toEqual(mockInvitationResponse);
    });

    it('should handle API errors correctly', async () => {
      // Arrange
      const inviteRequest: InviteMemberRequest = {
        email: 'invited@example.com',
        role: 'member'
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
      await expect(inviteMember(flockId, inviteRequest)).rejects.toEqual(errorMessage);
      expect(axios.post).toHaveBeenCalledWith(`/api/families/${flockId}/invite`, inviteRequest);
    });
  });

  describe('acceptInvitation', () => {
    it('should accept an invitation successfully', async () => {
      // Arrange
      const token = 'invitation-token-123';
      
      vi.mocked(axios.post).mockResolvedValueOnce({
        data: mockFlockResponse
      });

      // Act
      const result = await acceptInvitation(token);

      // Assert
      expect(axios.post).toHaveBeenCalledWith('/api/families/accept-invitation', { token });
      expect(result).toEqual(mockFlockResponse);
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
      const result = await removeMember(flockId, userId);

      // Assert
      expect(axios.delete).toHaveBeenCalledWith(`/api/families/${flockId}/members/${userId}`);
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
      await expect(removeMember(flockId, userId)).rejects.toEqual(errorMessage);
      expect(axios.delete).toHaveBeenCalledWith(`/api/families/${flockId}/members/${userId}`);
    });
  });
}); 