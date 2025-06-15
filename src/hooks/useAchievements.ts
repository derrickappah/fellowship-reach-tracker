
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Achievement, UserAchievement, TeamAchievement } from '@/types/achievements';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';

export const useAchievements = () => {
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [userAchievements, setUserAchievements] = useState<UserAchievement[]>([]);
  const [teamAchievements, setTeamAchievements] = useState<TeamAchievement[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();
  const { user } = useAuth();

  const fetchAchievements = async () => {
    try {
      setLoading(true);
      
      // Fetch all achievements
      const { data: achievementsData, error: achievementsError } = await supabase
        .from('achievements')
        .select('*')
        .order('threshold', { ascending: true });

      if (achievementsError) throw achievementsError;

      // Fetch user achievements
      const { data: userAchievementsData, error: userAchievementsError } = await supabase
        .from('user_achievements')
        .select(`
          *,
          achievement:achievements(*)
        `)
        .order('earned_at', { ascending: false });

      if (userAchievementsError) throw userAchievementsError;

      // Fetch team achievements
      const { data: teamAchievementsData, error: teamAchievementsError } = await supabase
        .from('team_achievements')
        .select(`
          *,
          achievement:achievements(*)
        `)
        .order('earned_at', { ascending: false });

      if (teamAchievementsError) throw teamAchievementsError;

      // Type cast the data to ensure proper typing
      setAchievements((achievementsData || []) as Achievement[]);
      setUserAchievements((userAchievementsData || []) as UserAchievement[]);
      setTeamAchievements((teamAchievementsData || []) as TeamAchievement[]);
    } catch (error: any) {
      console.log('Error fetching achievements:', error);
      toast({
        title: "Error fetching achievements",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const checkAndAwardAchievements = async (type: string, count: number, entityId?: string) => {
    try {
      const eligibleAchievements = achievements.filter(
        achievement => achievement.type === type && achievement.threshold <= count
      );

      for (const achievement of eligibleAchievements) {
        if (type.includes('team') && entityId) {
          // Check if team already has this achievement
          const existing = teamAchievements.find(
            ta => ta.team_id === entityId && ta.achievement_id === achievement.id
          );
          
          if (!existing) {
            await supabase
              .from('team_achievements')
              .insert({
                team_id: entityId,
                achievement_id: achievement.id
              });
          }
        } else if (user) {
          // Check if user already has this achievement
          const existing = userAchievements.find(
            ua => ua.user_id === user.id && ua.achievement_id === achievement.id
          );
          
          if (!existing) {
            await supabase
              .from('user_achievements')
              .insert({
                user_id: user.id,
                achievement_id: achievement.id
              });
          }
        }
      }
      
      fetchAchievements();
    } catch (error: any) {
      console.log('Error awarding achievements:', error);
    }
  };

  useEffect(() => {
    fetchAchievements();
  }, [user]);

  return {
    achievements,
    userAchievements,
    teamAchievements,
    loading,
    checkAndAwardAchievements,
    refetch: fetchAchievements,
  };
};
