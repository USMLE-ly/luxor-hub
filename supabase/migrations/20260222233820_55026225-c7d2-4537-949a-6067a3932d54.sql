
-- Create comments table for community looks
CREATE TABLE public.look_comments (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  look_id TEXT NOT NULL,
  look_type TEXT NOT NULL DEFAULT 'user',
  user_id UUID NOT NULL,
  content TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.look_comments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view comments" ON public.look_comments FOR SELECT USING (true);
CREATE POLICY "Users can create comments" ON public.look_comments FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can delete own comments" ON public.look_comments FOR DELETE USING (auth.uid() = user_id);

-- Enable realtime for comments
ALTER PUBLICATION supabase_realtime ADD TABLE public.look_comments;
