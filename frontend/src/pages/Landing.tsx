import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence, useInView } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import {
  Orbit, GitFork, ArrowRight, Shield, Zap, GitBranch,
  CheckCircle, AlertTriangle, Code2, Lock, Play, ChevronRight,
  Brain, Target, GitMerge, Layers
} from 'lucide-react';

// ─── Hero PR Analysis Mock ───────────────────────────────────────────────────
const MOCK_STAGES = [
  { label: 'Fetching PR', done: true },
  { label: 'Understanding diff', done: true },
  { label: 'Loading context', done: true },
  { label: 'Running static analysis', done: true },
  { label: 'AI reasoning', done: false, active: true },
  { label: 'Validating findings', done: false },
  { label: 'Calculating risk', done: false },
  { label: 'Preparing review', done: false },
];

const MOCK_FINDINGS = [
  {
    severity: 'CRITICAL',
    color: '#f43f5e',
    bg: 'rgba(244,63,94,0.1)',
    border: 'rgba(244,63,94,0.25)',
    title: 'Authentication bypass via unvalidated retry token',
    file: 'services/payment_retry.py:142',
    confidence: 96,
  },
  {
    severity: 'HIGH',
    color: '#f97316',
    bg: 'rgba(249,115,22,0.1)',
    border: 'rgba(249,115,22,0.25)',
    title: 'SQL injection via f-string interpolation',
    file: 'services/payment.py:89',
    confidence: 94,
  },
  {
    severity: 'MEDIUM',
    color: '#f59e0b',
    bg: 'rgba(245,158,11,0.1)',
    border: 'rgba(245,158,11,0.25)',
    title: 'N+1 query pattern in retry loop',
    file: 'services/payment_retry.py:67',
    confidence: 89,
  },
];

