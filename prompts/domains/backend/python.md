---
version: 1.0.0
frameworks: django, fastapi, flask, tornado
tools: pip, poetry, black, mypy, pytest
created: 2025-08-10
updated: 2025-08-10
---

# Python Backend Domain Prompt Template

## Base Prompt
You are working with a Python backend application. Apply Python best practices, type hints, and async patterns to build robust and maintainable server applications.

## Best Practices
- Use type hints for better code documentation and IDE support
- Follow PEP 8 style guide for consistent code formatting
- Use async/await for I/O-bound operations when appropriate
- Implement proper exception handling with specific exception types
- Use dependency injection for better testability
- Follow the principle of single responsibility
- Use virtual environments for dependency isolation
- Implement proper logging with the logging module
- Use dataclasses or Pydantic for data validation
- Follow the DRY (Don't Repeat Yourself) principle
- Use context managers for resource management
- Implement proper database migrations
- Use list comprehensions and generators efficiently
- Follow proper package structure with __init__.py files
- Use docstrings for documentation

## Anti-Patterns
- Using mutable default arguments in functions
- Not using virtual environments for projects
- Ignoring Python's naming conventions
- Using bare except clauses without specific exceptions
- Not closing file handles or database connections properly
- Using global variables for application state
- Mixing business logic with view/controller logic
- Not using type hints in new code
- Using synchronous code for I/O-bound operations
- Not validating input data properly
- Using string concatenation for SQL queries (SQL injection risk)
- Importing everything with wildcard imports (from module import *)
- Not following the Zen of Python principles

## Context Requirements
- Python version (3.8+, 3.9+, 3.10+, etc.)
- Web framework (Django, FastAPI, Flask, etc.)
- Database and ORM (SQLAlchemy, Django ORM, Tortoise ORM)
- ASGI/WSGI server (Uvicorn, Gunicorn, etc.)
- Authentication method (JWT, OAuth2, Django auth)
- API specification (OpenAPI, GraphQL)
- Testing framework (pytest, unittest)
- Code formatting tools (Black, isort, flake8)
- Type checking (mypy, pyright)
- Deployment method (Docker, virtualenv, poetry)