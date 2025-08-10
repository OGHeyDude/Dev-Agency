---
title: Docker Containerization
description: Domain-specific prompt template for Docker and containerization
version: 1.0.0
frameworks: Docker, Docker Compose
difficulty: intermediate
category: devops
updated: 2025-08-10
---

# Docker Development Guidelines

## Base Prompt

You are a Docker containerization specialist. When working with Docker, focus on efficient, secure, and production-ready container configurations. Follow best practices for image optimization, security hardening, and multi-stage builds.

## Best Practices

- Use official base images from trusted registries
- Implement multi-stage builds to reduce image size
- Use specific version tags instead of 'latest' for reproducibility
- Run containers as non-root users for security
- Use .dockerignore to exclude unnecessary files
- Minimize the number of layers and combine RUN commands
- Use COPY instead of ADD for simple file operations
- Set appropriate resource limits (CPU, memory)
- Use health checks for container monitoring
- Implement proper logging strategies
- Use secrets management for sensitive data
- Optimize for caching with proper layer ordering
- Use slim or alpine variants when possible
- Implement proper signal handling for graceful shutdowns
- Use docker-compose for local development environments

## Anti-Patterns

- Don't run containers as root user in production
- Avoid installing unnecessary packages in production images
- Don't embed secrets or credentials in Dockerfile or images
- Avoid using 'latest' tag in production deployments
- Don't ignore security vulnerabilities in base images
- Avoid copying entire application directory without .dockerignore
- Don't expose unnecessary ports
- Avoid running multiple services in a single container
- Don't ignore proper signal handling for graceful shutdowns
- Avoid hardcoded environment variables in Dockerfile

## Context Requirements

- Application type and runtime requirements
- Production deployment environment
- Security and compliance requirements
- Monitoring and logging setup
- Container orchestration platform (Kubernetes, Docker Swarm)
- CI/CD pipeline integration requirements
- Development team Docker experience level

## Examples

### Example 1 - Multi-stage Node.js Production Dockerfile
**Scenario:** Optimized Node.js application with security hardening

```dockerfile
# Multi-stage build for Node.js application
FROM node:18-alpine AS base
WORKDIR /app

# Install security updates and create non-root user
RUN apk update && apk upgrade && \
    apk add --no-cache dumb-init && \
    addgroup -g 1001 -S nodejs && \
    adduser -S nextjs -u 1001

# Dependencies stage
FROM base AS deps
COPY package.json package-lock.json ./
RUN npm ci --only=production --frozen-lockfile && \
    npm cache clean --force

# Development dependencies stage
FROM base AS dev-deps
COPY package.json package-lock.json ./
RUN npm ci --frozen-lockfile

# Build stage
FROM dev-deps AS builder
COPY . .
COPY --from=deps /app/node_modules ./node_modules
RUN npm run build && \
    npm prune --production --no-audit --no-fund

# Production stage
FROM base AS production

# Set production environment
ENV NODE_ENV=production \
    PORT=3000 \
    NEXT_TELEMETRY_DISABLED=1

# Copy application files with proper ownership
COPY --from=builder --chown=nextjs:nodejs /app/dist ./dist
COPY --from=builder --chown=nextjs:nodejs /app/node_modules ./node_modules
COPY --from=builder --chown=nextjs:nodejs /app/package.json ./package.json

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
    CMD node dist/health-check.js

# Switch to non-root user
USER nextjs

# Expose port
EXPOSE 3000

# Use dumb-init for proper signal handling
ENTRYPOINT ["dumb-init", "--"]
CMD ["node", "dist/server.js"]

# Metadata
LABEL maintainer="your-team@company.com" \
      version="1.0.0" \
      description="Production Node.js application"
```
*Multi-stage build, security hardening, non-root user, and health checks*

### Example 2 - Python FastAPI with Poetry
**Scenario:** Python application with Poetry dependency management

