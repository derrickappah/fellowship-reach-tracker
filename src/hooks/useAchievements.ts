
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

  const getMonthlyInviteCount = async (userId: string) => {
    const startOfMonth = new Date();
    startOfMonth.setDate(1);
    startOfMonth.setHours(0, 0, 0, 0);
    
    const endOfMonth = new Date();
    endOfMonth.setMonth(endOfMonth.getMonth() + 1);
    endOfMonth.setDate(0);
    endOfMonth.setHours(23, 59, 59, 999);

    const { data, error } = await supabase
      .from('invitees')
      .select('id')
      .eq('invited_by', userId)
      .gte('invite_date', startOfMonth.toISOString())
      .lte('invite_date', endOfMonth.toISOString());

    if (error) {
      console.log('Error getting monthly invite count:', error);
      return 0;
    }

    return data?.length || 0;
  };

  const getTeamMonthlyInviteCount = async (teamId: string) => {
    const startOfMonth = new Date();
    startOfMonth.setDate(1);
    startOfMonth.setHours(0, 0, 0, 0);
    
    const endOfMonth = new Date();
    endOfMonth.setMonth(endOfMonth.getMonth() + 1);
    endOfMonth.setDate(0);
    endOfMonth.setHours(23, 59, 59, 999);

    const { data, error } = await supabase
      .from('invitees')
      .select('id')
      .eq('team_id', teamId)
      .gte('invite_date', startOfMonth.toISOString())
      .lte('invite_date', endOfMonth.toISOString());

    if (error) {
      console.log('Error getting team monthly invite count:', error);
      return 0;
    }

    return data?.length || 0;
  };

  const checkAndAwardAchievements = async (userId?: string, teamId?: string) => {
    try {
      console.log('Checking achievements for user:', userId, 'team:', teamId);
      
      // Check individual achievements
      if (userId) {
        const monthlyInviteCount = await getMonthlyInviteCount(userId);
        console.log('Monthly invite count for user:', monthlyInviteCount);
        
        const eligibleAchievements = achievements.filter(
          achievement => achievement.type === 'invitation_milestone' && achievement.threshold <= monthlyInviteCount
        );

        for (const achievement of eligibleAchievements) {
          // Check if user already has this achievement for this month
          const startOfMonth = new Date();
          startOfMonth.setDate(1);
          startOfMonth.setHours(0, 0, 0, 0);

          const { data: existingAchievement } = await supabase
            .from('user_achievements')
            .select('id')
            .eq('user_id', userId)
            .eq('achievement_id', achievement.id)
            .gte('earned_at', startOfMonth.toISOString())
            .single();
          
          if (!existingAchievement) {
            console.log('Awarding achievement:', achievement.name);
            const { error } = await supabase
              .from('user_achievements')
              .insert({
                user_id: userId,
                achievement_id: achievement.id
              });

            if (error) {
              console.log('Error awarding user achievement:', error);
            } else {
              toast({
                title: "Achievement Unlocked! 🏆",
                description: `You earned: ${achievement.name}`,
              });
            }
          }
        }
      }

      // Check team achievements
      if (teamId) {
        const teamMonthlyInviteCount = await getTeamMonthlyInviteCount(teamId);
        console.log('Monthly invite count for team:', teamMonthlyInviteCount);
        
        const eligibleTeamAchievements = achievements.filter(
          achievement => achievement.type === 'team_performance' && achievement.threshold <= teamMonthlyInviteCount
        );

        for (const achievement of eligibleTeamAchievements) {
          // Check if team already has this achievement for this month
          const startOfMonth = new Date();
          startOfMonth.setDate(1);
          startOfMonth.setHours(0, 0, 0, 0);

          const { data: existingAchievement } = await supabase
            .from('team_achievements')
            .select('id')
            .eq('team_id', teamId)
            .eq('achievement_id', achievement.id)
            .gte('earned_at', startOfMonth.toISOString())
            .single();
          
          if (!existingAchievement) {
            console.log('Awarding team achievement:', achievement.name);
            const { error } = await supabase
              .from('team_achievements')
              .insert({
                team_id: teamId,
                achievement_id: achievement.id
              });

            if (error) {
              console.log('Error awarding team achievement:', error);
            } else {
              toast({
                title: "Team Achievement Unlocked! 🏆",
                description: `Your team earned: ${achievement.name}`,
              });
            }
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
