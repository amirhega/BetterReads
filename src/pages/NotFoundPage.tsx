import { Link } from 'react-router-dom';

export function NotFoundPage() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[50vh] text-center">
      <h1 className="text-6xl font-bold font-display text-text-muted mb-4">404</h1>
      <p className="text-text-secondary text-lg mb-6">Page not found</p>
      <Link
        to="/"
        className="bg-accent-primary text-surface px-6 py-3 rounded-lg font-medium hover:bg-accent-primary/90 transition-colors"
      >
        Go Home
      </Link>
    </div>
  );
}
