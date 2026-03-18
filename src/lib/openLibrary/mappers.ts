import type { Book, BookSearchResult } from '@/types/book';
import type { OLSearchDoc, OLWork } from './types';

export function mapSearchDocToResult(doc: OLSearchDoc): BookSearchResult {
  return {
    ol_work_key: doc.key,
    title: doc.title,
    author_names: doc.author_name ?? [],
    cover_i: doc.cover_i ?? null,
    first_publish_year: doc.first_publish_year ?? null,
    subjects: (doc.subject ?? []).slice(0, 10),
    edition_count: doc.edition_count ?? 0,
  };
}

export function mapWorkToBook(
  work: OLWork,
  searchDoc?: OLSearchDoc,
  description?: string | null
): Omit<Book, 'id' | 'fetched_at' | 'created_at'> {
  const desc = description ??
    (typeof work.description === 'string'
      ? work.description
      : work.description?.value ?? null);

  return {
    ol_work_key: work.key,
    ol_edition_key: null,
    title: work.title,
    author_names: searchDoc?.author_name ?? [],
    ol_author_keys: searchDoc?.author_key ??
      (work.authors?.map((a) => a.author.key.replace('/authors/', '')) ?? []),
    cover_edition_key: searchDoc?.cover_edition_key ?? null,
    cover_i: work.covers?.[0] ?? searchDoc?.cover_i ?? null,
    first_publish_year: searchDoc?.first_publish_year ?? null,
    subjects: (work.subjects ?? searchDoc?.subject ?? []).slice(0, 20),
    description: desc,
    isbn_13: [],
    isbn_10: [],
    page_count: searchDoc?.number_of_pages_median ?? null,
  };
}
