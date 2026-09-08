import { motion } from 'framer-motion';
import { BookCheck } from 'lucide-react';
import { DEMO_PRS } from '@/data/demo';
import { RiskBadge } from '@/components/ui/Badge';
import { formatRelativeTime } from '@/lib/utils';
import { useNavigate } from 'react-router-dom';

export function Reviews() {
  const navigate = useNavigate();
  const reviewed = DEMO_PRS.filter(pr => pr.status === 'complete');

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <div className="mb-6">
        <h1 className="text-lg font-semibold" style={{ color: 'var(--color-text-primary)' }}>Reviews</h1>
        <p className="text-xs mt-0.5" style={{ color: 'var(--color-text-muted)' }}>
          Published and pending ORBITA reviews
        </p>
      </div>

      <div className="space-y-3">
        {reviewed.map((pr, i) => (
          <motion.div
            key={pr.id}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.08 }}
            className="flex items-center gap-4 px-4 py-3.5 rounded-lg cursor-pointer transition-colors hover:bg-white/3"
            style={{ background: 'var(--color-bg-surface)', border: '1px solid var(--color-border)' }}
            onClick={() => navigate(`/pull-requests/${pr.id}`)}
          >
            <BookCheck size={15} style={{ color: 'var(--color-accent)' }} />
            <div className="flex-1 min-w-0">
              <div className="text-sm font-medium" style={{ color: 'var(--color-text-primary)' }}>
                {pr.repository} #{pr.number}
              </div>
              <div className="text-xs mt-0.5" style={{ color: 'var(--color-text-secondary)' }}>
                {pr.title}
              </div>
              <div className="text-[10px] mt-0.5" style={{ color: 'var(--color-text-muted)' }}>
                {formatRelativeTime(pr.updatedAt)}
              </div>
            </div>
            {pr.riskScore && <RiskBadge level={pr.riskScore.level} score={pr.riskScore.overall} />}
          </motion.div>
        ))}
      </div>
    </div>
  );
}
