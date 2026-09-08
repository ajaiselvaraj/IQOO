import { useNavigate } from 'react-router-dom';
import {
  Zap, GitPullRequest, AlertTriangle, CheckCircle,
  Shield, TrendingUp, ArrowRight, Play, Cpu, FolderGit2, Activity
} from 'lucide-react';
import { useAppStore } from '@/stores/app';
import { DEMO_PRS, DEMO_ANALYTICS, DEMO_REPOSITORIES } from '@/data/demo';
import { SeverityBadge, RiskBadge } from '@/components/ui/Badge';
import { MetricCard } from '@/components/ui/MetricCard';
import { PageHeader } from '@/components/ui/PageHeader';
import { RiskScoreWidget } from '@/components/analysis/RiskScoreWidget';
import { formatRelativeTime } from '@/lib/utils';
import type { PullRequest } from '@/types';

function PRRow({ pr }: { pr: PullRequest }) {
  const navigate = useNavigate();
  const { riskScore, findingsCount } = pr;

  return (
    <tr
      key={pr.id}
      className="table-body-row cursor-pointer group"
      onClick={() => navigate(`/pull-requests/${pr.id}`)}
    >
      {/* PR # & Title */}
      <td className="min-w-0">
        <div className="flex items-center gap-4 min-w-0 py-2">
          <span className="font-mono text-[12px] font-bold text-indigo-400 shrink-0">#{pr.number}</span>
          <span className="font-semibold text-[13px] text-slate-100 group-hover:text-indigo-300 transition-colors truncate">
            {pr.title}
          </span>
        </div>
      </td>
      {/* Repository */}
      <td className="font-mono text-[12px] text-[var(--color-text-secondary)] font-medium truncate">
        {pr.repository.split('/')[1]}
      </td>
      {/* Author */}
      <td>
        <div className="flex items-center gap-2 text-[12px] truncate">
          <img src={pr.author.avatarUrl} alt="" className="w-4 h-4 rounded-full shrink-0" />
          <span className="font-medium text-slate-200 truncate">{pr.author.login}</span>
        </div>
      </td>
      {/* Diff Changes */}
      <td className="text-center font-mono text-[12px] font-semibold whitespace-nowrap">
        <span className="text-emerald-400">+{pr.additions}</span>
        <span className="text-rose-400 ml-1.5">-{pr.deletions}</span>
      </td>
      {/* Findings */}
      <td className="text-center whitespace-nowrap">
        {findingsCount ? (
          <div className="flex items-center justify-center gap-1.5">
            {findingsCount.critical > 0 && <SeverityBadge severity="critical" size="sm" />}
            {findingsCount.high > 0 && findingsCount.critical === 0 && <SeverityBadge severity="high" size="sm" />}
            <span className="font-mono text-[12px] font-bold text-slate-200">{findingsCount.total} issues</span>
          </div>
        ) : (
          <span className="text-[var(--color-text-muted)] font-mono text-[12px]">—</span>
        )}
      </td>
      {/* Risk Rating */}
      <td className="text-center whitespace-nowrap">
        {riskScore ? (
          <RiskBadge level={riskScore.level} score={riskScore.overall} size="md" />
        ) : (
          <span className="text-[var(--color-text-muted)] font-mono text-[12px]">—</span>
        )}
      </td>
      {/* Arrow */}
      <td className="text-right">
        <ArrowRight size={14} className="opacity-0 group-hover:opacity-100 transition-opacity text-indigo-400 inline" />
      </td>
    </tr>
  );
}

