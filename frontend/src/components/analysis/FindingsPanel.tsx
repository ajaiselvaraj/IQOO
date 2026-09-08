import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ChevronDown, ChevronUp, Shield, Bug, Zap, Wrench, Copy, Check,
  X, AlertTriangle, Eye, ThumbsDown, ArrowUpRight, Target
} from 'lucide-react';
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

function getSeverityColor(severity: Severity): string {
  switch (severity) {
    case 'critical': return 'var(--color-critical)';
    case 'high': return 'var(--color-high)';
    case 'medium': return 'var(--color-medium)';
    case 'low': return 'var(--color-low)';
    default: return 'var(--color-text-secondary)';
  }
}

function getSeverityBorderColor(severity: Severity): string {
  switch (severity) {
    case 'critical': return 'var(--color-critical-border)';
    case 'high': return 'var(--color-high-border)';
    case 'medium': return 'var(--color-medium-border)';
    case 'low': return 'var(--color-low-border)';
    default: return 'var(--color-border)';
  }
}

interface FindingCardProps {
  finding: Finding;
  isSelected?: boolean;
  defaultExpanded?: boolean;
  onSelect?: (id: string) => void;
  onDismiss?: (id: string, reason: string) => void;
}

export function FindingCard({ finding, isSelected, defaultExpanded = false, onSelect, onDismiss }: FindingCardProps) {
  const [expanded, setExpanded] = useState(defaultExpanded || isSelected);
  const [showDismiss, setShowDismiss] = useState(false);
  const [copied, setCopied] = useState(false);
  const [status, setStatus] = useState(finding.status);

  const CatIcon = CATEGORY_ICONS[finding.category] ?? AlertTriangle;

  const handleCopy = (e: React.MouseEvent) => {
    e.stopPropagation();
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
        className="px-4 py-2.5 rounded-lg flex items-center justify-between text-xs opacity-50"
        style={{ background: 'var(--color-bg-surface)', border: '1px solid var(--color-border)' }}
      >
        <span style={{ color: 'var(--color-text-secondary)' }}>
          {finding.title} — <span style={{ color: 'var(--color-text-muted)' }}>dismissed</span>
        </span>
        <button
          className="font-medium hover:underline text-xs"
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
      className={`rounded-xl overflow-hidden card-hover transition-all cursor-pointer ${
        isSelected ? 'ring-1 ring-indigo-500/60 bg-[var(--color-bg-elevated)]' : ''
      }`}
      style={{
        background: 'var(--color-bg-surface)',
        border: `1px solid ${expanded || isSelected ? getSeverityBorderColor(finding.severity) : 'var(--color-border)'}`,
      }}
      onClick={() => {
        onSelect?.(finding.id);
        setExpanded(!expanded);
      }}
    >
      {/* Header row */}
      <div
        className="w-full flex items-start gap-2.5 px-3.5 py-2.5 text-left hover:bg-white/[0.02] transition-colors"
      >
        {/* Severity indicator line */}
        <div
          className="w-[3px] h-5 rounded-full shrink-0 mt-0.5"
          style={{ background: getSeverityColor(finding.severity) }}
        />

        <div className="flex items-center gap-1.5 shrink-0 mt-0.5">
          <SeverityBadge severity={finding.severity} size="sm" />
          <div className="p-1 rounded-md bg-[var(--color-bg-overlay)]">
            <CatIcon size={11} style={{ color: 'var(--color-text-secondary)' }} />
          </div>
        </div>

        <div className="flex-1 min-w-0">
          <div className="text-[13px] font-semibold leading-tight mb-0.5 text-slate-100">
            {finding.title}
          </div>
          <div className="flex flex-wrap items-center gap-1.5 text-[11px] text-[var(--color-text-muted)]">
            <code className="font-mono font-semibold text-[var(--color-text-secondary)]">
              {finding.file}:{finding.line}
            </code>
            <span>·</span>
            <span className="capitalize font-medium">{finding.category}</span>
            <span>·</span>
            <span
              className="font-mono font-bold"
              style={{ color: getSeverityColor(finding.severity) }}
            >
              {finding.confidence}%
            </span>
          </div>
        </div>

        <div className="shrink-0 mt-0.5 flex items-center gap-1 text-[var(--color-text-muted)]">
          <span title="Jump to code location">
            <Target size={13} className="text-indigo-400 opacity-70" />
          </span>
          {expanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
        </div>
      </div>

      {/* Expanded Details */}
      <AnimatePresence>
        {(expanded || isSelected) && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.2, ease: [0.4, 0, 0.2, 1] }}
            className="overflow-hidden"
          >
            <div
              className="px-3.5 pb-3.5 pt-2.5 space-y-3"
              style={{ borderTop: '1px solid var(--color-border-subtle)' }}
            >
              {/* Explanation */}
              <div>
                <h4 className="section-title mb-1">
                  Explanation & Context
                </h4>
                <p className="text-[12px] leading-relaxed text-[var(--color-text-secondary)]">
                  {finding.explanation}
                </p>
              </div>

              {/* Reasoning */}
              {finding.reasoning && (
                <div>
                  <h4 className="section-title mb-1">
                    Why It Matters
                  </h4>
                  <p className="text-[12px] leading-relaxed text-[var(--color-text-secondary)]">
                    {finding.reasoning}
                  </p>
                </div>
              )}

              {/* Code snippet if present */}
              {finding.codeSnippet && (
                <div>
                  <h4 className="section-title mb-1">
                    Vulnerable Code
                  </h4>
                  <pre
                    className="p-2.5 rounded-lg text-[12px] font-mono overflow-x-auto"
                    style={{ background: 'var(--color-bg-overlay)', border: '1px solid var(--color-border)', color: '#fda4af' }}
                  >
                    {finding.codeSnippet}
                  </pre>
                </div>
              )}

              {/* Actionable Suggested Fix */}
              {finding.suggestedFix && (
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <h4 className="section-title text-emerald-400">
                      Suggested Fix
                    </h4>
                    <button
                      onClick={handleCopy}
                      className="flex items-center gap-1 text-[11px] font-mono hover:opacity-80 transition-opacity text-indigo-400 font-semibold"
                    >
                      {copied ? <Check size={12} /> : <Copy size={12} />}
                      {copied ? 'Copied!' : 'Copy Fix'}
                    </button>
                  </div>
                  <pre
                    className="p-2.5 rounded-lg text-[12px] font-mono overflow-x-auto border"
                    style={{
                      background: 'rgba(16,185,129,0.06)',
                      borderColor: 'var(--color-pass-border)',
                      color: '#6ee7b7',
                    }}
                  >
                    {finding.suggestedFix}
                  </pre>
                </div>
              )}

              {/* Action Toolbar */}
              <div className="pt-2 flex items-center justify-between border-t border-[var(--color-border-subtle)]">
                <div className="flex items-center gap-2">
                  <button
                    className="px-2.5 py-1 rounded text-xs font-medium transition-colors hover:bg-white/5 text-slate-400"
                    style={{ border: '1px solid var(--color-border)' }}
                    onClick={(e) => {
                      e.stopPropagation();
                      setShowDismiss(!showDismiss);
                    }}
                  >
                    Dismiss
                  </button>
                  <button
                    className="px-2.5 py-1 rounded text-xs font-medium transition-colors hover:bg-white/5 text-slate-400"
                    style={{ border: '1px solid var(--color-border)' }}
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDismiss('False Positive');
                    }}
                  >
                    Mark False Positive
                  </button>
                </div>
                <span className="text-[10px] font-mono uppercase text-slate-500">
                  Source: {finding.source}
                </span>
              </div>

              {/* Dismiss popup options */}
              {showDismiss && (
                <div className="p-3 rounded bg-[var(--color-bg-elevated)] border border-[var(--color-border-strong)] space-y-2">
                  <div className="text-xs font-semibold text-slate-200">Select dismissal reason:</div>
                  <div className="flex flex-wrap gap-2">
                    {['Intentional Design', 'Risk Accepted', 'Will Fix Later'].map(reason => (
                      <button
                        key={reason}
                        className="px-2 py-1 rounded text-[11px] font-medium transition-colors hover:bg-white/10 text-slate-300 bg-[var(--color-bg-overlay)]"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDismiss(reason);
                        }}
                      >
                        {reason}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

export function FindingsPanel({ findings, selectedFindingId, onSelectFinding }: {
  findings: Finding[];
  selectedFindingId?: string;
  onSelectFinding?: (id: string) => void;
}) {
  const criticals = findings.filter(f => f.severity === 'critical');
  const highs = findings.filter(f => f.severity === 'high');
  const mediums = findings.filter(f => f.severity === 'medium');
  const lows = findings.filter(f => f.severity === 'low');

  return (
    <div className="space-y-4">
      {criticals.length > 0 && (
        <div className="space-y-2.5">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-bold font-mono tracking-wider uppercase text-rose-400">
              Critical Findings ({criticals.length})
            </h3>
          </div>
          {criticals.map(f => (
            <FindingCard
              key={f.id}
              finding={f}
              isSelected={f.id === selectedFindingId}
              defaultExpanded={true}
              onSelect={onSelectFinding}
            />
          ))}
        </div>
      )}

      {highs.length > 0 && (
        <div className="space-y-2.5">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-bold font-mono tracking-wider uppercase text-orange-400">
              High Severity ({highs.length})
            </h3>
          </div>
          {highs.map(f => (
            <FindingCard
              key={f.id}
              finding={f}
              isSelected={f.id === selectedFindingId}
              defaultExpanded={true}
              onSelect={onSelectFinding}
            />
          ))}
        </div>
      )}

      {mediums.length > 0 && (
        <div className="space-y-2.5">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-bold font-mono tracking-wider uppercase text-amber-400">
              Medium Severity ({mediums.length})
            </h3>
          </div>
          {mediums.map(f => (
            <FindingCard
              key={f.id}
              finding={f}
              isSelected={f.id === selectedFindingId}
              defaultExpanded={false}
              onSelect={onSelectFinding}
            />
          ))}
        </div>
      )}

      {lows.length > 0 && (
        <div className="space-y-2.5">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-bold font-mono tracking-wider uppercase text-blue-400">
              Low / Informational ({lows.length})
            </h3>
          </div>
          {lows.map(f => (
            <FindingCard
              key={f.id}
              finding={f}
              isSelected={f.id === selectedFindingId}
              defaultExpanded={false}
              onSelect={onSelectFinding}
            />
          ))}
        </div>
      )}
    </div>
  );
}
