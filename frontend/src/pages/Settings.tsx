import { useState } from 'react';
import { motion } from 'framer-motion';
import { GitFork, Shield, Zap, Eye, Code2, Sliders, BookOpen, Plus, Trash2 } from 'lucide-react';

interface ToggleProps {
  label: string;
  description: string;
  defaultOn?: boolean;
}

function Toggle({ label, description, defaultOn = true }: ToggleProps) {
  const [on, setOn] = useState(defaultOn);
  return (
    <div className="flex items-center justify-between py-3" style={{ borderBottom: '1px solid var(--color-border-subtle)' }}>
      <div>
        <div className="text-sm font-medium" style={{ color: 'var(--color-text-primary)' }}>{label}</div>
        <div className="text-xs mt-0.5" style={{ color: 'var(--color-text-muted)' }}>{description}</div>
      </div>
      <button
        className="relative w-9 h-5 rounded-full transition-colors duration-200 shrink-0"
        style={{ background: on ? 'var(--color-accent)' : 'var(--color-bg-overlay)' }}
        onClick={() => setOn(!on)}
      >
        <motion.div
          animate={{ x: on ? 16 : 2 }}
          transition={{ duration: 0.15 }}
          className="absolute top-0.5 w-4 h-4 rounded-full"
          style={{ background: 'white' }}
        />
      </button>
    </div>
  );
}

function SettingsSection({ icon: Icon, title, children }: {
  icon: React.ComponentType<{ size?: number; style?: React.CSSProperties }>;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div
      className="rounded-lg overflow-hidden mb-4"
      style={{ background: 'var(--color-bg-surface)', border: '1px solid var(--color-border)' }}
    >
      <div
        className="flex items-center gap-2.5 px-5 py-3.5"
        style={{ borderBottom: '1px solid var(--color-border)' }}
      >
        <Icon size={15} style={{ color: 'var(--color-accent)' }} />
        <h2 className="text-sm font-semibold" style={{ color: 'var(--color-text-primary)' }}>{title}</h2>
      </div>
      <div className="px-5 py-2">{children}</div>
    </div>
  );
}

export function Settings() {
  const [rules, setRules] = useState([
    { id: '1', name: 'Payment Repository', content: 'Always check:\n- Currency conversion accuracy\n- Transaction idempotency\n- Authentication and authorization\n- Sensitive data logging', enabled: true },
  ]);
  const [newRule, setNewRule] = useState('');
  const [threshold, setThreshold] = useState(2);

  const thresholdLabels = ['Info', 'Low', 'Medium', 'High', 'Critical'];
  const thresholdColors = ['var(--color-text-muted)', 'var(--color-low)', 'var(--color-medium)', 'var(--color-high)', 'var(--color-critical)'];

  return (
    <div className="p-6 max-w-3xl mx-auto">
      <div className="mb-6">
        <h1 className="text-lg font-semibold" style={{ color: 'var(--color-text-primary)' }}>Settings</h1>
        <p className="text-xs mt-0.5" style={{ color: 'var(--color-text-muted)' }}>Configure ORBITA for your workflow</p>
      </div>

      {/* GitHub */}
      <SettingsSection icon={GitFork} title="GitHub">
        <div className="py-3">
          <div className="flex items-center justify-between mb-2">
            <div>
              <div className="text-sm font-medium" style={{ color: 'var(--color-text-primary)' }}>Connected Account</div>
              <div className="text-xs mt-0.5" style={{ color: 'var(--color-text-muted)' }}>orbita-demo · 3 repositories</div>
            </div>
            <div
              className="flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-md"
              style={{ background: 'var(--color-pass-muted)', color: 'var(--color-pass)', border: '1px solid var(--color-pass-border)' }}
            >
              <div className="w-1.5 h-1.5 rounded-full" style={{ background: 'var(--color-pass)' }} />
              Connected
            </div>
          </div>
          <button
            className="text-xs px-3 py-1.5 rounded-md transition-colors hover:bg-white/5"
            style={{ color: 'var(--color-critical)', border: '1px solid var(--color-critical-border)' }}
          >
            Disconnect GitHub
          </button>
        </div>
      </SettingsSection>

      {/* AI Review */}
      <SettingsSection icon={Zap} title="AI Review">
        <Toggle label="Security Analysis" description="Detect SQL injection, auth bypass, XSS, and other security vulnerabilities" defaultOn={true} />
        <Toggle label="Performance Analysis" description="Identify N+1 queries, inefficient loops, and memory issues" defaultOn={true} />
        <Toggle label="Correctness Analysis" description="Catch bugs, logic errors, and incorrect assumptions" defaultOn={true} />
        <Toggle label="Architecture Analysis" description="Evaluate design patterns, coupling, and technical debt" defaultOn={false} />
        <Toggle label="Style Analysis" description="Minor style and convention issues (low priority)" defaultOn={false} />
      </SettingsSection>

      {/* Severity threshold */}
      <SettingsSection icon={Sliders} title="GitHub Comment Threshold">
        <div className="py-3">
          <p className="text-xs mb-4" style={{ color: 'var(--color-text-secondary)' }}>
            Only post GitHub inline comments for findings at or above this severity level.
          </p>
          <div className="flex items-center gap-3">
            <input
              type="range"
              min={0}
              max={4}
              value={threshold}
              onChange={e => setThreshold(Number(e.target.value))}
              className="flex-1"
              style={{ accentColor: thresholdColors[threshold] }}
            />
            <div
              className="text-xs font-semibold font-mono px-2.5 py-1 rounded-sm min-w-16 text-center"
              style={{
                color: thresholdColors[threshold],
                background: `${thresholdColors[threshold]}15`,
                border: `1px solid ${thresholdColors[threshold]}30`,
              }}
            >
              {thresholdLabels[threshold]}
            </div>
          </div>
        </div>
      </SettingsSection>

      {/* Custom rules */}
      <SettingsSection icon={BookOpen} title="Repository Rules">
        <div className="py-2 space-y-3">
          <p className="text-xs" style={{ color: 'var(--color-text-muted)' }}>
            Custom instructions that ORBITA incorporates into its analysis for specific repositories.
          </p>
          {rules.map(rule => (
            <div
              key={rule.id}
              className="rounded-md overflow-hidden"
              style={{ border: '1px solid var(--color-border)' }}
            >
              <div
                className="flex items-center justify-between px-3 py-2"
                style={{ background: 'var(--color-bg-elevated)', borderBottom: '1px solid var(--color-border)' }}
              >
                <span className="text-xs font-semibold" style={{ color: 'var(--color-text-primary)' }}>
                  {rule.name}
                </span>
                <div className="flex items-center gap-2">
                  <div
                    className="w-1.5 h-1.5 rounded-full"
                    style={{ background: rule.enabled ? 'var(--color-pass)' : 'var(--color-text-muted)' }}
                  />
                  <button onClick={() => setRules(r => r.filter(x => x.id !== rule.id))} style={{ color: 'var(--color-text-muted)' }}>
                    <Trash2 size={12} />
                  </button>
                </div>
              </div>
              <pre
                className="p-3 text-xs font-mono leading-relaxed"
                style={{ color: 'var(--color-text-secondary)', background: 'var(--color-bg-overlay)' }}
              >
                {rule.content}
              </pre>
            </div>
          ))}
          <button
            className="flex items-center gap-1.5 text-xs px-3 py-2 rounded-md w-full transition-colors hover:bg-white/5"
            style={{ color: 'var(--color-accent)', border: '1px dashed var(--color-accent-border)' }}
          >
            <Plus size={12} />
            Add custom rule
          </button>
        </div>
      </SettingsSection>
    </div>
  );
}
