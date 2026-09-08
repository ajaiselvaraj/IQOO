import { motion } from 'framer-motion';
import { Shield, Bug, Zap, Wrench, Cpu, AlertTriangle } from 'lucide-react';
import { RiskBadge } from '@/components/ui/Badge';
import type { RiskScore, CategoryScore } from '@/types';

interface RiskScoreWidgetProps {
  score: RiskScore;
  animate?: boolean;
}

const DIMENSION_CONFIG: Record<string, { label: string; icon: React.ComponentType<{ size?: number; className?: string; style?: React.CSSProperties }> }> = {
  security: { label: 'Security Risk', icon: Shield },
  correctness: { label: 'Bugs & Errors', icon: Bug },
  performance: { label: 'Performance', icon: Zap },
  maintainability: { label: 'Maintainability', icon: Wrench },
  complexity: { label: 'Code Complexity', icon: Cpu },
};

function getLevelColor(level: string): string {
  switch (level) {
    case 'critical': return 'var(--color-critical)';
    case 'high': return 'var(--color-high)';
    case 'medium': return 'var(--color-medium)';
    case 'low': return 'var(--color-low)';
    case 'passed': return 'var(--color-pass)';
    default: return 'var(--color-accent)';
  }
}

export function RiskScoreWidget({ score }: RiskScoreWidgetProps) {
  const { overall, level, breakdown } = score;
  const levelColor = getLevelColor(level);

  // SVG Gauge calculations
  const radius = 42;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (overall / 100) * circumference;

  return (
    <div
      className="rounded-xl p-4 space-y-3.5"
      style={{
        background: 'var(--color-bg-surface)',
        border: '1px solid var(--color-border)',
      }}
    >
      {/* Widget Header */}
      <div className="flex items-center justify-between pb-3" style={{ borderBottom: '1px solid var(--color-border-subtle)' }}>
        <div className="flex items-center gap-2">
          <Shield size={15} style={{ color: levelColor }} />
          <h3 className="section-title" style={{ color: 'var(--color-text-primary)' }}>
            PR Risk Analysis
          </h3>
        </div>
        <RiskBadge level={level} score={overall} size="md" />
      </div>

      {/* Radial Gauge & Overall Score */}
      <div className="flex items-center gap-4 py-1">
        <div className="relative w-24 h-24 shrink-0 flex items-center justify-center">
          <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
            <circle
              cx="50"
              cy="50"
              r={radius}
              className="risk-ring-track"
              strokeWidth="7"
              fill="transparent"
            />
            <circle
              cx="50"
              cy="50"
              r={radius}
              className="risk-ring-fill"
              stroke={levelColor}
              strokeWidth="7"
              fill="transparent"
              strokeDasharray={circumference}
              strokeDashoffset={offset}
            />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
            <span className="text-2xl font-bold font-mono leading-none" style={{ color: levelColor }}>
              {overall}
            </span>
            <span className="text-[9px] font-mono uppercase mt-0.5" style={{ color: 'var(--color-text-muted)' }}>
              out of 100
            </span>
          </div>
        </div>

        <div className="flex-1 min-w-0">
          <div className="text-xs font-bold uppercase tracking-wider mb-1" style={{ color: levelColor }}>
            {level === 'critical' ? 'Critical Action Required' : level === 'high' ? 'High Security Risk' : level === 'medium' ? 'Medium Risk Identified' : 'Clean & Passed'}
          </div>
          <p className="text-xs leading-relaxed" style={{ color: 'var(--color-text-secondary)' }}>
            {level === 'critical'
              ? 'Critical vulnerability detected. Do not merge until reviewed.'
              : level === 'high'
              ? 'High-risk security patterns found in diff.'
              : 'Passes core engineering safety benchmarks.'}
          </p>
        </div>
      </div>

      {/* 5-Dimension Score Meters */}
      <div className="space-y-3 pt-2" style={{ borderTop: '1px solid var(--color-border-subtle)' }}>
        <h4 className="text-[10px] font-bold tracking-wider font-mono uppercase text-slate-400">
          Risk Dimensions Breakdown
        </h4>

        {breakdown && Object.entries(breakdown).map(([key, dim]: [string, CategoryScore]) => {
          const cfg = DIMENSION_CONFIG[key] ?? { label: key, icon: AlertTriangle };
          const DimIcon = cfg.icon;
          const pct = Math.round((dim.score / dim.maxScore) * 100);

          return (
            <div key={key} className="space-y-1">
              <div className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-1.5">
                  <DimIcon size={12} style={{ color: 'var(--color-text-secondary)' }} />
                  <span className="font-medium" style={{ color: 'var(--color-text-primary)' }}>
                    {cfg.label}
                  </span>
                </div>
                <span className="font-mono text-xs font-bold" style={{ color: pct > 60 ? 'var(--color-critical)' : 'var(--color-text-secondary)' }}>
                  {dim.score}/{dim.maxScore}
                </span>
              </div>
              <div
                className="w-full h-1.5 rounded-full overflow-hidden"
                style={{ background: 'var(--color-bg-elevated)' }}
              >
                <div
                  className="h-full rounded-full transition-all duration-500"
                  style={{
                    width: `${pct}%`,
                    background: pct > 60 ? 'var(--color-critical)' : pct > 35 ? 'var(--color-high)' : 'var(--color-accent)',
                  }}
                />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
