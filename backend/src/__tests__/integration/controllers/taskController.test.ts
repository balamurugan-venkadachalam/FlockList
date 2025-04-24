import { describe, it, expect, beforeAll, afterAll, beforeEach } from 'vitest';
import request from 'supertest';
import mongoose from 'mongoose';
import { app } from '../../../app';
import { setupTestMongoDB, clearDatabase, closeDatabase } from '../../utils/testSetup';
import { Task } from '../../../models/Task';
import { User } from '../../../models/User';
import { Flock } from '../../../models/Flock';
import { generateToken } from '../../../utils/auth';

// Use describe.skip to temporarily disable the test suite
describe('Task API Integration Tests', () => {
  // Test users
  let testUser: any;
  let otherUser: any;
  
  // Auth tokens
  let testUserToken: string;
  let otherUserToken: string;

  // Test flock
  let testFlock: any;
  
  // Test task
  let testTask: any;

  beforeAll(async () => {
    // Set up the in-memory MongoDB server
    await setupTestMongoDB();
    
    // Set JWT secret for authentication
    process.env.JWT_SECRET = 'test-jwt-secret';
  });

  afterAll(async () => {
    // Close MongoDB connection and stop server
    await closeDatabase();
  });

  beforeEach(async () => {
    // Clean up collections before each test
    await clearDatabase();
    
    // Create test users for each test
    testUser = await User.create({
      _id: new mongoose.Types.ObjectId(),
      email: 'user@example.com',
      firstName: 'Test',
      lastName: 'User',
      password: 'password123',
      role: 'admin',
    });

    otherUser = await User.create({
      _id: new mongoose.Types.ObjectId(),
      email: 'other@example.com',
      firstName: 'Other',
      lastName: 'User',
      password: 'password123',
      role: 'admin',
    });

    // Generate auth tokens
    testUserToken = generateToken(testUser);
    otherUserToken = generateToken(otherUser);

    // Create a test flock
    testFlock = await Flock.create({
      name: 'Test Flock',
      createdBy: testUser._id,
      members: [
        {
          user: testUser._id,
          role: 'admin',
          joinedAt: new Date()
        }
      ]
    });
  });

  describe('POST /api/tasks', () => {
    it('should create a new task', async () => {
      const taskData = {
        title: 'Test Task',
        description: 'Test Description',
        priority: 'high',
        dueDate: new Date('2023-12-31').toISOString(),
        flockId: testFlock._id.toString()
      };

      const response = await request(app)
        .post('/api/tasks')
        .set('Authorization', `Bearer ${testUserToken}`)
        .send(taskData)
        .expect(201);

      expect(response.body.message).toBe('Task created successfully');
      expect(response.body.task.title).toBe('Test Task');
      expect(response.body.task.description).toBe('Test Description');
      expect(response.body.task.priority).toBe('high');
      expect(response.body.task.status).toBe('pending');
      
      // Save the created task for later validation
      testTask = response.body.task;
      
      // Verify in database
      const savedTask = await Task.findById(testTask._id);
      expect(savedTask).not.toBeNull();
      expect(savedTask?.title).toBe('Test Task');
    });

    it('should return 401 if user is not authenticated', async () => {
      const taskData = {
        title: 'Test Task',
        description: 'Test Description',
        flockId: testFlock._id.toString()
      };

      const response = await request(app)
        .post('/api/tasks')
        .send(taskData)
        .expect(401);

      expect(response.body).toHaveProperty('message');
      expect(response.body.message).toContain('No token provided');
    });

    it('should return 400 if required fields are missing', async () => {
      const taskData = {
        // Missing title
        description: 'Test Description',
        flockId: testFlock._id.toString()
      };

      const response = await request(app)
        .post('/api/tasks')
        .set('Authorization', `Bearer ${testUserToken}`)
        .send(taskData)
        .expect(400);

      expect(response.body).toHaveProperty('message');
      expect(response.body.message).toContain('Title is required');
    });
  });

  describe('GET /api/tasks', () => {
    beforeEach(async () => {
      // Create test tasks for the user
      testTask = await Task.create({
        title: 'Task 1',
        description: 'Description 1',
        priority: 'medium',
        status: 'pending',
        createdBy: testUser._id,
        flock: testFlock._id,
        assignees: [testUser._id]
      });

      await Task.create({
        title: 'Task 2',
        description: 'Description 2',
        priority: 'high',
        status: 'in_progress',
        createdBy: testUser._id,
        flock: testFlock._id,
        assignees: [testUser._id]
      });

      // Create a task for another user
      await Task.create({
        title: 'Other User Task',
        description: 'Not for test user',
        priority: 'low',
        status: 'pending',
        createdBy: otherUser._id,
        flock: testFlock._id,
        assignees: [otherUser._id]
      });
    });

    it('should return all tasks for a flock', async () => {
      const response = await request(app)
        .get(`/api/tasks?flockId=${testFlock._id.toString()}`)
        .set('Authorization', `Bearer ${testUserToken}`)
        .expect(200);

      expect(response.body.message).toBe('Tasks retrieved successfully');
      expect(response.body.tasks.length).toBe(3);
      expect(response.body.tasks.some((task: any) => task.title === 'Task 1')).toBe(true);
      expect(response.body.tasks.some((task: any) => task.title === 'Task 2')).toBe(true);
      expect(response.body.tasks.some((task: any) => task.title === 'Other User Task')).toBe(true);
    });

    it('should return only tasks assigned to the user when no flock specified', async () => {
      const response = await request(app)
        .get('/api/tasks')
        .set('Authorization', `Bearer ${testUserToken}`)
        .expect(200);

      expect(response.body.message).toBe('Tasks retrieved successfully');
      expect(response.body.tasks.length).toBe(2);
      expect(response.body.tasks.some((task: any) => task.title === 'Task 1')).toBe(true);
      expect(response.body.tasks.some((task: any) => task.title === 'Task 2')).toBe(true);
      expect(response.body.tasks.some((task: any) => task.title === 'Other User Task')).toBe(false);
    });

    it('should filter tasks by status', async () => {
      const response = await request(app)
        .get(`/api/tasks?status=in_progress&flockId=${testFlock._id.toString()}`)
        .set('Authorization', `Bearer ${testUserToken}`)
        .expect(200);

      expect(response.body.message).toBe('Tasks retrieved successfully');
      expect(response.body.tasks.length).toBe(1);
      expect(response.body.tasks[0].title).toBe('Task 2');
      expect(response.body.tasks[0].status).toBe('in_progress');
    });

    it('should filter tasks by priority', async () => {
      const response = await request(app)
        .get(`/api/tasks?priority=high&flockId=${testFlock._id.toString()}`)
        .set('Authorization', `Bearer ${testUserToken}`)
        .expect(200);

      expect(response.body.message).toBe('Tasks retrieved successfully');
      expect(response.body.tasks.length).toBe(1);
      expect(response.body.tasks[0].title).toBe('Task 2');
      expect(response.body.tasks[0].priority).toBe('high');
    });

    it('should return 401 if user is not authenticated', async () => {
      await request(app)
        .get('/api/tasks')
        .expect(401);
    });
  });

  describe('GET /api/tasks/:id', () => {
    beforeEach(async () => {
      // Create a test task
      testTask = await Task.create({
        title: 'Test Task',
        description: 'Test Description',
        priority: 'medium',
        status: 'pending',
        createdBy: testUser._id,
        flock: testFlock._id,
        assignees: [testUser._id]
      });
    });

    it('should return a task by ID if user is assignee', async () => {
      const response = await request(app)
        .get(`/api/tasks/${testTask._id}`)
        .set('Authorization', `Bearer ${testUserToken}`)
        .expect(200);

      expect(response.body.message).toBe('Task retrieved successfully');
      expect(response.body.task._id.toString()).toBe(testTask._id.toString());
      expect(response.body.task.title).toBe('Test Task');
    });

    it('should return 404 if task does not exist', async () => {
      const nonExistentId = new mongoose.Types.ObjectId();
      
      const response = await request(app)
        .get(`/api/tasks/${nonExistentId}`)
        .set('Authorization', `Bearer ${testUserToken}`)
        .expect(404);

      expect(response.body).toHaveProperty('message');
      expect(response.body.message).toBe('Task not found');
    });

    it('should return 403 if user is not assignee or creator', async () => {
      // Create a different user for this test
      const nonAuthorizedUser = await User.create({
        email: 'unauthorized@example.com',
        firstName: 'Unauthorized',
        lastName: 'User',
        password: 'password123',
        role: 'admin',
      });

      const nonAuthToken = generateToken(nonAuthorizedUser);

      // Create a task specifically for this test
      const testTaskForAuth = await Task.create({
        title: 'Auth Test Task',
        description: 'Test Description',
        priority: 'medium',
        status: 'pending',
        createdBy: testUser._id,
        flock: testFlock._id,
        assignees: [testUser._id] // Only the original test user is assigned
      });

      const response = await request(app)
        .get(`/api/tasks/${testTaskForAuth._id}`)
        .set('Authorization', `Bearer ${nonAuthToken}`)
        .expect(403);

      expect(response.body).toHaveProperty('message');
      expect(response.body.message).toBe('Not authorized to view this task');
    });
  });

  describe('PUT /api/tasks/:id', () => {
    beforeEach(async () => {
      // Create a test task
      testTask = await Task.create({
        title: 'Original Title',
        description: 'Original Description',
        priority: 'medium',
        status: 'pending',
        createdBy: testUser._id,
        flock: testFlock._id,
        assignees: [testUser._id]
      });
    });

    it('should update a task if user is creator', async () => {
      const updateData = {
        title: 'Updated Title',
        description: 'Updated Description',
        priority: 'high'
      };

      const response = await request(app)
        .put(`/api/tasks/${testTask._id}`)
        .set('Authorization', `Bearer ${testUserToken}`)
        .send(updateData)
        .expect(200);

      expect(response.body.message).toBe('Task updated successfully');
      expect(response.body.task.title).toBe('Updated Title');
      expect(response.body.task.description).toBe('Updated Description');
      expect(response.body.task.priority).toBe('high');
      
      // Verify in database
      const updatedTask = await Task.findById(testTask._id);
      expect(updatedTask?.title).toBe('Updated Title');
      expect(updatedTask?.description).toBe('Updated Description');
    });

    it('should return 404 if task does not exist', async () => {
      const nonExistentId = new mongoose.Types.ObjectId();
      
      const response = await request(app)
        .put(`/api/tasks/${nonExistentId}`)
        .set('Authorization', `Bearer ${testUserToken}`)
        .send({ title: 'Updated Title' })
        .expect(404);

      expect(response.body).toHaveProperty('message');
      expect(response.body.message).toBe('Task not found');
    });

    it('should return 403 if user is not creator or assignee', async () => {
      // Create a task that the other user is not assigned to
      const taskForTestUser = await Task.create({
        title: 'Not Assigned',
        description: 'Not assigned to other user',
        priority: 'medium',
        status: 'pending',
        createdBy: testUser._id,
        flock: testFlock._id,
        assignees: [testUser._id] // Only the test user is assigned
      });

      const response = await request(app)
        .put(`/api/tasks/${taskForTestUser._id}`)
        .set('Authorization', `Bearer ${otherUserToken}`)
        .send({ title: 'Should Not Update' })
        .expect(403);

      expect(response.body).toHaveProperty('message');
      expect(response.body.message).toBe('Not authorized to update this task');
    });
  });

  describe('DELETE /api/tasks/:id', () => {
    beforeEach(async () => {
      // Create a test task
      testTask = await Task.create({
        title: 'Task to Delete',
        description: 'Will be deleted',
        priority: 'medium',
        status: 'pending',
        createdBy: testUser._id,
        flock: testFlock._id,
        assignees: [testUser._id]
      });
    });

    it('should delete a task if user is creator', async () => {
      const response = await request(app)
        .delete(`/api/tasks/${testTask._id}`)
        .set('Authorization', `Bearer ${testUserToken}`)
        .expect(200);

      expect(response.body.message).toBe('Task deleted successfully');
      
      // Verify task is deleted in database
      const deletedTask = await Task.findById(testTask._id);
      expect(deletedTask).toBeNull();
    });

    it('should return 404 if task does not exist', async () => {
      const nonExistentId = new mongoose.Types.ObjectId();
      
      const response = await request(app)
        .delete(`/api/tasks/${nonExistentId}`)
        .set('Authorization', `Bearer ${testUserToken}`)
        .expect(404);

      expect(response.body).toHaveProperty('message');
      expect(response.body.message).toBe('Task not found');
    });

    it('should return 403 if user is not the creator', async () => {
      const response = await request(app)
        .delete(`/api/tasks/${testTask._id}`)
        .set('Authorization', `Bearer ${otherUserToken}`)
        .expect(403);

      expect(response.body).toHaveProperty('message');
      expect(response.body.message).toBe('Not authorized to delete this task');
    });
  });

  describe('PATCH /api/tasks/:id/status', () => {
    beforeEach(async () => {
      // Create a test task
      testTask = await Task.create({
        title: 'Status Task',
        description: 'Status will be updated',
        priority: 'medium',
        status: 'pending',
        createdBy: testUser._id,
        flock: testFlock._id,
        assignees: [testUser._id]
      });
    });

    it('should update task status to completed if user is assignee', async () => {
      const response = await request(app)
        .patch(`/api/tasks/${testTask._id}/status`)
        .set('Authorization', `Bearer ${testUserToken}`)
        .send({ status: 'completed' })
        .expect(200);

      expect(response.body.message).toBe('Task status updated successfully');
      expect(response.body.task.status).toBe('completed');
      
      // Verify in database
      const updatedTask = await Task.findById(testTask._id);
      expect(updatedTask?.status).toBe('completed');
      expect(updatedTask?.completedAt).toBeDefined();
      expect(updatedTask?.completedBy?.toString()).toBe(testUser._id.toString());
    });

    it('should update task status to in_progress', async () => {
      const response = await request(app)
        .patch(`/api/tasks/${testTask._id}/status`)
        .set('Authorization', `Bearer ${testUserToken}`)
        .send({ status: 'in_progress' })
        .expect(200);

      expect(response.body.message).toBe('Task status updated successfully');
      expect(response.body.task.status).toBe('in_progress');
      
      // Verify in database
      const updatedTask = await Task.findById(testTask._id);
      expect(updatedTask?.status).toBe('in_progress');
    });

    it('should remove completedAt and completedBy when changing from completed to another status', async () => {
      // First mark as completed
      await Task.findByIdAndUpdate(testTask._id, {
        status: 'completed',
        completedAt: new Date(),
        completedBy: testUser._id
      });

      const response = await request(app)
        .patch(`/api/tasks/${testTask._id}/status`)
        .set('Authorization', `Bearer ${testUserToken}`)
        .send({ status: 'pending' })
        .expect(200);

      // Verify in database
      const updatedTask = await Task.findById(testTask._id);
      expect(updatedTask?.status).toBe('pending');
      expect(updatedTask?.completedAt).toBeUndefined();
      expect(updatedTask?.completedBy).toBeUndefined();
    });

    it('should return 400 for invalid status value', async () => {
      const response = await request(app)
        .patch(`/api/tasks/${testTask._id}/status`)
        .set('Authorization', `Bearer ${testUserToken}`)
        .send({ status: 'invalid-status' })
        .expect(400);

      expect(response.body).toHaveProperty('message');
      expect(response.body.message).toBe('Invalid status value');
    });

    it('should return 403 if user is not an assignee', async () => {
      const response = await request(app)
        .patch(`/api/tasks/${testTask._id}/status`)
        .set('Authorization', `Bearer ${otherUserToken}`)
        .send({ status: 'completed' })
        .expect(403);

      expect(response.body).toHaveProperty('message');
      expect(response.body.message).toContain('Not authorized');
    });
  });
});
