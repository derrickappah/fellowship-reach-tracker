
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Group, GroupInsert } from '@/types/supabase';
import { useToast } from '@/hooks/use-toast';

export const useGroups = () => {
  const [groups, setGroups] = useState<Group[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const fetchGroups = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('groups')
        .select(`
          *,
          fellowship:fellowships(name),
          leader:profiles(name)
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setGroups(data || []);
    } catch (error: any) {
      toast({
        title: "Error fetching groups",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const createGroup = async (groupData: GroupInsert) => {
    try {
      const { data, error } = await supabase
        .from('groups')
        .insert(groupData)
        .select()
        .single();

      if (error) throw error;

      toast({
        title: "Success",
        description: "Group created successfully",
      });

      fetchGroups();
      return { data, error: null };
    } catch (error: any) {
      toast({
        title: "Error creating group",
        description: error.message,
        variant: "destructive",
      });
      return { data: null, error };
    }
  };

  const updateGroup = async (id: string, updates: Partial<Group>) => {
    try {
      const { data, error } = await supabase
        .from('groups')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;

      toast({
        title: "Success",
        description: "Group updated successfully",
      });

      fetchGroups();
      return { data, error: null };
    } catch (error: any) {
      toast({
        title: "Error updating group",
        description: error.message,
        variant: "destructive",
      });
      return { data: null, error };
    }
  };

  const deleteGroup = async (id: string) => {
    try {
      const { error } = await supabase
        .from('groups')
        .delete()
        .eq('id', id);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Group deleted successfully",
      });

      fetchGroups();
      return { error: null };
    } catch (error: any) {
      toast({
        title: "Error deleting group",
        description: error.message,
        variant: "destructive",
      });
      return { error };
    }
  };

  useEffect(() => {
    fetchGroups();
  }, []);

  return {
    groups,
    loading,
    createGroup,
    updateGroup,
    deleteGroup,
    refetch: fetchGroups,
  };
};
