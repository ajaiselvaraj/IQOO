import { useState } from 'react';
import { Cpu, ShieldCheck, Key, Bell, Check, Save } from 'lucide-react';
import { PageHeader } from '@/components/ui/PageHeader';

export function Settings() {
  const [provider, setProvider] = useState<'gemini' | 'openai' | 'anthropic'>('gemini');
  const [apiKey, setApiKey] = useState('AIzaSyDemoKeyProvidedBySettingsEngine123');
  const [confidenceThreshold, setConfidenceThreshold] = useState(70);
  const [saved, setSaved] = useState(false);

  const handleSave = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <div className="page-container max-w-[1100px] space-y-5">
      <PageHeader
        title="Settings & Configuration"
        subtitle="Configure LLM providers, analysis confidence thresholds, and GitHub integrations"
        actions={
          <button
            onClick={handleSave}
            className="flex items-center gap-2 px-3.5 py-[7px] rounded-lg text-[12px] font-bold transition-all"
            style={{
              background: saved ? 'var(--color-pass)' : 'linear-gradient(135deg, #6366f1, #7c3aed)',
              color: 'white',
            }}
          >
            {saved ? <Check size={13} /> : <Save size={13} />}
            {saved ? 'Saved Changes' : 'Save Settings'}
          </button>
        }
      />

      {/* AI Provider Section */}
      <div className="surface-card p-4 space-y-4">
        <div className="flex items-center gap-2 pb-2.5 border-b border-[var(--color-border-subtle)]">
          <Cpu size={15} className="text-indigo-400" />
          <h2 className="text-[14px] font-bold text-slate-100">AI Intelligence Provider</h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {[
            { id: 'gemini', label: 'Google Gemini', desc: 'gemini-2.0-flash-exp (Default)' },
            { id: 'openai', label: 'OpenAI', desc: 'gpt-4o' },
            { id: 'anthropic', label: 'Anthropic', desc: 'claude-3-5-sonnet' },
          ].map(item => (
            <div
              key={item.id}
              onClick={() => setProvider(item.id as any)}
              className={`p-3.5 rounded-lg border cursor-pointer transition-all ${
                provider === item.id ? 'border-[var(--color-accent)] bg-[var(--color-accent-muted)]' : 'border-[var(--color-border)] hover:bg-white/[0.02]'
              }`}
            >
              <div className="flex items-center justify-between mb-1">
                <span className="font-bold text-[13px] text-slate-200">{item.label}</span>
                {provider === item.id && <Check size={14} className="text-indigo-400" />}
              </div>
              <span className="text-[11px] text-[var(--color-text-muted)] font-mono">{item.desc}</span>
            </div>
          ))}
        </div>

        <div className="space-y-1.5 pt-1">
          <label className="text-[12px] font-semibold text-[var(--color-text-secondary)]">API Key</label>
          <input
            type="password"
            value={apiKey}
            onChange={e => setApiKey(e.target.value)}
            className="w-full px-3 py-[6px] rounded-lg text-[12px] font-mono focus:outline-none"
            style={{
              background: 'var(--color-bg-elevated)',
              border: '1px solid var(--color-border)',
              color: 'var(--color-text-primary)',
            }}
          />
        </div>
      </div>

      {/* Confidence Thresholds */}
      <div className="surface-card p-4 space-y-4">
        <div className="flex items-center gap-2 pb-2.5 border-b border-[var(--color-border-subtle)]">
          <ShieldCheck size={15} className="text-indigo-400" />
          <h2 className="text-[14px] font-bold text-slate-100">Analysis Thresholds</h2>
        </div>

        <div className="space-y-2.5">
          <div className="flex justify-between text-[12px] font-mono">
            <span className="text-[var(--color-text-secondary)] font-sans">Minimum Finding Confidence</span>
            <span className="font-bold text-indigo-400">{confidenceThreshold}%</span>
          </div>
          <input
            type="range"
            min="50"
            max="95"
            value={confidenceThreshold}
            onChange={e => setConfidenceThreshold(Number(e.target.value))}
            className="w-full cursor-pointer"
          />
          <p className="text-[11px] text-[var(--color-text-muted)] leading-relaxed">
            Findings with confidence scores below {confidenceThreshold}% will be marked as informational observations rather than flagged issues.
          </p>
        </div>
      </div>

      {/* GitHub Integration */}
      <div className="surface-card p-4 space-y-2.5">
        <div className="flex items-center justify-between pb-2.5 border-b border-[var(--color-border-subtle)]">
          <div className="flex items-center gap-2">
            <Key size={15} className="text-indigo-400" />
            <h2 className="text-[14px] font-bold text-slate-100">GitHub Webhook Integration</h2>
          </div>
          <span className="text-[11px] font-mono font-bold text-emerald-400 bg-emerald-950/40 border border-emerald-800/30 px-2 py-0.5 rounded-md">
            CONNECTED
          </span>
        </div>
        <p className="text-[12px] text-[var(--color-text-secondary)]">
          Webhook endpoint: <code className="font-mono text-indigo-300">http://localhost:8000/webhooks/github</code>
        </p>
      </div>
    </div>
  );
}
