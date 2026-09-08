import { useNavigate } from 'react-router-dom';
import { FolderGit2, GitPullRequest, ArrowRight, Settings, ShieldAlert, CheckCircle2 } from 'lucide-react';
import { DEMO_REPOSITORIES } from '@/data/demo';
import { PageHeader } from '@/components/ui/PageHeader';
import { SeverityBadge } from '@/components/ui/Badge';

export function RepositoryList() {
  const navigate = useNavigate();

  return (
    <div className="page-container space-y-5">
      <PageHeader
        title="Repositories"
        subtitle="Connected codebases and repository health index monitored by ORBITA security pipeline"
        actions={
          <button
            className="flex items-center gap-2 px-3.5 py-[7px] rounded-lg text-[12px] font-bold transition-all hover:opacity-90"
            style={{
              background: 'linear-gradient(135deg, #6366f1, #7c3aed)',
              color: 'white',
            }}
            onClick={() => navigate('/settings')}
          >
            <Settings size={13} />
            Configure Repository Rules
          </button>
        }
      />

      {/* 3-Column Responsive Repository Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {DEMO_REPOSITORIES.map(repo => {
          const healthScore = Math.max(20, 100 - (repo.riskDistribution.critical * 25 + repo.riskDistribution.high * 15 + repo.riskDistribution.medium * 5));

          return (
            <div
              key={repo.id}
              className="surface-card card-hover p-4 flex flex-col justify-between space-y-4 cursor-pointer"
              onClick={() => navigate('/pull-requests')}
            >
              {/* Card Header */}
              <div className="space-y-3.5">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-2.5">
                    <div className="p-2 rounded-lg bg-[var(--color-bg-elevated)] border border-[var(--color-border)] text-indigo-400">
                      <FolderGit2 size={16} />
                    </div>
                    <div>
                      <h3 className="font-bold text-[14px] text-slate-100">{repo.name}</h3>
                      <div className="flex items-center gap-1.5 text-[11px] font-mono text-[var(--color-text-muted)] mt-0.5">
                        <span className="font-semibold text-[var(--color-text-secondary)]">{repo.language}</span>
                        <span>·</span>
                        <span className="truncate max-w-[130px]">{repo.fullName}</span>
                      </div>
                    </div>
                  </div>
                  <span className="font-mono text-[11px] font-bold px-2 py-0.5 rounded-md bg-[var(--color-bg-elevated)] border border-[var(--color-border)] text-indigo-300 shrink-0">
                    {healthScore}/100
                  </span>
                </div>

                {/* Health Index Meter */}
                <div className="space-y-1.5">
                  <div className="flex justify-between text-[12px]">
                    <span className="text-[var(--color-text-secondary)]">Security Health Index</span>
                    <span className="font-mono font-bold text-emerald-400">{healthScore}%</span>
                  </div>
                  <div className="w-full h-1 rounded-full bg-[var(--color-bg-elevated)] overflow-hidden">
                    <div
                      className="h-full bg-emerald-400 rounded-full transition-all duration-500"
                      style={{ width: `${healthScore}%` }}
                    />
                  </div>
                </div>
              </div>

              {/* Repository Stats Footer */}
              <div className="flex items-center justify-between pt-3 border-t border-[var(--color-border-subtle)] text-[12px]">
                <div className="flex items-center gap-2.5">
                  <span className="flex items-center gap-1.5 text-indigo-400 font-bold font-mono">
                    <GitPullRequest size={13} />
                    {repo.openPRs} Open PRs
                  </span>
                  {repo.riskDistribution.critical > 0 && (
                    <SeverityBadge severity="critical" size="sm" />
                  )}
                </div>
                <div className="flex items-center gap-1 text-[var(--color-text-muted)] font-semibold transition-colors">
                  <span>View PRs</span>
                  <ArrowRight size={13} />
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
