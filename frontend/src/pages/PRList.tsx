import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, GitPullRequest, ArrowRight, Filter } from 'lucide-react';
import { DEMO_PRS } from '@/data/demo';
import { PageHeader } from '@/components/ui/PageHeader';
import { SeverityBadge, RiskBadge } from '@/components/ui/Badge';
import { EmptyState } from '@/components/ui/EmptyState';
import { formatRelativeTime } from '@/lib/utils';

export function PRList() {
  const navigate = useNavigate();
  const [search, setSearch] = useState('');
  const [selectedRepo, setSelectedRepo] = useState('all');
  const [selectedRisk, setSelectedRisk] = useState('all');
  const [selectedStatus, setSelectedStatus] = useState('all');

  const filteredPRs = DEMO_PRS.filter(pr => {
    const matchesSearch = pr.title.toLowerCase().includes(search.toLowerCase()) ||
                          pr.number.toString().includes(search) ||
                          pr.repository.toLowerCase().includes(search.toLowerCase());
    const matchesRepo = selectedRepo === 'all' || pr.repository === selectedRepo;
    const matchesRisk = selectedRisk === 'all' || pr.riskScore?.level === selectedRisk;
    const matchesStatus = selectedStatus === 'all' || pr.status === selectedStatus;

    return matchesSearch && matchesRepo && matchesRisk && matchesStatus;
  });

  return (
    <div className="page-container space-y-5">
      <PageHeader
        title="Pull Requests"
        subtitle="Review and prioritize active engineering changes across connected repositories"
        badge={
          <span className="font-mono text-[11px] px-2 py-0.5 rounded-md bg-[var(--color-bg-elevated)] border border-[var(--color-border)] text-indigo-400 font-bold">
            {DEMO_PRS.length} active
          </span>
        }
      />

      {/* Filter Toolbar */}
      <div
        className="px-4 py-3 rounded-xl border flex flex-wrap items-center justify-between gap-3"
        style={{ background: 'var(--color-bg-surface)', borderColor: 'var(--color-border)' }}
      >
        {/* Search */}
        <div className="relative flex-1 min-w-[260px] flex items-center">
          <Search size={14} className="absolute left-3 text-[var(--color-text-muted)] pointer-events-none" />
          <input
            type="text"
            placeholder="Search by PR title, number, branch, or repository…"
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-[6px] rounded-lg text-[12px] font-medium focus:outline-none transition-colors"
            style={{
              background: 'var(--color-bg-elevated)',
              border: '1px solid var(--color-border)',
              color: 'var(--color-text-primary)',
            }}
          />
        </div>

        {/* Filters */}
        <div className="flex flex-wrap items-center gap-2.5">
          <div className="flex items-center gap-1.5 text-[11px] text-[var(--color-text-muted)] font-mono mr-0.5">
            <Filter size={12} />
            <span>Filters:</span>
          </div>

          <select
            value={selectedRepo}
            onChange={e => setSelectedRepo(e.target.value)}
            className="px-2.5 py-[5px] rounded-lg text-[12px] font-medium focus:outline-none cursor-pointer"
            style={{
              background: 'var(--color-bg-elevated)',
              border: '1px solid var(--color-border)',
              color: 'var(--color-text-secondary)',
            }}
          >
            <option value="all">All Repositories</option>
            <option value="orbita-demo/payment-service">payment-service</option>
            <option value="orbita-demo/auth-gateway">auth-gateway</option>
            <option value="orbita-demo/user-api">user-api</option>
            <option value="orbita-demo/analytics-engine">analytics-engine</option>
          </select>

          <select
            value={selectedRisk}
            onChange={e => setSelectedRisk(e.target.value)}
            className="px-2.5 py-[5px] rounded-lg text-[12px] font-medium focus:outline-none cursor-pointer"
            style={{
              background: 'var(--color-bg-elevated)',
              border: '1px solid var(--color-border)',
              color: 'var(--color-text-secondary)',
            }}
          >
            <option value="all">All Risk Ratings</option>
            <option value="critical">Critical Risk</option>
            <option value="high">High Risk</option>
            <option value="medium">Medium Risk</option>
            <option value="passed">Passed</option>
          </select>

          <select
            value={selectedStatus}
            onChange={e => setSelectedStatus(e.target.value)}
            className="px-2.5 py-[5px] rounded-lg text-[12px] font-medium focus:outline-none cursor-pointer"
            style={{
              background: 'var(--color-bg-elevated)',
              border: '1px solid var(--color-border)',
              color: 'var(--color-text-secondary)',
            }}
          >
            <option value="all">All Statuses</option>
            <option value="complete">Complete</option>
            <option value="analyzing">Analyzing</option>
            <option value="pending">Pending</option>
          </select>
        </div>
      </div>

      {/* PR Table Card */}
      <div className="surface-card overflow-hidden">
        {filteredPRs.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left table-fixed">
              <thead>
                <tr className="table-head-row">
                  <th style={{ width: '30%' }}>PR Number & Title</th>
                  <th style={{ width: '14%' }}>Repository</th>
                  <th style={{ width: '11%', textAlign: 'center' }}>Risk Rating</th>
                  <th style={{ width: '13%', textAlign: 'center' }}>Findings</th>
                  <th style={{ width: '11%', textAlign: 'center' }}>Changes</th>
                  <th style={{ width: '12%' }}>Author</th>
                  <th style={{ width: '9%', textAlign: 'right' }}>Updated</th>
                </tr>
              </thead>
              <tbody>
                {filteredPRs.map(pr => (
                  <tr
                    key={pr.id}
                    className="table-body-row cursor-pointer group"
                    onClick={() => navigate(`/pull-requests/${pr.id}`)}
                  >
                    {/* PR Number & Title */}
                    <td className="min-w-0">
                      <div className="flex items-center gap-2.5 min-w-0">
                        <span className="font-mono font-bold text-[12px] text-indigo-400 shrink-0">#{pr.number}</span>
                        <span className="font-semibold text-[13px] text-slate-100 group-hover:text-indigo-300 transition-colors truncate">
                          {pr.title}
                        </span>
                      </div>
                    </td>
                    {/* Repository */}
                    <td className="font-mono text-[12px] text-[var(--color-text-secondary)] font-medium truncate">
                      {pr.repository.split('/')[1]}
                    </td>
                    {/* Risk Rating */}
                    <td className="text-center whitespace-nowrap">
                      {pr.riskScore ? (
                        <RiskBadge level={pr.riskScore.level} score={pr.riskScore.overall} size="md" />
                      ) : (
                        <span className="text-[var(--color-text-muted)] font-mono text-[12px]">—</span>
                      )}
                    </td>
                    {/* Findings */}
                    <td className="text-center whitespace-nowrap">
                      {pr.findingsCount ? (
                        <div className="flex items-center justify-center gap-1.5">
                          {pr.findingsCount.critical > 0 && <SeverityBadge severity="critical" size="sm" />}
                          {pr.findingsCount.high > 0 && pr.findingsCount.critical === 0 && <SeverityBadge severity="high" size="sm" />}
                          <span className="font-mono text-[12px] font-bold text-slate-200">{pr.findingsCount.total} issues</span>
                        </div>
                      ) : (
                        <span className="text-[var(--color-text-muted)] font-mono text-[12px]">—</span>
                      )}
                    </td>
                    {/* Changes */}
                    <td className="text-center font-mono text-[12px] font-semibold whitespace-nowrap">
                      <span className="text-emerald-400">+{pr.additions}</span>
                      <span className="text-rose-400 ml-1.5">-{pr.deletions}</span>
                    </td>
                    {/* Author */}
                    <td className="whitespace-nowrap">
                      <div className="flex items-center gap-2 text-[12px] truncate">
                        <img src={pr.author.avatarUrl} alt="" className="w-4 h-4 rounded-full shrink-0" />
                        <span className="font-medium text-[var(--color-text-secondary)] truncate">{pr.author.login}</span>
                      </div>
                    </td>
                    {/* Updated */}
                    <td className="text-[12px] text-[var(--color-text-muted)] font-mono text-right whitespace-nowrap">
                      {formatRelativeTime(pr.updatedAt)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <EmptyState
            icon={GitPullRequest}
            title="No pull requests match your filters"
            description="Try clearing search filters or selecting a different repository."
          />
        )}
      </div>
    </div>
  );
}
