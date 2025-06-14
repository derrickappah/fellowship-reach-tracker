
import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useFellowships } from '@/hooks/useFellowships';
import { supabase } from '@/integrations/supabase/client';
import { FellowshipInsert } from '@/types/supabase';

interface CreateFellowshipDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const CreateFellowshipDialog = ({ open, onOpenChange }: CreateFellowshipDialogProps) => {
  const { createFellowship } = useFellowships();
  const [leaders, setLeaders] = useState<any[]>([]);
  const [formData, setFormData] = useState<FellowshipInsert>({
    name: '',
    description: '',
    leader_id: '',
  });
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    const { error } = await createFellowship({
      ...formData,
      leader_id: formData.leader_id || null,
    });
    
    if (!error) {
      setFormData({ name: '', description: '', leader_id: '' });
      onOpenChange(false);
    }
    
    setIsSubmitting(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Create New Fellowship</DialogTitle>
          <DialogDescription>
            Add a new fellowship to your church community.
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
