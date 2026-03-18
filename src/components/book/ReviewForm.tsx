import { useState, useEffect } from 'react';
import { Modal } from '@/components/ui/Modal';
import { StarRating } from '@/components/ui/StarRating';
import { useBookReview, useUpsertReview } from '@/hooks/useReviews';

interface ReviewFormProps {
  bookId: string;
  bookTitle: string;
  open: boolean;
  onClose: () => void;
}

export function ReviewForm({ bookId, bookTitle, open, onClose }: ReviewFormProps) {
  const { data: existingReview } = useBookReview(bookId);
  const upsertReview = useUpsertReview();

  const [rating, setRating] = useState<number | null>(null);
  const [text, setText] = useState('');
  const [spoilers, setSpoilers] = useState(false);

  useEffect(() => {
    if (existingReview) {
      setRating(existingReview.star_rating);
      setText(existingReview.review_text ?? '');
      setSpoilers(existingReview.contains_spoilers);
    }
  }, [existingReview]);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    upsertReview.mutate(
      {
        bookId,
        starRating: rating,
        reviewText: text || null,
        containsSpoilers: spoilers,
      },
      { onSuccess: onClose }
    );
  }

  return (
    <Modal open={open} onClose={onClose} title={bookTitle}>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-text-secondary text-sm mb-2">Rating</label>
          <StarRating value={rating} onChange={setRating} size="lg" />
        </div>

        <div>
          <label className="block text-text-secondary text-sm mb-2">Review</label>
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            rows={5}
            placeholder="What did you think?"
            className="w-full bg-surface-input border border-surface-overlay rounded-lg px-3 py-2 text-text-primary placeholder-text-muted focus:outline-none focus:ring-2 focus:ring-accent-primary/50 resize-none"
          />
        </div>

        <label className="flex items-center gap-2 text-sm text-text-secondary">
          <input
            type="checkbox"
            checked={spoilers}
            onChange={(e) => setSpoilers(e.target.checked)}
            className="rounded border-surface-overlay"
          />
          Contains spoilers
        </label>

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
            disabled={upsertReview.isPending}
            className="bg-accent-primary text-surface px-6 py-2 rounded-lg font-medium hover:bg-accent-primary/90 transition-colors disabled:opacity-50"
          >
            {upsertReview.isPending ? 'Saving...' : existingReview ? 'Update' : 'Save'}
          </button>
        </div>
      </form>
    </Modal>
  );
}
