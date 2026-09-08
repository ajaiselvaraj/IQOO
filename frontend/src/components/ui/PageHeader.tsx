import React from 'react';

interface PageHeaderProps {
  title: string;
  subtitle?: string;
  actions?: React.ReactNode;
  badge?: React.ReactNode;
  breadcrumbs?: React.ReactNode;
  className?: string;
}

export function PageHeader({
  title,
  subtitle,
  actions,
  badge,
  breadcrumbs,
  className = '',
}: PageHeaderProps) {
  return (
    <div className={className}>
      {breadcrumbs && <div className="mb-2">{breadcrumbs}</div>}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="min-w-0">
          <div className="flex items-center gap-3">
            <h1 className="text-xl font-bold tracking-tight text-slate-50 font-sans leading-tight">
              {title}
            </h1>
            {badge}
          </div>
          {subtitle && (
            <p className="text-[13px] text-[var(--color-text-secondary)] mt-1.5 max-w-2xl leading-relaxed">
              {subtitle}
            </p>
          )}
        </div>
        {actions && <div className="flex items-center gap-3 shrink-0">{actions}</div>}
      </div>
    </div>
  );
}
