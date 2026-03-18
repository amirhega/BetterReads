import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { useLibrary, useAddToShelf, useRemoveFromShelf } from '@/hooks/useLibrary';
import { getCoverUrl } from '@/lib/openLibrary/covers';
import { SHELF_LABELS } from '@/config/constants';
import type { ShelfStatus } from '@/types/book';
import clsx from 'clsx';

const SHELVES: ShelfStatus[] = ['want_to_read', 'currently_reading', 'read'];

export function LibraryPage() {
  const { profile } = useAuth();
  const [activeShelf, setActiveShelf] = useState<ShelfStatus | undefined>(undefined);
  const { data: entries, isLoading } = useLibrary(activeShelf);
  const addToShelf = useAddToShelf();
  const removeFromShelf = useRemoveFromShelf();

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold font-display">
        {profile?.display_name ?? profile?.username}&apos;s Library
      </h1>

      {/* Shelf tabs */}
      <div className="flex gap-2 border-b border-surface-overlay">
        <button
          onClick={() => setActiveShelf(undefined)}
          className={clsx(
            'px-4 py-3 text-sm font-medium border-b-2 transition-colors',
            !activeShelf
              ? 'text-text-primary border-accent-primary'
              : 'text-text-muted hover:text-text-primary border-transparent hover:border-accent-primary/30'
          )}
        >
          All ({entries?.length ?? 0})
        </button>
        {SHELVES.map((shelf) => (
          <button
            key={shelf}
            onClick={() => setActiveShelf(shelf)}
            className={clsx(
              'px-4 py-3 text-sm font-medium border-b-2 transition-colors',
              activeShelf === shelf
                ? 'text-text-primary border-accent-primary'
                : 'text-text-muted hover:text-text-primary border-transparent hover:border-accent-primary/30'
            )}
          >
            {SHELF_LABELS[shelf]}
          </button>
        ))}
      </div>

      {/* Loading */}
      {isLoading && (
        <div className="flex justify-center py-12">
          <div className="w-8 h-8 border-2 border-accent-primary border-t-transparent rounded-full animate-spin" />
        </div>
      )}

      {/* Empty state */}
      {!isLoading && (!entries || entries.length === 0) && (
        <div className="text-center py-20">
          <p className="text-text-muted text-lg mb-2">
            {activeShelf ? `No books in ${SHELF_LABELS[activeShelf]}` : 'Your library is empty'}
          </p>
          <Link
            to="/search"
            className="text-accent-primary text-sm hover:underline"
          >
            Search for books to add
          </Link>
        </div>
      )}

      {/* Book grid */}
      {entries && entries.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {entries.map((entry) => {
            const book = entry.book;
            if (!book) return null;

            return (
              <div
                key={entry.id}
                className="group relative bg-surface-raised rounded-lg border border-surface-overlay overflow-hidden"
              >
                <Link to={`/book/${book.ol_work_key.replace('/works/', '')}`}>
                  {book.cover_i ? (
                    <img
                      src={getCoverUrl(book.cover_i, 'M')}
                      alt={book.title}
                      className="w-full aspect-[2/3] object-cover"
                    />
                  ) : (
                    <div className="w-full aspect-[2/3] bg-surface-overlay flex items-center justify-center">
                      <span className="text-text-muted text-2xl">?</span>
                    </div>
                  )}
                </Link>

                {/* Hover actions */}
                <div className="absolute inset-0 bg-black/70 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-2 p-2">
                  <p className="text-text-primary text-xs font-medium text-center line-clamp-2">
                    {book.title}
                  </p>
                  <div className="flex flex-col gap-1 w-full">
                    {SHELVES.filter((s) => s !== entry.shelf).map((shelf) => (
                      <button
                        key={shelf}
                        onClick={() => addToShelf.mutate({ bookId: book.id, shelf })}
                        className="text-xs bg-surface-overlay/80 text-text-secondary rounded px-2 py-1 hover:bg-accent-primary hover:text-surface transition-colors"
                      >
                        {SHELF_LABELS[shelf]}
                      </button>
                    ))}
                    <button
                      onClick={() => removeFromShelf.mutate(book.id)}
                      className="text-xs text-accent-warm/80 hover:text-accent-warm transition-colors mt-1"
                    >
                      Remove
                    </button>
                  </div>
                </div>

                {/* Shelf badge */}
                <div className="absolute top-1 right-1">
                  <span
                    className={clsx(
                      'text-[10px] px-1.5 py-0.5 rounded-full font-medium',
                      entry.shelf === 'read'
                        ? 'bg-accent-primary/20 text-accent-primary'
                        : entry.shelf === 'currently_reading'
                          ? 'bg-accent-secondary/20 text-accent-secondary'
                          : 'bg-accent-tertiary/20 text-accent-tertiary'
                    )}
                  >
                    {SHELF_LABELS[entry.shelf]}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
