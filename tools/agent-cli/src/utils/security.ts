/**
 * Security Utility Module - Comprehensive security controls for CLI tool
 * 
 * @file security.ts
 * @created 2025-08-10
 * @updated 2025-08-10
 */

import * as fs from 'fs-extra';
import * as path from 'path';
import * as crypto from 'crypto';
import { Logger } from './Logger';

// Security logging instance
const securityLogger = Logger.create({ component: 'Security' });

/**
 * Security policy configuration interface
 */
export interface SecurityPolicy {
  allowedBasePaths: string[];
  allowedExtensions: string[];
  maxFileSize: number;
  maxFiles: number;
  maxDepth: number;
  restrictedPaths: string[];
  allowSymlinks: boolean;
}

/**
 * Path validation result
 */
export interface PathValidationResult {
  isValid: boolean;
  resolvedPath?: string;
  violations: string[];
  securityEvent?: SecurityEvent;
}

/**
 * Security event for audit logging
 */
export interface SecurityEvent {
  timestamp: string;
  event: 'path_traversal_attempt' | 'unauthorized_path_access' | 'file_size_violation' | 'extension_violation' | 'injection_attempt' | 'access_denied';
  severity: 'low' | 'medium' | 'high' | 'critical';
  details: {
    originalPath?: string;
    resolvedPath?: string;
    operation: 'read' | 'write' | 'execute' | 'validate';
    violation?: string;
    userId?: string;
    sourceIP?: string;
  };
}

/**
 * Default security policy for CLI tool
 */
export const DEFAULT_SECURITY_POLICY: SecurityPolicy = {
  allowedBasePaths: [
    '/home/hd/Desktop/LAB/Dev-Agency',
    process.cwd()
  ],
  allowedExtensions: ['.md', '.ts', '.js', '.json', '.yaml', '.yml', '.txt'],
  maxFileSize: 10 * 1024 * 1024, // 10MB
  maxFiles: 100,
  maxDepth: 10,
  restrictedPaths: [
    '/etc',
    '/bin',
    '/sbin',
    '/usr/bin',
    '/usr/sbin',
    '/root',
    '/home/*/.ssh',
    '/home/*/.config'
  ],
  allowSymlinks: false
};

/**
 * Security utility class with comprehensive protections
 */
export class SecurityManager {
  private policy: SecurityPolicy;
  private auditLog: SecurityEvent[] = [];

  constructor(policy: SecurityPolicy = DEFAULT_SECURITY_POLICY) {
    this.policy = { ...DEFAULT_SECURITY_POLICY, ...policy };
  }

