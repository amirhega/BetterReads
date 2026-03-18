import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase/client';
import { useAuth } from '@/context/AuthContext';
import type { Review } from '@/types/book';

export function useBookReview(bookId: string | undefined) {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['review', user?.id, bookId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('reviews')
        .select('*')
        .eq('user_id', user!.id)
        .eq('book_id', bookId!)
        .maybeSingle();

      if (error) throw error;
      return data as Review | null;
    },
    enabled: !!user && !!bookId,
  });
}

export function useBookReviews(bookId: string | undefined) {
  return useQuery({
    queryKey: ['reviews', bookId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('reviews')
        .select('*, profile:profiles(*)')
        .eq('book_id', bookId!)
        .order('created_at', { ascending: false })
        .limit(20);

      if (error) throw error;
      return data as Review[];
    },
    enabled: !!bookId,
  });
}

export function useUpsertReview() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      bookId,
      starRating,
      reviewText,
      containsSpoilers,
    }: {
      bookId: string;
      starRating: number | null;
      reviewText: string | null;
      containsSpoilers: boolean;
    }) => {
      const { data, error } = await supabase
        .from('reviews')
        .upsert(
          {
            user_id: user!.id,
            book_id: bookId,
            star_rating: starRating,
            review_text: reviewText,
            contains_spoilers: containsSpoilers,
          },
          { onConflict: 'user_id,book_id' }
        )
        .select()
        .single();

      if (error) throw error;
      return data as Review;
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['review'] });
      queryClient.invalidateQueries({ queryKey: ['reviews', variables.bookId] });
      queryClient.invalidateQueries({ queryKey: ['profile-stats'] });
    },
  });
}
