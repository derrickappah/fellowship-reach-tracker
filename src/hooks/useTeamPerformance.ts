import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { startOfWeek, endOfWeek, format } from 'date-fns';

interface TeamPerformanceData {
  totalTeams: number;
  totalInvitees: number;
  attendanceRate: number;
  topTeam: {
    name: string;
    invitees: number;
  } | null;
  teams: Array<{
    id: string;
    name: string;
    members: number;
    wednesdayInvitees: number;
    wednesdayAttendees: number;
    sundayInvitees: number;
    sundayAttendees: number;
    totalInvitees: number;
    totalAttendees: number;
    conversions: number;
  }>;
}

export const useTeamPerformance = (selectedDate: Date) => {
  const [teamPerformance, setTeamPerformance] = useState<TeamPerformanceData | null>(null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();
  const { user } = useAuth();

  const fetchTeamPerformance = async () => {
    try {
      setLoading(true);

      const weekStart = startOfWeek(selectedDate, { weekStartsOn: 1 });
      const weekEnd = endOfWeek(selectedDate, { weekStartsOn: 1 });

      console.log('=== TEAM PERFORMANCE DEBUG ===');
      console.log('Selected date:', selectedDate.toISOString());
      console.log('Week range:', format(weekStart, 'yyyy-MM-dd'), 'to', format(weekEnd, 'yyyy-MM-dd'));

      // Get teams based on user role
      let teamsQuery = supabase.from('teams').select('*');
      
      if (user?.role === 'fellowship_leader' && user.fellowship_id) {
        teamsQuery = teamsQuery.eq('fellowship_id', user.fellowship_id);
      } else if (user?.role === 'member') {
        const { data: teamMemberships, error: membershipError } = await supabase
          .from('team_members')
          .select('team_id')
          .eq('user_id', user.id);

        if (membershipError) throw membershipError;

        const teamIds = teamMemberships?.map(tm => tm.team_id).filter(id => id) as string[] || [];
        
        if (teamIds.length === 0) {
          setTeamPerformance({
            totalTeams: 0,
            totalInvitees: 0,
            attendanceRate: 0,
            topTeam: null,
            teams: [],
          });
          setLoading(false);
          return;
        }

        teamsQuery = teamsQuery.in('id', teamIds);
      }

      const { data: teams, error: teamsError } = await teamsQuery;
      if (teamsError) throw teamsError;

      if (!teams || teams.length === 0) {
        setTeamPerformance({
          totalTeams: 0,
          totalInvitees: 0,
          attendanceRate: 0,
          topTeam: null,
          teams: [],
        });
        return;
      }

      console.log('Found teams:', teams.map(t => ({ id: t.id, name: t.name })));

      // Get team performance data
      const teamPerformanceData = await Promise.all(
        teams.map(async (team) => {
          console.log(`\n--- Processing team: ${team.name} ---`);
          
          // Get team members count
          const { data: teamMembers } = await supabase
            .from('team_members')
            .select('id')
            .eq('team_id', team.id);

          // Get invitees for this team in the selected week
          const weekStartStr = format(weekStart, 'yyyy-MM-dd');
          const weekEndStr = format(weekEnd, 'yyyy-MM-dd');

          const { data: weekInvitees } = await supabase
            .from('invitees')
            .select('*')
            .eq('team_id', team.id)
            .gte('invite_date', weekStartStr)
            .lte('invite_date', weekEndStr);

          const inviteesArray = weekInvitees || [];
          console.log(`Team ${team.name} has ${inviteesArray.length} invitees`);

          // Categorize invitees
          const wednesdayInvitees = inviteesArray.filter(i => {
            if (i.service_date) {
              const serviceDate = new Date(i.service_date);
              return serviceDate.getDay() === 3;
            }
            const inviteDate = new Date(i.invite_date);
            return inviteDate.getDay() >= 1 && inviteDate.getDay() <= 3;
          });

          const sundayInvitees = inviteesArray.filter(i => {
            if (i.service_date) {
              const serviceDate = new Date(i.service_date);
              return serviceDate.getDay() === 0;
            }
            const inviteDate = new Date(i.invite_date);
            return inviteDate.getDay() === 0 || inviteDate.getDay() >= 4;
          });

          const wednesdayAttendees = wednesdayInvitees.filter(i => i.attended_service === true || ['attended', 'joined_cell'].includes(i.status as string));
          const sundayAttendees = sundayInvitees.filter(i => i.attended_service === true || ['attended', 'joined_cell'].includes(i.status as string));
          const totalAttendees = inviteesArray.filter(i => i.attended_service === true || ['attended', 'joined_cell'].includes(i.status as string)).length;
          const conversions = inviteesArray.filter(i => i.status === 'joined_cell').length;

          const result = {
            id: team.id,
            name: team.name,
            members: teamMembers?.length || 0,
            wednesdayInvitees: wednesdayInvitees.length,
            wednesdayAttendees: wednesdayAttendees.length,
            sundayInvitees: sundayInvitees.length,
            sundayAttendees: sundayAttendees.length,
            totalInvitees: inviteesArray.length,
            totalAttendees,
            conversions,
          };

          console.log(`Team ${team.name} stats:`, {
            totalInvitees: result.totalInvitees,
            totalAttendees: result.totalAttendees,
            wednesdayInvitees: result.wednesdayInvitees,
            sundayInvitees: result.sundayInvitees
          });

          return result;
        })
      );

      console.log('\n=== CALCULATING TOTALS ===');
      console.log('Team performance data:', teamPerformanceData.map(t => ({
        name: t.name,
        totalInvitees: t.totalInvitees,
        totalAttendees: t.totalAttendees
      })));

      // Calculate totals step by step with debugging
      const totalInvitees = teamPerformanceData.reduce((sum, team) => {
        console.log(`Adding ${team.name}: ${team.totalInvitees} to sum ${sum}`);
        return sum + team.totalInvitees;
      }, 0);

      const totalAttendees = teamPerformanceData.reduce((sum, team) => {
        console.log(`Adding ${team.name} attendees: ${team.totalAttendees} to sum ${sum}`);
        return sum + team.totalAttendees;
      }, 0);

      console.log('CALCULATED TOTALS:');
      console.log('Total invitees:', totalInvitees);
      console.log('Total attendees:', totalAttendees);

      const attendanceRate = totalInvitees > 0 ? Math.round((totalAttendees / totalInvitees) * 100) : 0;

      // Find top team
      const topTeam = teamPerformanceData.reduce((top, team) => {
        if (!top || team.totalInvitees > top.totalInvitees) {
          return team;
        }
        return top;
      }, null as typeof teamPerformanceData[0] | null);

      const finalData = {
        totalTeams: teams.length,
        totalInvitees,
        attendanceRate,
        topTeam: topTeam && topTeam.totalInvitees > 0 ? { 
          name: topTeam.name, 
          invitees: topTeam.totalInvitees 
        } : null,
        teams: teamPerformanceData.sort((a, b) => b.totalInvitees - a.totalInvitees),
      };

      console.log('FINAL DATA BEFORE SET STATE:', finalData);
      console.log('Setting state with:', {
        totalTeams: finalData.totalTeams,
        totalInvitees: finalData.totalInvitees,
        attendanceRate: finalData.attendanceRate,
        topTeam: finalData.topTeam
      });

      setTeamPerformance(finalData);

    } catch (error: any) {
      console.error('Error fetching team performance:', error);
      toast({
        title: "Error fetching team performance",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      fetchTeamPerformance();
    }
  }, [selectedDate, user]);

  return {
    teamPerformance,
    loading,
    refetch: fetchTeamPerformance,
  };
};
