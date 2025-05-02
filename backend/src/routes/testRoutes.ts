// Rule applied: Implement proper error handling
// Rule applied: Use TypeScript for all code; prefer interfaces over types

import express from 'express';
import { createTestUsers, cleanupTestData, resetRateLimits } from '../controllers/testController';
import { restrictToEnvironments } from '../middleware/environmentCheck';

const router = express.Router();

// Middleware to restrict all test routes to development and test environments
const testEnvOnly = restrictToEnvironments(['development', 'test']);

/**
 * @swagger
 * /api/test/setup:
 *   get:
 *     summary: Set up test data (test users, etc.)
 *     description: Creates test users and other data needed for e2e tests
 *     tags: [Test]
 *     responses:
 *       200:
 *         description: Test data setup complete
 */
router.get('/setup', testEnvOnly, createTestUsers);

/**
 * @swagger
 * /api/test/cleanup:
 *   post:
 *     summary: Clean up test data
 *     description: Removes test data created during e2e tests
 *     tags: [Test]
 *     parameters:
 *       - in: query
 *         name: flockId
 *         schema:
 *           type: string
 *         description: Optional flock ID to clean up specific flock data
 *     responses:
 *       200:
 *         description: Test data cleanup complete
 *       403:
 *         description: Endpoint not available in current environment
 */
router.post('/cleanup', testEnvOnly, cleanupTestData);

/**
 * @swagger
 * /api/test/reset-rate-limits:
 *   post:
 *     summary: Reset rate limits for e2e testing
 *     description: Resets any rate limiting for test purposes
 *     tags: [Test]
 *     responses:
 *       200:
 *         description: Rate limits reset successfully
 *       403:
 *         description: Endpoint not available in current environment
 */
router.post('/reset-rate-limits', testEnvOnly, resetRateLimits);

export default router;
