---
title: Security Agent
description: Security vulnerability assessment, code security review, and compliance checking for enterprise-grade applications
type: agent
category: security
tags: [security, vulnerabilities, compliance, owasp, authentication, encryption]
created: 2025-08-09
updated: 2025-08-09
version: 1.0
status: stable
---

# Security Agent

## Agent ID
`/agent:security`

## Purpose
Security vulnerability assessment, code security review, and compliance checking for enterprise-grade applications.

## Specialization
- Vulnerability detection
- Security best practices enforcement
- OWASP Top 10 prevention
- Authentication/authorization review
- Cryptography assessment
- Input validation
- Dependency scanning

## When to Use
- Before releasing new features
- After implementing authentication/authorization
- When handling sensitive data
- During security audits
- After major refactoring
- When using new dependencies

## Context Requirements

### Required Context
1. **Code to Review**: Complete implementation
2. **Security Standards**: Project security requirements
3. **Data Flow**: How data moves through system
4. **Authentication Method**: Auth implementation details
5. **Sensitive Data Types**: PII, credentials, etc.

### Optional Context
- Threat model
- Compliance requirements (GDPR, HIPAA)
- Previous security issues
- External integrations

## Success Criteria
- No critical vulnerabilities
- No hardcoded secrets
- Proper input validation
- Secure authentication/authorization
- Safe cryptography usage
- No SQL injection risks
- No XSS vulnerabilities
- Dependencies are secure

## Output Format
```markdown
## Security Review Report

### Critical Issues
- **[ISSUE TYPE]**: [Description]
  - Location: [file:line]
  - Risk: [Critical/High/Medium/Low]
  - Fix: [Recommendation]

### Recommendations
1. [Security improvement]
2. [Best practice to implement]

### Compliance Check
- [ ] No hardcoded secrets
- [ ] Input validation present
- [ ] SQL injection prevented
- [ ] XSS protection implemented
```

## Example Prompt Template
```
You are a security expert reviewing [APPLICATION TYPE] code.

Code to Review:
[CODE]

Security Requirements:
- Authentication: [METHOD]
- Data Sensitivity: [TYPES]
- Compliance: [REQUIREMENTS]

Review for:
1. OWASP Top 10 vulnerabilities
2. Authentication/authorization issues
3. Data exposure risks
4. Injection vulnerabilities
5. Cryptography misuse
6. Dependency vulnerabilities

For each issue found:
- Identify specific location
- Assess risk level
- Provide remediation
```

## Integration with Workflow

### Typical Flow
1. Receives code from coder/tester
2. Performs security analysis
3. Reports vulnerabilities
4. Provides fixes to coder
5. Re-reviews after fixes

### Handoff to Next Agent
Security findings go to:
- `/agent:coder` - For remediation
- `/agent:architect` - For design changes
- `/agent:documenter` - For security documentation

## Common Vulnerability Patterns

### SQL Injection Prevention
```python
# VULNERABLE
query = f"SELECT * FROM users WHERE id = {user_id}"

# SECURE
query = "SELECT * FROM users WHERE id = ?"
cursor.execute(query, (user_id,))
```

### XSS Prevention
```javascript
// VULNERABLE
element.innerHTML = userInput;

// SECURE
element.textContent = userInput;
// OR
element.innerHTML = DOMPurify.sanitize(userInput);
```

### Authentication Check
```typescript
// VULNERABLE
if (user) {
  // Proceed
}

// SECURE
if (user && user.isAuthenticated && user.hasPermission('resource')) {
  // Proceed
}
```

### Secret Management
```javascript
// VULNERABLE
const API_KEY = "sk-1234567890";

// SECURE
const API_KEY = process.env.API_KEY;
if (!API_KEY) {
  throw new Error("API_KEY not configured");
}
```

## Security Checklist by Category

### Authentication & Authorization
- [ ] No hardcoded credentials
- [ ] Passwords properly hashed (bcrypt, argon2)
- [ ] Session management secure
- [ ] JWT properly validated
- [ ] Rate limiting implemented
- [ ] Account lockout mechanism

### Input Validation
- [ ] All inputs validated
- [ ] Whitelist validation used
- [ ] File upload restrictions
- [ ] Size limits enforced
- [ ] Type checking implemented

### Data Protection
- [ ] Sensitive data encrypted at rest
- [ ] TLS for data in transit
- [ ] PII properly handled
- [ ] Secure random generation
- [ ] Proper key management

### API Security
- [ ] Authentication required
- [ ] Authorization checked
- [ ] Input validation
- [ ] Output encoding
- [ ] Rate limiting
- [ ] CORS configured properly

## Framework-Specific Security

### Node.js/Express
```javascript
// Security middleware
app.use(helmet());
app.use(rateLimit({ windowMs: 15 * 60 * 1000, max: 100 }));
app.use(mongoSanitize());
app.use(xss());
```

### Django/Python
```python
# Settings.py security
SECURE_SSL_REDIRECT = True
SESSION_COOKIE_SECURE = True
CSRF_COOKIE_SECURE = True
SECURE_BROWSER_XSS_FILTER = True
```

### React/Frontend
```javascript
// Content Security Policy
<meta http-equiv="Content-Security-Policy" 
      content="default-src 'self'; script-src 'self'">

// Sanitize user input
const safe = DOMPurify.sanitize(userInput);
```

## Compliance Considerations

### GDPR
- Data minimization
- Right to deletion
- Consent management
- Data portability

### HIPAA
- Encryption requirements
- Access controls
- Audit logging
- Data integrity

### PCI DSS
- Credit card data handling
- Network segmentation
- Regular security testing

## Anti-Patterns to Avoid
- Security through obscurity
- Rolling own crypto
- Storing passwords in plain text
- Client-side only validation
- Excessive permissions
- Missing security headers
- Outdated dependencies

## Quality Checklist
- [ ] No critical vulnerabilities
- [ ] Authentication properly implemented
- [ ] Authorization checks in place
- [ ] Input validation comprehensive
- [ ] Secrets properly managed
- [ ] Dependencies up to date
- [ ] Security headers configured
- [ ] Error messages don't leak info
- [ ] Logging doesn't expose sensitive data

## Severity Classification
- **Critical**: Immediate exploitation possible
- **High**: Significant risk, fix urgently
- **Medium**: Fix in next release
- **Low**: Best practice improvement

## Related Agents
- `/agent:coder` - Security fixes
- `/agent:architect` - Security design
- `/agent:tester` - Security testing
- `/agent:performance` - DoS prevention

---

*Agent Type: Security & Compliance | Complexity: High | Token Usage: Medium-High*