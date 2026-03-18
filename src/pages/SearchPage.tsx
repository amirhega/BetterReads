import { useSearchParams } from 'react-router-dom';
import { useBookSearch } from '@/hooks/useBookSearch';
import { BookGrid } from '@/components/book/BookGrid';
import { useState } from 'react';

export function SearchPage() {
  const [searchParams] = useSearchParams();
  const query = searchParams.get('q') ?? '';
  const [page, setPage] = useState(1);
  const { data, isLoading } = useBookSearch(query, page);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold font-display">
          {query ? `Results for "${query}"` : 'Search Books'}
        </h1>
        {data && (
          <p className="text-text-muted text-sm mt-1">
            {data.total.toLocaleString()} books found
          </p>
        )}
      </div>

      {isLoading ? (
        <div className="flex justify-center py-20">
          <div className="w-8 h-8 border-2 border-accent-primary border-t-transparent rounded-full animate-spin" />
        </div>
      ) : data?.results.length ? (
        <>
          <BookGrid books={data.results} />
          <div className="flex justify-center gap-4 pt-4">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
              className="px-4 py-2 bg-surface-raised text-text-secondary rounded-lg disabled:opacity-50 hover:bg-surface-overlay transition-colors"
            >
              Previous
            </button>
            <span className="flex items-center text-text-muted text-sm">
              Page {page}
            </span>
            <button
              onClick={() => setPage((p) => p + 1)}
              disabled={!data || data.results.length < 20}
              className="px-4 py-2 bg-surface-raised text-text-secondary rounded-lg disabled:opacity-50 hover:bg-surface-overlay transition-colors"
            >
              Next
            </button>
          </div>
        </>
      ) : query ? (
        <div className="text-center py-20">
          <p className="text-text-muted text-lg">No books found for "{query}"</p>
        </div>
      ) : (
        <div className="text-center py-20">
          <p className="text-text-muted text-lg">
            Use the search bar above to find books
          </p>
        </div>
      )}
    </div>
  );
}
