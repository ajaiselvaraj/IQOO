import { useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, GitPullRequest, BookOpen, Settings, Zap, BarChart3, FolderOpen, X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAppStore } from '@/stores/app';
import { cn } from '@/lib/utils';

const COMMANDS = [
  {
    group: 'Navigation',
    items: [
      { id: 'dashboard', icon: BarChart3, label: 'Go to Dashboard', shortcut: 'G D', action: '/' },
      { id: 'prs', icon: GitPullRequest, label: 'View Pull Requests', shortcut: 'G P', action: '/pull-requests' },
      { id: 'repos', icon: FolderOpen, label: 'View Repositories', shortcut: 'G R', action: '/repositories' },
      { id: 'analytics', icon: BarChart3, label: 'Analytics', shortcut: 'G A', action: '/analytics' },
      { id: 'settings', icon: Settings, label: 'Settings', shortcut: 'G S', action: '/settings' },
    ],
  },
  {
    group: 'Actions',
    items: [
      { id: 'analyze', icon: Zap, label: 'Analyze PR #142', shortcut: '⌘ R', action: '/pull-requests/pr-142' },
      { id: 'demo-pr', icon: GitPullRequest, label: 'Open Demo PR', shortcut: null, action: '/pull-requests/pr-142' },
      { id: 'docs', icon: BookOpen, label: 'View Documentation', shortcut: null, action: '/settings' },
    ],
  },
];

export function CommandPalette() {
  const { commandPaletteOpen, setCommandPaletteOpen } = useAppStore();
  const navigate = useNavigate();

  const close = useCallback(() => setCommandPaletteOpen(false), [setCommandPaletteOpen]);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setCommandPaletteOpen(!commandPaletteOpen);
      }
      if (e.key === 'Escape') close();
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [commandPaletteOpen, setCommandPaletteOpen, close]);

  const handleSelect = (action: string) => {
    navigate(action);
    close();
  };

  return (
    <AnimatePresence>
      {commandPaletteOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50"
            onClick={close}
          />

          {/* Palette */}
          <motion.div
            initial={{ opacity: 0, scale: 0.96, y: -8 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: -8 }}
            transition={{ duration: 0.18, ease: [0.4, 0, 0.2, 1] }}
            className="fixed top-[20vh] left-1/2 -translate-x-1/2 w-full max-w-[560px] z-50"
          >
            <div
              className="rounded-lg shadow-2xl overflow-hidden"
              style={{
                background: 'var(--color-bg-elevated)',
                border: '1px solid var(--color-border-strong)',
                boxShadow: '0 24px 64px rgba(0,0,0,0.6), 0 0 0 1px rgba(99,102,241,0.15)',
              }}
            >
              {/* Search input */}
              <div
                className="flex items-center gap-3 px-4 py-3.5"
                style={{ borderBottom: '1px solid var(--color-border)' }}
              >
                <Search size={16} style={{ color: 'var(--color-text-secondary)' }} />
                <input
                  autoFocus
                  type="text"
                  placeholder="Search commands, PRs, repositories..."
                  className="flex-1 bg-transparent text-sm outline-none"
                  style={{
                    color: 'var(--color-text-primary)',
                    fontFamily: 'var(--font-sans)',
                  }}
                />
                <button
                  onClick={close}
                  className="p-1 rounded-sm transition-colors hover:bg-white/5"
                  style={{ color: 'var(--color-text-muted)' }}
                >
                  <X size={14} />
                </button>
              </div>

              {/* Commands */}
              <div className="py-2 max-h-[380px] overflow-y-auto">
                {COMMANDS.map(group => (
                  <div key={group.group} className="mb-2">
                    <div
                      className="px-4 py-1.5 text-[10px] font-semibold tracking-widest uppercase"
                      style={{ color: 'var(--color-text-muted)' }}
                    >
                      {group.group}
                    </div>
                    {group.items.map(item => (
                      <button
                        key={item.id}
                        onClick={() => handleSelect(item.action)}
                        className={cn(
                          'w-full flex items-center gap-3 px-4 py-2.5 text-sm text-left transition-colors',
                          'hover:bg-white/5 group'
                        )}
                      >
                        <span
                          className="p-1.5 rounded-sm transition-colors group-hover:bg-[var(--color-accent-muted)]"
                          style={{
                            background: 'var(--color-bg-overlay)',
                            color: 'var(--color-text-secondary)',
                          }}
                        >
                          <item.icon size={13} />
                        </span>
                        <span style={{ color: 'var(--color-text-primary)' }} className="flex-1">
                          {item.label}
                        </span>
                        {item.shortcut && (
                          <span
                            className="font-mono text-[10px] px-1.5 py-0.5 rounded-sm"
                            style={{
                              background: 'var(--color-bg-overlay)',
                              color: 'var(--color-text-muted)',
                              border: '1px solid var(--color-border)',
                            }}
                          >
                            {item.shortcut}
                          </span>
                        )}
                      </button>
                    ))}
                  </div>
                ))}
              </div>

              {/* Footer */}
              <div
                className="px-4 py-2.5 flex items-center gap-4 text-[10px]"
                style={{
                  borderTop: '1px solid var(--color-border)',
                  color: 'var(--color-text-muted)',
                }}
              >
                <span className="flex items-center gap-1">
                  <kbd className="font-mono px-1 py-0.5 rounded-sm" style={{ background: 'var(--color-bg-overlay)', border: '1px solid var(--color-border)' }}>↑↓</kbd>
                  Navigate
                </span>
                <span className="flex items-center gap-1">
                  <kbd className="font-mono px-1 py-0.5 rounded-sm" style={{ background: 'var(--color-bg-overlay)', border: '1px solid var(--color-border)' }}>↵</kbd>
                  Select
                </span>
                <span className="flex items-center gap-1">
                  <kbd className="font-mono px-1 py-0.5 rounded-sm" style={{ background: 'var(--color-bg-overlay)', border: '1px solid var(--color-border)' }}>Esc</kbd>
                  Close
                </span>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
