/**
 * VCS webhook event models for real-time integration
 */

export interface VCSEvent {
  id: string;
  eventType: string;
  platform: 'github' | 'gitlab';
  timestamp: Date;
  repository: EventRepository;
  sender: EventActor;
  payload: any;
  signature?: string;
  delivery?: string;
  processed: boolean;
  processedAt?: Date;
  processingErrors: string[];
  retryCount: number;
}

export interface EventRepository {
  id: string | number;
  name: string;
  fullName: string;
  owner: string;
  private: boolean;
  url: string;
}

export interface EventActor {
  id: string | number;
  username: string;
  displayName: string;
  type: 'user' | 'bot' | 'organization';
  url?: string;
  avatarUrl?: string;
}

// GitHub Events
export interface GitHubWebhookEvent extends VCSEvent {
  platform: 'github';
  action?: string;
  number?: number;
  pull_request?: GitHubPullRequest;
  issue?: GitHubIssue;
  check_run?: GitHubCheckRun;
  check_suite?: GitHubCheckSuite;
  deployment?: GitHubDeployment;
  deployment_status?: GitHubDeploymentStatus;
  push?: GitHubPushEvent;
  release?: GitHubRelease;
  workflow_run?: GitHubWorkflowRun;
}

export interface GitHubPullRequest {
  id: number;
  number: number;
  title: string;
  body: string;
  state: 'open' | 'closed';
  draft: boolean;
  merged: boolean;
  mergeable?: boolean;
  mergeable_state: string;
  user: GitHubUser;
  assignees: GitHubUser[];
  requested_reviewers: GitHubUser[];
  labels: GitHubLabel[];
  head: GitHubRef;
  base: GitHubRef;
  created_at: string;
  updated_at: string;
  merged_at?: string;
  closed_at?: string;
  html_url: string;
  diff_url: string;
  patch_url: string;
}

export interface GitHubIssue {
  id: number;
  number: number;
  title: string;
  body: string;
  state: 'open' | 'closed';
  user: GitHubUser;
  assignees: GitHubUser[];
  labels: GitHubLabel[];
  milestone?: GitHubMilestone;
  created_at: string;
  updated_at: string;
  closed_at?: string;
  html_url: string;
}

export interface GitHubUser {
  id: number;
  login: string;
  type: 'User' | 'Bot' | 'Organization';
  avatar_url: string;
  html_url: string;
}

export interface GitHubLabel {
  name: string;
  color: string;
  description?: string;
}

export interface GitHubRef {
  ref: string;
  sha: string;
  repo: {
    id: number;
    name: string;
    full_name: string;
    owner: GitHubUser;
  };
}

export interface GitHubMilestone {
  id: number;
  title: string;
  description?: string;
  state: 'open' | 'closed';
  due_on?: string;
  closed_at?: string;
}

export interface GitHubCheckRun {
  id: number;
  name: string;
  status: 'queued' | 'in_progress' | 'completed';
  conclusion?: 'success' | 'failure' | 'neutral' | 'cancelled' | 'skipped' | 'timed_out' | 'action_required';
  started_at: string;
  completed_at?: string;
  html_url: string;
  check_suite: {
    id: number;
  };
  pull_requests: Array<{
    id: number;
    number: number;
    head: { sha: string };
    base: { sha: string };
  }>;
}

export interface GitHubCheckSuite {
  id: number;
  status: 'queued' | 'in_progress' | 'completed';
  conclusion?: 'success' | 'failure' | 'neutral' | 'cancelled' | 'skipped' | 'timed_out' | 'action_required';
  head_branch: string;
  head_sha: string;
  pull_requests: Array<{
    id: number;
    number: number;
  }>;
}

export interface GitHubPushEvent {
  ref: string;
  before: string;
  after: string;
  created: boolean;
  deleted: boolean;
  forced: boolean;
  commits: GitHubCommit[];
  head_commit: GitHubCommit;
}

export interface GitHubCommit {
  id: string;
  message: string;
  timestamp: string;
  url: string;
  author: {
    name: string;
    email: string;
    username?: string;
  };
  committer: {
    name: string;
    email: string;
    username?: string;
  };
  added: string[];
  removed: string[];
  modified: string[];
}

export interface GitHubWorkflowRun {
  id: number;
  name: string;
  status: 'queued' | 'in_progress' | 'completed';
  conclusion?: 'success' | 'failure' | 'neutral' | 'cancelled' | 'skipped' | 'timed_out' | 'action_required';
  workflow_id: number;
  head_branch: string;
  head_sha: string;
  run_attempt: number;
  run_started_at: string;
  created_at: string;
  updated_at: string;
  html_url: string;
  pull_requests: Array<{
    id: number;
    number: number;
    head: { sha: string };
    base: { sha: string };
  }>;
}

export interface GitHubDeployment {
  id: number;
  sha: string;
  ref: string;
  environment: string;
  description: string;
  creator: GitHubUser;
  created_at: string;
  updated_at: string;
  payload: any;
}

export interface GitHubDeploymentStatus {
  id: number;
  state: 'error' | 'failure' | 'inactive' | 'pending' | 'success' | 'queued' | 'in_progress';
  creator: GitHubUser;
  description: string;
  target_url?: string;
  deployment_url: string;
  created_at: string;
  updated_at: string;
}

export interface GitHubRelease {
  id: number;
  tag_name: string;
  target_commitish: string;
  name: string;
  body: string;
  draft: boolean;
  prerelease: boolean;
  created_at: string;
  published_at: string;
  author: GitHubUser;
  assets: Array<{
    id: number;
    name: string;
    content_type: string;
    size: number;
    download_count: number;
    browser_download_url: string;
  }>;
}