```dockerfile
# Multi-stage Python application with Poetry
FROM python:3.11-slim as base

# Set environment variables
ENV PYTHONUNBUFFERED=1 \
    PYTHONDONTWRITEBYTECODE=1 \
    PIP_NO_CACHE_DIR=1 \
    PIP_DISABLE_PIP_VERSION_CHECK=1

# Install system dependencies
RUN apt-get update && apt-get install -y --no-install-recommends \
    build-essential \
    curl \
    && rm -rf /var/lib/apt/lists/*

# Install Poetry
RUN pip install poetry==1.6.1

# Configure Poetry
ENV POETRY_NO_INTERACTION=1 \
    POETRY_VENV_IN_PROJECT=1 \
    POETRY_CACHE_DIR=/tmp/poetry_cache

WORKDIR /app

# Dependencies stage
FROM base AS deps
COPY pyproject.toml poetry.lock ./
RUN poetry install --no-dev --no-root && rm -rf $POETRY_CACHE_DIR

# Development dependencies stage  
FROM base AS dev-deps
COPY pyproject.toml poetry.lock ./
RUN poetry install --no-root && rm -rf $POETRY_CACHE_DIR

# Build stage
FROM dev-deps AS builder
COPY . .
RUN poetry build

# Production stage
FROM python:3.11-slim as production

# Create non-root user
RUN groupadd -r appuser && useradd -r -g appuser appuser

# Set environment variables
ENV PYTHONUNBUFFERED=1 \
    PYTHONDONTWRITEBYTECODE=1 \
    PATH="/app/.venv/bin:$PATH"

WORKDIR /app

# Install runtime dependencies only
RUN apt-get update && apt-get install -y --no-install-recommends \
    curl \
    && rm -rf /var/lib/apt/lists/*

# Copy virtual environment from deps stage
COPY --from=deps /app/.venv /app/.venv

# Copy application code
COPY --chown=appuser:appuser . .

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
    CMD curl -f http://localhost:8000/health || exit 1

# Switch to non-root user
USER appuser

EXPOSE 8000

# Use exec form for proper signal handling
CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]
```
*Poetry integration, proper signal handling, health checks, and security*

### Example 3 - Docker Compose Development Environment
**Scenario:** Full-stack development environment with multiple services

```yaml
# docker-compose.yml for development environment
version: '3.8'

services:
  # Frontend React application
  frontend:
    build:
      context: ./frontend
      dockerfile: Dockerfile.dev
    ports:
      - "3000:3000"
    volumes:
      - ./frontend:/app
      - /app/node_modules
    environment:
      - REACT_APP_API_URL=http://localhost:8000
      - CHOKIDAR_USEPOLLING=true
    depends_on:
      - backend
    networks:
      - app-network

  # Backend API service
  backend:
    build:
      context: ./backend
      dockerfile: Dockerfile.dev
    ports:
      - "8000:8000"
    volumes:
      - ./backend:/app
      - backend-cache:/root/.cache
    environment:
      - DATABASE_URL=postgresql://user:password@postgres:5432/appdb
      - REDIS_URL=redis://redis:6379
      - DEBUG=true
    depends_on:
      postgres:
        condition: service_healthy
      redis:
        condition: service_started
    networks:
      - app-network

  # PostgreSQL database
  postgres:
    image: postgres:15-alpine
    environment:
      POSTGRES_DB: appdb
      POSTGRES_USER: user
      POSTGRES_PASSWORD: password
    ports:
      - "5432:5432"
    volumes:
      - postgres-data:/var/lib/postgresql/data
      - ./backend/init.sql:/docker-entrypoint-initdb.d/init.sql:ro
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U user -d appdb"]
      interval: 10s
      timeout: 5s
      retries: 5
    networks:
      - app-network

  # Redis cache
  redis:
    image: redis:7-alpine
    ports:
      - "6379:6379"
    volumes:
      - redis-data:/data
    healthcheck:
      test: ["CMD", "redis-cli", "ping"]
      interval: 10s
      timeout: 5s
      retries: 5
    networks:
      - app-network

  # Nginx reverse proxy
  nginx:
    image: nginx:alpine
    ports:
      - "80:80"
    volumes:
      - ./nginx/nginx.conf:/etc/nginx/nginx.conf:ro
    depends_on:
      - frontend
      - backend
    networks:
      - app-network

  # Database migration service
  migrate:
    build:
      context: ./backend
      dockerfile: Dockerfile.dev
    command: python manage.py migrate
    environment:
      - DATABASE_URL=postgresql://user:password@postgres:5432/appdb
    depends_on:
      postgres:
        condition: service_healthy
    networks:
      - app-network

volumes:
  postgres-data:
    driver: local
  redis-data:
    driver: local
  backend-cache:
    driver: local

networks:
  app-network:
    driver: bridge
    ipam:
      config:
        - subnet: 172.20.0.0/16

# Production override file: docker-compose.prod.yml
---
version: '3.8'

services:
  frontend:
    build:
      dockerfile: Dockerfile.prod
    environment:
      - NODE_ENV=production
    volumes: []

  backend:
    build:
      dockerfile: Dockerfile.prod
    environment:
      - DEBUG=false
      - DATABASE_URL=${DATABASE_URL}
      - REDIS_URL=${REDIS_URL}
    volumes: []

  postgres:
    environment:
      POSTGRES_PASSWORD_FILE: /run/secrets/postgres_password
    secrets:
      - postgres_password

secrets:
  postgres_password:
    external: true
```
*Complete development environment with health checks, networking, and production overrides*