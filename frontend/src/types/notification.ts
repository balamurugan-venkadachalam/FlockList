export type NotificationType = 
  | 'task_created' 
  | 'deadline_approaching' 
  | 'task_completed'
  | 'member_added'
  | 'invitation_accepted';

export interface Notification {
  _id: string;
  userId: string;
  type: NotificationType;
  content: string;
  relatedEntityId?: string;
  isRead: boolean;
  createdAt: string;
  updatedAt: string;
  expiresAt?: string;
}

export interface NotificationPreferences {
  inApp: {
    taskCreated: boolean;
    deadlineApproaching: boolean;
    taskCompleted: boolean;
    memberAdded: boolean;
    invitationAccepted: boolean;
  };
  email: {
    taskCreated: boolean;
    deadlineApproaching: boolean;
    taskCompleted: boolean;
    memberAdded: boolean;
    invitationAccepted: boolean;
  };
  frequency: 'immediate' | 'daily' | 'weekly';
} 