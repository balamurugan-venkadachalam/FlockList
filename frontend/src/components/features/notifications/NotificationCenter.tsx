import React, { useState, useEffect, useRef } from 'react';
import { 
  IconButton, 
  Badge, 
  Popover, 
  List, 
  ListItem, 
  ListItemText, 
  Typography, 
  Box, 
  Divider, 
  Button,
  CircularProgress,
  ListItemIcon,
  Tooltip,
  Menu,
  MenuItem
} from '@mui/material';
import { 
  Notifications as NotificationsIcon,
  TaskAlt as TaskIcon,
  AccessTime as ClockIcon,
  Check as CheckIcon,
  Group as GroupIcon,
  MoreVert as MoreIcon,
  ClearAll as ClearAllIcon
} from '@mui/icons-material';
import { formatDistanceToNow } from 'date-fns';
import { useAuth } from '../../../context/AuthContext';
import notificationService from '../../../services/notificationService';
import { Notification } from '../../../types/notification';
import useNotifications from '../../../hooks/useNotifications';

const NotificationCenter: React.FC = () => {
  const { user } = useAuth();
  const { unreadCount, markAsRead, markAllAsRead } = useNotifications();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null);
  const [menuAnchor, setMenuAnchor] = useState<HTMLElement | null>(null);
  const [selectedNotification, setSelectedNotification] = useState<Notification | null>(null);
  const listRef = useRef<HTMLUListElement>(null);

  const fetchNotifications = async () => {
    if (loading) return;
    
    setLoading(true);
    try {
      const response = await notificationService.getNotifications();
      setNotifications(response.data.notifications);
    } catch (error) {
      console.error('Failed to fetch notifications:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleIconClick = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
    if (!anchorEl) {
      fetchNotifications();
    }
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleMenuClick = (event: React.MouseEvent<HTMLElement>, notification: Notification) => {
    event.stopPropagation();
    setSelectedNotification(notification);
    setMenuAnchor(event.currentTarget);
  };

  const handleMenuClose = () => {
    setMenuAnchor(null);
    setSelectedNotification(null);
  };

  const handleMarkAsRead = async (notificationId: string) => {
    const success = await markAsRead(notificationId);
    
    if (success) {
      // Update local state
      setNotifications(notifications.map(notification => 
        notification._id === notificationId 
          ? { ...notification, isRead: true } 
          : notification
      ));
      handleMenuClose();
    }
  };

  const handleMarkAllAsRead = async () => {
    const success = await markAllAsRead();
    
    if (success) {
      // Update local state
      setNotifications(notifications.map(notification => ({ ...notification, isRead: true })));
    }
  };

  const handleDeleteNotification = async (notificationId: string) => {
    try {
      await notificationService.deleteNotification(notificationId);
      
      // Update local state
      setNotifications(notifications.filter(notification => notification._id !== notificationId));
      handleMenuClose();
    } catch (error) {
      console.error('Failed to delete notification:', error);
    }
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'task_created':
        return <TaskIcon color="primary" />;
      case 'deadline_approaching':
        return <ClockIcon color="warning" />;
      case 'task_completed':
        return <CheckIcon color="success" />;
      case 'member_added':
      case 'invitation_accepted':
        return <GroupIcon color="info" />;
      default:
        return <NotificationsIcon color="action" />;
    }
  };

  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      return formatDistanceToNow(date, { addSuffix: true });
    } catch (error) {
      return 'Unknown date';
    }
  };

  const open = Boolean(anchorEl);
  const menuOpen = Boolean(menuAnchor);

  return (
    <>
      <Tooltip title="Notifications">
        <IconButton color="inherit" onClick={handleIconClick}>
          <Badge badgeContent={unreadCount} color="error">
            <NotificationsIcon />
          </Badge>
        </IconButton>
      </Tooltip>
      
      <Popover
        open={open}
        anchorEl={anchorEl}
        onClose={handleClose}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'right',
        }}
        transformOrigin={{
          vertical: 'top',
          horizontal: 'right',
        }}
        PaperProps={{
          sx: { 
            width: 320, 
            maxHeight: 400,
            overflowY: 'auto'
          }
        }}
      >
        <Box sx={{ p: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography variant="h6">Notifications</Typography>
          {unreadCount > 0 && (
            <Tooltip title="Mark all as read">
              <IconButton size="small" onClick={handleMarkAllAsRead}>
                <ClearAllIcon fontSize="small" />
              </IconButton>
            </Tooltip>
          )}
        </Box>
        
        <Divider />
        
        {loading && (
          <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
            <CircularProgress size={24} />
          </Box>
        )}
        
        {!loading && notifications.length === 0 && (
          <Box sx={{ p: 3, textAlign: 'center' }}>
            <Typography color="textSecondary">No notifications</Typography>
          </Box>
        )}
        
        <List ref={listRef} dense>
          {notifications.map((notification) => (
            <ListItem 
              key={notification._id}
              alignItems="flex-start"
              sx={{ 
                pl: 2,
                pr: 1,
                py: 1,
                backgroundColor: notification.isRead ? 'inherit' : 'action.hover',
                '&:hover': {
                  backgroundColor: 'action.selected',
                }
              }}
            >
              <ListItemIcon sx={{ minWidth: 40 }}>
                {getNotificationIcon(notification.type)}
              </ListItemIcon>
              
              <ListItemText
                primary={
                  <Typography 
                    variant="body2" 
                    sx={{ 
                      fontWeight: notification.isRead ? 'regular' : 'medium',
                      mb: 0.5
                    }}
                  >
                    {notification.content}
                  </Typography>
                }
                secondary={
                  <Typography variant="caption" color="textSecondary">
                    {formatDate(notification.createdAt)}
                  </Typography>
                }
              />
              
              <Box>
                <IconButton 
                  edge="end" 
                  size="small"
                  onClick={(e) => handleMenuClick(e, notification)}
                >
                  <MoreIcon fontSize="small" />
                </IconButton>
              </Box>
            </ListItem>
          ))}
        </List>
      </Popover>
      
      <Menu
        anchorEl={menuAnchor}
        open={menuOpen}
        onClose={handleMenuClose}
      >
        {selectedNotification && !selectedNotification.isRead && (
          <MenuItem onClick={() => handleMarkAsRead(selectedNotification._id)}>
            <ListItemIcon>
              <CheckIcon fontSize="small" />
            </ListItemIcon>
            Mark as read
          </MenuItem>
        )}
        <MenuItem onClick={() => selectedNotification && handleDeleteNotification(selectedNotification._id)}>
          <ListItemIcon>
            <ClearAllIcon fontSize="small" />
          </ListItemIcon>
          Delete notification
        </MenuItem>
      </Menu>
    </>
  );
};

export default NotificationCenter; 