import { Notification, NotificationType, INotification } from '../models/Notification';
import { User, IUser } from '../models/User';
import mongoose from 'mongoose';
import { logger } from '../utils/logger';

interface NotificationData {
  userId: mongoose.Types.ObjectId;
  type: NotificationType;
  content: string;
  relatedEntityId?: mongoose.Types.ObjectId;
  expiresAt?: Date;
}

class NotificationService {
  /**
   * Create a new notification
   */
  async createNotification(data: NotificationData): Promise<INotification | null> {
    try {
      // Check if user exists
      const user = await User.findById(data.userId);
      if (!user) {
        logger.error(`Cannot create notification: User ${data.userId} not found`);
        return null;
      }

      // Check user preferences for this notification type
      if (!this.shouldCreateNotification(user, data.type, 'inApp')) {
        logger.info(`Skipping in-app notification for user ${data.userId}: disabled in preferences`);
        return null;
      }

      // Create the notification
      const notification = new Notification({
        userId: data.userId,
        type: data.type,
        content: data.content,
        relatedEntityId: data.relatedEntityId,
        expiresAt: data.expiresAt
      });

      await notification.save();
      logger.info(`Created notification for user ${data.userId}: ${data.type}`);
      return notification;
    } catch (error) {
      logger.error('Error creating notification:', error);
      return null;
    }
  }

  /**
   * Generate a task created notification
   */
  async notifyTaskCreated(
    taskId: mongoose.Types.ObjectId, 
    taskTitle: string,
    assigneeIds: mongoose.Types.ObjectId[]
  ): Promise<INotification[]> {
    const notifications: INotification[] = [];

    try {
      // Notify each assignee
      for (const userId of assigneeIds) {
        const notification = await this.createNotification({
          userId,
          type: 'task_created',
          content: `You have been assigned a new task: "${taskTitle}"`,
          relatedEntityId: taskId
        });

        if (notification) {
          notifications.push(notification);
        }
      }

      return notifications;
    } catch (error) {
      logger.error('Error in notifyTaskCreated:', error);
      return notifications;
    }
  }

  /**
   * Generate a deadline approaching notification
   */
  async notifyDeadlineApproaching(
    taskId: mongoose.Types.ObjectId,
    taskTitle: string,
    assigneeIds: mongoose.Types.ObjectId[],
    dueDate: Date
  ): Promise<INotification[]> {
    const notifications: INotification[] = [];

    try {
      // Format the due date for the message
      const dueDateStr = dueDate.toLocaleString('en-US', {
        month: 'short', 
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });

      // Notify each assignee
      for (const userId of assigneeIds) {
        const notification = await this.createNotification({
          userId,
          type: 'deadline_approaching',
          content: `Task "${taskTitle}" is due soon: ${dueDateStr}`,
          relatedEntityId: taskId
        });

        if (notification) {
          notifications.push(notification);
        }
      }

      return notifications;
    } catch (error) {
      logger.error('Error in notifyDeadlineApproaching:', error);
      return notifications;
    }
  }

  /**
   * Generate a task completed notification
   */
  async notifyTaskCompleted(
    taskId: mongoose.Types.ObjectId,
    taskTitle: string,
    creatorId: mongoose.Types.ObjectId,
    completedById: mongoose.Types.ObjectId
  ): Promise<INotification | null> {
    try {
      // Only notify the creator if they're not the one who completed it
      if (creatorId.toString() === completedById.toString()) {
        return null;
      }

      return await this.createNotification({
        userId: creatorId,
        type: 'task_completed',
        content: `Your task "${taskTitle}" has been marked as completed`,
        relatedEntityId: taskId
      });
    } catch (error) {
      logger.error('Error in notifyTaskCompleted:', error);
      return null;
    }
  }

  /**
   * Generate notifications for family member added
   */
  async notifyMemberAdded(
    familyId: mongoose.Types.ObjectId,
    familyName: string,
    memberId: mongoose.Types.ObjectId,
    memberName: string,
    adminIds: mongoose.Types.ObjectId[]
  ): Promise<INotification[]> {
    const notifications: INotification[] = [];

    try {
      // Notify admins of the family
      for (const adminId of adminIds) {
        if (adminId.toString() === memberId.toString()) continue; // Skip if admin is the new member

        const notification = await this.createNotification({
          userId: adminId,
          type: 'member_added',
          content: `${memberName} has joined your family: ${familyName}`,
          relatedEntityId: familyId
        });

        if (notification) {
          notifications.push(notification);
        }
      }

      return notifications;
    } catch (error) {
      logger.error('Error in notifyMemberAdded:', error);
      return notifications;
    }
  }

