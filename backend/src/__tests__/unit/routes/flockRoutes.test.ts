import { describe, it, expect, vi, beforeEach } from 'vitest';
import express from 'express';
import request from 'supertest';
import flockRoutes from '../../../routes/flockRoutes';

// Mock the middleware and controllers
vi.mock('../../../middleware/auth', () => ({
  authenticate: vi.fn((req, res, next) => next())
}));

vi.mock('../../../controllers/flockController', () => ({
  createFlock: vi.fn((req, res) => res.json({ message: 'createFlock called' })),
  getFlocks: vi.fn((req, res) => res.json({ message: 'getFlocks called' })),
  getFlockById: vi.fn((req, res) => res.json({ message: 'getFlockById called' })),
  inviteMember: vi.fn((req, res) => res.json({ message: 'inviteMember called' })),
  acceptInvitation: vi.fn((req, res) => res.json({ message: 'acceptInvitation called' })),
  removeMember: vi.fn((req, res) => res.json({ message: 'removeMember called' })),
  getUserInvitations: vi.fn((req, res) => res.json({ message: 'getUserInvitations called' })),
  cancelInvitation: vi.fn((req, res) => res.json({ message: 'cancelInvitation called' }))
}));

describe('Flock Routes', () => {
  let app: express.Application;

  beforeEach(() => {
    app = express();
    app.use(express.json());
    app.use('/api/flocks', flockRoutes);

    // Clear mock calls
    vi.clearAllMocks();
  });

  describe('GET /api/flocks', () => {
    it('should call getFlocks controller', async () => {
      const response = await request(app).get('/api/flocks');
      expect(response.status).toBe(200);
      expect(response.body).toEqual({ message: 'getFlocks called' });
    });
  });

  describe('POST /api/flocks', () => {
    it('should call createFlock controller', async () => {
      const response = await request(app)
        .post('/api/flocks')
        .send({ name: 'Test Flock' });
      
      expect(response.status).toBe(200);
      expect(response.body).toEqual({ message: 'createFlock called' });
    });
  });

  describe('GET /api/flocks/invitations', () => {
    it('should call getUserInvitations controller', async () => {
      const response = await request(app).get('/api/flocks/invitations');
      expect(response.status).toBe(200);
      expect(response.body).toEqual({ message: 'getUserInvitations called' });
    });
  });

  describe('POST /api/flocks/accept-invitation', () => {
    it('should call acceptInvitation controller', async () => {
      const response = await request(app)
        .post('/api/flocks/accept-invitation')
        .send({ token: 'test-token' });
      
      expect(response.status).toBe(200);
      expect(response.body).toEqual({ message: 'acceptInvitation called' });
    });
  });

  describe('GET /api/flocks/:id', () => {
    it('should call getFlockById controller', async () => {
      const response = await request(app).get('/api/flocks/123');
      expect(response.status).toBe(200);
      expect(response.body).toEqual({ message: 'getFlockById called' });
    });
  });

  describe('POST /api/flocks/:id/invite', () => {
    it('should call inviteMember controller', async () => {
      const response = await request(app)
        .post('/api/flocks/123/invite')
        .send({ email: 'test@example.com', role: 'member' });
      
      expect(response.status).toBe(200);
      expect(response.body).toEqual({ message: 'inviteMember called' });
    });
  });

  describe('DELETE /api/flocks/:id/members/:userId', () => {
    it('should call removeMember controller', async () => {
      const response = await request(app).delete('/api/flocks/123/members/456');
      expect(response.status).toBe(200);
      expect(response.body).toEqual({ message: 'removeMember called' });
    });
  });

  describe('DELETE /api/flocks/:id/invitations/:email', () => {
    it('should call cancelInvitation controller', async () => {
      const response = await request(app).delete('/api/flocks/123/invitations/test@example.com');
      expect(response.status).toBe(200);
      expect(response.body).toEqual({ message: 'cancelInvitation called' });
    });
  });

  // Verify route ordering works correctly
  describe('Route ordering', () => {
    it('should not confuse /invitations with /:id', async () => {
      // First test the invitations route
      const invitationsResponse = await request(app).get('/api/flocks/invitations');
      expect(invitationsResponse.body).toEqual({ message: 'getUserInvitations called' });
      
      // Then test a route with an ID that happens to be "invitations"
      const flockResponse = await request(app).get('/api/flocks/invitationsTEST');
      expect(flockResponse.body).toEqual({ message: 'getFlockById called' });
    });
  });
}); 