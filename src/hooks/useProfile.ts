import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase/client';
import { useAuth } from '@/context/AuthContext';
import type { Profile, Activity } from '@/types/book';

export function useProfileByUsername(username: string | undefined) {
  return useQuery({
    queryKey: ['profile', username],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('username', username!)
        .single();

      if (error) throw error;
      return data as Profile;
    },
    enabled: !!username,
  });
}

export function useProfileStats(userId: string | undefined) {
  return useQuery({
    queryKey: ['profile-stats', userId],
    queryFn: async () => {
      const [library, reviews, rankings] = await Promise.all([
        supabase
          .from('library_entries')
          .select('id', { count: 'exact', head: true })
          .eq('user_id', userId!)
          .eq('shelf', 'read'),
        supabase
          .from('reviews')
          .select('id', { count: 'exact', head: true })
          .eq('user_id', userId!),
        supabase
          .from('rankings')
          .select('id', { count: 'exact', head: true })
          .eq('user_id', userId!),
      ]);

      return {
        booksRead: library.count ?? 0,
        reviews: reviews.count ?? 0,
        rankings: rankings.count ?? 0,
      };
    },
    enabled: !!userId,
  });
}

export function useUserActivity(userId: string | undefined) {
  return useQuery({
    queryKey: ['activity', userId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('activities')
        .select('*, book:books(*), profile:profiles!activities_user_id_fkey(*)')
        .eq('user_id', userId!)
        .order('created_at', { ascending: false })
        .limit(30);

      if (error) throw error;
      return data as Activity[];
    },
    enabled: !!userId,
  });
}

export function useFeed() {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['feed', user?.id],
    queryFn: async () => {
      // Get followed user IDs
      const { data: follows } = await supabase
        .from('follows')
        .select('following_id')
        .eq('follower_id', user!.id);

      const followingIds = follows?.map((f) => f.following_id) ?? [];
      if (followingIds.length === 0) return [];

      const { data, error } = await supabase
        .from('activities')
        .select('*, book:books(*), profile:profiles!activities_user_id_fkey(*)')
        .in('user_id', followingIds)
        .order('created_at', { ascending: false })
        .limit(50);

      if (error) throw error;
      return data as Activity[];
    },
    enabled: !!user,
  });
}

export function useFollowStatus(targetUserId: string | undefined) {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['follow-status', user?.id, targetUserId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('follows')
        .select('*')
        .eq('follower_id', user!.id)
        .eq('following_id', targetUserId!)
        .maybeSingle();

      if (error) throw error;
      return !!data;
    },
    enabled: !!user && !!targetUserId && user.id !== targetUserId,
  });
}

export function useToggleFollow() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      targetUserId,
      isFollowing,
    }: {
      targetUserId: string;
      isFollowing: boolean;
    }) => {
      if (isFollowing) {
        const { error } = await supabase
          .from('follows')
          .delete()
          .eq('follower_id', user!.id)
          .eq('following_id', targetUserId);
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('follows')
          .insert({ follower_id: user!.id, following_id: targetUserId });
        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['follow-status'] });
      queryClient.invalidateQueries({ queryKey: ['feed'] });
    },
  });
}

export function useUpdateProfile() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (updates: {
      display_name?: string;
      bio?: string;
      favorite_genres?: string[];
    }) => {
      const { data, error } = await supabase
        .from('profiles')
        .update(updates)
        .eq('id', user!.id)
        .select()
        .single();

      if (error) throw error;
      return data as Profile;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['profile'] });
    },
  });
}
