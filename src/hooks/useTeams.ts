
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Team, TeamInsert } from '@/types/supabase';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';

export const useTeams = () => {
  const [teams, setTeams] = useState<Team[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();
  const { user } = useAuth();

  const fetchTeams = async () => {
    try {
      setLoading(true);
      
      let query = supabase
        .from('teams')
        .select(`
          *,
          fellowship:fellowships(name)
        `)
        .order('created_at', { ascending: false });

      // Filter teams based on user role
      if (user?.role === 'fellowship_leader' && user.fellowship_id) {
        // Fellowship leaders see teams in their fellowship
        query = query.eq('fellowship_id', user.fellowship_id);
      } else if (['member', 'team_leader', 'team_member'].includes(user?.role || '')) {
        // Members, team leaders, and team members see teams they are a part of (leader or member)
        const { data: teamMemberships, error: membershipError } = await supabase
          .from('team_members')
          .select('team_id')
          .eq('user_id', user.id);
        
        if (membershipError) throw membershipError;

        const teamIds = (teamMemberships || []).map(tm => tm.team_id).filter(id => id) as string[];

        // Combine teams they are a member of with teams they lead
        const filterParts = [];
        if (user.id) {
          filterParts.push(`leader_id.eq.${user.id}`);
        }
        if (teamIds.length > 0) {
          filterParts.push(`id.in.(${teamIds.join(',')})`);
        }

        if (filterParts.length > 0) {
          query = query.or(filterParts.join(','));
        } else {
          // If user is not a member or leader of any team, return no teams.
          setTeams([]);
          setLoading(false);
          return;
        }
      }
      // Admins see all teams (no additional filter needed)

      const { data, error } = await query;

      if (error) throw error;
      
      // Fetch leader profiles separately to avoid join issues
      const teamIds = (data || []).map(team => team.leader_id).filter(Boolean);
      const { data: leaders } = await supabase
        .from('profiles')
        .select('id, name')
        .in('id', teamIds);

      // Create a map of leader profiles for quick lookup
      const leaderMap = new Map();
      (leaders || []).forEach(leader => {
        leaderMap.set(leader.id, leader);
      });
      
      // Transform the data to ensure proper typing
      const transformedTeams = (data || []).map(team => ({
        ...team,
        fellowship: team.fellowship || null,
        leader: team.leader_id ? leaderMap.get(team.leader_id) || null : null
      }));
      
      setTeams(transformedTeams);
    } catch (error: any) {
      console.log('Error fetching teams:', error);
      toast({
        title: "Error fetching teams",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const createTeam = async (teamData: TeamInsert) => {
    try {
      const { data, error } = await supabase
        .from('teams')
        .insert(teamData)
        .select()
        .single();

      if (error) throw error;

      toast({
        title: "Success",
        description: "Team created successfully",
      });

      fetchTeams();
      return { data, error: null };
    } catch (error: any) {
      toast({
        title: "Error creating team",
        description: error.message,
        variant: "destructive",
      });
      return { data: null, error };
    }
  };

  const updateTeam = async (id: string, updates: Partial<Team>) => {
    try {
      const { data, error } = await supabase
        .from('teams')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;

      toast({
        title: "Success",
        description: "Team updated successfully",
      });

      fetchTeams();
      return { data, error: null };
    } catch (error: any) {
      toast({
        title: "Error updating team",
        description: error.message,
        variant: "destructive",
      });
      return { data: null, error };
    }
  };

  const deleteTeam = async (id: string) => {
    try {
      const { error } = await supabase
        .from('teams')
        .delete()
        .eq('id', id);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Team deleted successfully",
      });

      fetchTeams();
      return { error: null };
    } catch (error: any) {
      toast({
        title: "Error deleting team",
        description: error.message,
        variant: "destructive",
      });
      return { error };
    }
  };

  useEffect(() => {
    if (user) {
      fetchTeams();
    }
  }, [user]);

  return {
    teams,
    loading,
    createTeam,
    updateTeam,
    deleteTeam,
    refetch: fetchTeams,
  };
};
