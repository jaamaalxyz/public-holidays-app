interface ErrorDisplayProps {
  error: Error;
  onRetry?: () => void;
  title?: string;
}

export function ErrorDisplay({
  error,
  onRetry,
  title = 'Something went wrong',
}: ErrorDisplayProps) {
  return (
    <div className="card border-danger" role="alert">
      <div className="card-body">
        <h5 className="card-title text-danger">{title}</h5>
        <p className="card-text">
          {error.message || 'An unexpected error occurred. Please try again.'}
        </p>
        {onRetry && (
          <button onClick={onRetry} className="btn btn-primary" type="button">
            Try Again
          </button>
        )}
      </div>
    </div>
  );
}
