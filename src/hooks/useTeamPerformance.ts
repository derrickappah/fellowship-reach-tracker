
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

      console.log('Fetching team performance for week:', weekStart, 'to', weekEnd);

      // Get teams based on user role
      let teamsQuery = supabase.from('teams').select('*');
      
      if (user?.role === 'fellowship_leader' && user.fellowship_id) {
        teamsQuery = teamsQuery.eq('fellowship_id', user.fellowship_id);
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

      console.log('Found teams:', teams);

      // Get team performance data
      const teamPerformanceData = await Promise.all(
        teams.map(async (team) => {
          // Get team members count
          const { data: teamMembers } = await supabase
            .from('team_members')
            .select('id')
            .eq('team_id', team.id);

          // Get all invitees for this team in the selected week
          const { data: invitees, error: inviteesError } = await supabase
            .from('invitees')
            .select('*')
            .eq('team_id', team.id)
            .gte('invite_date', weekStart.toISOString())
            .lte('invite_date', weekEnd.toISOString());

          if (inviteesError) {
            console.error('Error fetching invitees for team', team.name, inviteesError);
          }

          console.log(`Invitees for team ${team.name}:`, invitees);

          // If service_date is null, we'll categorize based on invite_date
          // Wednesday = day 3, Sunday = day 0
          const wednesdayInvitees = invitees?.filter(i => {
            const dateToCheck = i.service_date ? new Date(i.service_date) : new Date(i.invite_date);
            const dayOfWeek = dateToCheck.getDay();
            return dayOfWeek === 3; // Wednesday
          }) || [];

          const sundayInvitees = invitees?.filter(i => {
            const dateToCheck = i.service_date ? new Date(i.service_date) : new Date(i.invite_date);
            const dayOfWeek = dateToCheck.getDay();
            return dayOfWeek === 0; // Sunday
          }) || [];

          const wednesdayAttendees = wednesdayInvitees.filter(i => i.attended_service);
          const sundayAttendees = sundayInvitees.filter(i => i.attended_service);

          const totalInvitees = invitees?.length || 0;
          const totalAttendees = invitees?.filter(i => i.attended_service).length || 0;
          const conversions = invitees?.filter(i => i.status === 'joined_cell').length || 0;

          console.log(`Team ${team.name} stats:`, {
            totalInvitees,
            wednesdayInvitees: wednesdayInvitees.length,
            sundayInvitees: sundayInvitees.length,
            totalAttendees,
            conversions
          });

          return {
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
        })
      );

      console.log('Team performance data:', teamPerformanceData);

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

      console.log('Final team performance data:', finalData);
      setTeamPerformance(finalData);

    } catch (error: any) {
      console.log('Error fetching team performance:', error);
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
    fetchTeamPerformance();
  }, [selectedDate, user]);

  return {
    teamPerformance,
    loading,
    refetch: fetchTeamPerformance,
  };
};
