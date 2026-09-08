import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Command, Bell, ChevronDown, GitBranch, Orbit, Check, Sparkles } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAppStore } from '@/stores/app';
import { formatRelativeTime } from '@/lib/utils';
import { SeverityBadge } from '@/components/ui/Badge';

export function TopBar() {
  const { setCommandPaletteOpen, notifications, unreadCount, markAllRead, markRead } = useAppStore();
  const [showNotifications, setShowNotifications] = useState(false);
  const navigate = useNavigate();

  return (
    <header
      className="h-[52px] flex items-center justify-between gap-4 px-4 shrink-0 relative z-20"
      style={{
        borderBottom: '1px solid var(--color-border)',
        background: 'var(--color-bg-surface)',
      }}
    >
      {/* Left: Breadcrumbs / Quick Context Selectors */}
      <div className="flex items-center gap-2">
        <div
          className="flex items-center gap-1.5 px-2 py-1 rounded-md text-[12px] font-medium cursor-pointer transition-colors hover:bg-white/[0.03]"
          style={{
            background: 'var(--color-bg-elevated)',
            border: '1px solid var(--color-border)',
            color: 'var(--color-text-secondary)',
          }}
          onClick={() => navigate('/repositories')}
        >
          <GitBranch size={12} className="text-indigo-400 shrink-0" />
          <span className="font-mono text-[12px]" style={{ color: 'var(--color-text-primary)' }}>
            payment-service
          </span>
          <ChevronDown size={11} style={{ color: 'var(--color-text-muted)' }} />
        </div>

        <span style={{ color: 'var(--color-text-muted)' }} className="text-[11px] font-mono">/</span>

        <div
          className="flex items-center gap-1.5 px-2 py-1 rounded-md text-[12px] font-medium cursor-pointer transition-colors hover:bg-white/[0.03]"
          style={{
            background: 'var(--color-bg-elevated)',
            border: '1px solid var(--color-border)',
          }}
          onClick={() => navigate('/pull-requests/pr-142')}
        >
          <span className="font-mono text-[12px] font-bold" style={{ color: 'var(--color-accent)' }}>#142</span>
          <span className="text-[12px] max-w-[160px] truncate" style={{ color: 'var(--color-text-secondary)' }}>
            Add payment retry mechanism
          </span>
          <ChevronDown size={11} style={{ color: 'var(--color-text-muted)' }} />
        </div>
      </div>

      {/* Center: Global Search Bar */}
      <button
        className="flex items-center gap-2 px-3 py-1.5 rounded-md text-[12px] flex-1 max-w-sm transition-all hover:border-[var(--color-border-strong)]"
        style={{
          background: 'var(--color-bg-elevated)',
          border: '1px solid var(--color-border)',
          color: 'var(--color-text-muted)',
        }}
        onClick={() => setCommandPaletteOpen(true)}
      >
        <Search size={13} className="shrink-0" />
        <span className="text-[12px] flex-1 text-left truncate">Search PRs, findings, repos…</span>
        <kbd
          className="font-mono text-[10px] font-semibold px-1.5 py-0.5 rounded"
          style={{
            background: 'var(--color-bg-overlay)',
            border: '1px solid var(--color-border)',
            color: 'var(--color-text-secondary)',
          }}
        >
          ⌘K
        </kbd>
      </button>

      {/* Right: Actions, Notifications & Profile */}
      <div className="flex items-center gap-2">
        {/* Quick Command Trigger */}
        <button
          className="hidden sm:flex items-center gap-1.5 px-2 py-1.5 rounded-md text-[12px] font-medium transition-colors hover:bg-white/[0.03]"
          style={{
            background: 'var(--color-bg-elevated)',
            border: '1px solid var(--color-border)',
            color: 'var(--color-text-muted)',
          }}
          onClick={() => setCommandPaletteOpen(true)}
          title="Command Palette (Cmd+K)"
        >
          <Command size={12} />
        </button>

        {/* Notifications Dropdown */}
        <div className="relative">
          <button
            className="relative p-1.5 rounded-md transition-colors hover:bg-white/[0.03]"
            style={{ color: 'var(--color-text-secondary)' }}
            onClick={() => setShowNotifications(!showNotifications)}
            title="Notifications"
          >
            <Bell size={15} />
            {unreadCount > 0 && (
              <span
                className="absolute top-1 right-1 w-2 h-2 rounded-full ring-2 ring-[var(--color-bg-surface)]"
                style={{ background: 'var(--color-critical)' }}
              />
            )}
          </button>

          <AnimatePresence>
            {showNotifications && (
              <>
                <div
                  className="fixed inset-0 z-40"
                  onClick={() => setShowNotifications(false)}
                />
                <motion.div
                  initial={{ opacity: 0, y: -6, scale: 0.97 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -6, scale: 0.97 }}
                  transition={{ duration: 0.12 }}
                  className="absolute right-0 top-full mt-1.5 w-84 rounded-xl z-50 overflow-hidden"
                  style={{
                    background: 'var(--color-bg-elevated)',
                    border: '1px solid var(--color-border-strong)',
                    boxShadow: '0 16px 48px rgba(0,0,0,0.5)',
                  }}
                >
                  <div
                    className="flex items-center justify-between px-4 py-2.5"
                    style={{ borderBottom: '1px solid var(--color-border)' }}
                  >
                    <div className="flex items-center gap-2">
                      <Bell size={13} className="text-indigo-400" />
                      <span className="text-[12px] font-semibold" style={{ color: 'var(--color-text-primary)' }}>
                        Security Alerts & Activity
                      </span>
                    </div>
                    {unreadCount > 0 && (
                      <button
                        className="text-[11px] font-medium transition-colors hover:opacity-80 flex items-center gap-1"
                        style={{ color: 'var(--color-accent)' }}
                        onClick={markAllRead}
                      >
                        <Check size={11} />
                        Mark read
                      </button>
                    )}
                  </div>
                  <div className="max-h-72 overflow-y-auto divide-y divide-[var(--color-border-subtle)]">
                    {notifications.map((n: import('@/types').Notification) => (
                      <div
                        key={n.id}
                        className="px-4 py-2.5 cursor-pointer transition-colors hover:bg-white/[0.02]"
                        onClick={() => {
                          markRead(n.id);
                          if (n.pullRequestId) {
                            navigate(`/pull-requests/${n.pullRequestId}`);
                            setShowNotifications(false);
                          }
                        }}
                      >
                        <div className="flex items-start gap-2.5">
                          {!n.read && (
                            <div
                              className="w-1.5 h-1.5 rounded-full mt-1.5 shrink-0"
                              style={{ background: 'var(--color-accent)' }}
                            />
                          )}
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-0.5">
                              <span className="text-[12px] font-semibold truncate" style={{ color: 'var(--color-text-primary)' }}>
                                {n.title}
                              </span>
                              {n.type === 'critical_finding' && (
                                <SeverityBadge severity="critical" size="sm" />
                              )}
                            </div>
                            <p className="text-[12px] leading-relaxed" style={{ color: 'var(--color-text-secondary)' }}>
                              {n.message}
                            </p>
                            <span className="text-[10px] font-mono mt-1 block" style={{ color: 'var(--color-text-muted)' }}>
                              {formatRelativeTime(n.timestamp)}
                            </span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </motion.div>
              </>
            )}
          </AnimatePresence>
        </div>

        {/* User Profile Area */}
        <div className="flex items-center gap-2 pl-2 ml-0.5" style={{ borderLeft: '1px solid var(--color-border)' }}>
          <div
            className="w-6 h-6 rounded-full flex items-center justify-center shrink-0"
            style={{
              background: 'linear-gradient(135deg, #6366f1, #4f46e5)',
              color: 'white',
            }}
          >
            <Orbit size={12} />
          </div>
          <div className="hidden lg:block text-left">
            <div className="text-[12px] font-semibold leading-tight" style={{ color: 'var(--color-text-primary)' }}>
              Engineering Lead
            </div>
            <div className="text-[10px] font-mono leading-tight" style={{ color: 'var(--color-text-muted)' }}>
              orbita-demo
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
