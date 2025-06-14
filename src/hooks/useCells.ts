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
      
      // First, get all cells
      const { data: cellsData, error: cellsError } = await supabase
        .from('cells')
        .select('*')
        .order('created_at', { ascending: false });

      if (cellsError) throw cellsError;

      if (!cellsData || cellsData.length === 0) {
        setCells([]);
        return;
      }

      // Get fellowship data for cells that have fellowship_id
      const fellowshipIds = cellsData
        .filter(cell => cell.fellowship_id)
        .map(cell => cell.fellowship_id);

      let fellowshipsData: any[] = [];
      if (fellowshipIds.length > 0) {
        const { data: fData, error: fError } = await supabase
          .from('fellowships')
          .select('id, name')
          .in('id', fellowshipIds);
        
        if (fError) console.warn('Error fetching fellowships:', fError);
        else fellowshipsData = fData || [];
      }

      // Get leader data for cells that have leader_id
      const leaderIds = cellsData
        .filter(cell => cell.leader_id)
        .map(cell => cell.leader_id);

      let leadersData: any[] = [];
      if (leaderIds.length > 0) {
        const { data: lData, error: lError } = await supabase
          .from('profiles')
          .select('id, name')
          .in('id', leaderIds);
        
        if (lError) console.warn('Error fetching leaders:', lError);
        else leadersData = lData || [];
      }

      // Transform the data to match the Cell type
      const transformedCells: Cell[] = cellsData.map((cell: any) => {
        const fellowship = fellowshipsData.find(f => f.id === cell.fellowship_id);
        const leader = leadersData.find(l => l.id === cell.leader_id);
        
        return {
          ...cell,
          fellowship: fellowship ? { name: fellowship.name } : null,
          leader: leader ? { name: leader.name } : null,
        };
      });
      
      setCells(transformedCells);
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
