import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { formatDistanceToNow, format } from 'date-fns';
import type { Severity, RiskScore } from '@/types';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatRelativeTime(date: string | Date): string {
  return formatDistanceToNow(new Date(date), { addSuffix: true });
}

export function formatDate(date: string | Date): string {
  return format(new Date(date), 'MMM d, yyyy');
}

export function formatDateTime(date: string | Date): string {
  return format(new Date(date), 'MMM d, yyyy · HH:mm');
}

export function formatDuration(ms: number): string {
  if (ms < 1000) return `${ms}ms`;
  if (ms < 60000) return `${(ms / 1000).toFixed(1)}s`;
  return `${Math.floor(ms / 60000)}m ${Math.floor((ms % 60000) / 1000)}s`;
}

export function getRiskLevel(score: number): RiskScore['level'] {
  if (score >= 80) return 'critical';
  if (score >= 60) return 'high';
  if (score >= 40) return 'medium';
  if (score >= 15) return 'low';
  return 'passed';
}

export function getRiskColor(level: RiskScore['level'] | Severity): string {
  const map: Record<string, string> = {
    critical: 'var(--color-critical)',
    high: 'var(--color-high)',
    medium: 'var(--color-medium)',
    low: 'var(--color-low)',
    passed: 'var(--color-pass)',
    info: 'var(--color-text-secondary)',
  };
  return map[level] ?? 'var(--color-text-secondary)';
}

export function getSeverityLabel(severity: Severity): string {
  return severity.charAt(0).toUpperCase() + severity.slice(1);
}

export function getCategoryIcon(category: string): string {
  const map: Record<string, string> = {
    security: '🔒',
    correctness: '🐛',
    performance: '⚡',
    maintainability: '🔧',
    style: '✨',
    architecture: '🏗️',
  };
  return map[category] ?? '•';
}

export function truncate(str: string, max: number): string {
  if (str.length <= max) return str;
  return str.slice(0, max - 3) + '...';
}

export function pluralize(count: number, singular: string, plural?: string): string {
  return count === 1 ? `${count} ${singular}` : `${count} ${plural ?? singular + 's'}`;
}

export function parseDiff(patch: string): Array<{
  type: 'add' | 'remove' | 'context' | 'header';
  content: string;
  newLineNum: number | null;
  oldLineNum: number | null;
}> {
  const lines = patch.split('\n');
  let newLine = 0;
  let oldLine = 0;
  
  return lines.map(line => {
    if (line.startsWith('@@')) {
      // Parse hunk header: @@ -old,count +new,count @@
      const match = line.match(/@@ -(\d+)(?:,\d+)? \+(\d+)(?:,\d+)? @@/);
      if (match) {
        oldLine = parseInt(match[1]) - 1;
        newLine = parseInt(match[2]) - 1;
      }
      return { type: 'header' as const, content: line, newLineNum: null, oldLineNum: null };
    } else if (line.startsWith('+')) {
      newLine++;
      return { type: 'add' as const, content: line.slice(1), newLineNum: newLine, oldLineNum: null };
    } else if (line.startsWith('-')) {
      oldLine++;
      return { type: 'remove' as const, content: line.slice(1), newLineNum: null, oldLineNum: oldLine };
    } else {
      newLine++;
      oldLine++;
      return { type: 'context' as const, content: line.slice(1), newLineNum: newLine, oldLineNum: oldLine };
    }
  });
}
