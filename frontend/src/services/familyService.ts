import api from './api';
import { Family, InviteMemberFormData } from '@/types/family';

/**
 * API service for family management
 */

export interface CreateFamilyRequest {
  name: string;
}

export interface FamilyResponse {
  message: string;
  family: Family;
}

export interface FamiliesResponse {
  message: string;
  families: Family[];
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
  familyId: string;
  familyName: string;
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
 * Create a new family
 * @param data family creation data
 * @returns Promise with the created family
 */
export const createFamily = async (data: CreateFamilyRequest): Promise<FamilyResponse> => {
  try {
    const response = await api.post('/api/families', data);
    return response.data;
  } catch (error: any) {
    throw error.response?.data?.message || 'Failed to create family';
  }
};

/**
 * Get all families for the current user
 * @returns Promise with all families
 */
export const getFamilies = async (): Promise<FamiliesResponse> => {
  try {
    const response = await api.get('/api/families');
    return response.data;
  } catch (error: any) {
    throw error.response?.data?.message || 'Failed to get families';
  }
};

/**
 * Get a family by ID
 * @param id family ID
 * @returns Promise with the family details
 */
export const getFamilyById = async (id: string): Promise<FamilyResponse> => {
  try {
    const response = await api.get(`/api/families/${id}`);
    return response.data;
  } catch (error: any) {
    throw error.response?.data?.message || 'Failed to get family details';
  }
};

/**
 * Invite a member to a family
 * @param familyId family ID
 * @param data invitation data
 * @returns Promise with the invitation details
 */
export const inviteMember = async (
  familyId: string,
  data: InviteMemberFormData
): Promise<InvitationResponse> => {
  try {
    const response = await api.post(`/api/families/${familyId}/invite`, data);
    return response.data;
  } catch (error: any) {
    throw error.response?.data?.message || 'Failed to send invitation';
  }
};

/**
 * Accept a family invitation
 * @param token string invitation token
 * @returns Promise with the family details
 */
export const acceptInvitation = async (token: string): Promise<FamilyResponse> => {
  try {
    const response = await api.post('/api/families/accept-invitation', { token });
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
    const response = await api.get('/api/families/invitations');
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
    const response = await api.post('/api/families/decline-invitation', { token });
    return response.data;
  } catch (error: any) {
    throw error.response?.data?.message || 'Failed to decline invitation';
  }
};

/**
 * Cancel a pending invitation
 * @param familyId family ID
 * @param email email address of the invitation to cancel
 * @returns Promise with the success message
 */
export const cancelInvitation = async (familyId: string, email: string): Promise<{ message: string }> => {
  try {
    const response = await api.delete(`/api/families/${familyId}/invitations/${email}`);
    return response.data;
  } catch (error: any) {
    throw error.response?.data?.message || 'Failed to cancel invitation';
  }
};

/**
 * Remove a member from a family
 * @param familyId family ID
 * @param userId user ID to remove
 * @returns Promise with the success message
 */
export const removeMember = async (familyId: string, userId: string): Promise<{ message: string }> => {
  try {
    const response = await api.delete(`/api/families/${familyId}/members/${userId}`);
    return response.data;
  } catch (error: any) {
    throw error.response?.data?.message || 'Failed to remove member';
  }
}; 