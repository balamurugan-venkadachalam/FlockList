import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import notificationService from '../services/notificationService';

interface NotificationState {
  count: number;
  loading: boolean;
  error: string | null;
}

const useNotifications = () => {
  const { user } = useAuth();
  const [state, setState] = useState<NotificationState>({
    count: 0,
    loading: false,
    error: null
  });
  
  // Fetch unread count
  const fetchUnreadCount = async () => {
    if (!user) return;
    
    setState(prev => ({ ...prev, loading: true }));
    try {
      const response = await notificationService.getUnreadCount();
      setState(prev => ({
        ...prev,
        count: response.data.count,
        loading: false,
        error: null
      }));
    } catch (error: any) {
      console.error('Failed to fetch notification count:', error);
      setState(prev => ({
        ...prev,
        loading: false,
        error: error.message || 'Failed to fetch notifications'
      }));
    }
  };
  
  // Mark a notification as read
  const markAsRead = async (notificationId: string) => {
    if (!user) return false;
    
    try {
      await notificationService.markAsRead(notificationId);
      // Refresh count after marking as read
      fetchUnreadCount();
      return true;
    } catch (error) {
      console.error('Failed to mark notification as read:', error);
      return false;
    }
  };
  
  // Mark all notifications as read
  const markAllAsRead = async () => {
    if (!user) return false;
    
    try {
      await notificationService.markAllAsRead();
      // Refresh count
      setState(prev => ({ ...prev, count: 0 }));
      return true;
    } catch (error) {
      console.error('Failed to mark all notifications as read:', error);
      return false;
    }
  };
  
  // Initialize with unread count
  useEffect(() => {
    if (user) {
      fetchUnreadCount();
      
      // Poll for new notifications every minute
      const intervalId = setInterval(fetchUnreadCount, 60000);
      
      return () => clearInterval(intervalId);
    }
  }, [user]);
  
  return {
    unreadCount: state.count,
    loading: state.loading,
    error: state.error,
    fetchUnreadCount,
    markAsRead,
    markAllAsRead
  };
};

export default useNotifications; 