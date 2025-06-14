
import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useFellowships } from '@/hooks/useFellowships';

interface EditFellowshipDialogProps {
  fellowship: any;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const EditFellowshipDialog = ({ fellowship, open, onOpenChange }: EditFellowshipDialogProps) => {
  const { updateFellowship } = useFellowships();
  const [formData, setFormData] = useState({
    name: '',
    description: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (fellowship) {
      setFormData({
        name: fellowship.name || '',
        description: fellowship.description || '',
      });
    }
  }, [fellowship]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!fellowship) return;
    setIsSubmitting(true);

    const { error } = await updateFellowship(fellowship.id, formData);

    if (!error) {
      onOpenChange(false);
    }
    setIsSubmitting(false);
  };

  // Defensive: Do not render unless fellowship is valid
  if (!open) return null;
  if (!fellowship) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Edit Fellowship</DialogTitle>
          <DialogDescription>
            Update the fellowship information.
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
