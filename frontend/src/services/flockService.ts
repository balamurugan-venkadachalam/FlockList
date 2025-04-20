import axios from 'axios';
import { Flock, InviteMemberFormData } from '@/types/flock';

/**
 * API service for flock management
 */

export interface CreateFlockRequest {
  name: string;
}

export interface FlockResponse {
  message: string;
  family?: Flock; // For backward compatibility
  flock?: Flock; // Support for the updated API response
}

export interface FlocksResponse {
  message: string;
  families?: Flock[]; // For backward compatibility
  flocks?: Flock[];
}

export interface InvitationResponse {
  message: string;
  invitation: {
    email: string;
    role: 'admin' | 'member';
    invitedAt: string;
  };
}

// User invitation interface
export interface UserInvitation {
  _id: string;
  flockId: string;
  flockName: string;
  invitedBy: {
    name: string;
    email: string;
  };
  role: 'admin' | 'member';
  token: string;
  createdAt: string;
}

// User invitations response
export interface UserInvitationsResponse {
  message: string;
  invitations: UserInvitation[];
}

const API_URL = '/api';

/**
 * Create a new flock
 * @param nameOrData flock name as string or object with name property
 * @returns Promise with the created flock response
 */
export const createFlock = async (nameOrData: string | CreateFlockRequest): Promise<FlockResponse> => {
  try {
    // Handle both string and object input formats
    const payload = typeof nameOrData === 'string' 
      ? { name: nameOrData } 
      : nameOrData;
      
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
    return response.data;
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
export const inviteMember = async (flockId: string, emailOrData: string | InviteMemberFormData): Promise<void> => {
  try {
    // Handle both string and object input formats
    const payload = typeof emailOrData === 'string'
      ? { email: emailOrData, role: 'member' }
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
export const getUserInvitations = async (): Promise<UserInvitationsResponse> => {
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
export const declineInvitation = async (token: string): Promise<{ message: string }> => {
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
export const cancelInvitation = async (flockId: string, email: string): Promise<{ message: string }> => {
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