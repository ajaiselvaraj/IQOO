import { create } from 'zustand';
import type { Notification, PullRequest, Repository } from '@/types';
import {
  DEMO_NOTIFICATIONS,
  DEMO_PRS,
  DEMO_REPOSITORIES,
  DEMO_PR,
  DEMO_FINDINGS,
  DEMO_ANALYSIS_RUN,
  DEMO_RISK_SCORE,
} from '@/data/demo';

interface AppState {
  // Navigation
  sidebarCollapsed: boolean;
  setSidebarCollapsed: (v: boolean) => void;

  // Command palette
  commandPaletteOpen: boolean;
  setCommandPaletteOpen: (v: boolean) => void;

  // Current selections
  currentRepoId: string | null;
  currentPRId: string | null;
  setCurrentRepo: (id: string | null) => void;
  setCurrentPR: (id: string | null) => void;

  // Data (demo mode)
  repositories: Repository[];
  pullRequests: PullRequest[];
  notifications: Notification[];
  unreadCount: number;
  markAllRead: () => void;
  markRead: (id: string) => void;

  // Demo analysis state
  isAnalyzing: boolean;
  analysisProgress: number;
  currentStageIndex: number;
  startDemoAnalysis: () => void;

  // Demo mode flag
  isDemoMode: boolean;
}

export const useAppStore = create<AppState>()((set) => ({
  sidebarCollapsed: false,
  setSidebarCollapsed: (v) => set({ sidebarCollapsed: v }),

  commandPaletteOpen: false,
  setCommandPaletteOpen: (v) => set({ commandPaletteOpen: v }),

  currentRepoId: 'repo-001',
  currentPRId: 'pr-142',
  setCurrentRepo: (id) => set({ currentRepoId: id }),
  setCurrentPR: (id) => set({ currentPRId: id }),

  repositories: DEMO_REPOSITORIES,
  pullRequests: DEMO_PRS,
  notifications: DEMO_NOTIFICATIONS,
  unreadCount: DEMO_NOTIFICATIONS.filter(n => !n.read).length,
  markAllRead: () => set(state => ({
    notifications: state.notifications.map(n => ({ ...n, read: true })),
    unreadCount: 0,
  })),
  markRead: (id) => set(state => {
    const updated = state.notifications.map(n => n.id === id ? { ...n, read: true } : n);
    return { notifications: updated, unreadCount: updated.filter(n => !n.read).length };
  }),

  isAnalyzing: false,
  analysisProgress: 0,
  currentStageIndex: -1,

  startDemoAnalysis: () => {
    set({ isAnalyzing: true, analysisProgress: 0, currentStageIndex: 0 });
    const stages = DEMO_ANALYSIS_RUN.stages;
    let idx = 0;
    const advance = () => {
      if (idx >= stages.length) {
        set({ isAnalyzing: false, currentStageIndex: stages.length - 1, analysisProgress: 100 });
        return;
      }
      set({ currentStageIndex: idx, analysisProgress: Math.round((idx / stages.length) * 100) });
      idx++;
      const delay = idx === 5 ? 2800 : 900; // AI reasoning step takes longer
      setTimeout(advance, delay);
    };
    advance();
  },

  isDemoMode: true,
}));

// Selectors
export const useDemoPR = () => DEMO_PR;
export const useDemoFindings = () => DEMO_FINDINGS;
export const useDemoAnalysisRun = () => DEMO_ANALYSIS_RUN;
export const useDemoRiskScore = () => DEMO_RISK_SCORE;
