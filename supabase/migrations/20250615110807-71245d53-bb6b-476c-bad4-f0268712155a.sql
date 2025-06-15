
-- Create achievements table to define different achievement types
CREATE TABLE public.achievements (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  icon TEXT, -- lucide icon name
  type TEXT NOT NULL CHECK (type IN ('invitation_milestone', 'team_performance', 'individual_performance')),
  threshold INTEGER NOT NULL, -- number needed to unlock achievement
  badge_color TEXT DEFAULT 'blue',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create user_achievements table to track which users have earned which achievements
CREATE TABLE public.user_achievements (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  achievement_id UUID NOT NULL REFERENCES public.achievements(id) ON DELETE CASCADE,
  earned_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, achievement_id)
);

-- Create team_achievements table to track team-level achievements
CREATE TABLE public.team_achievements (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  team_id UUID NOT NULL REFERENCES public.teams(id) ON DELETE CASCADE,
  achievement_id UUID NOT NULL REFERENCES public.achievements(id) ON DELETE CASCADE,
  earned_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(team_id, achievement_id)
);

-- Create goals table for tracking team and individual goals
CREATE TABLE public.goals (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  target_value INTEGER NOT NULL,
  current_value INTEGER DEFAULT 0,
  goal_type TEXT NOT NULL CHECK (goal_type IN ('team', 'individual')),
  entity_id UUID NOT NULL, -- team_id or user_id depending on goal_type
  deadline DATE,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on all tables
ALTER TABLE public.achievements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_achievements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.team_achievements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.goals ENABLE ROW LEVEL SECURITY;

-- RLS policies for achievements (read-only for all authenticated users)
CREATE POLICY "Anyone can view achievements" 
  ON public.achievements 
  FOR SELECT 
  TO authenticated
  USING (true);

-- RLS policies for user_achievements
CREATE POLICY "Users can view all user achievements" 
  ON public.user_achievements 
  FOR SELECT 
  TO authenticated
  USING (true);

CREATE POLICY "Users can insert their own achievements" 
  ON public.user_achievements 
  FOR INSERT 
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- RLS policies for team_achievements
CREATE POLICY "Users can view all team achievements" 
  ON public.team_achievements 
  FOR SELECT 
  TO authenticated
  USING (true);

CREATE POLICY "Team members can insert team achievements" 
  ON public.team_achievements 
  FOR INSERT 
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.team_members 
      WHERE team_id = team_achievements.team_id 
      AND user_id = auth.uid()
    ) OR
    EXISTS (
      SELECT 1 FROM public.teams 
      WHERE id = team_achievements.team_id 
      AND leader_id = auth.uid()
    )
  );

-- RLS policies for goals
CREATE POLICY "Users can view relevant goals" 
  ON public.goals 
  FOR SELECT 
  TO authenticated
  USING (
    (goal_type = 'individual' AND entity_id = auth.uid()) OR
    (goal_type = 'team' AND EXISTS (
      SELECT 1 FROM public.team_members 
      WHERE team_id = entity_id 
      AND user_id = auth.uid()
    )) OR
    (goal_type = 'team' AND EXISTS (
      SELECT 1 FROM public.teams 
      WHERE id = entity_id 
      AND leader_id = auth.uid()
    ))
  );

CREATE POLICY "Users can manage their own goals" 
  ON public.goals 
  FOR ALL 
  TO authenticated
  USING (
    (goal_type = 'individual' AND entity_id = auth.uid()) OR
    (goal_type = 'team' AND EXISTS (
      SELECT 1 FROM public.teams 
      WHERE id = entity_id 
      AND leader_id = auth.uid()
    ))
  )
  WITH CHECK (
    (goal_type = 'individual' AND entity_id = auth.uid()) OR
    (goal_type = 'team' AND EXISTS (
      SELECT 1 FROM public.teams 
      WHERE id = entity_id 
      AND leader_id = auth.uid()
    ))
  );

-- Insert some default achievements
INSERT INTO public.achievements (name, description, icon, type, threshold, badge_color) VALUES
('First Invitation', 'Send your first invitation', 'UserPlus', 'invitation_milestone', 1, 'green'),
('Invitation Starter', 'Send 5 invitations', 'Users', 'invitation_milestone', 5, 'blue'),
('Invitation Pro', 'Send 25 invitations', 'Crown', 'invitation_milestone', 25, 'purple'),
('Invitation Master', 'Send 100 invitations', 'Trophy', 'invitation_milestone', 100, 'gold'),
('Team Player', 'Be part of an active team', 'Group', 'team_performance', 1, 'green'),
('Team Leader', 'Lead a successful team for 30 days', 'Star', 'team_performance', 30, 'purple');