// GitLab Events
export interface GitLabWebhookEvent extends VCSEvent {
  platform: 'gitlab';
  object_kind: string;
  project?: GitLabProject;
  merge_request?: GitLabMergeRequest;
  issue?: GitLabIssue;
  pipeline?: GitLabPipeline;
  job?: GitLabJob;
  deployment?: GitLabDeployment;
  push?: GitLabPushEvent;
  tag_push?: GitLabTagPushEvent;
  release?: GitLabRelease;
}

export interface GitLabProject {
  id: number;
  name: string;
  path: string;
  path_with_namespace: string;
  default_branch: string;
  visibility: 'private' | 'internal' | 'public';
  web_url: string;
  ssh_url_to_repo: string;
  http_url_to_repo: string;
}

export interface GitLabMergeRequest {
  id: number;
  iid: number;
  title: string;
  description: string;
  state: 'opened' | 'closed' | 'merged';
  merge_status: 'unchecked' | 'checking' | 'can_be_merged' | 'cannot_be_merged';
  target_branch: string;
  source_branch: string;
  author: GitLabUser;
  assignees: GitLabUser[];
  reviewers: GitLabUser[];
  labels: string[];
  draft: boolean;
  work_in_progress: boolean;
  created_at: string;
  updated_at: string;
  merged_at?: string;
  closed_at?: string;
  url: string;
}

export interface GitLabUser {
  id: number;
  name: string;
  username: string;
  email: string;
  avatar_url: string;
  web_url: string;
}

export interface GitLabIssue {
  id: number;
  iid: number;
  title: string;
  description: string;
  state: 'opened' | 'closed';
  author: GitLabUser;
  assignees: GitLabUser[];
  labels: string[];
  milestone?: {
    id: number;
    title: string;
    description?: string;
    state: 'active' | 'closed';
    due_date?: string;
  };
  created_at: string;
  updated_at: string;
  closed_at?: string;
  url: string;
}

export interface GitLabPipeline {
  id: number;
  status: 'created' | 'waiting_for_resource' | 'preparing' | 'pending' | 'running' | 'success' | 'failed' | 'canceled' | 'skipped' | 'manual' | 'scheduled';
  ref: string;
  sha: string;
  web_url: string;
  created_at: string;
  updated_at: string;
  finished_at?: string;
  duration?: number;
  queued_duration?: number;
  source: 'push' | 'web' | 'trigger' | 'schedule' | 'api' | 'pipeline' | 'merge_request_event';
  coverage?: string;
  variables?: Array<{
    key: string;
    value: string;
    variable_type: 'env_var' | 'file';
  }>;
}

export interface GitLabJob {
  id: number;
  name: string;
  stage: string;
  status: 'created' | 'pending' | 'running' | 'success' | 'failed' | 'canceled' | 'skipped' | 'manual';
  created_at: string;
  started_at?: string;
  finished_at?: string;
  duration?: number;
  queued_duration?: number;
  failure_reason?: string;
  web_url: string;
  runner?: {
    id: number;
    description: string;
    is_shared: boolean;
    tags: string[];
  };
}

export interface GitLabPushEvent {
  before: string;
  after: string;
  ref: string;
  checkout_sha: string;
  total_commits_count: number;
  commits: GitLabCommit[];
}

export interface GitLabCommit {
  id: string;
  message: string;
  title: string;
  timestamp: string;
  url: string;
  author: {
    name: string;
    email: string;
  };
  added: string[];
  modified: string[];
  removed: string[];
}

export interface GitLabTagPushEvent {
  before: string;
  after: string;
  ref: string;
  checkout_sha: string;
  message?: string;
  total_commits_count: number;
  commits: GitLabCommit[];
}

export interface GitLabDeployment {
  id: number;
  iid: number;
  ref: string;
  sha: string;
  status: 'created' | 'running' | 'success' | 'failed' | 'canceled' | 'blocked';
  environment: {
    id: number;
    name: string;
    slug: string;
    external_url?: string;
  };
  deployable: {
    id: number;
    name: string;
    stage: string;
    status: string;
  };
  created_at: string;
  updated_at: string;
  finished_at?: string;
}

export interface GitLabRelease {
  id: number;
  tag_name: string;
  name: string;
  description: string;
  ref: string;
  created_at: string;
  released_at: string;
  author: GitLabUser;
  assets: {
    count: number;
    sources: Array<{
      format: string;
      url: string;
    }>;
    links: Array<{
      id: number;
      name: string;
      url: string;
      link_type: 'other' | 'runbook' | 'image' | 'package';
    }>;
  };
}

export interface EventProcessor {
  processEvent(event: VCSEvent): Promise<EventProcessingResult>;
  validateSignature(event: VCSEvent): boolean;
  filterEvent(event: VCSEvent): boolean;
  transformEvent(event: VCSEvent): Promise<ProcessedEvent>;
}

export interface EventProcessingResult {
  success: boolean;
  processed: boolean;
  actions: ProcessingAction[];
  errors: string[];
  processingTime: number;
  retryRequired: boolean;
}

export interface ProcessingAction {
  action: string;
  target: string;
  success: boolean;
  error?: string;
  data?: any;
}

export interface ProcessedEvent {
  original: VCSEvent;
  normalized: NormalizedEvent;
  actions: string[];
  priority: 'low' | 'medium' | 'high' | 'critical';
}

export interface NormalizedEvent {
  eventType: string;
  repository: string;
  actor: string;
  timestamp: Date;
  data: Record<string, any>;
  relatedObjects: RelatedObject[];
}

export interface RelatedObject {
  type: 'pull_request' | 'issue' | 'pipeline' | 'deployment' | 'release';
  id: string | number;
  url: string;
  title?: string;
  status?: string;
}