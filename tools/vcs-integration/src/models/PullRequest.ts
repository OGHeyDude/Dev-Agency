/**
 * Pull Request data models for VCS integration
 */

export interface PullRequest {
  id: string | number;
  number: number;
  title: string;
  description: string;
  state: 'open' | 'closed' | 'merged';
  draft: boolean;
  sourceBranch: string;
  targetBranch: string;
  author: Author;
  reviewers: Reviewer[];
  assignees: Assignee[];
  labels: Label[];
  createdAt: Date;
  updatedAt: Date;
  mergedAt?: Date;
  closedAt?: Date;
  url: string;
  diffUrl: string;
  commitsUrl: string;
  reviewsUrl: string;
  statusChecks: StatusCheck[];
  conflicted: boolean;
  mergeable: boolean;
  repository: Repository;
  head: BranchRef;
  base: BranchRef;
  stats?: PRStats;
  linkedIssues: Issue[];
}

export interface PRConfig {
  repository: string;
  owner: string;
  repo: string;
  projectId?: string | number; // GitLab project ID
  sourceBranch: string;
  targetBranch: string;
  title: string;
  description?: string;
  template: 'feature' | 'bugfix' | 'refactor' | 'hotfix' | 'release';
  ticketId: string;
  draft: boolean;
  autoAssignReviewers: boolean;
  reviewers: string[];
  assignees: string[];
  labels: string[];
  linkedIssues?: number[];
  deleteSourceBranch?: boolean;
  squashMerge?: boolean;
  context?: Record<string, any>;
}

export interface PRTemplate {
  name: string;
  title: string;
  description: string;
  reviewers: string[];
  labels: string[];
  assignees: string[];
  draft: boolean;
  deleteSourceBranch: boolean;
  requiredChecks: string[];
  templateFile: string;
}

export interface Author {
  id: string | number;
  username: string;
  displayName: string;
  email?: string;
  avatarUrl?: string;
  url: string;
}

export interface Reviewer {
  id: string | number;
  username: string;
  displayName: string;
  state: 'requested' | 'approved' | 'changes_requested' | 'dismissed';
  submittedAt?: Date;
  reviewUrl?: string;
  comments?: ReviewComment[];
}

export interface ReviewComment {
  id: string | number;
  author: Author;
  body: string;
  path?: string;
  line?: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface Assignee {
  id: string | number;
  username: string;
  displayName: string;
  avatarUrl?: string;
}

export interface Label {
  name: string;
  color: string;
  description?: string;
}

export interface StatusCheck {
  name: string;
  status: 'pending' | 'success' | 'failure' | 'error' | 'cancelled';
  conclusion?: string;
  description?: string;
  targetUrl?: string;
  context: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Repository {
  id: string | number;
  name: string;
  fullName: string;
  owner: string;
  private: boolean;
  defaultBranch: string;
  url: string;
  cloneUrl: string;
  sshUrl: string;
  language?: string;
  topics: string[];
}

export interface BranchRef {
  ref: string;
  sha: string;
  repository: Repository;
}

export interface PRStats {
  additions: number;
  deletions: number;
  changedFiles: number;
  commits: number;
}

export interface Issue {
  id: string | number;
  number: number;
  title: string;
  description: string;
  state: 'open' | 'closed';
  author: Author;
  assignees: Assignee[];
  labels: Label[];
  milestone?: Milestone;
  createdAt: Date;
  updatedAt: Date;
  closedAt?: Date;
  url: string;
}

export interface Milestone {
  id: string | number;
  title: string;
  description?: string;
  state: 'open' | 'closed';
  dueDate?: Date;
  completedAt?: Date;
}

export interface PRCreationResult {
  success: boolean;
  pullRequest?: PullRequest;
  error?: string;
  warnings: string[];
  validationErrors: string[];
}

export interface PRUpdateResult {
  success: boolean;
  pullRequest?: PullRequest;
  error?: string;
  changes: string[];
}

export interface PRMergeResult {
  success: boolean;
  mergedAt?: Date;
  mergeCommitSha?: string;
  error?: string;
  conflicts?: ConflictInfo[];
}

export interface ConflictInfo {
  file: string;
  conflictMarkers: ConflictMarker[];
}

export interface ConflictMarker {
  startLine: number;
  endLine: number;
  currentContent: string;
  incomingContent: string;
  baseContent?: string;
}