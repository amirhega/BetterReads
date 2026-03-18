import { Link } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { useFeed } from '@/hooks/useProfile';
import { getCoverUrl } from '@/lib/openLibrary/covers';
import { format } from 'date-fns';

export function HomePage() {
  const { user } = useAuth();

  if (user) {
    return <AuthenticatedFeed />;
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

function AuthenticatedFeed() {
  const { data: feedItems, isLoading } = useFeed();

  return (
    <div className="space-y-8 max-w-2xl mx-auto">
      <h1 className="text-3xl font-bold font-display">Your Feed</h1>

      {isLoading && (
        <div className="flex justify-center py-12">
          <div className="w-8 h-8 border-2 border-accent-primary border-t-transparent rounded-full animate-spin" />
        </div>
      )}

      {!isLoading && (!feedItems || feedItems.length === 0) && (
        <div className="text-center py-20 space-y-4">
          <p className="text-text-muted text-lg">
            Follow readers to see their activity here.
          </p>
          <div className="flex justify-center gap-4">
            <Link
              to="/library"
              className="inline-block bg-accent-primary text-surface px-6 py-3 rounded-lg font-medium hover:bg-accent-primary/90 transition-colors"
            >
              Go to Library
            </Link>
            <Link
              to="/search"
              className="inline-block bg-surface-raised text-text-primary px-6 py-3 rounded-lg font-medium hover:bg-surface-overlay transition-colors border border-surface-overlay"
            >
              Find Books
            </Link>
          </div>
        </div>
      )}

      {feedItems && feedItems.length > 0 && (
        <div className="space-y-4">
          {feedItems.map((item) => (
            <div
              key={item.id}
              className="bg-surface-raised border border-surface-overlay rounded-xl p-4"
            >
              <div className="flex items-start gap-3">
                {/* User avatar */}
                <Link
                  to={`/user/${item.profile?.username}`}
                  className="w-9 h-9 rounded-full bg-accent-primary/20 flex items-center justify-center text-accent-primary text-sm font-bold shrink-0"
                >
                  {item.profile?.username?.[0]?.toUpperCase() ?? 'U'}
                </Link>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <Link
                      to={`/user/${item.profile?.username}`}
                      className="text-text-primary font-medium text-sm hover:text-accent-primary"
                    >
                      {item.profile?.display_name ?? item.profile?.username}
                    </Link>
                    <span className="text-text-muted text-xs">
                      {format(new Date(item.created_at), 'MMM d')}
                    </span>
                  </div>
                  <p className="text-text-secondary text-sm mt-0.5">
                    {activityLabel(item.activity_type)}
                  </p>
                </div>

                {/* Book cover */}
                {item.book?.cover_i && (
                  <Link
                    to={`/book/${item.book.ol_work_key.replace('/works/', '')}`}
                    className="shrink-0"
                  >
                    <img
                      src={getCoverUrl(item.book.cover_i, 'S')}
                      alt={item.book.title}
                      className="w-10 h-14 object-cover rounded shadow"
                    />
                  </Link>
                )}
              </div>

              {item.book && (
                <Link
                  to={`/book/${item.book.ol_work_key.replace('/works/', '')}`}
                  className="block mt-2 text-text-primary text-sm font-medium hover:text-accent-primary"
                >
                  {item.book.title}
                </Link>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function activityLabel(type: string): string {
  switch (type) {
    case 'shelved': return 'added a book to their library';
    case 'started_reading': return 'started reading';
    case 'finished_reading': return 'finished reading';
    case 'reviewed': return 'wrote a review';
    case 'ranked': return 'ranked a book';
    case 'diary_entry': return 'logged a reading session';
    case 'followed_user': return 'followed a reader';
    default: return 'was active';
  }
}
