/**
 * Flock model definitions with TypeScript utility types
 */
import { BaseUser } from './user';

// Flock member role enum as const object
export const FlockMemberRole = {
  ADMIN: 'admin',
  MEMBER: 'member'
} as const;

export type FlockMemberRoleType = typeof FlockMemberRole[keyof typeof FlockMemberRole];

// Base flock member interface
export interface FlockMember {
  _id: string;
  user: BaseUser;
  role: FlockMemberRoleType;
  joinedAt: string;
}

// Base flock interface
export interface BaseFlock {
  _id: string;
  name: string;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
}

// Extended flock interface with members
export interface Flock extends BaseFlock {
  members: FlockMember[];
  pendingInvitations?: FlockPendingInvitation[];
}

// Pending invitation interface
export interface FlockPendingInvitation {
  email: string;
  role: FlockMemberRoleType;
  invitedAt: string;
}

// Invitation interface for user invitations
export interface FlockInvitation {
  _id: string;
  flockId: string;
  flockName: string;
  invitedBy: {
    name: string;
    email: string;
  };
  role: FlockMemberRoleType;
  token: string;
  createdAt: string;
}

// Flock creation payload
export interface FlockCreationPayload {
  name: string;
}

// Flock invite payload
export interface FlockInvitePayload {
  email: string;
  role: FlockMemberRoleType;
}

// Flock update payload
export type FlockUpdatePayload = Partial<Pick<BaseFlock, 'name'>>;

// Flock member update payload
export type FlockMemberUpdatePayload = Partial<Pick<FlockMember, 'role'>>;

// API response interfaces
export interface FlockResponse {
  message: string;
  flock: Flock;
}

export interface FlockListResponse {
  message: string;
  flocks?: Flock[];
  families?: Flock[]; // For backward compatibility
}

export interface FlockMembersResponse {
  message: string;
  members: FlockMember[];
}

export interface FlockMemberResponse {
  message: string;
  member: FlockMember;
}

export interface FlockInvitationResponse {
  message: string;
  invitation: {
    email: string;
    role: FlockMemberRoleType;
    invitedAt: string;
  };
}

export interface FlockInvitationListResponse {
  message: string;
  invitations: FlockInvitation[];
}

export interface SimpleFlockResponse {
  message: string;
}
