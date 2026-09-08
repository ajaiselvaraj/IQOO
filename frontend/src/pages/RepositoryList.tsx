import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { GitPullRequest, Star, Lock, ExternalLink, ArrowRight } from 'lucide-react';
import { DEMO_REPOSITORIES } from '@/data/demo';
import { formatRelativeTime } from '@/lib/utils';
import type { Repository } from '@/types';

function RepoCard({ repo, index }: { repo: Repository; index: number }) {
  const navigate = useNavigate();

  const riskTotal = repo.riskDistribution.critical + repo.riskDistribution.high +
    repo.riskDistribution.medium + repo.riskDistribution.low + repo.riskDistribution.passed;

  const LANG_COLORS: Record<string, string> = {
    Python: '#3572A5',
    TypeScript: '#3178C6',
    Go: '#00ADD8',
    Rust: '#dea584',
    JavaScript: '#f7df1e',
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.08 }}
      className="group rounded-lg p-4 cursor-pointer transition-all hover:bg-white/3"
      style={{
        background: 'var(--color-bg-surface)',
        border: '1px solid var(--color-border)',
      }}
      onClick={() => navigate(`/repositories/${repo.id}`)}
    >
      <div className="flex items-start justify-between gap-3 mb-3">
        <div className="min-w-0">
          <div className="flex items-center gap-2 mb-1">
            {repo.isPrivate && <Lock size={11} style={{ color: 'var(--color-text-muted)' }} />}
            <h3 className="text-sm font-semibold" style={{ color: 'var(--color-text-primary)' }}>
              {repo.name}
            </h3>
          </div>
          <p className="text-xs" style={{ color: 'var(--color-text-muted)' }}>
            {repo.fullName}
          </p>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <div
            className="text-[10px] px-1.5 py-0.5 rounded-sm font-semibold"
            style={{
              background: `${LANG_COLORS[repo.language] ?? '#888'}15`,
              color: LANG_COLORS[repo.language] ?? '#888',
            }}
          >
            {repo.language}
          </div>
          <a
            href={repo.url}
            target="_blank"
            rel="noopener noreferrer"
            className="p-1 rounded-sm hover:bg-white/10 transition-colors"
            style={{ color: 'var(--color-text-muted)' }}
            onClick={e => e.stopPropagation()}
          >
            <ExternalLink size={11} />
          </a>
        </div>
      </div>

      {/* Stats row */}
      <div className="flex items-center gap-4 text-xs mb-3" style={{ color: 'var(--color-text-secondary)' }}>
        <div className="flex items-center gap-1">
          <GitPullRequest size={11} />
          <span>{repo.openPRs} open PRs</span>
        </div>
        <div className="flex items-center gap-1">
          <Star size={11} />
          <span>{repo.stars}</span>
        </div>
        <span className="ml-auto text-[10px]" style={{ color: 'var(--color-text-muted)' }}>
          {formatRelativeTime(repo.lastAnalyzed)}
        </span>
      </div>

      {/* Risk distribution bar */}
      <div className="mb-2">
        <div className="flex h-1.5 rounded-full overflow-hidden gap-px">
          {[
            { key: 'critical', color: 'var(--color-critical)', val: repo.riskDistribution.critical },
            { key: 'high', color: 'var(--color-high)', val: repo.riskDistribution.high },
            { key: 'medium', color: 'var(--color-medium)', val: repo.riskDistribution.medium },
            { key: 'low', color: 'var(--color-low)', val: repo.riskDistribution.low },
            { key: 'passed', color: 'var(--color-pass)', val: repo.riskDistribution.passed },
          ].filter(b => b.val > 0).map(band => (
            <motion.div
              key={band.key}
              className="h-full"
              initial={{ width: 0 }}
              animate={{ width: `${(band.val / riskTotal) * 100}%` }}
              transition={{ duration: 0.8, delay: index * 0.08 + 0.2 }}
              style={{ background: band.color, minWidth: band.val > 0 ? 2 : 0 }}
            />
          ))}
        </div>
      </div>

      <div className="flex items-center gap-3 text-[10px]" style={{ color: 'var(--color-text-muted)' }}>
        {repo.riskDistribution.critical > 0 && (
          <span style={{ color: 'var(--color-critical)' }}>{repo.riskDistribution.critical} critical</span>
        )}
        {repo.riskDistribution.high > 0 && (
          <span style={{ color: 'var(--color-high)' }}>{repo.riskDistribution.high} high</span>
        )}
        <span className="ml-auto flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity"
          style={{ color: 'var(--color-accent)' }}>
          Open <ArrowRight size={10} />
        </span>
      </div>
    </motion.div>
  );
}

export function RepositoryList() {
  const navigate = useNavigate();

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-lg font-semibold" style={{ color: 'var(--color-text-primary)' }}>
            Repositories
          </h1>
          <p className="text-xs mt-0.5" style={{ color: 'var(--color-text-muted)' }}>
            {DEMO_REPOSITORIES.length} connected repositories
          </p>
        </div>
        <button
          className="flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium transition-all hover:opacity-90"
          style={{
            background: 'var(--color-bg-elevated)',
            border: '1px solid var(--color-accent-border)',
            color: 'var(--color-accent)',
          }}
        >
          + Connect Repository
        </button>
      </div>

      <div className="grid gap-3">
        {DEMO_REPOSITORIES.map((repo, i) => (
          <RepoCard key={repo.id} repo={repo} index={i} />
        ))}
      </div>
    </div>
  );
}
