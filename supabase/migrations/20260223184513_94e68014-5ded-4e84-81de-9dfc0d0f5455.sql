
-- Allow anyone to read outfit_analyses for leaderboard (aggregated data)
CREATE POLICY "Anyone can view analyses for leaderboard"
ON public.outfit_analyses
FOR SELECT
USING (true);

-- Drop the restrictive select policy since we now have a permissive one
DROP POLICY IF EXISTS "Users can view own analyses" ON public.outfit_analyses;
