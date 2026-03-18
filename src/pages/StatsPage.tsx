import { useReadingStats } from '@/hooks/useStats';
import clsx from 'clsx';

export function StatsPage() {
  const { data: stats, isLoading } = useReadingStats();

  if (isLoading) {
    return (
      <div className="flex justify-center py-20">
        <div className="w-8 h-8 border-2 border-accent-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!stats) {
    return (
      <div className="text-center py-20">
        <p className="text-text-muted text-lg">Start reading to see your stats!</p>
      </div>
    );
  }

  const maxMonthly = Math.max(...stats.monthlyBreakdown.map((m) => m.count), 1);

  return (
    <div className="space-y-8 max-w-3xl mx-auto">
      <h1 className="text-2xl font-bold font-display">Reading Stats</h1>

      {/* Key numbers */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          { label: 'Books Read', value: stats.totalBooksRead, color: 'text-accent-primary' },
          { label: 'Pages', value: stats.totalPages.toLocaleString(), color: 'text-accent-secondary' },
          { label: 'This Year', value: stats.booksThisYear, color: 'text-accent-tertiary' },
          { label: 'Day Streak', value: stats.currentStreak, color: 'text-accent-warm' },
        ].map((stat) => (
          <div
            key={stat.label}
            className="bg-surface-raised rounded-xl p-4 text-center border border-surface-overlay"
          >
            <div className={clsx('text-3xl font-bold', stat.color)}>{stat.value}</div>
            <div className="text-text-muted text-sm">{stat.label}</div>
          </div>
        ))}
      </div>

      {/* Monthly chart */}
      <div className="bg-surface-raised rounded-xl p-5 border border-surface-overlay">
        <h2 className="text-sm font-semibold text-text-primary mb-4">Books per Month</h2>
        <div className="flex items-end gap-2 h-32">
          {stats.monthlyBreakdown.map((m) => {
            const height = maxMonthly > 0 ? (m.count / maxMonthly) * 100 : 0;
            const monthLabel = new Date(m.month + '-01').toLocaleString('default', {
              month: 'short',
            });
            return (
              <div key={m.month} className="flex-1 flex flex-col items-center gap-1">
                <span className="text-text-muted text-[10px]">{m.count || ''}</span>
                <div
                  className="w-full bg-accent-primary/70 rounded-t transition-all"
                  style={{ height: `${Math.max(height, 2)}%` }}
                />
                <span className="text-text-muted text-[10px]">{monthLabel}</span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Two columns: genres + formats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        {/* Top Genres */}
        <div className="bg-surface-raised rounded-xl p-5 border border-surface-overlay">
          <h2 className="text-sm font-semibold text-text-primary mb-3">Top Genres</h2>
          {stats.topGenres.length === 0 ? (
            <p className="text-text-muted text-sm">No data yet</p>
          ) : (
            <div className="space-y-2">
              {stats.topGenres.map((g) => {
                const maxCount = stats.topGenres[0].count;
                const width = (g.count / maxCount) * 100;
                return (
                  <div key={g.genre} className="space-y-0.5">
                    <div className="flex items-center justify-between">
                      <span className="text-text-secondary text-xs truncate">{g.genre}</span>
                      <span className="text-text-muted text-xs ml-2">{g.count}</span>
                    </div>
                    <div className="h-1.5 bg-surface-overlay rounded-full overflow-hidden">
                      <div
                        className="h-full bg-accent-secondary rounded-full"
                        style={{ width: `${width}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Format breakdown */}
        <div className="bg-surface-raised rounded-xl p-5 border border-surface-overlay">
          <h2 className="text-sm font-semibold text-text-primary mb-3">Reading Formats</h2>
          {stats.formatBreakdown.length === 0 ? (
            <p className="text-text-muted text-sm">Log diary entries to see format stats</p>
          ) : (
            <div className="space-y-3">
              {stats.formatBreakdown.map((f) => {
                const total = stats.formatBreakdown.reduce((s, x) => s + x.count, 0);
                const pct = Math.round((f.count / total) * 100);
                const icon =
                  f.format === 'physical' ? '📖' : f.format === 'ebook' ? '📱' : '🎧';
                return (
                  <div key={f.format} className="flex items-center gap-3">
                    <span className="text-lg">{icon}</span>
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-0.5">
                        <span className="text-text-secondary text-sm capitalize">{f.format}</span>
                        <span className="text-text-muted text-xs">{pct}%</span>
                      </div>
                      <div className="h-1.5 bg-surface-overlay rounded-full overflow-hidden">
                        <div
                          className="h-full bg-accent-tertiary rounded-full"
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Mood cloud */}
      {stats.moodBreakdown.length > 0 && (
        <div className="bg-surface-raised rounded-xl p-5 border border-surface-overlay">
          <h2 className="text-sm font-semibold text-text-primary mb-3">Reading Moods</h2>
          <div className="flex flex-wrap gap-2">
            {stats.moodBreakdown.map((m) => {
              const maxMood = stats.moodBreakdown[0].count;
              const scale = 0.7 + (m.count / maxMood) * 0.6;
              return (
                <span
                  key={m.mood}
                  className="px-3 py-1.5 bg-accent-secondary/10 text-accent-secondary rounded-full"
                  style={{ fontSize: `${scale}rem` }}
                >
                  {m.mood}
                  <span className="text-text-muted ml-1 text-xs">{m.count}</span>
                </span>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
