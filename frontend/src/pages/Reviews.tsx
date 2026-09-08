import { useNavigate } from 'react-router-dom';
import { BookCheck, ArrowRight, GitPullRequest, Shield, Clock, CheckCircle2 } from 'lucide-react';
import { DEMO_REVIEW, DEMO_PR } from '@/data/demo';
import { PageHeader } from '@/components/ui/PageHeader';
import { RiskBadge, StatusDot, SeverityBadge } from '@/components/ui/Badge';
import { MetricCard } from '@/components/ui/MetricCard';
import { formatRelativeTime } from '@/lib/utils';

export function Reviews() {
  const navigate = useNavigate();

  const reviews = [
    {
      id: 'rev-1',
      pr: DEMO_PR,
      review: DEMO_REVIEW,
      timestamp: DEMO_PR.updatedAt,
      status: 'complete' as const,
      findingsSummary: [
        { severity: 'critical' as const, title: 'Authentication bypass via unvalidated retry token', file: 'services/payment_retry.py:142' },
        { severity: 'high' as const, title: 'User-controlled input reaches SQL query construction', file: 'services/payment.py:89' },
        { severity: 'medium' as const, title: 'N+1 query pattern in retry loop', file: 'services/payment_retry.py:67' },
      ],
    },
    {
      id: 'rev-2',
      pr: {
        ...DEMO_PR,
        id: 'pr-141',
        number: 141,
        title: 'Update OAuth2 token refresh flow',
        repository: 'orbita-demo/auth-gateway',
        riskScore: { overall: 45, level: 'medium' as const, breakdown: DEMO_PR.riskScore!.breakdown },
      },
      review: DEMO_REVIEW,
      timestamp: '2026-03-04T12:00:00Z',
      status: 'complete' as const,
      findingsSummary: [
        { severity: 'medium' as const, title: 'OAuth token rotation logic lacks atomic lock', file: 'auth/tokens.py:44' },
      ],
    },
  ];

  return (
    <div className="page-container space-y-5">
      <PageHeader
        title="Automated Code Reviews Queue"
        subtitle="History of AI PR code reviews, security feedback, and published GitHub reviews"
        badge={
          <span className="font-mono text-[11px] px-2 py-0.5 rounded-md bg-[var(--color-bg-elevated)] border border-[var(--color-border)] text-indigo-400 font-bold">
            {reviews.length} published
          </span>
        }
      />

      {/* Review Queue Summary Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <MetricCard
          label="Pending Queue"
          value={0}
          color="var(--color-accent)"
          icon={Clock}
          sub="Pull requests waiting for review"
        />
        <MetricCard
          label="Completed Reviews"
          value={reviews.length}
          color="var(--color-pass)"
          icon={BookCheck}
          sub="Published reviews to GitHub"
        />
        <MetricCard
          label="High Risk PR Reviews"
          value={1}
          color="var(--color-critical)"
          icon={Shield}
          sub="Requiring senior dev sign-off"
        />
      </div>

      {/* Review List */}
      <div className="space-y-3.5">
        {reviews.map(item => (
          <div
            key={item.id}
            className="surface-card card-hover p-4 space-y-3.5 cursor-pointer"
            onClick={() => navigate(`/pull-requests/${item.pr.id}`)}
          >
            {/* Review Header */}
            <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-[var(--color-border-subtle)]">
              <div className="flex items-center gap-2.5">
                <StatusDot status={item.status} />
                <span className="font-mono text-[13px] font-bold text-indigo-400">#{item.pr.number}</span>
                <h3 className="font-bold text-[14px] text-slate-100">{item.pr.title}</h3>
                {item.pr.riskScore && (
                  <RiskBadge level={item.pr.riskScore.level} score={item.pr.riskScore.overall} size="md" />
                )}
              </div>
              <div className="flex items-center gap-2.5 text-[12px] font-mono text-[var(--color-text-muted)]">
                <div className="flex items-center gap-1.5 text-indigo-400 font-semibold">
                  <GitPullRequest size={13} />
                  <span>{item.pr.repository}</span>
                </div>
                <span>·</span>
                <span>{formatRelativeTime(item.timestamp)}</span>
              </div>
            </div>

            {/* Structured Review Findings */}
            <div className="p-3.5 rounded-lg bg-[var(--color-bg-overlay)] border border-[var(--color-border-subtle)] space-y-2.5">
              <div className="flex items-center justify-between text-[12px] font-mono font-semibold">
                <span className="text-[var(--color-text-secondary)]">ORBITA Automated Security Summary</span>
                <span className="text-emerald-400 flex items-center gap-1">
                  <CheckCircle2 size={12} /> Published to GitHub
                </span>
              </div>

              <div className="space-y-1.5">
                {item.findingsSummary.map((f, i) => (
                  <div key={i} className="flex items-center justify-between text-[12px] p-2.5 rounded-lg bg-[var(--color-bg-elevated)] border border-[var(--color-border-subtle)] gap-3">
                    <div className="flex items-center gap-2 min-w-0 flex-1">
                      <SeverityBadge severity={f.severity} size="sm" />
                      <span className="font-semibold text-slate-200 truncate">{f.title}</span>
                    </div>
                    <code className="font-mono text-[var(--color-text-muted)] text-[11px] shrink-0">{f.file}</code>
                  </div>
                ))}
              </div>
            </div>

            {/* Card Action */}
            <div className="flex items-center justify-end text-[12px] text-indigo-400 font-semibold gap-1.5 pt-0.5">
              <span>Inspect PR Workspace & Inline Code Line Annotations</span>
              <ArrowRight size={13} />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