  /**
   * Validate and resolve file path with comprehensive security checks
   */
  async validatePath(inputPath: string, operation: 'read' | 'write' | 'execute' = 'read'): Promise<PathValidationResult> {
    const violations: string[] = [];
    
    try {
      // Basic path sanitization
      const sanitizedPath = this.sanitizePath(inputPath);
      
      // Resolve path to absolute form
      const resolvedPath = path.resolve(sanitizedPath);
      
      // Check for path traversal attempts
      if (this.detectPathTraversal(inputPath, resolvedPath)) {
        const event = this.logSecurityEvent('path_traversal_attempt', 'high', {
          originalPath: inputPath,
          resolvedPath,
          operation,
          violation: 'Path traversal attempt detected'
        });
        
        violations.push('Path traversal attempt detected');
        return { isValid: false, violations, securityEvent: event };
      }
      
      // Check if path is within allowed base paths
      if (!this.isPathAllowed(resolvedPath)) {
        const event = this.logSecurityEvent('unauthorized_path_access', 'high', {
          originalPath: inputPath,
          resolvedPath,
          operation,
          violation: 'Path outside allowed base paths'
        });
        
        violations.push('Path is outside allowed base paths');
        return { isValid: false, violations, securityEvent: event };
      }
      
      // Check for restricted paths
      if (this.isPathRestricted(resolvedPath)) {
        const event = this.logSecurityEvent('access_denied', 'critical', {
          originalPath: inputPath,
          resolvedPath,
          operation,
          violation: 'Access to restricted path denied'
        });
        
        violations.push('Access to restricted path denied');
        return { isValid: false, violations, securityEvent: event };
      }
      
      // Check path depth
      const depth = this.calculatePathDepth(resolvedPath);
      if (depth > this.policy.maxDepth) {
        violations.push(`Path depth exceeds maximum (${this.policy.maxDepth})`);
        return { isValid: false, violations };
      }
      
      // Check file extension for existing files
      if (await fs.pathExists(resolvedPath)) {
        const stats = await fs.stat(resolvedPath);
        
        // Check if it's a symlink and policy doesn't allow them
        if (stats.isSymbolicLink() && !this.policy.allowSymlinks) {
          violations.push('Symbolic links are not allowed');
          return { isValid: false, violations };
        }
        
        // For files, check extension and size
        if (stats.isFile()) {
          const extension = path.extname(resolvedPath).toLowerCase();
          if (!this.policy.allowedExtensions.includes(extension)) {
            const event = this.logSecurityEvent('extension_violation', 'medium', {
              originalPath: inputPath,
              resolvedPath,
              operation,
              violation: `File extension '${extension}' not allowed`
            });
            
            violations.push(`File extension '${extension}' is not allowed`);
            return { isValid: false, violations, securityEvent: event };
          }
          
          // Check file size
          if (stats.size > this.policy.maxFileSize) {
            const event = this.logSecurityEvent('file_size_violation', 'medium', {
              originalPath: inputPath,
              resolvedPath,
              operation,
              violation: `File size ${stats.size} exceeds limit ${this.policy.maxFileSize}`
            });
            
            violations.push(`File size exceeds maximum allowed (${this.policy.maxFileSize} bytes)`);
            return { isValid: false, violations, securityEvent: event };
          }
        }
      }
      
      return { 
        isValid: true, 
        resolvedPath,
        violations: []
      };
      
    } catch (error) {
      const event = this.logSecurityEvent('access_denied', 'medium', {
        originalPath: inputPath,
        operation,
        violation: `Path validation error: ${error instanceof Error ? error.message : String(error)}`
      });
      
      violations.push('Path validation failed');
      return { isValid: false, violations, securityEvent: event };
    }
  }

  /**
   * Sanitize file path to prevent basic injection attempts
   */
  private sanitizePath(inputPath: string): string {
    if (!inputPath || typeof inputPath !== 'string') {
      throw new Error('Invalid path input');
    }
    
    // Remove null bytes and control characters
    let sanitized = inputPath.replace(/[\x00-\x1f\x7f-\x9f]/g, '');
    
    // Normalize path separators
    sanitized = sanitized.replace(/[\\]/g, '/');
    
    // Remove multiple consecutive slashes
    sanitized = sanitized.replace(/\/+/g, '/');
    
    // Remove trailing slashes (except for root)
    if (sanitized.length > 1 && sanitized.endsWith('/')) {
      sanitized = sanitized.slice(0, -1);
    }
    
    return sanitized;
  }

  /**
   * Detect path traversal attempts
   */
  private detectPathTraversal(originalPath: string, resolvedPath: string): boolean {
    // Check for common path traversal patterns
    const traversalPatterns = [
      /\.\./,
      /\.\/\.\./,
      /\.\\\.\./,
      /%2e%2e/i,
      /%252e%252e/i,
      /\.%2f/i,
      /\.%5c/i
    ];
    
    // Check original path for traversal patterns
    for (const pattern of traversalPatterns) {
      if (pattern.test(originalPath)) {
        return true;
      }
    }
    
    // Check if resolved path goes outside expected directories
    const allowedPaths = this.policy.allowedBasePaths.map(p => path.resolve(p));
    const isWithinAllowed = allowedPaths.some(allowedPath => {
      return resolvedPath.startsWith(allowedPath + path.sep) || resolvedPath === allowedPath;
    });
    
    return !isWithinAllowed;
  }

  /**
   * Check if path is within allowed base paths
   */
  private isPathAllowed(resolvedPath: string): boolean {
    return this.policy.allowedBasePaths.some(basePath => {
      const resolvedBasePath = path.resolve(basePath);
      return resolvedPath.startsWith(resolvedBasePath + path.sep) || resolvedPath === resolvedBasePath;
    });
  }

  /**
   * Check if path is in restricted paths
   */
  private isPathRestricted(resolvedPath: string): boolean {
    return this.policy.restrictedPaths.some(restrictedPath => {
      // Handle glob patterns in restricted paths
      if (restrictedPath.includes('*')) {
        const pattern = restrictedPath.replace(/\*/g, '.*');
        const regex = new RegExp(`^${pattern}`);
        return regex.test(resolvedPath);
      }
      
      const resolvedRestrictedPath = path.resolve(restrictedPath);
      return resolvedPath.startsWith(resolvedRestrictedPath + path.sep) || 
             resolvedPath === resolvedRestrictedPath;
    });
  }

