import { NavLink, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  LayoutDashboard, GitPullRequest, FolderGit2, BookCheck,
  AlertTriangle, BarChart3, Settings, ChevronLeft, ChevronRight,
  Orbit
} from 'lucide-react';
import { useAppStore } from '@/stores/app';
import { cn } from '@/lib/utils';

const NAV_ITEMS = [
  { to: '/', icon: LayoutDashboard, label: 'Overview', exact: true },
  { to: '/pull-requests', icon: GitPullRequest, label: 'Pull Requests' },
  { to: '/repositories', icon: FolderGit2, label: 'Repositories' },
  { to: '/reviews', icon: BookCheck, label: 'Reviews' },
  { to: '/issues', icon: AlertTriangle, label: 'Issues' },
  { to: '/analytics', icon: BarChart3, label: 'Analytics' },
];

const BOTTOM_ITEMS = [
  { to: '/settings', icon: Settings, label: 'Settings' },
];

export function Sidebar() {
  const { sidebarCollapsed, setSidebarCollapsed } = useAppStore();
  const navigate = useNavigate();

  return (
    <motion.aside
      animate={{ width: sidebarCollapsed ? 56 : 240 }}
      transition={{ duration: 0.2, ease: [0.4, 0, 0.2, 1] }}
      className="h-screen flex flex-col shrink-0 relative z-30 select-none"
      style={{
        background: 'var(--color-bg-surface)',
        borderRight: '1px solid var(--color-border)',
      }}
    >
      {/* Logo Header */}
      <div
        className="h-[52px] flex items-center px-3 shrink-0 cursor-pointer transition-colors hover:bg-white/[0.02]"
        style={{ borderBottom: '1px solid var(--color-border)' }}
        onClick={() => navigate('/')}
      >
        <div className="flex items-center gap-2.5 min-w-0">
          <div
            className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0"
            style={{
              background: 'linear-gradient(135deg, #6366f1 0%, #4f46e5 100%)',
            }}
          >
            <Orbit size={15} className="text-white" />
          </div>
          <AnimatePresence>
            {!sidebarCollapsed && (
              <motion.div
                initial={{ opacity: 0, width: 0 }}
                animate={{ opacity: 1, width: 'auto' }}
                exit={{ opacity: 0, width: 0 }}
                transition={{ duration: 0.15 }}
                className="flex flex-col min-w-0 overflow-hidden"
              >
                <span
                  className="font-bold text-[13px] tracking-[0.05em] whitespace-nowrap"
                  style={{ color: 'var(--color-text-primary)' }}
                >
                  ORBITA
                </span>
                <span className="text-[9px] tracking-wide font-mono text-indigo-400/70 whitespace-nowrap leading-none uppercase">
                  AI PR SECURITY
                </span>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Main Navigation */}
      <nav className="flex-1 px-2 py-3 flex flex-col gap-0.5 overflow-y-auto">
        {NAV_ITEMS.map(item => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.exact}
            className={({ isActive }) =>
              cn(
                'flex items-center gap-2.5 rounded-lg text-[13px] font-medium transition-all duration-150 relative group',
                sidebarCollapsed ? 'px-2 py-2 justify-center' : 'px-2.5 py-[7px]',
                isActive
                  ? 'text-[var(--color-text-primary)] bg-[var(--color-accent-muted)]'
                  : 'text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] hover:bg-white/[0.03]'
              )
            }
          >
            {({ isActive }: { isActive: boolean }) => (
              <>
                {isActive && (
                  <motion.div
                    layoutId="sidebar-active-indicator"
                    className="absolute left-0 top-1.5 bottom-1.5 w-[3px] rounded-r-full"
                    style={{ background: 'var(--color-accent)' }}
                    transition={{ duration: 0.2, ease: [0.4, 0, 0.2, 1] }}
                  />
                )}
                <item.icon
                  size={16}
                  className={cn(
                    'shrink-0 transition-colors',
                    isActive ? 'text-[var(--color-accent)]' : 'group-hover:text-[var(--color-text-primary)]'
                  )}
                />
                <AnimatePresence>
                  {!sidebarCollapsed && (
                    <motion.span
                      initial={{ opacity: 0, width: 0 }}
                      animate={{ opacity: 1, width: 'auto' }}
                      exit={{ opacity: 0, width: 0 }}
                      transition={{ duration: 0.15 }}
                      className="whitespace-nowrap overflow-hidden"
                    >
                      {item.label}
                    </motion.span>
                  )}
                </AnimatePresence>
              </>
            )}
          </NavLink>
        ))}
      </nav>

      {/* Footer Section */}
      <div className="px-2 py-2.5 flex flex-col gap-0.5" style={{ borderTop: '1px solid var(--color-border)' }}>
        {BOTTOM_ITEMS.map(item => (
          <NavLink
            key={item.to}
            to={item.to}
            className={({ isActive }: { isActive: boolean }) =>
              cn(
                'flex items-center gap-2.5 rounded-lg text-[13px] font-medium transition-all duration-150 relative group',
                sidebarCollapsed ? 'px-2 py-2 justify-center' : 'px-2.5 py-[7px]',
                isActive
                  ? 'text-[var(--color-text-primary)] bg-[var(--color-accent-muted)]'
                  : 'text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] hover:bg-white/[0.03]'
              )
            }
          >
            {({ isActive }: { isActive: boolean }) => (
              <>
                <item.icon
                  size={16}
                  className={cn('shrink-0', isActive ? 'text-[var(--color-accent)]' : 'group-hover:text-[var(--color-text-primary)]')}
                />
                <AnimatePresence>
                  {!sidebarCollapsed && (
                    <motion.span
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="whitespace-nowrap"
                    >
                      {item.label}
                    </motion.span>
                  )}
                </AnimatePresence>
              </>
            )}
          </NavLink>
        ))}

        {/* Demo Mode Badge */}
        <AnimatePresence>
          {!sidebarCollapsed && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="mt-1.5 px-2.5 py-2 rounded-lg"
              style={{
                background: 'rgba(99,102,241,0.05)',
                border: '1px solid rgba(99,102,241,0.14)',
              }}
            >
              <div className="flex items-center justify-between">
                <span className="text-[9px] font-bold font-mono tracking-wider" style={{ color: 'var(--color-accent)' }}>
                  DEMO MODE
                </span>
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 status-dot-analyzing" />
              </div>
              <p className="text-[10px] mt-0.5" style={{ color: 'var(--color-text-muted)' }}>
                FastAPI + Gemini Active
              </p>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Toggle Collapse Button */}
        <button
          onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
          className={cn(
            'mt-1 flex items-center justify-center rounded-lg py-1.5 transition-colors hover:bg-white/[0.04]',
            sidebarCollapsed ? 'px-2' : 'px-3'
          )}
          style={{ color: 'var(--color-text-muted)' }}
          title={sidebarCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          {sidebarCollapsed ? <ChevronRight size={14} /> : <ChevronLeft size={14} />}
        </button>
      </div>
    </motion.aside>
  );
}
