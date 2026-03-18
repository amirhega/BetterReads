import { Link } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';

export function HomePage() {
  const { user } = useAuth();

  if (user) {
    return (
      <div className="space-y-8">
        <h1 className="text-3xl font-bold font-display">Your Feed</h1>
        <div className="text-center py-20">
          <p className="text-text-muted text-lg mb-4">
            Follow readers to see their activity here.
          </p>
          <Link
            to="/library"
            className="inline-block bg-accent-primary text-surface px-6 py-3 rounded-lg font-medium hover:bg-accent-primary/90 transition-colors"
          >
            Go to Library
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-[70vh] text-center space-y-8 px-4">
      <div className="space-y-4">
        <h1 className="text-5xl sm:text-6xl font-bold font-display text-text-primary">
          Better<span className="text-accent-primary">Reads</span>
        </h1>
        <p className="text-xl text-text-secondary max-w-lg mx-auto">
          Track your reading. Rank your favorites. Share with friends.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 max-w-2xl w-full">
        <div className="bg-surface-raised rounded-xl p-6 border border-surface-overlay">
          <div className="text-accent-tertiary text-3xl mb-3">vs</div>
          <h3 className="text-text-primary font-semibold mb-1">Rank Books</h3>
          <p className="text-text-muted text-sm">
            Compare books head-to-head to build your true ranking
          </p>
        </div>
        <div className="bg-surface-raised rounded-xl p-6 border border-surface-overlay">
          <div className="text-accent-secondary text-3xl mb-3">&#128214;</div>
          <h3 className="text-text-primary font-semibold mb-1">Reading Diary</h3>
          <p className="text-text-muted text-sm">
            Log what you read with mood, format, and notes
          </p>
        </div>
        <div className="bg-surface-raised rounded-xl p-6 border border-surface-overlay">
          <div className="text-accent-warm text-3xl mb-3">&#9733;</div>
          <h3 className="text-text-primary font-semibold mb-1">Share Cards</h3>
          <p className="text-text-muted text-sm">
            Beautiful shareable cards of your reviews and stats
          </p>
        </div>
      </div>

      <div className="flex gap-4">
        <Link
          to="/signup"
          className="bg-accent-primary text-surface px-8 py-3 rounded-lg font-medium hover:bg-accent-primary/90 transition-colors text-lg"
        >
          Get Started
        </Link>
        <Link
          to="/search"
          className="bg-surface-raised text-text-primary px-8 py-3 rounded-lg font-medium hover:bg-surface-overlay transition-colors text-lg border border-surface-overlay"
        >
          Browse Books
        </Link>
      </div>
    </div>
  );
}
