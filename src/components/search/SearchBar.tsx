import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDebounce } from '@/hooks/useDebounce';
import { useBookSearch } from '@/hooks/useBookSearch';
import { getCoverUrl } from '@/lib/openLibrary/covers';

export function SearchBar() {
  const [query, setQuery] = useState('');
  const [isFocused, setIsFocused] = useState(false);
  const debouncedQuery = useDebounce(query, 300);
  const { data } = useBookSearch(debouncedQuery);
  const navigate = useNavigate();

  const showDropdown = isFocused && debouncedQuery.length >= 2 && data?.results;

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (query.trim()) {
      navigate(`/search?q=${encodeURIComponent(query.trim())}`);
      setQuery('');
      setIsFocused(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="relative">
      <input
        type="text"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        onFocus={() => setIsFocused(true)}
        onBlur={() => setTimeout(() => setIsFocused(false), 200)}
        placeholder="Search books..."
        className="w-full bg-surface-input text-text-primary placeholder:text-text-muted rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-accent-primary/50"
      />
      {showDropdown && (
        <div className="absolute top-full left-0 right-0 mt-1 bg-surface-overlay border border-surface-input rounded-lg shadow-xl overflow-hidden z-50 max-h-80 overflow-y-auto">
          {data.results.slice(0, 6).map((book) => (
            <button
              key={book.ol_work_key}
              type="button"
              onMouseDown={() => {
                navigate(`/book${book.ol_work_key}`);
                setQuery('');
              }}
              className="w-full flex items-center gap-3 px-3 py-2 hover:bg-surface-raised text-left"
            >
              {book.cover_i ? (
                <img
                  src={getCoverUrl(book.cover_i, 'S')}
                  alt=""
                  className="w-8 h-12 object-cover rounded"
                />
              ) : (
                <div className="w-8 h-12 bg-surface-input rounded flex items-center justify-center text-text-muted text-xs">
                  ?
                </div>
              )}
              <div className="min-w-0">
                <div className="text-sm text-text-primary truncate">
                  {book.title}
                </div>
                <div className="text-xs text-text-muted truncate">
                  {book.author_names.join(', ') || 'Unknown author'}
                  {book.first_publish_year && ` (${book.first_publish_year})`}
                </div>
              </div>
            </button>
          ))}
          {data.results.length > 0 && (
            <button
              type="button"
              onMouseDown={() => {
                navigate(`/search?q=${encodeURIComponent(query.trim())}`);
                setQuery('');
              }}
              className="w-full px-3 py-2 text-sm text-accent-primary hover:bg-surface-raised text-center border-t border-surface-input"
            >
              View all {data.total} results
            </button>
          )}
        </div>
      )}
    </form>
  );
}
