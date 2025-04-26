import { Request, Response, NextFunction } from 'express';
import mongoose from 'mongoose';
import { Notification } from '../models/Notification';
import { notificationService } from '../services/notificationService';
import { User } from '../models/User';
import createError from 'http-errors';

/**
 * Get all notifications for the current user with pagination
 */
export const getNotifications = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const userId = req.user?.userId;
    if (!userId) {
      return next(createError(401, 'Unauthorized'));
    }

    const limit = parseInt(req.query.limit as string) || 10;
    const offset = parseInt(req.query.offset as string) || 0;

    const notifications = await notificationService.getUserNotifications(
      new mongoose.Types.ObjectId(userId),
      limit,
      offset
    );

    const total = await Notification.countDocuments({ userId: new mongoose.Types.ObjectId(userId) });

    res.status(200).json({
      success: true,
      data: {
        notifications,
        pagination: {
          total,
          limit,
          offset,
          hasMore: offset + notifications.length < total
        }
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get count of unread notifications
 */
export const getUnreadCount = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const userId = req.user?.userId;
    if (!userId) {
      return next(createError(401, 'Unauthorized'));
    }

    const count = await notificationService.getUnreadCount(new mongoose.Types.ObjectId(userId));

    res.status(200).json({
      success: true,
      data: { count }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Mark a notification as read
 */
export const markAsRead = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const userId = req.user?.userId;
    if (!userId) {
      return next(createError(401, 'Unauthorized'));
    }

    const notificationId = req.params.id;
    if (!mongoose.Types.ObjectId.isValid(notificationId)) {
      return next(createError(400, 'Invalid notification ID'));
    }

    const success = await notificationService.markAsRead(
      new mongoose.Types.ObjectId(notificationId),
      new mongoose.Types.ObjectId(userId)
    );

    if (!success) {
      return next(createError(404, 'Notification not found'));
    }

    res.status(200).json({
      success: true,
      message: 'Notification marked as read'
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Mark all notifications as read
 */
export const markAllAsRead = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const userId = req.user?.userId;
    if (!userId) {
      return next(createError(401, 'Unauthorized'));
    }

    const count = await notificationService.markAllAsRead(new mongoose.Types.ObjectId(userId));

    res.status(200).json({
      success: true,
      message: `${count} notifications marked as read`
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Delete a notification
 */
export const deleteNotification = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const userId = req.user?.userId;
    if (!userId) {
      return next(createError(401, 'Unauthorized'));
    }

    const notificationId = req.params.id;
    if (!mongoose.Types.ObjectId.isValid(notificationId)) {
      return next(createError(400, 'Invalid notification ID'));
    }

    const success = await notificationService.deleteNotification(
      new mongoose.Types.ObjectId(notificationId),
      new mongoose.Types.ObjectId(userId)
    );

    if (!success) {
      return next(createError(404, 'Notification not found'));
    }

    res.status(200).json({
      success: true,
      message: 'Notification deleted'
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Delete all notifications
 */
export const deleteAllNotifications = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const userId = req.user?.userId;
    if (!userId) {
      return next(createError(401, 'Unauthorized'));
    }

    const count = await notificationService.deleteAllNotifications(new mongoose.Types.ObjectId(userId));

    res.status(200).json({
      success: true,
      message: `${count} notifications deleted`
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get notification preferences for the current user
 */
export const getNotificationPreferences = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const userId = req.user?.userId;
    if (!userId) {
      return next(createError(401, 'Unauthorized'));
    }

    const user = await User.findById(userId);
    if (!user) {
      return next(createError(404, 'User not found'));
    }

    res.status(200).json({
      success: true,
      data: user.notificationPreferences
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Update notification preferences
 */
export const updateNotificationPreferences = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const userId = req.user?.userId;
    if (!userId) {
      return next(createError(401, 'Unauthorized'));
    }

    const user = await User.findById(userId);
    if (!user) {
      return next(createError(404, 'User not found'));
    }

    // Validate the preferences
    const { inApp, email, frequency } = req.body;
    
    if (inApp) {
      user.notificationPreferences.inApp = {
        ...user.notificationPreferences.inApp,
        ...inApp
      };
    }
    
    if (email) {
      user.notificationPreferences.email = {
        ...user.notificationPreferences.email,
        ...email
      };
    }
    
    if (frequency && ['immediate', 'daily', 'weekly'].includes(frequency)) {
      user.notificationPreferences.frequency = frequency;
    }

    await user.save();

    res.status(200).json({
      success: true,
      message: 'Notification preferences updated',
      data: user.notificationPreferences
    });
  } catch (error) {
    next(error);
  }
}; 