import { useQuery } from '@tanstack/react-query';
import { searchBooks } from '@/lib/openLibrary/search';

export function useBookSearch(query: string, page = 1) {
  return useQuery({
    queryKey: ['bookSearch', query, page],
    queryFn: () => searchBooks(query, page),
    enabled: query.length >= 2,
    staleTime: 5 * 60 * 1000,
    placeholderData: (prev) => prev,
  });
}
