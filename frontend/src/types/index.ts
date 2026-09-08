// Core domain types for ORBITA

export type Severity = 'critical' | 'high' | 'medium' | 'low' | 'info';
export type AnalysisStatus = 'queued' | 'fetching' | 'analyzing' | 'validating' | 'scoring' | 'generating' | 'complete' | 'failed';
export type ReviewStatus = 'pending' | 'posted' | 'failed';
export type FindingCategory = 'security' | 'correctness' | 'performance' | 'maintainability' | 'style' | 'architecture';

export interface Repository {
  id: string;
  name: string;
  fullName: string;
  language: string;
  stars: number;
  openPRs: number;
  lastAnalyzed: string;
  riskDistribution: RiskDistribution;
  url: string;
  isPrivate: boolean;
}

export interface RiskDistribution {
  critical: number;
  high: number;
  medium: number;
  low: number;
  passed: number;
}

export interface PullRequest {
  id: string;
  number: number;
  title: string;
  author: Author;
  repository: string;
  repositoryId: string;
  branch: string;
  baseBranch: string;
  commitSha: string;
  filesChanged: number;
  additions: number;
  deletions: number;
  status: AnalysisStatus;
  riskScore?: RiskScore;
  findingsCount?: FindingsCount;
  createdAt: string;
  updatedAt: string;
  url: string;
  description: string;
  labels: string[];
}

export interface Author {
  login: string;
  avatarUrl: string;
  name: string;
}

export interface RiskScore {
  overall: number;
  level: 'critical' | 'high' | 'medium' | 'low' | 'passed';
  breakdown: {
    security: CategoryScore;
    correctness: CategoryScore;
    performance: CategoryScore;
    maintainability: CategoryScore;
    complexity: CategoryScore;
  };
}

export interface CategoryScore {
  score: number;
  maxScore: number;
  reasoning: string;
  confidence: number;
}

export interface FindingsCount {
  critical: number;
  high: number;
  medium: number;
  low: number;
  info: number;
  total: number;
}

export interface Finding {
  id: string;
  pullRequestId: string;
  severity: Severity;
  category: FindingCategory;
  title: string;
  explanation: string;
  reasoning: string;
  impact: string;
  suggestedFix: string;
  file: string;
  line: number;
  endLine?: number;
  codeSnippet: string;
  confidence: number;
  evidence: string[];
  status: 'open' | 'dismissed' | 'accepted' | 'false_positive' | 'fixed';
  dismissalReason?: string;
  source: 'ai' | 'semgrep' | 'ruff' | 'eslint' | 'ast';
}

export interface AnalysisRun {
  id: string;
  pullRequestId: string;
  stages: AnalysisStage[];
  startedAt: string;
  completedAt?: string;
  status: AnalysisStatus;
  durationMs?: number;
}

export interface AnalysisStage {
  id: string;
  name: string;
  description: string;
  status: 'pending' | 'running' | 'complete' | 'failed';
  startedAt?: string;
  completedAt?: string;
  durationMs?: number;
}

export interface Review {
  id: string;
  pullRequestId: string;
  status: ReviewStatus;
  summary: string;
  findings: Finding[];
  riskScore: RiskScore;
  postedAt?: string;
  githubUrl?: string;
}

export interface DiffFile {
  filename: string;
  status: 'added' | 'modified' | 'deleted' | 'renamed';
  additions: number;
  deletions: number;
  patch: string;
  language: string;
}

export interface DiffLine {
  type: 'add' | 'remove' | 'context';
  lineNumber: number | null;
  oldLineNumber: number | null;
  content: string;
  findings: Finding[];
}

export interface Notification {
  id: string;
  type: 'analysis_complete' | 'critical_finding' | 'review_posted' | 'github_connected';
  title: string;
  message: string;
  timestamp: string;
  read: boolean;
  pullRequestId?: string;
}

export interface RepositoryRule {
  id: string;
  repositoryId: string;
  name: string;
  description: string;
  rules: string;
  enabled: boolean;
  createdAt: string;
}

export interface AnalyticsData {
  riskTrend: RiskTrendPoint[];
  issueDistribution: IssueDistributionPoint[];
  highRiskFiles: HighRiskFile[];
  reviewEfficiency: ReviewEfficiency;
  commonPatterns: CommonPattern[];
}

export interface RiskTrendPoint {
  date: string;
  critical: number;
  high: number;
  medium: number;
  low: number;
  avgScore: number;
}

export interface IssueDistributionPoint {
  category: FindingCategory;
  count: number;
  percentage: number;
}

export interface HighRiskFile {
  filename: string;
  findingsCount: number;
  criticalCount: number;
  repository: string;
}

export interface ReviewEfficiency {
  prAnalyzed: number;
  findingsDetected: number;
  findingsDismissed: number;
  findingsFixed: number;
  avgAnalysisTime: number;
}

export interface CommonPattern {
  pattern: string;
  count: number;
  severity: Severity;
  category: FindingCategory;
}
