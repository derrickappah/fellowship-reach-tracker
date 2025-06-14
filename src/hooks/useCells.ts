
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Cell, CellInsert } from '@/types/supabase';
import { useToast } from '@/hooks/use-toast';

export const useCells = () => {
  const [cells, setCells] = useState<Cell[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const fetchCells = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('cells')
        .select(`
          *,
          fellowship:fellowships(id, name),
          leader:profiles(id, name)
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;
      
      setCells(data || []);
    } catch (error: any) {
      toast({
        title: "Error fetching cells",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const createCell = async (cellData: CellInsert) => {
    try {
      const { data, error } = await supabase
        .from('cells')
        .insert(cellData)
        .select()
        .single();

      if (error) throw error;

      toast({
        title: "Success",
        description: "Cell created successfully",
      });

      fetchCells();
      return { data, error: null };
    } catch (error: any) {
      toast({
        title: "Error creating cell",
        description: error.message,
        variant: "destructive",
      });
      return { data: null, error };
    }
  };

  const updateCell = async (id: string, updates: Partial<Cell>) => {
    try {
      const { data, error } = await supabase
        .from('cells')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;

      toast({
        title: "Success",
        description: "Cell updated successfully",
      });

      fetchCells();
      return { data, error: null };
    } catch (error: any) {
      toast({
        title: "Error updating cell",
        description: error.message,
        variant: "destructive",
      });
      return { data: null, error };
    }
  };

  const deleteCell = async (id: string) => {
    try {
      const { error } = await supabase
        .from('cells')
        .delete()
        .eq('id', id);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Cell deleted successfully",
      });

      fetchCells();
      return { error: null };
    } catch (error: any) {
      toast({
        title: "Error deleting cell",
        description: error.message,
        variant: "destructive",
      });
      return { error };
    }
  };

  useEffect(() => {
    fetchCells();
  }, []);

  return {
    cells,
    loading,
    createCell,
    updateCell,
    deleteCell,
    refetch: fetchCells,
  };
};
