import axios from 'axios';
import {
  Flock,
  FlockCreationPayload,
  FlockInvitePayload,
  FlockResponse,
  FlockMemberRole,
  FlockInvitationListResponse,
  SimpleFlockResponse
} from '@/types/models/flock';

/**
 * API service for flock management
 */

// Using centralized model definitions from types/models/flock

const API_URL = '/api';

/**
 * Create a new flock
 * @param nameOrData flock name as string or object with name property
 * @param description optional description for the flock
 * @returns Promise with the created flock response
 */
export const createFlock = async (nameOrData: string | FlockCreationPayload, description?: string): Promise<FlockResponse> => {
  try {
    // Handle both string and object input formats
    let payload: FlockCreationPayload;
    
    if (typeof nameOrData === 'string') {
      payload = { 
        name: nameOrData,
        ...(description ? { description } : {})
      };
    } else {
      payload = nameOrData;
    }
      
    const response = await axios.post(`${API_URL}/flocks`, payload);
    return response.data;
  } catch (error) {
    throw new Error('Failed to create flock');
  }
};

// For backward compatibility - alias to createFlock
export const createFamily = createFlock;

/**
 * Get all flocks for the current user
 * @returns Promise with all flocks
 */
export const getFlocks = async (): Promise<Flock[]> => {
  try {
    const response = await axios.get(`${API_URL}/flocks`);
    // Handle different response formats
    if (response.data.flocks) {
      return response.data.flocks;
    } else if (response.data.families) {
      return response.data.families;
    } else if (Array.isArray(response.data)) {
      return response.data;
    }
    // If we get here, we have an unexpected response format
    console.warn('Unexpected response format from /flocks API:', response.data);
    return [];
  } catch (error) {
    throw new Error('Failed to fetch flocks');
  }
};

// For backward compatibility - alias to getFlocks
export const getFamilies = getFlocks;

/**
 * Get a flock by ID
 * @param id flock ID
 * @returns Promise with the flock details
 */
export const getFlockById = async (id: string): Promise<FlockResponse> => {
  try {
    const response = await axios.get(`${API_URL}/flocks/${id}`);
    return response.data;
  } catch (error: any) {
    throw error.response?.data?.message || 'Failed to get flock details';
  }
};

// For backward compatibility - alias to getFlockById
export const getFamilyById = getFlockById;

/**
 * Invite a member to a flock
 * @param flockId flock ID
 * @param emailOrData email string or invitation data object
 * @returns Promise with the invitation details
 */
export const inviteMember = async (flockId: string, emailOrData: string | FlockInvitePayload): Promise<void> => {
  try {
    // Handle both string and object input formats
    const payload = typeof emailOrData === 'string'
      ? { email: emailOrData, role: FlockMemberRole.MEMBER }
      : emailOrData;
    
    await axios.post(`${API_URL}/flocks/${flockId}/invite`, payload);
  } catch (error) {
    throw new Error('Failed to invite member');
  }
};

/**
 * Accept a flock invitation
 * @param token string invitation token
 * @returns Promise with the flock details
 */
export const acceptInvitation = async (token: string): Promise<FlockResponse> => {
  try {
    const response = await axios.post(`${API_URL}/flocks/accept-invitation`, { token });
    return response.data;
  } catch (error: any) {
    throw error.response?.data?.message || 'Failed to accept invitation';
  }
};

/**
 * Get all pending invitations for the current user
 * @returns Promise with user's invitations
 */
export const getUserInvitations = async (): Promise<FlockInvitationListResponse> => {
  try {
    const response = await axios.get(`${API_URL}/flocks/invitations`);
    return response.data;
  } catch (error: any) {
    throw error.response?.data?.message || 'Failed to get invitations';
  }
};

/**
 * Decline an invitation
 * @param token string invitation token
 * @returns Promise with success message
 */
export const declineInvitation = async (token: string): Promise<SimpleFlockResponse> => {
  try {
    const response = await axios.post(`${API_URL}/flocks/decline-invitation`, { token });
    return response.data;
  } catch (error: any) {
    throw error.response?.data?.message || 'Failed to decline invitation';
  }
};

/**
 * Cancel a pending invitation
 * @param flockId flock ID
 * @param email email address of the invitation to cancel
 * @returns Promise with the success message
 */
export const cancelInvitation = async (flockId: string, email: string): Promise<SimpleFlockResponse> => {
  try {
    const response = await axios.delete(`${API_URL}/flocks/${flockId}/invitations/${email}`);
    return response.data;
  } catch (error: any) {
    throw error.response?.data?.message || 'Failed to cancel invitation';
  }
};

/**
 * Remove a member from a flock
 * @param flockId flock ID
 * @param userId user ID to remove
 * @returns Promise with the success message
 */
export const removeMember = async (flockId: string, memberId: string): Promise<void> => {
  try {
    await axios.delete(`${API_URL}/flocks/${flockId}/members/${memberId}`);
  } catch (error) {
    throw new Error('Failed to remove member');
  }
}; 