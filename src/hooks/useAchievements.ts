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

  const initializeAchievements = async () => {
    console.log('Initializing achievements...');
    
    // Check if achievements already exist
    const { data: existingAchievements } = await supabase
      .from('achievements')
      .select('*')
      .limit(1);

    if (existingAchievements && existingAchievements.length > 0) {
      console.log('Achievements already exist, skipping initialization');
      return;
    }

    // Create sample achievements
    const sampleAchievements = [
      {
        name: 'First Invite',
        description: 'Invite your first person to church',
        type: 'invitation_milestone',
        threshold: 1,
        icon: 'Star',
        badge_color: 'blue'
      },
      {
        name: 'Growing Network',
        description: 'Invite 3 people in a month',
        type: 'invitation_milestone',
        threshold: 3,
        icon: 'Trophy',
        badge_color: 'green'
      },
      {
        name: 'Super Inviter',
        description: 'Invite 5 people in a month',
        type: 'invitation_milestone',
        threshold: 5,
        icon: 'Award',
        badge_color: 'gold'
      },
      {
        name: 'Invitation Champion',
        description: 'Invite 10 people in a month',
        type: 'invitation_milestone',
        threshold: 10,
        icon: 'Trophy',
        badge_color: 'purple'
      },
      // New Team Achievements
      {
        name: 'Team Starter',
        description: 'Your team invites 10 people in a month',
        type: 'team_performance',
        threshold: 10,
        icon: 'Users',
        badge_color: 'blue'
      },
      {
        name: 'Team Growth',
        description: 'Your team invites 25 people in a month',
        type: 'team_performance',
        threshold: 25,
        icon: 'Users',
        badge_color: 'green'
      },
      {
        name: 'Team Powerhouse',
        description: 'Your team invites 50 people in a month',
        type: 'team_performance',
        threshold: 50,
        icon: 'Trophy',
        badge_color: 'gold'
      },
      // New Individual Lifetime Achievements
      {
        name: 'Consistent Contributor',
        description: 'Invite a total of 25 people',
        type: 'individual_performance',
        threshold: 25,
        icon: 'Award',
        badge_color: 'green'
      },
      {
        name: 'Community Builder',
        description: 'Invite a total of 50 people',
        type: 'individual_performance',
        threshold: 50,
        icon: 'Trophy',
        badge_color: 'purple'
      },
    ];

    try {
      const { error } = await supabase
        .from('achievements')
        .insert(sampleAchievements);

      if (error) {
        console.log('Error creating sample achievements:', error);
      } else {
        console.log('Sample achievements created successfully');
      }
    } catch (error) {
      console.log('Error initializing achievements:', error);
    }
  };

  const fetchAchievements = async () => {
    try {
      setLoading(true);
      
      // Initialize achievements if none exist
      await initializeAchievements();
      
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

  const getMonthlyInviteCount = async (userId: string, date: Date = new Date()) => {
    const startOfMonth = new Date(date.getFullYear(), date.getMonth(), 1);
    startOfMonth.setHours(0, 0, 0, 0);
    
    const endOfMonth = new Date(date.getFullYear(), date.getMonth() + 1, 0);
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

  const getTeamMonthlyInviteCount = async (teamId: string, date: Date = new Date()) => {
    const startOfMonth = new Date(date.getFullYear(), date.getMonth(), 1);
    startOfMonth.setHours(0, 0, 0, 0);
    
    const endOfMonth = new Date(date.getFullYear(), date.getMonth() + 1, 0);
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

  const getTotalInviteCount = async (userId: string) => {
    const { count, error } = await supabase
      .from('invitees')
      .select('id', { count: 'exact', head: true })
      .eq('invited_by', userId);

    if (error) {
      console.log('Error getting total invite count:', error);
      return 0;
    }
    return count || 0;
  };

  const checkAndAwardAchievements = async (userId?: string, teamId?: string) => {
    try {
      console.log('Checking achievements for user:', userId, 'team:', teamId);

      const checkMonthlyAchievements = async (date: Date) => {
        // Individual monthly achievements
        if (userId) {
          const monthlyInviteCount = await getMonthlyInviteCount(userId, date);
          const eligibleAchievements = achievements.filter(
            achievement => achievement.type === 'invitation_milestone' && achievement.threshold <= monthlyInviteCount
          );

          for (const achievement of eligibleAchievements) {
            const startOfMonth = new Date(date.getFullYear(), date.getMonth(), 1);
            const endOfMonth = new Date(date.getFullYear(), date.getMonth() + 1, 0);
            endOfMonth.setHours(23, 59, 59, 999);

            const { data: existingAchievement } = await supabase
              .from('user_achievements')
              .select('id')
              .eq('user_id', userId)
              .eq('achievement_id', achievement.id)
              .gte('earned_at', startOfMonth.toISOString())
              .lte('earned_at', endOfMonth.toISOString())
              .single();
            
            if (!existingAchievement) {
              console.log(`Awarding monthly achievement for ${date.toISOString().slice(0,7)}:`, achievement.name);
              const { error } = await supabase
                .from('user_achievements')
                .insert({ user_id: userId, achievement_id: achievement.id, earned_at: endOfMonth.toISOString() });

              if (error) console.log('Error awarding user achievement:', error);
              else toast({ title: "Achievement Unlocked! 🏆", description: `You earned: ${achievement.name}` });
            }
          }
        }

        // Team monthly achievements
        if (teamId) {
          const teamMonthlyInviteCount = await getTeamMonthlyInviteCount(teamId, date);
          const eligibleTeamAchievements = achievements.filter(
            achievement => achievement.type === 'team_performance' && achievement.threshold <= teamMonthlyInviteCount
          );

          for (const achievement of eligibleTeamAchievements) {
            const startOfMonth = new Date(date.getFullYear(), date.getMonth(), 1);
            const endOfMonth = new Date(date.getFullYear(), date.getMonth() + 1, 0);
            endOfMonth.setHours(23, 59, 59, 999);

            const { data: existingAchievement } = await supabase
              .from('team_achievements')
              .select('id')
              .eq('team_id', teamId)
              .eq('achievement_id', achievement.id)
              .gte('earned_at', startOfMonth.toISOString())
              .lte('earned_at', endOfMonth.toISOString())
              .single();
            
            if (!existingAchievement) {
              console.log(`Awarding team monthly achievement for ${date.toISOString().slice(0,7)}:`, achievement.name);
              const { error } = await supabase
                .from('team_achievements')
                .insert({ team_id: teamId, achievement_id: achievement.id, earned_at: endOfMonth.toISOString() });

              if (error) console.log('Error awarding team achievement:', error);
              else toast({ title: "Team Achievement Unlocked! 🏆", description: `Your team earned: ${achievement.name}` });
            }
          }
        }
      };

      const checkLifetimeAchievements = async () => {
        if (userId) {
          const totalInviteCount = await getTotalInviteCount(userId);
          const eligibleLifetimeAchievements = achievements.filter(
            a => a.type === 'individual_performance' && a.threshold <= totalInviteCount
          );

          for (const achievement of eligibleLifetimeAchievements) {
            const { data: existingAchievement } = await supabase
              .from('user_achievements')
              .select('id')
              .eq('user_id', userId)
              .eq('achievement_id', achievement.id)
              .single();

            if (!existingAchievement) {
              console.log('Awarding lifetime achievement:', achievement.name);
              const { error } = await supabase
                .from('user_achievements')
                .insert({ user_id: userId, achievement_id: achievement.id });
              
              if (error) console.log('Error awarding lifetime achievement:', error);
              else toast({ title: "Achievement Unlocked! 🏆", description: `You earned: ${achievement.name}` });
            }
          }
        }
      };
      
      const now = new Date();
      const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);

      await checkMonthlyAchievements(now);
      await checkMonthlyAchievements(lastMonth);
      await checkLifetimeAchievements();
      
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
