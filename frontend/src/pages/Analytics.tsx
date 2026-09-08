import { motion } from 'framer-motion';
import { DEMO_ANALYTICS } from '@/data/demo';
import { SeverityBadge } from '@/components/ui/Badge';

const CATEGORY_COLORS: Record<string, string> = {
  security: 'var(--color-critical)',
  correctness: 'var(--color-high)',
  performance: 'var(--color-medium)',
  maintainability: 'var(--color-pass)',
  style: 'var(--color-low)',
  architecture: 'var(--color-accent)',
};

function MiniSparkline({ data }: { data: { avgScore: number }[] }) {
  const max = Math.max(...data.map(d => d.avgScore));
  const width = 120;
  const height = 36;
  const points = data.map((d, i) => ({
    x: (i / (data.length - 1)) * width,
    y: height - (d.avgScore / max) * height,
  }));
  const path = points.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(' ');

  return (
    <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`}>
      <path d={path} fill="none" stroke="var(--color-accent)" strokeWidth="1.5" strokeLinecap="round" />
      {points.map((p, i) => (
        <circle key={i} cx={p.x} cy={p.y} r="2" fill="var(--color-accent)" />
      ))}
    </svg>
  );
}

export function Analytics() {
  const { issueDistribution, highRiskFiles, reviewEfficiency, commonPatterns, riskTrend } = DEMO_ANALYTICS;
  const totalIssues = issueDistribution.reduce((s, d) => s + d.count, 0);

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-lg font-semibold" style={{ color: 'var(--color-text-primary)' }}>
            Analytics
          </h1>
          <p className="text-xs mt-0.5" style={{ color: 'var(--color-text-muted)' }}>
            Engineering intelligence — last 14 days · Demo data
          </p>
        </div>
        <span
          className="text-[10px] font-semibold px-2 py-1 rounded-sm font-mono"
          style={{
            background: 'rgba(99,102,241,0.1)',
            border: '1px solid rgba(99,102,241,0.3)',
            color: 'var(--color-accent)',
          }}
        >
          DEMO DATA
        </span>
      </div>

      {/* Summary stats */}
      <div className="grid grid-cols-4 gap-3 mb-6">
        {[
          { label: 'PRs Analyzed', value: reviewEfficiency.prAnalyzed, sub: 'total', color: 'var(--color-accent)' },
          { label: 'Findings Detected', value: reviewEfficiency.findingsDetected, sub: 'total', color: 'var(--color-high)' },
          { label: 'Findings Fixed', value: reviewEfficiency.findingsFixed, sub: `${Math.round((reviewEfficiency.findingsFixed / reviewEfficiency.findingsDetected) * 100)}% fix rate`, color: 'var(--color-pass)' },
          { label: 'Avg. Analysis', value: reviewEfficiency.avgAnalysisTime, sub: 'seconds', color: 'var(--color-medium)' },
        ].map((stat, i) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.06 }}
            className="rounded-lg p-4"
            style={{ background: 'var(--color-bg-surface)', border: '1px solid var(--color-border)' }}
          >
            <div className="text-xs mb-1" style={{ color: 'var(--color-text-muted)' }}>{stat.label}</div>
            <div className="text-2xl font-bold font-mono" style={{ color: stat.color }}>
              {stat.value}
            </div>
            <div className="text-[10px] mt-0.5" style={{ color: 'var(--color-text-muted)' }}>{stat.sub}</div>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-3 gap-4">
        {/* Risk trend */}
        <div
          className="col-span-2 rounded-lg p-4"
          style={{ background: 'var(--color-bg-surface)', border: '1px solid var(--color-border)' }}
        >
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xs font-semibold tracking-wider uppercase" style={{ color: 'var(--color-text-muted)' }}>
              PR Risk Over Time
            </h2>
            <MiniSparkline data={riskTrend} />
          </div>
          <div className="space-y-2">
            {riskTrend.slice(-5).map((point, i) => (
              <div key={i} className="flex items-center gap-3">
                <span className="text-[10px] font-mono w-20 shrink-0" style={{ color: 'var(--color-text-muted)' }}>
                  {point.date}
                </span>
                <div className="flex-1 flex items-center gap-1 h-3">
                  {[
                    { val: point.critical, color: 'var(--color-critical)' },
                    { val: point.high, color: 'var(--color-high)' },
                    { val: point.medium, color: 'var(--color-medium)' },
                    { val: point.low, color: 'var(--color-low)' },
                  ].filter(b => b.val > 0).map((band, j) => (
                    <motion.div
                      key={j}
                      className="h-2 rounded-sm"
                      initial={{ width: 0 }}
                      animate={{ width: `${band.val * 20}px` }}
                      transition={{ duration: 0.6, delay: i * 0.1 }}
                      style={{ background: band.color, minWidth: 4 }}
                    />
                  ))}
                </div>
                <span
                  className="text-[10px] font-mono font-semibold w-8 text-right"
                  style={{ color: point.avgScore >= 60 ? 'var(--color-high)' : 'var(--color-pass)' }}
                >
                  {point.avgScore}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Issue distribution */}
        <div
          className="rounded-lg p-4"
          style={{ background: 'var(--color-bg-surface)', border: '1px solid var(--color-border)' }}
        >
          <h2 className="text-xs font-semibold tracking-wider uppercase mb-4" style={{ color: 'var(--color-text-muted)' }}>
            Issue Distribution
          </h2>
          <div className="space-y-3">
            {issueDistribution.map((item, i) => (
              <div key={item.category}>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs capitalize" style={{ color: 'var(--color-text-secondary)' }}>
                    {item.category}
                  </span>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-mono" style={{ color: 'var(--color-text-muted)' }}>
                      {item.count}
                    </span>
                    <span className="text-[10px] font-mono" style={{ color: CATEGORY_COLORS[item.category] }}>
                      {item.percentage}%
                    </span>
                  </div>
                </div>
                <div className="h-1.5 rounded-full" style={{ background: 'var(--color-bg-overlay)' }}>
                  <motion.div
                    className="h-full rounded-full"
                    initial={{ width: 0 }}
                    animate={{ width: `${item.percentage}%` }}
                    transition={{ duration: 0.7, delay: i * 0.08 }}
                    style={{ background: CATEGORY_COLORS[item.category] }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* High-risk files */}
        <div
          className="col-span-2 rounded-lg overflow-hidden"
          style={{ background: 'var(--color-bg-surface)', border: '1px solid var(--color-border)' }}
        >
          <div className="px-4 py-3" style={{ borderBottom: '1px solid var(--color-border)' }}>
            <h2 className="text-xs font-semibold tracking-wider uppercase" style={{ color: 'var(--color-text-muted)' }}>
              High-Risk Files
            </h2>
          </div>
          <div>
            {DEMO_ANALYTICS.highRiskFiles.map((file, i) => (
              <motion.div
                key={file.filename}
                initial={{ opacity: 0, x: -8 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.06 }}
                className="flex items-center gap-4 px-4 py-2.5"
                style={{ borderBottom: i < DEMO_ANALYTICS.highRiskFiles.length - 1 ? '1px solid var(--color-border-subtle)' : 'none' }}
              >
                <div className="flex-1 min-w-0">
                  <code className="text-xs font-mono truncate block" style={{ color: 'var(--color-text-primary)' }}>
                    {file.filename}
                  </code>
                  <span className="text-[10px]" style={{ color: 'var(--color-text-muted)' }}>
                    {file.repository}
                  </span>
                </div>
                <div className="flex items-center gap-3 text-xs shrink-0">
                  {file.criticalCount > 0 && (
                    <SeverityBadge severity="critical" size="sm" />
                  )}
                  <span style={{ color: 'var(--color-text-secondary)' }}>
                    {file.findingsCount} findings
                  </span>
                  <div className="w-16 h-1 rounded-full" style={{ background: 'var(--color-bg-overlay)' }}>
                    <motion.div
                      className="h-full rounded-full"
                      initial={{ width: 0 }}
                      animate={{ width: `${Math.min((file.findingsCount / 12) * 100, 100)}%` }}
                      transition={{ duration: 0.6, delay: i * 0.08 }}
                      style={{ background: file.criticalCount > 0 ? 'var(--color-critical)' : 'var(--color-high)' }}
                    />
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Common patterns */}
        <div
          className="rounded-lg p-4"
          style={{ background: 'var(--color-bg-surface)', border: '1px solid var(--color-border)' }}
        >
          <h2 className="text-xs font-semibold tracking-wider uppercase mb-3" style={{ color: 'var(--color-text-muted)' }}>
            Recurring Patterns
          </h2>
          <div className="space-y-3">
            {commonPatterns.map((pattern, i) => (
              <div key={i} className="flex items-start gap-2.5">
                <SeverityBadge severity={pattern.severity} size="sm" />
                <div className="flex-1 min-w-0">
                  <div className="text-xs leading-tight" style={{ color: 'var(--color-text-secondary)' }}>
                    {pattern.pattern}
                  </div>
                  <div className="text-[10px] mt-0.5" style={{ color: 'var(--color-text-muted)' }}>
                    {pattern.count}× detected
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
