import { Suspense, lazy } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AppLayout } from '@/components/AppLayout';

const Landing = lazy(() => import('@/pages/Landing').then(m => ({ default: m.Landing })));
const Dashboard = lazy(() => import('@/pages/Dashboard').then(m => ({ default: m.Dashboard })));
const PRAnalysis = lazy(() => import('@/pages/PRAnalysis').then(m => ({ default: m.PRAnalysis })));
const PRList = lazy(() => import('@/pages/PRList').then(m => ({ default: m.PRList })));
const RepositoryList = lazy(() => import('@/pages/RepositoryList').then(m => ({ default: m.RepositoryList })));
const Analytics = lazy(() => import('@/pages/Analytics').then(m => ({ default: m.Analytics })));
const Settings = lazy(() => import('@/pages/Settings').then(m => ({ default: m.Settings })));
const Reviews = lazy(() => import('@/pages/Reviews').then(m => ({ default: m.Reviews })));
const Issues = lazy(() => import('@/pages/Issues').then(m => ({ default: m.Issues })));

function PageLoader() {
  return (
    <div className="flex items-center justify-center h-full" style={{ color: 'var(--color-text-muted)' }}>
      <div className="w-6 h-6 border-2 border-[var(--color-accent)] border-t-transparent rounded-full animate-spin" />
    </div>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <Suspense fallback={<PageLoader />}>
        <Routes>
          {/* Landing page — no app shell */}
          <Route path="/landing" element={<Landing />} />

          {/* App shell routes */}
          <Route element={<AppLayout />}>
            <Route path="/" element={<Dashboard />} />
            <Route path="/pull-requests" element={<PRList />} />
            <Route path="/pull-requests/:id" element={<PRAnalysis />} />
            <Route path="/repositories" element={<RepositoryList />} />
            <Route path="/reviews" element={<Reviews />} />
            <Route path="/issues" element={<Issues />} />
            <Route path="/analytics" element={<Analytics />} />
            <Route path="/settings" element={<Settings />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Route>
        </Routes>
      </Suspense>
    </BrowserRouter>
  );
}
