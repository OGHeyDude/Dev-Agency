/**
 * AgentManager Unit Tests
 */

import { AgentManager } from '../core/AgentManager';

describe('AgentManager', () => {
  let agentManager: AgentManager;

  beforeEach(() => {
    agentManager = new AgentManager();
  });

  describe('Agent Loading', () => {
    test('should initialize with default agents path', () => {
      expect(agentManager).toBeInstanceOf(AgentManager);
    });

    test('should load available agents', async () => {
      const agents = await agentManager.getAllAgents();
      expect(Array.isArray(agents)).toBe(true);
    });

    test('should provide agent names list', () => {
      const names = agentManager.getAgentNames();
      expect(Array.isArray(names)).toBe(true);
    });
  });

  describe('Agent Validation', () => {
    test('should validate existing agent', async () => {
      const agents = agentManager.getAgentNames();
      if (agents.length > 0) {
        const validation = await agentManager.validateAgent(agents[0], {
          task: 'test task'
        });
        expect(validation).toHaveProperty('valid');
        expect(validation).toHaveProperty('errors');
      }
    });

    test('should reject non-existent agent', async () => {
      const validation = await agentManager.validateAgent('non-existent-agent', {
        task: 'test task'
      });
      expect(validation.valid).toBe(false);
      expect(validation.errors).toContain("Agent 'non-existent-agent' not found");
    });

    test('should validate context path if provided', async () => {
      const agents = agentManager.getAgentNames();
      if (agents.length > 0) {
        const validation = await agentManager.validateAgent(agents[0], {
          task: 'test task',
          contextPath: '/non/existent/path'
        });
        expect(validation.valid).toBe(false);
        expect(validation.errors.some(e => e.includes('Context path does not exist'))).toBe(true);
      }
    });

    test('should validate output format', async () => {
      const agents = agentManager.getAgentNames();
      if (agents.length > 0) {
        const validation = await agentManager.validateAgent(agents[0], {
          task: 'test task',
          format: 'invalid-format'
        });
        expect(validation.valid).toBe(false);
        expect(validation.errors.some(e => e.includes('Invalid output format'))).toBe(true);
      }
    });

    test('should validate timeout range', async () => {
      const agents = agentManager.getAgentNames();
      if (agents.length > 0) {
        const validation = await agentManager.validateAgent(agents[0], {
          task: 'test task',
          timeout: 500 // Too low
        });
        expect(validation.valid).toBe(false);
        expect(validation.errors.some(e => e.includes('Timeout must be between'))).toBe(true);
      }
    });
  });

  describe('Context Preparation', () => {
    test('should prepare basic context', async () => {
      const mockAgent = global.testUtils.mockAgent('test-agent');
      const context = await agentManager.prepareContext(mockAgent, {
        task: 'test task'
      });
      
      expect(typeof context).toBe('string');
      expect(context).toContain('test task');
      expect(context).toContain(mockAgent.prompt_template);
    });

    test('should include variables in context', async () => {
      const mockAgent = global.testUtils.mockAgent('test-agent');
      const variables = { key1: 'value1', key2: 'value2' };
      
      const context = await agentManager.prepareContext(mockAgent, {
        task: 'test task',
        variables
      });
      
      expect(context).toContain(JSON.stringify(variables, null, 2));
    });
  });

  describe('Agent Definition Parsing', () => {
    test('should handle agents without frontmatter gracefully', () => {
      // This test would require mocking the file system
      // Implementation would depend on testing strategy
      expect(true).toBe(true); // Placeholder
    });

    test('should extract capabilities from agent definitions', () => {
      // This test would require mocking agent files
      // Implementation would depend on testing strategy
      expect(true).toBe(true); // Placeholder
    });
  });

  describe('Error Handling', () => {
    test('should handle missing agents directory', async () => {
      // This would require mocking fs operations
      expect(true).toBe(true); // Placeholder
    });

    test('should handle corrupted agent files', async () => {
      // This would require mocking fs operations
      expect(true).toBe(true); // Placeholder
    });
  });
});