import { useParams, Link } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import {
  useProfileByUsername,
  useProfileStats,
  useUserActivity,
  useFollowStatus,
  useToggleFollow,
} from '@/hooks/useProfile';
import { getCoverUrl } from '@/lib/openLibrary/covers';
import { format } from 'date-fns';

export function ProfilePage() {
  const { username } = useParams();
  const { user } = useAuth();
  const { data: profile, isLoading } = useProfileByUsername(username);
  const { data: stats } = useProfileStats(profile?.id);
  const { data: activities } = useUserActivity(profile?.id);
  const { data: isFollowing } = useFollowStatus(profile?.id);
  const toggleFollow = useToggleFollow();

  const isOwnProfile = user?.id === profile?.id;

  if (isLoading) {
    return (
      <div className="flex justify-center py-20">
        <div className="w-8 h-8 border-2 border-accent-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="text-center py-20">
        <p className="text-text-muted text-lg">User not found</p>
      </div>
    );
  }

  return (
    <div className="space-y-8 max-w-2xl mx-auto">
      {/* Header */}
      <div className="flex items-center gap-4">
        <div className="w-20 h-20 rounded-full bg-accent-primary/20 flex items-center justify-center text-accent-primary text-2xl font-bold shrink-0">
          {profile.display_name?.[0]?.toUpperCase() ?? profile.username[0].toUpperCase()}
        </div>
        <div className="flex-1">
          <h1 className="text-2xl font-bold font-display">
            {profile.display_name ?? profile.username}
          </h1>
          <p className="text-text-muted">@{profile.username}</p>
          {profile.bio && (
            <p className="text-text-secondary text-sm mt-1">{profile.bio}</p>
          )}
        </div>
        {user && !isOwnProfile && (
          <button
            onClick={() =>
              toggleFollow.mutate({
                targetUserId: profile.id,
                isFollowing: !!isFollowing,
              })
            }
            className={
              isFollowing
                ? 'px-4 py-2 rounded-lg text-sm font-medium border border-surface-overlay text-text-secondary hover:border-accent-warm hover:text-accent-warm transition-colors'
                : 'bg-accent-primary text-surface px-4 py-2 rounded-lg text-sm font-medium hover:bg-accent-primary/90 transition-colors'
            }
          >
            {isFollowing ? 'Following' : 'Follow'}
          </button>
        )}
      </div>

      {/* Favorite genres */}
      {profile.favorite_genres.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {profile.favorite_genres.map((genre) => (
            <span
              key={genre}
              className="px-2.5 py-1 bg-surface-raised text-text-muted text-xs rounded-full border border-surface-overlay"
            >
              {genre}
            </span>
          ))}
        </div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { label: 'Books Read', value: stats?.booksRead ?? 0 },
          { label: 'Reviews', value: stats?.reviews ?? 0 },
          { label: 'Rankings', value: stats?.rankings ?? 0 },
        ].map((stat) => (
          <div
            key={stat.label}
            className="bg-surface-raised rounded-xl p-4 text-center border border-surface-overlay"
          >
            <div className="text-2xl font-bold text-text-primary">{stat.value}</div>
            <div className="text-text-muted text-sm">{stat.label}</div>
          </div>
        ))}
      </div>

      {/* Recent Activity */}
      <div className="space-y-4">
        <h2 className="text-lg font-bold font-display">Recent Activity</h2>
        {(!activities || activities.length === 0) && (
          <p className="text-text-muted text-sm">No activity yet</p>
        )}
        {activities?.map((activity) => (
          <div
            key={activity.id}
            className="flex items-center gap-3 bg-surface-raised border border-surface-overlay rounded-lg p-3"
          >
            {activity.book?.cover_i && (
              <Link
                to={`/book/${activity.book.ol_work_key.replace('/works/', '')}`}
                className="shrink-0"
              >
                <img
                  src={getCoverUrl(activity.book.cover_i, 'S')}
                  alt={activity.book.title}
                  className="w-8 h-12 object-cover rounded"
                />
              </Link>
            )}
            <div className="flex-1 min-w-0">
              <p className="text-text-secondary text-sm">
                <ActivityDescription activity={activity} />
              </p>
              <p className="text-text-muted text-xs">
                {format(new Date(activity.created_at), 'MMM d, yyyy')}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function ActivityDescription({ activity }: { activity: { activity_type: string; book?: { title: string; ol_work_key: string } | null } }) {
  const bookLink = activity.book ? (
    <Link
      to={`/book/${activity.book.ol_work_key.replace('/works/', '')}`}
      className="text-text-primary font-medium hover:text-accent-primary"
    >
      {activity.book.title}
    </Link>
  ) : null;

  switch (activity.activity_type) {
    case 'shelved':
      return <>Added {bookLink} to library</>;
    case 'started_reading':
      return <>Started reading {bookLink}</>;
    case 'finished_reading':
      return <>Finished {bookLink}</>;
    case 'reviewed':
      return <>Reviewed {bookLink}</>;
    case 'ranked':
      return <>Ranked {bookLink}</>;
    case 'diary_entry':
      return <>Logged {bookLink} in diary</>;
    case 'followed_user':
      return <>Followed a reader</>;
    default:
      return <>Did something</>;
  }
}
