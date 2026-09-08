import { BarChart3, TrendingUp, ShieldAlert, CheckCircle, Clock, FileCode2, Cpu } from 'lucide-react';
import { DEMO_ANALYTICS } from '@/data/demo';
import { PageHeader } from '@/components/ui/PageHeader';
import { MetricCard } from '@/components/ui/MetricCard';
import { SeverityBadge } from '@/components/ui/Badge';

export function Analytics() {
  const { reviewEfficiency, commonPatterns, riskTrend, highRiskFiles } = DEMO_ANALYTICS;

  return (
    <div className="page-container space-y-5">
      <PageHeader
        title="Analytics & Security Intelligence"
        subtitle="Engineering risk trends, vulnerability distributions, high-risk files, and AI pipeline velocity"
      />

      {/* Top KPI Metric Cards (4 Cards) */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard
          label="PRs Analyzed"
          value={reviewEfficiency.prAnalyzed}
          color="var(--color-accent)"
          icon={BarChart3}
          sub="Across connected repos"
        />
        <MetricCard
          label="Findings Detected"
          value={reviewEfficiency.findingsDetected}
          color="var(--color-high)"
          icon={ShieldAlert}
          sub="Vulnerabilities & bugs"
        />
        <MetricCard
          label="Findings Remediated"
          value={reviewEfficiency.findingsFixed}
          color="var(--color-pass)"
          icon={CheckCircle}
          sub="Fixed by engineers"
        />
        <MetricCard
          label="Avg Pipeline Speed"
          value={reviewEfficiency.avgAnalysisTime}
          color="var(--color-low)"
          icon={Clock}
          sub="Seconds per PR review"
        />
      </div>

      {/* Main Charts Row — Left 65% / Right 35% */}
      <div className="grid grid-cols-12 gap-4">
        {/* Left ~65%: PR Risk Over Time */}
        <div className="col-span-12 lg:col-span-8 surface-card p-4 space-y-3.5">
          <div className="flex items-center justify-between pb-2.5 border-b border-[var(--color-border-subtle)]">
            <div className="flex items-center gap-2">
              <TrendingUp size={15} className="text-indigo-400" />
              <h3 className="section-title">PR Security Risk Trend (Last 5 Weeks)</h3>
            </div>
            <span className="text-[11px] font-mono text-emerald-400 font-bold bg-emerald-950/40 border border-emerald-800/30 px-2 py-0.5 rounded-md">
              Risk Score Improved -18%
            </span>
          </div>

          <div className="space-y-3 pt-0.5">
            {riskTrend.map(item => (
              <div key={item.date} className="space-y-1.5">
                <div className="flex items-center justify-between text-[12px] font-mono">
                  <span className="text-slate-300 font-semibold">{item.date}</span>
                  <span className="text-rose-400 font-semibold">{item.critical} Critical · {item.high} High · {item.medium} Medium</span>
                </div>
                <div className="w-full h-2 rounded-full bg-[var(--color-bg-elevated)] overflow-hidden flex">
                  <div className="h-full bg-rose-500 transition-all" style={{ width: `${item.critical * 15}%` }} />
                  <div className="h-full bg-orange-500 transition-all" style={{ width: `${item.high * 12}%` }} />
                  <div className="h-full bg-amber-500 transition-all" style={{ width: `${item.medium * 8}%` }} />
                  <div className="h-full bg-blue-500 transition-all" style={{ width: `${item.low * 5}%` }} />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right ~35%: Vulnerability Category Distribution */}
        <div className="col-span-12 lg:col-span-4 surface-card p-4 space-y-3.5">
          <div className="flex items-center gap-2 pb-2.5 border-b border-[var(--color-border-subtle)]">
            <ShieldAlert size={15} className="text-indigo-400" />
            <h3 className="section-title">Vulnerability Category Ratio</h3>
          </div>

          <div className="space-y-2.5">
            {[
              { label: 'Security & Auth Bypass', pct: 45, count: 105, color: 'var(--color-critical)' },
              { label: 'Bugs & Logic Errors', pct: 28, count: 65, color: 'var(--color-high)' },
              { label: 'Performance & N+1 Queries', pct: 17, count: 40, color: 'var(--color-medium)' },
              { label: 'Maintainability & Debt', pct: 10, count: 24, color: 'var(--color-low)' },
            ].map(cat => (
              <div key={cat.label} className="space-y-1.5 p-2.5 rounded-lg bg-[var(--color-bg-elevated)] border border-[var(--color-border-subtle)]">
                <div className="flex items-center justify-between text-[12px]">
                  <span className="font-semibold text-slate-200">{cat.label}</span>
                  <span className="font-mono text-[12px] font-bold" style={{ color: cat.color }}>
                    {cat.count} ({cat.pct}%)
                  </span>
                </div>
                <div className="w-full h-1 rounded-full bg-[var(--color-bg-overlay)] overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all"
                    style={{ width: `${cat.pct}%`, background: cat.color }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Lower Row — 50% / 50% */}
      <div className="grid grid-cols-12 gap-4">
        {/* High-Risk Files */}
        <div className="col-span-12 lg:col-span-6 surface-card p-4 space-y-3.5">
          <div className="flex items-center gap-2 pb-2.5 border-b border-[var(--color-border-subtle)]">
            <FileCode2 size={15} className="text-indigo-400" />
            <h3 className="section-title">High-Risk Files & Hotspots</h3>
          </div>

          <div className="space-y-2">
            {highRiskFiles.map(file => (
              <div
                key={file.filename}
                className="flex items-center justify-between p-3 rounded-lg bg-[var(--color-bg-elevated)] border border-[var(--color-border-subtle)] text-[12px] font-mono"
              >
              <div>
                <div className="font-semibold text-slate-100">{file.filename}</div>
                <div className="text-[11px] text-[var(--color-text-muted)] mt-0.5">{file.repository}</div>
              </div>
              <div className="text-right">
                <span className="text-rose-400 font-bold">{file.criticalCount} Critical</span>
                <span className="text-[var(--color-text-muted)] block text-[10px]">{file.findingsCount} total issues</span>
              </div>
              </div>
            ))}
          </div>
        </div>

        {/* Recurring Vulnerability Patterns */}
        <div className="col-span-12 lg:col-span-6 surface-card p-4 space-y-3.5">
          <div className="flex items-center gap-2 pb-2.5 border-b border-[var(--color-border-subtle)]">
            <Cpu size={15} className="text-indigo-400" />
            <h3 className="section-title">Recurring Vulnerability Patterns</h3>
          </div>

          <div className="space-y-2">
            {commonPatterns.map(p => (
              <div key={p.pattern} className="flex items-center justify-between p-3 rounded-lg bg-[var(--color-bg-elevated)] border border-[var(--color-border-subtle)]">
                <div className="flex items-center gap-2.5">
                  <SeverityBadge severity={p.severity} size="sm" />
                  <span className="font-semibold text-[13px] text-slate-100">{p.pattern}</span>
                </div>
                <span className="font-mono text-[12px] font-bold text-indigo-400">{p.count}× occurrences</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