  /**
   * Calculate path depth from root
   */
  private calculatePathDepth(resolvedPath: string): number {
    return resolvedPath.split(path.sep).filter(part => part.length > 0).length;
  }

  /**
   * Secure file read with validation
   */
  async secureReadFile(filePath: string): Promise<string> {
    const validation = await this.validatePath(filePath, 'read');
    
    if (!validation.isValid) {
      throw new Error(`Security validation failed: ${validation.violations.join(', ')}`);
    }
    
    const content = await fs.readFile(validation.resolvedPath!, 'utf-8');
    
    // Log successful access
    this.logSecurityEvent('access_denied', 'low', {
      originalPath: filePath,
      resolvedPath: validation.resolvedPath,
      operation: 'read',
      violation: 'File read successful'
    });
    
    return content;
  }

  /**
   * Secure file write with validation
   */
  async secureWriteFile(filePath: string, content: string): Promise<void> {
    const validation = await this.validatePath(filePath, 'write');
    
    if (!validation.isValid) {
      throw new Error(`Security validation failed: ${validation.violations.join(', ')}`);
    }
    
    // Sanitize content to prevent injection
    const sanitizedContent = this.sanitizeContent(content);
    
    // Ensure directory exists
    await fs.ensureDir(path.dirname(validation.resolvedPath!));
    
    await fs.writeFile(validation.resolvedPath!, sanitizedContent, 'utf-8');
    
    // Log successful write
    this.logSecurityEvent('access_denied', 'low', {
      originalPath: filePath,
      resolvedPath: validation.resolvedPath,
      operation: 'write',
      violation: 'File write successful'
    });
  }

