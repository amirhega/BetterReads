import { Link } from 'react-router-dom';
import { getCoverUrl } from '@/lib/openLibrary/covers';
import type { BookSearchResult } from '@/types/book';

interface BookGridProps {
  books: BookSearchResult[];
}

export function BookGrid({ books }: BookGridProps) {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
      {books.map((book) => (
        <Link
          key={book.ol_work_key}
          to={`/book${book.ol_work_key}`}
          className="group"
        >
          <div className="aspect-[2/3] rounded-lg overflow-hidden bg-surface-raised mb-2">
            {book.cover_i ? (
              <img
                src={getCoverUrl(book.cover_i, 'M')}
                alt={book.title}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
                loading="lazy"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-text-muted p-4 text-center text-sm">
                {book.title}
              </div>
            )}
          </div>
          <h3 className="text-sm text-text-primary font-medium truncate group-hover:text-accent-primary transition-colors">
            {book.title}
          </h3>
          <p className="text-xs text-text-muted truncate">
            {book.author_names.join(', ') || 'Unknown'}
          </p>
        </Link>
      ))}
    </div>
  );
}
