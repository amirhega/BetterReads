import { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useUpdateProfile } from '@/hooks/useProfile';
import { GoodreadsImport } from '@/components/import/GoodreadsImport';

export function SettingsPage() {
  const { profile } = useAuth();
  const updateProfile = useUpdateProfile();

  const [displayName, setDisplayName] = useState(profile?.display_name ?? '');
  const [bio, setBio] = useState(profile?.bio ?? '');
  const [genres, setGenres] = useState(profile?.favorite_genres?.join(', ') ?? '');
  const [saved, setSaved] = useState(false);

  function handleSave(e: React.FormEvent) {
    e.preventDefault();
    updateProfile.mutate(
      {
        display_name: displayName || undefined,
        bio: bio || undefined,
        favorite_genres: genres
          .split(',')
          .map((g) => g.trim())
          .filter(Boolean),
      },
      {
        onSuccess: () => {
          setSaved(true);
          setTimeout(() => setSaved(false), 2000);
        },
      }
    );
  }

  return (
    <div className="space-y-8 max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold font-display">Settings</h1>

      {/* Profile Settings */}
      <div className="bg-surface-raised border border-surface-overlay rounded-xl p-6">
        <h2 className="text-lg font-bold font-display text-text-primary mb-4">Profile</h2>
        <form onSubmit={handleSave} className="space-y-4">
          <div>
            <label className="block text-text-secondary text-sm mb-1">Display Name</label>
            <input
              type="text"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              placeholder={profile?.username}
              className="w-full bg-surface-input border border-surface-overlay rounded-lg px-3 py-2 text-text-primary placeholder-text-muted focus:outline-none focus:ring-2 focus:ring-accent-primary/50"
            />
          </div>
          <div>
            <label className="block text-text-secondary text-sm mb-1">Bio</label>
            <textarea
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              rows={3}
              placeholder="Tell us about your reading life..."
              className="w-full bg-surface-input border border-surface-overlay rounded-lg px-3 py-2 text-text-primary placeholder-text-muted focus:outline-none focus:ring-2 focus:ring-accent-primary/50 resize-none"
            />
          </div>
          <div>
            <label className="block text-text-secondary text-sm mb-1">
              Favorite Genres (comma-separated)
            </label>
            <input
              type="text"
              value={genres}
              onChange={(e) => setGenres(e.target.value)}
              placeholder="e.g. Sci-Fi, Fantasy, Non-fiction"
              className="w-full bg-surface-input border border-surface-overlay rounded-lg px-3 py-2 text-text-primary placeholder-text-muted focus:outline-none focus:ring-2 focus:ring-accent-primary/50"
            />
          </div>
          <div className="flex items-center gap-3">
            <button
              type="submit"
              disabled={updateProfile.isPending}
              className="bg-accent-primary text-surface px-6 py-2 rounded-lg font-medium hover:bg-accent-primary/90 transition-colors disabled:opacity-50"
            >
              {updateProfile.isPending ? 'Saving...' : 'Save Changes'}
            </button>
            {saved && (
              <span className="text-accent-primary text-sm">Saved!</span>
            )}
          </div>
        </form>
      </div>

      {/* Goodreads Import */}
      <GoodreadsImport />
    </div>
  );
}
