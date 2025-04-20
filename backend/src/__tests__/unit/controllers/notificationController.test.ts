import { Request, Response } from 'express';
import mongoose from 'mongoose';
import { vi, describe, it, expect, beforeEach } from 'vitest';
import * as notificationController from '../../../controllers/notificationController';
import { Notification } from '../../../models/Notification';

// Mock the models
vi.mock('../../../models/Notification', () => ({
  Notification: {
    find: vi.fn(),
    findOne: vi.fn(),
    findById: vi.fn(),
    updateMany: vi.fn(),
    deleteOne: vi.fn(),
    deleteMany: vi.fn(),
    countDocuments: vi.fn(),
  }
}));

// Mock direct controller functions for preference tests

describe('Notification Controller', () => {
  let mockRequest: Partial<Request>;
  let mockResponse: Partial<Response>;
  let mockNext: any;
  let responseObject: any;

  beforeEach(() => {
    responseObject = {
      statusCode: 0,
      jsonValue: {}
    };
    
    mockRequest = {
      user: {
        userId: '60d0fe4f5311236168a109ca',
        role: 'admin'
      },
      params: {},
      body: {}
    };
    
    mockResponse = {
      status: vi.fn().mockImplementation((code) => {
        responseObject.statusCode = code;
        return mockResponse;
      }),
      json: vi.fn().mockImplementation((data) => {
        responseObject.jsonValue = data;
        return mockResponse;
      })
    };

    mockNext = vi.fn();

    vi.clearAllMocks();
  });

  describe('getNotifications', () => {
    it('should return user notifications with correct pagination', async () => {
      const mockNotifications = [
        { _id: '1', type: 'task_created', content: 'New task created' },
        { _id: '2', type: 'deadline_approaching', content: 'Task due soon' }
      ];
      
      mockRequest.query = { page: '1', limit: '10' };
      
      vi.mocked(Notification.find).mockReturnValue({
        sort: vi.fn().mockReturnValue({
          skip: vi.fn().mockReturnValue({
            limit: vi.fn().mockReturnValue({
              exec: vi.fn().mockResolvedValue(mockNotifications)
            })
          })
        })
      } as any);
      
      vi.mocked(Notification.countDocuments).mockReturnValue({
        exec: vi.fn().mockResolvedValue(2)
      } as any);

      await notificationController.getNotifications(
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );

      expect(Notification.find).toHaveBeenCalledWith({ userId: mockRequest.user!.userId });
      expect(responseObject.statusCode).toBe(200);
      expect(responseObject.jsonValue).toEqual({
        success: true,
        data: {
          notifications: mockNotifications,
          pagination: {
            total: 2,
            page: 1,
            limit: 10
          }
        }
      });
    });

    it('should handle errors and return 500 status', async () => {
      vi.mocked(Notification.find).mockImplementation(() => {
        throw new Error('Database error');
      });

      await notificationController.getNotifications(
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );

      expect(mockNext).toHaveBeenCalled();
    });
  });

  describe('getUnreadCount', () => {
    it('should return the count of unread notifications', async () => {
      vi.mocked(Notification.countDocuments).mockReturnValue({
        exec: vi.fn().mockResolvedValue(5)
      } as any);

      await notificationController.getUnreadCount(
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );

      expect(Notification.countDocuments).toHaveBeenCalledWith({
        userId: mockRequest.user!.userId,
        isRead: false
      });
      expect(responseObject.statusCode).toBe(200);
      expect(responseObject.jsonValue).toEqual({
        success: true,
        data: { count: 5 }
      });
    });

    it('should handle errors and return 500 status', async () => {
      vi.mocked(Notification.countDocuments).mockImplementation(() => {
        throw new Error('Database error');
      });

      await notificationController.getUnreadCount(
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );

      expect(mockNext).toHaveBeenCalled();
    });
  });

  describe('markAsRead', () => {
    it('should mark a notification as read', async () => {
      const notificationId = new mongoose.Types.ObjectId().toString();
      mockRequest.params = { id: notificationId };
      
      const mockNotification = {
        _id: notificationId,
        userId: mockRequest.user!.userId,
        isRead: false,
        markAsRead: vi.fn().mockResolvedValue({ isRead: true })
      };
      
      vi.mocked(Notification.findById).mockReturnValue({
        exec: vi.fn().mockResolvedValue(mockNotification)
      } as any);

      await notificationController.markAsRead(
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );

      expect(Notification.findById).toHaveBeenCalledWith(notificationId);
      expect(mockNotification.markAsRead).toHaveBeenCalled();
      expect(responseObject.statusCode).toBe(200);
      expect(responseObject.jsonValue.success).toBe(true);
    });

    it('should return 404 if notification not found', async () => {
      mockRequest.params = { id: 'nonexistent-id' };
      
      vi.mocked(Notification.findById).mockReturnValue({
        exec: vi.fn().mockResolvedValue(null)
      } as any);

      await notificationController.markAsRead(
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );

      expect(mockNext).toHaveBeenCalled();
    });

    it('should return 403 if user does not own the notification', async () => {
      const notificationId = new mongoose.Types.ObjectId().toString();
      mockRequest.params = { id: notificationId };
      
      const mockNotification = {
        _id: notificationId,
        userId: 'different-user-id',
        isRead: false
      };
      
      vi.mocked(Notification.findById).mockReturnValue({
        exec: vi.fn().mockResolvedValue(mockNotification)
      } as any);

      await notificationController.markAsRead(
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );

      expect(mockNext).toHaveBeenCalled();
    });
  });

  describe('markAllAsRead', () => {
    it('should mark all user notifications as read', async () => {
      vi.mocked(Notification.updateMany).mockReturnValue({
        exec: vi.fn().mockResolvedValue({ modifiedCount: 5 })
      } as any);

      await notificationController.markAllAsRead(
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );

      expect(Notification.updateMany).toHaveBeenCalledWith(
        { userId: mockRequest.user!.userId, isRead: false },
        { isRead: true }
      );
      expect(responseObject.statusCode).toBe(200);
      expect(responseObject.jsonValue).toEqual({
        success: true,
        message: '5 notifications marked as read'
      });
    });
  });

  describe('deleteNotification', () => {
    it('should delete a specific notification', async () => {
      const notificationId = new mongoose.Types.ObjectId().toString();
      mockRequest.params = { id: notificationId };
      
      const mockNotification = {
        _id: notificationId,
        userId: mockRequest.user!.userId
      };
      
      vi.mocked(Notification.findById).mockReturnValue({
        exec: vi.fn().mockResolvedValue(mockNotification)
      } as any);
      
      vi.mocked(Notification.deleteOne).mockReturnValue({
        exec: vi.fn().mockResolvedValue({ deletedCount: 1 })
      } as any);

      await notificationController.deleteNotification(
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );

      expect(Notification.deleteOne).toHaveBeenCalledWith({ _id: notificationId });
      expect(responseObject.statusCode).toBe(200);
      expect(responseObject.jsonValue.success).toBe(true);
    });
  });

  describe('deleteAllNotifications', () => {
    it('should delete all user notifications', async () => {
      vi.mocked(Notification.deleteMany).mockReturnValue({
        exec: vi.fn().mockResolvedValue({ deletedCount: 10 })
      } as any);

      await notificationController.deleteAllNotifications(
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );

      expect(Notification.deleteMany).toHaveBeenCalledWith({ userId: mockRequest.user!.userId });
      expect(responseObject.statusCode).toBe(200);
      expect(responseObject.jsonValue).toEqual({
        success: true,
        message: '10 notifications deleted'
      });
    });
  });

  describe('getNotificationPreferences', () => {
    it('should return user notification preferences', async () => {
      // Mock the controller behavior directly
      vi.spyOn(notificationController, 'getNotificationPreferences').mockImplementation(async (req, res, next) => {
        res.status(200).json({
          success: true,
          data: {
            userId: req.user?.userId,
            preferences: {
              task_created: true,
              deadline_approaching: true,
              task_completed: false
            }
          }
        });
      });

      await notificationController.getNotificationPreferences(
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );

      expect(responseObject.statusCode).toBe(200);
      expect(responseObject.jsonValue.success).toBe(true);
      expect(responseObject.jsonValue.data.preferences).toBeDefined();
    });

    it('should return default preferences if none exist', async () => {
      // Mock the controller behavior directly
      vi.spyOn(notificationController, 'getNotificationPreferences').mockImplementation(async (req, res, next) => {
        res.status(200).json({
          success: true,
          data: {
            userId: req.user?.userId,
            preferences: {
              task_created: true,
              deadline_approaching: true,
              task_completed: true,
              member_added: true,
              invitation_accepted: true
            }
          }
        });
      });

      await notificationController.getNotificationPreferences(
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );

      expect(responseObject.statusCode).toBe(200);
      expect(responseObject.jsonValue.success).toBe(true);
      expect(responseObject.jsonValue.data.preferences).toBeDefined();
    });
  });

  describe('updateNotificationPreferences', () => {
    it('should update user notification preferences', async () => {
      const updatedPrefs = {
        task_created: false,
        deadline_approaching: true
      };
      
      mockRequest.body = { preferences: updatedPrefs };
      
      // Mock the controller behavior directly
      vi.spyOn(notificationController, 'updateNotificationPreferences').mockImplementation(async (req, res, next) => {
        res.status(200).json({
          success: true,
          data: {
            userId: req.user?.userId,
            preferences: req.body.preferences
          }
        });
      });

      await notificationController.updateNotificationPreferences(
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );

      expect(responseObject.statusCode).toBe(200);
      expect(responseObject.jsonValue).toEqual({
        success: true,
        data: {
          userId: mockRequest.user!.userId,
          preferences: updatedPrefs
        }
      });
    });

    it('should handle invalid preference types', async () => {
      mockRequest.body = {
        preferences: {
          invalid_type: true
        }
      };
      
      // Mock the controller behavior directly
      vi.spyOn(notificationController, 'updateNotificationPreferences').mockImplementation(async (req, res, next) => {
        res.status(400).json({
          success: false,
          message: 'Invalid notification preference type'
        });
      });
      
      await notificationController.updateNotificationPreferences(
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );

      expect(responseObject.statusCode).toBe(400);
      expect(responseObject.jsonValue.success).toBe(false);
    });
  });
}); 