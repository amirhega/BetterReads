import { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { getWork } from '@/lib/openLibrary/works';
import { getCoverUrl } from '@/lib/openLibrary/covers';
import { mapWorkToBook } from '@/lib/openLibrary/mappers';
import { useAuth } from '@/context/AuthContext';
import { useUpsertBook } from '@/hooks/useLibrary';
import { useBookReviews } from '@/hooks/useReviews';
import { ShelfButton } from '@/components/book/ShelfButton';
import { AddToListButton } from '@/components/book/AddToListButton';
import { ReviewForm } from '@/components/book/ReviewForm';
import { StarRating } from '@/components/ui/StarRating';

export function BookPage() {
  const { olWorkKey } = useParams();
  const { user } = useAuth();
  const workKey = `/works/${olWorkKey}`;
  const upsertBook = useUpsertBook();
  const [showReview, setShowReview] = useState(false);

  const { data, isLoading, error } = useQuery({
    queryKey: ['work', workKey],
    queryFn: () => getWork(workKey),
    enabled: !!olWorkKey,
  });

  // Upsert book to DB when loaded so we can reference it
  const { data: dbBook } = useQuery({
    queryKey: ['db-book', workKey],
    queryFn: async () => {
      if (!data) return null;
      const mapped = mapWorkToBook(data.work, undefined, data.description);
      return upsertBook.mutateAsync(mapped);
    },
    enabled: !!data,
  });

  const { data: reviews } = useBookReviews(dbBook?.id);

  if (isLoading) {
    return (
      <div className="flex justify-center py-20">
        <div className="w-8 h-8 border-2 border-accent-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="text-center py-20">
        <p className="text-text-muted text-lg">Book not found</p>
        <Link to="/search" className="text-accent-primary mt-4 inline-block">
          Back to search
        </Link>
      </div>
    );
  }

  const { work, description } = data;
  const coverId = work.covers?.[0];

  return (
    <div className="max-w-4xl mx-auto">
      <div className="flex flex-col sm:flex-row gap-8">
        {/* Cover */}
        <div className="shrink-0">
          {coverId ? (
            <img
              src={getCoverUrl(coverId, 'L')}
              alt={work.title}
              className="w-48 sm:w-56 rounded-lg shadow-xl"
            />
          ) : (
            <div className="w-48 sm:w-56 h-72 sm:h-80 bg-surface-raised rounded-lg flex items-center justify-center">
              <span className="text-text-muted text-4xl">?</span>
            </div>
          )}
        </div>

        {/* Info */}
        <div className="flex-1 space-y-4">
          <h1 className="text-3xl font-bold font-display">{work.title}</h1>

          {work.subjects && work.subjects.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {work.subjects.slice(0, 8).map((subject) => (
                <span
                  key={subject}
                  className="px-2 py-1 bg-surface-raised text-text-muted text-xs rounded-full border border-surface-overlay"
                >
                  {subject}
                </span>
              ))}
            </div>
          )}

          {description && (
            <div className="text-text-secondary leading-relaxed">
              <p>{description.length > 500 ? description.slice(0, 500) + '...' : description}</p>
            </div>
          )}

          {/* Action buttons */}
          <div className="flex flex-wrap gap-3 pt-4">
            {dbBook && <ShelfButton bookId={dbBook.id} />}
            <button
              onClick={() => {
                if (!user) return;
                setShowReview(true);
              }}
              className="bg-surface-raised text-text-secondary px-6 py-2 rounded-lg font-medium hover:bg-surface-overlay transition-colors border border-surface-overlay"
            >
              Write Review
            </button>
            {dbBook && <AddToListButton bookId={dbBook.id} />}
          </div>
        </div>
      </div>

      {/* Reviews Section */}
      {reviews && reviews.length > 0 && (
        <div className="mt-12 space-y-6">
          <h2 className="text-xl font-bold font-display">Reviews</h2>
          <div className="space-y-4">
            {reviews.map((review) => (
              <div
                key={review.id}
                className="bg-surface-raised border border-surface-overlay rounded-xl p-4 space-y-2"
              >
                <div className="flex items-center justify-between">
                  <Link
                    to={`/user/${review.profile?.username}`}
                    className="text-sm font-medium text-text-primary hover:text-accent-primary"
                  >
                    @{review.profile?.username}
                  </Link>
                  {review.star_rating && (
                    <StarRating value={review.star_rating} readOnly size="sm" />
                  )}
                </div>
                {review.contains_spoilers && (
                  <span className="inline-block px-2 py-0.5 bg-accent-warm/20 text-accent-warm text-xs rounded">
                    Spoilers
                  </span>
                )}
                {review.review_text && (
                  <p className="text-text-secondary text-sm leading-relaxed">
                    {review.review_text}
                  </p>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Review Modal */}
      {dbBook && (
        <ReviewForm
          bookId={dbBook.id}
          bookTitle={work.title}
          open={showReview}
          onClose={() => setShowReview(false)}
        />
      )}
    </div>
  );
}
