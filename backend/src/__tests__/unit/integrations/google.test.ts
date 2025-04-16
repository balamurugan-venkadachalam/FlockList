import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import axios from 'axios';
import { verifyGoogleToken } from '../../../integrations/google';
import { ValidationError } from '../../../types/errors';

// Mock axios
vi.mock('axios');

describe('Google Integration', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.resetAllMocks();
  });

  describe('verifyGoogleToken', () => {
    const mockValidTokenResponse = {
      data: {
        iss: 'https://accounts.google.com',
        sub: '12345678901234567890',
        email: 'test@example.com',
        email_verified: true,
        name: 'Test User',
        given_name: 'Test',
        family_name: 'User',
        picture: 'https://example.com/photo.jpg',
        iat: 1619429920,
        exp: 1619433520
      }
    };

    it('should verify a valid token and return user information', async () => {
      // Setup
      vi.mocked(axios.get).mockResolvedValueOnce(mockValidTokenResponse);
      
      // Execute
      const result = await verifyGoogleToken('valid_token');
      
      // Verify
      expect(axios.get).toHaveBeenCalledWith(
        'https://oauth2.googleapis.com/tokeninfo?id_token=valid_token'
      );
      expect(result).toEqual({
        googleId: '12345678901234567890',
        email: 'test@example.com',
        firstName: 'Test',
        lastName: 'User',
        profilePicture: 'https://example.com/photo.jpg'
      });
    });

    it('should handle a token with only name (no given_name/family_name)', async () => {
      // Setup
      const response = {
        data: {
          ...mockValidTokenResponse.data,
          given_name: undefined,
          family_name: undefined,
          name: 'Full Name'
        }
      };
      vi.mocked(axios.get).mockResolvedValueOnce(response);
      
      // Execute
      const result = await verifyGoogleToken('valid_token');
      
      // Verify
      expect(result).toEqual({
        googleId: '12345678901234567890',
        email: 'test@example.com',
        firstName: 'Full',
        lastName: 'Name',
        profilePicture: 'https://example.com/photo.jpg'
      });
    });

    it('should throw ValidationError when token verification fails', async () => {
      // Setup - simulate a general error
      vi.mocked(axios.get).mockRejectedValueOnce(new Error('Token verification failed'));
      
      // Execute & Verify
      await expect(verifyGoogleToken('invalid_token')).rejects.toThrow(ValidationError);
    });
  });
}); 