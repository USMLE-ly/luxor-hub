
-- Table for user-created inspiration looks
CREATE TABLE public.user_looks (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  occasion TEXT,
  mood TEXT,
  items TEXT[] NOT NULL DEFAULT '{}',
  is_public BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.user_looks ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own looks"
  ON public.user_looks FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can view public looks"
  ON public.user_looks FOR SELECT
  USING (is_public = true);

CREATE POLICY "Users can create their own looks"
  ON public.user_looks FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own looks"
  ON public.user_looks FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own looks"
  ON public.user_looks FOR DELETE
  USING (auth.uid() = user_id);

-- Table for saved/bookmarked looks (both curated and user-created)
CREATE TABLE public.saved_looks (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  look_id TEXT NOT NULL,
  look_type TEXT NOT NULL DEFAULT 'curated',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, look_id, look_type)
);

ALTER TABLE public.saved_looks ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own saved looks"
  ON public.saved_looks FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can save looks"
  ON public.saved_looks FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can unsave looks"
  ON public.saved_looks FOR DELETE
  USING (auth.uid() = user_id);
