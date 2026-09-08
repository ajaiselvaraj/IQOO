import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { GitPullRequest, Filter, ArrowUpDown } from 'lucide-react';
import { DEMO_PRS } from '@/data/demo';
import { SeverityBadge, RiskBadge, StatusDot } from '@/components/ui/Badge';
import { formatRelativeTime } from '@/lib/utils';

export function PRList() {
  const navigate = useNavigate();

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-lg font-semibold" style={{ color: 'var(--color-text-primary)' }}>
            Pull Requests
          </h1>
          <p className="text-xs mt-0.5" style={{ color: 'var(--color-text-muted)' }}>
            {DEMO_PRS.length} pull requests across all repositories
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs transition-colors hover:bg-white/5"
            style={{ color: 'var(--color-text-secondary)', border: '1px solid var(--color-border)' }}
          >
            <Filter size={12} /> Filter
          </button>
          <button
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs transition-colors hover:bg-white/5"
            style={{ color: 'var(--color-text-secondary)', border: '1px solid var(--color-border)' }}
          >
            <ArrowUpDown size={12} /> Sort by Risk
          </button>
        </div>
      </div>

      <div
        className="rounded-lg overflow-hidden"
        style={{ border: '1px solid var(--color-border)' }}
      >
        {/* Table header */}
        <div
          className="grid grid-cols-12 gap-4 px-4 py-2.5 text-[10px] font-semibold tracking-wider uppercase"
          style={{
            color: 'var(--color-text-muted)',
            borderBottom: '1px solid var(--color-border)',
            background: 'var(--color-bg-elevated)',
          }}
        >
          <div className="col-span-5">Pull Request</div>
          <div className="col-span-2">Repository</div>
          <div className="col-span-2">Changes</div>
          <div className="col-span-1">Issues</div>
          <div className="col-span-2 text-right">Risk</div>
        </div>

        {/* Rows */}
        {DEMO_PRS.map((pr, i) => (
          <motion.div
            key={pr.id}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: i * 0.07 }}
            className="group grid grid-cols-12 gap-4 px-4 py-3.5 cursor-pointer transition-colors hover:bg-white/3 items-center"
            style={{ borderBottom: '1px solid var(--color-border-subtle)' }}
            onClick={() => navigate(`/pull-requests/${pr.id}`)}
          >
            {/* PR info */}
            <div className="col-span-5 flex items-center gap-3 min-w-0">
              <div className="flex items-center gap-1.5 shrink-0">
                <StatusDot status={pr.status === 'complete' ? 'complete' : 'analyzing'} />
                <span className="font-mono text-xs" style={{ color: 'var(--color-accent)' }}>
                  #{pr.number}
                </span>
              </div>
              <div className="min-w-0">
                <div className="text-sm font-medium truncate" style={{ color: 'var(--color-text-primary)' }}>
                  {pr.title}
                </div>
                <div className="flex items-center gap-2 text-[10px] mt-0.5" style={{ color: 'var(--color-text-muted)' }}>
                  <img src={pr.author.avatarUrl} alt="" className="w-3 h-3 rounded-full" />
                  {pr.author.login}
                  <span>·</span>
                  {formatRelativeTime(pr.updatedAt)}
                </div>
              </div>
            </div>

            {/* Repository */}
            <div className="col-span-2">
              <span className="text-xs font-mono truncate block" style={{ color: 'var(--color-text-secondary)' }}>
                {pr.repository.split('/')[1]}
              </span>
              <span className="text-[10px]" style={{ color: 'var(--color-text-muted)' }}>
                {pr.branch}
              </span>
            </div>

            {/* Changes */}
            <div className="col-span-2">
              <div className="text-xs" style={{ color: 'var(--color-text-secondary)' }}>
                {pr.filesChanged} files
              </div>
              <div className="flex gap-1.5 text-[10px] mt-0.5">
                <span style={{ color: 'var(--color-pass)' }}>+{pr.additions}</span>
                <span style={{ color: 'var(--color-critical)' }}>-{pr.deletions}</span>
              </div>
            </div>

            {/* Issues */}
            <div className="col-span-1">
              {pr.findingsCount && pr.findingsCount.critical > 0 ? (
                <SeverityBadge severity="critical" size="sm" />
              ) : pr.findingsCount?.high ? (
                <SeverityBadge severity="high" size="sm" />
              ) : (
                <span className="text-xs" style={{ color: 'var(--color-text-muted)' }}>
                  {pr.findingsCount?.total ?? 0}
                </span>
              )}
            </div>

            {/* Risk */}
            <div className="col-span-2 flex justify-end">
              {pr.riskScore ? (
                <RiskBadge level={pr.riskScore.level} score={pr.riskScore.overall} />
              ) : (
                <span className="text-xs" style={{ color: 'var(--color-text-muted)' }}>Pending</span>
              )}
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
