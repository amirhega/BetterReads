import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useMyLists, useCreateList, useDeleteList } from '@/hooks/useLists';
import { Modal } from '@/components/ui/Modal';

export function ListsPage() {
  const { data: lists, isLoading } = useMyLists();
  const createList = useCreateList();
  const deleteList = useDeleteList();
  const [showCreate, setShowCreate] = useState(false);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [isPublic, setIsPublic] = useState(true);

  function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    if (!title.trim()) return;
    createList.mutate(
      { title: title.trim(), description: description.trim() || null, isPublic },
      {
        onSuccess: () => {
          setTitle('');
          setDescription('');
          setShowCreate(false);
        },
      }
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold font-display">Your Lists</h1>
        <button
          onClick={() => setShowCreate(true)}
          className="bg-accent-primary text-surface px-4 py-2 rounded-lg text-sm font-medium hover:bg-accent-primary/90 transition-colors"
        >
          + New List
        </button>
      </div>

      {isLoading && (
        <div className="flex justify-center py-12">
          <div className="w-8 h-8 border-2 border-accent-primary border-t-transparent rounded-full animate-spin" />
        </div>
      )}

      {!isLoading && (!lists || lists.length === 0) && (
        <div className="text-center py-20">
          <p className="text-text-muted text-lg mb-2">No lists yet</p>
          <p className="text-text-muted text-sm">
            Create lists to organize your books into collections
          </p>
        </div>
      )}

      {lists && lists.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {lists.map((list) => {
            const itemCount = list.items?.[0]?.count ?? 0;
            return (
              <div
                key={list.id}
                className="bg-surface-raised border border-surface-overlay rounded-xl p-4 hover:border-accent-primary/30 transition-colors"
              >
                <div className="flex items-start justify-between">
                  <Link to={`/lists/${list.id}`} className="flex-1 min-w-0">
                    <h3 className="text-text-primary font-semibold text-sm hover:text-accent-primary transition-colors">
                      {list.title}
                    </h3>
                    {list.description && (
                      <p className="text-text-muted text-xs mt-1 line-clamp-2">
                        {list.description}
                      </p>
                    )}
                    <p className="text-text-muted text-xs mt-2">
                      {itemCount} {itemCount === 1 ? 'book' : 'books'}
                      {!list.is_public && ' \u00B7 Private'}
                    </p>
                  </Link>
                  <button
                    onClick={() => deleteList.mutate(list.id)}
                    className="text-text-muted hover:text-accent-warm text-xs ml-2 shrink-0"
                  >
                    Delete
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Create list modal */}
      <Modal open={showCreate} onClose={() => setShowCreate(false)} title="New List">
        <form onSubmit={handleCreate} className="space-y-4">
          <div>
            <label className="block text-text-secondary text-sm mb-1">Title</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Best Sci-Fi of 2025"
              required
              className="w-full bg-surface-input border border-surface-overlay rounded-lg px-3 py-2 text-text-primary placeholder-text-muted focus:outline-none focus:ring-2 focus:ring-accent-primary/50"
            />
          </div>
          <div>
            <label className="block text-text-secondary text-sm mb-1">Description</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
              placeholder="What's this list about?"
              className="w-full bg-surface-input border border-surface-overlay rounded-lg px-3 py-2 text-text-primary placeholder-text-muted focus:outline-none focus:ring-2 focus:ring-accent-primary/50 resize-none"
            />
          </div>
          <label className="flex items-center gap-2 text-sm text-text-secondary">
            <input
              type="checkbox"
              checked={isPublic}
              onChange={(e) => setIsPublic(e.target.checked)}
            />
            Public (visible to other users)
          </label>
          <div className="flex justify-end gap-3">
            <button
              type="button"
              onClick={() => setShowCreate(false)}
              className="px-4 py-2 text-text-muted hover:text-text-primary text-sm"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={createList.isPending}
              className="bg-accent-primary text-surface px-6 py-2 rounded-lg font-medium hover:bg-accent-primary/90 transition-colors disabled:opacity-50"
            >
              {createList.isPending ? 'Creating...' : 'Create List'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
