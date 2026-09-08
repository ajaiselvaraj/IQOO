import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import {
  Zap, GitPullRequest, AlertTriangle, CheckCircle,
  Shield, TrendingUp, Clock, ArrowRight, Play
} from 'lucide-react';
import { useAppStore } from '@/stores/app';
import { DEMO_PRS, DEMO_ANALYTICS } from '@/data/demo';
import { SeverityBadge, RiskBadge } from '@/components/ui/Badge';
import { formatRelativeTime, pluralize } from '@/lib/utils';
import type { PullRequest } from '@/types';

function StatCard({ label, value, color, icon: Icon, sub }: {
  label: string;
  value: number;
  color: string;
  icon: React.ComponentType<{ size?: number; className?: string }>;
  sub?: string;
}) {
  const [count, setCount] = useState(0);

  useEffect(() => {
    let start = 0;
    const end = value;
    if (end === 0) return;
    const duration = 800;
    const step = end / (duration / 16);
    const timer = setInterval(() => {
      start = Math.min(start + step, end);
      setCount(Math.round(start));
      if (start >= end) clearInterval(timer);
    }, 16);
    return () => clearInterval(timer);
  }, [value]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      className="rounded-lg p-4 relative overflow-hidden"
      style={{
        background: 'var(--color-bg-surface)',
        border: '1px solid var(--color-border)',
      }}
    >
      <div
        className="absolute top-0 right-0 w-16 h-16 rounded-full blur-2xl opacity-20"
        style={{ background: color, transform: 'translate(30%, -30%)' }}
      />
      <div className="relative">
        <div className="flex items-center justify-between mb-3">
          <span className="text-xs font-medium" style={{ color: 'var(--color-text-secondary)' }}>
            {label}
          </span>
          <div
            className="p-1.5 rounded-md"
            style={{ background: `${color}15`, color }}
          >
            <Icon size={13} />
          </div>
        </div>
        <div
          className="text-2xl font-bold font-mono"
          style={{ color }}
        >
          {count}
        </div>
        {sub && (
          <div className="text-[10px] mt-1" style={{ color: 'var(--color-text-muted)' }}>
            {sub}
          </div>
        )}
      </div>
    </motion.div>
  );
}

function PRRow({ pr, index }: { pr: PullRequest; index: number }) {
  const navigate = useNavigate();
  const { riskScore, findingsCount } = pr;

  return (
    <motion.div
      initial={{ opacity: 0, x: -8 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: index * 0.07, duration: 0.25 }}
      className="group flex items-center gap-4 px-4 py-3.5 cursor-pointer transition-colors hover:bg-white/3"
      style={{ borderBottom: '1px solid var(--color-border-subtle)' }}
      onClick={() => navigate(`/pull-requests/${pr.id}`)}
    >
      {/* PR info */}
      <div className="flex items-center gap-3 flex-1 min-w-0">
        <div
          className="font-mono text-xs font-semibold shrink-0"
          style={{ color: 'var(--color-accent)' }}
        >
          #{pr.number}
        </div>
        <div className="min-w-0">
          <div className="text-sm font-medium truncate" style={{ color: 'var(--color-text-primary)' }}>
            {pr.title}
          </div>
          <div className="flex items-center gap-2 text-[10px] mt-0.5" style={{ color: 'var(--color-text-muted)' }}>
            <img src={pr.author.avatarUrl} alt="" className="w-3.5 h-3.5 rounded-full" />
            <span>{pr.author.login}</span>
            <span>·</span>
            <span>{pr.repository.split('/')[1]}</span>
            <span>·</span>
            <span>{formatRelativeTime(pr.updatedAt)}</span>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="hidden md:flex items-center gap-4 text-xs shrink-0">
        <div className="text-right">
          <div className="font-mono" style={{ color: 'var(--color-text-muted)' }}>
            {pr.filesChanged} files
          </div>
          <div className="flex gap-1 text-[10px] mt-0.5">
            <span style={{ color: 'var(--color-pass)' }}>+{pr.additions}</span>
            <span style={{ color: 'var(--color-critical)' }}>-{pr.deletions}</span>
          </div>
        </div>

        {/* Findings summary */}
        {findingsCount && (
          <div className="flex items-center gap-1">
            {findingsCount.critical > 0 && (
              <SeverityBadge severity="critical" size="sm" />
            )}
            {findingsCount.high > 0 && !findingsCount.critical && (
              <SeverityBadge severity="high" size="sm" />
            )}
            <span className="text-[10px]" style={{ color: 'var(--color-text-muted)' }}>
              {findingsCount.total} {findingsCount.total === 1 ? 'issue' : 'issues'}
            </span>
          </div>
        )}

        {/* Risk badge */}
        {riskScore && (
          <RiskBadge level={riskScore.level} score={riskScore.overall} />
        )}
      </div>

      <ArrowRight
        size={14}
        className="shrink-0 opacity-0 group-hover:opacity-100 transition-opacity"
        style={{ color: 'var(--color-text-muted)' }}
      />
    </motion.div>
  );
}

