-- ORBITA Database Schema
-- Run in Supabase SQL Editor

-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- Users
create table if not exists users (
  id uuid primary key default uuid_generate_v4(),
  github_id text unique not null,
  login text not null,
  name text,
  avatar_url text,
  email text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- GitHub Installations
create table if not exists github_installations (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references users(id) on delete cascade,
  installation_id text unique not null,
  account_login text not null,
  account_type text default 'user',
  permissions jsonb default '{}',
  created_at timestamptz default now()
);

-- Repositories
create table if not exists repositories (
  id uuid primary key default uuid_generate_v4(),
  installation_id uuid references github_installations(id) on delete cascade,
  github_id text unique not null,
  name text not null,
  full_name text not null,
  language text,
  is_private boolean default false,
  stars int default 0,
  default_branch text default 'main',
  url text,
  created_at timestamptz default now(),
  last_analyzed_at timestamptz
);

-- Pull Requests
create table if not exists pull_requests (
  id uuid primary key default uuid_generate_v4(),
  repository_id uuid references repositories(id) on delete cascade,
  github_id text not null,
  number int not null,
  title text not null,
  description text,
  author_login text,
  author_avatar_url text,
  branch text,
  base_branch text default 'main',
  commit_sha text,
  files_changed int default 0,
  additions int default 0,
  deletions int default 0,
  status text default 'queued' check (status in ('queued','fetching','analyzing','validating','scoring','generating','complete','failed')),
  github_url text,
  labels jsonb default '[]',
  created_at timestamptz default now(),
  updated_at timestamptz default now(),
  unique(repository_id, number)
);

-- Analysis Runs
create table if not exists analysis_runs (
  id uuid primary key default uuid_generate_v4(),
  pull_request_id uuid references pull_requests(id) on delete cascade,
  status text default 'queued',
  stages jsonb default '[]',
  duration_ms int,
  started_at timestamptz,
  completed_at timestamptz,
  error_message text,
  created_at timestamptz default now()
);

-- Findings
create table if not exists findings (
  id uuid primary key default uuid_generate_v4(),
  pull_request_id uuid references pull_requests(id) on delete cascade,
  analysis_run_id uuid references analysis_runs(id) on delete cascade,
  severity text not null check (severity in ('critical','high','medium','low','info')),
  category text not null,
  title text not null,
  explanation text,
  reasoning text,
  impact text,
  suggested_fix text,
  file text,
  line int,
  end_line int,
  code_snippet text,
  confidence float default 0.8,
  evidence jsonb default '[]',
  status text default 'open' check (status in ('open','dismissed','accepted','false_positive','fixed')),
  dismissal_reason text,
  source text default 'ai' check (source in ('ai','semgrep','ruff','eslint','ast')),
  created_at timestamptz default now()
);

-- Risk Scores
create table if not exists risk_scores (
  id uuid primary key default uuid_generate_v4(),
  pull_request_id uuid references pull_requests(id) on delete cascade,
  overall float not null,
  level text not null,
  security_score float,
  correctness_score float,
  performance_score float,
  maintainability_score float,
  complexity_score float,
  breakdown jsonb default '{}',
  created_at timestamptz default now()
);

-- Reviews
create table if not exists reviews (
  id uuid primary key default uuid_generate_v4(),
  pull_request_id uuid references pull_requests(id) on delete cascade,
  status text default 'pending' check (status in ('pending','posted','failed')),
  summary text,
  github_review_id text,
  posted_at timestamptz,
  created_at timestamptz default now()
);

-- Review Comments
create table if not exists review_comments (
  id uuid primary key default uuid_generate_v4(),
  review_id uuid references reviews(id) on delete cascade,
  finding_id uuid references findings(id),
  file text,
  line int,
  body text,
  github_comment_id text,
  created_at timestamptz default now()
);

-- Repository Rules
create table if not exists repository_rules (
  id uuid primary key default uuid_generate_v4(),
  repository_id uuid references repositories(id) on delete cascade,
  name text not null,
  description text,
  rules text not null,
  enabled boolean default true,
  created_at timestamptz default now()
);

-- User Feedback (for learning loop)
create table if not exists user_feedback (
  id uuid primary key default uuid_generate_v4(),
  finding_id uuid references findings(id) on delete cascade,
  user_id uuid references users(id),
  feedback_type text not null check (feedback_type in ('dismiss','accept','false_positive','helpful','not_helpful')),
  reason text,
  notes text,
  created_at timestamptz default now()
);

-- Enable Row Level Security
alter table users enable row level security;
alter table repositories enable row level security;
alter table pull_requests enable row level security;
alter table findings enable row level security;
alter table reviews enable row level security;

-- Indexes for performance
create index if not exists idx_pull_requests_repo on pull_requests(repository_id);
create index if not exists idx_findings_pr on findings(pull_request_id);
create index if not exists idx_findings_severity on findings(severity);
create index if not exists idx_analysis_runs_pr on analysis_runs(pull_request_id);
