/**
 * Notification model definitions with TypeScript utility types
 */

// Notification type enum as const object with type assertion
export const NotificationType = {
  TASK_CREATED: 'task_created',
  DEADLINE_APPROACHING: 'deadline_approaching',
  TASK_COMPLETED: 'task_completed',
  MEMBER_ADDED: 'member_added',
  INVITATION_ACCEPTED: 'invitation_accepted'
} as const;

export type NotificationTypeValue = typeof NotificationType[keyof typeof NotificationType];

// Notification frequency enum
export const NotificationFrequency = {
  IMMEDIATE: 'immediate',
  DAILY: 'daily',
  WEEKLY: 'weekly'
} as const;

export type NotificationFrequencyValue = typeof NotificationFrequency[keyof typeof NotificationFrequency];

// Base notification interface
export interface BaseNotification {
  _id: string;
  userId: string;
  type: NotificationTypeValue;
  content: string;
  relatedEntityId?: string;
  isRead: boolean;
  createdAt: string;
  updatedAt: string;
  expiresAt?: string;
}

// Notification with additional metadata
export interface Notification extends BaseNotification {
  // Additional fields can be added here as needed
}

// Notification preference settings
export interface NotificationPreferenceSettings {
  taskCreated: boolean;
  deadlineApproaching: boolean;
  taskCompleted: boolean;
  memberAdded: boolean;
  invitationAccepted: boolean;
}

// Complete notification preferences
export interface NotificationPreferences {
  inApp: NotificationPreferenceSettings;
  email: NotificationPreferenceSettings;
  frequency: NotificationFrequencyValue;
}

// Notification update payload
export type NotificationUpdatePayload = Partial<Pick<BaseNotification, 'isRead'>>;

// Notification preferences update payload
export type NotificationPreferencesUpdatePayload = Partial<NotificationPreferences>;

// API response interfaces
export interface NotificationResponse {
  success: boolean;
  data: {
    notifications: Notification[];
    pagination: {
      total: number;
      limit: number;
      offset: number;
      hasMore: boolean;
    };
  };
}

export interface UnreadCountResponse {
  success: boolean;
  data: {
    count: number;
  };
}

export interface NotificationPreferencesResponse {
  success: boolean;
  data: NotificationPreferences;
}

export interface SimpleNotificationResponse {
  success: boolean;
  message: string;
}
