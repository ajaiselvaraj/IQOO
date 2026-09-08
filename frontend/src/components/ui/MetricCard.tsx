import React, { useState, useEffect } from 'react';

interface MetricCardProps {
  label: string;
  value: number;
  color: string;
  icon: React.ComponentType<{ size?: number; className?: string; style?: React.CSSProperties }>;
  sub?: string;
  trend?: string;
  onClick?: () => void;
  className?: string;
}

export function MetricCard({
  label,
  value,
  color,
  icon: Icon,
  sub,
  trend,
  onClick,
  className = '',
}: MetricCardProps) {
  const [count, setCount] = useState(0);

  useEffect(() => {
    let start = 0;
    const end = value;
    if (end === 0) {
      setCount(0);
      return;
    }
    const duration = 450;
    const step = end / (duration / 16);
    const timer = setInterval(() => {
      start = Math.min(start + step, end);
      setCount(Math.round(start));
      if (start >= end) clearInterval(timer);
    }, 16);
    return () => clearInterval(timer);
  }, [value]);

  return (
    <div
      onClick={onClick}
      className={`surface-card card-hover p-6 relative overflow-hidden ${
        onClick ? 'cursor-pointer' : ''
      } ${className}`}
    >
      <div className="flex items-center justify-between mb-4">
        <span className="section-title text-[11px] text-[var(--color-text-secondary)]">
          {label}
        </span>
        <div
          className="w-7 h-7 rounded-md flex items-center justify-center shrink-0"
          style={{ background: `color-mix(in srgb, ${color} 14%, transparent)`, color }}
        >
          <Icon size={14} />
        </div>
      </div>
      <div className="flex items-baseline gap-3">
        <span className="text-3xl font-bold font-mono tracking-tight" style={{ color }}>
          {count}
        </span>
        {trend && (
          <span
            className="text-[10px] font-mono px-1.5 py-0.5 rounded font-semibold"
            style={{ background: `color-mix(in srgb, ${color} 12%, transparent)`, color }}
          >
            {trend}
          </span>
        )}
      </div>
      {sub && (
        <div className="text-[11px] mt-1.5 text-[var(--color-text-muted)] truncate">
          {sub}
        </div>
      )}
    </div>
  );
}
