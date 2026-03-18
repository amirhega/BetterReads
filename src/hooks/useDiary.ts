import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase/client';
import { useAuth } from '@/context/AuthContext';
import type { DiaryEntry, ReadingFormat } from '@/types/book';

export function useDiary() {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['diary', user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('diary_entries')
        .select('*, book:books(*)')
        .eq('user_id', user!.id)
        .order('read_date', { ascending: false });

      if (error) throw error;
      return data as DiaryEntry[];
    },
    enabled: !!user,
  });
}

export function useAddDiaryEntry() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      bookId,
      readDate,
      format,
      moodTags,
      notes,
      isReread,
      isFinished,
    }: {
      bookId: string;
      readDate: string;
      format: ReadingFormat | null;
      moodTags: string[];
      notes: string | null;
      isReread: boolean;
      isFinished: boolean;
    }) => {
      const { data, error } = await supabase
        .from('diary_entries')
        .insert({
          user_id: user!.id,
          book_id: bookId,
          read_date: readDate,
          format,
          mood_tags: moodTags,
          notes,
          is_reread: isReread,
          is_finished: isFinished,
        })
        .select('*, book:books(*)')
        .single();

      if (error) throw error;
      return data as DiaryEntry;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['diary'] });
    },
  });
}

export function useDeleteDiaryEntry() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (entryId: string) => {
      const { error } = await supabase
        .from('diary_entries')
        .delete()
        .eq('id', entryId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['diary'] });
    },
  });
}
