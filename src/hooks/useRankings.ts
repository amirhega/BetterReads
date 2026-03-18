import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase/client';
import { useAuth } from '@/context/AuthContext';
import type { RankedBook } from '@/types/book';
import { computePosition, needsNormalization, normalize } from '@/lib/ranking/fractionalIndex';
import type { RankedBook as RankingRankedBook } from '@/types/ranking';

export function useRankings() {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['rankings', user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('rankings')
        .select('*, book:books(*)')
        .eq('user_id', user!.id)
        .order('rank_position', { ascending: true });

      if (error) throw error;
      return data as RankedBook[];
    },
    enabled: !!user,
  });
}

export function useInsertRanking() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      bookId,
      insertionIndex,
      currentList,
    }: {
      bookId: string;
      insertionIndex: number;
      currentList: RankingRankedBook[];
    }) => {
      const position = computePosition(currentList, insertionIndex);

      const { data, error } = await supabase
        .from('rankings')
        .upsert(
          {
            user_id: user!.id,
            book_id: bookId,
            rank_position: position,
          },
          { onConflict: 'user_id,book_id' }
        )
        .select('*, book:books(*)')
        .single();

      if (error) throw error;

      // Normalize if positions get too close
      const updatedList = [...currentList];
      updatedList.splice(insertionIndex, 0, {
        book_id: bookId,
        rank_position: position,
      });

      if (needsNormalization(updatedList)) {
        const normalized = normalize(updatedList);
        for (const item of normalized) {
          await supabase
            .from('rankings')
            .update({ rank_position: item.rank_position })
            .eq('user_id', user!.id)
            .eq('book_id', item.book_id);
        }
      }

      return data as RankedBook;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['rankings'] });
      queryClient.invalidateQueries({ queryKey: ['profile-stats'] });
    },
  });
}

export function useRemoveRanking() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (bookId: string) => {
      const { error } = await supabase
        .from('rankings')
        .delete()
        .eq('user_id', user!.id)
        .eq('book_id', bookId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['rankings'] });
      queryClient.invalidateQueries({ queryKey: ['profile-stats'] });
    },
  });
}
