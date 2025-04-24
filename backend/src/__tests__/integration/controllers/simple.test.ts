/**
 * @vitest-environment node
 * @vitest-skip-setup
 */
import { describe, it, expect } from 'vitest';
import request from 'supertest';
import { app } from '../../../app';

// Simple test to verify Supertest works with the Express app
describe('Simple Supertest Test', () => {
  it('server should respond to base API route', async () => {
    const response = await request(app)
      .get('/api')
      .expect(200);
    
    expect(response.body).toHaveProperty('message');
  });

  it('should return 401 for tasks endpoint without auth', async () => {
    const response = await request(app)
      .get('/api/tasks')
      .expect(401);
    
    expect(response.body).toHaveProperty('message', 'No token provided');
  });
}); 