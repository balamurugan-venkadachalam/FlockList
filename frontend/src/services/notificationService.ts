import axios from 'axios';
import { Notification, NotificationPreferences } from '../types/notification';

interface NotificationResponse {
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

interface UnreadCountResponse {
  success: boolean;
  data: {
    count: number;
  };
}

interface NotificationPreferencesResponse {
  success: boolean;
  data: NotificationPreferences;
}

interface SimpleResponse {
  success: boolean;
  message: string;
}

const notificationService = {
  /**
   * Get all notifications for the current user
   */
  getNotifications: async (limit = 10, offset = 0): Promise<NotificationResponse> => {
    try {
      const response = await axios.get(
        `/api/notifications?limit=${limit}&offset=${offset}`
      );
      return response.data;
    } catch (error: any) {
      throw new Error(
        error.response?.data?.message || 'Failed to fetch notifications'
      );
    }
  },

  /**
   * Get the count of unread notifications
   */
  getUnreadCount: async (): Promise<UnreadCountResponse> => {
    try {
      const response = await axios.get('/api/notifications/unread');
      return response.data;
    } catch (error: any) {
      throw new Error(
        error.response?.data?.message || 'Failed to get unread count'
      );
    }
  },

  /**
   * Mark a notification as read
   */
  markAsRead: async (notificationId: string): Promise<SimpleResponse> => {
    try {
      const response = await axios.put(`/api/notifications/${notificationId}/read`);
      return response.data;
    } catch (error: any) {
      throw new Error(
        error.response?.data?.message || 'Failed to mark notification as read'
      );
    }
  },

  /**
   * Mark all notifications as read
   */
  markAllAsRead: async (): Promise<SimpleResponse> => {
    try {
      const response = await axios.put('/api/notifications/read-all');
      return response.data;
    } catch (error: any) {
      throw new Error(
        error.response?.data?.message || 'Failed to mark all notifications as read'
      );
    }
  },

  /**
   * Delete a notification
   */
  deleteNotification: async (notificationId: string): Promise<SimpleResponse> => {
    try {
      const response = await axios.delete(`/api/notifications/${notificationId}`);
      return response.data;
    } catch (error: any) {
      throw new Error(
        error.response?.data?.message || 'Failed to delete notification'
      );
    }
  },

  /**
   * Get notification preferences
   */
  getNotificationPreferences: async (): Promise<NotificationPreferencesResponse> => {
    try {
      const response = await axios.get('/api/users/notification-preferences');
      return response.data;
    } catch (error: any) {
      throw new Error(
        error.response?.data?.message || 'Failed to get notification preferences'
      );
    }
  },

  /**
   * Update notification preferences
   */
  updateNotificationPreferences: async (
    preferences: Partial<NotificationPreferences>
  ): Promise<NotificationPreferencesResponse> => {
    try {
      const response = await axios.put(
        '/api/users/notification-preferences',
        preferences
      );
      return response.data;
    } catch (error: any) {
      throw new Error(
        error.response?.data?.message || 'Failed to update notification preferences'
      );
    }
  },
};

export default notificationService; 