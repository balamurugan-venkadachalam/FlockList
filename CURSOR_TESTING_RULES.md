# Comprehensive Testing Guidelines

## Test Fix Summaries

When fixing failing tests, provide a structured summary that includes:

1. **Issue Identification**: What was failing and why
2. **Fix Implementation**: What changes were made to fix the issue
3. **Verification**: How the fix was verified (test run results)
4. **Related Issues**: Any other issues discovered during testing that may need attention

Example format:
```
## Test Fix Summary

### Issue Fixed
Describe the specific test failure that was addressed (e.g., "Missing mock for cancelInvitation function in flockRoutes.test.ts")

### Implementation
List the specific changes made:
- Added missing mock to the controller mock object
- Added new test case to verify route functionality

### Verification
Results of test runs showing the fix was successful

### Related Issues
Note any other test failures or issues discovered that may need future attention
```

## Testing Structure

### Unit Tests
- Test individual functions and components in isolation
- Mock all external dependencies
- Focus on one behavior per test case

### Integration Tests
- Use the Supertest approach for all integration tests:
  - Start an actual Express server for testing
  - Make real HTTP requests to test endpoints
  - Validate full request-response cycle
  - Test middleware, routing, and controller integration
- Use a test database (MongoMemoryServer) for data persistence
- Minimal mocking, only for external services (email, payments, etc.)
- Test complete API endpoints end-to-end

### End-to-End Tests
- Test complete user flows
- Use the actual application environment when possible
- Focus on critical user journeys

## Integration Testing with Supertest

### Setup Requirements
1. Use a dedicated test server setup file (`testServer.ts`)
2. Configure MongoMemoryServer for test database
3. Import application Express app for testing
4. Use Supertest to make HTTP requests to endpoints

### Supertest Implementation
- Create a Supertest instance for each test suite:
  ```typescript
  import request from 'supertest';
  import { app } from '../../app';
  import { MongoMemoryServer } from 'mongodb-memory-server';
  import mongoose from 'mongoose';
  
  describe('API Integration Tests', () => {
    let mongoServer: MongoMemoryServer;
    
    beforeAll(async () => {
      mongoServer = await MongoMemoryServer.create();
      await mongoose.connect(mongoServer.getUri());
    });
    
    afterAll(async () => {
      await mongoose.disconnect();
      await mongoServer.stop();
    });
    
    it('should create a new resource', async () => {
      const response = await request(app)
        .post('/api/resource')
        .send({ name: 'Test Resource' })
        .set('Authorization', `Bearer ${testToken}`)
        .expect(201);
        
      expect(response.body).toHaveProperty('id');
      expect(response.body.name).toBe('Test Resource');
    });
  });
  ```

### Authentication in Supertest Tests
- Create authentication utilities for test setup:
  ```typescript
  // Create a helper to generate auth tokens for testing
  async function getAuthToken(role = 'user') {
    const user = await createTestUser(role);
    return generateTestToken(user);
  }
  
  // Use in tests
  const adminToken = await getAuthToken('admin');
  const response = await request(app)
    .get('/api/protected-route')
    .set('Authorization', `Bearer ${adminToken}`)
    .expect(200);
  ```

### Testing Guidelines
1. Test all HTTP methods (GET, POST, PUT, DELETE, etc.)
2. Test response status codes, headers, and body content
3. Test error scenarios (invalid data, unauthorized access, etc.)
4. Verify database state changes after requests when appropriate
5. Clean up test data between tests to ensure isolation

## Test Workflow

1. Write tests before implementation (TDD approach)
2. Run tests locally before pushing changes
3. Address failing tests immediately
4. Update tests when requirements change

## Coverage Requirements

- Unit tests: 90% coverage minimum
- Integration tests: Cover all API endpoints and critical paths
- End-to-End tests: Cover main user flows

## Mocking Strategy

- Use Vitest's `vi.mock()` for module-level mocking
- Prefer function mocks over implementation mocks
- Document complex mock setups with comments
- For integration tests, only mock external services like email sending or payment processing

## Best Practices

### For Vitest
- Use appropriate matchers for assertions
- Use setup and teardown hooks for common operations
- Use test.each for testing multiple scenarios

### For React Testing Library
- Query elements by accessibility roles or text 
- Test user interactions using fireEvent or user-event
- Test component behavior, not implementation details

### For Supertest Integration Tests
- Organize tests by API route or resource
- Use descriptive test names that include HTTP method and expected outcome
- Test both successful operations and error scenarios
- Validate response structures against API contracts or schemas

## Test Maintenance

- Keep tests DRY with shared fixtures and utilities
- Refactor tests when they become complex or brittle
- Review test coverage regularly 