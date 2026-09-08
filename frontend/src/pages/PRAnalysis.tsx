import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useParams, Link } from 'react-router-dom';
import {
  GitPullRequest, GitMerge, GitBranch, FileCode2, Plus, Minus,
  ExternalLink, Play, RefreshCw, CheckCheck, Share2, ChevronRight,
  AlertTriangle, X
} from 'lucide-react';
import { useAppStore, useDemoFindings, useDemoAnalysisRun, useDemoRiskScore } from '@/stores/app';
import { DEMO_PR, DEMO_DIFF_FILES, DEMO_REVIEW } from '@/data/demo';
import { RiskScoreWidget } from '@/components/analysis/RiskScoreWidget';
import { AgentPipeline } from '@/components/analysis/AgentPipeline';
import { FindingsPanel } from '@/components/analysis/FindingsPanel';
import { DiffViewer } from '@/components/analysis/DiffViewer';
import { RiskBadge, SeverityBadge } from '@/components/ui/Badge';
import { formatRelativeTime, formatDate, pluralize } from '@/lib/utils';
import { cn } from '@/lib/utils';

type Tab = 'findings' | 'diff' | 'pipeline';

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
      style={{ background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(4px)' }}
    >
      <motion.div
        initial={{ scale: 0.94, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.94, opacity: 0 }}
        transition={{ duration: 0.2 }}
        className="w-full max-w-lg rounded-xl overflow-hidden"
        style={{
          background: 'var(--color-bg-elevated)',
          border: '1px solid var(--color-border-strong)',
          boxShadow: '0 32px 80px rgba(0,0,0,0.6)',
        }}
      >
        {/* Header */}
        <div
          className="flex items-center justify-between px-5 py-4"
          style={{ borderBottom: '1px solid var(--color-border)' }}
        >
          <div>
            <h2 className="text-sm font-semibold" style={{ color: 'var(--color-text-primary)' }}>
              Post ORBITA Review
            </h2>
            <p className="text-xs mt-0.5" style={{ color: 'var(--color-text-muted)' }}>
              This will publish a structured review to GitHub PR #142
            </p>
          </div>
          <button onClick={onClose} style={{ color: 'var(--color-text-muted)' }}>
            <X size={16} />
          </button>
        </div>

        {/* Preview */}
        <div className="p-5 space-y-4 max-h-72 overflow-y-auto">
          <div>
            <h3 className="text-xs font-semibold tracking-wider uppercase mb-2" style={{ color: 'var(--color-text-muted)' }}>
              Review Summary
            </h3>
            <div
              className="p-3 rounded-md text-xs leading-relaxed font-mono"
              style={{ background: 'var(--color-bg-overlay)', color: 'var(--color-text-secondary)' }}
            >
              {DEMO_REVIEW.summary.split('\n').slice(0, 8).join('\n')}
              <span style={{ color: 'var(--color-text-muted)' }}>...</span>
            </div>
          </div>
          <div className="grid grid-cols-4 gap-2">
            {[
              { label: 'Critical', count: 1, color: 'var(--color-critical)' },
              { label: 'High', count: 1, color: 'var(--color-high)' },
              { label: 'Medium', count: 2, color: 'var(--color-medium)' },
              { label: 'Low', count: 1, color: 'var(--color-low)' },
            ].map(item => (
              <div
                key={item.label}
                className="rounded-md p-2 text-center"
                style={{ background: `${item.color}10`, border: `1px solid ${item.color}20` }}
              >
                <div className="text-lg font-bold font-mono" style={{ color: item.color }}>
                  {item.count}
                </div>
                <div className="text-[10px]" style={{ color: item.color }}>
                  {item.label}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Actions */}
        <div
          className="flex items-center justify-between px-5 py-4"
          style={{ borderTop: '1px solid var(--color-border)' }}
        >
          <div className="text-xs" style={{ color: 'var(--color-text-muted)' }}>
            5 inline comments + 1 review summary
          </div>
          <div className="flex items-center gap-2">
            <button
              className="px-3 py-1.5 rounded-md text-xs transition-colors hover:bg-white/5"
              style={{ color: 'var(--color-text-secondary)', border: '1px solid var(--color-border)' }}
              onClick={onClose}
            >
              Cancel
            </button>
            <button
              className="flex items-center gap-2 px-4 py-1.5 rounded-md text-xs font-semibold transition-all"
              style={{
                background: posted ? 'var(--color-pass)' : 'linear-gradient(135deg, #6366f1, #8b5cf6)',
                color: 'white',
                boxShadow: posted ? '0 4px 12px rgba(16,185,129,0.3)' : '0 4px 12px rgba(99,102,241,0.3)',
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
                  Post Review to GitHub
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
  const { isAnalyzing, analysisProgress, currentStageIndex, startDemoAnalysis } = useAppStore();
  const [activeTab, setActiveTab] = useState<Tab>('findings');
  const [showPostReview, setShowPostReview] = useState(false);
  const [reviewPosted, setReviewPosted] = useState(false);

  const pr = DEMO_PR; // In production: fetch by id
  const findings = useDemoFindings();
  const analysisRun = useDemoAnalysisRun();
  const riskScore = useDemoRiskScore();

  const totalFindings = pr.findingsCount?.total ?? 0;
  const hasAnalysis = pr.status === 'complete';

  const TABS: { id: Tab; label: string; count?: number }[] = [
    { id: 'findings', label: 'Findings', count: totalFindings },
    { id: 'diff', label: 'Code Diff' },
    { id: 'pipeline', label: 'Agent Pipeline' },
  ];

  return (
    <div className="flex flex-col h-full">
      {/* PR Header */}
      <div
        className="px-5 py-4 shrink-0"
        style={{ borderBottom: '1px solid var(--color-border)', background: 'var(--color-bg-surface)' }}
      >
        {/* Breadcrumb */}
        <div className="flex items-center gap-1.5 text-xs mb-2.5" style={{ color: 'var(--color-text-muted)' }}>
          <span>orbita-demo</span>
          <ChevronRight size={12} />
          <Link to="/repositories" className="hover:opacity-80 transition-opacity">
            payment-service
          </Link>
          <ChevronRight size={12} />
          <span style={{ color: 'var(--color-accent)' }} className="font-mono">#142</span>
        </div>

        <div className="flex items-start justify-between gap-4">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-3 mb-2">
              <GitPullRequest size={16} style={{ color: 'var(--color-accent)' }} />
              <h1
                className="text-base font-semibold truncate"
                style={{ color: 'var(--color-text-primary)' }}
              >
                {pr.title}
              </h1>
              {pr.riskScore && (
                <RiskBadge level={pr.riskScore.level} score={pr.riskScore.overall} size="lg" />
              )}
            </div>

            {/* Meta row */}
            <div className="flex flex-wrap items-center gap-3 text-xs" style={{ color: 'var(--color-text-muted)' }}>
              <div className="flex items-center gap-1.5">
                <img src={pr.author.avatarUrl} alt="" className="w-4 h-4 rounded-full" />
                <span style={{ color: 'var(--color-text-secondary)' }}>{pr.author.login}</span>
              </div>
              <span>·</span>
              <div className="flex items-center gap-1">
                <GitBranch size={11} />
                <code className="font-mono" style={{ color: 'var(--color-text-secondary)' }}>
                  {pr.branch}
                </code>
                <span style={{ color: 'var(--color-text-muted)' }}>→</span>
                <code className="font-mono">{pr.baseBranch}</code>
              </div>
              <span>·</span>
              <code className="font-mono" style={{ color: 'var(--color-text-secondary)' }}>
                {pr.commitSha}
              </code>
              <span>·</span>
              <div className="flex items-center gap-2">
                <span>
                  <span style={{ color: 'var(--color-text-secondary)' }}>{pr.filesChanged}</span> files
                </span>
                <span style={{ color: 'var(--color-pass)' }}>+{pr.additions}</span>
                <span style={{ color: 'var(--color-critical)' }}>-{pr.deletions}</span>
              </div>
              <span>·</span>
              <span>{formatRelativeTime(pr.createdAt)}</span>
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex items-center gap-2 shrink-0">
            <a
              href={pr.url}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs transition-colors hover:bg-white/5"
              style={{
                color: 'var(--color-text-secondary)',
                border: '1px solid var(--color-border)',
              }}
            >
              <ExternalLink size={12} />
              GitHub
            </a>
            {!hasAnalysis || isAnalyzing ? (
              <button
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-all"
                style={{
                  background: isAnalyzing ? 'var(--color-bg-elevated)' : 'linear-gradient(135deg, #6366f1, #8b5cf6)',
                  color: isAnalyzing ? 'var(--color-text-secondary)' : 'white',
                  border: isAnalyzing ? '1px solid var(--color-border)' : 'none',
                }}
                onClick={startDemoAnalysis}
                disabled={isAnalyzing}
              >
                {isAnalyzing ? (
                  <>
                    <RefreshCw size={12} className="animate-spin" />
                    Analyzing…
                  </>
                ) : (
                  <>
                    <Play size={12} />
                    Run Analysis
                  </>
                )}
              </button>
            ) : (
              <button
                className="flex items-center gap-2 px-4 py-1.5 rounded-md text-xs font-semibold transition-all hover:opacity-90"
                style={{
                  background: reviewPosted ? 'var(--color-pass)' : 'linear-gradient(135deg, #6366f1, #8b5cf6)',
                  color: 'white',
                  boxShadow: '0 4px 12px rgba(99,102,241,0.3)',
                }}
                onClick={() => !reviewPosted && setShowPostReview(true)}
              >
                {reviewPosted ? (
                  <>
                    <CheckCheck size={13} />
                    Review Posted
                  </>
                ) : (
                  <>
                    <Share2 size={13} />
                    Post Review
                  </>
                )}
              </button>
            )}
          </div>
        </div>

        {/* Labels */}
        {pr.labels.length > 0 && (
          <div className="flex items-center gap-1.5 mt-2.5">
            {pr.labels.map(label => (
              <span
                key={label}
                className="text-[10px] px-2 py-0.5 rounded-full font-medium"
                style={{
                  background: 'var(--color-bg-overlay)',
                  border: '1px solid var(--color-border)',
                  color: 'var(--color-text-secondary)',
                }}
              >
                {label}
              </span>
            ))}
          </div>
        )}
      </div>

      {/* Body — 3 column layout */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left: Tabs + main content */}
        <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
          {/* Tab bar */}
          <div
            className="flex items-center gap-0 px-4 shrink-0"
            style={{ borderBottom: '1px solid var(--color-border)', background: 'var(--color-bg-surface)' }}
          >
            {TABS.map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className="flex items-center gap-1.5 px-3 py-2.5 text-xs font-medium transition-all border-b-2"
                style={{
                  color: activeTab === tab.id ? 'var(--color-text-primary)' : 'var(--color-text-secondary)',
                  borderBottomColor: activeTab === tab.id ? 'var(--color-accent)' : 'transparent',
                }}
              >
                {tab.label}
                {tab.count !== undefined && (
                  <span
                    className="font-mono px-1.5 py-0.5 rounded-sm text-[10px]"
                    style={{
                      background: activeTab === tab.id ? 'var(--color-accent-muted)' : 'var(--color-bg-elevated)',
                      color: activeTab === tab.id ? 'var(--color-accent)' : 'var(--color-text-muted)',
                    }}
                  >
                    {tab.count}
                  </span>
                )}
              </button>
            ))}
          </div>

          {/* Tab content */}
          <div className="flex-1 overflow-y-auto p-4">
            <AnimatePresence mode="wait">
              {activeTab === 'findings' && (
                <motion.div
                  key="findings"
                  initial={{ opacity: 0, y: 4 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -4 }}
                  transition={{ duration: 0.2 }}
                >
                  {isAnalyzing ? (
                    <div className="flex flex-col items-center justify-center py-16">
                      <div className="w-8 h-8 border-2 border-[var(--color-accent)] border-t-transparent rounded-full animate-spin mb-4" />
                      <p className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>
                        Analysis in progress…
                      </p>
                      <p className="text-xs mt-1" style={{ color: 'var(--color-text-muted)' }}>
                        Check the Agent Pipeline tab for live progress
                      </p>
                    </div>
                  ) : hasAnalysis ? (
                    <FindingsPanel findings={findings} />
                  ) : (
                    <EmptyAnalysis onRun={startDemoAnalysis} />
                  )}
                </motion.div>
              )}
              {activeTab === 'diff' && (
                <motion.div
                  key="diff"
                  initial={{ opacity: 0, y: 4 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -4 }}
                  transition={{ duration: 0.2 }}
                >
                  <DiffViewer files={DEMO_DIFF_FILES} findings={findings} />
                </motion.div>
              )}
              {activeTab === 'pipeline' && (
                <motion.div
                  key="pipeline"
                  initial={{ opacity: 0, y: 4 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -4 }}
                  transition={{ duration: 0.2 }}
                >
                  <AgentPipeline
                    run={analysisRun}
                    currentStageIndex={isAnalyzing ? currentStageIndex : undefined}
                    isLive={isAnalyzing}
                  />
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* Right panel — Risk score + agent summary */}
        <div
          className="w-72 shrink-0 overflow-y-auto p-4 space-y-4"
          style={{ borderLeft: '1px solid var(--color-border)' }}
        >
          {hasAnalysis && !isAnalyzing ? (
            <>
              <RiskScoreWidget score={riskScore} animate={true} />
              <AgentPipeline run={analysisRun} />
            </>
          ) : isAnalyzing ? (
            <AgentPipeline
              run={analysisRun}
              currentStageIndex={currentStageIndex}
              isLive={true}
            />
          ) : (
            <div
              className="rounded-lg p-4 text-center"
              style={{ background: 'var(--color-bg-surface)', border: '1px solid var(--color-border)' }}
            >
              <div className="text-2xl mb-2">◎</div>
              <p className="text-xs" style={{ color: 'var(--color-text-secondary)' }}>
                Run analysis to see the risk score and findings
              </p>
            </div>
          )}
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

function EmptyAnalysis({ onRun }: { onRun: () => void }) {
  return (
    <div className="flex flex-col items-center justify-center py-20 text-center">
      <div
        className="w-12 h-12 rounded-xl flex items-center justify-center mb-4 text-xl"
        style={{ background: 'var(--color-bg-elevated)', border: '1px solid var(--color-border)' }}
      >
        ◎
      </div>
      <h3 className="text-sm font-semibold mb-1.5" style={{ color: 'var(--color-text-primary)' }}>
        Ready to analyze
      </h3>
      <p className="text-xs mb-5 max-w-xs leading-relaxed" style={{ color: 'var(--color-text-secondary)' }}>
        ORBITA will analyze this PR across 8 stages — security, correctness, performance, and more.
      </p>
      <button
        className="flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-all hover:opacity-90"
        style={{
          background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
          color: 'white',
          boxShadow: '0 4px 12px rgba(99,102,241,0.3)',
        }}
        onClick={onRun}
      >
        <Play size={14} />
        Run Analysis
      </button>
    </div>
  );
}
