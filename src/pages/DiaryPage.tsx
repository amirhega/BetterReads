import { useState } from 'react';
import { Link } from 'react-router-dom';
import { format } from 'date-fns';
import { useDiary, useDeleteDiaryEntry } from '@/hooks/useDiary';
import { getCoverUrl } from '@/lib/openLibrary/covers';
import { DiaryEntryForm } from '@/components/diary/DiaryEntryForm';
import { SHELF_LABELS } from '@/config/constants';

export function DiaryPage() {
  const { data: entries, isLoading } = useDiary();
  const deleteEntry = useDeleteDiaryEntry();
  const [showForm, setShowForm] = useState(false);

  // Group entries by month
  const grouped = entries?.reduce<Record<string, typeof entries>>((acc, entry) => {
    const month = format(new Date(entry.read_date), 'MMMM yyyy');
    if (!acc[month]) acc[month] = [];
    acc[month].push(entry);
    return acc;
  }, {});

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold font-display">Reading Diary</h1>
        <button
          onClick={() => setShowForm(true)}
          className="bg-accent-primary text-surface px-4 py-2 rounded-lg text-sm font-medium hover:bg-accent-primary/90 transition-colors"
        >
          + Log Entry
        </button>
      </div>

      {isLoading && (
        <div className="flex justify-center py-12">
          <div className="w-8 h-8 border-2 border-accent-primary border-t-transparent rounded-full animate-spin" />
        </div>
      )}

      {!isLoading && (!entries || entries.length === 0) && (
        <div className="text-center py-20">
          <p className="text-text-muted text-lg mb-2">No diary entries yet</p>
          <p className="text-text-muted text-sm mb-4">
            Log your reading sessions to see them here
          </p>
          <button
            onClick={() => setShowForm(true)}
            className="text-accent-primary text-sm hover:underline"
          >
            Log your first entry
          </button>
        </div>
      )}

      {grouped &&
        Object.entries(grouped).map(([month, monthEntries]) => (
          <div key={month} className="space-y-3">
            <h2 className="text-lg font-semibold text-text-primary font-display">{month}</h2>
            {monthEntries.map((entry) => (
              <div
                key={entry.id}
                className="flex gap-4 bg-surface-raised border border-surface-overlay rounded-xl p-4"
              >
                {/* Cover */}
                <Link
                  to={`/book/${entry.book?.ol_work_key?.replace('/works/', '')}`}
                  className="shrink-0"
                >
                  {entry.book?.cover_i ? (
                    <img
                      src={getCoverUrl(entry.book.cover_i, 'S')}
                      alt={entry.book.title}
                      className="w-12 h-18 rounded object-cover"
                    />
                  ) : (
                    <div className="w-12 h-18 bg-surface-overlay rounded flex items-center justify-center">
                      <span className="text-text-muted text-xs">?</span>
                    </div>
                  )}
                </Link>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <Link
                        to={`/book/${entry.book?.ol_work_key?.replace('/works/', '')}`}
                        className="text-text-primary font-medium text-sm hover:text-accent-primary"
                      >
                        {entry.book?.title}
                      </Link>
                      <p className="text-text-muted text-xs">
                        {format(new Date(entry.read_date), 'EEEE, MMM d')}
                        {entry.format && ` \u00B7 ${entry.format}`}
                        {entry.is_reread && ' \u00B7 re-read'}
                        {entry.is_finished && ' \u00B7 finished'}
                      </p>
                    </div>
                    <button
                      onClick={() => deleteEntry.mutate(entry.id)}
                      className="text-text-muted hover:text-accent-warm text-xs shrink-0"
                    >
                      Delete
                    </button>
                  </div>

                  {/* Mood tags */}
                  {entry.mood_tags.length > 0 && (
                    <div className="flex flex-wrap gap-1 mt-2">
                      {entry.mood_tags.map((tag) => (
                        <span
                          key={tag}
                          className="px-2 py-0.5 bg-accent-secondary/10 text-accent-secondary text-[10px] rounded-full"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  )}

                  {entry.notes && (
                    <p className="text-text-secondary text-sm mt-2">{entry.notes}</p>
                  )}
                </div>
              </div>
            ))}
          </div>
        ))}

      <DiaryEntryForm open={showForm} onClose={() => setShowForm(false)} />
    </div>
  );
}
