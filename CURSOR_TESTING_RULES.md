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
- Test interactions between components
- Use minimal mocking for direct dependencies
- Verify data flow between components

### End-to-End Tests
- Test complete user flows
- Use the actual application environment when possible
- Focus on critical user journeys

## Test Workflow

1. Write tests before implementation (TDD approach)
2. Run tests locally before pushing changes
3. Address failing tests immediately
4. Update tests when requirements change

## Coverage Requirements

- Unit tests: 90% coverage minimum
- Integration tests: Cover all critical paths
- End-to-End tests: Cover main user flows

## Mocking Strategy

- Use Vitest's `vi.mock()` for module-level mocking
- Prefer function mocks over implementation mocks
- Document complex mock setups with comments

## Best Practices

### For Vitest
- Use appropriate matchers for assertions
- Use setup and teardown hooks for common operations
- Use test.each for testing multiple scenarios

### For React Testing Library
- Query elements by accessibility roles or text 
- Test user interactions using fireEvent or user-event
- Test component behavior, not implementation details

## Test Maintenance

- Keep tests DRY with shared fixtures and utilities
- Refactor tests when they become complex or brittle
- Review test coverage regularly 