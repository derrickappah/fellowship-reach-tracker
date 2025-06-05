
import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { useGroups } from '@/hooks/useGroups';
import { useFellowships } from '@/hooks/useFellowships';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

interface EditGroupDialogProps {
  group: any;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const EditGroupDialog = ({ group, open, onOpenChange }: EditGroupDialogProps) => {
  const { user } = useAuth();
  const { updateGroup } = useGroups();
  const { fellowships } = useFellowships();
  const [leaders, setLeaders] = useState<any[]>([]);
  const [formData, setFormData] = useState({
    name: '',
    fellowship_id: '',
    leader_id: '',
    is_active: true,
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const fetchLeaders = async () => {
      const { data } = await supabase
        .from('profiles')
        .select('id, name');
      setLeaders(data || []);
    };
    fetchLeaders();
  }, []);

  useEffect(() => {
    if (group) {
      setFormData({
        name: group.name || '',
        fellowship_id: group.fellowship_id || '',
        leader_id: group.leader_id || '',
        is_active: group.is_active ?? true,
      });
    }
  }, [group]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!group) return;
    
    setIsSubmitting(true);

    const { error } = await updateGroup(group.id, {
      ...formData,
      fellowship_id: formData.fellowship_id || null,
      leader_id: formData.leader_id || null,
    });
    
    if (!error) {
      onOpenChange(false);
    }
    
    setIsSubmitting(false);
  };

  const availableFellowships = user?.role === 'admin' 
    ? fellowships 
    : fellowships.filter(f => f.id === user?.fellowship_id);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Edit Group</DialogTitle>
          <DialogDescription>
            Update the group information.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="name">Group Name</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                placeholder="Enter group name"
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
                  {availableFellowships.map((fellowship) => (
                    <SelectItem key={fellowship.id} value={fellowship.id}>
                      {fellowship.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="leader">Group Leader</Label>
              <Select 
                value={formData.leader_id} 
                onValueChange={(value) => setFormData(prev => ({ ...prev, leader_id: value }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select leader" />
                </SelectTrigger>
                <SelectContent>
                  {leaders.map((leader) => (
                    <SelectItem key={leader.id} value={leader.id}>
                      {leader.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-center space-x-2">
              <Switch
                id="is_active"
                checked={formData.is_active}
                onCheckedChange={(checked) => setFormData(prev => ({ ...prev, is_active: checked }))}
              />
              <Label htmlFor="is_active">Active Group</Label>
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
              {isSubmitting ? 'Updating...' : 'Update Group'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};
