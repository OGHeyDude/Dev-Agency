/**
 * Issue data models for VCS integration
 */

import { Author, Assignee, Label, Milestone } from './PullRequest';

export interface IssueTicketSync {
  vcsIssue: Issue;
  devAgencyTicket: DevAgencyTicket;
  syncStatus: 'synced' | 'pending' | 'failed' | 'conflict';
  lastSyncAt?: Date;
  syncErrors: string[];
}

export interface DevAgencyTicket {
  id: string;
  title: string;
  description: string;
  status: string;
  priority: 'low' | 'medium' | 'high' | 'critical';
  assignee?: string;
  labels: string[];
  epic?: string;
  storyPoints?: number;
  createdAt: Date;
  updatedAt: Date;
  specLink?: string;
}

export interface IssueSyncConfig {
  enabled: boolean;
  bidirectionalSync: boolean;
  autoCreateIssues: boolean;
  autoCreateTickets: boolean;
  syncFrequency: 'realtime' | 'hourly' | 'daily' | 'manual';
  statusMapping: Record<string, string>;
  fieldMapping: {
    title: string;
    description: string;
    assignee: string;
    labels: string[];
    milestone: string;
    priority: string;
  };
  conflictResolution: 'vcs_wins' | 'ticket_wins' | 'manual';
}

export interface IssueTemplate {
  name: string;
  title: string;
  description: string;
  labels: string[];
  assignees: string[];
  milestone?: string;
  templateFile: string;
  requiredFields: string[];
}

export interface IssueCreationConfig {
  repository: string;
  owner: string;
  repo: string;
  projectId?: string | number; // GitLab
  title: string;
  description: string;
  template: 'bug-report' | 'feature-request' | 'task' | 'epic' | 'story';
  assignees: string[];
  labels: string[];
  milestone?: string;
  linkedTicket?: string;
  context?: Record<string, any>;
}

export interface IssueCreationResult {
  success: boolean;
  issue?: Issue;
  error?: string;
  warnings: string[];
  validationErrors: string[];
}

export interface IssueUpdateResult {
  success: boolean;
  issue?: Issue;
  error?: string;
  changes: string[];
}

export interface IssueSyncResult {
  success: boolean;
  synced: IssueTicketSync[];
  failed: IssueSyncFailure[];
  conflicts: IssueSyncConflict[];
  summary: IssueSyncSummary;
}

export interface IssueSyncFailure {
  issueId: string | number;
  ticketId?: string;
  error: string;
  retryable: boolean;
}

export interface IssueSyncConflict {
  issueId: string | number;
  ticketId: string;
  conflictingFields: string[];
  vcsValues: Record<string, any>;
  ticketValues: Record<string, any>;
  suggestedResolution: 'use_vcs' | 'use_ticket' | 'merge' | 'manual';
}

export interface IssueSyncSummary {
  totalProcessed: number;
  successful: number;
  failed: number;
  conflicts: number;
  created: number;
  updated: number;
  duration: number;
}

export interface IssueComment {
  id: string | number;
  author: Author;
  body: string;
  createdAt: Date;
  updatedAt: Date;
  url: string;
}

export interface IssueEvent {
  id: string | number;
  event: 'opened' | 'closed' | 'reopened' | 'assigned' | 'unassigned' | 'labeled' | 'unlabeled' | 'milestoned' | 'demilestoned';
  author: Author;
  createdAt: Date;
  data?: Record<string, any>;
}

export interface IssueMetrics {
  timeToFirstResponse?: number; // minutes
  timeToResolution?: number; // minutes
  commentCount: number;
  participantCount: number;
  labelChanges: number;
  assigneeChanges: number;
  reopenCount: number;
}

export interface BulkIssueOperation {
  operation: 'create' | 'update' | 'close' | 'reopen' | 'assign' | 'label';
  issues: string[] | number[]; // issue IDs
  data: Record<string, any>;
  batchSize: number;
  continueOnError: boolean;
}

export interface BulkIssueResult {
  operation: string;
  totalRequested: number;
  successful: number;
  failed: number;
  results: Array<{
    issueId: string | number;
    success: boolean;
    error?: string;
  }>;
  duration: number;
}