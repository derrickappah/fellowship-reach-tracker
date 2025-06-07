
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { startOfMonth, endOfMonth } from 'date-fns';

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
    invitees: number;
    attendees: number;
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

      const monthStart = startOfMonth(selectedDate);
      const monthEnd = endOfMonth(selectedDate);

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

      // Get team performance data
      const teamPerformanceData = await Promise.all(
        teams.map(async (team) => {
          // Get team members count
          const { data: teamMembers } = await supabase
            .from('team_members')
            .select('id')
            .eq('team_id', team.id);

          // Get invitees for this team in the selected month
          const { data: invitees } = await supabase
            .from('invitees')
            .select('*')
            .eq('team_id', team.id)
            .gte('invite_date', monthStart.toISOString())
            .lte('invite_date', monthEnd.toISOString());

          const inviteesCount = invitees?.length || 0;
          const attendeesCount = invitees?.filter(i => i.attended_service).length || 0;
          const conversionsCount = invitees?.filter(i => i.status === 'joined_cell').length || 0;

          return {
            id: team.id,
            name: team.name,
            members: teamMembers?.length || 0,
            invitees: inviteesCount,
            attendees: attendeesCount,
            conversions: conversionsCount,
          };
        })
      );

      // Calculate totals and top performer
      const totalInvitees = teamPerformanceData.reduce((sum, team) => sum + team.invitees, 0);
      const totalAttendees = teamPerformanceData.reduce((sum, team) => sum + team.attendees, 0);
      const attendanceRate = totalInvitees > 0 ? Math.round((totalAttendees / totalInvitees) * 100) : 0;

      const topTeam = teamPerformanceData.reduce((top, team) => {
        return team.invitees > (top?.invitees || 0) ? team : top;
      }, teamPerformanceData[0] || null);

      setTeamPerformance({
        totalTeams: teams.length,
        totalInvitees,
        attendanceRate,
        topTeam: topTeam ? { name: topTeam.name, invitees: topTeam.invitees } : null,
        teams: teamPerformanceData.sort((a, b) => b.invitees - a.invitees),
      });

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