  /**
   * Check if notification should be created based on user preferences
   */
  private shouldCreateNotification(
    user: IUser, 
    type: NotificationType, 
    channel: 'inApp' | 'email'
  ): boolean {
    // Map notification type to preference key
    const preferenceKey = this.getPreferenceKey(type);
    if (!preferenceKey) return false;

    // Use proper typing with as operator for safe property access
    if (channel === 'inApp') {
      return user.notificationPreferences.inApp[preferenceKey as keyof typeof user.notificationPreferences.inApp];
    } else {
      return user.notificationPreferences.email[preferenceKey as keyof typeof user.notificationPreferences.email];
    }
  }

  /**
   * Map notification type to preference key
   */
  private getPreferenceKey(type: NotificationType): keyof typeof User.prototype.notificationPreferences.inApp | null {
    switch (type) {
      case 'task_created':
        return 'taskCreated';
      case 'deadline_approaching':
        return 'deadlineApproaching';
      case 'task_completed':
        return 'taskCompleted';
      case 'member_added':
        return 'memberAdded';
      case 'invitation_accepted':
        return 'invitationAccepted';
      default:
        return null;
    }
  }

  /**
   * Get unread notification count for a user
   */
  async getUnreadCount(userId: mongoose.Types.ObjectId): Promise<number> {
    try {
      return await Notification.countDocuments({ 
        userId,
        isRead: false
      });
    } catch (error) {
      logger.error(`Error getting unread count for user ${userId}:`, error);
      return 0;
    }
  }

  /**
   * Get notifications for a user with pagination
   */
  async getUserNotifications(
    userId: mongoose.Types.ObjectId, 
    limit = 10, 
    offset = 0
  ): Promise<INotification[]> {
    try {
      return await Notification.find({ userId })
        .sort({ createdAt: -1 })
        .skip(offset)
        .limit(limit);
    } catch (error) {
      logger.error(`Error getting notifications for user ${userId}:`, error);
      return [];
    }
  }

  /**
   * Mark notification as read
   */
  async markAsRead(notificationId: mongoose.Types.ObjectId, userId: mongoose.Types.ObjectId): Promise<boolean> {
    try {
      const notification = await Notification.findOne({ 
        _id: notificationId,
        userId
      });

      if (!notification) {
        logger.warn(`Notification ${notificationId} not found for user ${userId}`);
        return false;
      }

      await notification.markAsRead();
      return true;
    } catch (error) {
      logger.error(`Error marking notification ${notificationId} as read:`, error);
      return false;
    }
  }

  /**
   * Mark all notifications as read for a user
   */
  async markAllAsRead(userId: mongoose.Types.ObjectId): Promise<number> {
    try {
      const result = await Notification.updateMany(
        { userId, isRead: false },
        { isRead: true }
      );
      
      return result.modifiedCount;
    } catch (error) {
      logger.error(`Error marking all notifications as read for user ${userId}:`, error);
      return 0;
    }
  }

  /**
   * Delete a notification
   */
  async deleteNotification(notificationId: mongoose.Types.ObjectId, userId: mongoose.Types.ObjectId): Promise<boolean> {
    try {
      const result = await Notification.deleteOne({ 
        _id: notificationId,
        userId
      });
      
      return result.deletedCount > 0;
    } catch (error) {
      logger.error(`Error deleting notification ${notificationId}:`, error);
      return false;
    }
  }

  /**
   * Delete all notifications for a user
   */
  async deleteAllNotifications(userId: mongoose.Types.ObjectId): Promise<number> {
    try {
      const result = await Notification.deleteMany({ userId });
      return result.deletedCount;
    } catch (error) {
      logger.error(`Error deleting all notifications for user ${userId}:`, error);
      return 0;
    }
  }
}

export const notificationService = new NotificationService(); 