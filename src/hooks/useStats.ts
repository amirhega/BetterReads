import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase/client';
import { useAuth } from '@/context/AuthContext';

export interface ReadingStats {
  totalBooksRead: number;
  totalPages: number;
  booksThisYear: number;
  booksThisMonth: number;
  topGenres: { genre: string; count: number }[];
  formatBreakdown: { format: string; count: number }[];
  monthlyBreakdown: { month: string; count: number }[];
  moodBreakdown: { mood: string; count: number }[];
  currentStreak: number;
}

export function useReadingStats() {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['reading-stats', user?.id],
    queryFn: async () => {
      const now = new Date();
      const yearStart = `${now.getFullYear()}-01-01`;
      const monthStart = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-01`;

      // Fetch all needed data in parallel
      const [libraryRes, diaryRes, booksRes] = await Promise.all([
        supabase
          .from('library_entries')
          .select('*, book:books(subjects, page_count)')
          .eq('user_id', user!.id)
          .eq('shelf', 'read'),
        supabase
          .from('diary_entries')
          .select('read_date, format, mood_tags, is_finished')
          .eq('user_id', user!.id)
          .order('read_date', { ascending: false }),
        supabase
          .from('library_entries')
          .select('finished_at')
          .eq('user_id', user!.id)
          .eq('shelf', 'read')
          .not('finished_at', 'is', null)
          .order('finished_at', { ascending: false }),
      ]);

      const readEntries = libraryRes.data ?? [];
      const diaryEntries = diaryRes.data ?? [];
      const finishedEntries = booksRes.data ?? [];

      // Total books & pages
      const totalBooksRead = readEntries.length;
      let totalPages = 0;
      const genreCounts: Record<string, number> = {};

      for (const entry of readEntries) {
        const book = entry.book as { subjects?: string[]; page_count?: number } | null;
        if (book?.page_count) totalPages += book.page_count;
        if (book?.subjects) {
          for (const subject of book.subjects.slice(0, 3)) {
            genreCounts[subject] = (genreCounts[subject] || 0) + 1;
          }
        }
      }

      // Books this year/month
      const booksThisYear = finishedEntries.filter(
        (e) => e.finished_at && e.finished_at >= yearStart
      ).length;
      const booksThisMonth = finishedEntries.filter(
        (e) => e.finished_at && e.finished_at >= monthStart
      ).length;

      // Top genres
      const topGenres = Object.entries(genreCounts)
        .map(([genre, count]) => ({ genre, count }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 8);

      // Format breakdown from diary
      const formatCounts: Record<string, number> = {};
      const moodCounts: Record<string, number> = {};
      const monthlyCounts: Record<string, number> = {};

      for (const entry of diaryEntries) {
        if (entry.format) {
          formatCounts[entry.format] = (formatCounts[entry.format] || 0) + 1;
        }
        for (const mood of entry.mood_tags ?? []) {
          moodCounts[mood] = (moodCounts[mood] || 0) + 1;
        }
        const month = entry.read_date.slice(0, 7); // YYYY-MM
        monthlyCounts[month] = (monthlyCounts[month] || 0) + 1;
      }

      const formatBreakdown = Object.entries(formatCounts)
        .map(([format, count]) => ({ format, count }))
        .sort((a, b) => b.count - a.count);

      const moodBreakdown = Object.entries(moodCounts)
        .map(([mood, count]) => ({ mood, count }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 10);

      // Monthly breakdown for last 12 months
      const monthlyBreakdown: { month: string; count: number }[] = [];
      for (let i = 11; i >= 0; i--) {
        const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
        const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
        monthlyBreakdown.push({ month: key, count: monthlyCounts[key] || 0 });
      }

      // Reading streak (consecutive days with diary entries)
      let currentStreak = 0;
      if (diaryEntries.length > 0) {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const uniqueDates = [...new Set(diaryEntries.map((e) => e.read_date))].sort().reverse();

        for (let i = 0; i < uniqueDates.length; i++) {
          const entryDate = new Date(uniqueDates[i]);
          entryDate.setHours(0, 0, 0, 0);
          const expectedDate = new Date(today);
          expectedDate.setDate(expectedDate.getDate() - i);

          if (entryDate.getTime() === expectedDate.getTime()) {
            currentStreak++;
          } else {
            break;
          }
        }
      }

      return {
        totalBooksRead,
        totalPages,
        booksThisYear,
        booksThisMonth,
        topGenres,
        formatBreakdown,
        monthlyBreakdown,
        moodBreakdown,
        currentStreak,
      } satisfies ReadingStats;
    },
    enabled: !!user,
  });
}
