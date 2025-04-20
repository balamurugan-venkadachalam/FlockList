import express from 'express';
import { authenticate } from '../middleware/auth';
import * as notificationController from '../controllers/notificationController';

const router = express.Router();

// Protect all routes
router.use(authenticate);

// GET /api/notifications - Get user notifications with pagination
router.get('/', notificationController.getNotifications);

// GET /api/notifications/unread-count - Get unread notification count
router.get('/unread-count', notificationController.getUnreadCount);

// GET /api/notifications/unread - Get unread notification count (alias for frontend)
router.get('/unread', notificationController.getUnreadCount);

// PUT /api/notifications/:id/read - Mark notification as read
router.put('/:id/read', notificationController.markAsRead);

// PUT /api/notifications/mark-all-read - Mark all notifications as read
router.put('/mark-all-read', notificationController.markAllAsRead);

// PUT /api/notifications/read-all - Mark all notifications as read (alias for frontend)
router.put('/read-all', notificationController.markAllAsRead);

// DELETE /api/notifications/:id - Delete a notification
router.delete('/:id', notificationController.deleteNotification);

// DELETE /api/notifications - Delete all notifications
router.delete('/', notificationController.deleteAllNotifications);

export default router; 