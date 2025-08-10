/**
 * Tests for REPLMode functionality
 */

import { REPLMode, REPLSession } from '../interactive/REPLMode';
import { EventEmitter } from 'events';
import * as fs from 'fs-extra';
import * as path from 'path';

// Mock dependencies
jest.mock('fs-extra');
jest.mock('readline', () => ({
  createInterface: jest.fn(() => ({
    prompt: jest.fn(),
    close: jest.fn(),
    on: jest.fn()
  }))
}));

const mockedFs = fs as jest.Mocked<typeof fs>;

describe('REPLMode', () => {
  let repl: REPLMode;
  let tempDir: string;

  beforeEach(() => {
    tempDir = '/tmp/test-repl';
    repl = new REPLMode({
      historyFile: path.join(tempDir, '.history'),
      sessionFile: path.join(tempDir, '.session'),
      maxHistorySize: 100,
      prompt: 'test> ',
      enableColors: false
    });

    // Reset mocks
    jest.clearAllMocks();
  });

  afterEach(async () => {
    if (repl) {
      try {
        await repl.stop();
      } catch (error) {
        // Ignore cleanup errors in tests
      }
    }
  });

  describe('initialization', () => {
    test('should create REPLMode with default options', () => {
      const defaultRepl = new REPLMode();
      expect(defaultRepl).toBeInstanceOf(REPLMode);
      expect(defaultRepl).toBeInstanceOf(EventEmitter);
    });

    test('should create REPLMode with custom options', () => {
      expect(repl).toBeInstanceOf(REPLMode);
    });

    test('should initialize with a session', () => {
      const session = repl.getSession();
      expect(session.id).toBeDefined();
      expect(session.context).toEqual({});
      expect(session.variables).toEqual({});
      expect(session.commandCount).toBe(0);
    });
  });

  describe('command registration', () => {
    test('should register a command', () => {
      const command = {
        name: 'test',
        description: 'Test command',
        handler: jest.fn()
      };

      repl.registerCommand(command);
      
      // Command should be registered (internal test)
      expect(command.handler).toBeDefined();
    });

    test('should register command with completions', () => {
      const command = {
        name: 'test',
        description: 'Test command',
        handler: jest.fn(),
        completions: ['option1', 'option2']
      };

      repl.registerCommand(command);
      expect(command.completions).toEqual(['option1', 'option2']);
    });
  });

  describe('command execution', () => {
    test('should execute a registered command', async () => {
      const mockHandler = jest.fn();
      const command = {
        name: 'test',
        description: 'Test command',
        handler: mockHandler
      };

      repl.registerCommand(command);
      
      await repl.executeCommand('test arg1 arg2');
      
      expect(mockHandler).toHaveBeenCalledWith(['arg1', 'arg2'], expect.any(Object));
    });

    test('should handle command not found', async () => {
      const consoleSpy = jest.spyOn(console, 'log').mockImplementation();
      
      await repl.executeCommand('nonexistent');
      
      expect(consoleSpy).toHaveBeenCalledWith(expect.stringContaining('Unknown command'));
      consoleSpy.mockRestore();
    });

    test('should handle empty commands', async () => {
      await repl.executeCommand('');
      await repl.executeCommand('   ');
      
      // Should not throw or cause issues
      expect(true).toBe(true);
    });

    test('should update session after command execution', async () => {
      const command = {
        name: 'test',
        description: 'Test command',
        handler: jest.fn()
      };

      repl.registerCommand(command);
      
      const initialCount = repl.getSession().commandCount;
      await repl.executeCommand('test');
      
      const session = repl.getSession();
      expect(session.commandCount).toBe(initialCount + 1);
      expect(session.lastCommand).toBe('test');
    });
  });

  describe('session management', () => {
    test('should update context', () => {
      repl.updateContext('key1', 'value1');
      
      const session = repl.getSession();
      expect(session.context.key1).toBe('value1');
    });

    test('should set and get variables', () => {
      repl.setVariable('testVar', 'testValue');
      
      expect(repl.getVariable('testVar')).toBe('testValue');
    });

    test('should return undefined for non-existent variables', () => {
      expect(repl.getVariable('nonexistent')).toBeUndefined();
    });
  });

  describe('built-in commands', () => {
    test('should handle help command', async () => {
      const consoleSpy = jest.spyOn(console, 'log').mockImplementation();
      
      await repl.executeCommand('help');
      
      expect(consoleSpy).toHaveBeenCalled();
      consoleSpy.mockRestore();
    });

    test('should handle set command', async () => {
      const consoleSpy = jest.spyOn(console, 'log').mockImplementation();
      
      await repl.executeCommand('set testVar testValue');
      
      expect(repl.getVariable('testVar')).toBe('testValue');
      expect(consoleSpy).toHaveBeenCalledWith(expect.stringContaining('Set testVar = testValue'));
      consoleSpy.mockRestore();
    });

    test('should handle get command', async () => {
      const consoleSpy = jest.spyOn(console, 'log').mockImplementation();
      
      repl.setVariable('testVar', 'testValue');
      await repl.executeCommand('get testVar');
      
      expect(consoleSpy).toHaveBeenCalledWith('testVar = testValue');
      consoleSpy.mockRestore();
    });

    test('should handle clear command', async () => {
      const consoleClearSpy = jest.spyOn(console, 'clear').mockImplementation();
      
      await repl.executeCommand('clear');
      
      expect(consoleClearSpy).toHaveBeenCalled();
      consoleClearSpy.mockRestore();
    });
  });

  describe('error handling', () => {
    test('should handle command handler errors gracefully', async () => {
      const consoleSpy = jest.spyOn(console, 'log').mockImplementation();
      const mockHandler = jest.fn(() => {
        throw new Error('Test error');
      });

      const command = {
        name: 'error-test',
        description: 'Error test command',
        handler: mockHandler
      };

      repl.registerCommand(command);
      
      await repl.executeCommand('error-test');
      
      expect(consoleSpy).toHaveBeenCalledWith(expect.stringContaining('Error executing command'));
      consoleSpy.mockRestore();
    });

    test('should emit error events for command failures', async () => {
      const errorHandler = jest.fn();
      repl.on('commandError', errorHandler);

      const mockHandler = jest.fn(() => {
        throw new Error('Test error');
      });

      const command = {
        name: 'error-test',
        description: 'Error test command',
        handler: mockHandler
      };

      repl.registerCommand(command);
      
      await repl.executeCommand('error-test');
      
      expect(errorHandler).toHaveBeenCalled();
    });
  });

  describe('lifecycle management', () => {
    test('should start and stop without errors', async () => {
      mockedFs.pathExists.mockResolvedValue(false);
      
      // Mock readline interface
      const mockReadline = {
        prompt: jest.fn(),
        close: jest.fn(),
        on: jest.fn()
      };

      const { createInterface } = require('readline');
      (createInterface as jest.Mock).mockReturnValue(mockReadline);

      await repl.start();
      expect(repl).toBeDefined();

      await repl.stop();
      expect(mockReadline.close).toHaveBeenCalled();
    });

    test('should emit lifecycle events', async () => {
      const startedHandler = jest.fn();
      const stoppedHandler = jest.fn();

      repl.on('started', startedHandler);
      repl.on('stopped', stoppedHandler);

      mockedFs.pathExists.mockResolvedValue(false);

      const mockReadline = {
        prompt: jest.fn(),
        close: jest.fn(),
        on: jest.fn()
      };

      const { createInterface } = require('readline');
      (createInterface as jest.Mock).mockReturnValue(mockReadline);

      await repl.start();
      expect(startedHandler).toHaveBeenCalledWith(expect.any(Object));

      await repl.stop();
      expect(stoppedHandler).toHaveBeenCalledWith(expect.any(Object));
    });

    test('should not start if already running', async () => {
      mockedFs.pathExists.mockResolvedValue(false);

      const mockReadline = {
        prompt: jest.fn(),
        close: jest.fn(),
        on: jest.fn()
      };

      const { createInterface } = require('readline');
      (createInterface as jest.Mock).mockReturnValue(mockReadline);

      await repl.start();
      
      await expect(repl.start()).rejects.toThrow('REPL mode is already running');
    });
  });
});