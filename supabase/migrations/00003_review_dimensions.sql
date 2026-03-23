-- ============================================
-- REVIEW DIMENSION RATINGS
-- Adds multi-dimensional rating fields to reviews
-- Each dimension uses a 1-10 scale (same as star_rating)
-- ============================================

ALTER TABLE public.reviews
  ADD COLUMN rating_writing   SMALLINT CHECK (rating_writing   BETWEEN 1 AND 10),
  ADD COLUMN rating_plot      SMALLINT CHECK (rating_plot      BETWEEN 1 AND 10),
  ADD COLUMN rating_character SMALLINT CHECK (rating_character BETWEEN 1 AND 10),
  ADD COLUMN rating_pacing    SMALLINT CHECK (rating_pacing    BETWEEN 1 AND 10),
  ADD COLUMN rating_enjoyment SMALLINT CHECK (rating_enjoyment BETWEEN 1 AND 10),
  ADD COLUMN mood_tags        TEXT[] DEFAULT '{}';