export function Dashboard() {
  const { isAnalyzing, startDemoAnalysis } = useAppStore();
  const navigate = useNavigate();
  const { reviewEfficiency, commonPatterns, riskTrend } = DEMO_ANALYTICS;

  const latest = riskTrend[riskTrend.length - 1];

  return (
    <div className="p-6 max-w-6xl mx-auto">
      {/* Page header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-lg font-semibold" style={{ color: 'var(--color-text-primary)' }}>
            Overview
          </h1>
          <p className="text-xs mt-0.5" style={{ color: 'var(--color-text-muted)' }}>
            What needs your attention?
          </p>
        </div>
        <button
          className="flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium transition-all hover:opacity-90"
          style={{
            background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
            color: 'white',
            boxShadow: '0 4px 12px rgba(99,102,241,0.3)',
          }}
          onClick={() => navigate('/pull-requests/pr-142')}
        >
          <Zap size={14} />
          Analyze PR
        </button>
      </div>

      {/* Risk overview stats */}
      <div className="grid grid-cols-5 gap-3 mb-6">
        <StatCard label="Critical" value={latest.critical} color="var(--color-critical)" icon={AlertTriangle} sub="active findings" />
        <StatCard label="High Risk" value={latest.high} color="var(--color-high)" icon={Shield} sub="pull requests" />
        <StatCard label="Medium" value={latest.medium} color="var(--color-medium)" icon={TrendingUp} sub="pull requests" />
        <StatCard label="Low" value={latest.low} color="var(--color-low)" icon={GitPullRequest} sub="pull requests" />
        <StatCard label="Passed" value={2} color="var(--color-pass)" icon={CheckCircle} sub="clean PRs" />
      </div>

      {/* Main grid */}
      <div className="grid grid-cols-3 gap-4">
        {/* Active Pull Requests — 2 col */}
        <div className="col-span-2">
          <div
            className="rounded-lg overflow-hidden"
            style={{ background: 'var(--color-bg-surface)', border: '1px solid var(--color-border)' }}
          >
            <div
              className="flex items-center justify-between px-4 py-3"
              style={{ borderBottom: '1px solid var(--color-border)' }}
            >
              <div className="flex items-center gap-2">
                <GitPullRequest size={14} style={{ color: 'var(--color-text-secondary)' }} />
                <h2 className="text-xs font-semibold tracking-wider uppercase" style={{ color: 'var(--color-text-muted)' }}>
                  Active Pull Requests
                </h2>
              </div>
              <button
                className="text-[10px] transition-colors hover:opacity-80"
                style={{ color: 'var(--color-accent)' }}
                onClick={() => navigate('/pull-requests')}
              >
                View all →
              </button>
            </div>
            <div>
              {DEMO_PRS.map((pr, i) => (
                <PRRow key={pr.id} pr={pr} index={i} />
              ))}
            </div>
          </div>
        </div>

        {/* Right column */}
        <div className="space-y-4">
          {/* AI Insights */}
          <div
            className="rounded-lg overflow-hidden"
            style={{ background: 'var(--color-bg-surface)', border: '1px solid var(--color-border)' }}
          >
            <div
              className="flex items-center gap-2 px-4 py-3"
              style={{ borderBottom: '1px solid var(--color-border)' }}
            >
              <div
                className="w-4 h-4 rounded-sm flex items-center justify-center text-[10px]"
                style={{ background: 'linear-gradient(135deg, #6366f1, #8b5cf6)' }}
              >
                ◎
              </div>
              <h2 className="text-xs font-semibold tracking-wider uppercase" style={{ color: 'var(--color-text-muted)' }}>
                AI Insights
              </h2>
            </div>
            <div className="p-4 space-y-3">
              {commonPatterns.slice(0, 4).map((p, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, x: 8 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.08 }}
                  className="flex items-start gap-2.5"
                >
                  <SeverityBadge severity={p.severity} size="sm" />
                  <div className="flex-1 min-w-0">
                    <div className="text-xs truncate" style={{ color: 'var(--color-text-secondary)' }}>
                      {p.pattern}
                    </div>
                    <div className="text-[10px]" style={{ color: 'var(--color-text-muted)' }}>
                      {p.count}× in recent PRs
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>

          {/* Quick stats */}
          <div
            className="rounded-lg p-4"
            style={{ background: 'var(--color-bg-surface)', border: '1px solid var(--color-border)' }}
          >
            <h2 className="text-xs font-semibold tracking-wider uppercase mb-3" style={{ color: 'var(--color-text-muted)' }}>
              Review Efficiency
            </h2>
            <div className="space-y-2">
              {[
                { label: 'PRs analyzed', value: reviewEfficiency.prAnalyzed, color: 'var(--color-accent)' },
                { label: 'Findings detected', value: reviewEfficiency.findingsDetected, color: 'var(--color-high)' },
                { label: 'Findings fixed', value: reviewEfficiency.findingsFixed, color: 'var(--color-pass)' },
                { label: 'Dismissed', value: reviewEfficiency.findingsDismissed, color: 'var(--color-text-muted)' },
              ].map(item => (
                <div key={item.label} className="flex items-center justify-between">
                  <span className="text-xs" style={{ color: 'var(--color-text-secondary)' }}>
                    {item.label}
                  </span>
                  <span className="text-xs font-mono font-semibold" style={{ color: item.color }}>
                    {item.value}
                  </span>
                </div>
              ))}
              <div className="pt-2 flex items-center justify-between" style={{ borderTop: '1px solid var(--color-border)' }}>
                <span className="text-xs" style={{ color: 'var(--color-text-secondary)' }}>
                  Avg. analysis time
                </span>
                <span className="text-xs font-mono font-semibold" style={{ color: 'var(--color-accent)' }}>
                  {reviewEfficiency.avgAnalysisTime}s
                </span>
              </div>
            </div>
          </div>

          {/* Demo CTA */}
          <div
            className="rounded-lg p-4 cursor-pointer transition-all hover:opacity-90"
            style={{
              background: 'linear-gradient(135deg, rgba(99,102,241,0.1) 0%, rgba(139,92,246,0.1) 100%)',
              border: '1px solid var(--color-accent-border)',
            }}
            onClick={() => navigate('/pull-requests/pr-142')}
          >
            <div className="flex items-center gap-2 mb-2">
              <Play size={12} style={{ color: 'var(--color-accent)' }} />
              <span className="text-xs font-semibold" style={{ color: 'var(--color-accent)' }}>
                Demo Story
              </span>
            </div>
            <p className="text-xs leading-relaxed" style={{ color: 'var(--color-text-secondary)' }}>
              See ORBITA analyze PR #142 — a payment retry mechanism with a critical auth bypass and SQL injection.
            </p>
            <div className="mt-2.5 flex items-center gap-1 text-xs" style={{ color: 'var(--color-accent)' }}>
              <span>Open PR workspace</span>
              <ArrowRight size={12} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
