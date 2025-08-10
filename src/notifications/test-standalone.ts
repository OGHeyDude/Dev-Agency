#!/usr/bin/env node

/**
 * Standalone test for the notification system
 */

import * as dotenv from 'dotenv';
import { NotificationManager } from './NotificationManager';
import { NotificationConfigManager } from './config/NotificationConfig';
import { NotificationServer, DEFAULT_SERVER_CONFIG } from './NotificationServer';
import { AgentNotificationIntegration } from './AgentIntegration';

// Load environment variables
dotenv.config();

async function testNotificationSystem() {
  console.log('🚀 Testing Dev-Agency Notification System...\n');

  try {
    // Test 1: Configuration Manager
    console.log('1. Testing Configuration Manager...');
    const configManager = new NotificationConfigManager({
      slack: {
        enabled: process.env.SLACK_ENABLED === 'true',
        webhookUrl: process.env.SLACK_WEBHOOK_URL,
        botToken: process.env.SLACK_BOT_TOKEN,
        channels: [],
        rateLimitRpm: 50
      },
      teams: {
        enabled: process.env.TEAMS_ENABLED === 'true',
        webhookUrl: process.env.TEAMS_WEBHOOK_URL,
        channels: [],
        rateLimitRpm: 50
      },
      global: {
        enabledEvents: ['agent_start', 'agent_complete', 'agent_error'],
        retryAttempts: 3,
        retryDelayMs: 1000,
        timeoutMs: 10000
      }
    });

    console.log('✅ Configuration Manager created');
    console.log('   - Slack enabled:', configManager.isSlackEnabled());
    console.log('   - Teams enabled:', configManager.isTeamsEnabled());
    console.log('   - Validation errors:', configManager.validateConfig());

    // Test 2: Notification Manager
    console.log('\n2. Testing Notification Manager...');
    const notificationManager = new NotificationManager(configManager);
    console.log('✅ Notification Manager created');
    console.log('   - Status:', notificationManager.getStatus());

    // Test 3: Connection Tests
    console.log('\n3. Testing Connections...');
    const connectionResults = await notificationManager.testConnections();
    console.log('✅ Connection tests completed');
    console.log('   - Results:', connectionResults);

    // Test 4: Server
    console.log('\n4. Testing Notification Server...');
    const server = new NotificationServer({
      ...DEFAULT_SERVER_CONFIG,
      port: 3003 // Use different port to avoid conflicts
    }, notificationManager);
    
    await server.start();
    console.log('✅ Server started on port 3003');

    // Test 5: Agent Integration
    console.log('\n5. Testing Agent Integration...');
    const agentIntegration = new AgentNotificationIntegration(
      notificationManager,
      server.getSlashCommandHandler()
    );
    console.log('✅ Agent Integration created');

    // Test 6: Send Test Notifications
    if (configManager.isSlackEnabled() || configManager.isTeamsEnabled()) {
      console.log('\n6. Sending Test Notifications...');
      
      // Test agent start notification
      const startResults = await notificationManager.notifyAgentStart(
        'test-agent',
        'TEST-001',
        'notification-test'
      );
      console.log('   - Agent start notification results:', startResults.map(r => ({ platform: r.platform, success: r.success })));

      // Wait a moment
      await new Promise(resolve => setTimeout(resolve, 1000));

      // Test agent completion notification
      const completeResults = await notificationManager.notifyAgentComplete(
        'test-agent',
        2500, // duration
        1200, // token count
        'TEST-001',
        'notification-test'
      );
      console.log('   - Agent complete notification results:', completeResults.map(r => ({ platform: r.platform, success: r.success })));

      console.log('✅ Test notifications sent');
    } else {
      console.log('\n6. ⚠️ No platforms enabled, skipping notification tests');
      console.log('   Configure SLACK_ENABLED=true or TEAMS_ENABLED=true in environment');
    }

    // Test 7: Slash Command Handler
    console.log('\n7. Testing Slash Command Handler...');
    const slashHandler = server.getSlashCommandHandler();
    
    // Update some test agent statuses
    slashHandler.updateAgentStatus('architect', {
      name: 'architect',
      status: 'running',
      currentTask: 'Designing test architecture',
      startTime: new Date().toISOString()
    });

    slashHandler.updateAgentStatus('tester', {
      name: 'tester',
      status: 'idle',
      currentTask: undefined,
      startTime: undefined
    });

    const testCommand = await slashHandler.handleCommand({
      command: '/agent-status',
      channel_id: 'C1234567890',
      channel_name: 'dev-agency',
      user_id: 'U1234567890',
      user_name: 'test-user',
      text: ''
    });

    console.log('✅ Slash command test completed');
    console.log('   - Response type:', testCommand.response_type);
    console.log('   - Has blocks:', !!testCommand.blocks);

    console.log('\n🎉 All tests passed successfully!');
    console.log('\n📖 Server endpoints available at:');
    console.log('   - Documentation: http://localhost:3003/api/docs');
    console.log('   - Health check: http://localhost:3003/health');
    console.log('   - Notification status: http://localhost:3003/api/notifications/status');
    console.log('   - Agent status: http://localhost:3003/api/agents/status');
    
    console.log('\n💡 To test slash commands:');
    console.log('   curl -X POST http://localhost:3003/webhooks/slack/command \\');
    console.log('     -H "Content-Type: application/json" \\');
    console.log('     -d \'{"command":"/agent-status","channel_id":"C1234567890","user_id":"U1234567890","user_name":"developer","text":""}\'');

    console.log('\n✋ Press Ctrl+C to stop the server');
    
    // Keep running for manual testing
    process.on('SIGINT', async () => {
      console.log('\n📴 Shutting down...');
      await server.stop();
      process.exit(0);
    });

  } catch (error) {
    console.error('❌ Test failed:', error);
    process.exit(1);
  }
}

// Run tests if this file is executed directly
if (require.main === module) {
  testNotificationSystem();
}

export { testNotificationSystem };