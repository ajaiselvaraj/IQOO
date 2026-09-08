import { motion, AnimatePresence } from 'framer-motion';
import { Check, Loader2, Clock, AlertTriangle } from 'lucide-react';
import { cn, formatDuration } from '@/lib/utils';
import type { AnalysisRun } from '@/types';

interface AgentPipelineProps {
  run: AnalysisRun;
  currentStageIndex?: number;
  isLive?: boolean;
}

const STAGE_ICONS = ['📡', '🔍', '🏗️', '⚙️', '🧠', '✔️', '📊', '📝'];

export function AgentPipeline({ run, currentStageIndex, isLive = false }: AgentPipelineProps) {
  const activeIdx = currentStageIndex ?? run.stages.length - 1;

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
        <div className="flex items-center gap-2">
          <div
            className="w-5 h-5 rounded-md flex items-center justify-center"
            style={{ background: 'linear-gradient(135deg, #6366f1, #8b5cf6)' }}
          >
            <span className="text-[10px]">◎</span>
          </div>
          <h3 className="text-xs font-semibold tracking-wider uppercase" style={{ color: 'var(--color-text-muted)' }}>
            ORBITA AGENT
          </h3>
        </div>
        {isLive ? (
          <div className="flex items-center gap-1.5 text-[10px]" style={{ color: 'var(--color-accent)' }}>
            <div className="w-1.5 h-1.5 rounded-full bg-[var(--color-accent)] status-dot-analyzing" />
            LIVE
          </div>
        ) : (
          <span className="text-[10px] font-mono" style={{ color: 'var(--color-text-muted)' }}>
            {run.durationMs ? formatDuration(run.durationMs) : 'Complete'}
          </span>
        )}
      </div>

      {/* Stages */}
      <div className="space-y-1">
        {run.stages.map((stage, idx) => {
          const isComplete = isLive ? idx < activeIdx : stage.status === 'complete';
          const isRunning = isLive ? idx === activeIdx : stage.status === 'running';
          const isPending = isLive ? idx > activeIdx : stage.status === 'pending';

          return (
            <motion.div
              key={stage.id}
              initial={{ opacity: 0, x: -8 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: idx * 0.04, duration: 0.25 }}
              className={cn(
                'flex items-center gap-3 px-3 py-2 rounded-md transition-all duration-300',
                isRunning && 'bg-[var(--color-accent-muted)]',
                isPending && 'opacity-40',
              )}
              style={{
                border: isRunning ? '1px solid var(--color-accent-border)' : '1px solid transparent',
              }}
            >
              {/* Status icon */}
              <div className="w-4 h-4 flex items-center justify-center shrink-0">
                {isComplete ? (
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: 'spring', stiffness: 400, damping: 20 }}
                  >
                    <Check size={13} style={{ color: 'var(--color-pass)' }} strokeWidth={2.5} />
                  </motion.div>
                ) : isRunning ? (
                  <Loader2
                    size={13}
                    className="animate-spin"
                    style={{ color: 'var(--color-accent)' }}
                  />
                ) : (
                  <Clock size={12} style={{ color: 'var(--color-text-muted)' }} />
                )}
              </div>

              {/* Stage icon + name */}
              <div className="flex items-center gap-2 flex-1 min-w-0">
                <span className="text-[13px] leading-none">{STAGE_ICONS[idx]}</span>
                <div className="min-w-0">
                  <div
                    className={cn(
                      'text-xs font-medium truncate',
                      isRunning ? 'text-[var(--color-text-primary)]' : 'text-[var(--color-text-secondary)]'
                    )}
                  >
                    {stage.name}
                  </div>
                  <AnimatePresence>
                    {isRunning && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="text-[10px] mt-0.5 leading-tight truncate"
                        style={{ color: 'var(--color-text-secondary)' }}
                      >
                        {stage.description}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </div>

              {/* Duration / timing */}
              {isComplete && stage.durationMs && (
                <span className="text-[10px] font-mono shrink-0" style={{ color: 'var(--color-text-muted)' }}>
                  {formatDuration(stage.durationMs)}
                </span>
              )}
            </motion.div>
          );
        })}
      </div>

      {/* Summary footer */}
      {!isLive && (
        <div
          className="mt-3 pt-3 flex items-center justify-between text-[10px]"
          style={{ borderTop: '1px solid var(--color-border)' }}
        >
          <span style={{ color: 'var(--color-text-muted)' }}>
            8 stages · {formatDuration(run.durationMs ?? 0)}
          </span>
          <span className="font-semibold" style={{ color: 'var(--color-pass)' }}>
            Analysis complete
          </span>
        </div>
      )}
    </div>
  );
}
