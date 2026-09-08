import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { DEMO_FINDINGS } from '@/data/demo';
import { SeverityBadge } from '@/components/ui/Badge';

export function Issues() {
  const navigate = useNavigate();
  const open = DEMO_FINDINGS.filter(f => f.status === 'open');

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <div className="mb-6">
        <h1 className="text-lg font-semibold" style={{ color: 'var(--color-text-primary)' }}>Issues</h1>
        <p className="text-xs mt-0.5" style={{ color: 'var(--color-text-muted)' }}>
          {open.length} open findings across all repositories
        </p>
      </div>

      <div className="space-y-2">
        {open.map((f, i) => (
          <motion.div
            key={f.id}
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.06 }}
            className="flex items-start gap-3 px-4 py-3 rounded-lg cursor-pointer transition-colors hover:bg-white/3"
            style={{ background: 'var(--color-bg-surface)', border: '1px solid var(--color-border)' }}
            onClick={() => navigate('/pull-requests/pr-142')}
          >
            <SeverityBadge severity={f.severity} size="sm" />
            <div className="flex-1 min-w-0">
              <div className="text-sm font-medium" style={{ color: 'var(--color-text-primary)' }}>
                {f.title}
              </div>
              <div className="flex items-center gap-2 text-[10px] mt-0.5" style={{ color: 'var(--color-text-muted)' }}>
                <code className="font-mono" style={{ color: 'var(--color-accent)' }}>
                  {f.file}:{f.line}
                </code>
                <span>·</span>
                <span className="capitalize">{f.category}</span>
                <span>·</span>
                <span className="font-mono" style={{ color: 'var(--color-text-secondary)' }}>
                  {f.confidence}% confidence
                </span>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
