import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useCells } from '@/hooks/useCells';
import { useFellowships } from '@/hooks/useFellowships';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

interface CreateCellDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const CreateCellDialog = ({ open, onOpenChange }: CreateCellDialogProps) => {
  const { user } = useAuth();
  const { createCell } = useCells();
  const { fellowships } = useFellowships();
  const [leaders, setLeaders] = useState<any[]>([]);
  const [formData, setFormData] = useState({
    name: '',
    fellowship_id: '',
    leader_id: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const fetchLeaders = async () => {
      const { data } = await supabase
        .from('profiles')
        .select('id, name, fellowship_id');
      let filteredLeaders = data || [];
      if (formData.fellowship_id) {
        filteredLeaders = filteredLeaders.filter(
          leader => leader.fellowship_id === formData.fellowship_id || !leader.fellowship_id
        );
      }
      // Only allow leaders with a valid, non-empty id and name
      const validLeaders = filteredLeaders.filter(
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
  }, [open, formData.fellowship_id]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    const { error } = await createCell({
      ...formData,
      fellowship_id: formData.fellowship_id || null,
      leader_id: formData.leader_id || null,
    });
    
    if (!error) {
      setFormData({ name: '', fellowship_id: '', leader_id: '' });
      onOpenChange(false);
    }
    
    setIsSubmitting(false);
  };

  const availableFellowships = user?.role === 'admin' 
    ? fellowships.filter(f => typeof f.id === 'string' && f.id.trim() !== '' && typeof f.name === 'string' && f.name.trim() !== '')
    : fellowships.filter(f => f.id === user?.fellowship_id);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Create New Cell</DialogTitle>
          <DialogDescription>
            Add a new cell group to your church.
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
                onValueChange={(value) => setFormData(prev => ({ 
                  ...prev, 
                  fellowship_id: value,
                  leader_id: '' // Reset leader when fellowship changes
                }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select fellowship" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="" disabled>Select fellowship</SelectItem>
                  {availableFellowships
                    .filter(fellowship => typeof fellowship.id === 'string' && fellowship.id.trim() !== '' && typeof fellowship.name === 'string' && fellowship.name.trim() !== '')
                    .map((fellowship) => (
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
              {isSubmitting ? 'Creating...' : 'Create Cell'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};
