import { cn } from '@/lib/utils';

interface SkeletonProps extends React.HTMLAttributes<HTMLDivElement> {
  className?: string;
}

export function Skeleton({ className, ...props }: SkeletonProps) {
  return (
    <div
      className={cn(
        'animate-pulse rounded-md',
        className
      )}
      style={{
        background: 'var(--color-bg-elevated)',
      }}
      {...props}
    />
  );
}

export function TableSkeleton({ rows = 5 }: { rows?: number }) {
  return (
    <div className="space-y-2.5 p-4">
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="flex items-center gap-4 py-2">
          <Skeleton className="h-4 w-12" />
          <Skeleton className="h-4 flex-1" />
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-4 w-16" />
        </div>
      ))}
    </div>
  );
}

export function CardSkeleton() {
  return (
    <div
      className="p-5 rounded-lg space-y-3"
      style={{ background: 'var(--color-bg-surface)', border: '1px solid var(--color-border)' }}
    >
      <div className="flex items-center justify-between">
        <Skeleton className="h-3 w-24" />
        <Skeleton className="h-6 w-6 rounded-md" />
      </div>
      <Skeleton className="h-7 w-16" />
      <Skeleton className="h-3 w-32" />
    </div>
  );
}
