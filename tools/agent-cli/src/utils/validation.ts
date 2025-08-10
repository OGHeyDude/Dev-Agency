/**
 * Input Validation Module - Joi schemas for CLI security
 * 
 * @file validation.ts
 * @created 2025-08-10
 * @updated 2025-08-10
 */

import Joi from 'joi';
import * as path from 'path';
import { securityManager } from './security';
import { Logger } from './Logger';

const validationLogger = Logger.create({ component: 'Validation' });

/**
 * Custom Joi extension for secure path validation
 */
const joiSecurePath = Joi.extend((joi) => {
  return {
    type: 'securePath',
    base: joi.string(),
    messages: {
      'securePath.invalid': '{{#label}} contains invalid path characters',
      'securePath.traversal': '{{#label}} contains path traversal attempts',
      'securePath.unsafe': '{{#label}} is not within allowed paths',
      'securePath.restricted': '{{#label}} accesses restricted system paths'
    },
    validate(value, helpers) {
      // Basic string validation
      if (typeof value !== 'string') {
        return { value, errors: helpers.error('string.base') };
      }
      
      // Check for null bytes and control characters
      if (/[\x00-\x1f\x7f-\x9f]/.test(value)) {
        return { value, errors: helpers.error('securePath.invalid') };
      }
      
      // Check for path traversal patterns
      if (/\.\.[\\/]/.test(value) || value.includes('..')) {
        return { value, errors: helpers.error('securePath.traversal') };
      }
      
      // Check for suspicious patterns
      const suspiciousPatterns = [
        /^\/etc/,
        /^\/bin/,
        /^\/sbin/,
        /^\/root/,
        /\/\.ssh/,
        /^~.*\/\./,
        /\$\{/,
        /`/,
        /\|/,
        /;/,
        /&/
      ];
      
      for (const pattern of suspiciousPatterns) {
        if (pattern.test(value)) {
          return { value, errors: helpers.error('securePath.restricted') };
        }
      }
      
      return value;
    }
  };
});

/**
 * Agent name validation schema
 */
export const agentNameSchema = Joi.string()
  .alphanum()
  .min(1)
  .max(50)
  .required()
  .messages({
    'string.alphanum': 'Agent name must contain only alphanumeric characters',
    'string.min': 'Agent name must be at least 1 character long',
    'string.max': 'Agent name cannot exceed 50 characters'
  });

/**
 * Task description validation schema
 */
export const taskDescriptionSchema = Joi.string()
  .min(1)
  .max(2000)
  .pattern(/^[a-zA-Z0-9\s\-_.,!?()[\]{}":;\/\\]+$/)
  .messages({
    'string.pattern.base': 'Task description contains invalid characters',
    'string.min': 'Task description cannot be empty',
    'string.max': 'Task description cannot exceed 2000 characters'
  });

/**
 * Context path validation schema
 */
export const contextPathSchema = (joiSecurePath as any).securePath()
  .min(1)
  .max(500)
  .messages({
    'string.min': 'Context path cannot be empty',
    'string.max': 'Context path cannot exceed 500 characters'
  });

/**
 * Output path validation schema
 */
export const outputPathSchema = (joiSecurePath as any).securePath()
  .min(1)
  .max(500)
  .messages({
    'string.min': 'Output path cannot be empty',
    'string.max': 'Output path cannot exceed 500 characters'
  });

/**
 * Timeout validation schema
 */
export const timeoutSchema = Joi.number()
  .integer()
  .min(1000)
  .max(3600000) // 1 hour max
  .messages({
    'number.min': 'Timeout must be at least 1000ms (1 second)',
    'number.max': 'Timeout cannot exceed 3600000ms (1 hour)'
  });

/**
 * Format validation schema
 */
export const formatSchema = Joi.string()
  .valid('json', 'markdown', 'text')
  .messages({
    'any.only': 'Format must be one of: json, markdown, text'
  });

/**
 * Parallel limit validation schema
 */
export const parallelLimitSchema = Joi.number()
  .integer()
  .min(1)
  .max(10)
  .messages({
    'number.min': 'Parallel limit must be at least 1',
    'number.max': 'Parallel limit cannot exceed 10'
  });

/**
 * Recipe variables validation schema
 */
export const recipeVariablesSchema = Joi.string()
  .custom((value, helpers) => {
    try {
      const parsed = JSON.parse(value);
      
      // Check for dangerous values
      const jsonStr = JSON.stringify(parsed);
      const dangerousPatterns = [
        /eval\s*\(/gi,
        /Function\s*\(/gi,
        /setTimeout\s*\(/gi,
        /setInterval\s*\(/gi,
        /<script/gi,
        /javascript:/gi
      ];
      
      for (const pattern of dangerousPatterns) {
        if (pattern.test(jsonStr)) {
          return helpers.error('recipeVariables.dangerous');
        }
      }
      
      return parsed;
    } catch (error) {
      return helpers.error('recipeVariables.invalid');
    }
  })
  .messages({
    'recipeVariables.invalid': 'Recipe variables must be valid JSON',
    'recipeVariables.dangerous': 'Recipe variables contain potentially dangerous content'
  });

/**
 * Agent invocation options validation schema
 */
export const agentInvocationOptionsSchema = Joi.object({
  agentName: agentNameSchema,
  task: taskDescriptionSchema.optional(),
  contextPath: contextPathSchema.optional(),
  outputPath: outputPathSchema.optional(),
  timeout: timeoutSchema.optional(),
  format: formatSchema.optional(),
  dryRun: Joi.boolean().optional()
}).messages({
  'object.unknown': 'Unknown option: {{#label}}'
});

/**
 * Batch execution options validation schema
 */
export const batchExecutionOptionsSchema = Joi.object({
  agents: Joi.string()
    .pattern(/^[a-zA-Z0-9\-_]+(,[a-zA-Z0-9\-_]+)*$/)
    .required()
    .messages({
      'string.pattern.base': 'Agents list must be comma-separated alphanumeric names',
      'any.required': 'Agents list is required'
    }),
  parallel: parallelLimitSchema.optional(),
  contextPath: contextPathSchema.optional(),
  outputPath: outputPathSchema.optional(),
  timeout: timeoutSchema.optional(),
  format: formatSchema.optional()
}).messages({
  'object.unknown': 'Unknown option: {{#label}}'
});

/**
 * Recipe execution options validation schema
 */
export const recipeExecutionOptionsSchema = Joi.object({
  recipeName: Joi.string()
    .alphanum()
    .min(1)
    .max(100)
    .required()
    .messages({
      'string.alphanum': 'Recipe name must contain only alphanumeric characters',
      'string.min': 'Recipe name cannot be empty',
      'string.max': 'Recipe name cannot exceed 100 characters'
    }),
  contextPath: contextPathSchema.optional(),
  outputPath: outputPathSchema.optional(),
  vars: recipeVariablesSchema.optional(),
  dryRun: Joi.boolean().optional()
}).messages({
  'object.unknown': 'Unknown option: {{#label}}'
});

/**
 * Configuration key-value validation schema
 */
export const configSetSchema = Joi.object({
  key: Joi.string()
    .pattern(/^[a-zA-Z0-9_.]+(\.?[a-zA-Z0-9_]+)*$/)
    .min(1)
    .max(100)
    .required()
    .messages({
      'string.pattern.base': 'Config key must contain only alphanumeric characters, underscores, and dots',
      'string.min': 'Config key cannot be empty',
      'string.max': 'Config key cannot exceed 100 characters'
    }),
  value: Joi.string()
    .min(0)
    .max(1000)
    .required()
    .messages({
      'string.max': 'Config value cannot exceed 1000 characters'
    })
}).messages({
  'object.unknown': 'Unknown config option: {{#label}}'
});

/**
 * File glob pattern validation schema
 */
export const globPatternSchema = Joi.string()
  .min(1)
  .max(200)
  .pattern(/^[a-zA-Z0-9\-_.*\/]+$/)
  .custom((value, helpers) => {
    // Check for dangerous glob patterns
    const dangerousPatterns = [
      /\/etc\/\*\*/,
      /\/root\/\*\*/,
      /\/home\/.*\.ssh\/\*\*/,
      /\/bin\/\*\*/,
      /\/sbin\/\*\*/
    ];
    
    for (const pattern of dangerousPatterns) {
      if (pattern.test(value)) {
        return helpers.error('globPattern.dangerous');
      }
    }
    
    return value;
  })
  .messages({
    'string.pattern.base': 'Glob pattern contains invalid characters',
    'string.min': 'Glob pattern cannot be empty',
    'string.max': 'Glob pattern cannot exceed 200 characters',
    'globPattern.dangerous': 'Glob pattern accesses restricted system paths'
  });

/**
 * Validation utility class
 */
export class ValidationManager {
  /**
   * Validate agent invocation options
   */
  static async validateAgentInvocation(options: any): Promise<{ isValid: boolean; data?: any; errors: string[] }> {
    const { error, value } = agentInvocationOptionsSchema.validate(options, { 
      stripUnknown: true,
      abortEarly: false
    });
    
    if (error) {
      const errors = error.details.map(detail => detail.message);
      validationLogger.warn('Agent invocation validation failed', { errors, options });
      return { isValid: false, errors };
    }
    
    // Additional security validation for paths
    if (value.contextPath) {
      const pathValidation = await securityManager.validatePath(value.contextPath, 'read');
      if (!pathValidation.isValid) {
        return { 
          isValid: false, 
          errors: [`Context path validation failed: ${pathValidation.violations.join(', ')}`] 
        };
      }
    }
    
    if (value.outputPath) {
      const pathValidation = await securityManager.validatePath(value.outputPath, 'write');
      if (!pathValidation.isValid) {
        return { 
          isValid: false, 
          errors: [`Output path validation failed: ${pathValidation.violations.join(', ')}`] 
        };
      }
    }
    
    return { isValid: true, data: value, errors: [] };
  }

  /**
   * Validate batch execution options
   */
  static async validateBatchExecution(options: any): Promise<{ isValid: boolean; data?: any; errors: string[] }> {
    const { error, value } = batchExecutionOptionsSchema.validate(options, { 
      stripUnknown: true,
      abortEarly: false
    });
    
    if (error) {
      const errors = error.details.map(detail => detail.message);
      validationLogger.warn('Batch execution validation failed', { errors, options });
      return { isValid: false, errors };
    }
    
    // Validate each agent name
    const agents = value.agents.split(',').map((a: string) => a.trim());
    for (const agent of agents) {
      const { error: agentError } = agentNameSchema.validate(agent);
      if (agentError) {
        return { 
          isValid: false, 
          errors: [`Invalid agent name '${agent}': ${agentError.message}`] 
        };
      }
    }
    
    // Additional path validation
    if (value.contextPath) {
      const pathValidation = await securityManager.validatePath(value.contextPath, 'read');
      if (!pathValidation.isValid) {
        return { 
          isValid: false, 
          errors: [`Context path validation failed: ${pathValidation.violations.join(', ')}`] 
        };
      }
    }
    
    return { isValid: true, data: { ...value, agents }, errors: [] };
  }

  /**
   * Validate recipe execution options
   */
  static async validateRecipeExecution(options: any): Promise<{ isValid: boolean; data?: any; errors: string[] }> {
    const { error, value } = recipeExecutionOptionsSchema.validate(options, { 
      stripUnknown: true,
      abortEarly: false
    });
    
    if (error) {
      const errors = error.details.map(detail => detail.message);
      validationLogger.warn('Recipe execution validation failed', { errors, options });
      return { isValid: false, errors };
    }
    
    return { isValid: true, data: value, errors: [] };
  }

  /**
   * Validate configuration set operation
   */
  static validateConfigSet(key: string, value: string): { isValid: boolean; errors: string[] } {
    const { error } = configSetSchema.validate({ key, value }, { abortEarly: false });
    
    if (error) {
      const errors = error.details.map(detail => detail.message);
      validationLogger.warn('Config set validation failed', { errors, key, value });
      return { isValid: false, errors };
    }
    
    return { isValid: true, errors: [] };
  }

  /**
   * Validate glob pattern
   */
  static validateGlobPattern(pattern: string): { isValid: boolean; errors: string[] } {
    const { error } = globPatternSchema.validate(pattern, { abortEarly: false });
    
    if (error) {
      const errors = error.details.map(detail => detail.message);
      validationLogger.warn('Glob pattern validation failed', { errors, pattern });
      return { isValid: false, errors };
    }
    
    return { isValid: true, errors: [] };
  }

  /**
   * Sanitize and validate command line argument
   */
  static sanitizeCommandArg(arg: any): string | null {
    if (typeof arg !== 'string') {
      return null;
    }
    
    // Remove dangerous characters
    let sanitized = arg.replace(/[\x00-\x08\x0b\x0c\x0e-\x1f\x7f]/g, '');
    
    // Trim whitespace
    sanitized = sanitized.trim();
    
    // Check length
    if (sanitized.length === 0 || sanitized.length > 2000) {
      return null;
    }
    
    // Check for injection patterns
    const dangerousPatterns = [
      /[;&|`$(){}[\]\\]/,
      /<script/gi,
      /javascript:/gi,
      /eval\s*\(/gi
    ];
    
    for (const pattern of dangerousPatterns) {
      if (pattern.test(sanitized)) {
        validationLogger.warn('Dangerous pattern detected in command argument', { arg, pattern: pattern.source });
        return null;
      }
    }
    
    return sanitized;
  }
}

/**
 * Express middleware-style validation function
 */
export function createValidationMiddleware(schema: Joi.ObjectSchema) {
  return (data: any): { isValid: boolean; data?: any; errors: string[] } => {
    const { error, value } = schema.validate(data, { 
      stripUnknown: true,
      abortEarly: false
    });
    
    if (error) {
      const errors = error.details.map(detail => detail.message);
      return { isValid: false, errors };
    }
    
    return { isValid: true, data: value, errors: [] };
  };
}