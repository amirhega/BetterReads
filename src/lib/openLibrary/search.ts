import type { BookSearchResult } from '@/types/book';
import type { OLSearchResponse } from './types';
import { olFetch } from './client';

export async function searchBooks(
  query: string,
  page = 1,
  limit = 20
): Promise<{ results: BookSearchResult[]; total: number }> {
  const offset = (page - 1) * limit;
  const data = await olFetch<OLSearchResponse>(
    `/search.json?q=${encodeURIComponent(query)}&limit=${limit}&offset=${offset}&fields=key,title,author_name,author_key,cover_i,first_publish_year,subject,edition_count,cover_edition_key`
  );

  const results: BookSearchResult[] = data.docs.map((doc) => ({
    ol_work_key: doc.key,
    title: doc.title,
    author_names: doc.author_name ?? [],
    cover_i: doc.cover_i ?? null,
    first_publish_year: doc.first_publish_year ?? null,
    subjects: (doc.subject ?? []).slice(0, 10),
    edition_count: doc.edition_count ?? 0,
  }));

  return { results, total: data.numFound };
}
