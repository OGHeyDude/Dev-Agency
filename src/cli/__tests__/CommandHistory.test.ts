/**
 * Tests for CommandHistory functionality
 */

import { CommandHistory, HistoryEntry } from '../interactive/CommandHistory';
import * as fs from 'fs-extra';
import * as path from 'path';

// Mock fs-extra
jest.mock('fs-extra');
const mockedFs = fs as jest.Mocked<typeof fs>;

describe('CommandHistory', () => {
  let history: CommandHistory;
  let tempFile: string;

  beforeEach(() => {
    tempFile = '/tmp/test-history.json';
    history = new CommandHistory(tempFile, 50);
    jest.clearAllMocks();
  });

  describe('initialization', () => {
    test('should create CommandHistory instance', () => {
      expect(history).toBeInstanceOf(CommandHistory);
    });

    test('should use default max size', () => {
      const defaultHistory = new CommandHistory('/tmp/test.json');
      expect(defaultHistory).toBeDefined();
    });
  });

  describe('loading and saving', () => {
    test('should load empty history when file does not exist', async () => {
      mockedFs.pathExists.mockResolvedValue(false);
      
      await history.load();
      
      expect(history.getRecentCommands()).toEqual([]);
    });

    test('should load existing history from file', async () => {
      const testData: HistoryEntry[] = [
        {
          command: 'test command 1',
          timestamp: new Date('2023-01-01'),
          sessionId: 'session1'
        },
        {
          command: 'test command 2',
          timestamp: new Date('2023-01-02'),
          sessionId: 'session1'
        }
      ];

      mockedFs.pathExists.mockResolvedValue(true);
      mockedFs.readJson.mockResolvedValue(testData);

      await history.load();
      
      const recentCommands = history.getRecentCommands();
      expect(recentCommands).toEqual(['test command 1', 'test command 2']);
    });

    test('should handle corrupted history file gracefully', async () => {
      const consoleSpy = jest.spyOn(console, 'warn').mockImplementation();
      
      mockedFs.pathExists.mockResolvedValue(true);
      mockedFs.readJson.mockRejectedValue(new Error('Corrupted file'));

      await history.load();
      
      expect(consoleSpy).toHaveBeenCalledWith(
        expect.stringContaining('Could not load command history'),
        expect.any(Error)
      );
      expect(history.getRecentCommands()).toEqual([]);
      
      consoleSpy.mockRestore();
    });

    test('should save history to file', async () => {
      mockedFs.ensureDir.mockResolvedValue(undefined);
      mockedFs.writeJson.mockResolvedValue(undefined);

      await history.load();
      history.add('test command');
      await history.save();

      expect(mockedFs.writeJson).toHaveBeenCalledWith(
        tempFile,
        expect.arrayContaining([
          expect.objectContaining({
            command: 'test command'
          })
        ]),
        { spaces: 2 }
      );
    });

    test('should handle save errors gracefully', async () => {
      const consoleSpy = jest.spyOn(console, 'warn').mockImplementation();
      
      mockedFs.ensureDir.mockResolvedValue(undefined);
      mockedFs.writeJson.mockRejectedValue(new Error('Write error'));

      await history.load();
      history.add('test command');
      await history.save();

      expect(consoleSpy).toHaveBeenCalledWith(
        expect.stringContaining('Could not save command history'),
        expect.any(Error)
      );
      
      consoleSpy.mockRestore();
    });
  });

  describe('adding commands', () => {
    beforeEach(async () => {
      mockedFs.pathExists.mockResolvedValue(false);
      await history.load();
    });

    test('should add command to history', () => {
      history.add('test command');
      
      const recentCommands = history.getRecentCommands();
      expect(recentCommands).toContain('test command');
    });

    test('should not add duplicate consecutive commands', () => {
      history.add('test command');
      history.add('test command');
      
      const recentCommands = history.getRecentCommands();
      expect(recentCommands.filter(cmd => cmd === 'test command')).toHaveLength(1);
    });

    test('should trim whitespace from commands', () => {
      history.add('  test command  ');
      
      const recentCommands = history.getRecentCommands();
      expect(recentCommands).toContain('test command');
    });

    test('should add command with session info', () => {
      history.add('test command', 'session123', true, 1000);
      
      const historyEntries = history.getHistory({ limit: 1 });
      expect(historyEntries[0]).toEqual(
        expect.objectContaining({
          command: 'test command',
          sessionId: 'session123',
          success: true,
          duration: 1000
        })
      );
    });

    test('should enforce max size limit', async () => {
      const smallHistory = new CommandHistory('/tmp/small.json', 3);
      mockedFs.pathExists.mockResolvedValue(false);
      await smallHistory.load();

      smallHistory.add('command 1');
      smallHistory.add('command 2');
      smallHistory.add('command 3');
      smallHistory.add('command 4');
      smallHistory.add('command 5');

      const recentCommands = smallHistory.getRecentCommands();
      expect(recentCommands).toHaveLength(3);
      expect(recentCommands).toEqual(['command 3', 'command 4', 'command 5']);
    });
  });

  describe('searching and filtering', () => {
    beforeEach(async () => {
      mockedFs.pathExists.mockResolvedValue(false);
      await history.load();

      // Add test data
      history.add('invoke architect', 'session1', true);
      history.add('batch --agents coder,tester', 'session1', true);
      history.add('recipe mcp-server', 'session2', false);
      history.add('status', 'session2', true);
      history.add('invoke coder --task bugfix', 'session1', true);
    });

    test('should search commands by query', () => {
      const results = history.search('invoke');
      
      expect(results).toHaveLength(2);
      expect(results[0].command).toContain('invoke');
      expect(results[1].command).toContain('invoke');
    });

    test('should rank search results by relevance', () => {
      const results = history.search('invoke');
      
      // Exact matches should come first
      const exactMatch = results.find(r => r.command === 'invoke architect');
      const partialMatch = results.find(r => r.command === 'invoke coder --task bugfix');
      
      expect(results.indexOf(exactMatch!)).toBeLessThan(results.indexOf(partialMatch!));
    });

    test('should filter history by options', () => {
      const results = history.getHistory({
        sessionId: 'session1'
      });

      expect(results).toHaveLength(3);
      results.forEach(entry => {
        expect(entry.sessionId).toBe('session1');
      });
    });

    test('should filter by success status', () => {
      const results = history.getHistory({
        successOnly: true
      });

      expect(results).toHaveLength(4);
      results.forEach(entry => {
        expect(entry.success).toBe(true);
      });
    });

    test('should limit results', () => {
      const results = history.getHistory({
        limit: 2
      });

      expect(results).toHaveLength(2);
    });

    test('should get command suggestions', () => {
      const suggestions = history.getSuggestions('inv');
      
      expect(suggestions).toContain('invoke architect');
      expect(suggestions).toContain('invoke coder --task bugfix');
    });

    test('should return empty suggestions for empty input', () => {
      const suggestions = history.getSuggestions('');
      
      expect(suggestions).toEqual([]);
    });
  });

  describe('statistics', () => {
    beforeEach(async () => {
      mockedFs.pathExists.mockResolvedValue(false);
      await history.load();

      // Add test data
      history.add('invoke architect', 'session1', true);
      history.add('invoke architect', 'session1', true);  // Won't be added due to dedup
      history.add('batch --agents coder', 'session1', false);
      history.add('status', 'session2', true);
    });

    test('should calculate command statistics', () => {
      const stats = history.getStats();

      expect(stats.totalCommands).toBe(3);
      expect(stats.uniqueCommands).toBe(3);
      expect(stats.mostUsed[0]).toEqual({
        command: 'invoke architect',
        count: 1
      });
      expect(stats.successRate).toBe(2/3);
    });

    test('should handle empty history stats', async () => {
      const emptyHistory = new CommandHistory('/tmp/empty.json');
      mockedFs.pathExists.mockResolvedValue(false);
      await emptyHistory.load();

      const stats = emptyHistory.getStats();

      expect(stats.totalCommands).toBe(0);
      expect(stats.uniqueCommands).toBe(0);
      expect(stats.mostUsed).toEqual([]);
      expect(stats.successRate).toBe(0);
    });
  });

  describe('import/export', () => {
    beforeEach(async () => {
      mockedFs.pathExists.mockResolvedValue(false);
      await history.load();
      history.add('test command 1');
      history.add('test command 2');
    });

    test('should export history as JSON', async () => {
      const exportPath = '/tmp/export.json';
      mockedFs.ensureDir.mockResolvedValue(undefined);
      mockedFs.writeJson.mockResolvedValue(undefined);

      await history.export('json', exportPath);

      expect(mockedFs.writeJson).toHaveBeenCalledWith(
        exportPath,
        expect.arrayContaining([
          expect.objectContaining({ command: 'test command 1' }),
          expect.objectContaining({ command: 'test command 2' })
        ]),
        { spaces: 2 }
      );
    });

    test('should export history as CSV', async () => {
      const exportPath = '/tmp/export.csv';
      mockedFs.ensureDir.mockResolvedValue(undefined);
      mockedFs.writeFile.mockResolvedValue(undefined);

      await history.export('csv', exportPath);

      expect(mockedFs.writeFile).toHaveBeenCalledWith(
        exportPath,
        expect.stringContaining('timestamp,command,sessionId,success,duration')
      );
    });

    test('should throw error for unsupported export format', async () => {
      await expect(history.export('xml' as any, '/tmp/test.xml'))
        .rejects.toThrow('Unsupported export format: xml');
    });

    test('should import history from file', async () => {
      const importPath = '/tmp/import.json';
      const importData = [
        {
          command: 'imported command',
          timestamp: new Date().toISOString(),
          sessionId: 'import-session'
        }
      ];

      mockedFs.pathExists.mockResolvedValue(true);
      mockedFs.readJson.mockResolvedValue(importData);

      await history.import(importPath);

      const commands = history.getRecentCommands();
      expect(commands).toContain('imported command');
    });

    test('should merge imported history when specified', async () => {
      const importPath = '/tmp/import.json';
      const importData = [
        {
          command: 'imported command',
          timestamp: new Date().toISOString(),
          sessionId: 'import-session'
        }
      ];

      mockedFs.pathExists.mockResolvedValue(true);
      mockedFs.readJson.mockResolvedValue(importData);

      await history.import(importPath, true);

      const commands = history.getRecentCommands();
      expect(commands).toContain('test command 1');
      expect(commands).toContain('imported command');
    });
  });

  describe('edge cases', () => {
    test('should throw error when adding to unloaded history', () => {
      const unloadedHistory = new CommandHistory('/tmp/unloaded.json');
      
      expect(() => unloadedHistory.add('test'))
        .toThrow('History not loaded. Call load() first.');
    });

    test('should return empty array for unloaded history', () => {
      const unloadedHistory = new CommandHistory('/tmp/unloaded.json');
      
      expect(unloadedHistory.getRecentCommands()).toEqual([]);
      expect(unloadedHistory.getHistory()).toEqual([]);
    });

    test('should clear all history', async () => {
      mockedFs.pathExists.mockResolvedValue(false);
      await history.load();
      
      history.add('test command');
      expect(history.getRecentCommands()).toHaveLength(1);
      
      history.clear();
      expect(history.getRecentCommands()).toHaveLength(0);
    });
  });
});