import { describe, it, expect, beforeAll, afterAll, beforeEach, afterEach } from 'vitest';
import request from 'supertest';
import mongoose from 'mongoose';
import { app } from '../../app';
import { User } from '../../models/User';
import { Task } from '../../models/Task';
import { generateToken } from '../../utils/auth';

describe('Task Routes', () => {
  let token: string;
  let userId: string;

  beforeAll(async () => {
    await mongoose.connect(process.env.MONGODB_URI as string);
  });

  afterAll(async () => {
    await mongoose.connection.dropDatabase();
    await mongoose.connection.close();
  });

  beforeEach(async () => {
    // Clean up the database
    await User.deleteMany({});
    await Task.deleteMany({});

    // Create test user and generate token
    const testUser = {
      email: 'test@example.com',
      password: 'password123',
      firstName: 'Test',
      lastName: 'User',
      role: 'parent'
    };
    const user = await User.create(testUser);
    userId = user._id.toString();
    token = generateToken(user);
  });

  afterEach(async () => {
    await User.deleteMany({});
    await Task.deleteMany({});
  });

  describe('POST /api/tasks', () => {
    it('should create a new task', async () => {
      const taskData = {
        title: 'Test Task',
        description: 'Test Description',
        priority: 'high',
        dueDate: new Date().toISOString()
      };

      const response = await request(app)
        .post('/api/tasks')
        .set('Authorization', `Bearer ${token}`)
        .send(taskData);

      expect(response.status).toBe(201);
      expect(response.body).toHaveProperty('_id');
      expect(response.body.title).toBe(taskData.title);
    });

    it('should validate required fields', async () => {
      const response = await request(app)
        .post('/api/tasks')
        .set('Authorization', `Bearer ${token}`)
        .send({});

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('errors');
    });
  });

  describe('GET /api/tasks', () => {
    it('should get all tasks for user', async () => {
      // Create test tasks
      await Task.create([
        {
          title: 'Task 1',
          userId: new mongoose.Types.ObjectId(userId),
          status: 'todo'
        },
        {
          title: 'Task 2',
          userId: new mongoose.Types.ObjectId(userId),
          status: 'completed'
        }
      ]);

      const response = await request(app)
        .get('/api/tasks')
        .set('Authorization', `Bearer ${token}`);

      expect(response.status).toBe(200);
      expect(response.body).toHaveLength(2);
    });

    it('should filter tasks by status', async () => {
      await Task.create([
        {
          title: 'Task 1',
          userId: new mongoose.Types.ObjectId(userId),
          status: 'todo'
        },
        {
          title: 'Task 2',
          userId: new mongoose.Types.ObjectId(userId),
          status: 'completed'
        }
      ]);

      const response = await request(app)
        .get('/api/tasks?status=todo')
        .set('Authorization', `Bearer ${token}`);

      expect(response.status).toBe(200);
      expect(response.body).toHaveLength(1);
      expect(response.body[0].status).toBe('todo');
    });
  });

  describe('GET /api/tasks/:id', () => {
    it('should get a task by id', async () => {
      const task = await Task.create({
        title: 'Test Task',
        userId: new mongoose.Types.ObjectId(userId)
      });

      const response = await request(app)
        .get(`/api/tasks/${task._id}`)
        .set('Authorization', `Bearer ${token}`);

      expect(response.status).toBe(200);
      expect(response.body._id).toBe(task._id.toString());
    });

    it('should return 404 for non-existent task', async () => {
      const response = await request(app)
        .get(`/api/tasks/${new mongoose.Types.ObjectId()}`)
        .set('Authorization', `Bearer ${token}`);

      expect(response.status).toBe(404);
    });
  });

  describe('PUT /api/tasks/:id', () => {
    it('should update a task', async () => {
      const task = await Task.create({
        title: 'Original Title',
        userId: new mongoose.Types.ObjectId(userId)
      });

      const response = await request(app)
        .put(`/api/tasks/${task._id}`)
        .set('Authorization', `Bearer ${token}`)
        .send({ title: 'Updated Title' });

      expect(response.status).toBe(200);
      expect(response.body.title).toBe('Updated Title');
    });
  });

  describe('DELETE /api/tasks/:id', () => {
    it('should delete a task', async () => {
      const task = await Task.create({
        title: 'Test Task',
        userId: new mongoose.Types.ObjectId(userId)
      });

      const response = await request(app)
        .delete(`/api/tasks/${task._id}`)
        .set('Authorization', `Bearer ${token}`);

      expect(response.status).toBe(200);
      expect(response.body.message).toBe('Task deleted successfully');

      const deletedTask = await Task.findById(task._id);
      expect(deletedTask).toBeNull();
    });
  });

  describe('PATCH /api/tasks/:id/status', () => {
    it('should update task status', async () => {
      const task = await Task.create({
        title: 'Test Task',
        userId: new mongoose.Types.ObjectId(userId),
        status: 'todo'
      });

      const response = await request(app)
        .patch(`/api/tasks/${task._id}/status`)
        .set('Authorization', `Bearer ${token}`)
        .send({ status: 'completed' });

      expect(response.status).toBe(200);
      expect(response.body.status).toBe('completed');
    });

    it('should validate status value', async () => {
      const task = await Task.create({
        title: 'Test Task',
        userId: new mongoose.Types.ObjectId(userId),
        status: 'todo'
      });

      const response = await request(app)
        .patch(`/api/tasks/${task._id}/status`)
        .set('Authorization', `Bearer ${token}`)
        .send({ status: 'invalid' });

      expect(response.status).toBe(400);
    });
  });
}); 