function AnimatedHeroPanel() {
  const [visibleFindings, setVisibleFindings] = useState(0);
  const [scoreVal, setScoreVal] = useState(0);
  const [stageIdx, setStageIdx] = useState(4);

  useEffect(() => {
    // Animate findings appearing one by one
    const timers: ReturnType<typeof setTimeout>[] = [];
    MOCK_FINDINGS.forEach((_, i) => {
      timers.push(setTimeout(() => setVisibleFindings(i + 1), 1200 + i * 700));
    });
    // Animate score
    timers.push(setTimeout(() => {
      let s = 0;
      const step = setInterval(() => {
        s = Math.min(s + 2, 72);
        setScoreVal(s);
        if (s >= 72) clearInterval(step);
      }, 18);
    }, 2200));
    // Advance stages
    timers.push(setTimeout(() => setStageIdx(5), 3000));
    timers.push(setTimeout(() => setStageIdx(6), 4200));
    timers.push(setTimeout(() => setStageIdx(7), 5000));
    return () => timers.forEach(clearTimeout);
  }, []);

  return (
    <div
      className="rounded-xl overflow-hidden w-full"
      style={{
        background: '#0a0a0f',
        border: '1px solid rgba(99,102,241,0.2)',
        boxShadow: '0 0 60px rgba(99,102,241,0.08), 0 32px 80px rgba(0,0,0,0.6)',
      }}
    >
      {/* Window chrome */}
      <div
        className="flex items-center justify-between px-4 py-3"
        style={{ borderBottom: '1px solid #1e1e2e', background: '#0f0f17' }}
      >
        <div className="flex items-center gap-1.5">
          <div className="w-2.5 h-2.5 rounded-full bg-[#ff5f57]" />
          <div className="w-2.5 h-2.5 rounded-full bg-[#febc2e]" />
          <div className="w-2.5 h-2.5 rounded-full bg-[#28c840]" />
        </div>
        <div
          className="flex items-center gap-2 text-[11px] px-3 py-1 rounded-full"
          style={{ background: '#16161f', border: '1px solid #1e1e2e', color: '#6366f1', fontFamily: 'monospace' }}
        >
          <Orbit size={11} />
          orbita-demo/payment-service · #142
        </div>
        <div className="w-12" />
      </div>

      <div className="flex" style={{ minHeight: 360 }}>
        {/* Left: Agent Pipeline */}
        <div
          className="w-48 shrink-0 p-3"
          style={{ borderRight: '1px solid #1e1e2e', background: '#0d0d14' }}
        >
          <div className="text-[9px] font-semibold tracking-widest mb-3" style={{ color: '#4a4a6a' }}>
            ORBITA AGENT
          </div>
          {MOCK_STAGES.map((stage, i) => (
            <div key={i} className="flex items-center gap-2 py-1.5">
              <div className="w-3.5 h-3.5 flex items-center justify-center shrink-0">
                {i < stageIdx ? (
                  <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }}>
                    <CheckCircle size={12} color="#10b981" strokeWidth={2.5} />
                  </motion.div>
                ) : i === stageIdx ? (
                  <div className="w-2.5 h-2.5 rounded-full border border-[#6366f1] border-t-transparent animate-spin" />
                ) : (
                  <div className="w-1.5 h-1.5 rounded-full bg-[#2a2a3d]" />
                )}
              </div>
              <span
                className="text-[10px] leading-tight"
                style={{
                  color: i < stageIdx ? '#10b981' : i === stageIdx ? '#6366f1' : '#2a2a3d',
                  fontFamily: 'monospace',
                }}
              >
                {stage.label}
              </span>
            </div>
          ))}
        </div>

        {/* Center: Findings */}
        <div className="flex-1 p-4 min-w-0">
          <div className="flex items-center gap-2 mb-3">
            <AlertTriangle size={13} color="#f43f5e" />
            <span className="text-xs font-semibold" style={{ color: '#e8e8f0' }}>
              Findings
            </span>
            <span
              className="text-[10px] font-mono px-1.5 py-0.5 rounded-sm"
              style={{ background: 'rgba(244,63,94,0.15)', color: '#f43f5e' }}
            >
              {visibleFindings}
            </span>
          </div>
          <div className="space-y-2">
            {MOCK_FINDINGS.map((f, i) => (
              <AnimatePresence key={i}>
                {i < visibleFindings && (
                  <motion.div
                    initial={{ opacity: 0, x: -12 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.35 }}
                    className="rounded-md p-3"
                    style={{ background: f.bg, border: `1px solid ${f.border}` }}
                  >
                    <div className="flex items-center gap-2 mb-1">
                      <span
                        className="text-[9px] font-mono font-semibold px-1.5 py-0.5 rounded-sm"
                        style={{ background: `${f.color}20`, color: f.color }}
                      >
                        {f.severity}
                      </span>
                      <span className="text-[10px] font-mono" style={{ color: '#4a4a6a' }}>
                        {f.confidence}% confidence
                      </span>
                    </div>
                    <div className="text-[11px] font-medium leading-tight" style={{ color: '#e8e8f0' }}>
                      {f.title}
                    </div>
                    <div className="text-[9px] font-mono mt-1" style={{ color: '#6366f1' }}>
                      {f.file}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            ))}
          </div>
        </div>

        {/* Right: Risk score */}
        <div
          className="w-32 shrink-0 p-4 flex flex-col items-center justify-center gap-3"
          style={{ borderLeft: '1px solid #1e1e2e', background: '#0d0d14' }}
        >
          <div className="text-[9px] font-semibold tracking-widest text-center" style={{ color: '#4a4a6a' }}>
            RISK SCORE
          </div>
          {/* Mini ring */}
          <div className="relative">
            <svg width="72" height="72" viewBox="0 0 72 72" className="-rotate-90">
              <circle cx="36" cy="36" r="28" fill="none" stroke="#16161f" strokeWidth="6" />
              <circle
                cx="36" cy="36" r="28"
                fill="none" stroke="#f97316" strokeWidth="6"
                strokeLinecap="round"
                strokeDasharray={`${2 * Math.PI * 28}`}
                strokeDashoffset={`${2 * Math.PI * 28 * (1 - scoreVal / 100)}`}
                style={{ transition: 'stroke-dashoffset 0.05s linear', filter: 'drop-shadow(0 0 4px rgba(249,115,22,0.5))' }}
              />
            </svg>
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="text-base font-bold font-mono" style={{ color: '#f97316' }}>{scoreVal}</span>
            </div>
          </div>
          <div
            className="text-[9px] font-mono font-semibold px-2 py-1 rounded-sm text-center"
            style={{ background: 'rgba(249,115,22,0.1)', color: '#f97316', border: '1px solid rgba(249,115,22,0.25)' }}
          >
            HIGH RISK
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Feature Block ────────────────────────────────────────────────────────────
function FeatureCard({ icon: Icon, title, description, color, delay }: {
  icon: React.ComponentType<{ size?: number }>;
  title: string;
  description: string;
  color: string;
  delay: number;
}) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: '-60px' });

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 20 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.5, delay }}
      className="p-5 rounded-lg group hover:border-opacity-60 transition-all duration-300"
      style={{
        background: 'var(--color-bg-surface)',
        border: '1px solid var(--color-border)',
      }}
    >
      <div
        className="w-9 h-9 rounded-lg flex items-center justify-center mb-3 transition-transform group-hover:scale-110"
        style={{ background: `${color}15`, color }}
      >
        <Icon size={18} />
      </div>
      <h3 className="text-sm font-semibold mb-1.5" style={{ color: 'var(--color-text-primary)' }}>{title}</h3>
      <p className="text-xs leading-relaxed" style={{ color: 'var(--color-text-secondary)' }}>{description}</p>
    </motion.div>
  );
}

