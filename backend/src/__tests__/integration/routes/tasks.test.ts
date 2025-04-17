import { describe, it, expect, beforeAll, beforeEach, afterAll, afterEach } from 'vitest';
import request from 'supertest';
import mongoose from 'mongoose';
import { app } from '@/app';
import { User } from '@/models/User';
import { Task } from '@/models/Task';
import { Family } from '@/models/Family';
import { generateToken } from '@/utils/auth';

describe('Task Routes', () => {
  let token: string;
  let userId: string;
  let familyId: string;
  let mongoServer: any;

  // beforeAll(async () => {
  //   // Set up MongoDB Memory Server for testing
  //   const { MongoMemoryServer } = await import('mongodb-memory-server');
  //   mongoServer = await MongoMemoryServer.create();
  //   const mongoUri = mongoServer.getUri();
  //   await mongoose.connect(mongoUri);
  // });

  // afterAll(async () => {
  //   await mongoose.disconnect();
  //   await mongoServer.stop();
  // });

  beforeEach(async () => {
    // Set up JWT secrets for testing
    process.env.JWT_ACCESS_SECRET = 'test-access-secret';
    process.env.JWT_REFRESH_SECRET = 'test-refresh-secret';
    
    // Clean up the database
    await User.deleteMany({});
    await Task.deleteMany({});
    await Family.deleteMany({});

    // Create test user and generate token
    const testUser = {
      email: 'task_test_user@example.com',
      password: 'password123',
      firstName: 'Test',
      lastName: 'User',
      role: 'parent'
    };
    const user = await User.create(testUser);
    userId = user._id.toString();
    token = generateToken(user);

    // Create a family for testing
    const family = await Family.create({
      name: 'Test Family',
      creator: user._id,
      members: [
        {
          user: user._id,
          role: 'admin'
        }
      ]
    });
    familyId = family._id.toString();
  });

  afterEach(async () => {
    await Task.deleteMany({});
  });

  describe('POST /api/tasks', () => {
    it('should create a new task', async () => {
      const taskData = {
        title: 'Test Task',
        description: 'Test Description',
        priority: 'high',
        dueDate: new Date().toISOString(),
        familyId: familyId
      };

      const response = await request(app)
        .post('/api/tasks')
        .set('Authorization', `Bearer ${token}`)
        .send(taskData);

      expect(response.status).toBe(201);
      expect(response.body.message).toBe('Task created successfully');
      expect(response.body.task).toHaveProperty('_id');
      expect(response.body.task.title).toBe(taskData.title);
      expect(response.body.task.createdBy).toBeTruthy();
      expect(response.body.task.family).toBe(familyId);
    });

    it('should validate required fields', async () => {
      const response = await request(app)
        .post('/api/tasks')
        .set('Authorization', `Bearer ${token}`)
        .send({});  // Missing title and familyId

      expect(response.status).toBe(400);
      expect(response.body.message).toBe('Title is required');
    });

    it('should require authentication', async () => {
      const taskData = {
        title: 'Test Task',
        description: 'Test Description',
        familyId: familyId
      };

      const response = await request(app)
        .post('/api/tasks')
        .send(taskData);  // No authorization header

      expect(response.status).toBe(401);
    });
  });

  describe('GET /api/tasks', () => {
    beforeEach(async () => {
      // Create test tasks
      await Task.create([
        {
          title: 'Task 1',
          createdBy: new mongoose.Types.ObjectId(userId),
          family: new mongoose.Types.ObjectId(familyId),
          assignees: [new mongoose.Types.ObjectId(userId)],
          status: 'pending'
        },
        {
          title: 'Task 2',
          createdBy: new mongoose.Types.ObjectId(userId),
          family: new mongoose.Types.ObjectId(familyId),
          assignees: [new mongoose.Types.ObjectId(userId)],
          status: 'completed'
        }
      ]);
    });

    it('should get all tasks for a family', async () => {
      const response = await request(app)
        .get(`/api/tasks?familyId=${familyId}`)
        .set('Authorization', `Bearer ${token}`);

      expect(response.status).toBe(200);
      expect(response.body.message).toBe('Tasks retrieved successfully');
      expect(response.body.tasks).toHaveLength(2);
    });

    it('should filter tasks by status', async () => {
      const response = await request(app)
        .get(`/api/tasks?status=pending&familyId=${familyId}`)
        .set('Authorization', `Bearer ${token}`);

      expect(response.status).toBe(200);
      expect(response.body.message).toBe('Tasks retrieved successfully');
      expect(response.body.tasks).toHaveLength(1);
      expect(response.body.tasks[0].status).toBe('pending');
    });

    it('should require authentication', async () => {
      const response = await request(app)
        .get('/api/tasks');  // No authorization header

      expect(response.status).toBe(401);
    });
  });

  describe('GET /api/tasks/:id', () => {
    let taskId: string;

    beforeEach(async () => {
      // Create a test task
      const task = await Task.create({
        title: 'Test Task',
        createdBy: new mongoose.Types.ObjectId(userId),
        family: new mongoose.Types.ObjectId(familyId),
        assignees: [new mongoose.Types.ObjectId(userId)]
      });
      taskId = task._id.toString();
    });

    it('should get a task by id', async () => {
      const response = await request(app)
        .get(`/api/tasks/${taskId}`)
        .set('Authorization', `Bearer ${token}`);

      expect(response.status).toBe(200);
      expect(response.body.message).toBe('Task retrieved successfully');
      expect(response.body.task._id).toBe(taskId);
    });

    it('should return 404 for non-existent task', async () => {
      const nonExistentId = new mongoose.Types.ObjectId().toString();
      
      const response = await request(app)
        .get(`/api/tasks/${nonExistentId}`)
        .set('Authorization', `Bearer ${token}`);

      expect(response.status).toBe(404);
      expect(response.body.message).toBe('Task not found');
    });

    it('should require authentication', async () => {
      const response = await request(app)
        .get(`/api/tasks/${taskId}`);  // No authorization header

      expect(response.status).toBe(401);
    });
  });

  describe('PUT /api/tasks/:id', () => {
    let taskId: string;

    beforeEach(async () => {
      // Create a test task
      const task = await Task.create({
        title: 'Original Title',
        createdBy: new mongoose.Types.ObjectId(userId),
        family: new mongoose.Types.ObjectId(familyId),
        assignees: [new mongoose.Types.ObjectId(userId)]
      });
      taskId = task._id.toString();
    });

    it('should update a task', async () => {
      const updateData = {
        title: 'Updated Title',
        description: 'Updated Description'
      };

      const response = await request(app)
        .put(`/api/tasks/${taskId}`)
        .set('Authorization', `Bearer ${token}`)
        .send(updateData);

      expect(response.status).toBe(200);
      expect(response.body.message).toBe('Task updated successfully');
      expect(response.body.task.title).toBe('Updated Title');
      expect(response.body.task.description).toBe('Updated Description');
    });

    it('should return 404 for non-existent task', async () => {
      const nonExistentId = new mongoose.Types.ObjectId().toString();
      
      const response = await request(app)
        .put(`/api/tasks/${nonExistentId}`)
        .set('Authorization', `Bearer ${token}`)
        .send({ title: 'Updated Title' });

      expect(response.status).toBe(404);
      expect(response.body.message).toBe('Task not found');
    });

    it('should require authentication', async () => {
      const response = await request(app)
        .put(`/api/tasks/${taskId}`)
        .send({ title: 'Updated Title' });  // No authorization header

      expect(response.status).toBe(401);
    });
  });

  describe('DELETE /api/tasks/:id', () => {
    let taskId: string;

    beforeEach(async () => {
      // Create a test task
      const task = await Task.create({
        title: 'Test Task',
        createdBy: new mongoose.Types.ObjectId(userId),
        family: new mongoose.Types.ObjectId(familyId),
        assignees: [new mongoose.Types.ObjectId(userId)]
      });
      taskId = task._id.toString();
    });

    it('should delete a task', async () => {
      const response = await request(app)
        .delete(`/api/tasks/${taskId}`)
        .set('Authorization', `Bearer ${token}`);

      expect(response.status).toBe(200);
      expect(response.body.message).toBe('Task deleted successfully');

      const deletedTask = await Task.findById(taskId);
      expect(deletedTask).toBeNull();
    });

    it('should return 404 for non-existent task', async () => {
      const nonExistentId = new mongoose.Types.ObjectId().toString();
      
      const response = await request(app)
        .delete(`/api/tasks/${nonExistentId}`)
        .set('Authorization', `Bearer ${token}`);

      expect(response.status).toBe(404);
      expect(response.body.message).toBe('Task not found');
    });

    it('should require authentication', async () => {
      const response = await request(app)
        .delete(`/api/tasks/${taskId}`);  // No authorization header

      expect(response.status).toBe(401);
    });
  });

  describe('PATCH /api/tasks/:id/status', () => {
    let taskId: string;

    beforeEach(async () => {
      // Create a test task
      const task = await Task.create({
        title: 'Test Task',
        createdBy: new mongoose.Types.ObjectId(userId),
        family: new mongoose.Types.ObjectId(familyId),
        assignees: [new mongoose.Types.ObjectId(userId)],
        status: 'pending'
      });
      taskId = task._id.toString();
    });

    it('should update task status', async () => {
      const response = await request(app)
        .patch(`/api/tasks/${taskId}/status`)
        .set('Authorization', `Bearer ${token}`)
        .send({ status: 'completed' });

      expect(response.status).toBe(200);
      expect(response.body.message).toBe('Task status updated successfully');
      expect(response.body.task.status).toBe('completed');
      
      // Check that completedAt and completedBy were set
      expect(response.body.task.completedAt).toBeTruthy();
      expect(response.body.task.completedBy).toBeTruthy();
    });

    it('should validate status value', async () => {
      const response = await request(app)
        .patch(`/api/tasks/${taskId}/status`)
        .set('Authorization', `Bearer ${token}`)
        .send({ status: 'invalid-status' });

      expect(response.status).toBe(400);
      expect(response.body.message).toBe('Invalid status value');
    });

    it('should require authentication', async () => {
      const response = await request(app)
        .patch(`/api/tasks/${taskId}/status`)
        .send({ status: 'completed' });  // No authorization header

      expect(response.status).toBe(401);
    });
  });
}); 