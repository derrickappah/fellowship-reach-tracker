import React, { useState, useEffect, useMemo } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useFellowships } from '@/hooks/useFellowships';
import { useCells } from '@/hooks/useCells';
import { supabase } from '@/integrations/supabase/client';
import { X } from 'lucide-react';

interface EditFellowshipDialogProps {
  fellowship: any;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const EditFellowshipDialog = ({ fellowship, open, onOpenChange }: EditFellowshipDialogProps) => {
  const { updateFellowship, refetch: refetchFellowships } = useFellowships();
  const { cells, updateCell } = useCells();
  const [members, setMembers] = useState<any[]>([]);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    leader_id: '',
  });
  const [assignedCells, setAssignedCells] = useState<string[]>([]);
  const [selectedCells, setSelectedCells] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Get cells assigned to this fellowship and available cells
  const fellowshipCells = useMemo(() => 
    cells.filter(cell => cell.fellowship_id === fellowship?.id),
    [cells, fellowship?.id]
  );

  const availableCells = useMemo(() =>
    cells.filter(cell => !cell.fellowship_id),
    [cells]
  );

  useEffect(() => {
    const fetchMembers = async () => {
      const { data } = await supabase
        .from('profiles')
        .select('id, name')
        .order('name', { ascending: true });
      setMembers(data || []);
    };
    
    if (open) {
      fetchMembers();
    }
  }, [open]);

  useEffect(() => {
    if (fellowship) {
      setFormData({
        name: fellowship.name || '',
        description: fellowship.description || '',
        leader_id: fellowship.leader_id || '',
      });
      // Set initially assigned cells
      setAssignedCells(fellowshipCells.map(cell => cell.id));
    }
  }, [fellowship, fellowshipCells]);

  const handleRemoveCell = async (cellId: string) => {
    // Remove cell from fellowship
    await updateCell(cellId, { fellowship_id: null });
    setAssignedCells(assignedCells.filter(id => id !== cellId));
    // Refresh fellowships to update cell count
    refetchFellowships();
  };

  const handleCellToggle = (cellId: string, checked: boolean) => {
    if (checked) {
      setSelectedCells([...selectedCells, cellId]);
    } else {
      setSelectedCells(selectedCells.filter(id => id !== cellId));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!fellowship) return;
    setIsSubmitting(true);

    try {
      // Update fellowship details
      const { error: fellowshipError } = await updateFellowship(fellowship.id, {
        name: formData.name,
        description: formData.description,
        leader_id: formData.leader_id === 'no-leader' ? null : formData.leader_id || null,
      });
      if (fellowshipError) {
        setIsSubmitting(false);
        return;
      }

      // Assign newly selected cells to this fellowship
      for (const cellId of selectedCells) {
        await updateCell(cellId, {
          fellowship_id: fellowship.id,
        });
      }

      setSelectedCells([]);
      // Refresh fellowships to update cell count
      refetchFellowships();
      onOpenChange(false);
    } catch (error) {
      console.error('Error updating fellowship:', error);
    }
    
    setIsSubmitting(false);
  };

  // Defensive: Do not render unless fellowship is valid
  if (!open) return null;
  if (!fellowship) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Edit Fellowship</DialogTitle>
          <DialogDescription>
            Update the fellowship information and manage its cell assignments.
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
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                placeholder="Describe the fellowship"
                rows={3}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="leader">Fellowship Leader</Label>
              <Select 
                value={formData.leader_id || 'no-leader'} 
                onValueChange={(value) => setFormData(prev => ({ ...prev, leader_id: value === 'no-leader' ? '' : value }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select leader" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="no-leader">No leader</SelectItem>
                  {members.map((member) => (
                    <SelectItem key={member.id} value={member.id}>
                      {member.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Currently Assigned Cells</Label>
              <div className="space-y-2 max-h-32 overflow-y-auto border rounded-md p-2">
                {fellowshipCells.length > 0 ? (
                  fellowshipCells.map((cell) => (
                    <div key={cell.id} className="flex items-center justify-between bg-muted p-2 rounded">
                      <span className="text-sm">{cell.name}</span>
                      <Button
                        type="button"
                        size="sm"
                        variant="outline"
                        onClick={() => handleRemoveCell(cell.id)}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  ))
                ) : (
                  <p className="text-sm text-muted-foreground">No cells assigned to this fellowship</p>
                )}
              </div>
            </div>

            <div className="space-y-2">
              <Label>Assign Additional Cells</Label>
              <div className="space-y-2 max-h-32 overflow-y-auto border rounded-md p-2">
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
              {isSubmitting ? 'Updating...' : 'Update Fellowship'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};
