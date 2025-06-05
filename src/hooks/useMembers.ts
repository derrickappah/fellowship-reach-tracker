
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Profile } from '@/types/supabase';
import { useToast } from '@/hooks/use-toast';

export const useMembers = () => {
  const [members, setMembers] = useState<Profile[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const fetchMembers = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .order('name', { ascending: true });

      if (error) throw error;
      setMembers(data || []);
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
      const { error } = await supabase
        .from('profiles')
        .update({ fellowship_id: fellowshipId })
        .eq('id', userId);

      if (error) throw error;

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
      const { error } = await supabase
        .from('profiles')
        .update({ cell_id: cellId })
        .eq('id', userId);

      if (error) throw error;

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

  const assignToGroup = async (userId: string, groupId: string | null) => {
    try {
      if (groupId) {
        // Add to group
        const { error } = await supabase
          .from('group_members')
          .upsert({ user_id: userId, group_id: groupId });

        if (error) throw error;
      } else {
        // Remove from group
        const { error } = await supabase
          .from('group_members')
          .delete()
          .eq('user_id', userId);

        if (error) throw error;
      }

      toast({
        title: "Success",
        description: groupId ? "Member assigned to group" : "Member removed from group",
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
    assignToGroup,
    refetch: fetchMembers,
  };
};
