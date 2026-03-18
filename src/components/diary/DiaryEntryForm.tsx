import { useState } from 'react';
import { Modal } from '@/components/ui/Modal';
import { useLibrary } from '@/hooks/useLibrary';
import { useAddDiaryEntry } from '@/hooks/useDiary';
import { MOOD_TAGS, READING_FORMATS } from '@/config/constants';
import type { ReadingFormat } from '@/types/book';
import clsx from 'clsx';

interface DiaryEntryFormProps {
  open: boolean;
  onClose: () => void;
}

export function DiaryEntryForm({ open, onClose }: DiaryEntryFormProps) {
  const { data: libraryBooks } = useLibrary();
  const addEntry = useAddDiaryEntry();

  const [bookId, setBookId] = useState('');
  const [readDate, setReadDate] = useState(new Date().toISOString().slice(0, 10));
  const [format, setFormat] = useState<ReadingFormat | null>(null);
  const [selectedMoods, setSelectedMoods] = useState<string[]>([]);
  const [notes, setNotes] = useState('');
  const [isReread, setIsReread] = useState(false);
  const [isFinished, setIsFinished] = useState(false);

  function toggleMood(tag: string) {
    setSelectedMoods((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]
    );
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!bookId) return;

    addEntry.mutate(
      {
        bookId,
        readDate,
        format,
        moodTags: selectedMoods,
        notes: notes || null,
        isReread,
        isFinished,
      },
      {
        onSuccess: () => {
          setBookId('');
          setNotes('');
          setSelectedMoods([]);
          setFormat(null);
          setIsReread(false);
          setIsFinished(false);
          onClose();
        },
      }
    );
  }

  return (
    <Modal open={open} onClose={onClose} title="Log Reading Session">
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Book select */}
        <div>
          <label className="block text-text-secondary text-sm mb-1">Book</label>
          <select
            value={bookId}
            onChange={(e) => setBookId(e.target.value)}
            required
            className="w-full bg-surface-input border border-surface-overlay rounded-lg px-3 py-2 text-text-primary focus:outline-none focus:ring-2 focus:ring-accent-primary/50"
          >
            <option value="">Select a book...</option>
            {libraryBooks?.map((entry) => (
              <option key={entry.book_id} value={entry.book_id}>
                {entry.book?.title}
              </option>
            ))}
          </select>
        </div>

        {/* Date */}
        <div>
          <label className="block text-text-secondary text-sm mb-1">Date</label>
          <input
            type="date"
            value={readDate}
            onChange={(e) => setReadDate(e.target.value)}
            className="w-full bg-surface-input border border-surface-overlay rounded-lg px-3 py-2 text-text-primary focus:outline-none focus:ring-2 focus:ring-accent-primary/50"
          />
        </div>

        {/* Format */}
        <div>
          <label className="block text-text-secondary text-sm mb-1">Format</label>
          <div className="flex gap-2">
            {READING_FORMATS.map((f) => (
              <button
                key={f.value}
                type="button"
                onClick={() => setFormat(f.value as ReadingFormat)}
                className={clsx(
                  'px-3 py-1.5 rounded-lg text-sm border transition-colors',
                  format === f.value
                    ? 'border-accent-primary bg-accent-primary/10 text-accent-primary'
                    : 'border-surface-overlay text-text-muted hover:border-text-muted'
                )}
              >
                {f.icon} {f.label}
              </button>
            ))}
          </div>
        </div>

        {/* Mood tags */}
        <div>
          <label className="block text-text-secondary text-sm mb-1">Mood</label>
          <div className="flex flex-wrap gap-1.5">
            {MOOD_TAGS.map((tag) => (
              <button
                key={tag}
                type="button"
                onClick={() => toggleMood(tag)}
                className={clsx(
                  'px-2.5 py-1 rounded-full text-xs border transition-colors',
                  selectedMoods.includes(tag)
                    ? 'border-accent-secondary bg-accent-secondary/10 text-accent-secondary'
                    : 'border-surface-overlay text-text-muted hover:border-text-muted'
                )}
              >
                {tag}
              </button>
            ))}
          </div>
        </div>

        {/* Notes */}
        <div>
          <label className="block text-text-secondary text-sm mb-1">Notes</label>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            rows={3}
            placeholder="How was the session?"
            className="w-full bg-surface-input border border-surface-overlay rounded-lg px-3 py-2 text-text-primary placeholder-text-muted focus:outline-none focus:ring-2 focus:ring-accent-primary/50 resize-none"
          />
        </div>

        {/* Checkboxes */}
        <div className="flex gap-6">
          <label className="flex items-center gap-2 text-sm text-text-secondary">
            <input
              type="checkbox"
              checked={isReread}
              onChange={(e) => setIsReread(e.target.checked)}
            />
            Re-read
          </label>
          <label className="flex items-center gap-2 text-sm text-text-secondary">
            <input
              type="checkbox"
              checked={isFinished}
              onChange={(e) => setIsFinished(e.target.checked)}
            />
            Finished
          </label>
        </div>

        <div className="flex justify-end gap-3 pt-2">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-text-muted hover:text-text-primary text-sm transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={!bookId || addEntry.isPending}
            className="bg-accent-primary text-surface px-6 py-2 rounded-lg font-medium hover:bg-accent-primary/90 transition-colors disabled:opacity-50"
          >
            {addEntry.isPending ? 'Saving...' : 'Log Entry'}
          </button>
        </div>
      </form>
    </Modal>
  );
}
