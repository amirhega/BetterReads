import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase/client';
import { useAuth } from '@/context/AuthContext';
import type { LibraryEntry, ShelfStatus, Book } from '@/types/book';

export function useLibrary(shelf?: ShelfStatus) {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['library', user?.id, shelf],
    queryFn: async () => {
      let query = supabase
        .from('library_entries')
        .select('*, book:books(*)')
        .eq('user_id', user!.id)
        .order('updated_at', { ascending: false });

      if (shelf) {
        query = query.eq('shelf', shelf);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data as LibraryEntry[];
    },
    enabled: !!user,
  });
}

export function useBookShelfStatus(bookId: string | undefined) {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['shelf-status', user?.id, bookId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('library_entries')
        .select('*')
        .eq('user_id', user!.id)
        .eq('book_id', bookId!)
        .maybeSingle();

      if (error) throw error;
      return data as LibraryEntry | null;
    },
    enabled: !!user && !!bookId,
  });
}

export function useUpsertBook() {
  return useMutation({
    mutationFn: async (book: Omit<Book, 'id' | 'fetched_at' | 'created_at'>) => {
      const { data, error } = await supabase
        .from('books')
        .upsert(
          { ...book, ol_work_key: book.ol_work_key, fetched_at: new Date().toISOString() },
          { onConflict: 'ol_work_key' }
        )
        .select()
        .single();

      if (error) throw error;
      return data as Book;
    },
  });
}

export function useAddToShelf() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      bookId,
      shelf,
    }: {
      bookId: string;
      shelf: ShelfStatus;
    }) => {
      const now = new Date().toISOString();
      const entry: Record<string, unknown> = {
        user_id: user!.id,
        book_id: bookId,
        shelf,
      };

      if (shelf === 'currently_reading') entry.started_at = now;
      if (shelf === 'read') entry.finished_at = now;

      const { data, error } = await supabase
        .from('library_entries')
        .upsert(entry, { onConflict: 'user_id,book_id' })
        .select()
        .single();

      if (error) throw error;
      return data as LibraryEntry;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['library'] });
      queryClient.invalidateQueries({ queryKey: ['shelf-status'] });
      queryClient.invalidateQueries({ queryKey: ['profile-stats'] });
    },
  });
}

export function useRemoveFromShelf() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (bookId: string) => {
      const { error } = await supabase
        .from('library_entries')
        .delete()
        .eq('user_id', user!.id)
        .eq('book_id', bookId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['library'] });
      queryClient.invalidateQueries({ queryKey: ['shelf-status'] });
      queryClient.invalidateQueries({ queryKey: ['profile-stats'] });
    },
  });
}
