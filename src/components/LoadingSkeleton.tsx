interface LoadingSkeletonProps {
  className?: string;
  height?: string;
  width?: string;
}

export function LoadingSkeleton({
  className = '',
  height = '1rem',
  width = '100%',
}: LoadingSkeletonProps) {
  return (
    <div
      className={`loading-skeleton ${className}`}
      style={{
        height,
        width,
        backgroundColor: '#e2e8f0',
        borderRadius: '4px',
        animation: 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
      }}
      aria-hidden="true"
    />
  );
}

export function HolidayCardSkeleton() {
  return (
    <div className="col-12 col-6-md">
      <div className="card margin-bottom-small">
        <div className="card-body">
          <LoadingSkeleton height="1.5rem" className="margin-bottom-small" />
          <LoadingSkeleton
            height="1rem"
            width="80%"
            className="margin-bottom-small"
          />
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <LoadingSkeleton height="1.5rem" width="4rem" />
            <LoadingSkeleton height="1.5rem" width="3rem" />
          </div>
        </div>
      </div>
    </div>
  );
}

export function HolidayListSkeleton() {
  return (
    <div className="row">
      {Array.from({ length: 6 }, (_, i) => (
        <HolidayCardSkeleton key={i} />
      ))}
    </div>
  );
}
