
CREATE TABLE public.mood_boards (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  name text NOT NULL,
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

ALTER TABLE public.mood_boards ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own boards" ON public.mood_boards FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create own boards" ON public.mood_boards FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own boards" ON public.mood_boards FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own boards" ON public.mood_boards FOR DELETE USING (auth.uid() = user_id);

CREATE TABLE public.mood_board_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  board_id uuid NOT NULL REFERENCES public.mood_boards(id) ON DELETE CASCADE,
  type text NOT NULL DEFAULT 'image',
  content jsonb NOT NULL DEFAULT '{}'::jsonb,
  position_x float NOT NULL DEFAULT 0,
  position_y float NOT NULL DEFAULT 0,
  width float NOT NULL DEFAULT 180,
  height float NOT NULL DEFAULT 180,
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

ALTER TABLE public.mood_board_items ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own board items" ON public.mood_board_items FOR SELECT
  USING (EXISTS (SELECT 1 FROM public.mood_boards WHERE id = mood_board_items.board_id AND user_id = auth.uid()));
CREATE POLICY "Users can create own board items" ON public.mood_board_items FOR INSERT
  WITH CHECK (EXISTS (SELECT 1 FROM public.mood_boards WHERE id = mood_board_items.board_id AND user_id = auth.uid()));
CREATE POLICY "Users can update own board items" ON public.mood_board_items FOR UPDATE
  USING (EXISTS (SELECT 1 FROM public.mood_boards WHERE id = mood_board_items.board_id AND user_id = auth.uid()));
CREATE POLICY "Users can delete own board items" ON public.mood_board_items FOR DELETE
  USING (EXISTS (SELECT 1 FROM public.mood_boards WHERE id = mood_board_items.board_id AND user_id = auth.uid()));
