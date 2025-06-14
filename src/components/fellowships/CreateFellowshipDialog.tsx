
import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useFellowships } from '@/hooks/useFellowships';
import { useCells } from '@/hooks/useCells';
import { supabase } from '@/integrations/supabase/client';
import { FellowshipInsert } from '@/types/supabase';
import { Plus, X } from 'lucide-react';

interface CreateFellowshipDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const CreateFellowshipDialog = ({ open, onOpenChange }: CreateFellowshipDialogProps) => {
  const { createFellowship } = useFellowships();
  const { cells, createCell } = useCells();
  const [leaders, setLeaders] = useState<any[]>([]);
  const [formData, setFormData] = useState<FellowshipInsert>({
    name: '',
    description: '',
    leader_id: '',
  });
  const [newCells, setNewCells] = useState<string[]>(['']);
  const [isSubmitting, setIsSubmitting] = useState(false);

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

  const addCellInput = () => {
    setNewCells([...newCells, '']);
  };

  const removeCellInput = (index: number) => {
    setNewCells(newCells.filter((_, i) => i !== index));
  };

  const updateCellName = (index: number, name: string) => {
    const updated = [...newCells];
    updated[index] = name;
    setNewCells(updated);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      // First create the fellowship
      const { data: fellowship, error: fellowshipError } = await createFellowship({
        ...formData,
        leader_id: formData.leader_id || null,
      });
      
      if (fellowshipError || !fellowship) {
        setIsSubmitting(false);
        return;
      }

      // Then create the cells for this fellowship
      const validCellNames = newCells.filter(name => name.trim() !== '');
      for (const cellName of validCellNames) {
        await createCell({
          name: cellName.trim(),
          fellowship_id: fellowship.id,
        });
      }

      // Reset form
      setFormData({ name: '', description: '', leader_id: '' });
      setNewCells(['']);
      onOpenChange(false);
    } catch (error) {
      console.error('Error creating fellowship with cells:', error);
    }
    
    setIsSubmitting(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Create New Fellowship</DialogTitle>
          <DialogDescription>
            Add a new fellowship to your church community and optionally create cells.
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
                value={formData.leader_id || ''} 
                onValueChange={(value) => setFormData(prev => ({ ...prev, leader_id: value }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select a leader" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">No leader</SelectItem>
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
              <div className="flex items-center justify-between">
                <Label>Cells (Optional)</Label>
                <Button type="button" size="sm" variant="outline" onClick={addCellInput}>
                  <Plus className="h-4 w-4 mr-1" />
                  Add Cell
                </Button>
              </div>
              <div className="space-y-2">
                {newCells.map((cellName, index) => (
                  <div key={index} className="flex gap-2">
                    <Input
                      value={cellName}
                      onChange={(e) => updateCellName(index, e.target.value)}
                      placeholder="Enter cell name"
                    />
                    {newCells.length > 1 && (
                      <Button
                        type="button"
                        size="sm"
                        variant="outline"
                        onClick={() => removeCellInput(index)}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                ))}
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
