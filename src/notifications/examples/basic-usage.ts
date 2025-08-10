/**
 * Basic Usage Examples for Dev-Agency Notification System
 */

import { setupNotificationSystem, withNotifications } from '../index';
import type { AgentExecutionContext } from '../index';

/**
 * Example 1: Quick setup with environment variables
 */
async function quickSetupExample() {
  console.log('🚀 Setting up notification system...');
  
  const system = await setupNotificationSystem({
    serverPort: 3002,
    enableSlack: process.env.SLACK_ENABLED === 'true',
    enableTeams: process.env.TEAMS_ENABLED === 'true',
    slackWebhookUrl: process.env.SLACK_WEBHOOK_URL,
    slackBotToken: process.env.SLACK_BOT_TOKEN,
    teamsWebhookUrl: process.env.TEAMS_WEBHOOK_URL,
    autoStart: true
  });

  console.log('✅ System ready!');
  console.log('Status:', system.getStatus());

  // Test connections
  const connectionTests = await system.testConnections();
  console.log('Connection tests:', connectionTests);

  return system;
}

/**
 * Example 2: Manual notification sending
 */
async function manualNotificationExample() {
  const system = await setupNotificationSystem();
  const { notificationManager } = system;

  // Send a simple notification
  await notificationManager.notify({
    event: 'agent_complete',
    priority: 'normal',
    timestamp: new Date().toISOString(),
    source: 'Manual Example',
    agentName: 'architect',
    ticketId: 'EXAMPLE-001',
    projectName: 'dev-agency',
    message: 'Architecture design completed successfully',
    metrics: {
      duration: 5000,
      tokenCount: 2500,
      success: true
    }
  });

  console.log('✅ Manual notification sent');
}

/**
 * Example 3: Using the agent integration wrapper
 */
async function agentIntegrationExample() {
  const system = await setupNotificationSystem();

  // Simulate agent execution context
  const context: AgentExecutionContext = {
    agentName: 'coder',
    task: 'Implement notification system',
    ticketId: 'AGENT-028',
    projectName: 'dev-agency',
    startTime: new Date(),
    metadata: {
      sprintId: 'sprint-4',
      priority: 'high'
    }
  };

  // Wrap agent execution with notifications
  const result = await withNotifications(context, async () => {
    // Simulate some work
    console.log('🔧 Agent working...');
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Simulate some output
    return 'Notification system implemented successfully!';
  });

  console.log('Agent result:', result);
}

/**
 * Example 4: Error handling with notifications
 */
async function errorHandlingExample() {
  const system = await setupNotificationSystem();

  const context: AgentExecutionContext = {
    agentName: 'security',
    task: 'Security audit with intentional error',
    ticketId: 'EXAMPLE-ERROR',
    projectName: 'dev-agency',
    startTime: new Date()
  };

  try {
    await withNotifications(context, async () => {
      // Simulate work then error
      await new Promise(resolve => setTimeout(resolve, 1000));
      throw new Error('Simulated security issue found');
    });
  } catch (error) {
    console.log('Expected error caught:', error.message);
  }
}

/**
 * Example 5: System health notifications
 */
async function systemHealthExample() {
  const system = await setupNotificationSystem();
  const { notificationManager } = system;

  // Simulate health changes
  await notificationManager.notifySystemHealth('healthy', 'All systems operational');
  await new Promise(resolve => setTimeout(resolve, 1000));
  
  await notificationManager.notifySystemHealth('degraded', 'High memory usage detected');
  await new Promise(resolve => setTimeout(resolve, 1000));
  
  await notificationManager.notifySystemHealth('healthy', 'Memory usage normalized');
}

/**
 * Example 6: Slash command simulation
 */
async function slashCommandExample() {
  const system = await setupNotificationSystem();
  const { agentIntegration } = system;

  // Update some agent statuses
  agentIntegration.updateAgentStatus('architect', {
    name: 'architect',
    status: 'running',
    currentTask: 'Designing microservices architecture',
    startTime: new Date().toISOString()
  });

  agentIntegration.updateAgentStatus('coder', {
    name: 'coder',
    status: 'idle',
    currentTask: undefined,
    startTime: undefined
  });

  agentIntegration.updateAgentStatus('tester', {
    name: 'tester',
    status: 'error',
    currentTask: undefined,
    startTime: undefined
  });

  console.log('Agent statuses updated for slash command testing');
  console.log('Try: POST /webhooks/slack/command with body:');
  console.log(JSON.stringify({
    command: '/agent-status',
    channel_id: 'C1234567890',
    channel_name: 'dev-agency',
    user_id: 'U1234567890',
    user_name: 'developer',
    text: ''
  }, null, 2));
}

/**
 * Run all examples
 */
async function runAllExamples() {
  try {
    console.log('🚀 Starting notification system examples...\n');

    // Example 1: Quick setup
    console.log('=== Example 1: Quick Setup ===');
    const system = await quickSetupExample();
    console.log('');

    // Example 2: Manual notifications
    console.log('=== Example 2: Manual Notifications ===');
    await manualNotificationExample();
    console.log('');

    // Example 3: Agent integration
    console.log('=== Example 3: Agent Integration ===');
    await agentIntegrationExample();
    console.log('');

    // Example 4: Error handling
    console.log('=== Example 4: Error Handling ===');
    await errorHandlingExample();
    console.log('');

    // Example 5: System health
    console.log('=== Example 5: System Health ===');
    await systemHealthExample();
    console.log('');

    // Example 6: Slash commands
    console.log('=== Example 6: Slash Command Setup ===');
    await slashCommandExample();
    console.log('');

    console.log('✅ All examples completed successfully!');
    console.log('🌐 Server running at http://localhost:3002');
    console.log('📖 API docs at http://localhost:3002/api/docs');
    console.log('💚 Health check at http://localhost:3002/health');

    // Keep running for testing
    console.log('\n⏳ Server will keep running for testing...');
    console.log('Press Ctrl+C to stop');

  } catch (error) {
    console.error('❌ Example failed:', error);
    process.exit(1);
  }
}

// Run examples if this file is executed directly
if (require.main === module) {
  runAllExamples().catch(console.error);
}

export {
  quickSetupExample,
  manualNotificationExample,
  agentIntegrationExample,
  errorHandlingExample,
  systemHealthExample,
  slashCommandExample,
  runAllExamples
};