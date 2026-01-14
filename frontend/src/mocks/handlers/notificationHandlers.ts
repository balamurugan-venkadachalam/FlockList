import { http, HttpResponse, delay } from 'msw';

// Base URL for API endpoints
const baseUrl = import.meta.env.VITE_API_URL || 'http://localhost:3001';

// API endpoints based on OpenAPI spec
const ENDPOINTS = {
  NOTIFICATIONS: `${baseUrl}/api/notifications`,
  NOTIFICATIONS_UNREAD_COUNT: `${baseUrl}/api/notifications/unread-count`,
  NOTIFICATIONS_MARK_ALL_READ: `${baseUrl}/api/notifications/mark-all-read`,
  NOTIFICATION_READ: `${baseUrl}/api/notifications/:id/read`,
  NOTIFICATION_BY_ID: `${baseUrl}/api/notifications/:id`,
};

// Mock notifications data
const mockNotifications = [
  {
    _id: 'notif1',
    userId: 'user1',
    type: 'task_assigned',
    content: 'You have been assigned to a new task: Complete Project Documentation',
    relatedId: 'task1',
    read: false,
    createdAt: '2023-11-01T00:00:00.000Z'
  },
  {
    _id: 'notif2',
    userId: 'user1',
    type: 'task_completed',
    content: 'Task "Design User Dashboard" has been completed',
    relatedId: 'task3',
    read: true,
    createdAt: '2023-11-20T00:00:00.000Z'
  },
  {
    _id: 'notif3',
    userId: 'user1',
    type: 'flock_invitation',
    content: 'You have been invited to join the Development Team flock',
    relatedId: 'flock1',
    read: false,
    createdAt: '2023-11-25T00:00:00.000Z'
  },
  {
    _id: 'notif4',
    userId: 'user1',
    type: 'task_due_soon',
    content: 'Task "Implement Authentication Flow" is due in 2 days',
    relatedId: 'task2',
    read: false,
    createdAt: '2023-12-08T00:00:00.000Z'
  },
  {
    _id: 'notif5',
    userId: 'user1',
    type: 'task_comment',
    content: 'Jane Smith commented on "Complete Project Documentation"',
    relatedId: 'task1',
    read: true,
    createdAt: '2023-11-10T00:00:00.000Z'
  }
];

/**
 * Helper function to filter notifications based on query parameters
 * Follows OpenAPI spec for /api/notifications endpoint
 */
const filterNotifications = (url: URL): any[] => {
  const readFilter = url.searchParams.get('read');
  
  let filteredNotifications = [...mockNotifications];
  if (readFilter !== null) {
    const isRead = readFilter === 'true';
    filteredNotifications = filteredNotifications.filter(n => n.read === isRead);
  }
  
  return filteredNotifications;
};

/**
 * Create a paginated response with the given notifications
 */
const createPaginatedResponse = (notifications: any[], page = 1, limit = 20) => {
  const offset = (page - 1) * limit;
  const paginatedNotifications = notifications.slice(offset, offset + limit);
  
  return {
    notifications: paginatedNotifications,
    pagination: {
      total: notifications.length,
      limit,
      offset,
      hasMore: offset + limit < notifications.length,
    }
  };
};

// Notification handlers based on OpenAPI spec
export const notificationHandlers = [
  // GET /api/notifications - Get user notifications
  http.get(ENDPOINTS.NOTIFICATIONS, async ({ request }) => {
    await delay(300);
    const url = new URL(request.url);
    const filteredNotifications = filterNotifications(url);
    
    const page = parseInt(url.searchParams.get('page') || '1', 10);
    const limit = parseInt(url.searchParams.get('limit') || '20', 10);
    
    return HttpResponse.json(
      createPaginatedResponse(filteredNotifications, page, limit),
      { status: 200 }
    );
  }),
  
  // DELETE /api/notifications - Delete all notifications
  http.delete(ENDPOINTS.NOTIFICATIONS, async () => {
    await delay(300);
    
    return HttpResponse.json(
      { message: 'All notifications deleted successfully' },
      { status: 200 }
    );
  }),
  
  // GET /api/notifications/unread-count - Get unread notification count
  http.get(ENDPOINTS.NOTIFICATIONS_UNREAD_COUNT, async () => {
    await delay(100);
    const unreadCount = mockNotifications.filter(n => !n.read).length;
    
    return HttpResponse.json(
      { count: unreadCount },
      { status: 200 }
    );
  }),
  
  // PUT /api/notifications/mark-all-read - Mark all notifications as read
  http.put(ENDPOINTS.NOTIFICATIONS_MARK_ALL_READ, async () => {
    await delay(300);
    const count = mockNotifications.filter(n => !n.read).length;
    
    // Mark all as read in our mock data
    mockNotifications.forEach(n => { n.read = true; });
    
    return HttpResponse.json(
      {
        message: 'All notifications marked as read',
        count
      },
      { status: 200 }
    );
  }),
  
  // PUT /api/notifications/:id/read - Mark notification as read
  http.put(ENDPOINTS.NOTIFICATION_READ, async ({ params }) => {
    await delay(200);
    const { id } = params;
    
    const notification = mockNotifications.find(n => n._id === id);
    
    if (!notification) {
      return HttpResponse.json(
        { message: 'Notification not found' },
        { status: 404 }
      );
    }
    
    notification.read = true;
    
    return HttpResponse.json(
      notification,
      { status: 200 }
    );
  }),
  
  // DELETE /api/notifications/:id - Delete notification
  http.delete(ENDPOINTS.NOTIFICATION_BY_ID, async ({ params }) => {
    await delay(200);
    const { id } = params;
    
    const notificationIndex = mockNotifications.findIndex(n => n._id === id);
    
    if (notificationIndex === -1) {
      return HttpResponse.json(
        { message: 'Notification not found' },
        { status: 404 }
      );
    }
    
    return HttpResponse.json(
      {
        message: 'Notification deleted successfully',
        notificationId: id
      },
      { status: 200 }
    );
  })
];

// Special handlers for different story scenarios
export const notificationsEmptyHandler = http.get(ENDPOINTS.NOTIFICATIONS, async () => {
  await delay(300);
  
  return HttpResponse.json(
    createPaginatedResponse([], 1, 20),
    { status: 200 }
  );
});

export const notificationsErrorHandler = http.get(ENDPOINTS.NOTIFICATIONS, async () => {
  await delay(300);
  
  return HttpResponse.json(
    { message: 'Internal server error' },
    { status: 500 }
  );
});

export const notificationsLoadingHandler = http.get(ENDPOINTS.NOTIFICATIONS, async () => {
  await delay('infinite');
  return new Response(null, { status: 200 });
});
