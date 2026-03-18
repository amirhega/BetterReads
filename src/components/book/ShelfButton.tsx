import { useState } from 'react';
import clsx from 'clsx';
import { useAuth } from '@/context/AuthContext';
import { useBookShelfStatus, useAddToShelf, useRemoveFromShelf } from '@/hooks/useLibrary';
import { SHELF_LABELS } from '@/config/constants';
import type { ShelfStatus } from '@/types/book';
import { useNavigate } from 'react-router-dom';

interface ShelfButtonProps {
  bookId: string;
}

const SHELF_OPTIONS: ShelfStatus[] = ['want_to_read', 'currently_reading', 'read'];

export function ShelfButton({ bookId }: ShelfButtonProps) {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { data: entry } = useBookShelfStatus(bookId);
  const addToShelf = useAddToShelf();
  const removeFromShelf = useRemoveFromShelf();
  const [showDropdown, setShowDropdown] = useState(false);

  if (!user) {
    return (
      <button
        onClick={() => navigate('/login')}
        className="bg-accent-primary text-surface px-6 py-2 rounded-lg font-medium hover:bg-accent-primary/90 transition-colors"
      >
        Want to Read
      </button>
    );
  }

  const currentShelf = entry?.shelf;

  return (
    <div className="relative">
      <div className="flex">
        <button
          onClick={() => {
            if (!currentShelf) {
              addToShelf.mutate({ bookId, shelf: 'want_to_read' });
            } else {
              setShowDropdown(!showDropdown);
            }
          }}
          className={clsx(
            'px-6 py-2 rounded-l-lg font-medium transition-colors',
            currentShelf
              ? 'bg-accent-primary/20 text-accent-primary border border-accent-primary/30'
              : 'bg-accent-primary text-surface hover:bg-accent-primary/90'
          )}
        >
          {currentShelf ? SHELF_LABELS[currentShelf] : 'Want to Read'}
        </button>
        <button
          onClick={() => setShowDropdown(!showDropdown)}
          className={clsx(
            'px-2 py-2 rounded-r-lg font-medium transition-colors border-l-0',
            currentShelf
              ? 'bg-accent-primary/20 text-accent-primary border border-accent-primary/30'
              : 'bg-accent-primary text-surface hover:bg-accent-primary/90'
          )}
        >
          <span className="text-xs">&#9660;</span>
        </button>
      </div>

      {showDropdown && (
        <div className="absolute top-full mt-1 left-0 bg-surface-overlay border border-surface-input rounded-lg shadow-xl py-1 w-48 z-50">
          {SHELF_OPTIONS.map((shelf) => (
            <button
              key={shelf}
              onClick={() => {
                addToShelf.mutate({ bookId, shelf });
                setShowDropdown(false);
              }}
              className={clsx(
                'block w-full text-left px-4 py-2 text-sm hover:bg-surface-raised transition-colors',
                currentShelf === shelf
                  ? 'text-accent-primary'
                  : 'text-text-secondary hover:text-text-primary'
              )}
            >
              {SHELF_LABELS[shelf]}
              {currentShelf === shelf && ' \u2713'}
            </button>
          ))}
          {currentShelf && (
            <>
              <div className="border-t border-surface-input my-1" />
              <button
                onClick={() => {
                  removeFromShelf.mutate(bookId);
                  setShowDropdown(false);
                }}
                className="block w-full text-left px-4 py-2 text-sm text-accent-warm hover:bg-surface-raised transition-colors"
              >
                Remove from Library
              </button>
            </>
          )}
        </div>
      )}
    </div>
  );
}
