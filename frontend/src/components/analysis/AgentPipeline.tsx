import { motion } from 'framer-motion';
import { CheckCircle2, Loader2, Circle, Cpu } from 'lucide-react';
import type { AnalysisRun, AnalysisStage } from '@/types';

interface AgentPipelineProps {
  run?: AnalysisRun;
  currentStageIndex?: number;
  isLive?: boolean;
}

export function AgentPipeline({ run, currentStageIndex, isLive }: AgentPipelineProps) {
  const stages: AnalysisStage[] = run?.stages ?? [
    { id: '1', name: 'Fetching PR Metadata', description: '', status: 'complete', durationMs: 420 },
    { id: '2', name: 'Parsing Code Diff', description: '', status: 'complete', durationMs: 310 },
    { id: '3', name: 'Loading Repository Context', description: '', status: 'complete', durationMs: 580 },
    { id: '4', name: 'Static Analysis (Ruff + Semgrep)', description: '', status: 'complete', durationMs: 1240 },
    { id: '5', name: 'LLM Reasoning Engine', description: '', status: 'complete', durationMs: 2850 },
    { id: '6', name: 'Deduplication & Validation Filter', description: '', status: 'complete', durationMs: 640 },
    { id: '7', name: 'Multi-Dimensional Risk Scoring', description: '', status: 'complete', durationMs: 410 },
    { id: '8', name: 'Generating Review Summary', description: '', status: 'complete', durationMs: 320 },
  ];

  return (
    <div
      className="rounded-xl p-3.5 space-y-2.5"
      style={{
        background: 'var(--color-bg-surface)',
        border: '1px solid var(--color-border)',
      }}
    >
      <div className="flex items-center justify-between pb-2" style={{ borderBottom: '1px solid var(--color-border-subtle)' }}>
        <div className="flex items-center gap-2">
          <Cpu size={15} className="text-indigo-400" />
          <h3 className="section-title" style={{ color: 'var(--color-text-primary)' }}>
            8-Stage AI Pipeline
          </h3>
        </div>
        {isLive && (
          <span className="flex items-center gap-1.5 text-[10px] font-mono text-indigo-400 font-bold">
            <Loader2 size={11} className="animate-spin" />
            PROCESSING
          </span>
        )}
      </div>

      <div className="space-y-2">
        {stages.map((stage, idx) => {
          const isCurrent = isLive && currentStageIndex === idx;
          const isComplete = !isLive || (currentStageIndex !== undefined && idx < currentStageIndex);

          return (
            <div
              key={stage.name}
              className="flex items-center justify-between text-[12px] py-1 px-2 rounded-lg transition-colors"
              style={{
                background: isCurrent ? 'var(--color-accent-muted)' : 'transparent',
              }}
            >
              <div className="flex items-center gap-2.5 min-w-0">
                {isComplete ? (
                  <CheckCircle2 size={14} className="text-emerald-400 shrink-0" />
                ) : isCurrent ? (
                  <Loader2 size={14} className="text-indigo-400 animate-spin shrink-0" />
                ) : (
                  <Circle size={14} className="text-slate-600 shrink-0" />
                )}
                <span
                  className={`truncate font-medium ${
                    isCurrent
                      ? 'text-indigo-300 font-bold'
                      : isComplete
                      ? 'text-slate-200'
                      : 'text-slate-500'
                  }`}
                >
                  {stage.name}
                </span>
              </div>
              {stage.durationMs && isComplete && (
                <span className="font-mono text-[10px] text-slate-500 shrink-0">
                  {stage.durationMs}ms
                </span>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
