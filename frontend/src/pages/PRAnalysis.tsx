import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useParams, Link } from 'react-router-dom';
import {
  GitPullRequest, GitBranch, FileCode2, ExternalLink, Play, RefreshCw,
  CheckCheck, Share2, ChevronRight, AlertTriangle, X, ShieldAlert
} from 'lucide-react';
import { useAppStore, useDemoFindings, useDemoAnalysisRun, useDemoRiskScore } from '@/stores/app';
import { DEMO_PR, DEMO_DIFF_FILES, DEMO_REVIEW } from '@/data/demo';
import { RiskScoreWidget } from '@/components/analysis/RiskScoreWidget';
import { AgentPipeline } from '@/components/analysis/AgentPipeline';
import { FindingsPanel } from '@/components/analysis/FindingsPanel';
import { DiffViewer } from '@/components/analysis/DiffViewer';
import { RiskBadge, SeverityBadge } from '@/components/ui/Badge';
import { formatRelativeTime } from '@/lib/utils';

type Tab = 'diff' | 'findings' | 'pipeline';

function PostReviewModal({ onClose, onPost }: { onClose: () => void; onPost: () => void }) {
  const [posted, setPosted] = useState(false);

  const handlePost = () => {
    setPosted(true);
    setTimeout(() => {
      onPost();
      onClose();
    }, 1800);
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: 'rgba(0,0,0,0.75)', backdropFilter: 'blur(4px)' }}
    >
      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.95, opacity: 0 }}
        transition={{ duration: 0.15 }}
        className="w-full max-w-xl rounded-xl overflow-hidden"
        style={{
          background: 'var(--color-bg-elevated)',
          border: '1px solid var(--color-border-strong)',
          boxShadow: '0 24px 64px rgba(0,0,0,0.5)',
        }}
      >
        <div
          className="flex items-center justify-between px-5 py-3.5"
          style={{ borderBottom: '1px solid var(--color-border)' }}
        >
          <div>
            <h2 className="text-[14px] font-bold text-slate-100">
              Publish ORBITA Security Review to GitHub
            </h2>
            <p className="text-[12px] mt-0.5 text-[var(--color-text-muted)]">
              Publish structured findings & line annotations to Pull Request #142
            </p>
          </div>
          <button onClick={onClose} style={{ color: 'var(--color-text-muted)' }}>
            <X size={16} />
          </button>
        </div>

        <div className="p-5 space-y-4 max-h-80 overflow-y-auto">
          <div>
            <h3 className="section-title mb-2">Automated Review Summary</h3>
            <div
              className="p-3 rounded-lg text-[12px] leading-relaxed font-mono"
              style={{ background: 'var(--color-bg-overlay)', color: 'var(--color-text-secondary)' }}
            >
              {DEMO_REVIEW.summary.split('\n').slice(0, 8).join('\n')}
              <span style={{ color: 'var(--color-text-muted)' }}>...</span>
            </div>
          </div>
          <div className="grid grid-cols-4 gap-2.5">
            {[
              { label: 'Critical', count: 1, color: 'var(--color-critical)' },
              { label: 'High', count: 1, color: 'var(--color-high)' },
              { label: 'Medium', count: 2, color: 'var(--color-medium)' },
              { label: 'Low', count: 1, color: 'var(--color-low)' },
            ].map(item => (
              <div
                key={item.label}
                className="rounded-lg p-2.5 text-center border"
                style={{
                  background: `color-mix(in srgb, ${item.color} 8%, transparent)`,
                  borderColor: `color-mix(in srgb, ${item.color} 20%, transparent)`,
                }}
              >
                <div className="text-lg font-bold font-mono" style={{ color: item.color }}>
                  {item.count}
                </div>
                <div className="text-[10px] uppercase font-mono font-semibold" style={{ color: item.color }}>
                  {item.label}
                </div>
              </div>
            ))}
          </div>
        </div>

        <div
          className="flex items-center justify-between px-5 py-3.5"
          style={{ borderTop: '1px solid var(--color-border)' }}
        >
          <div className="text-[12px] font-mono text-[var(--color-text-muted)]">
            5 inline annotations ready for publishing
          </div>
          <div className="flex items-center gap-2.5">
            <button
              className="px-3 py-1.5 rounded-lg text-[12px] font-medium hover:bg-white/[0.03] transition-colors text-[var(--color-text-secondary)]"
              style={{ border: '1px solid var(--color-border)' }}
              onClick={onClose}
            >
              Cancel
            </button>
            <button
              className="flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-[12px] font-bold transition-all"
              style={{
                background: posted ? 'var(--color-pass)' : 'linear-gradient(135deg, #6366f1, #7c3aed)',
                color: 'white',
              }}
              onClick={handlePost}
              disabled={posted}
            >
              {posted ? (
                <>
                  <CheckCheck size={13} />
                  Review Posted!
                </>
              ) : (
                <>
                  <Share2 size={13} />
                  Confirm & Post to GitHub
                </>
              )}
            </button>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}

