-- Table for per-user mannequin state persistence
CREATE TABLE IF NOT EXISTS public.mannequin_state (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  gender text NOT NULL DEFAULT 'male',
  dna jsonb NOT NULL DEFAULT '{"height":0.5,"shoulder":0.5,"waist":0.5,"hips":0.5,"legLength":0.5}',
  pose text NOT NULL DEFAULT 'neutral',
  tracing_url text,
  tracing_opacity real NOT NULL DEFAULT 0.3,
  show_measurements boolean NOT NULL DEFAULT false,
  clothing jsonb NOT NULL DEFAULT '[]',
  updated_at timestamptz DEFAULT now()
);

-- Unique constraint: one state row per user
CREATE UNIQUE INDEX IF NOT EXISTS idx_mannequin_state_user
ON public.mannequin_state (user_id);
