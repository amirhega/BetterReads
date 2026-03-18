import { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useMyLists, useAddToList } from '@/hooks/useLists';
import { Link } from 'react-router-dom';

interface AddToListButtonProps {
  bookId: string;
}

export function AddToListButton({ bookId }: AddToListButtonProps) {
  const { user } = useAuth();
  const { data: lists } = useMyLists();
  const addToList = useAddToList();
  const [showDropdown, setShowDropdown] = useState(false);

  if (!user) return null;

  return (
    <div className="relative">
      <button
        onClick={() => setShowDropdown(!showDropdown)}
        className="bg-surface-raised text-text-secondary px-6 py-2 rounded-lg font-medium hover:bg-surface-overlay transition-colors border border-surface-overlay text-sm"
      >
        + Add to List
      </button>

      {showDropdown && (
        <div className="absolute top-full mt-1 left-0 bg-surface-overlay border border-surface-input rounded-lg shadow-xl py-1 w-56 z-50">
          {(!lists || lists.length === 0) ? (
            <div className="px-4 py-3 text-sm text-text-muted">
              No lists yet.{' '}
              <Link to="/lists" className="text-accent-primary hover:underline">
                Create one
              </Link>
            </div>
          ) : (
            lists.map((list) => (
              <button
                key={list.id}
                onClick={() => {
                  const itemCount = list.items?.[0]?.count ?? 0;
                  addToList.mutate({
                    listId: list.id,
                    bookId,
                    position: itemCount,
                  });
                  setShowDropdown(false);
                }}
                className="block w-full text-left px-4 py-2 text-sm text-text-secondary hover:bg-surface-raised hover:text-text-primary transition-colors"
              >
                {list.title}
              </button>
            ))
          )}
        </div>
      )}
    </div>
  );
}