export function Dashboard() {
  const navigate = useNavigate();
  const { reviewEfficiency, commonPatterns, riskTrend } = DEMO_ANALYTICS;
  const latest = riskTrend[riskTrend.length - 1];

  return (
    <div className="page-container space-y-6">
      {/* Page Header */}
      <PageHeader
        title="Overview"
        subtitle="Engineering risk score & code review intelligence dashboard"
        actions={
          <button
            className="flex items-center gap-2 px-3.5 py-[7px] rounded-lg text-[12px] font-bold transition-all hover:opacity-90"
            style={{
              background: 'linear-gradient(135deg, #6366f1, #7c3aed)',
              color: 'white',
            }}
            onClick={() => navigate('/pull-requests/pr-142')}
          >
            <Zap size={13} />
            Analyze Active PR
          </button>
        }
      />

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
        <MetricCard
          label="Total Pull Requests"
          value={DEMO_PRS.length}
          color="var(--color-accent)"
          icon={GitPullRequest}
          sub="Analyzed across all repositories"
          trend="+12% this week"
        />
        <MetricCard
          label="Active Reviews"
          value={3}
          color="var(--color-pass)"
          icon={CheckCircle}
          sub="Currently under analysis"
          trend="In progress"
        />
        <MetricCard
          label="Critical Findings"
          value={latest.critical}
          color="var(--color-critical)"
          icon={AlertTriangle}
          sub="Requires immediate attention"
          trend="+2 unresolved"
        />
        <MetricCard
          label="Average Risk Score"
          value={42}
          color="var(--color-medium)"
          icon={Shield}
          sub="Platform-wide risk index"
          trend="-4 points (improving)"
        />
      </div>

      <div className="grid grid-cols-12 gap-8">
        {/* Left Column ~65% (8 Columns) — Active PR Table */}
        <div className="col-span-12 lg:col-span-8 space-y-6">
          <div className="surface-card overflow-hidden">
            <div
              className="flex items-center justify-between px-4 py-3"
              style={{ borderBottom: '1px solid var(--color-border)', background: 'var(--color-bg-elevated)' }}
            >
              <div className="flex items-center gap-2">
                <GitPullRequest size={15} className="text-indigo-400" />
                <h2 className="section-title">
                  Active Pull Requests ({DEMO_PRS.length})
                </h2>
              </div>
              <button
                className="text-[12px] font-semibold hover:underline text-indigo-400 flex items-center gap-1"
                onClick={() => navigate('/pull-requests')}
              >
                <span>View all PRs</span>
                <ArrowRight size={12} />
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left table-fixed">
                <thead>
                  <tr className="table-head-row">
                    <th style={{ width: '34%' }}>PR Number & Title</th>
                    <th style={{ width: '14%' }}>Repository</th>
                    <th style={{ width: '13%' }}>Author</th>
                    <th style={{ width: '11%', textAlign: 'center' }}>Changes</th>
                    <th style={{ width: '12%', textAlign: 'center' }}>Findings</th>
                    <th style={{ width: '11%', textAlign: 'center' }}>Risk Rating</th>
                    <th style={{ width: '5%' }}></th>
                  </tr>
                </thead>
                <tbody>
                  {DEMO_PRS.map(pr => (
                    <PRRow key={pr.id} pr={pr} />
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Secondary Grid (50% / 50%) */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {/* High-Risk Repositories */}
            <div className="surface-card p-4 space-y-3.5">
              <div className="flex items-center justify-between pb-2.5 border-b border-[var(--color-border-subtle)]">
                <div className="flex items-center gap-2">
                  <FolderGit2 size={15} className="text-indigo-400" />
                  <h2 className="section-title">High-Risk Codebases</h2>
                </div>
                <button
                  className="text-[12px] font-semibold hover:underline text-indigo-400"
                  onClick={() => navigate('/repositories')}
                >
                  All Repos →
                </button>
              </div>
              <div className="space-y-2">
                {DEMO_REPOSITORIES.slice(0, 3).map(repo => (
                  <div
                    key={repo.id}
                    className="flex items-center justify-between p-3 rounded-lg bg-[var(--color-bg-elevated)] border border-[var(--color-border-subtle)] hover:border-[var(--color-border)] transition-colors cursor-pointer"
                    onClick={() => navigate('/repositories')}
                  >
                    <div>
                      <div className="font-semibold text-[13px] text-slate-100">{repo.name}</div>
                      <div className="text-[11px] font-mono text-[var(--color-text-muted)] mt-0.5">{repo.language} · {repo.openPRs} open PRs</div>
                    </div>
                    <div className="text-right font-mono text-[12px]">
                      <div className="text-rose-400 font-bold">{repo.riskDistribution.critical} Critical</div>
                      <div className="text-[var(--color-text-muted)] text-[10px]">Health {100 - (repo.riskDistribution.critical * 25 + repo.riskDistribution.high * 15)}%</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Recent Pipeline Activity */}
            <div className="surface-card p-4 space-y-3.5">
              <div className="flex items-center gap-2 pb-2.5 border-b border-[var(--color-border-subtle)]">
                <Activity size={15} className="text-indigo-400" />
                <h2 className="section-title">Security Pipeline Activity</h2>
              </div>
              <div className="space-y-2 text-[12px] font-mono">
                {[
                  { time: '10m ago', text: 'Critical finding flagged on PR #142 (payment-service)', color: 'var(--color-critical)' },
                  { time: '1h ago', text: 'PR #141 analysis complete — 0 Critical, 2 Medium', color: 'var(--color-pass)' },
                  { time: '3h ago', text: 'OWASP Semgrep security scan finished on auth-gateway', color: 'var(--color-accent)' },
                  { time: '5h ago', text: 'GitHub webhook triggered review for PR #140', color: 'var(--color-text-secondary)' },
                ].map((act, i) => (
                  <div key={i} className="flex items-start gap-3 p-2.5 rounded-lg bg-[var(--color-bg-elevated)]">
                    <span className="text-[11px] text-[var(--color-text-muted)] shrink-0 pt-px">{act.time}</span>
                    <span className="flex-1 leading-relaxed" style={{ color: act.color }}>{act.text}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className="col-span-12 lg:col-span-4 space-y-8">
          {/* AI Vulnerability Insights */}
          <div className="surface-card overflow-hidden">
            <div
              className="flex items-center gap-2 px-4 py-3"
              style={{ borderBottom: '1px solid var(--color-border)', background: 'var(--color-bg-elevated)' }}
            >
              <Cpu size={15} className="text-indigo-400" />
              <h2 className="section-title">AI Vulnerability Insights</h2>
            </div>
            <div className="p-3.5 space-y-2.5">
              {commonPatterns.slice(0, 4).map((p, i) => (
                <div
                  key={i}
                  className="flex items-start gap-3 p-3 rounded-lg bg-[var(--color-bg-elevated)] border border-[var(--color-border-subtle)] hover:border-[var(--color-border)] transition-colors cursor-pointer"
                  onClick={() => navigate('/issues')}
                >
                  <SeverityBadge severity={p.severity} size="sm" />
                  <div className="flex-1 min-w-0">
                    <div className="text-[13px] font-semibold truncate text-slate-100">
                      {p.pattern}
                    </div>
                    <div className="text-[11px] font-mono text-[var(--color-text-muted)] mt-0.5">
                      {p.count}× occurrences in active diffs
                    </div>
                  </div>
                </div>
              ))}
            </div>
            {/* Security Health Gauge */}
            <RiskScoreWidget
              score={{
                overall: 42,
                level: 'medium',
                breakdown: {
                  security: { score: 35, maxScore: 100, confidence: 90, reasoning: 'Mock' },
                  correctness: { score: 45, maxScore: 100, confidence: 90, reasoning: 'Mock' },
                  performance: { score: 20, maxScore: 100, confidence: 90, reasoning: 'Mock' },
                  maintainability: { score: 65, maxScore: 100, confidence: 90, reasoning: 'Mock' },
                  complexity: { score: 45, maxScore: 100, confidence: 90, reasoning: 'Mock' }
                }
              }}
            />
          </div>


          {/* Interactive PR Demo CTA */}
          <div
            className="rounded-xl p-4 cursor-pointer transition-all hover:border-indigo-500/40"
            style={{
              background: 'linear-gradient(135deg, rgba(99,102,241,0.05) 0%, rgba(124,58,237,0.05) 100%)',
              border: '1px solid var(--color-accent-border)',
            }}
            onClick={() => navigate('/pull-requests/pr-142')}
          >
            <div className="flex items-center gap-2 mb-1.5">
              <Play size={13} className="text-indigo-400" />
              <span className="text-[11px] font-bold text-indigo-400 uppercase tracking-wider font-mono">
                Interactive PR Demo Workspace
              </span>
            </div>
            <p className="text-[12px] leading-relaxed text-[var(--color-text-secondary)]">
              Inspect PR #142 containing an Auth Bypass vulnerability & SQL injection pattern in payment-service.
            </p>
            <div className="mt-2.5 flex items-center gap-1.5 text-[12px] font-bold text-indigo-400">
              <span>Open PR #142 Workspace</span>
              <ArrowRight size={13} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
