/**
 * Security Tests - Comprehensive security vulnerability tests
 * 
 * @file security.test.ts
 * @created 2025-08-10
 * @updated 2025-08-10
 */

import { SecurityManager, DEFAULT_SECURITY_POLICY, SecurityEvent } from '../utils/security';
import { ValidationManager } from '../utils/validation';
import { SecurityAuditor } from '../utils/SecurityAuditor';
import * as fs from 'fs-extra';
import * as path from 'path';
import * as os from 'os';

describe('Security Vulnerability Tests', () => {
  let securityManager: SecurityManager;
  let securityAuditor: SecurityAuditor;
  let testDir: string;

  beforeEach(async () => {
    // Create test directory
    testDir = await fs.mkdtemp(path.join(os.tmpdir(), 'agent-cli-security-test-'));
    
    // Initialize security manager with test configuration
    securityManager = new SecurityManager({
      ...DEFAULT_SECURITY_POLICY,
      allowedBasePaths: [testDir, '/home/hd/Desktop/LAB/Dev-Agency'],
      maxFileSize: 1024 * 1024, // 1MB for testing
      maxFiles: 10
    });

    // Initialize security auditor for testing
    securityAuditor = new SecurityAuditor({
      enabled: true,
      auditLogPath: path.join(testDir, 'test-audit.log'),
      alertThresholds: {
        pathTraversalAttempts: 2,
        injectionAttempts: 1,
        unauthorizedAccess: 3,
        timeWindow: 1 // 1 minute for faster testing
      }
    });

    // Create test files
    await fs.writeFile(path.join(testDir, 'test.txt'), 'test content');
    await fs.writeFile(path.join(testDir, 'test.md'), '# Test markdown');
    await fs.ensureDir(path.join(testDir, 'subdir'));
    await fs.writeFile(path.join(testDir, 'subdir', 'nested.txt'), 'nested content');
  });

  afterEach(async () => {
    // Clean up test directory
    await fs.remove(testDir);
    await securityAuditor.finalize();
  });

  describe('Path Traversal Protection', () => {
    test('should block basic path traversal attempts', async () => {
      const maliciousPaths = [
        '../../../etc/passwd',
        '..\\..\\..\\windows\\system32\\config\\sam',
        './../../root/.ssh/id_rsa',
        testDir + '/../../../etc/hosts',
        path.join(testDir, '../../../etc/passwd')
      ];

      for (const maliciousPath of maliciousPaths) {
        const result = await securityManager.validatePath(maliciousPath, 'read');
        expect(result.isValid).toBe(false);
        expect(result.violations).toContain('Path traversal attempt detected');
      }
    });

    test('should block encoded path traversal attempts', async () => {
      const encodedPaths = [
        '%2e%2e%2f%2e%2e%2f%2e%2e%2fetc%2fpasswd',
        '%252e%252e%252f%252e%252e%252f%252e%252e%252fetc%252fpasswd',
        '..%2f..%2f..%2fetc%2fpasswd',
        '..%5c..%5c..%5cetc%5cpasswd'
      ];

      for (const encodedPath of encodedPaths) {
        const result = await securityManager.validatePath(encodedPath, 'read');
        expect(result.isValid).toBe(false);
        expect(result.violations.some(v => v.includes('traversal'))).toBe(true);
      }
    });

    test('should allow legitimate paths within allowed base paths', async () => {
      const legitimatePaths = [
        path.join(testDir, 'test.txt'),
        path.join(testDir, 'subdir', 'nested.txt'),
        path.join(testDir, 'subdir'),
        testDir
      ];

      for (const legitimatePath of legitimatePaths) {
        const result = await securityManager.validatePath(legitimatePath, 'read');
        expect(result.isValid).toBe(true);
        expect(result.violations).toHaveLength(0);
      }
    });

    test('should block paths outside allowed base paths', async () => {
      const outsidePaths = [
        '/tmp/malicious.txt',
        '/var/log/system.log',
        '/home/other-user/private.txt',
        path.join(os.homedir(), 'Documents', 'private.txt')
      ];

      for (const outsidePath of outsidePaths) {
        const result = await securityManager.validatePath(outsidePath, 'read');
        expect(result.isValid).toBe(false);
        expect(result.violations).toContain('Path is outside allowed base paths');
      }
    });

    test('should block restricted system paths', async () => {
      const restrictedPaths = [
        '/etc/passwd',
        '/etc/shadow',
        '/root/.ssh/id_rsa',
        '/bin/bash',
        '/sbin/init',
        '/usr/bin/sudo',
        path.join(os.homedir(), '.ssh', 'id_rsa'),
        path.join(os.homedir(), '.config', 'sensitive.conf')
      ];

      for (const restrictedPath of restrictedPaths) {
        const result = await securityManager.validatePath(restrictedPath, 'read');
        expect(result.isValid).toBe(false);
        expect(result.violations).toContain('Access to restricted path denied');
      }
    });
  });

  describe('File Extension Validation', () => {
    test('should allow safe file extensions', async () => {
      const safeExtensions = ['.md', '.ts', '.js', '.json', '.yaml', '.yml', '.txt'];
      
      for (const ext of safeExtensions) {
        const filePath = path.join(testDir, `test${ext}`);
        await fs.writeFile(filePath, 'content');
        
        const result = await securityManager.validatePath(filePath, 'read');
        expect(result.isValid).toBe(true);
      }
    });

    test('should block dangerous file extensions', async () => {
      const dangerousExtensions = ['.exe', '.bat', '.cmd', '.sh', '.ps1', '.vbs', '.scr'];
      
      for (const ext of dangerousExtensions) {
        const filePath = path.join(testDir, `malicious${ext}`);
        await fs.writeFile(filePath, 'malicious content');
        
        const result = await securityManager.validatePath(filePath, 'read');
        expect(result.isValid).toBe(false);
        expect(result.violations.some(v => v.includes('extension'))).toBe(true);
      }
    });
  });

  describe('File Size Validation', () => {
    test('should allow files within size limits', async () => {
      const normalFile = path.join(testDir, 'normal.txt');
      await fs.writeFile(normalFile, 'a'.repeat(1000)); // 1KB file
      
      const result = await securityManager.validatePath(normalFile, 'read');
      expect(result.isValid).toBe(true);
    });

    test('should block files exceeding size limits', async () => {
      const largeFile = path.join(testDir, 'large.txt');
      await fs.writeFile(largeFile, 'a'.repeat(2 * 1024 * 1024)); // 2MB file (exceeds 1MB limit)
      
      const result = await securityManager.validatePath(largeFile, 'read');
      expect(result.isValid).toBe(false);
      expect(result.violations.some(v => v.includes('size exceeds'))).toBe(true);
    });
  });

  describe('Input Validation', () => {
    test('should validate agent names correctly', async () => {
      const validAgents = ['architect', 'coder', 'tester', 'documenter'];
      const invalidAgents = ['../malicious', 'agent; rm -rf /', 'agent`whoami`', 'agent<script>'];

      for (const agent of validAgents) {
        const result = await ValidationManager.validateAgentInvocation({ agentName: agent });
        expect(result.isValid).toBe(true);
      }

      for (const agent of invalidAgents) {
        const result = await ValidationManager.validateAgentInvocation({ agentName: agent });
        expect(result.isValid).toBe(false);
      }
    });

    test('should validate task descriptions for injection patterns', async () => {
      const safeDescriptions = [
        'Implement user authentication',
        'Fix bug in payment processing',
        'Add tests for API endpoints'
      ];

      const dangerousDescriptions = [
        'Task with <script>alert("xss")</script>',
        'eval(malicious_code())',
        'javascript:alert(document.cookie)',
        'Task with `rm -rf /`'
      ];

      for (const desc of safeDescriptions) {
        const result = await ValidationManager.validateAgentInvocation({ 
          agentName: 'coder',
          task: desc 
        });
        expect(result.isValid).toBe(true);
      }

      for (const desc of dangerousDescriptions) {
        const result = await ValidationManager.validateAgentInvocation({ 
          agentName: 'coder',
          task: desc 
        });
        // Should either be invalid or sanitized
        if (result.isValid) {
          expect(result.data?.task).not.toContain('<script>');
          expect(result.data?.task).not.toContain('eval(');
          expect(result.data?.task).not.toContain('javascript:');
        }
      }
    });

    test('should validate context and output paths', async () => {
      const validPath = path.join(testDir, 'context.txt');
      const invalidPath = '../../../etc/passwd';

      const validResult = await ValidationManager.validateAgentInvocation({
        agentName: 'coder',
        contextPath: validPath
      });
      expect(validResult.isValid).toBe(true);

      const invalidResult = await ValidationManager.validateAgentInvocation({
        agentName: 'coder',
        contextPath: invalidPath
      });
      expect(invalidResult.isValid).toBe(false);
    });
  });

  describe('Content Sanitization', () => {
    test('should sanitize dangerous content patterns', async () => {
      const dangerousContent = `
        <script>alert('xss')</script>
        javascript:void(0)
        onload="malicious()"
        eval("dangerous code")
        Function("return process")()
      `;

      const sanitizedContent = securityManager['sanitizeContent'](dangerousContent);
      
      expect(sanitizedContent).not.toContain('<script>');
      expect(sanitizedContent).not.toContain('javascript:');
      expect(sanitizedContent).not.toContain('onload=');
      expect(sanitizedContent).not.toContain('eval(');
      expect(sanitizedContent).not.toContain('Function(');
    });

    test('should preserve safe content', async () => {
      const safeContent = `
        # Documentation
        
        This is a markdown document with:
        - Code examples
        - Normal text
        - **Bold text**
        - \`inline code\`
        
        \`\`\`typescript
        function safeFunction() {
          return "hello world";
        }
        \`\`\`
      `;

      const sanitizedContent = securityManager['sanitizeContent'](safeContent);
      
      expect(sanitizedContent).toContain('# Documentation');
      expect(sanitizedContent).toContain('**Bold text**');
      expect(sanitizedContent).toContain('function safeFunction');
    });
  });

  describe('Glob Pattern Security', () => {
    test('should validate safe glob patterns', async () => {
      const safePatterns = [
        '*.md',
        '**/*.ts',
        'src/**/*.js',
        'docs/*.txt'
      ];

      for (const pattern of safePatterns) {
        const result = securityManager.validateGlobPattern(pattern, testDir);
        expect(result.isValid).toBe(true);
      }
    });

    test('should block dangerous glob patterns', async () => {
      const dangerousPatterns = [
        '/etc/**',
        '/root/**',
        '/home/*/.ssh/**',
        '../../../**',
        '../../**/passwd'
      ];

      for (const pattern of dangerousPatterns) {
        const result = securityManager.validateGlobPattern(pattern, testDir);
        expect(result.isValid).toBe(false);
      }
    });
  });

  describe('Security Audit Logging', () => {
    test('should log security events', async () => {
      const testEvent: SecurityEvent = {
        timestamp: new Date().toISOString(),
        event: 'path_traversal_attempt',
        severity: 'high',
        details: {
          originalPath: '../../../etc/passwd',
          operation: 'read',
          violation: 'Path traversal detected in test'
        }
      };

      const eventId = await securityAuditor.logSecurityEvent(testEvent);
      expect(eventId).toBeDefined();
      expect(eventId.length).toBeGreaterThan(0);
    });

    test('should trigger alerts for repeated violations', async () => {
      // Trigger multiple path traversal attempts to exceed threshold
      for (let i = 0; i < 3; i++) {
        const event: SecurityEvent = {
          timestamp: new Date().toISOString(),
          event: 'path_traversal_attempt',
          severity: 'high',
          details: {
            originalPath: `../../../etc/passwd${i}`,
            operation: 'read',
            violation: `Path traversal attempt ${i}`
          }
        };
        await securityAuditor.logSecurityEvent(event);
      }

      // Wait a moment for alert processing
      await new Promise(resolve => setTimeout(resolve, 100));

      const auditReport = await securityAuditor.getAuditReport();
      expect(auditReport.alerts.length).toBeGreaterThan(0);
      expect(auditReport.alerts[0].severity).toBe('high');
    });

    test('should generate security audit reports', async () => {
      // Log some test events
      const events: SecurityEvent[] = [
        {
          timestamp: new Date().toISOString(),
          event: 'path_traversal_attempt',
          severity: 'high',
          details: { operation: 'read', violation: 'test' }
        },
        {
          timestamp: new Date().toISOString(),
          event: 'injection_attempt',
          severity: 'critical',
          details: { operation: 'write', violation: 'test injection' }
        }
      ];

      for (const event of events) {
        await securityAuditor.logSecurityEvent(event);
      }

      const report = await securityAuditor.getAuditReport();
      expect(report.summary.totalEvents).toBeGreaterThan(0);
      expect(report.summary.eventsByType['path_traversal_attempt']).toBeDefined();
      expect(report.summary.eventsByType['injection_attempt']).toBeDefined();
    });
  });

  describe('Secure File Operations', () => {
    test('should perform secure file reads', async () => {
      const testFile = path.join(testDir, 'secure-read-test.txt');
      const testContent = 'secure test content';
      await fs.writeFile(testFile, testContent);

      const content = await securityManager.secureReadFile(testFile);
      expect(content).toBe(testContent);
    });

    test('should reject insecure file read attempts', async () => {
      const insecurePath = '../../../etc/passwd';
      
      await expect(securityManager.secureReadFile(insecurePath))
        .rejects.toThrow('Security validation failed');
    });

    test('should perform secure file writes', async () => {
      const testFile = path.join(testDir, 'secure-write-test.txt');
      const testContent = 'secure write content';

      await securityManager.secureWriteFile(testFile, testContent);
      
      const writtenContent = await fs.readFile(testFile, 'utf-8');
      expect(writtenContent).toBe(testContent);
    });

    test('should reject insecure file write attempts', async () => {
      const insecurePath = '../../../tmp/malicious.txt';
      
      await expect(securityManager.secureWriteFile(insecurePath, 'content'))
        .rejects.toThrow('Security validation failed');
    });
  });

  describe('Integration Security Tests', () => {
    test('should handle complex attack scenarios', async () => {
      // Simulate a complex attack combining multiple techniques
      const attackVectors = [
        { path: '../../../etc/passwd', expected: false },
        { path: testDir + '/../../../root/.ssh/id_rsa', expected: false },
        { path: '%2e%2e%2f%2e%2e%2f%2e%2e%2fetc%2fpasswd', expected: false },
        { path: path.join(testDir, 'legitimate.txt'), expected: true }
      ];

      for (const vector of attackVectors) {
        const result = await securityManager.validatePath(vector.path, 'read');
        expect(result.isValid).toBe(vector.expected);
        
        if (!result.isValid) {
          expect(result.violations.length).toBeGreaterThan(0);
          expect(result.securityEvent).toBeDefined();
        }
      }
    });

    test('should maintain security under concurrent operations', async () => {
      // Test concurrent path validations
      const concurrentPromises = [];
      
      for (let i = 0; i < 10; i++) {
        const legitimatePath = path.join(testDir, `concurrent-${i}.txt`);
        const maliciousPath = `../../../etc/passwd-${i}`;
        
        concurrentPromises.push(securityManager.validatePath(legitimatePath, 'read'));
        concurrentPromises.push(securityManager.validatePath(maliciousPath, 'read'));
      }

      const results = await Promise.all(concurrentPromises);
      
      // Check that legitimate paths passed and malicious ones failed
      for (let i = 0; i < results.length; i += 2) {
        expect(results[i].isValid).toBe(true); // legitimate path
        expect(results[i + 1].isValid).toBe(false); // malicious path
      }
    });

    test('should handle edge cases and boundary conditions', async () => {
      const edgeCases = [
        '', // empty path
        null, // null path
        undefined, // undefined path
        'a'.repeat(1000), // very long path
        '\x00malicious', // null byte injection
        'path\rwith\ncontrol\tchars' // control characters
      ];

      for (const edgeCase of edgeCases) {
        let result;
        try {
          result = await securityManager.validatePath(edgeCase as any, 'read');
          expect(result.isValid).toBe(false);
        } catch (error) {
          // Expected for null/undefined cases
          expect(error).toBeDefined();
        }
      }
    });
  });

  describe('Performance and DoS Protection', () => {
    test('should handle rapid repeated validation requests', async () => {
      const startTime = Date.now();
      const promises = [];
      
      // Create many validation requests
      for (let i = 0; i < 100; i++) {
        promises.push(securityManager.validatePath(path.join(testDir, `file-${i}.txt`), 'read'));
      }

      const results = await Promise.all(promises);
      const endTime = Date.now();
      
      // Should complete within reasonable time (less than 5 seconds)
      expect(endTime - startTime).toBeLessThan(5000);
      
      // All legitimate requests should succeed
      results.forEach(result => {
        expect(result.isValid).toBe(true);
      });
    });

    test('should limit resource consumption during validation', async () => {
      const memoryBefore = process.memoryUsage();
      
      // Perform many security validations
      for (let i = 0; i < 1000; i++) {
        await securityManager.validatePath(path.join(testDir, 'test.txt'), 'read');
      }
      
      const memoryAfter = process.memoryUsage();
      
      // Memory usage should not increase drastically
      const memoryIncrease = memoryAfter.heapUsed - memoryBefore.heapUsed;
      expect(memoryIncrease).toBeLessThan(10 * 1024 * 1024); // Less than 10MB increase
    });
  });
});

// Helper function to create test scenarios
function createPathTraversalScenarios(): Array<{ path: string; shouldFail: boolean; description: string }> {
  return [
    { path: '../../../etc/passwd', shouldFail: true, description: 'Basic path traversal' },
    { path: '..\\..\\..\\windows\\system32\\config\\sam', shouldFail: true, description: 'Windows path traversal' },
    { path: './../../root/.ssh/id_rsa', shouldFail: true, description: 'SSH key access attempt' },
    { path: '%2e%2e%2f%2e%2e%2f%2e%2e%2fetc%2fpasswd', shouldFail: true, description: 'URL encoded traversal' },
    { path: '%252e%252e%252f%252e%252e%252f%252e%252e%252fetc%252fpasswd', shouldFail: true, description: 'Double URL encoded traversal' },
    { path: '..%2f..%2f..%2fetc%2fpasswd', shouldFail: true, description: 'Mixed encoding traversal' },
    { path: '..%5c..%5c..%5cetc%5cpasswd', shouldFail: true, description: 'Backslash encoded traversal' },
  ];
}