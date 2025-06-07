
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Profile } from '@/types/supabase';
import { useToast } from '@/hooks/use-toast';

interface MemberWithMemberships extends Profile {
  fellowship_memberships?: { fellowship: { name: string } }[];
  cell_memberships?: { cell: { name: string } }[];
  team_memberships?: { team: { name: string } }[];
  user_role?: { role: string };
}

export const useMembers = () => {
  const [members, setMembers] = useState<MemberWithMemberships[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const fetchMembers = async () => {
    try {
      setLoading(true);
      
      // Fetch profiles with user roles
      const { data: profilesData, error: profilesError } = await supabase
        .from('profiles')
        .select('*')
        .order('name', { ascending: true });

      if (profilesError) throw profilesError;

      // Fetch related data for each member
      const membersWithData = await Promise.all(
        (profilesData || []).map(async (profile) => {
          const memberData: any = { ...profile };

          // Get user role
          const { data: roleData } = await supabase
            .from('user_roles')
            .select('role')
            .eq('user_id', profile.id)
            .single();
          memberData.user_role = roleData;

          // Get fellowship memberships
          const { data: fellowshipMemberships } = await supabase
            .from('fellowship_members')
            .select(`
              fellowship:fellowships(name)
            `)
            .eq('user_id', profile.id);
          memberData.fellowship_memberships = fellowshipMemberships;

          // Get cell memberships
          const { data: cellMemberships } = await supabase
            .from('cell_members')
            .select(`
              cell:cells(name)
            `)
            .eq('user_id', profile.id);
          memberData.cell_memberships = cellMemberships;

          // Get team memberships
          const { data: teamMemberships } = await supabase
            .from('team_members')
            .select(`
              team:teams(name)
            `)
            .eq('user_id', profile.id);
          memberData.team_memberships = teamMemberships;

          return memberData;
        })
      );

      setMembers(membersWithData);
    } catch (error: any) {
      toast({
        title: "Error fetching members",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const assignToFellowship = async (userId: string, fellowshipId: string | null) => {
    try {
      if (fellowshipId) {
        // Add to fellowship
        const { error } = await supabase
          .from('fellowship_members')
          .upsert({ user_id: userId, fellowship_id: fellowshipId });

        if (error) throw error;
      } else {
        // Remove from fellowship
        const { error } = await supabase
          .from('fellowship_members')
          .delete()
          .eq('user_id', userId);

        if (error) throw error;
      }

      toast({
        title: "Success",
        description: fellowshipId ? "Member assigned to fellowship" : "Member removed from fellowship",
      });

      fetchMembers();
      return { error: null };
    } catch (error: any) {
      toast({
        title: "Error updating member",
        description: error.message,
        variant: "destructive",
      });
      return { error };
    }
  };

  const assignToCell = async (userId: string, cellId: string | null) => {
    try {
      if (cellId) {
        // Add to cell
        const { error } = await supabase
          .from('cell_members')
          .upsert({ user_id: userId, cell_id: cellId });

        if (error) throw error;
      } else {
        // Remove from cell
        const { error } = await supabase
          .from('cell_members')
          .delete()
          .eq('user_id', userId);

        if (error) throw error;
      }

      toast({
        title: "Success",
        description: cellId ? "Member assigned to cell" : "Member removed from cell",
      });

      fetchMembers();
      return { error: null };
    } catch (error: any) {
      toast({
        title: "Error updating member",
        description: error.message,
        variant: "destructive",
      });
      return { error };
    }
  };

  const assignToTeam = async (userId: string, teamId: string | null) => {
    try {
      if (teamId) {
        // Add to team
        const { error } = await supabase
          .from('team_members')
          .upsert({ user_id: userId, team_id: teamId });

        if (error) throw error;
      } else {
        // Remove from team
        const { error } = await supabase
          .from('team_members')
          .delete()
          .eq('user_id', userId);

        if (error) throw error;
      }

      toast({
        title: "Success",
        description: teamId ? "Member assigned to team" : "Member removed from team",
      });

      fetchMembers();
      return { error: null };
    } catch (error: any) {
      toast({
        title: "Error updating member",
        description: error.message,
        variant: "destructive",
      });
      return { error };
    }
  };

  useEffect(() => {
    fetchMembers();
  }, []);

  return {
    members,
    loading,
    assignToFellowship,
    assignToCell,
    assignToTeam,
    refetch: fetchMembers,
  };
};
