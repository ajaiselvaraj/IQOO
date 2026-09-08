import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Command, Bell, ChevronDown, GitBranch, Orbit } from 'lucide-react';
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
      className="h-14 flex items-center gap-3 px-4 shrink-0"
      style={{
        borderBottom: '1px solid var(--color-border)',
        background: 'var(--color-bg-surface)',
      }}
    >
      {/* Repo + PR selectors */}
      <div className="flex items-center gap-2 mr-2">
        <div
          className="flex items-center gap-2 px-3 py-1.5 rounded-md text-sm cursor-pointer transition-colors hover:bg-white/5"
          style={{
            background: 'var(--color-bg-elevated)',
            border: '1px solid var(--color-border)',
            color: 'var(--color-text-secondary)',
          }}
          onClick={() => navigate('/repositories')}
        >
          <GitBranch size={13} />
          <span className="font-medium text-xs" style={{ color: 'var(--color-text-primary)' }}>
            payment-service
          </span>
          <ChevronDown size={12} style={{ color: 'var(--color-text-muted)' }} />
        </div>

        <span style={{ color: 'var(--color-text-muted)' }} className="text-xs">/</span>

        <div
          className="flex items-center gap-2 px-3 py-1.5 rounded-md text-sm cursor-pointer transition-colors hover:bg-white/5"
          style={{
            background: 'var(--color-bg-elevated)',
            border: '1px solid var(--color-border)',
          }}
          onClick={() => navigate('/pull-requests/pr-142')}
        >
          <span className="font-mono text-xs" style={{ color: 'var(--color-accent)' }}>#142</span>
          <span className="text-xs max-w-[180px] truncate" style={{ color: 'var(--color-text-secondary)' }}>
            Add payment retry mechanism
          </span>
          <ChevronDown size={12} style={{ color: 'var(--color-text-muted)' }} />
        </div>
      </div>

      {/* Search */}
      <button
        className="flex items-center gap-2.5 px-3 py-1.5 rounded-md text-sm flex-1 max-w-xs transition-colors hover:bg-white/5"
        style={{
          background: 'var(--color-bg-elevated)',
          border: '1px solid var(--color-border)',
          color: 'var(--color-text-muted)',
        }}
        onClick={() => setCommandPaletteOpen(true)}
      >
        <Search size={13} />
        <span className="text-xs flex-1 text-left">Search PRs, findings, files...</span>
        <kbd
          className="font-mono text-[10px] px-1.5 py-0.5 rounded-sm"
          style={{
            background: 'var(--color-bg-overlay)',
            border: '1px solid var(--color-border)',
          }}
        >
          ⌘K
        </kbd>
      </button>

      {/* Right side */}
      <div className="ml-auto flex items-center gap-2">
        {/* Command palette shortcut */}
        <button
          className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-md text-xs transition-colors hover:bg-white/5"
          style={{
            background: 'var(--color-bg-elevated)',
            border: '1px solid var(--color-border)',
            color: 'var(--color-text-muted)',
          }}
          onClick={() => setCommandPaletteOpen(true)}
        >
          <Command size={12} />
          <span>K</span>
        </button>

        {/* Notifications */}
        <div className="relative">
          <button
            className="relative p-2 rounded-md transition-colors hover:bg-white/5"
            style={{ color: 'var(--color-text-secondary)' }}
            onClick={() => setShowNotifications(!showNotifications)}
          >
            <Bell size={15} />
            {unreadCount > 0 && (
              <span
                className="absolute top-1 right-1 w-2 h-2 rounded-full"
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
                  initial={{ opacity: 0, y: -8, scale: 0.96 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -8, scale: 0.96 }}
                  transition={{ duration: 0.15 }}
                  className="absolute right-0 top-full mt-2 w-80 rounded-lg z-50 overflow-hidden"
                  style={{
                    background: 'var(--color-bg-elevated)',
                    border: '1px solid var(--color-border-strong)',
                    boxShadow: '0 16px 48px rgba(0,0,0,0.5)',
                  }}
                >
                  <div
                    className="flex items-center justify-between px-4 py-3"
                    style={{ borderBottom: '1px solid var(--color-border)' }}
                  >
                    <span className="text-sm font-semibold" style={{ color: 'var(--color-text-primary)' }}>
                      Notifications
                    </span>
                    {unreadCount > 0 && (
                      <button
                        className="text-xs transition-colors hover:opacity-80"
                        style={{ color: 'var(--color-accent)' }}
                        onClick={markAllRead}
                      >
                        Mark all read
                      </button>
                    )}
                  </div>
                  <div className="max-h-80 overflow-y-auto">
                    {notifications.map((n: import('@/types').Notification) => (
                      <div
                        key={n.id}
                        className="px-4 py-3 cursor-pointer transition-colors hover:bg-white/3"
                        style={{ borderBottom: '1px solid var(--color-border-subtle)' }}
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
                              <span className="text-xs font-medium" style={{ color: 'var(--color-text-primary)' }}>
                                {n.title}
                              </span>
                              {n.type === 'critical_finding' && (
                                <SeverityBadge severity="critical" size="sm" />
                              )}
                            </div>
                            <p className="text-xs leading-relaxed" style={{ color: 'var(--color-text-secondary)' }}>
                              {n.message}
                            </p>
                            <span className="text-[10px] mt-1 block" style={{ color: 'var(--color-text-muted)' }}>
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

        {/* User avatar */}
        <div className="flex items-center gap-2.5 pl-2" style={{ borderLeft: '1px solid var(--color-border)' }}>
          <div
            className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold"
            style={{
              background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
              color: 'white',
            }}
          >
            <Orbit size={14} />
          </div>
          <div className="hidden md:block">
            <div className="text-xs font-medium" style={{ color: 'var(--color-text-primary)' }}>Demo User</div>
            <div className="text-[10px]" style={{ color: 'var(--color-text-muted)' }}>orbita-demo</div>
          </div>
        </div>
      </div>
    </header>
  );
}
