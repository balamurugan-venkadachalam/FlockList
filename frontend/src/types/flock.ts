export interface FlockMember {
  user: string | {
    _id: string;
    firstName?: string;
    lastName?: string;
    email: string;
  };
  role: 'admin' | 'member';
  joinedAt?: string;
}

export interface Flock {
  _id: string;
  name: string;
  createdBy: string;
  members: FlockMember[];
  pendingInvitations: {
    email: string;
    role: 'admin' | 'member';
    token: string;
    expiresAt: string;
  }[];
  createdAt: string;
  updatedAt: string;
}

export interface InviteMemberFormData {
  email: string;
  role: 'admin' | 'member';
} 