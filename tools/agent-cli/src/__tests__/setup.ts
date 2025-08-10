/**
 * Jest Test Setup
 * Global test configuration and utilities
 */

// Increase timeout for integration tests
jest.setTimeout(30000);

// Mock console methods during tests to keep output clean
global.console = {
  ...console,
  log: jest.fn(),
  debug: jest.fn(),
  info: jest.fn(),
  warn: jest.fn(),
  error: jest.fn(),
};

// Global test utilities
declare global {
  namespace NodeJS {
    interface Global {
      testUtils: {
        mockAgent: (name: string) => any;
        mockRecipe: (name: string) => any;
        createTempDir: () => Promise<string>;
        cleanupTempDir: (dir: string) => Promise<void>;
      };
    }
  }
}

global.testUtils = {
  mockAgent: (name: string) => ({
    name,
    description: `Test agent: ${name}`,
    capabilities: ['test-capability'],
    requirements: [],
    context_limits: { max_tokens: 1000, max_files: 5 },
    prompt_template: `Test prompt for ${name}`
  }),
  
  mockRecipe: (name: string) => ({
    name,
    description: `Test recipe: ${name}`,
    version: '1.0.0',
    tags: ['test'],
    steps: [
      { agent: 'test-agent', task: 'test task' }
    ]
  }),
  
  createTempDir: async () => {
    const fs = require('fs-extra');
    const path = require('path');
    const os = require('os');
    
    const tempDir = path.join(os.tmpdir(), `agent-cli-test-${Date.now()}`);
    await fs.ensureDir(tempDir);
    return tempDir;
  },
  
  cleanupTempDir: async (dir: string) => {
    const fs = require('fs-extra');
    await fs.remove(dir);
  }
};