
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Fellowship, FellowshipInsert } from '@/types/supabase';
import { useToast } from '@/hooks/use-toast';

export const useFellowships = () => {
  const [fellowships, setFellowships] = useState<Fellowship[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const fetchFellowships = async () => {
    try {
      setLoading(true);
      
      // First, get all fellowships
      const { data: fellowshipsData, error: fellowshipsError } = await supabase
        .from('fellowships')
        .select('*')
        .order('created_at', { ascending: false });

      if (fellowshipsError) throw fellowshipsError;

      if (!fellowshipsData || fellowshipsData.length === 0) {
        setFellowships([]);
        return;
      }

      // Get cell counts for each fellowship
      const fellowshipIds = fellowshipsData.map(f => f.id);
      const { data: cellCounts, error: cellCountsError } = await supabase
        .from('cells')
        .select('fellowship_id')
        .in('fellowship_id', fellowshipIds);

      if (cellCountsError) {
        console.warn('Error fetching cell counts:', cellCountsError);
      }

      // Calculate cell counts per fellowship
      const cellCountMap = (cellCounts || []).reduce((acc, cell) => {
        if (cell.fellowship_id) {
          acc[cell.fellowship_id] = (acc[cell.fellowship_id] || 0) + 1;
        }
        return acc;
      }, {} as Record<string, number>);

      // Get leader data for fellowships that have leader_id
      const leaderIds = fellowshipsData
        .filter(fellowship => fellowship.leader_id)
        .map(fellowship => fellowship.leader_id);

      let leadersData: any[] = [];
      if (leaderIds.length > 0) {
        const { data: lData, error: lError } = await supabase
          .from('profiles')
          .select('id, name')
          .in('id', leaderIds);
        
        if (lError) console.warn('Error fetching leaders:', lError);
        else leadersData = lData || [];
      }

      // Transform the data to match our Fellowship type
      const transformedFellowships: Fellowship[] = fellowshipsData.map((fellowship: any) => {
        const leader = leadersData.find(l => l.id === fellowship.leader_id);
        const cellCount = cellCountMap[fellowship.id] || 0;
        
        return {
          ...fellowship,
          cell_count: cellCount,
          leader: leader ? { name: leader.name } : null,
        };
      });
      
      setFellowships(transformedFellowships);
    } catch (error: any) {
      toast({
        title: "Error fetching fellowships",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const createFellowship = async (fellowshipData: FellowshipInsert) => {
    try {
      const { data, error } = await supabase
        .from('fellowships')
        .insert(fellowshipData)
        .select()
        .single();

      if (error) throw error;

      toast({
        title: "Success",
        description: "Fellowship created successfully",
      });

      fetchFellowships();
      return { data, error: null };
    } catch (error: any) {
      toast({
        title: "Error creating fellowship",
        description: error.message,
        variant: "destructive",
      });
      return { data: null, error };
    }
  };

  const updateFellowship = async (id: string, updates: Partial<Fellowship>) => {
    try {
      const { data, error } = await supabase
        .from('fellowships')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;

      toast({
        title: "Success",
        description: "Fellowship updated successfully",
      });

      fetchFellowships();
      return { data, error: null };
    } catch (error: any) {
      toast({
        title: "Error updating fellowship",
        description: error.message,
        variant: "destructive",
      });
      return { data: null, error };
    }
  };

  const deleteFellowship = async (id: string) => {
    try {
      const { error } = await supabase
        .from('fellowships')
        .delete()
        .eq('id', id);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Fellowship deleted successfully",
      });

      fetchFellowships();
      return { error: null };
    } catch (error: any) {
      toast({
        title: "Error deleting fellowship",
        description: error.message,
        variant: "destructive",
      });
      return { error };
    }
  };

  useEffect(() => {
    fetchFellowships();
  }, []);

  return {
    fellowships,
    loading,
    createFellowship,
    updateFellowship,
    deleteFellowship,
    refetch: fetchFellowships,
  };
};
