import { describe, it, expect, beforeEach } from 'vitest';
import mongoose from 'mongoose';
import request from 'supertest';
import { app } from '../app';
import { User } from '../models/User';
import { generateToken } from '../utils/auth';

const testUserData = {
  email: 'auth_test_user@example.com',
  password: 'password123',
  firstName: 'Test',
  lastName: 'User',
  role: 'parent'
};

describe('Auth API', () => {
  let testUser: any;
  let authToken: string;

  beforeEach(async () => {
    // Clean up before each test
    await User.deleteMany({});
    
    // Create test user
    testUser = await User.create(testUserData);
    authToken = generateToken(testUser);
  });

  describe('POST /api/auth/register', () => {
    it('should register a new user successfully', async () => {
      const newUserData = {
        email: 'auth_new_user@example.com',
        password: 'password123',
        firstName: 'New',
        lastName: 'User',
        role: 'parent'
      };

      const response = await request(app)
        .post('/api/auth/register')
        .send(newUserData);

      expect(response.status).toBe(201);
      expect(response.body).toHaveProperty('token');
      expect(response.body).toHaveProperty('user');
      expect(response.body.user).toHaveProperty('email', newUserData.email);
    });

    it('should return error for invalid registration data', async () => {
      const response = await request(app)
        .post('/api/auth/register')
        .send({
          email: 'invalid-email',
          password: '123'
        });

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('errors');
    });
  });

  describe('POST /api/auth/login', () => {
    it('should login existing user', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({
          email: testUserData.email,
          password: testUserData.password
        });

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('token');
    });

    it('should not login with invalid credentials', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({
          email: testUserData.email,
          password: 'wrongpassword'
        });

      expect(response.status).toBe(401);
    });
  });
}); 