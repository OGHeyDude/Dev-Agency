---
title: Coding Standards Guide
description: Code quality and implementation standards for STAD Protocol Stage 2
type: guide
category: development
tags: [coding, standards, quality, stage-2, implementation]
created: 2025-08-15
updated: 2025-08-15
---

# Coding Standards Guide

## Overview

This guide defines coding standards for the Coder Agent and all development work during Stage 2 (Sprint Execution) of the STAD Protocol. It ensures consistent, maintainable, and high-quality code.

## Universal Principles

### 1. Clarity Over Cleverness
- Write readable code
- Self-documenting names
- Obvious intent
- Simple solutions preferred

### 2. Consistency Matters
- Follow project patterns
- Maintain style uniformity
- Use existing conventions
- Standard formatting

### 3. Quality First
- No linting errors
- Type safety enforced
- Tests required
- Documentation included

## Naming Conventions

### Variables and Functions
```javascript
// Good
const userAccount = getUser();
function calculateTotalPrice(items) {}

// Bad
const ua = getUsr();
function calc(i) {}
```

### Classes and Interfaces
```typescript
// Good
class UserAccount {}
interface PaymentService {}

// Bad
class user_account {}
interface payment_service {}
```

### Constants
```javascript
// Good
const MAX_RETRY_COUNT = 3;
const API_BASE_URL = 'https://api.example.com';

// Bad
const maxretrycount = 3;
const ApiBaseUrl = 'https://api.example.com';
```

## Code Organization

### File Structure
```
src/
├── components/        # UI components
├── services/         # Business logic
├── utils/           # Utility functions
├── types/           # Type definitions
├── constants/       # Constants
└── __tests__/       # Test files
```

### Module Organization
- Single responsibility
- Clear exports
- Logical grouping
- Minimal dependencies

## Error Handling

### Comprehensive Coverage
```javascript
try {
  const result = await riskyOperation();
  return processResult(result);
} catch (error) {
  logger.error('Operation failed', { error, context });
  throw new OperationError('Failed to complete operation', { cause: error });
}
```

### Error Types
- Use specific error classes
- Include context
- Preserve stack traces
- Log appropriately

## Security Practices

### Never Commit
- Passwords
- API keys
- Private keys
- Personal data
- Internal URLs

### Always Use
- Environment variables
- Configuration files
- Secure storage
- Encryption
- Input validation

## Performance Guidelines

### Optimization Rules
- Measure first
- Optimize bottlenecks
- Cache appropriately
- Lazy load when possible
- Minimize bundle size

### Anti-Patterns to Avoid
- Premature optimization
- Memory leaks
- N+1 queries
- Blocking operations
- Unnecessary re-renders

## Documentation Requirements

### Code Comments
```javascript
/**
 * Calculates compound interest
 * @param principal - Initial amount
 * @param rate - Annual interest rate (as decimal)
 * @param time - Time period in years
 * @returns Total amount after interest
 */
function calculateCompoundInterest(principal, rate, time) {
  // Complex calculation explanation if needed
  return principal * Math.pow(1 + rate, time);
}
```

### README Files
- Purpose and overview
- Installation steps
- Usage examples
- API documentation
- Contributing guidelines

## Testing Requirements

### Test Coverage
- Minimum 80% coverage
- Critical paths 100%
- Edge cases included
- Error scenarios tested

### Test Organization
```javascript
describe('UserService', () => {
  describe('createUser', () => {
    it('should create user with valid data', () => {});
    it('should reject invalid email', () => {});
    it('should handle database errors', () => {});
  });
});
```

## Git Practices

### Commit Messages
```bash
# Good
feat(auth): add OAuth2 integration [TICKET-123]
fix(api): handle null response correctly [TICKET-124]

# Bad
updates
fix bug
WIP
```

### Branch Names
```bash
# Good
feature/ticket-123-oauth-integration
bugfix/ticket-124-null-response
hotfix/critical-security-issue

# Bad
my-branch
test
new-feature
```

## Language-Specific Standards

### JavaScript/TypeScript
- Use ESLint + Prettier
- Strict TypeScript
- Async/await over callbacks
- Functional patterns preferred

### Python
- Follow PEP 8
- Use type hints
- Black for formatting
- Docstrings required

### Go
- Follow effective Go
- Use go fmt
- Handle all errors
- Keep it simple

## Code Review Checklist

### Before Submission
- [ ] Lint passes
- [ ] Tests pass
- [ ] Types correct
- [ ] No hardcoded values
- [ ] No console.logs
- [ ] Documentation updated

### Review Focus
- Business logic correct
- Error handling complete
- Security considered
- Performance acceptable
- Code maintainable

## Anti-Patterns to Avoid

### Code Smells
- Long functions (>50 lines)
- Deep nesting (>3 levels)
- Magic numbers
- Copy-paste code
- God objects
- Tight coupling

### Bad Practices
- Ignoring errors
- Mutating parameters
- Global variables
- Synchronous I/O
- Blocking operations
- Memory leaks

## Refactoring Guidelines

### When to Refactor
- Before adding features
- When fixing bugs
- During code review
- When performance issues arise

### How to Refactor
- One change at a time
- Keep tests passing
- Preserve behavior
- Improve incrementally

## Integration Standards

### API Design
- RESTful principles
- Consistent naming
- Proper status codes
- Clear error messages
- Version management

### Database Access
- Use query builders/ORMs
- Parameterized queries
- Connection pooling
- Transaction management
- Migration scripts

## Quality Metrics

### Code Quality
- Cyclomatic complexity <10
- Duplication <5%
- Test coverage >80%
- No critical issues
- Documentation complete

### Performance Targets
- Response time <200ms
- Memory usage stable
- CPU usage efficient
- No memory leaks
- Optimized queries

---

*This guide ensures high-quality code implementation during Stage 2 of the STAD Protocol.*