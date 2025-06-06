import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Invitee } from '@/types/supabase';
import { useToast } from '@/hooks/use-toast';

interface InviteeWithInviter extends Invitee {
  inviter?: { name: string } | null;
  group?: { name: string } | null;
  cell?: { name: string } | null;
}

export const useInvitees = () => {
  const [invitees, setInvitees] = useState<InviteeWithInviter[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const fetchInvitees = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('invitees')
        .select(`
          *,
          inviter:profiles(name),
          group:groups(name),
          cell:cells(name)
        `)
        .order('invite_date', { ascending: false });

      if (error) throw error;
      
      // Type assertion to ensure the data matches our interface
      const typedData = (data || []) as InviteeWithInviter[];
      setInvitees(typedData);
    } catch (error: any) {
      console.log('Error fetching invitees:', error);
      toast({
        title: "Error fetching invitees",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const updateInviteeStatus = async (id: string, status: string) => {
    try {
      const { error } = await supabase
        .from('invitees')
        .update({ status })
        .eq('id', id);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Invitee status updated successfully",
      });

      fetchInvitees();
    } catch (error: any) {
      toast({
        title: "Error updating invitee",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const deleteInvitee = async (id: string) => {
    try {
      const { error } = await supabase
        .from('invitees')
        .delete()
        .eq('id', id);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Invitee deleted successfully",
      });

      fetchInvitees();
    } catch (error: any) {
      toast({
        title: "Error deleting invitee",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  useEffect(() => {
    fetchInvitees();
  }, []);

  return {
    invitees,
    loading,
    updateInviteeStatus,
    deleteInvitee,
    refetch: fetchInvitees,
  };
};
