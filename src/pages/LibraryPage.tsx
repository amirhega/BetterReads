import { useAuth } from '@/context/AuthContext';

export function LibraryPage() {
  const { profile } = useAuth();

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold font-display">
        {profile?.display_name ?? profile?.username}'s Library
      </h1>

      <div className="flex gap-2 border-b border-surface-overlay">
        {['Want to Read', 'Currently Reading', 'Read'].map((shelf) => (
          <button
            key={shelf}
            className="px-4 py-3 text-sm font-medium text-text-muted hover:text-text-primary border-b-2 border-transparent hover:border-accent-primary transition-colors"
          >
            {shelf}
          </button>
        ))}
      </div>

      <div className="text-center py-20">
        <p className="text-text-muted text-lg mb-2">Your library is empty</p>
        <p className="text-text-muted text-sm">
          Search for books and add them to your shelves
        </p>
      </div>
    </div>
  );
}