export function PRAnalysis() {
  const { id } = useParams<{ id: string }>();
  const { isAnalyzing, currentStageIndex, startDemoAnalysis } = useAppStore();
  const [showPostReview, setShowPostReview] = useState(false);
  const [reviewPosted, setReviewPosted] = useState(false);

  const pr = DEMO_PR;
  const findings = useDemoFindings();
  const analysisRun = useDemoAnalysisRun();
  const riskScore = useDemoRiskScore();

  // State for interactive finding selection -> code line highlight
  const [selectedFindingId, setSelectedFindingId] = useState<string | undefined>(findings[0]?.id);

  const totalFindings = pr.findingsCount?.total ?? 0;
  const hasAnalysis = pr.status === 'complete';

  return (
    <div className="flex flex-col h-[calc(100vh-52px)] overflow-hidden">
      {/* Flagship Header */}
      <div
        className="px-8 py-6 shrink-0"
        style={{ borderBottom: '1px solid var(--color-border)', background: 'var(--color-bg-base)' }}
      >
        {/* Breadcrumb */}
        <div className="flex items-center gap-1.5 text-[11px] font-mono mb-1 text-[var(--color-text-muted)]">
          <span>orbita-demo</span>
          <ChevronRight size={11} />
          <Link to="/repositories" className="hover:text-indigo-400 transition-colors">
            payment-service
          </Link>
          <ChevronRight size={11} />
          <span style={{ color: 'var(--color-accent)' }} className="font-bold">#142</span>
        </div>

        <div className="flex flex-col md:flex-row md:items-start justify-between gap-6 mt-4">
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-4 mb-4">
              <GitPullRequest size={24} className="text-indigo-400 shrink-0" />
              <h1 className="text-2xl font-bold truncate text-slate-100 tracking-tight">
                {pr.title}
              </h1>
              {pr.riskScore && (
                <RiskBadge level={pr.riskScore.level} score={pr.riskScore.overall} size="lg" />
              )}
            </div>

            <div className="flex flex-wrap items-center gap-4 text-[13px] text-[var(--color-text-muted)]">
              <div className="flex items-center gap-2">
                <img src={pr.author.avatarUrl} alt="" className="w-5 h-5 rounded-full ring-2 ring-[var(--color-border)]" />
                <span className="font-semibold text-slate-200">{pr.author.login}</span>
              </div>
              <span className="opacity-30">|</span>
              <div className="flex items-center gap-1.5 font-mono">
                <GitBranch size={11} />
                <code className="text-indigo-300 font-semibold">{pr.branch}</code>
                <span>→</span>
                <code>{pr.baseBranch}</code>
              </div>
              <span className="opacity-30">|</span>
              <code className="font-mono text-[var(--color-text-secondary)] bg-[var(--color-bg-elevated)] px-1.5 py-0.5 rounded">{pr.commitSha}</code>
              <span className="opacity-30">|</span>
              <div className="flex items-center gap-2 font-mono">
                <span className="text-[var(--color-text-primary)]">{pr.filesChanged} files</span>
                <span style={{ color: 'var(--color-pass)' }}>+{pr.additions}</span>
                <span style={{ color: 'var(--color-critical)' }}>-{pr.deletions}</span>
              </div>
              <span className="opacity-30">|</span>
              <span>{formatRelativeTime(pr.createdAt)}</span>
            </div>
          </div>

          {/* Action Toolbar */}
          <div className="flex items-center gap-2 shrink-0">
            <a
              href={pr.url}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-[12px] font-medium transition-colors hover:bg-white/[0.03] text-[var(--color-text-secondary)]"
              style={{ border: '1px solid var(--color-border)' }}
            >
              <ExternalLink size={12} />
              GitHub PR
            </a>
            {!hasAnalysis || isAnalyzing ? (
              <button
                className="flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-[12px] font-bold transition-all"
                style={{
                  background: isAnalyzing ? 'var(--color-bg-elevated)' : 'linear-gradient(135deg, #6366f1, #7c3aed)',
                  color: isAnalyzing ? 'var(--color-text-secondary)' : 'white',
                  border: isAnalyzing ? '1px solid var(--color-border)' : 'none',
                }}
                onClick={startDemoAnalysis}
                disabled={isAnalyzing}
              >
                {isAnalyzing ? (
                  <>
                    <RefreshCw size={12} className="animate-spin" />
                    Running Pipeline…
                  </>
                ) : (
                  <>
                    <Play size={12} />
                    Run Pipeline Analysis
                  </>
                )}
              </button>
            ) : (
              <button
                className="flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-[12px] font-bold transition-all hover:opacity-90"
                style={{
                  background: reviewPosted ? 'var(--color-pass)' : 'linear-gradient(135deg, #6366f1, #7c3aed)',
                  color: 'white',
                }}
                onClick={() => !reviewPosted && setShowPostReview(true)}
              >
                {reviewPosted ? (
                  <>
                    <CheckCheck size={13} />
                    Review Published
                  </>
                ) : (
                  <>
                    <Share2 size={13} />
                    Post Review to GitHub
                  </>
                )}
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Risk Hero Section */}
      {hasAnalysis && !isAnalyzing && (
        <div className="shrink-0 px-8 py-8 border-b border-[var(--color-border)] bg-[var(--color-bg-surface)]">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-start">
            {/* Left: Dominant Risk Score */}
            <div className="col-span-12 md:col-span-3 flex items-start gap-4">
              <span className="text-5xl font-bold font-mono tracking-tighter leading-none" style={{ color: 'var(--color-critical)' }}>
                {riskScore.overall}
              </span>
              <div className="pt-1">
                <div className="text-[15px] font-bold text-slate-100 uppercase tracking-widest leading-none mb-1.5">
                  {riskScore.level} RISK
                </div>
                <div className="text-[12px] text-[var(--color-text-muted)] font-mono leading-tight">
                  Overall Security Posture
                </div>
              </div>
            </div>
            
            {/* Center: Metrics */}
            <div className="col-span-12 md:col-span-4 flex items-center justify-start gap-10 border-l border-r border-[var(--color-border)] px-8">
              <div className="text-center">
                <div className="text-3xl font-bold font-mono text-rose-400 leading-none mb-2">{findings.filter(f => f.severity === 'critical').length}</div>
                <div className="text-[11px] text-[var(--color-text-muted)] uppercase tracking-widest font-semibold">Critical</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold font-mono text-orange-400 leading-none mb-2">{findings.filter(f => f.severity === 'high').length}</div>
                <div className="text-[11px] text-[var(--color-text-muted)] uppercase tracking-widest font-semibold">High</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold font-mono text-emerald-400 leading-none mb-2">{findings.filter(f => f.severity === 'low').length}</div>
                <div className="text-[11px] text-[var(--color-text-muted)] uppercase tracking-widest font-semibold">Passed</div>
              </div>
            </div>

            {/* Right: AI Summary */}
            <div className="col-span-12 md:col-span-5 min-w-0">
              <div className="p-5 rounded-xl border border-[var(--color-border)] bg-[var(--color-bg-elevated)] h-full">
                <div className="flex items-center gap-2 mb-3">
                  <ShieldAlert size={14} className="text-indigo-400" />
                  <span className="text-[11px] uppercase font-bold tracking-widest text-indigo-400">AI Assessment</span>
                </div>
                <p className="text-[13px] text-[var(--color-text-secondary)] leading-relaxed font-sans line-clamp-2">
                  {DEMO_REVIEW.summary.replace(/#/g, '').trim().split('\n')[0]}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Main 70% / 30% IDE Workspace Split */}
      <div className="flex-1 grid grid-cols-12 overflow-hidden">
        {/* Left ~70% Column (8 Columns) — IDE Diff Viewer */}
        <div className="col-span-12 lg:col-span-8 flex flex-col h-full overflow-hidden border-r border-[var(--color-border)]">
          <DiffViewer
            files={DEMO_DIFF_FILES}
            findings={findings}
            selectedFindingId={selectedFindingId}
            onSelectFinding={setSelectedFindingId}
          />
        </div>

        {/* Right ~30% Column (4 Columns) — Findings & Risk Score Sidebar */}
        <div className="col-span-12 lg:col-span-4 flex flex-col h-full overflow-y-auto p-6 space-y-6" style={{ background: 'var(--color-bg-surface)' }}>
          {/* Header for Right Column */}
          <div className="flex items-center justify-between border-b border-[var(--color-border)] pb-4">
            <div className="flex items-center gap-2 section-title">
              <ShieldAlert size={14} className="text-rose-400" />
              <span>Security Findings ({totalFindings})</span>
            </div>
            <span className="text-[11px] font-mono text-indigo-400 font-semibold">
              Click finding to jump to line
            </span>
          </div>

          {/* Findings List */}
          <div className="flex-1 overflow-y-auto">
            {isAnalyzing ? (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <RefreshCw size={22} className="animate-spin text-indigo-400 mb-3" />
                <p className="text-[13px] font-bold text-slate-200">Executing 8-Stage Pipeline Analysis…</p>
                <p className="text-[11px] text-[var(--color-text-muted)] mt-1">Ruff + Semgrep + Gemini Reasoning active</p>
              </div>
            ) : (
              <FindingsPanel
                findings={findings}
                selectedFindingId={selectedFindingId}
                onSelectFinding={setSelectedFindingId}
              />
            )}
          </div>

          {/* 8-Stage Pipeline Status */}
          <div className="pt-2">
            <AgentPipeline
              run={analysisRun}
              currentStageIndex={isAnalyzing ? currentStageIndex : undefined}
              isLive={isAnalyzing}
            />
          </div>
        </div>
      </div>

      {/* Post Review Modal */}
      <AnimatePresence>
        {showPostReview && (
          <PostReviewModal
            onClose={() => setShowPostReview(false)}
            onPost={() => setReviewPosted(true)}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
