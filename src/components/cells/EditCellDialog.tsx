import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useCells } from '@/hooks/useCells';
import { useFellowships } from '@/hooks/useFellowships';
import { supabase } from '@/integrations/supabase/client';
import { Cell } from '@/types/supabase';

interface EditCellDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  cell: Cell | null;
}

interface LeaderProfile {
  id: string;
  name: string;
}

export const EditCellDialog = ({ open, onOpenChange, cell }: EditCellDialogProps) => {
  const { updateCell } = useCells();
  const { fellowships } = useFellowships();
  const [leaders, setLeaders] = useState<LeaderProfile[]>([]);
  const [formData, setFormData] = useState({
    name: '',
    fellowship_id: '',
    leader_id: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const fetchLeaders = async () => {
      const { data, error } = await supabase
        .from('profiles')
        .select('id, name');
      
      if (error) {
        console.error("Error fetching leaders:", error);
        setLeaders([]);
        return;
      }
      // Ensure data conforms to LeaderProfile[], filtering out any null/undefined entries or entries with null id/name
      const validLeaders = (data || []).filter(
        (leader): leader is LeaderProfile => 
          leader && typeof leader.id === 'string' && typeof leader.name === 'string'
      );
      setLeaders(validLeaders);
    };
    fetchLeaders();
  }, []);

  useEffect(() => {
    if (cell) {
      setFormData({
        name: cell.name || '',
        fellowship_id: cell.fellowship_id || '',
        leader_id: cell.leader_id || '',
      });
    }
  }, [cell]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!cell) return;
    
    setIsSubmitting(true);

    const { error } = await updateCell(cell.id, {
      ...formData,
      fellowship_id: formData.fellowship_id || null,
      leader_id: formData.leader_id || null,
    });
    
    if (!error) {
      onOpenChange(false);
    }
    
    setIsSubmitting(false);
  };

  // Defensive: Do not render unless cell is valid
  if (!open || !cell || typeof cell.id !== 'string' || typeof cell.name !== 'string') {
    return null;
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Edit Cell</DialogTitle>
          <DialogDescription>
            Update the cell information.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="name">Cell Name</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                placeholder="Enter cell name"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="fellowship">Fellowship</Label>
              <Select 
                value={formData.fellowship_id} 
                onValueChange={(value) => setFormData(prev => ({ ...prev, fellowship_id: value }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select fellowship" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">No fellowship</SelectItem>
                  {fellowships.map((fellowship) => (
                    <SelectItem key={fellowship.id} value={fellowship.id}>
                      {fellowship.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="leader">Cell Leader</Label>
              <Select 
                value={formData.leader_id} 
                onValueChange={(value) => setFormData(prev => ({ ...prev, leader_id: value }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select leader" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">No leader</SelectItem>
                  {leaders.map((leader) => (
                    <SelectItem key={leader.id} value={leader.id}>
                      {leader.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button 
              type="button" 
              variant="outline" 
              onClick={() => onOpenChange(false)}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? 'Updating...' : 'Update Cell'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};
