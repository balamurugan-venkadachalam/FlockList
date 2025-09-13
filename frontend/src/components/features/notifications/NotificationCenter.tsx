import React, { useState, useRef } from 'react';
import { formatDistanceToNow } from 'date-fns';
import { 
  Bell, 
  CheckCircle2, 
  Clock, 
  Check, 
  Users, 
  MoreVertical, 
  Trash2, // Replaced ClearAll with Trash2
  Loader2
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import notificationService from '@/services/notificationService';
import { Notification } from '@/types/notification';
import useNotifications from '@/hooks/useNotifications';

import { Button } from '@/components/ui/shadcn/button';
import { Badge } from '@/components/ui/shadcn/badge';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/shadcn/popover';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/shadcn/dropdown-menu';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/shadcn/tooltip';
import { Separator } from '@/components/ui/shadcn/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import { cn } from '@/lib/utils';

const NotificationCenter: React.FC = () => {
  const { } = useAuth(); // Removed unused user variable
  const { unreadCount, markAsRead, markAllAsRead } = useNotifications();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [open, setOpen] = useState(false);
  // Removed unused selectedNotification state
  const [, setSelectedNotification] = useState<Notification | null>(null);
  const listRef = useRef<HTMLDivElement>(null);

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

  const handleIconClick = () => {
    setOpen(true);
    fetchNotifications();
  };

  // Removed unused handleClose function as it's not being used anywhere
  // const handleClose = () => {
  //   setOpen(false);
  // };

  const handleMarkAsRead = async (notificationId: string) => {
    const success = await markAsRead(notificationId);
    
    if (success) {
      // Update local state
      setNotifications(notifications.map(notification => 
        notification._id === notificationId 
          ? { ...notification, isRead: true } 
          : notification
      ));
      setSelectedNotification(null);
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
      setSelectedNotification(null);
    } catch (error) {
      console.error('Failed to delete notification:', error);
    }
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'task_created':
        return <CheckCircle2 className="h-4 w-4 text-blue-500" />;
      case 'deadline_approaching':
        return <Clock className="h-4 w-4 text-amber-500" />;
      case 'task_completed':
        return <Check className="h-4 w-4 text-green-500" />;
      case 'member_added':
      case 'invitation_accepted':
        return <Users className="h-4 w-4 text-indigo-500" />;
      default:
        return <Bell className="h-4 w-4 text-gray-500" />;
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

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <PopoverTrigger asChild>
              <Button 
                variant="ghost" 
                size="icon" 
                onClick={handleIconClick}
                className="relative"
              >
                <Bell className="h-5 w-5" />
                {unreadCount > 0 && (
                  <Badge 
                    className="absolute -top-1 -right-1 px-1 min-w-[18px] h-[18px] bg-destructive text-destructive-foreground text-xs"
                  >
                    {unreadCount}
                  </Badge>
                )}
              </Button>
            </PopoverTrigger>
          </TooltipTrigger>
          <TooltipContent>
            <p>Notifications</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
      
      <PopoverContent 
        className="w-80 p-0" 
        align="end"
      >
        <div className="flex items-center justify-between p-4">
          <h4 className="font-medium text-sm">Notifications</h4>
          {unreadCount > 0 && (
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button 
                    variant="ghost" 
                    size="icon"
                    className="h-8 w-8" 
                    onClick={handleMarkAllAsRead}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Mark all as read</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          )}
        </div>
        
        <Separator />
        
        {loading ? (
          <div className="flex justify-center items-center p-6">
            <Loader2 className="h-6 w-6 animate-spin text-primary" />
          </div>
        ) : notifications.length === 0 ? (
          <div className="p-6 text-center">
            <p className="text-sm text-muted-foreground">No notifications</p>
          </div>
        ) : (
          <ScrollArea className="h-[300px]">
            <div ref={listRef} className="divide-y">
              {notifications.map((notification) => (
                <div 
                  key={notification._id}
                  className={cn(
                    "flex items-start p-3 gap-3",
                    !notification.isRead && "bg-muted/50",
                    "hover:bg-muted"
                  )}
                >
                  <div className="mt-0.5">
                    {getNotificationIcon(notification.type)}
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <p className={cn(
                      "text-sm mb-1",
                      !notification.isRead && "font-medium"
                    )}>
                      {notification.content}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {formatDate(notification.createdAt)}
                    </p>
                  </div>
                  
                  <div>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        {!notification.isRead && (
                          <DropdownMenuItem onClick={() => handleMarkAsRead(notification._id)}>
                            <Check className="h-4 w-4 mr-2" />
                            Mark as read
                          </DropdownMenuItem>
                        )}
                        <DropdownMenuItem onClick={() => handleDeleteNotification(notification._id)}>
                          <Trash2 className="h-4 w-4 mr-2" />
                          Delete notification
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </div>
              ))}
            </div>
          </ScrollArea>
        )}
      </PopoverContent>
    </Popover>
  );
};

export default NotificationCenter;
