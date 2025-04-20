import api from './api';
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

/**
 * Create a new flock
 * @param data flock creation data
 * @returns Promise with the created flock
 */
export const createFlock = async (data: CreateFlockRequest): Promise<FlockResponse> => {
  try {
    const response = await api.post('/api/flocks', data);
    return response.data;
  } catch (error: any) {
    throw error.response?.data?.message || 'Failed to create flock';
  }
};

// For backward compatibility - alias to createFlock
export const createFamily = createFlock;

/**
 * Get all flocks for the current user
 * @returns Promise with all flocks
 */
export const getFlocks = async (): Promise<FlocksResponse> => {
  try {
    const response = await api.get('/api/flocks');
    
    // Normalize the data to ensure consistent structure
    const normalizedFlocks = response.data.flocks.map((flock: any) => ({
      _id: flock._id || '',
      name: flock.name || 'Unnamed Flock',
      createdBy: flock.createdBy || '',
      members: Array.isArray(flock.members) ? flock.members : [],
      pendingInvitations: Array.isArray(flock.pendingInvitations) ? flock.pendingInvitations : [],
      createdAt: flock.createdAt || new Date().toISOString(),
      updatedAt: flock.updatedAt || new Date().toISOString()
    }));
    
    return {
      message: response.data.message || 'Flocks retrieved',
      families: normalizedFlocks, // For backward compatibility
      flocks: normalizedFlocks
    };
  } catch (error: any) {
    throw error.response?.data?.message || 'Failed to get flocks';
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
    const response = await api.get(`/api/flocks/${id}`);
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
 * @param data invitation data
 * @returns Promise with the invitation details
 */
export const inviteMember = async (
  flockId: string,
  data: InviteMemberFormData
): Promise<InvitationResponse> => {
  try {
    const response = await api.post(`/api/flocks/${flockId}/invite`, data);
    return response.data;
  } catch (error: any) {
    throw error.response?.data?.message || 'Failed to send invitation';
  }
};

/**
 * Accept a flock invitation
 * @param token string invitation token
 * @returns Promise with the flock details
 */
export const acceptInvitation = async (token: string): Promise<FlockResponse> => {
  try {
    const response = await api.post('/api/flocks/accept-invitation', { token });
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
    const response = await api.get('/api/flocks/invitations');
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
    const response = await api.post('/api/flocks/decline-invitation', { token });
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
    const response = await api.delete(`/api/flocks/${flockId}/invitations/${email}`);
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
export const removeMember = async (flockId: string, userId: string): Promise<{ message: string }> => {
  try {
    const response = await api.delete(`/api/flocks/${flockId}/members/${userId}`);
    return response.data;
  } catch (error: any) {
    throw error.response?.data?.message || 'Failed to remove member';
  }
}; 