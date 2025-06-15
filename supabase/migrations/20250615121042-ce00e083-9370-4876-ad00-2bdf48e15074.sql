
-- This migration adds security policies to allow achievements to be created and viewed.

-- Policies for the main 'achievements' table
ALTER TABLE public.achievements ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow authenticated users to read all achievements"
ON public.achievements
FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "Allow authenticated users to create achievements"
ON public.achievements
FOR INSERT
TO authenticated
WITH CHECK (true);

-- Policies for 'user_achievements' to see what you've earned
ALTER TABLE public.user_achievements ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can see their own earned achievements"
ON public.user_achievements
FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Allow achievements to be awarded to users"
ON public.user_achievements
FOR INSERT
TO authenticated
WITH CHECK (true);

-- Policies for 'team_achievements' to see what your team has earned
ALTER TABLE public.team_achievements ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Team members can see their team's earned achievements"
ON public.team_achievements
FOR SELECT
TO authenticated
USING (EXISTS (
  SELECT 1 FROM public.team_members tm
  WHERE tm.team_id = team_achievements.team_id AND tm.user_id = auth.uid()
));

CREATE POLICY "Allow achievements to be awarded to teams"
ON public.team_achievements
FOR INSERT
TO authenticated
WITH CHECK (true);
