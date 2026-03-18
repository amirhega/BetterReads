-- ============================================
-- USER LISTS (custom book collections)
-- ============================================
CREATE TABLE public.lists (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  is_public BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_lists_user ON public.lists(user_id, updated_at DESC);

CREATE TABLE public.list_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  list_id UUID NOT NULL REFERENCES public.lists(id) ON DELETE CASCADE,
  book_id UUID NOT NULL REFERENCES public.books(id) ON DELETE CASCADE,
  position INTEGER NOT NULL DEFAULT 0,
  notes TEXT,
  added_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(list_id, book_id)
);

CREATE INDEX idx_list_items_list ON public.list_items(list_id, position ASC);

-- RLS for lists
ALTER TABLE public.lists ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public lists are readable" ON public.lists FOR SELECT USING (is_public = true OR auth.uid() = user_id);
CREATE POLICY "Users can insert own lists" ON public.lists FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own lists" ON public.lists FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own lists" ON public.lists FOR DELETE USING (auth.uid() = user_id);

-- RLS for list items
ALTER TABLE public.list_items ENABLE ROW LEVEL SECURITY;
CREATE POLICY "List items follow list visibility" ON public.list_items FOR SELECT USING (
  EXISTS (SELECT 1 FROM public.lists WHERE id = list_id AND (is_public = true OR auth.uid() = user_id))
);
CREATE POLICY "Users can insert items to own lists" ON public.list_items FOR INSERT WITH CHECK (
  EXISTS (SELECT 1 FROM public.lists WHERE id = list_id AND auth.uid() = user_id)
);
CREATE POLICY "Users can update items in own lists" ON public.list_items FOR UPDATE USING (
  EXISTS (SELECT 1 FROM public.lists WHERE id = list_id AND auth.uid() = user_id)
);
CREATE POLICY "Users can delete items from own lists" ON public.list_items FOR DELETE USING (
  EXISTS (SELECT 1 FROM public.lists WHERE id = list_id AND auth.uid() = user_id)
);
