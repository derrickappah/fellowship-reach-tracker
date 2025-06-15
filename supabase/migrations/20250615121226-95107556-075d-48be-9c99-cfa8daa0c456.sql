
-- Drop the old restrictive SELECT policies that prevent the leaderboard from working
DROP POLICY "Users can see their own earned achievements" ON public.user_achievements;
DROP POLICY "Team members can see their team's earned achievements" ON public.team_achievements;

-- Create new policies that allow all authenticated users to view all user and team achievements for the leaderboard
CREATE POLICY "Allow authenticated users to read all user achievements"
ON public.user_achievements
FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "Allow authenticated users to read all team achievements"
ON public.team_achievements
FOR SELECT
TO authenticated
USING (true);
