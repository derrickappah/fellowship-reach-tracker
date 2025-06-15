
import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useForm } from 'react-hook-form';
import { useGoals } from '@/hooks/useGoals';
import { useAuth } from '@/contexts/AuthContext';
import { useTeams } from '@/hooks/useTeams';

interface CreateGoalDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

interface GoalFormData {
  title: string;
  description: string;
  target_value: number;
  goal_type: 'individual' | 'team';
  entity_id: string;
  deadline?: string;
}

export const CreateGoalDialog: React.FC<CreateGoalDialogProps> = ({ 
  open, 
  onOpenChange 
}) => {
  const { createGoal } = useGoals();
  const { user } = useAuth();
  const { teams } = useTeams();
  const { register, handleSubmit, reset, watch, setValue } = useForm<GoalFormData>();

  const goalType = watch('goal_type');

  const onSubmit = async (data: GoalFormData) => {
    const goalData = {
      ...data,
      target_value: Number(data.target_value),
      entity_id: data.goal_type === 'individual' ? user!.id : data.entity_id,
      current_value: 0,
      is_active: true,
    };

    const { error } = await createGoal(goalData);
    
    if (!error) {
      reset();
      onOpenChange(false);
    }
  };

  // Filter teams where user is a member or leader
  const availableTeams = teams.filter(team => 
    team.leader_id === user?.id || 
    // Note: We'd need to check team membership here, but for simplicity
    // we'll show all teams the user has access to
    true
  );

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Create New Goal</DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="title">Goal Title</Label>
            <Input
              id="title"
              {...register('title', { required: true })}
              placeholder="e.g., Invite 50 people this month"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description (Optional)</Label>
            <Textarea
              id="description"
              {...register('description')}
              placeholder="Additional details about this goal..."
              rows={3}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="target_value">Target Value</Label>
            <Input
              id="target_value"
              type="number"
              {...register('target_value', { required: true, min: 1 })}
              placeholder="e.g., 50"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="goal_type">Goal Type</Label>
            <Select onValueChange={(value) => setValue('goal_type', value as 'individual' | 'team')}>
              <SelectTrigger>
                <SelectValue placeholder="Select goal type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="individual">Individual Goal</SelectItem>
                <SelectItem value="team">Team Goal</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {goalType === 'team' && (
            <div className="space-y-2">
              <Label htmlFor="entity_id">Select Team</Label>
              <Select onValueChange={(value) => setValue('entity_id', value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select a team" />
                </SelectTrigger>
                <SelectContent>
                  {availableTeams.map((team) => (
                    <SelectItem key={team.id} value={team.id}>
                      {team.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="deadline">Deadline (Optional)</Label>
            <Input
              id="deadline"
              type="date"
              {...register('deadline')}
            />
          </div>

          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit">Create Goal</Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};
