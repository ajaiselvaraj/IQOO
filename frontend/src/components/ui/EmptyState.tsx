import React from 'react';
import { ShieldAlert } from 'lucide-react';

interface EmptyStateProps {
  icon?: React.ComponentType<{ size?: number; className?: string; style?: React.CSSProperties }>;
  title: string;
  description: string;
  action?: React.ReactNode;
  className?: string;
}

export function EmptyState({
  icon: Icon = ShieldAlert,
  title,
  description,
  action,
  className = '',
}: EmptyStateProps) {
  return (
    <div
      className={`flex flex-col items-center justify-center p-8 text-center rounded-lg border border-dashed ${className}`}
      style={{
        background: 'rgba(15, 15, 23, 0.4)',
        borderColor: 'var(--color-border-strong)',
      }}
    >
      <div
        className="w-11 h-11 rounded-lg flex items-center justify-center mb-3 shrink-0"
        style={{
          background: 'var(--color-bg-elevated)',
          border: '1px solid var(--color-border)',
          color: 'var(--color-accent)',
        }}
      >
        <Icon size={20} />
      </div>
      <h3 className="text-sm font-semibold mb-1" style={{ color: 'var(--color-text-primary)' }}>
        {title}
      </h3>
      <p className="text-xs max-w-sm leading-relaxed mb-4" style={{ color: 'var(--color-text-muted)' }}>
        {description}
      </p>
      {action && <div>{action}</div>}
    </div>
  );
}
