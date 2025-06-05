
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Fellowship } from '@/types/supabase';
import { useToast } from '@/hooks/use-toast';

export const useFellowships = () => {
  const [fellowships, setFellowships] = useState<Fellowship[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const fetchFellowships = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('fellowships')
        .select(`
          *,
          leader:profiles(name)
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setFellowships(data || []);
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

  const createFellowship = async (fellowshipData: Partial<Fellowship>) => {
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
