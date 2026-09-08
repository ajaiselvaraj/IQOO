import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, AlertTriangle, ArrowRight, Filter } from 'lucide-react';
import { DEMO_FINDINGS } from '@/data/demo';
import { PageHeader } from '@/components/ui/PageHeader';
import { SeverityBadge } from '@/components/ui/Badge';
import { EmptyState } from '@/components/ui/EmptyState';

export function Issues() {
  const navigate = useNavigate();
  const [search, setSearch] = useState('');
  const [severityFilter, setSeverityFilter] = useState<string>('all');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');

  const filtered = DEMO_FINDINGS.filter(f => {
    const matchesSearch = f.title.toLowerCase().includes(search.toLowerCase()) ||
                          f.file.toLowerCase().includes(search.toLowerCase()) ||
                          f.explanation.toLowerCase().includes(search.toLowerCase());
    const matchesSev = severityFilter === 'all' || f.severity === severityFilter;
    const matchesCat = categoryFilter === 'all' || f.category === categoryFilter;
    return matchesSearch && matchesSev && matchesCat;
  });

  return (
    <div className="page-container space-y-5">
      <PageHeader
        title="Issues & Vulnerability Inventory"
        subtitle="Security and engineering findings detected across all connected repositories"
        badge={
          <span className="font-mono text-[11px] px-2 py-0.5 rounded-md bg-[var(--color-bg-elevated)] border border-[var(--color-border)] text-rose-400 font-bold">
            {DEMO_FINDINGS.length} open
          </span>
        }
      />

      {/* Filter Toolbar */}
      <div
        className="px-4 py-3 rounded-xl border flex flex-wrap items-center justify-between gap-3"
        style={{ background: 'var(--color-bg-surface)', borderColor: 'var(--color-border)' }}
      >
        <div className="relative flex-1 min-w-[260px] flex items-center">
          <Search size={14} className="absolute left-3 text-[var(--color-text-muted)] pointer-events-none" />
          <input
            type="text"
            placeholder="Search findings by title, file path, or explanation…"
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-[6px] rounded-lg text-[12px] font-medium focus:outline-none"
            style={{
              background: 'var(--color-bg-elevated)',
              border: '1px solid var(--color-border)',
              color: 'var(--color-text-primary)',
            }}
          />
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <div className="flex items-center gap-1.5 text-[11px] text-[var(--color-text-muted)] font-mono mr-0.5">
            <Filter size={12} />
            <span>Filters:</span>
          </div>

          <select
            value={severityFilter}
            onChange={e => setSeverityFilter(e.target.value)}
            className="px-2.5 py-[5px] rounded-lg text-[12px] font-medium focus:outline-none cursor-pointer"
            style={{
              background: 'var(--color-bg-elevated)',
              border: '1px solid var(--color-border)',
              color: 'var(--color-text-secondary)',
            }}
          >
            <option value="all">All Severities</option>
            <option value="critical">Critical</option>
            <option value="high">High</option>
            <option value="medium">Medium</option>
            <option value="low">Low</option>
          </select>

          <select
            value={categoryFilter}
            onChange={e => setCategoryFilter(e.target.value)}
            className="px-2.5 py-[5px] rounded-lg text-[12px] font-medium focus:outline-none cursor-pointer"
            style={{
              background: 'var(--color-bg-elevated)',
              border: '1px solid var(--color-border)',
              color: 'var(--color-text-secondary)',
            }}
          >
            <option value="all">All Categories</option>
            <option value="security">Security</option>
            <option value="correctness">Correctness</option>
            <option value="performance">Performance</option>
            <option value="maintainability">Maintainability</option>
          </select>
        </div>
      </div>

      {/* Full-Width Issue Data Table */}
      <div className="surface-card overflow-hidden">
        {filtered.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left table-fixed">
              <thead>
                <tr className="table-head-row">
                  <th style={{ width: '8%' }}>Severity</th>
                  <th style={{ width: '44%' }}>Finding & File Location</th>
                  <th style={{ width: '14%' }}>Category</th>
                  <th style={{ width: '12%', textAlign: 'center' }}>Confidence</th>
                  <th style={{ width: '12%', textAlign: 'center' }}>Source</th>
                  <th style={{ width: '6%' }}></th>
                </tr>
              </thead>
              <tbody>
                {filtered.map(finding => (
                  <tr
                    key={finding.id}
                    className="table-body-row cursor-pointer group"
                    onClick={() => navigate('/pull-requests/pr-142')}
                  >
                    <td>
                      <SeverityBadge severity={finding.severity} size="sm" />
                    </td>
                    <td className="min-w-0">
                      <div className="flex flex-col gap-0.5 min-w-0">
                        <span className="font-semibold text-[13px] text-slate-100 group-hover:text-indigo-300 transition-colors truncate">
                          {finding.title}
                        </span>
                        <span className="font-mono text-[11px] text-indigo-300/70 truncate">
                          {finding.file}:{finding.line}
                        </span>
                      </div>
                    </td>
                    <td className="capitalize font-medium text-[var(--color-text-secondary)] text-[13px] truncate">
                      {finding.category}
                    </td>
                    <td className="text-center font-mono text-[12px] font-bold text-emerald-400">
                      {finding.confidence}%
                    </td>
                    <td className="text-center font-mono text-[11px] uppercase text-[var(--color-text-muted)]">
                      {finding.source}
                    </td>
                    <td className="text-right">
                      <ArrowRight size={14} className="opacity-0 group-hover:opacity-100 transition-opacity text-indigo-400 inline" />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <EmptyState
            icon={AlertTriangle}
            title="No security issues found"
            description="Adjust your search query or filters to inspect other issue categories."
          />
        )}
      </div>
    </div>
  );
}
