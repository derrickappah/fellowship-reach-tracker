
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

      const weekStart = startOfWeek(selectedDate, { weekStartsOn: 1 }); // Monday start
      const weekEnd = endOfWeek(selectedDate, { weekStartsOn: 1 }); // Sunday end

      console.log('=== TEAM PERFORMANCE DEBUG ===');
      console.log('Selected date:', selectedDate.toISOString());
      console.log('Week range:', format(weekStart, 'yyyy-MM-dd'), 'to', format(weekEnd, 'yyyy-MM-dd'));
      console.log('Current user:', user?.role, user?.fellowship_id);

      // Get teams based on user role
      let teamsQuery = supabase.from('teams').select('*');
      
      if (user?.role === 'fellowship_leader' && user.fellowship_id) {
        teamsQuery = teamsQuery.eq('fellowship_id', user.fellowship_id);
      }

      const { data: teams, error: teamsError } = await teamsQuery;
      if (teamsError) {
        console.error('Teams query error:', teamsError);
        throw teamsError;
      }

      if (!teams || teams.length === 0) {
        console.log('No teams found');
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
          console.log(`\n--- Processing team: ${team.name} (ID: ${team.id}) ---`);
          
          // Get team members count
          const { data: teamMembers, error: teamMembersError } = await supabase
            .from('team_members')
            .select('id')
            .eq('team_id', team.id);

          if (teamMembersError) {
            console.error(`Error fetching team members for ${team.name}:`, teamMembersError);
          }

          console.log(`Team ${team.name} has ${teamMembers?.length || 0} members`);

          // Get invitees for this team in the selected week - using date format YYYY-MM-DD
          const weekStartStr = format(weekStart, 'yyyy-MM-dd');
          const weekEndStr = format(weekEnd, 'yyyy-MM-dd');

          console.log(`Querying invitees for team ${team.name} between ${weekStartStr} and ${weekEndStr}`);

          const { data: weekInvitees, error: weekInviteesError } = await supabase
            .from('invitees')
            .select('*')
            .eq('team_id', team.id)
            .gte('invite_date', weekStartStr)
            .lte('invite_date', weekEndStr);

          if (weekInviteesError) {
            console.error(`Error fetching week invitees for team ${team.name}:`, weekInviteesError);
            return {
              id: team.id,
              name: team.name,
              members: teamMembers?.length || 0,
              wednesdayInvitees: 0,
              wednesdayAttendees: 0,
              sundayInvitees: 0,
              sundayAttendees: 0,
              totalInvitees: 0,
              totalAttendees: 0,
              conversions: 0,
            };
          }

          const inviteesArray = weekInvitees || [];
          console.log(`Team ${team.name} has ${inviteesArray.length} invitees in selected week`);

          if (inviteesArray.length > 0) {
            console.log(`Invitees details for ${team.name}:`, inviteesArray.map(i => ({
              name: i.name,
              invite_date: i.invite_date,
              service_date: i.service_date,
              attended_service: i.attended_service,
              status: i.status
            })));
          }

          // For now, let's categorize all invitees as Sunday service since we don't have 
          // a specific field to indicate which service they were invited to
          // In a real system, you'd want to add a "service_type" field to the invitees table
          const wednesdayInvitees = inviteesArray.filter(i => {
            // If service_date exists and it's a Wednesday, count as Wednesday
            if (i.service_date) {
              const serviceDate = new Date(i.service_date);
              const dayOfWeek = serviceDate.getDay();
              console.log(`${i.name}: service_date ${serviceDate.toDateString()}, day=${dayOfWeek}, isWednesday=${dayOfWeek === 3}`);
              return dayOfWeek === 3;
            }
            // If no service_date, assume it's for the next service in the week
            // For simplicity, let's say if invite_date is Mon-Wed, it's for Wednesday service
            const inviteDate = new Date(i.invite_date);
            const inviteDayOfWeek = inviteDate.getDay();
            console.log(`${i.name}: invite_date ${inviteDate.toDateString()}, day=${inviteDayOfWeek}, assumingWednesday=${inviteDayOfWeek >= 1 && inviteDayOfWeek <= 3}`);
            return inviteDayOfWeek >= 1 && inviteDayOfWeek <= 3; // Monday to Wednesday
          });

          const sundayInvitees = inviteesArray.filter(i => {
            // If service_date exists and it's a Sunday, count as Sunday
            if (i.service_date) {
              const serviceDate = new Date(i.service_date);
              const dayOfWeek = serviceDate.getDay();
              console.log(`${i.name}: service_date ${serviceDate.toDateString()}, day=${dayOfWeek}, isSunday=${dayOfWeek === 0}`);
              return dayOfWeek === 0;
            }
            // If no service_date, assume it's for Sunday if invited Thu-Sun
            const inviteDate = new Date(i.invite_date);
            const inviteDayOfWeek = inviteDate.getDay();
            console.log(`${i.name}: invite_date ${inviteDate.toDateString()}, day=${inviteDayOfWeek}, assumingSunday=${inviteDayOfWeek === 0 || inviteDayOfWeek >= 4}`);
            return inviteDayOfWeek === 0 || inviteDayOfWeek >= 4; // Thursday to Sunday
          });

          const wednesdayAttendees = wednesdayInvitees.filter(i => i.attended_service === true);
          const sundayAttendees = sundayInvitees.filter(i => i.attended_service === true);

          const totalInvitees = inviteesArray.length;
          const totalAttendees = inviteesArray.filter(i => i.attended_service === true).length;
          const conversions = inviteesArray.filter(i => i.status === 'joined_cell').length;

          const result = {
            id: team.id,
            name: team.name,
            members: teamMembers?.length || 0,
            wednesdayInvitees: wednesdayInvitees.length,
            wednesdayAttendees: wednesdayAttendees.length,
            sundayInvitees: sundayInvitees.length,
            sundayAttendees: sundayAttendees.length,
            totalInvitees,
            totalAttendees,
            conversions,
          };

          console.log(`Team ${team.name} final stats:`, result);
          return result;
        })
      );

      console.log('\n=== FINAL TEAM PERFORMANCE DATA ===');
      console.log('All team performance:', teamPerformanceData);

      // Calculate totals and top performer
      const totalInvitees = teamPerformanceData.reduce((sum, team) => sum + team.totalInvitees, 0);
      const totalAttendees = teamPerformanceData.reduce((sum, team) => sum + team.totalAttendees, 0);
      const attendanceRate = totalInvitees > 0 ? Math.round((totalAttendees / totalInvitees) * 100) : 0;

      const topTeam = teamPerformanceData.reduce((top, team) => {
        return team.totalInvitees > (top?.totalInvitees || 0) ? team : top;
      }, teamPerformanceData[0] || null);

      const finalData = {
        totalTeams: teams.length,
        totalInvitees,
        attendanceRate,
        topTeam: topTeam ? { name: topTeam.name, invitees: topTeam.totalInvitees } : null,
        teams: teamPerformanceData.sort((a, b) => b.totalInvitees - a.totalInvitees),
      };

      console.log('FINAL SUMMARY:', {
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
