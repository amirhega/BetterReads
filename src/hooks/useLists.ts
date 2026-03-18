import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase/client';
import { useAuth } from '@/context/AuthContext';
import type { List, ListItem } from '@/types/book';

export function useMyLists() {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['lists', user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('lists')
        .select('*, items:list_items(count)')
        .eq('user_id', user!.id)
        .order('updated_at', { ascending: false });

      if (error) throw error;
      return data as (List & { items: [{ count: number }] })[];
    },
    enabled: !!user,
  });
}

export function useList(listId: string | undefined) {
  return useQuery({
    queryKey: ['list', listId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('lists')
        .select('*, profile:profiles(*), items:list_items(*, book:books(*))')
        .eq('id', listId!)
        .single();

      if (error) throw error;

      // Sort items by position
      if (data.items) {
        data.items.sort((a: ListItem, b: ListItem) => a.position - b.position);
      }

      return data as List;
    },
    enabled: !!listId,
  });
}

export function useCreateList() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      title,
      description,
      isPublic,
    }: {
      title: string;
      description: string | null;
      isPublic: boolean;
    }) => {
      const { data, error } = await supabase
        .from('lists')
        .insert({
          user_id: user!.id,
          title,
          description,
          is_public: isPublic,
        })
        .select()
        .single();

      if (error) throw error;
      return data as List;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['lists'] });
    },
  });
}

export function useDeleteList() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (listId: string) => {
      const { error } = await supabase.from('lists').delete().eq('id', listId);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['lists'] });
    },
  });
}

export function useAddToList() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      listId,
      bookId,
      position,
    }: {
      listId: string;
      bookId: string;
      position: number;
    }) => {
      const { data, error } = await supabase
        .from('list_items')
        .insert({ list_id: listId, book_id: bookId, position })
        .select('*, book:books(*)')
        .single();

      if (error) throw error;
      return data as ListItem;
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['list', variables.listId] });
      queryClient.invalidateQueries({ queryKey: ['lists'] });
    },
  });
}

export function useRemoveFromList() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ itemId, listId }: { itemId: string; listId: string }) => {
      const { error } = await supabase.from('list_items').delete().eq('id', itemId);
      if (error) throw error;
      return listId;
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['list', variables.listId] });
      queryClient.invalidateQueries({ queryKey: ['lists'] });
    },
  });
}
