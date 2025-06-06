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
      
      // First get invitees
      const { data: inviteesData, error: inviteesError } = await supabase
        .from('invitees')
        .select('*')
        .order('invite_date', { ascending: false });

      if (inviteesError) throw inviteesError;

      // Then get related data separately
      const inviteesWithRelatedData = await Promise.all(
        (inviteesData || []).map(async (invitee) => {
          const relatedData: any = { ...invitee };

          // Get inviter info
          if (invitee.invited_by) {
            const { data: inviterData } = await supabase
              .from('profiles')
              .select('name')
              .eq('id', invitee.invited_by)
              .single();
            relatedData.inviter = inviterData;
          }

          // Get group info
          if (invitee.group_id) {
            const { data: groupData } = await supabase
              .from('groups')
              .select('name')
              .eq('id', invitee.group_id)
              .single();
            relatedData.group = groupData;
          }

          // Get cell info
          if (invitee.cell_id) {
            const { data: cellData } = await supabase
              .from('cells')
              .select('name')
              .eq('id', invitee.cell_id)
              .single();
            relatedData.cell = cellData;
          }

          return relatedData;
        })
      );
      
      setInvitees(inviteesWithRelatedData);
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
