import { useState, useEffect } from 'react';
import { Modal } from '@/components/ui/Modal';
import { StarRating } from '@/components/ui/StarRating';
import { DimensionRating } from '@/components/ui/DimensionRating';
import { MoodTagPicker } from '@/components/ui/MoodTagPicker';
import { useBookReview, useUpsertReview } from '@/hooks/useReviews';
import { RATING_DIMENSIONS } from '@/types/book';
import type { RatingDimension } from '@/types/book';

interface ReviewFormProps {
  bookId: string;
  bookTitle: string;
  open: boolean;
  onClose: () => void;
}

type DimensionRatings = Record<RatingDimension, number | null>;

const emptyDimensions: DimensionRatings = {
  writing: null,
  plot: null,
  character: null,
  pacing: null,
  enjoyment: null,
};

export function ReviewForm({ bookId, bookTitle, open, onClose }: ReviewFormProps) {
  const { data: existingReview } = useBookReview(bookId);
  const upsertReview = useUpsertReview();

  const [rating, setRating] = useState<number | null>(null);
  const [dimensions, setDimensions] = useState<DimensionRatings>({ ...emptyDimensions });
  const [moodTags, setMoodTags] = useState<string[]>([]);
  const [text, setText] = useState('');
  const [spoilers, setSpoilers] = useState(false);
  const [showDimensions, setShowDimensions] = useState(false);

  useEffect(() => {
    if (existingReview) {
      setRating(existingReview.star_rating);
      setDimensions({
        writing: existingReview.rating_writing,
        plot: existingReview.rating_plot,
        character: existingReview.rating_character,
        pacing: existingReview.rating_pacing,
        enjoyment: existingReview.rating_enjoyment,
      });
      setMoodTags(existingReview.mood_tags ?? []);
      setText(existingReview.review_text ?? '');
      setSpoilers(existingReview.contains_spoilers);
      // Auto-expand dimensions if any were previously set
      const hasDimensions = existingReview.rating_writing !== null
        || existingReview.rating_plot !== null
        || existingReview.rating_character !== null
        || existingReview.rating_pacing !== null
        || existingReview.rating_enjoyment !== null;
      setShowDimensions(hasDimensions);
    }
  }, [existingReview]);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    upsertReview.mutate(
      {
        bookId,
        starRating: rating,
        ratingWriting: dimensions.writing,
        ratingPlot: dimensions.plot,
        ratingCharacter: dimensions.character,
        ratingPacing: dimensions.pacing,
        ratingEnjoyment: dimensions.enjoyment,
        moodTags,
        reviewText: text || null,
        containsSpoilers: spoilers,
      },
      { onSuccess: onClose }
    );
  }

  return (
    <Modal open={open} onClose={onClose} title={bookTitle}>
      <form onSubmit={handleSubmit} className="space-y-5">
        {/* Overall Rating */}
        <div>
          <label className="block text-text-secondary text-sm mb-2">Overall Rating</label>
          <StarRating value={rating} onChange={setRating} size="lg" />
        </div>

        {/* Dimension Ratings (collapsible) */}
        <div>
          <button
            type="button"
            onClick={() => setShowDimensions(!showDimensions)}
            className="text-sm text-accent-primary hover:text-accent-primary/80 transition-colors"
          >
            {showDimensions ? '- Hide detailed ratings' : '+ Rate by category'}
          </button>

          {showDimensions && (
            <div className="mt-3 space-y-2.5 bg-surface-input/50 rounded-lg p-3 border border-surface-overlay">
              {RATING_DIMENSIONS.map((dim) => (
                <DimensionRating
                  key={dim.key}
                  label={dim.label}
                  description={dim.description}
                  value={dimensions[dim.key]}
                  onChange={(val) =>
                    setDimensions((prev) => ({ ...prev, [dim.key]: val }))
                  }
                />
              ))}
            </div>
          )}
        </div>

        {/* Mood Tags */}
        <div>
          <label className="block text-text-secondary text-sm mb-2">
            How did it feel?
          </label>
          <MoodTagPicker selected={moodTags} onChange={setMoodTags} />
        </div>

        {/* Review Text */}
        <div>
          <label className="block text-text-secondary text-sm mb-2">Review</label>
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            rows={4}
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
