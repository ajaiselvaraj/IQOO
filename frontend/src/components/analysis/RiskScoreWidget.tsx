import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn, getRiskColor } from '@/lib/utils';
import type { RiskScore } from '@/types';
import { ChevronDown, ChevronUp } from 'lucide-react';

interface RiskScoreWidgetProps {
  score: RiskScore;
  animate?: boolean;
}

const CATEGORY_LABELS: Record<string, string> = {
  security: 'Security',
  correctness: 'Correctness',
  performance: 'Performance',
  maintainability: 'Maintainability',
  complexity: 'Complexity',
};

const CATEGORY_COLORS: Record<string, string> = {
  security: 'var(--color-critical)',
  correctness: 'var(--color-high)',
  performance: 'var(--color-medium)',
  maintainability: 'var(--color-pass)',
  complexity: 'var(--color-accent)',
};

function RiskRing({ score, level, animate }: { score: number; level: string; animate: boolean }) {
  const radius = 52;
  const circumference = 2 * Math.PI * radius;
  const [displayScore, setDisplayScore] = useState(0);
  const [offset, setOffset] = useState(circumference);

  useEffect(() => {
    if (!animate) {
      setDisplayScore(score);
      setOffset(circumference - (score / 100) * circumference);
      return;
    }
    let start: number | null = null;
    const duration = 1400;
    const raf = (ts: number) => {
      if (!start) start = ts;
      const progress = Math.min((ts - start) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3); // ease out cubic
      const current = Math.round(eased * score);
      setDisplayScore(current);
      setOffset(circumference - (eased * score / 100) * circumference);
      if (progress < 1) requestAnimationFrame(raf);
    };
    const timeout = setTimeout(() => requestAnimationFrame(raf), 400);
    return () => clearTimeout(timeout);
  }, [score, animate, circumference]);

  const color = getRiskColor(level as RiskScore['level']);

  return (
    <div className="relative flex items-center justify-center">
      <svg width="140" height="140" viewBox="0 0 140 140" className="-rotate-90">
        {/* Track */}
        <circle
          cx="70" cy="70" r={radius}
          fill="none"
          stroke="var(--color-bg-elevated)"
          strokeWidth="10"
        />
        {/* Fill */}
        <circle
          cx="70" cy="70" r={radius}
          fill="none"
          stroke={color}
          strokeWidth="10"
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          style={{ transition: 'stroke-dashoffset 0.05s linear', filter: `drop-shadow(0 0 6px ${color}40)` }}
        />
      </svg>
      {/* Center text */}
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span
          className="text-3xl font-bold tabular-nums"
          style={{ color, fontFamily: 'var(--font-mono)', lineHeight: 1 }}
        >
          {displayScore}
        </span>
        <span className="text-[10px] mt-0.5 font-medium" style={{ color: 'var(--color-text-muted)' }}>
          / 100
        </span>
      </div>
    </div>
  );
}

export function RiskScoreWidget({ score, animate = true }: RiskScoreWidgetProps) {
  const [expandedCategory, setExpandedCategory] = useState<string | null>(null);

  const levelLabel: Record<string, string> = {
    critical: 'CRITICAL RISK',
    high: 'HIGH RISK',
    medium: 'MEDIUM RISK',
    low: 'LOW RISK',
    passed: 'PASSED',
  };

  return (
    <div
      className="rounded-lg p-4"
      style={{
        background: 'var(--color-bg-surface)',
        border: '1px solid var(--color-border)',
      }}
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-xs font-semibold tracking-wider uppercase" style={{ color: 'var(--color-text-muted)' }}>
          Risk Score
        </h3>
        <span
          className="text-[10px] font-semibold font-mono px-2 py-0.5 rounded-sm tracking-wider"
          style={{
            background: `${getRiskColor(score.level)}15`,
            color: getRiskColor(score.level),
            border: `1px solid ${getRiskColor(score.level)}30`,
          }}
        >
          {levelLabel[score.level]}
        </span>
      </div>

      {/* Ring */}
      <div className="flex justify-center mb-4">
        <RiskRing score={score.overall} level={score.level} animate={animate} />
      </div>

      {/* Category breakdown */}
      <div className="space-y-1">
        {Object.entries(score.breakdown).map(([key, cat]) => (
          <div key={key}>
            <button
              className="w-full text-left"
              onClick={() => setExpandedCategory(expandedCategory === key ? null : key)}
            >
              <div className="flex items-center gap-2 py-1.5 px-2 rounded-md transition-colors hover:bg-white/4">
                <div
                  className="w-1 h-4 rounded-full shrink-0"
                  style={{ background: CATEGORY_COLORS[key] }}
                />
                <span className="text-xs flex-1" style={{ color: 'var(--color-text-secondary)' }}>
                  {CATEGORY_LABELS[key]}
                </span>
                <div className="flex items-center gap-2">
                  <div
                    className="h-1 w-16 rounded-full overflow-hidden"
                    style={{ background: 'var(--color-bg-overlay)' }}
                  >
                    <motion.div
                      className="h-full rounded-full"
                      initial={{ width: 0 }}
                      animate={{ width: `${(cat.score / cat.maxScore) * 100}%` }}
                      transition={{ duration: 1, delay: 0.5, ease: [0.4, 0, 0.2, 1] }}
                      style={{ background: CATEGORY_COLORS[key] }}
                    />
                  </div>
                  <span
                    className="text-xs font-mono font-semibold w-10 text-right"
                    style={{ color: CATEGORY_COLORS[key] }}
                  >
                    {cat.score}/{cat.maxScore}
                  </span>
                  {expandedCategory === key
                    ? <ChevronUp size={12} style={{ color: 'var(--color-text-muted)' }} />
                    : <ChevronDown size={12} style={{ color: 'var(--color-text-muted)' }} />
                  }
                </div>
              </div>
            </button>

            <AnimatePresence>
              {expandedCategory === key && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.2 }}
                  className="overflow-hidden"
                >
                  <div
                    className="mx-2 mb-1.5 p-2.5 rounded-md text-xs leading-relaxed"
                    style={{
                      background: 'var(--color-bg-overlay)',
                      border: `1px solid ${CATEGORY_COLORS[key]}20`,
                      color: 'var(--color-text-secondary)',
                    }}
                  >
                    <p>{cat.reasoning}</p>
                    <div
                      className="mt-1.5 pt-1.5 flex items-center gap-2"
                      style={{ borderTop: '1px solid var(--color-border-subtle)' }}
                    >
                      <span style={{ color: 'var(--color-text-muted)' }}>Confidence</span>
                      <span className="font-mono font-semibold" style={{ color: CATEGORY_COLORS[key] }}>
                        {cat.confidence}%
                      </span>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        ))}
      </div>
    </div>
  );
}
