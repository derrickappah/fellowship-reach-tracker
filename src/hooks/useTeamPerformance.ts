
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { startOfWeek, endOfWeek } from 'date-fns';

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
      console.log('Week range:', weekStart.toISOString(), 'to', weekEnd.toISOString());
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

      // Get ALL invitees first to debug
      const { data: allInvitees, error: allInviteesError } = await supabase
        .from('invitees')
        .select('*');

      if (allInviteesError) {
        console.error('All invitees query error:', allInviteesError);
      } else {
        console.log('Total invitees in database:', allInvitees?.length || 0);
        console.log('Sample invitees:', allInvitees?.slice(0, 3).map(i => ({
          name: i.name,
          team_id: i.team_id,
          invite_date: i.invite_date,
          service_date: i.service_date,
          attended_service: i.attended_service,
          status: i.status
        })));
      }

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

          // Get ALL invitees for this team (not filtered by date yet)
          const { data: allTeamInvitees, error: allTeamInviteesError } = await supabase
            .from('invitees')
            .select('*')
            .eq('team_id', team.id);

          if (allTeamInviteesError) {
            console.error(`Error fetching all invitees for team ${team.name}:`, allTeamInviteesError);
          }

          console.log(`Team ${team.name} has ${allTeamInvitees?.length || 0} total invitees in database`);

          // Now filter by the selected week
          const { data: weekInvitees, error: weekInviteesError } = await supabase
            .from('invitees')
            .select('*')
            .eq('team_id', team.id)
            .gte('invite_date', weekStart.toISOString())
            .lte('invite_date', weekEnd.toISOString());

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

          // Categorize invitees by service type
          const wednesdayInvitees = inviteesArray.filter(i => {
            let dateToCheck: Date;
            
            if (i.service_date) {
              dateToCheck = new Date(i.service_date);
            } else {
              dateToCheck = new Date(i.invite_date);
            }
            
            const dayOfWeek = dateToCheck.getDay();
            const isWednesday = dayOfWeek === 3;
            
            console.log(`${i.name}: using ${i.service_date ? 'service_date' : 'invite_date'} = ${dateToCheck.toDateString()}, day=${dayOfWeek}, isWednesday=${isWednesday}`);
            
            return isWednesday;
          });

          const sundayInvitees = inviteesArray.filter(i => {
            let dateToCheck: Date;
            
            if (i.service_date) {
              dateToCheck = new Date(i.service_date);
            } else {
              dateToCheck = new Date(i.invite_date);
            }
            
            const dayOfWeek = dateToCheck.getDay();
            const isSunday = dayOfWeek === 0;
            
            return isSunday;
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