  /**
   * Sanitize content to prevent code injection
   */
  private sanitizeContent(content: string): string {
    if (typeof content !== 'string') {
      throw new Error('Content must be a string');
    }
    
    // Remove null bytes and dangerous control characters
    let sanitized = content.replace(/[\x00\x08\x0b\x0c\x0e-\x1f]/g, '');
    
    // Check for potential script injection patterns
    const dangerousPatterns = [
      /<script[\s\S]*?>[\s\S]*?<\/script>/gi,
      /javascript:/gi,
      /on\w+\s*=/gi,
      /eval\s*\(/gi,
      /Function\s*\(/gi,
      /setTimeout\s*\(/gi,
      /setInterval\s*\(/gi
    ];
    
    for (const pattern of dangerousPatterns) {
      if (pattern.test(sanitized)) {
        const event = this.logSecurityEvent('injection_attempt', 'high', {
          operation: 'write',
          violation: `Potential code injection detected: ${pattern.source}`
        });
        
        securityLogger.warn('Potential code injection detected', { pattern: pattern.source, event });
      }
    }
    
    return sanitized;
  }

  /**
   * Validate and sanitize file glob patterns
   */
  validateGlobPattern(pattern: string, basePath: string): { isValid: boolean; sanitizedPattern: string; violations: string[] } {
    const violations: string[] = [];
    
    // Sanitize pattern to prevent traversal
    let sanitized = pattern.replace(/\.\./g, '');
    sanitized = sanitized.replace(/\/+/g, '/');
    
    // Ensure pattern stays within base path
    const fullPattern = path.join(basePath, sanitized);
    const resolvedBase = path.resolve(basePath);
    
    // Check if the pattern could escape the base path
    if (!fullPattern.startsWith(resolvedBase)) {
      violations.push('Glob pattern attempts to access files outside base path');
      return { isValid: false, sanitizedPattern: '', violations };
    }
    
    // Check for dangerous patterns
    const dangerousPatterns = ['/etc/**', '/root/**', '/home/*/.ssh/**'];
    for (const dangerous of dangerousPatterns) {
      if (fullPattern.includes(dangerous)) {
        violations.push(`Glob pattern contains dangerous path: ${dangerous}`);
        return { isValid: false, sanitizedPattern: '', violations };
      }
    }
    
    return { 
      isValid: violations.length === 0, 
      sanitizedPattern: sanitized,
      violations
    };
  }

  /**
   * Log security events for audit purposes
   */
  private logSecurityEvent(
    event: SecurityEvent['event'], 
    severity: SecurityEvent['severity'], 
    details: Partial<SecurityEvent['details']>
  ): SecurityEvent {
    const securityEvent: SecurityEvent = {
      timestamp: new Date().toISOString(),
      event,
      severity,
      details: {
        operation: details.operation || 'validate',
        ...details,
        userId: process.env.USER || 'unknown',
        sourceIP: '127.0.0.1' // Local CLI tool
      }
    };
    
    // Add to audit log
    this.auditLog.push(securityEvent);
    
    // Log to security logger
    const logLevel = severity === 'critical' ? 'error' : 
                    severity === 'high' ? 'warn' : 'info';
    
    securityLogger[logLevel](`Security Event: ${event}`, {
      severity,
      details: securityEvent.details
    });
    
    // Keep audit log size manageable
    if (this.auditLog.length > 1000) {
      this.auditLog = this.auditLog.slice(-500);
    }
    
    return securityEvent;
  }

  /**
   * Get security audit log
   */
  getAuditLog(severity?: SecurityEvent['severity'], limit?: number): SecurityEvent[] {
    let logs = this.auditLog;
    
    if (severity) {
      logs = logs.filter(event => event.severity === severity);
    }
    
    if (limit) {
      logs = logs.slice(-limit);
    }
    
    return logs;
  }

  /**
   * Update security policy
   */
  updatePolicy(updates: Partial<SecurityPolicy>): void {
    this.policy = { ...this.policy, ...updates };
    
    this.logSecurityEvent('access_denied', 'low', {
      operation: 'execute',
      violation: 'Security policy updated'
    });
  }

  /**
   * Get current security policy
   */
  getPolicy(): SecurityPolicy {
    return { ...this.policy };
  }

  /**
   * Generate security report
   */
  generateSecurityReport(): {
    policy: SecurityPolicy;
    recentEvents: SecurityEvent[];
    summary: {
      totalEvents: number;
      criticalEvents: number;
      highSeverityEvents: number;
      pathTraversalAttempts: number;
      injectionAttempts: number;
    };
  } {
    const recentEvents = this.auditLog.slice(-50);
    const criticalEvents = this.auditLog.filter(e => e.severity === 'critical').length;
    const highSeverityEvents = this.auditLog.filter(e => e.severity === 'high').length;
    const pathTraversalAttempts = this.auditLog.filter(e => e.event === 'path_traversal_attempt').length;
    const injectionAttempts = this.auditLog.filter(e => e.event === 'injection_attempt').length;
    
    return {
      policy: this.getPolicy(),
      recentEvents,
      summary: {
        totalEvents: this.auditLog.length,
        criticalEvents,
        highSeverityEvents,
        pathTraversalAttempts,
        injectionAttempts
      }
    };
  }
}

// Global security manager instance
export const securityManager = new SecurityManager();

/**
 * Utility functions for common security operations
 */

/**
 * Validate command line argument for security
 */
export function validateCommandArg(arg: any, expectedType: 'string' | 'number' | 'boolean' = 'string'): boolean {
  if (arg === null || arg === undefined) return false;
  
  switch (expectedType) {
    case 'string':
      return typeof arg === 'string' && arg.length > 0 && arg.length < 1000;
    case 'number':
      return typeof arg === 'number' && !isNaN(arg) && isFinite(arg);
    case 'boolean':
      return typeof arg === 'boolean';
    default:
      return false;
  }
}

/**
 * Hash sensitive data for logging
 */
export function hashForLogging(data: string): string {
  return crypto.createHash('sha256').update(data).digest('hex').substring(0, 8);
}

/**
 * Check if string contains potential injection patterns
 */
export function detectInjectionPattern(input: string): { detected: boolean; patterns: string[] } {
  const patterns = [
    { name: 'script_tag', regex: /<script[\s\S]*?>/i },
    { name: 'javascript_protocol', regex: /javascript:/i },
    { name: 'event_handler', regex: /on\w+\s*=/i },
    { name: 'eval_function', regex: /eval\s*\(/i },
    { name: 'function_constructor', regex: /Function\s*\(/i },
    { name: 'shell_command', regex: /[;&|`$(){}[\]\\]/g },
    { name: 'path_traversal', regex: /\.\.[\/\\]/g }
  ];
  
  const detected: string[] = [];
  
  for (const pattern of patterns) {
    if (pattern.regex.test(input)) {
      detected.push(pattern.name);
    }
  }
  
  return {
    detected: detected.length > 0,
    patterns: detected
  };
}