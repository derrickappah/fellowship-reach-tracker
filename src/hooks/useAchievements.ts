
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
    
    // Fetch existing achievement names to avoid duplicates
    const { data: existingAchievements, error: fetchError } = await supabase
      .from('achievements')
      .select('name');

    if (fetchError) {
      console.log('Error fetching existing achievements:', fetchError);
      return;
    }

    const existingAchievementNames = existingAchievements.map(a => a.name);

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
      {
        name: 'Invitation Gladiator',
        description: 'Invite 20 people in a month',
        type: 'invitation_milestone',
        threshold: 20,
        icon: 'Trophy',
        badge_color: 'gold'
      },
      // Team Achievements
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
      {
        name: 'Team Juggernaut',
        description: 'Your team invites 100 people in a month',
        type: 'team_performance',
        threshold: 100,
        icon: 'Trophy',
        badge_color: 'purple'
      },
      // Individual Lifetime Achievements
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
      {
        name: 'Community Pillar',
        description: 'Invite a total of 100 people',
        type: 'individual_performance',
        threshold: 100,
        icon: 'Award',
        badge_color: 'gold'
      },
      {
        name: 'Church Influencer',
        description: 'Invite a total of 250 people',
        type: 'individual_performance',
        threshold: 250,
        icon: 'Trophy',
        badge_color: 'purple'
      },
      // Attendance-based Achievements
      {
        name: 'First Follow-Up',
        description: 'Your first invitee attended a service',
        type: 'attendance_milestone',
        threshold: 1,
        icon: 'UserCheck',
        badge_color: 'blue'
      },
      {
        name: 'Effective Host',
        description: 'A total of 5 invitees attended a service',
        type: 'attendance_milestone',
        threshold: 5,
        icon: 'Users',
        badge_color: 'green'
      },
      {
        name: 'Shepherd',
        description: 'A total of 10 invitees attended a service',
        type: 'attendance_milestone',
        threshold: 10,
        icon: 'Heart',
        badge_color: 'purple'
      },
      {
        name: 'Faithful Shepherd',
        description: 'A total of 25 invitees attended a service',
        type: 'attendance_milestone',
        threshold: 25,
        icon: 'Heart',
        badge_color: 'gold'
      },
      {
        name: 'Master Shepherd',
        description: 'A total of 50 invitees attended a service',
        type: 'attendance_milestone',
        threshold: 50,
        icon: 'Trophy',
        badge_color: 'purple'
      },
      // Goal-based Achievements
      {
        name: 'Goal Getter',
        description: 'Complete your first goal',
        type: 'goal_milestone',
        threshold: 1,
        icon: 'Target',
        badge_color: 'blue'
      },
      {
        name: 'High Achiever',
        description: 'Complete 5 goals',
        type: 'goal_milestone',
        threshold: 5,
        icon: 'Target',
        badge_color: 'gold'
      },
      {
        name: 'Goal Master',
        description: 'Complete 10 goals',
        type: 'goal_milestone',
        threshold: 10,
        icon: 'Target',
        badge_color: 'purple'
      },
      // Leadership Achievements
      {
        name: 'Team Leader',
        description: 'Become a leader of a team',
        type: 'leadership_milestone',
        threshold: 1,
        icon: 'UserCog',
        badge_color: 'purple'
      },
    ];

    const newAchievementsToInsert = sampleAchievements.filter(
      (achievement) => !existingAchievementNames.includes(achievement.name)
    );

    if (newAchievementsToInsert.length === 0) {
      console.log('All defined achievements already exist in the database.');
      return;
    }

    console.log(`Found ${newAchievementsToInsert.length} new achievements to insert.`);

    try {
      const { error } = await supabase
        .from('achievements')
        .insert(newAchievementsToInsert);

      if (error) {
        console.log('Error creating sample achievements:', error);
      } else {
        console.log('New sample achievements created successfully');
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

  const getAttendanceCount = async (userId: string) => {
    const { count, error } = await supabase
      .from('invitees')
      .select('id', { count: 'exact', head: true })
      .eq('invited_by', userId)
      .eq('status', 'attended');

    if (error) {
      console.log('Error getting attendance count:', error);
      return 0;
    }
    return count || 0;
  };

  const getCompletedGoalsCount = async (userId: string) => {
    const { data, error } = await supabase
      .from('goals')
      .select('current_value, target_value')
      .eq('entity_id', userId)
      .eq('goal_type', 'individual');

    if (error) {
      console.log('Error getting goals for count:', error);
      return 0;
    }

    const completedGoals = data.filter(
      (goal) => goal.current_value !== null && goal.current_value >= goal.target_value
    );

    return completedGoals.length;
  };

  const checkIsTeamLeader = async (userId: string) => {
    const { count, error } = await supabase
      .from('teams')
      .select('id', { count: 'exact', head: true })
      .eq('leader_id', userId);

    if (error) {
      console.log('Error checking team leader status:', error);
      return false;
    }
    return (count || 0) > 0;
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

      const checkAttendanceAchievements = async () => {
        if (userId) {
          const attendanceCount = await getAttendanceCount(userId);
          const eligibleAttendanceAchievements = achievements.filter(
            a => a.type === 'attendance_milestone' && a.threshold <= attendanceCount
          );

          for (const achievement of eligibleAttendanceAchievements) {
            const { data: existingAchievement } = await supabase
              .from('user_achievements')
              .select('id')
              .eq('user_id', userId)
              .eq('achievement_id', achievement.id)
              .single();

            if (!existingAchievement) {
              console.log('Awarding attendance achievement:', achievement.name);
              const { error } = await supabase
                .from('user_achievements')
                .insert({ user_id: userId, achievement_id: achievement.id });
              
              if (error) console.log('Error awarding attendance achievement:', error);
              else toast({ title: "Achievement Unlocked! 🏆", description: `You earned: ${achievement.name}` });
            }
          }
        }
      };

      const checkGoalAchievements = async () => {
        if (userId) {
          const completedGoalsCount = await getCompletedGoalsCount(userId);
          const eligibleGoalAchievements = achievements.filter(
            a => a.type === 'goal_milestone' && a.threshold <= completedGoalsCount
          );

          for (const achievement of eligibleGoalAchievements) {
            const { data: existingAchievement } = await supabase
              .from('user_achievements')
              .select('id')
              .eq('user_id', userId)
              .eq('achievement_id', achievement.id)
              .single();

            if (!existingAchievement) {
              console.log('Awarding goal achievement:', achievement.name);
              const { error } = await supabase
                .from('user_achievements')
                .insert({ user_id: userId, achievement_id: achievement.id });
              
              if (error) console.log('Error awarding goal achievement:', error);
              else toast({ title: "Achievement Unlocked! 🏆", description: `You earned: ${achievement.name}` });
            }
          }
        }
      };

      const checkLeadershipAchievements = async () => {
        if (userId) {
          const isLeader = await checkIsTeamLeader(userId);
          if (isLeader) {
            const eligibleLeadershipAchievements = achievements.filter(
              a => a.type === 'leadership_milestone' && a.threshold === 1
            );

            for (const achievement of eligibleLeadershipAchievements) {
              const { data: existingAchievement } = await supabase
                .from('user_achievements')
                .select('id')
                .eq('user_id', userId)
                .eq('achievement_id', achievement.id)
                .single();

              if (!existingAchievement) {
                console.log('Awarding leadership achievement:', achievement.name);
                const { error } = await supabase
                  .from('user_achievements')
                  .insert({ user_id: userId, achievement_id: achievement.id });
                
                if (error) console.log('Error awarding leadership achievement:', error);
                else toast({ title: "Achievement Unlocked! 🏆", description: `You earned: ${achievement.name}` });
              }
            }
          }
        }
      };
      
      const now = new Date();
      const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);

      await checkMonthlyAchievements(now);
      await checkMonthlyAchievements(lastMonth);
      await checkLifetimeAchievements();
      await checkAttendanceAchievements();
      await checkGoalAchievements();
      await checkLeadershipAchievements();
      
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
