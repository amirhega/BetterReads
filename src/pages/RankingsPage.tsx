import { useState, useRef, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { useRankings, useInsertRanking, useRemoveRanking } from '@/hooks/useRankings';
import { useLibrary } from '@/hooks/useLibrary';
import { useAuth } from '@/context/AuthContext';
import { ShareableRankingCard } from '@/components/share/ShareableCard';
import { Modal } from '@/components/ui/Modal';
import { getCoverUrl } from '@/lib/openLibrary/covers';
import { binaryInsertionSort } from '@/lib/ranking/engine';
import type { ComparisonChoice, ComparisonPair, RankedBook as RankingRankedBook } from '@/types/ranking';
import type { Book } from '@/types/book';
import clsx from 'clsx';

type RankingState = 'idle' | 'selecting' | 'comparing' | 'complete';

export function RankingsPage() {
  const { data: rankings, isLoading } = useRankings();
  const { data: readBooks } = useLibrary('read');
  const insertRanking = useInsertRanking();
  const removeRanking = useRemoveRanking();

  const { profile } = useAuth();
  const [state, setState] = useState<RankingState>('idle');
  const [comparison, setComparison] = useState<ComparisonPair | null>(null);
  const [newBookId, setNewBookId] = useState<string | null>(null);
  const [showShare, setShowShare] = useState(false);

  const generatorRef = useRef<Generator<ComparisonPair, number, ComparisonChoice> | null>(null);

  // Books in library marked as 'read' that aren't ranked yet
  const unrankedBooks = readBooks?.filter(
    (entry) => !rankings?.some((r) => r.book_id === entry.book_id)
  );

  const bookMap = new Map<string, Book>();
  readBooks?.forEach((e) => { if (e.book) bookMap.set(e.book_id, e.book); });
  rankings?.forEach((r) => { if (r.book) bookMap.set(r.book_id, r.book); });

  const startRanking = useCallback(
    (bookId: string) => {
      if (!rankings) return;

      setNewBookId(bookId);
      const currentList: RankingRankedBook[] = rankings.map((r) => ({
        book_id: r.book_id,
        rank_position: r.rank_position,
      }));

      if (currentList.length === 0) {
        // No comparisons needed, insert directly
        insertRanking.mutate({ bookId, insertionIndex: 0, currentList });
        setState('idle');
        return;
      }

      const gen = binaryInsertionSort(currentList, bookId);
      generatorRef.current = gen;

      const first = gen.next();
      if (first.done) {
        insertRanking.mutate({
          bookId,
          insertionIndex: first.value,
          currentList,
        });
        setState('idle');
      } else {
        setComparison(first.value);
        setState('comparing');
      }
    },
    [rankings, insertRanking]
  );

  const handleChoice = useCallback(
    (choice: ComparisonChoice) => {
      if (!generatorRef.current || !rankings || !newBookId) return;

      const currentList: RankingRankedBook[] = rankings.map((r) => ({
        book_id: r.book_id,
        rank_position: r.rank_position,
      }));

      const result = generatorRef.current.next(choice);
      if (result.done) {
        insertRanking.mutate({
          bookId: newBookId,
          insertionIndex: result.value,
          currentList,
        });
        setState('idle');
        setComparison(null);
        setNewBookId(null);
        generatorRef.current = null;
      } else {
        setComparison(result.value);
      }
    },
    [rankings, newBookId, insertRanking]
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold font-display">Your Rankings</h1>
        <div className="flex gap-2">
          {rankings && rankings.length > 0 && (
            <button
              onClick={() => setShowShare(true)}
              className="bg-accent-secondary text-surface px-4 py-2 rounded-lg text-sm font-medium hover:bg-accent-secondary/90 transition-colors"
            >
              Share
            </button>
          )}
          {unrankedBooks && unrankedBooks.length > 0 && state === 'idle' && (
            <button
              onClick={() => setState('selecting')}
              className="bg-accent-primary text-surface px-4 py-2 rounded-lg text-sm font-medium hover:bg-accent-primary/90 transition-colors"
            >
              + Rank a Book
            </button>
          )}
        </div>
      </div>

      {/* COMPARING STATE: A vs B */}
      {state === 'comparing' && comparison && (
        <div className="bg-surface-raised border border-surface-overlay rounded-xl p-6 space-y-4">
          <h2 className="text-center text-text-secondary text-sm font-medium">
            Which do you prefer?
          </h2>
          <div className="grid grid-cols-2 gap-6">
            {[
              { id: comparison.bookA, choice: 'a' as const },
              { id: comparison.bookB, choice: 'b' as const },
            ].map(({ id, choice }) => {
              const book = bookMap.get(id);
              return (
                <button
                  key={id}
                  onClick={() => handleChoice(choice)}
                  className="flex flex-col items-center gap-3 p-4 rounded-xl border border-surface-overlay hover:border-accent-primary hover:bg-accent-primary/5 transition-all group"
                >
                  {book?.cover_i ? (
                    <img
                      src={getCoverUrl(book.cover_i, 'M')}
                      alt={book.title}
                      className="w-24 h-36 object-cover rounded-lg shadow-lg group-hover:shadow-accent-primary/20"
                    />
                  ) : (
                    <div className="w-24 h-36 bg-surface-overlay rounded-lg flex items-center justify-center">
                      <span className="text-text-muted">?</span>
                    </div>
                  )}
                  <span className="text-text-primary text-sm font-medium text-center line-clamp-2">
                    {book?.title ?? 'Unknown'}
                  </span>
                </button>
              );
            })}
          </div>
          <p className="text-center text-text-muted text-xs">
            Tap the book you like more
          </p>
        </div>
      )}

      {/* SELECTING STATE: pick a book to rank */}
      {state === 'selecting' && (
        <div className="bg-surface-raised border border-surface-overlay rounded-xl p-4 space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-medium text-text-secondary">
              Select a book to rank
            </h2>
            <button
              onClick={() => setState('idle')}
              className="text-text-muted hover:text-text-primary text-sm"
            >
              Cancel
            </button>
          </div>
          <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-3">
            {unrankedBooks?.map((entry) => {
              const book = entry.book;
              if (!book) return null;
              return (
                <button
                  key={entry.id}
                  onClick={() => startRanking(book.id)}
                  className="flex flex-col items-center gap-2 p-2 rounded-lg hover:bg-surface-overlay transition-colors"
                >
                  {book.cover_i ? (
                    <img
                      src={getCoverUrl(book.cover_i, 'S')}
                      alt={book.title}
                      className="w-16 h-24 object-cover rounded"
                    />
                  ) : (
                    <div className="w-16 h-24 bg-surface-overlay rounded flex items-center justify-center">
                      <span className="text-text-muted text-xs">?</span>
                    </div>
                  )}
                  <span className="text-text-secondary text-xs text-center line-clamp-2">
                    {book.title}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* RANKED LIST */}
      {isLoading && (
        <div className="flex justify-center py-12">
          <div className="w-8 h-8 border-2 border-accent-primary border-t-transparent rounded-full animate-spin" />
        </div>
      )}

      {!isLoading && (!rankings || rankings.length === 0) && state === 'idle' && (
        <div className="text-center py-20">
          <p className="text-text-muted text-lg mb-2">No rankings yet</p>
          <p className="text-text-muted text-sm">
            Mark books as &quot;Read&quot; in your library, then rank them here
          </p>
        </div>
      )}

      {rankings && rankings.length > 0 && (
        <div className="space-y-2">
          {rankings.map((ranked, index) => {
            const book = ranked.book;
            if (!book) return null;
            return (
              <div
                key={ranked.id}
                className="flex items-center gap-4 bg-surface-raised border border-surface-overlay rounded-xl p-3"
              >
                <span
                  className={clsx(
                    'w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold shrink-0',
                    index === 0
                      ? 'bg-accent-tertiary/20 text-accent-tertiary'
                      : index === 1
                        ? 'bg-text-muted/20 text-text-muted'
                        : index === 2
                          ? 'bg-accent-warm/20 text-accent-warm'
                          : 'bg-surface-overlay text-text-muted'
                  )}
                >
                  {index + 1}
                </span>
                <Link
                  to={`/book/${book.ol_work_key.replace('/works/', '')}`}
                  className="shrink-0"
                >
                  {book.cover_i ? (
                    <img
                      src={getCoverUrl(book.cover_i, 'S')}
                      alt={book.title}
                      className="w-10 h-14 object-cover rounded"
                    />
                  ) : (
                    <div className="w-10 h-14 bg-surface-overlay rounded flex items-center justify-center">
                      <span className="text-text-muted text-xs">?</span>
                    </div>
                  )}
                </Link>
                <div className="flex-1 min-w-0">
                  <Link
                    to={`/book/${book.ol_work_key.replace('/works/', '')}`}
                    className="text-text-primary font-medium text-sm hover:text-accent-primary line-clamp-1"
                  >
                    {book.title}
                  </Link>
                  <p className="text-text-muted text-xs line-clamp-1">
                    {book.author_names?.join(', ')}
                  </p>
                </div>
                <button
                  onClick={() => removeRanking.mutate(book.id)}
                  className="text-text-muted hover:text-accent-warm text-xs shrink-0"
                >
                  Remove
                </button>
              </div>
            );
          })}
        </div>
      )}

      {/* Share Modal */}
      {rankings && (
        <Modal open={showShare} onClose={() => setShowShare(false)} title="Share Your Rankings">
          <ShareableRankingCard
            rankings={rankings}
            username={profile?.username ?? 'user'}
          />
        </Modal>
      )}
    </div>
  );
}
