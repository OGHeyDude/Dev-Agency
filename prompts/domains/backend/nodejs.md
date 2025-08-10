---
version: 1.0.0
frameworks: express, fastify, nestjs, koa
tools: npm, yarn, pnpm, nodemon, pm2
created: 2025-08-10
updated: 2025-08-10
---

# Node.js Backend Domain Prompt Template

## Base Prompt
You are working with a Node.js backend application. Apply Node.js best practices, async patterns, and proper error handling to build scalable and maintainable server applications.

## Best Practices
- Use async/await for asynchronous operations instead of callbacks
- Implement proper error handling with try/catch blocks
- Use middleware pattern for cross-cutting concerns
- Follow RESTful API design principles
- Implement proper input validation and sanitization
- Use environment variables for configuration
- Implement proper logging with structured logs
- Use connection pooling for database connections
- Implement graceful shutdown handling
- Follow the principle of least privilege for security
- Use proper HTTP status codes in responses
- Implement rate limiting and throttling
- Use compression for response optimization
- Cache frequently accessed data appropriately
- Follow modular architecture with separation of concerns

## Anti-Patterns
- Using synchronous file operations in request handlers
- Not handling Promise rejections properly
- Storing sensitive data in code or version control
- Using eval() or other dangerous functions
- Not validating user input before processing
- Blocking the event loop with CPU-intensive operations
- Creating memory leaks with improper event listener cleanup
- Using global variables for state management
- Not implementing proper error boundaries
- Ignoring security headers in HTTP responses
- Using outdated or vulnerable dependencies
- Not implementing proper CORS configuration
- Mixing business logic with route handlers

## Context Requirements
- Node.js version and npm/yarn version
- Framework being used (Express, Fastify, NestJS, etc.)
- Database type and ORM/ODM (MongoDB/Mongoose, PostgreSQL/Prisma, etc.)
- Authentication strategy (JWT, OAuth, Sessions)
- API documentation requirements (OpenAPI/Swagger)
- Testing framework (Jest, Mocha, etc.)
- Deployment environment (Docker, PM2, serverless)
- Performance requirements and SLAs
- Security requirements and compliance needs
- Monitoring and logging infrastructure