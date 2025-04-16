/**
 * Google Integration Module
 * 
 * This module handles all interactions with Google APIs, particularly authentication.
 */

import axios from 'axios';
import { ValidationError } from '../types/errors';

// Interface for the Google token payload
interface GoogleTokenPayload {
  iss: string;
  sub: string;
  email: string;
  email_verified: boolean;
  name?: string;
  picture?: string;
  given_name?: string;
  family_name?: string;
  iat: number;
  exp: number;
}

// Interface for user information extracted from Google token
export interface GoogleUserInfo {
  googleId: string;
  email: string;
  firstName: string;
  lastName: string;
  profilePicture?: string;
}

/**
 * Verifies a Google ID token by making a request to Google's tokeninfo endpoint
 * 
 * @param token The ID token to verify
 * @returns User information extracted from the verified token
 * @throws ValidationError if token is invalid or verification fails
 */
export const verifyGoogleToken = async (token: string): Promise<GoogleUserInfo> => {
  try {
    // Verify token with Google's API
    const response = await axios.get(
      `https://oauth2.googleapis.com/tokeninfo?id_token=${token}`
    );
    
    const payload = response.data as GoogleTokenPayload;
    
    // Validate the token
    if (!payload.email_verified) {
      throw new ValidationError('Email not verified with Google');
    }
    
    // Extract and return user information
    return {
      googleId: payload.sub,
      email: payload.email,
      firstName: payload.given_name || payload.name?.split(' ')[0] || 'Google',
      lastName: payload.family_name || payload.name?.split(' ').slice(1).join(' ') || 'User',
      profilePicture: payload.picture
    };
  } catch (error) {
    // Handle the case where we explicitly threw a ValidationError
    if (error instanceof ValidationError) {
      throw error;
    }
    
    // For all other errors, throw a generic validation error
    throw new ValidationError('Failed to verify Google token');
  }
}; 