export interface FamilyMember {
  userId: string;
  name?: string;
  email: string;
  role: 'admin' | 'member';
}

export interface Family {
  _id: string;
  name: string;
  createdBy: string;
  members: FamilyMember[];
  pendingInvitations: {
    email: string;
    role: 'admin' | 'member';
    invitedBy: string;
    invitedAt: string;
  }[];
  createdAt: string;
  updatedAt: string;
}

export interface InviteMemberFormData {
  email: string;
  role: 'admin' | 'member';
} 