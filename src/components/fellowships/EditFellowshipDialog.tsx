
import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useFellowships } from '@/hooks/useFellowships';
import { useCells } from '@/hooks/useCells';
import { Plus, X, Trash2 } from 'lucide-react';

interface EditFellowshipDialogProps {
  fellowship: any;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const EditFellowshipDialog = ({ fellowship, open, onOpenChange }: EditFellowshipDialogProps) => {
  const { updateFellowship } = useFellowships();
  const { cells, createCell, updateCell, deleteCell } = useCells();
  const [formData, setFormData] = useState({
    name: '',
    description: '',
  });
  const [fellowshipCells, setFellowshipCells] = useState<any[]>([]);
  const [newCells, setNewCells] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (fellowship) {
      setFormData({
        name: fellowship.name || '',
        description: fellowship.description || '',
      });
    }
  }, [fellowship]);

  useEffect(() => {
    if (fellowship && cells) {
      const fellowshipRelatedCells = cells.filter(cell => cell.fellowship_id === fellowship.id);
      setFellowshipCells(fellowshipRelatedCells);
    }
  }, [fellowship, cells]);

  const addNewCellInput = () => {
    setNewCells([...newCells, '']);
  };

  const removeNewCellInput = (index: number) => {
    setNewCells(newCells.filter((_, i) => i !== index));
  };

  const updateNewCellName = (index: number, name: string) => {
    const updated = [...newCells];
    updated[index] = name;
    setNewCells(updated);
  };

  const handleDeleteCell = async (cellId: string) => {
    if (confirm('Are you sure you want to delete this cell?')) {
      await deleteCell(cellId);
    }
  };

  const updateExistingCellName = (cellId: string, newName: string) => {
    setFellowshipCells(cells => 
      cells.map(cell => 
        cell.id === cellId ? { ...cell, name: newName } : cell
      )
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!fellowship) return;
    setIsSubmitting(true);

    try {
      // Update fellowship details
      const { error: fellowshipError } = await updateFellowship(fellowship.id, formData);
      if (fellowshipError) {
        setIsSubmitting(false);
        return;
      }

      // Update existing cells
      for (const cell of fellowshipCells) {
        if (cell.name !== cells.find(c => c.id === cell.id)?.name) {
          await updateCell(cell.id, { name: cell.name });
        }
      }

      // Create new cells
      const validNewCellNames = newCells.filter(name => name.trim() !== '');
      for (const cellName of validNewCellNames) {
        await createCell({
          name: cellName.trim(),
          fellowship_id: fellowship.id,
        });
      }

      setNewCells([]);
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
            Update the fellowship information and manage its cells.
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
              <div className="flex items-center justify-between">
                <Label>Existing Cells</Label>
              </div>
              <div className="space-y-2">
                {fellowshipCells.map((cell) => (
                  <div key={cell.id} className="flex gap-2">
                    <Input
                      value={cell.name}
                      onChange={(e) => updateExistingCellName(cell.id, e.target.value)}
                      placeholder="Cell name"
                    />
                    <Button
                      type="button"
                      size="sm"
                      variant="outline"
                      onClick={() => handleDeleteCell(cell.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
                {fellowshipCells.length === 0 && (
                  <p className="text-sm text-muted-foreground">No cells in this fellowship</p>
                )}
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label>Add New Cells</Label>
                <Button type="button" size="sm" variant="outline" onClick={addNewCellInput}>
                  <Plus className="h-4 w-4 mr-1" />
                  Add Cell
                </Button>
              </div>
              <div className="space-y-2">
                {newCells.map((cellName, index) => (
                  <div key={index} className="flex gap-2">
                    <Input
                      value={cellName}
                      onChange={(e) => updateNewCellName(index, e.target.value)}
                      placeholder="Enter cell name"
                    />
                    <Button
                      type="button"
                      size="sm"
                      variant="outline"
                      onClick={() => removeNewCellInput(index)}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
                {newCells.length === 0 && (
                  <p className="text-sm text-muted-foreground">Click "Add Cell" to create new cells</p>
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
