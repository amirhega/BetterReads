export interface Book {
  id: string;
  ol_work_key: string;
  ol_edition_key: string | null;
  title: string;
  author_names: string[];
  ol_author_keys: string[];
  cover_edition_key: string | null;
  cover_i: number | null;
  first_publish_year: number | null;
  subjects: string[];
  description: string | null;
  isbn_13: string[];
  isbn_10: string[];
  page_count: number | null;
  fetched_at: string;
  created_at: string;
}

export interface BookSearchResult {
  ol_work_key: string;
  title: string;
  author_names: string[];
  cover_i: number | null;
  first_publish_year: number | null;
  subjects: string[];
  edition_count: number;
}

export type ShelfStatus = 'want_to_read' | 'currently_reading' | 'read';

export type ReadingFormat = 'physical' | 'ebook' | 'audiobook';

export interface LibraryEntry {
  id: string;
  user_id: string;
  book_id: string;
  shelf: ShelfStatus;
  started_at: string | null;
  finished_at: string | null;
  created_at: string;
  updated_at: string;
  book?: Book;
}

export interface DiaryEntry {
  id: string;
  user_id: string;
  book_id: string;
  library_entry_id: string | null;
  read_date: string;
  format: ReadingFormat | null;
  mood_tags: string[];
  notes: string | null;
  is_reread: boolean;
  is_finished: boolean;
  created_at: string;
  book?: Book;
}

export interface Review {
  id: string;
  user_id: string;
  book_id: string;
  star_rating: number | null;
  review_text: string | null;
  contains_spoilers: boolean;
  created_at: string;
  updated_at: string;
  book?: Book;
  profile?: Profile;
}

export interface Profile {
  id: string;
  username: string;
  display_name: string | null;
  avatar_url: string | null;
  bio: string | null;
  favorite_genres: string[];
  created_at: string;
  updated_at: string;
}

export interface RankedBook {
  id: string;
  user_id: string;
  book_id: string;
  rank_position: number;
  created_at: string;
  updated_at: string;
  book?: Book;
}

export type ActivityType =
  | 'shelved'
  | 'started_reading'
  | 'finished_reading'
  | 'reviewed'
  | 'ranked'
  | 'diary_entry'
  | 'followed_user';

export interface List {
  id: string;
  user_id: string;
  title: string;
  description: string | null;
  is_public: boolean;
  created_at: string;
  updated_at: string;
  items?: ListItem[];
  profile?: Profile;
}

export interface ListItem {
  id: string;
  list_id: string;
  book_id: string;
  position: number;
  notes: string | null;
  added_at: string;
  book?: Book;
}

export interface Activity {
  id: string;
  user_id: string;
  activity_type: ActivityType;
  book_id: string | null;
  target_user_id: string | null;
  metadata: Record<string, unknown>;
  created_at: string;
  book?: Book;
  profile?: Profile;
  target_profile?: Profile;
}
