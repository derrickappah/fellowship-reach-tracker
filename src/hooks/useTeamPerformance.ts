
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

      console.log('Fetching team performance for week:', weekStart.toISOString(), 'to', weekEnd.toISOString());

      // Get teams based on user role
      let teamsQuery = supabase.from('teams').select('*');
      
      if (user?.role === 'fellowship_leader' && user.fellowship_id) {
        teamsQuery = teamsQuery.eq('fellowship_id', user.fellowship_id);
      }

      const { data: teams, error: teamsError } = await teamsQuery;
      if (teamsError) throw teamsError;

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

      console.log('Found teams:', teams.length, teams.map(t => t.name));

      // Get team performance data
      const teamPerformanceData = await Promise.all(
        teams.map(async (team) => {
          console.log(`Processing team: ${team.name} (ID: ${team.id})`);
          
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

          console.log(`Raw invitees for team ${team.name}:`, invitees?.length || 0, invitees?.map(i => ({
            name: i.name,
            invite_date: i.invite_date,
            service_date: i.service_date,
            attended_service: i.attended_service,
            status: i.status
          })));

          const inviteesArray = invitees || [];

          // Categorize invitees by service type
          const wednesdayInvitees = inviteesArray.filter(i => {
            let dateToCheck: Date;
            
            if (i.service_date) {
              dateToCheck = new Date(i.service_date);
            } else {
              dateToCheck = new Date(i.invite_date);
            }
            
            const dayOfWeek = dateToCheck.getDay();
            console.log(`Invitee ${i.name}: dateToCheck=${dateToCheck.toISOString()}, dayOfWeek=${dayOfWeek}`);
            
            return dayOfWeek === 3; // Wednesday
          });

          const sundayInvitees = inviteesArray.filter(i => {
            let dateToCheck: Date;
            
            if (i.service_date) {
              dateToCheck = new Date(i.service_date);
            } else {
              dateToCheck = new Date(i.invite_date);
            }
            
            const dayOfWeek = dateToCheck.getDay();
            return dayOfWeek === 0; // Sunday
          });

          const wednesdayAttendees = wednesdayInvitees.filter(i => i.attended_service === true);
          const sundayAttendees = sundayInvitees.filter(i => i.attended_service === true);

          const totalInvitees = inviteesArray.length;
          const totalAttendees = inviteesArray.filter(i => i.attended_service === true).length;
          const conversions = inviteesArray.filter(i => i.status === 'joined_cell').length;

          console.log(`Team ${team.name} breakdown:`, {
            totalInvitees,
            wednesdayInvitees: wednesdayInvitees.length,
            sundayInvitees: sundayInvitees.length,
            totalAttendees,
            conversions,
            wednesdayDetails: wednesdayInvitees.map(i => ({ name: i.name, attended: i.attended_service })),
            sundayDetails: sundayInvitees.map(i => ({ name: i.name, attended: i.attended_service }))
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

      console.log('All team performance data:', teamPerformanceData);

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

      console.log('Final team performance summary:', {
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
