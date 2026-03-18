import { useParams, Link } from 'react-router-dom';
import { useList, useRemoveFromList } from '@/hooks/useLists';
import { getCoverUrl } from '@/lib/openLibrary/covers';

export function ListDetailPage() {
  const { listId } = useParams();
  const { data: list, isLoading } = useList(listId);
  const removeItem = useRemoveFromList();

  if (isLoading) {
    return (
      <div className="flex justify-center py-20">
        <div className="w-8 h-8 border-2 border-accent-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!list) {
    return (
      <div className="text-center py-20">
        <p className="text-text-muted text-lg">List not found</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-3xl mx-auto">
      <div>
        <Link to="/lists" className="text-text-muted text-sm hover:text-text-primary">
          &larr; Back to Lists
        </Link>
      </div>

      <div>
        <h1 className="text-2xl font-bold font-display">{list.title}</h1>
        {list.description && (
          <p className="text-text-secondary text-sm mt-1">{list.description}</p>
        )}
        <p className="text-text-muted text-xs mt-2">
          by @{list.profile?.username}
          {!list.is_public && ' \u00B7 Private'}
          {' \u00B7 '}
          {list.items?.length ?? 0} books
        </p>
      </div>

      {(!list.items || list.items.length === 0) && (
        <div className="text-center py-12">
          <p className="text-text-muted text-sm">
            This list is empty. Add books from their detail pages.
          </p>
        </div>
      )}

      {list.items && list.items.length > 0 && (
        <div className="space-y-2">
          {list.items.map((item, index) => {
            const book = item.book;
            if (!book) return null;
            return (
              <div
                key={item.id}
                className="flex items-center gap-4 bg-surface-raised border border-surface-overlay rounded-xl p-3"
              >
                <span className="text-text-muted text-sm font-bold w-6 text-right shrink-0">
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
                    <div className="w-10 h-14 bg-surface-overlay rounded flex items-center justify-center text-text-muted text-xs">
                      ?
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
                  <p className="text-text-muted text-xs">
                    {book.author_names?.join(', ')}
                  </p>
                  {item.notes && (
                    <p className="text-text-secondary text-xs mt-1">{item.notes}</p>
                  )}
                </div>
                <button
                  onClick={() => removeItem.mutate({ itemId: item.id, listId: list.id })}
                  className="text-text-muted hover:text-accent-warm text-xs shrink-0"
                >
                  Remove
                </button>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
