
import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { useFellowships } from '@/hooks/useFellowships';
import { useCells } from '@/hooks/useCells';
import { supabase } from '@/integrations/supabase/client';
import { FellowshipInsert } from '@/types/supabase';

interface CreateFellowshipDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const CreateFellowshipDialog = ({ open, onOpenChange }: CreateFellowshipDialogProps) => {
  const { createFellowship, refetch: refetchFellowships } = useFellowships();
  const { cells, updateCell } = useCells();
  const [leaders, setLeaders] = useState<any[]>([]);
  const [formData, setFormData] = useState<FellowshipInsert>({
    name: '',
    description: '',
    leader_id: '',
  });
  const [selectedCells, setSelectedCells] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Filter cells that don't have a fellowship assigned
  const availableCells = cells.filter(cell => !cell.fellowship_id);

  useEffect(() => {
    const fetchLeaders = async () => {
      // Fetch users who can be fellowship leaders (admin or fellowship_leader role)
      const { data } = await supabase
        .from('profiles')
        .select(`
          id, 
          name,
          user_roles!inner(role)
        `)
        .in('user_roles.role', ['admin', 'fellowship_leader']);
      // Filter ONLY valid leaders
      const validLeaders = (data || []).filter(
        leader =>
          leader &&
          typeof leader.id === 'string' &&
          leader.id.trim() !== '' &&
          typeof leader.name === 'string' &&
          leader.name.trim() !== ''
      );
      setLeaders(validLeaders);
    };
    if (open) {
      fetchLeaders();
    }
  }, [open]);

  const handleCellToggle = (cellId: string, checked: boolean) => {
    if (checked) {
      setSelectedCells([...selectedCells, cellId]);
    } else {
      setSelectedCells(selectedCells.filter(id => id !== cellId));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      // First create the fellowship
      const { data: fellowship, error: fellowshipError } = await createFellowship({
        ...formData,
        leader_id: formData.leader_id === 'no-leader' ? null : formData.leader_id || null,
      });
      
      if (fellowshipError || !fellowship) {
        setIsSubmitting(false);
        return;
      }

      // Then assign selected cells to this fellowship
      for (const cellId of selectedCells) {
        await updateCell(cellId, {
          fellowship_id: fellowship.id,
        });
      }

      // Reset form
      setFormData({ name: '', description: '', leader_id: '' });
      setSelectedCells([]);
      // Refresh fellowships to update cell count
      refetchFellowships();
      onOpenChange(false);
    } catch (error) {
      console.error('Error creating fellowship:', error);
    }
    
    setIsSubmitting(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Create New Fellowship</DialogTitle>
          <DialogDescription>
            Add a new fellowship to your church community and assign existing cells.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="name">Fellowship Name</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                placeholder="Enter fellowship name"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="leader">Fellowship Leader</Label>
              <Select 
                value={formData.leader_id || 'no-leader'} 
                onValueChange={(value) => setFormData(prev => ({ ...prev, leader_id: value === 'no-leader' ? '' : value }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select a leader" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="no-leader">No leader</SelectItem>
                  {leaders
                    .filter(
                      (leader) =>
                        typeof leader.id === 'string' &&
                        leader.id.trim() !== '' &&
                        typeof leader.name === 'string' &&
                        leader.name.trim() !== ''
                    )
                    .map((leader) => (
                      <SelectItem key={leader.id} value={leader.id}>
                        {leader.name}
                      </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={formData.description || ''}
                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                placeholder="Describe the fellowship"
                rows={3}
              />
            </div>
            
            <div className="space-y-2">
              <Label>Assign Cells (Optional)</Label>
              <div className="space-y-2 max-h-40 overflow-y-auto border rounded-md p-2">
                {availableCells.length > 0 ? (
                  availableCells.map((cell) => (
                    <div key={cell.id} className="flex items-center space-x-2">
                      <Checkbox
                        id={cell.id}
                        checked={selectedCells.includes(cell.id)}
                        onCheckedChange={(checked) => handleCellToggle(cell.id, checked as boolean)}
                      />
                      <Label htmlFor={cell.id} className="text-sm font-normal">
                        {cell.name}
                      </Label>
                    </div>
                  ))
                ) : (
                  <p className="text-sm text-muted-foreground">No unassigned cells available</p>
                )}
              </div>
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
              {isSubmitting ? 'Creating...' : 'Create Fellowship'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};
