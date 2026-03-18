import { useParams } from 'react-router-dom';

export function ProfilePage() {
  const { username } = useParams();

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <div className="w-20 h-20 rounded-full bg-accent-primary/20 flex items-center justify-center text-accent-primary text-2xl font-bold">
          {username?.[0]?.toUpperCase() ?? 'U'}
        </div>
        <div>
          <h1 className="text-2xl font-bold font-display">@{username}</h1>
          <p className="text-text-muted">Reader</p>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-4">
        {[
          { label: 'Books Read', value: '0' },
          { label: 'Reviews', value: '0' },
          { label: 'Rankings', value: '0' },
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
    </div>
  );
}
