import { useRef, useState } from 'react';
import { toPng } from 'html-to-image';
import { getCoverUrl } from '@/lib/openLibrary/covers';
import { StarRating } from '@/components/ui/StarRating';
import type { RankedBook, Review, Book } from '@/types/book';

interface ShareableReviewCardProps {
  review: Review;
  book: Book;
  username: string;
}

export function ShareableReviewCard({ review, book, username }: ShareableReviewCardProps) {
  const cardRef = useRef<HTMLDivElement>(null);
  const [exporting, setExporting] = useState(false);

  async function handleExport() {
    if (!cardRef.current) return;
    setExporting(true);
    try {
      const dataUrl = await toPng(cardRef.current, {
        pixelRatio: 2,
        backgroundColor: '#14181c',
      });
      const link = document.createElement('a');
      link.download = `betterreads-review-${book.title.slice(0, 20)}.png`;
      link.href = dataUrl;
      link.click();
    } finally {
      setExporting(false);
    }
  }

  return (
    <div className="space-y-3">
      {/* The card */}
      <div
        ref={cardRef}
        className="bg-surface rounded-xl p-6 border border-surface-overlay max-w-md"
        style={{ fontFamily: "'DM Sans', 'Inter', system-ui, sans-serif" }}
      >
        <div className="flex gap-4">
          {book.cover_i ? (
            <img
              src={getCoverUrl(book.cover_i, 'M')}
              alt={book.title}
              className="w-20 h-28 object-cover rounded-lg shadow-lg"
              crossOrigin="anonymous"
            />
          ) : (
            <div className="w-20 h-28 bg-surface-raised rounded-lg flex items-center justify-center">
              <span className="text-text-muted">?</span>
            </div>
          )}
          <div className="flex-1 min-w-0">
            <h3 className="text-text-primary font-bold text-sm line-clamp-2">{book.title}</h3>
            <p className="text-text-muted text-xs mt-0.5">
              {book.author_names?.join(', ')}
            </p>
            {review.star_rating && (
              <div className="mt-2">
                <StarRating value={review.star_rating} readOnly size="sm" />
              </div>
            )}
          </div>
        </div>
        {review.review_text && (
          <p className="text-text-secondary text-sm mt-4 leading-relaxed line-clamp-4">
            &ldquo;{review.review_text}&rdquo;
          </p>
        )}
        <div className="mt-4 flex items-center justify-between">
          <span className="text-text-muted text-xs">@{username}</span>
          <span className="text-accent-primary text-xs font-bold">BetterReads</span>
        </div>
      </div>

      <button
        onClick={handleExport}
        disabled={exporting}
        className="bg-accent-secondary text-surface px-4 py-2 rounded-lg text-sm font-medium hover:bg-accent-secondary/90 transition-colors disabled:opacity-50 w-full"
      >
        {exporting ? 'Generating...' : 'Download as Image'}
      </button>
    </div>
  );
}

interface ShareableRankingCardProps {
  rankings: RankedBook[];
  username: string;
}

export function ShareableRankingCard({ rankings, username }: ShareableRankingCardProps) {
  const cardRef = useRef<HTMLDivElement>(null);
  const [exporting, setExporting] = useState(false);

  async function handleExport() {
    if (!cardRef.current) return;
    setExporting(true);
    try {
      const dataUrl = await toPng(cardRef.current, {
        pixelRatio: 2,
        backgroundColor: '#14181c',
      });
      const link = document.createElement('a');
      link.download = `betterreads-rankings-${username}.png`;
      link.href = dataUrl;
      link.click();
    } finally {
      setExporting(false);
    }
  }

  const top = rankings.slice(0, 10);

  return (
    <div className="space-y-3">
      <div
        ref={cardRef}
        className="bg-surface rounded-xl p-6 border border-surface-overlay max-w-md"
        style={{ fontFamily: "'DM Sans', 'Inter', system-ui, sans-serif" }}
      >
        <h3 className="text-text-primary font-bold text-lg mb-4">
          @{username}&apos;s Top {top.length}
        </h3>

        {/* Cover row */}
        <div className="flex gap-2 mb-4 overflow-hidden">
          {top.slice(0, 5).map((r) => (
            <div key={r.id} className="shrink-0">
              {r.book?.cover_i ? (
                <img
                  src={getCoverUrl(r.book.cover_i, 'S')}
                  alt={r.book.title}
                  className="w-14 h-20 object-cover rounded"
                  crossOrigin="anonymous"
                />
              ) : (
                <div className="w-14 h-20 bg-surface-raised rounded flex items-center justify-center text-text-muted text-xs">
                  ?
                </div>
              )}
            </div>
          ))}
        </div>

        <ol className="space-y-1.5">
          {top.map((r, i) => (
            <li key={r.id} className="flex items-center gap-2">
              <span className="text-accent-tertiary font-bold text-xs w-5 text-right">
                {i + 1}.
              </span>
              <span className="text-text-primary text-sm truncate">
                {r.book?.title ?? 'Unknown'}
              </span>
            </li>
          ))}
        </ol>

        <div className="mt-4 flex items-center justify-between">
          <span className="text-text-muted text-xs">@{username}</span>
          <span className="text-accent-primary text-xs font-bold">BetterReads</span>
        </div>
      </div>

      <button
        onClick={handleExport}
        disabled={exporting}
        className="bg-accent-secondary text-surface px-4 py-2 rounded-lg text-sm font-medium hover:bg-accent-secondary/90 transition-colors disabled:opacity-50 w-full"
      >
        {exporting ? 'Generating...' : 'Download as Image'}
      </button>
    </div>
  );
}
