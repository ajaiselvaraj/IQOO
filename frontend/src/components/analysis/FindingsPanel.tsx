import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ChevronDown, ChevronUp, Shield, Bug, Zap, Wrench, Copy, Check,
  X, AlertTriangle, CheckCircle, Eye, ThumbsDown
} from 'lucide-react';
import { cn, getCategoryIcon, formatRelativeTime } from '@/lib/utils';
import { SeverityBadge } from '@/components/ui/Badge';
import type { Finding, Severity } from '@/types';

const CATEGORY_ICONS: Record<string, React.ComponentType<{ size?: number; className?: string; style?: React.CSSProperties }>> = {
  security: Shield,
  correctness: Bug,
  performance: Zap,
  maintainability: Wrench,
  style: Wrench,
  architecture: AlertTriangle,
};

interface FindingCardProps {
  finding: Finding;
  defaultExpanded?: boolean;
  onDismiss?: (id: string, reason: string) => void;
  onMarkReviewed?: (id: string) => void;
}

export function FindingCard({ finding, defaultExpanded = false, onDismiss, onMarkReviewed }: FindingCardProps) {
  const [expanded, setExpanded] = useState(defaultExpanded);
  const [showDismiss, setShowDismiss] = useState(false);
  const [copied, setCopied] = useState(false);
  const [status, setStatus] = useState(finding.status);

  const CatIcon = CATEGORY_ICONS[finding.category] ?? AlertTriangle;

  const handleCopy = () => {
    navigator.clipboard.writeText(finding.suggestedFix);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDismiss = (reason: string) => {
    setStatus('dismissed');
    setShowDismiss(false);
    onDismiss?.(finding.id, reason);
  };

  if (status === 'dismissed') {
    return (
      <div
        className="px-4 py-2.5 rounded-md flex items-center justify-between text-xs opacity-40"
        style={{ background: 'var(--color-bg-surface)', border: '1px solid var(--color-border)' }}
      >
        <span style={{ color: 'var(--color-text-secondary)' }}>
          {finding.title} — <span style={{ color: 'var(--color-text-muted)' }}>dismissed</span>
        </span>
        <button
          className="underline underline-offset-2"
          style={{ color: 'var(--color-text-muted)' }}
          onClick={() => setStatus('open')}
        >
          Restore
        </button>
      </div>
    );
  }

  return (
    <motion.div
      layout
      className="rounded-md overflow-hidden"
      style={{
        background: 'var(--color-bg-surface)',
        border: `1px solid ${expanded ? getSeverityBorderColor(finding.severity) : 'var(--color-border)'}`,
        transition: 'border-color 0.2s',
      }}
    >
      {/* Header row */}
      <button
        className="w-full flex items-start gap-3 px-4 py-3 text-left hover:bg-white/3 transition-colors"
        onClick={() => setExpanded(!expanded)}
      >
        {/* Severity accent */}
        <div
          className="w-0.5 h-5 rounded-full shrink-0 mt-0.5"
          style={{ background: getSeverityColor(finding.severity) }}
        />

        <div className="flex items-center gap-2 shrink-0 mt-0.5">
          <SeverityBadge severity={finding.severity} size="sm" />
          <div className="p-1 rounded-sm" style={{ background: 'var(--color-bg-overlay)' }}>
            <CatIcon size={11} style={{ color: 'var(--color-text-secondary)' }} />
          </div>
        </div>

        <div className="flex-1 min-w-0">
          <div className="text-sm font-medium leading-tight mb-0.5" style={{ color: 'var(--color-text-primary)' }}>
            {finding.title}
          </div>
          <div className="flex items-center gap-2 text-[10px]" style={{ color: 'var(--color-text-muted)' }}>
            <code className="font-mono" style={{ color: 'var(--color-text-secondary)' }}>
              {finding.file}:{finding.line}
            </code>
            <span>·</span>
            <span className="capitalize">{finding.category}</span>
            <span>·</span>
            <span
              className="font-mono font-semibold"
              style={{ color: getSeverityColor(finding.severity) }}
            >
              {finding.confidence}% confidence
            </span>
            {finding.source !== 'ai' && (
              <>
                <span>·</span>
                <span className="uppercase font-mono text-[9px] px-1 py-0.5 rounded-sm"
                  style={{ background: 'var(--color-bg-overlay)', border: '1px solid var(--color-border)' }}>
                  {finding.source}
                </span>
              </>
            )}
          </div>
        </div>

        <div className="shrink-0 mt-0.5" style={{ color: 'var(--color-text-muted)' }}>
          {expanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
        </div>
      </button>

      {/* Expanded content */}
      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.25, ease: [0.4, 0, 0.2, 1] }}
            className="overflow-hidden"
          >
            <div
              className="px-4 pb-4 space-y-4"
              style={{ borderTop: '1px solid var(--color-border-subtle)' }}
            >
              {/* Explanation */}
              <div className="pt-3">
                <h4 className="text-[10px] font-semibold tracking-wider uppercase mb-1.5" style={{ color: 'var(--color-text-muted)' }}>
                  Explanation
                </h4>
                <p className="text-sm leading-relaxed" style={{ color: 'var(--color-text-secondary)' }}>
                  {finding.explanation}
                </p>
              </div>

              {/* Code snippet */}
              <div>
                <h4 className="text-[10px] font-semibold tracking-wider uppercase mb-1.5" style={{ color: 'var(--color-text-muted)' }}>
                  Affected Code
                </h4>
                <div
                  className="rounded-md overflow-hidden"
                  style={{ border: '1px solid var(--color-border)', background: '#0d0d14' }}
                >
                  <div
                    className="flex items-center justify-between px-3 py-1.5"
                    style={{ borderBottom: '1px solid var(--color-border)', background: 'var(--color-bg-elevated)' }}
                  >
                    <span className="font-mono text-[10px]" style={{ color: 'var(--color-text-muted)' }}>
                      {finding.file} · L{finding.line}
                    </span>
                    <span
                      className="text-[10px] px-1.5 py-0.5 rounded-sm font-mono"
                      style={{
                        background: `${getSeverityColor(finding.severity)}15`,
                        color: getSeverityColor(finding.severity),
                        border: `1px solid ${getSeverityColor(finding.severity)}30`,
                      }}
                    >
                      {finding.severity.toUpperCase()}
                    </span>
                  </div>
                  <pre
                    className="p-3 text-xs overflow-x-auto leading-relaxed"
                    style={{ fontFamily: 'var(--font-mono)', color: '#a9b1d6' }}
                  >
                    {finding.codeSnippet}
                  </pre>
                </div>
              </div>

              {/* Why ORBITA flagged this */}
              <div
                className="rounded-md p-3"
                style={{
                  background: 'var(--color-bg-overlay)',
                  border: '1px solid var(--color-accent-border)',
                }}
              >
                <h4 className="text-[10px] font-semibold tracking-wider uppercase mb-2" style={{ color: 'var(--color-accent)' }}>
                  Why this matters
                </h4>
                <p className="text-xs leading-relaxed mb-3" style={{ color: 'var(--color-text-secondary)' }}>
                  {finding.reasoning}
                </p>
                <h4 className="text-[10px] font-semibold tracking-wider uppercase mb-1.5" style={{ color: 'var(--color-text-muted)' }}>
                  Evidence
                </h4>
                <ul className="space-y-1">
                  {finding.evidence.map((e, i) => (
                    <li key={i} className="flex items-start gap-2 text-xs" style={{ color: 'var(--color-text-secondary)' }}>
                      <span className="mt-0.5 shrink-0" style={{ color: 'var(--color-accent)' }}>→</span>
                      <span>{e}</span>
                    </li>
                  ))}
                </ul>
                <div className="mt-2.5 pt-2.5 flex items-center gap-2" style={{ borderTop: '1px solid var(--color-border)' }}>
                  <span className="text-[10px]" style={{ color: 'var(--color-text-muted)' }}>Confidence</span>
                  <div className="flex-1 h-1 rounded-full" style={{ background: 'var(--color-bg-elevated)' }}>
                    <div
                      className="h-full rounded-full transition-all"
                      style={{
                        width: `${finding.confidence}%`,
                        background: getSeverityColor(finding.severity),
                      }}
                    />
                  </div>
                  <span
                    className="text-[10px] font-mono font-semibold"
                    style={{ color: getSeverityColor(finding.severity) }}
                  >
                    {finding.confidence}%
                  </span>
                </div>
              </div>

              {/* Impact */}
              <div>
                <h4 className="text-[10px] font-semibold tracking-wider uppercase mb-1.5" style={{ color: 'var(--color-text-muted)' }}>
                  Impact
                </h4>
                <p className="text-xs leading-relaxed" style={{ color: 'var(--color-text-secondary)' }}>
                  {finding.impact}
                </p>
              </div>

              {/* Suggested fix */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <h4 className="text-[10px] font-semibold tracking-wider uppercase" style={{ color: 'var(--color-text-muted)' }}>
                    Suggested Fix
                  </h4>
                  <button
                    onClick={handleCopy}
                    className="flex items-center gap-1.5 text-[10px] px-2 py-1 rounded-sm transition-colors hover:bg-white/5"
                    style={{ color: copied ? 'var(--color-pass)' : 'var(--color-text-muted)' }}
                  >
                    {copied ? <Check size={11} /> : <Copy size={11} />}
                    {copied ? 'Copied' : 'Copy fix'}
                  </button>
                </div>
                <div
                  className="rounded-md overflow-hidden"
                  style={{ border: '1px solid var(--color-pass-border)', background: '#0a1009' }}
                >
                  <pre
                    className="p-3 text-xs overflow-x-auto leading-relaxed"
                    style={{ fontFamily: 'var(--font-mono)', color: '#9ece6a' }}
                  >
                    {finding.suggestedFix}
                  </pre>
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center gap-2 flex-wrap">
                <button
                  className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-md font-medium transition-colors"
                  style={{
                    background: 'var(--color-pass-muted)',
                    color: 'var(--color-pass)',
                    border: '1px solid var(--color-pass-border)',
                  }}
                  onClick={() => { setStatus('accepted'); onMarkReviewed?.(finding.id); }}
                >
                  <CheckCircle size={13} />
                  Mark reviewed
                </button>
                <button
                  className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-md font-medium transition-colors hover:bg-white/5"
                  style={{
                    background: 'var(--color-bg-overlay)',
                    color: 'var(--color-text-secondary)',
                    border: '1px solid var(--color-border)',
                  }}
                  onClick={() => setShowDismiss(true)}
                >
                  <X size={13} />
                  Dismiss
                </button>
                <button
                  className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-md font-medium transition-colors hover:bg-white/5"
                  style={{
                    background: 'var(--color-bg-overlay)',
                    color: 'var(--color-text-secondary)',
                    border: '1px solid var(--color-border)',
                  }}
                  onClick={() => handleDismiss('false_positive')}
                >
                  <ThumbsDown size={13} />
                  False positive
                </button>
              </div>

              {/* Dismiss reason picker */}
              <AnimatePresence>
                {showDismiss && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="rounded-md p-3 overflow-hidden"
                    style={{ background: 'var(--color-bg-overlay)', border: '1px solid var(--color-border)' }}
                  >
                    <p className="text-xs mb-2.5" style={{ color: 'var(--color-text-secondary)' }}>
                      Why are you dismissing this finding?
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {['False positive', 'Accepted risk', 'Out of scope', 'Already known'].map(reason => (
                        <button
                          key={reason}
                          className="text-xs px-2.5 py-1.5 rounded-md transition-colors hover:bg-white/5"
                          style={{
                            background: 'var(--color-bg-elevated)',
                            border: '1px solid var(--color-border)',
                            color: 'var(--color-text-secondary)',
                          }}
                          onClick={() => handleDismiss(reason)}
                        >
                          {reason}
                        </button>
                      ))}
                    </div>
                    <p className="text-[10px] mt-2" style={{ color: 'var(--color-text-muted)' }}>
                      This feedback will improve future analysis for this repository.
                    </p>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

function getSeverityColor(severity: Severity): string {
  const map: Record<Severity, string> = {
    critical: 'var(--color-critical)',
    high: 'var(--color-high)',
    medium: 'var(--color-medium)',
    low: 'var(--color-low)',
    info: 'var(--color-text-secondary)',
  };
  return map[severity];
}

function getSeverityBorderColor(severity: Severity): string {
  const map: Record<Severity, string> = {
    critical: 'var(--color-critical-border)',
    high: 'var(--color-high-border)',
    medium: 'var(--color-medium-border)',
    low: 'var(--color-low-border)',
    info: 'var(--color-border)',
  };
  return map[severity];
}

interface FindingsPanelProps {
  findings: Finding[];
}

const severityOrder: Severity[] = ['critical', 'high', 'medium', 'low', 'info'];

export function FindingsPanel({ findings }: FindingsPanelProps) {
  const grouped = severityOrder.reduce((acc, s) => {
    const group = findings.filter(f => f.severity === s && f.status === 'open');
    if (group.length > 0) acc[s] = group;
    return acc;
  }, {} as Record<Severity, Finding[]>);

  const severityLabels: Record<Severity, string> = {
    critical: 'Critical',
    high: 'High',
    medium: 'Medium',
    low: 'Low',
    info: 'Info',
  };

  return (
    <div className="space-y-4">
      {severityOrder.map(severity => {
        const group = grouped[severity];
        if (!group) return null;
        return (
          <div key={severity}>
            <div className="flex items-center gap-2 mb-2">
              <div
                className="w-1.5 h-1.5 rounded-full"
                style={{ background: getSeverityColor(severity) }}
              />
              <span className="text-[10px] font-semibold tracking-wider uppercase" style={{ color: 'var(--color-text-muted)' }}>
                {severityLabels[severity]}
              </span>
              <span
                className="text-[10px] font-mono px-1.5 py-0.5 rounded-sm"
                style={{ background: 'var(--color-bg-elevated)', color: 'var(--color-text-muted)' }}
              >
                {group.length}
              </span>
            </div>
            <div className="space-y-2">
              {group.map((f, i) => (
                <motion.div
                  key={f.id}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.06, duration: 0.25 }}
                >
                  <FindingCard finding={f} defaultExpanded={severity === 'critical' && i === 0} />
                </motion.div>
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}