// ─── Main Landing Page ────────────────────────────────────────────────────────
export function Landing() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen" style={{ background: 'var(--color-bg-base)' }}>
      {/* Nav */}
      <nav
        className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-8 h-14"
        style={{
          background: 'rgba(9,9,14,0.8)',
          backdropFilter: 'blur(12px)',
          borderBottom: '1px solid var(--color-border)',
        }}
      >
        <div className="flex items-center gap-2.5">
          <div
            className="w-7 h-7 rounded-lg flex items-center justify-center"
            style={{ background: 'linear-gradient(135deg, #6366f1, #8b5cf6)', boxShadow: '0 0 12px rgba(99,102,241,0.4)' }}
          >
            <Orbit size={15} className="text-white" />
          </div>
          <span className="font-semibold text-sm tracking-tight" style={{ color: 'var(--color-text-primary)', letterSpacing: '0.04em' }}>
            ORBITA
          </span>
        </div>

        <div className="flex items-center gap-1">
          {['Features', 'How it works', 'Security'].map(item => (
            <button
              key={item}
              className="px-3 py-1.5 text-xs transition-colors hover:text-white"
              style={{ color: 'var(--color-text-secondary)' }}
            >
              {item}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-2">
          <button
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs transition-colors hover:bg-white/5"
            style={{ color: 'var(--color-text-secondary)', border: '1px solid var(--color-border)' }}
            onClick={() => navigate('/pull-requests/pr-142')}
          >
            <Play size={11} />
            View Demo
          </button>
          <button
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-all hover:opacity-90"
            style={{
              background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
              color: 'white',
              boxShadow: '0 4px 12px rgba(99,102,241,0.3)',
            }}
            onClick={() => navigate('/')}
          >
            <GitFork size={12} />
            Connect GitHub
          </button>
        </div>
      </nav>

      {/* Hero */}
      <section className="pt-32 pb-16 px-8 max-w-6xl mx-auto">
        {/* Badge */}
        <motion.div
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="flex justify-center mb-6"
        >
          <div
            className="flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium"
            style={{
              background: 'rgba(99,102,241,0.08)',
              border: '1px solid rgba(99,102,241,0.2)',
              color: 'var(--color-accent)',
            }}
          >
            <div className="w-1.5 h-1.5 rounded-full bg-[var(--color-accent)]" style={{ boxShadow: '0 0 6px var(--color-accent)' }} />
            iQOO Hackathon — Developer Tools Track
          </div>
        </motion.div>

        {/* Headline */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="text-center mb-6"
        >
          <h1
            className="text-4xl md:text-5xl font-bold leading-tight mb-4"
            style={{
              color: 'var(--color-text-primary)',
              letterSpacing: '-0.02em',
              lineHeight: 1.15,
            }}
          >
            AI that understands your PR<br />
            <span
              style={{
                background: 'linear-gradient(135deg, #6366f1 0%, #a78bfa 50%, #818cf8 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
              }}
            >
              before your team merges it.
            </span>
          </h1>
          <p
            className="text-sm md:text-base max-w-2xl mx-auto leading-relaxed"
            style={{ color: 'var(--color-text-secondary)' }}
          >
            ORBITA analyzes code changes, repository context, security risks, performance issues,
            and hidden bugs — then explains exactly why they matter.
          </p>
        </motion.div>

        {/* CTAs */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.25 }}
          className="flex items-center justify-center gap-3 mb-16"
        >
          <button
            className="flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-semibold transition-all hover:opacity-90 hover:scale-105"
            style={{
              background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
              color: 'white',
              boxShadow: '0 8px 24px rgba(99,102,241,0.35)',
            }}
            onClick={() => navigate('/')}
          >
            <GitFork size={15} />
            Connect GitHub
            <ArrowRight size={14} />
          </button>
          <button
            className="flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-medium transition-all hover:bg-white/5"
            style={{
              color: 'var(--color-text-secondary)',
              border: '1px solid var(--color-border)',
            }}
            onClick={() => navigate('/pull-requests/pr-142')}
          >
            <Play size={14} />
            View Demo
          </button>
        </motion.div>

        {/* Hero panel */}
        <motion.div
          initial={{ opacity: 0, y: 32 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.35 }}
          className="relative"
        >
          {/* Glow */}
          <div
            className="absolute -inset-8 rounded-3xl opacity-20 blur-3xl"
            style={{ background: 'radial-gradient(ellipse at center, #6366f1 0%, transparent 70%)' }}
          />
          <AnimatedHeroPanel />
        </motion.div>
      </section>

      {/* How it works — Pipeline */}
      <section className="py-16 px-8 max-w-6xl mx-auto">
        <div className="text-center mb-10">
          <h2 className="text-xl font-bold mb-2" style={{ color: 'var(--color-text-primary)' }}>
            8-stage analysis pipeline
          </h2>
          <p className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>
            ORBITA doesn't just lint code. It reasons about the change.
          </p>
        </div>
        <div className="flex items-center justify-center flex-wrap gap-2">
          {[
            { label: 'PR Understanding', icon: '📡' },
            { label: 'Repo Context', icon: '🏗️' },
            { label: 'Static Analysis', icon: '⚙️' },
            { label: 'AI Reasoning', icon: '🧠' },
            { label: 'Validation', icon: '✔️' },
            { label: 'Risk Scoring', icon: '📊' },
            { label: 'Review Gen', icon: '📝' },
            { label: 'GitHub Post', icon: '🚀' },
          ].map((stage, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.07 }}
              className="flex items-center gap-2"
            >
              <div
                className="flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-medium"
                style={{ background: 'var(--color-bg-surface)', border: '1px solid var(--color-border)', color: 'var(--color-text-secondary)' }}
              >
                <span>{stage.icon}</span>
                {stage.label}
              </div>
              {i < 7 && (
                <ChevronRight size={14} style={{ color: 'var(--color-text-muted)' }} />
              )}
            </motion.div>
          ))}
        </div>
      </section>

      {/* Features grid */}
      <section className="py-16 px-8 max-w-6xl mx-auto">
        <div className="text-center mb-10">
          <h2 className="text-xl font-bold mb-2" style={{ color: 'var(--color-text-primary)' }}>
            Built different from day one
          </h2>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {[
            { icon: Brain, title: 'Reasoning-based', description: 'Explains why a change may be dangerous, not just that it is.', color: '#6366f1', delay: 0 },
            { icon: Layers, title: 'Context-aware', description: 'Understands the full repository, not just the changed lines.', color: '#8b5cf6', delay: 0.08 },
            { icon: Shield, title: 'Hybrid analysis', description: 'Combines Ruff, Semgrep, ESLint with AI for accuracy.', color: '#f43f5e', delay: 0.16 },
            { icon: Target, title: 'Risk-aware', description: 'Prioritizes issues so you focus on what matters most.', color: '#f97316', delay: 0.24 },
            { icon: Code2, title: 'Actionable', description: 'Every finding includes a concrete suggested fix.', color: '#10b981', delay: 0.32 },
            { icon: GitMerge, title: 'GitHub-native', description: 'Posts structured review comments directly to your PR.', color: '#3b82f6', delay: 0.4 },
            { icon: Zap, title: 'Fast', description: 'Average analysis time under 20 seconds.', color: '#f59e0b', delay: 0.48 },
            { icon: Lock, title: 'Trustworthy', description: 'Confidence scores. False-positive control. Learning feedback loop.', color: '#a78bfa', delay: 0.56 },
          ].map(f => <FeatureCard key={f.title} {...f} />)}
        </div>
      </section>

      {/* Bottom CTA */}
      <section className="py-24 px-8 text-center">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="max-w-lg mx-auto"
        >
          <h2 className="text-2xl font-bold mb-3" style={{ color: 'var(--color-text-primary)' }}>
            The future of code review.
          </h2>
          <p className="text-sm mb-6" style={{ color: 'var(--color-text-secondary)' }}>
            Stop reviewing PRs manually. Let ORBITA find the issues that matter before they reach production.
          </p>
          <button
            className="inline-flex items-center gap-2 px-6 py-3 rounded-lg text-sm font-semibold transition-all hover:opacity-90 hover:scale-105"
            style={{
              background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
              color: 'white',
              boxShadow: '0 8px 24px rgba(99,102,241,0.35)',
            }}
            onClick={() => navigate('/')}
          >
            <GitFork size={15} />
            Connect GitHub
            <ArrowRight size={14} />
          </button>
        </motion.div>
      </section>

      {/* Footer */}
      <footer
        className="px-8 py-6 flex items-center justify-between text-xs"
        style={{ borderTop: '1px solid var(--color-border)', color: 'var(--color-text-muted)' }}
      >
        <div className="flex items-center gap-2">
          <Orbit size={13} style={{ color: 'var(--color-accent)' }} />
          <span>ORBITA — AI PR Intelligence Agent</span>
        </div>
        <span>iQOO Hackathon · Developer Tools Track · 2026</span>
      </footer>
    </div>
  );
}
