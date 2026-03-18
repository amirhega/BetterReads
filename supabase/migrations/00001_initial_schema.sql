-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS pg_trgm;

-- ============================================
-- PROFILES (extends Supabase Auth)
-- ============================================
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  username TEXT UNIQUE NOT NULL,
  display_name TEXT,
  avatar_url TEXT,
  bio TEXT,
  favorite_genres TEXT[] DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, username, display_name)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'username', 'user_' || LEFT(NEW.id::text, 8)),
    NEW.raw_user_meta_data->>'display_name'
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ============================================
-- BOOKS (local cache of Open Library data)
-- ============================================
CREATE TABLE public.books (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  ol_work_key TEXT UNIQUE NOT NULL,
  ol_edition_key TEXT,
  title TEXT NOT NULL,
  author_names TEXT[] DEFAULT '{}',
  ol_author_keys TEXT[] DEFAULT '{}',
  cover_edition_key TEXT,
  cover_i INTEGER,
  first_publish_year INTEGER,
  subjects TEXT[] DEFAULT '{}',
  description TEXT,
  isbn_13 TEXT[],
  isbn_10 TEXT[],
  page_count INTEGER,
  fetched_at TIMESTAMPTZ DEFAULT now(),
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_books_ol_work_key ON public.books(ol_work_key);
CREATE INDEX idx_books_title_trgm ON public.books USING gin(title gin_trgm_ops);

-- ============================================
-- LIBRARY ENTRIES (Shelves)
-- ============================================
CREATE TYPE shelf_status AS ENUM ('want_to_read', 'currently_reading', 'read');

CREATE TABLE public.library_entries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  book_id UUID NOT NULL REFERENCES public.books(id) ON DELETE CASCADE,
  shelf shelf_status NOT NULL DEFAULT 'want_to_read',
  started_at DATE,
  finished_at DATE,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(user_id, book_id)
);

CREATE INDEX idx_library_user_shelf ON public.library_entries(user_id, shelf);

-- ============================================
-- READING DIARY ENTRIES
-- ============================================
CREATE TYPE reading_format AS ENUM ('physical', 'ebook', 'audiobook');

CREATE TABLE public.diary_entries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  book_id UUID NOT NULL REFERENCES public.books(id) ON DELETE CASCADE,
  library_entry_id UUID REFERENCES public.library_entries(id) ON DELETE SET NULL,
  read_date DATE NOT NULL DEFAULT CURRENT_DATE,
  format reading_format,
  mood_tags TEXT[] DEFAULT '{}',
  notes TEXT,
  is_reread BOOLEAN DEFAULT false,
  is_finished BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_diary_user_date ON public.diary_entries(user_id, read_date DESC);

-- ============================================
-- REVIEWS
-- ============================================
CREATE TABLE public.reviews (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  book_id UUID NOT NULL REFERENCES public.books(id) ON DELETE CASCADE,
  star_rating SMALLINT CHECK (star_rating BETWEEN 1 AND 10),
  review_text TEXT,
  contains_spoilers BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(user_id, book_id)
);

CREATE INDEX idx_reviews_book ON public.reviews(book_id);
CREATE INDEX idx_reviews_user ON public.reviews(user_id, created_at DESC);

-- ============================================
-- RANKINGS (Beli-style comparative)
-- ============================================
CREATE TABLE public.rankings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  book_id UUID NOT NULL REFERENCES public.books(id) ON DELETE CASCADE,
  rank_position DOUBLE PRECISION NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(user_id, book_id)
);

CREATE INDEX idx_rankings_user_pos ON public.rankings(user_id, rank_position ASC);

-- ============================================
-- FOLLOWS (Social Graph)
-- ============================================
CREATE TABLE public.follows (
  follower_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  following_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT now(),
  PRIMARY KEY (follower_id, following_id),
  CHECK (follower_id <> following_id)
);

CREATE INDEX idx_follows_following ON public.follows(following_id);

-- ============================================
-- ACTIVITY FEED
-- ============================================
CREATE TYPE activity_type AS ENUM (
  'shelved', 'started_reading', 'finished_reading',
  'reviewed', 'ranked', 'diary_entry', 'followed_user'
);

CREATE TABLE public.activities (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  activity_type activity_type NOT NULL,
  book_id UUID REFERENCES public.books(id) ON DELETE CASCADE,
  target_user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_activities_user ON public.activities(user_id, created_at DESC);
CREATE INDEX idx_activities_created ON public.activities(created_at DESC);

-- ============================================
-- ROW LEVEL SECURITY
-- ============================================

-- Profiles
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Profiles are publicly readable" ON public.profiles FOR SELECT USING (true);
CREATE POLICY "Users can update own profile" ON public.profiles FOR UPDATE USING (auth.uid() = id);

-- Books
ALTER TABLE public.books ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Books are publicly readable" ON public.books FOR SELECT USING (true);
CREATE POLICY "Authenticated users can insert books" ON public.books FOR INSERT WITH CHECK (auth.role() = 'authenticated');

-- Library entries
ALTER TABLE public.library_entries ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Library entries are publicly readable" ON public.library_entries FOR SELECT USING (true);
CREATE POLICY "Users can insert own library entries" ON public.library_entries FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own library entries" ON public.library_entries FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own library entries" ON public.library_entries FOR DELETE USING (auth.uid() = user_id);

-- Diary entries
ALTER TABLE public.diary_entries ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Diary entries are publicly readable" ON public.diary_entries FOR SELECT USING (true);
CREATE POLICY "Users can insert own diary entries" ON public.diary_entries FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own diary entries" ON public.diary_entries FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own diary entries" ON public.diary_entries FOR DELETE USING (auth.uid() = user_id);

-- Reviews
ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Reviews are publicly readable" ON public.reviews FOR SELECT USING (true);
CREATE POLICY "Users can insert own reviews" ON public.reviews FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own reviews" ON public.reviews FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own reviews" ON public.reviews FOR DELETE USING (auth.uid() = user_id);

-- Rankings
ALTER TABLE public.rankings ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Rankings are publicly readable" ON public.rankings FOR SELECT USING (true);
CREATE POLICY "Users can insert own rankings" ON public.rankings FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own rankings" ON public.rankings FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own rankings" ON public.rankings FOR DELETE USING (auth.uid() = user_id);

-- Follows
ALTER TABLE public.follows ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Follows are publicly readable" ON public.follows FOR SELECT USING (true);
CREATE POLICY "Users can insert own follows" ON public.follows FOR INSERT WITH CHECK (auth.uid() = follower_id);
CREATE POLICY "Users can delete own follows" ON public.follows FOR DELETE USING (auth.uid() = follower_id);

-- Activities
ALTER TABLE public.activities ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Activities are publicly readable" ON public.activities FOR SELECT USING (true);
CREATE POLICY "Users can create own activities" ON public.activities FOR INSERT WITH CHECK (auth.uid() = user_id);
