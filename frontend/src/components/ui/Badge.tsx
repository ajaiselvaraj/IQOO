import { cn } from '@/lib/utils';
import type { Severity } from '@/types';

interface BadgeProps {
  severity: Severity;
  size?: 'sm' | 'md';
  className?: string;
}

const labels: Record<Severity, string> = {
  critical: 'CRITICAL',
  high: 'HIGH',
  medium: 'MEDIUM',
  low: 'LOW',
  info: 'INFO',
};

export function SeverityBadge({ severity, size = 'md', className }: BadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center font-mono font-semibold rounded-sm tracking-wider',
        `severity-${severity}`,
        size === 'sm' ? 'text-[9px] px-1.5 py-0.5' : 'text-[10px] px-2 py-1',
        className
      )}
    >
      {labels[severity]}
    </span>
  );
}

interface RiskBadgeProps {
  level: 'critical' | 'high' | 'medium' | 'low' | 'passed';
  score?: number;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

const riskLabels: Record<string, string> = {
  critical: 'CRITICAL',
  high: 'HIGH RISK',
  medium: 'MEDIUM RISK',
  low: 'LOW RISK',
  passed: 'PASSED',
};

export function RiskBadge({ level, score, size = 'md', className }: RiskBadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 font-mono font-semibold rounded-sm tracking-wider',
        `severity-${level === 'passed' ? 'info' : level}`,
        size === 'sm' ? 'text-[9px] px-1.5 py-0.5' : size === 'lg' ? 'text-xs px-3 py-1.5' : 'text-[10px] px-2 py-1',
        level === 'passed' && 'bg-[var(--color-pass-muted)] text-[var(--color-pass)] border-[var(--color-pass-border)]',
        className
      )}
    >
      {score !== undefined && <span className="opacity-70">{score}</span>}
      {riskLabels[level]}
    </span>
  );
}

interface StatusDotProps {
  status: 'complete' | 'analyzing' | 'queued' | 'failed' | 'running' | 'pending';
  className?: string;
}

const statusColors: Record<string, string> = {
  complete: 'bg-[var(--color-pass)]',
  analyzing: 'bg-[var(--color-accent)] status-dot-analyzing',
  running: 'bg-[var(--color-accent)] status-dot-analyzing',
  queued: 'bg-[var(--color-text-muted)]',
  failed: 'bg-[var(--color-critical)]',
  pending: 'bg-[var(--color-text-muted)]',
};

export function StatusDot({ status, className }: StatusDotProps) {
  return (
    <span
      className={cn(
        'inline-block w-1.5 h-1.5 rounded-full',
        statusColors[status] ?? 'bg-[var(--color-text-muted)]',
        className
      )}
    />
  );
}
