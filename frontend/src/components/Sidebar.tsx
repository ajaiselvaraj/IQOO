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
      animate={{ width: sidebarCollapsed ? 56 : 220 }}
      transition={{ duration: 0.2, ease: [0.4, 0, 0.2, 1] }}
      className="h-screen flex flex-col shrink-0 relative"
      style={{
        background: 'var(--color-bg-surface)',
        borderRight: '1px solid var(--color-border)',
      }}
    >
      {/* Logo */}
      <div
        className="h-14 flex items-center px-3 shrink-0 cursor-pointer"
        style={{ borderBottom: '1px solid var(--color-border)' }}
        onClick={() => navigate('/')}
      >
        <div className="flex items-center gap-2.5 min-w-0">
          <div
            className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0"
            style={{
              background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
              boxShadow: '0 0 12px rgba(99,102,241,0.4)',
            }}
          >
            <Orbit size={15} className="text-white" />
          </div>
          <AnimatePresence>
            {!sidebarCollapsed && (
              <motion.span
                initial={{ opacity: 0, width: 0 }}
                animate={{ opacity: 1, width: 'auto' }}
                exit={{ opacity: 0, width: 0 }}
                transition={{ duration: 0.2 }}
                className="font-semibold text-sm tracking-tight whitespace-nowrap overflow-hidden"
                style={{ color: 'var(--color-text-primary)', letterSpacing: '0.02em' }}
              >
                ORBITA
              </motion.span>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Nav items */}
      <nav className="flex-1 px-2 py-3 flex flex-col gap-0.5 overflow-y-auto">
        {NAV_ITEMS.map(item => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.exact}
            className={({ isActive }) =>
              cn(
                'flex items-center gap-2.5 rounded-md text-sm transition-all duration-150 relative',
                sidebarCollapsed ? 'px-2 py-2 justify-center' : 'px-2.5 py-2',
                isActive
                  ? 'text-[var(--color-text-primary)] bg-[var(--color-accent-muted)]'
                  : 'text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] hover:bg-white/4'
              )
            }
          >
            {({ isActive }: { isActive: boolean }) => (
              <>
                {isActive && (
                  <motion.div
                    layoutId="nav-indicator"
                    className="absolute left-0 top-1 bottom-1 w-0.5 rounded-full"
                    style={{ background: 'var(--color-accent)' }}
                    transition={{ duration: 0.2, ease: [0.4, 0, 0.2, 1] }}
                  />
                )}
                <item.icon
                  size={16}
                  className={cn(
                    'shrink-0 transition-colors',
                    isActive ? 'text-[var(--color-accent)]' : ''
                  )}
                />
                <AnimatePresence>
                  {!sidebarCollapsed && (
                    <motion.span
                      initial={{ opacity: 0, width: 0 }}
                      animate={{ opacity: 1, width: 'auto' }}
                      exit={{ opacity: 0, width: 0 }}
                      transition={{ duration: 0.15 }}
                      className="whitespace-nowrap overflow-hidden font-medium"
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

      {/* Bottom section */}
      <div className="px-2 py-3 flex flex-col gap-0.5" style={{ borderTop: '1px solid var(--color-border)' }}>
        {BOTTOM_ITEMS.map(item => (
          <NavLink
            key={item.to}
            to={item.to}
            className={({ isActive }: { isActive: boolean }) =>
              cn(
                'flex items-center gap-2.5 rounded-md text-sm transition-all duration-150',
                sidebarCollapsed ? 'px-2 py-2 justify-center' : 'px-2.5 py-2',
                isActive
                  ? 'text-[var(--color-text-primary)] bg-[var(--color-accent-muted)]'
                  : 'text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] hover:bg-white/4'
              )
            }
          >
            {({ isActive }: { isActive: boolean }) => (
              <>
                <item.icon
                  size={16}
                  className={cn('shrink-0', isActive ? 'text-[var(--color-accent)]' : '')}
                />
                <AnimatePresence>
                  {!sidebarCollapsed && (
                    <motion.span
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="whitespace-nowrap font-medium"
                    >
                      {item.label}
                    </motion.span>
                  )}
                </AnimatePresence>
              </>
            )}
          </NavLink>
        ))}

        {/* Demo badge */}
        <AnimatePresence>
          {!sidebarCollapsed && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="mt-2 mx-0.5 px-2.5 py-1.5 rounded-md"
              style={{
                background: 'rgba(99,102,241,0.08)',
                border: '1px solid rgba(99,102,241,0.2)',
              }}
            >
              <div className="text-[10px] font-semibold tracking-wider" style={{ color: 'var(--color-accent)' }}>
                DEMO MODE
              </div>
              <div className="text-[10px] mt-0.5" style={{ color: 'var(--color-text-muted)' }}>
                Simulated data
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Collapse button */}
        <button
          onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
          className={cn(
            'mt-1 flex items-center justify-center rounded-md py-1.5 transition-colors hover:bg-white/5',
            sidebarCollapsed ? 'px-2' : 'px-2.5'
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
