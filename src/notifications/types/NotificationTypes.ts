/**
 * Notification Types and Interfaces for Slack/Teams Integration
 */

export interface NotificationConfig {
  slack?: SlackConfig;
  teams?: TeamsConfig;
  global?: GlobalNotificationConfig;
}

export interface SlackConfig {
  enabled: boolean;
  webhookUrl?: string;
  botToken?: string;
  defaultChannel?: string;
  channels: ChannelMapping[];
  rateLimitRpm?: number; // requests per minute
}

export interface TeamsConfig {
  enabled: boolean;
  webhookUrl?: string;
  channels: ChannelMapping[];
  rateLimitRpm?: number;
}

export interface GlobalNotificationConfig {
  enabledEvents: NotificationEvent[];
  retryAttempts: number;
  retryDelayMs: number;
  timeoutMs: number;
}

export interface ChannelMapping {
  projectPattern?: string; // regex pattern for project names
  agentPattern?: string;   // regex pattern for agent names
  channel: string;         // channel ID or webhook URL
  events: NotificationEvent[];
}

export type NotificationEvent = 
  | 'agent_start'
  | 'agent_complete' 
  | 'agent_error'
  | 'agent_timeout'
  | 'system_health'
  | 'circuit_breaker_open'
  | 'circuit_breaker_close'
  | 'degradation_start'
  | 'degradation_end';

export type NotificationPriority = 'low' | 'normal' | 'high' | 'critical';

export interface NotificationPayload {
  event: NotificationEvent;
  priority: NotificationPriority;
  timestamp: string;
  source: string;
  agentName?: string;
  ticketId?: string;
  projectName?: string;
  message: string;
  details?: Record<string, any>;
  error?: {
    type: string;
    message: string;
    stack?: string;
  };
  metrics?: {
    duration?: number;
    tokenCount?: number;
    success?: boolean;
  };
}

export interface SlackMessage {
  channel?: string;
  username?: string;
  icon_emoji?: string;
  text?: string;
  blocks?: SlackBlock[];
  attachments?: SlackAttachment[];
}

export interface SlackBlock {
  type: string;
  text?: {
    type: string;
    text: string;
  };
  fields?: Array<{
    type: string;
    text: string;
  }>;
  accessory?: any;
}

export interface SlackAttachment {
  color?: string;
  title?: string;
  title_link?: string;
  text?: string;
  fields?: Array<{
    title: string;
    value: string;
    short?: boolean;
  }>;
  footer?: string;
  ts?: number;
  fallback?: string;
}

export interface TeamsMessage {
  '@type': string;
  '@context': string;
  summary: string;
  themeColor?: string;
  sections?: TeamsSection[];
  potentialAction?: TeamsAction[];
}

export interface TeamsSection {
  activityTitle?: string;
  activitySubtitle?: string;
  activityImage?: string;
  facts?: Array<{
    name: string;
    value: string;
  }>;
  text?: string;
  markdown?: boolean;
}

export interface TeamsAction {
  '@type': string;
  name: string;
  targets?: Array<{
    os: string;
    uri: string;
  }>;
}

export interface SlashCommandRequest {
  command: string;
  channel_id: string;
  channel_name: string;
  user_id: string;
  user_name: string;
  text: string;
  team_id?: string;
  team_domain?: string;
}

export interface SlashCommandResponse {
  response_type: 'ephemeral' | 'in_channel';
  text?: string;
  blocks?: SlackBlock[];
  attachments?: SlackAttachment[];
}

export interface NotificationResult {
  success: boolean;
  platform: 'slack' | 'teams';
  channel: string;
  messageId?: string;
  error?: string;
  timestamp: string;
}