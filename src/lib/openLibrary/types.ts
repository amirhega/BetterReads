export interface OLSearchResponse {
  numFound: number;
  start: number;
  docs: OLSearchDoc[];
}

export interface OLSearchDoc {
  key: string;
  title: string;
  author_name?: string[];
  author_key?: string[];
  cover_i?: number;
  first_publish_year?: number;
  subject?: string[];
  edition_count?: number;
  isbn?: string[];
  number_of_pages_median?: number;
  cover_edition_key?: string;
}

export interface OLWork {
  key: string;
  title: string;
  description?: string | { type: string; value: string };
  covers?: number[];
  subjects?: string[];
  authors?: Array<{
    author: { key: string };
    type?: { key: string };
  }>;
}

export interface OLAuthor {
  key: string;
  name: string;
  bio?: string | { type: string; value: string };
  photos?: number[];
}
