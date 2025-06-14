
import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useTeams } from '@/hooks/useTeams';
import { useFellowships } from '@/hooks/useFellowships';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

interface CreateTeamDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const CreateTeamDialog = ({ open, onOpenChange }: CreateTeamDialogProps) => {
  const { user } = useAuth();
  const { createTeam } = useTeams();
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
      // Fetch all profiles that could be team leaders
      const { data } = await supabase
        .from('profiles')
        .select('id, name, fellowship_id');
      
      // Filter leaders based on selected fellowship if any
      let filteredLeaders = data || [];
      if (formData.fellowship_id) {
        filteredLeaders = filteredLeaders.filter(leader => 
          leader.fellowship_id === formData.fellowship_id || !leader.fellowship_id
        );
      }
      
      setLeaders(filteredLeaders);
    };
    
    if (open) {
      fetchLeaders();
    }
  }, [open, formData.fellowship_id]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    const { error } = await createTeam({
      ...formData,
      fellowship_id: formData.fellowship_id === 'no-fellowship' ? null : formData.fellowship_id || null,
      leader_id: formData.leader_id === 'no-leader' ? null : formData.leader_id || null,
    });
    
    if (!error) {
      setFormData({ name: '', fellowship_id: '', leader_id: '' });
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
          <DialogTitle>Create New Team</DialogTitle>
          <DialogDescription>
            Add a new outreach team to your fellowship.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="name">Team Name</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                placeholder="Enter team name"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="fellowship">Fellowship</Label>
              <Select 
                value={formData.fellowship_id || 'no-fellowship'} 
                onValueChange={(value) => setFormData(prev => ({ 
                  ...prev, 
                  fellowship_id: value === 'no-fellowship' ? '' : value,
                  leader_id: '' // Reset leader when fellowship changes
                }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select fellowship" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="no-fellowship">No fellowship</SelectItem>
                  {availableFellowships
                    .filter((fellowship) => fellowship.id && typeof fellowship.id === 'string' && fellowship.id.trim() !== '')
                    .map((fellowship) => (
                      <SelectItem key={fellowship.id} value={fellowship.id}>
                        {fellowship.name}
                      </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="leader">Team Leader</Label>
              <Select 
                value={formData.leader_id || 'no-leader'} 
                onValueChange={(value) => setFormData(prev => ({ ...prev, leader_id: value === 'no-leader' ? '' : value }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select leader" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="no-leader">No leader</SelectItem>
                  {leaders
                    .filter((leader) => leader.id && typeof leader.id === 'string' && leader.id.trim() !== '')
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
              {isSubmitting ? 'Creating...' : 'Create Team'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};
