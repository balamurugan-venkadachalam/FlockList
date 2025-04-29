/**
 * User model definitions
 */

export interface BaseUser {
  _id: string;
  email: string;
  firstName: string;
  lastName: string;
  profilePicture?: string;
  isEmailVerified?: boolean;
}

export interface UserRole {
  readonly ADMIN: 'admin';
  readonly MEMBER: 'member';
}

export const UserRoles: UserRole = {
  ADMIN: 'admin',
  MEMBER: 'member'
} as const;

export type UserRoleType = typeof UserRoles[keyof typeof UserRoles];

// User with authentication information
export interface AuthUser extends BaseUser {
  token: string;
}

// User profile information
export type UserProfile = Omit<BaseUser, 'isEmailVerified'>;

// Minimal user information for display
export type UserDisplay = Pick<BaseUser, '_id' | 'firstName' | 'lastName' | 'profilePicture'>;

// User creation payload
export type UserCreationPayload = Omit<BaseUser, '_id' | 'isEmailVerified'> & {
  password: string;
};

// User update payload
export type UserUpdatePayload = Partial<Omit<BaseUser, '_id'>>;
