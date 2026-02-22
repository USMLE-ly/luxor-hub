
-- Follows table
CREATE TABLE public.follows (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  follower_id UUID NOT NULL,
  following_id UUID NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(follower_id, following_id)
);

ALTER TABLE public.follows ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can follow others" ON public.follows FOR INSERT WITH CHECK (auth.uid() = follower_id);
CREATE POLICY "Users can unfollow" ON public.follows FOR DELETE USING (auth.uid() = follower_id);
CREATE POLICY "Anyone can see follows" ON public.follows FOR SELECT USING (true);

-- Look likes table
CREATE TABLE public.look_likes (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  look_id TEXT NOT NULL,
  look_type TEXT NOT NULL DEFAULT 'user',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, look_id, look_type)
);

ALTER TABLE public.look_likes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can like looks" ON public.look_likes FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can unlike looks" ON public.look_likes FOR DELETE USING (auth.uid() = user_id);
CREATE POLICY "Anyone can see likes" ON public.look_likes FOR SELECT USING (true);

-- Add like_count to user_looks for quick access
ALTER TABLE public.user_looks ADD COLUMN IF NOT EXISTS author_name TEXT;
