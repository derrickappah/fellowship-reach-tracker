
export interface Achievement {
  id: string;
  name: string;
  description?: string;
  icon?: string;
  type: 'invitation_milestone' | 'team_performance' | 'individual_performance' | 'attendance_milestone' | 'goal_milestone' | 'leadership_milestone';
  threshold: number;
  badge_color?: string;
  created_at: string;
}

export interface UserAchievement {
  id: string;
  user_id: string;
  achievement_id: string;
  earned_at: string;
  achievement?: Achievement;
}

export interface TeamAchievement {
  id: string;
  team_id: string;
  achievement_id: string;
  earned_at: string;
  achievement?: Achievement;
}

export interface Goal {
  id: string;
  title: string;
  description?: string;
  target_value: number;
  current_value: number;
  goal_type: 'team' | 'individual';
  entity_id: string;
  deadline?: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}
