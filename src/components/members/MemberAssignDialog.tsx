
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Profile } from '@/types/supabase';
import { useFellowships } from '@/hooks/useFellowships';
import { useCells } from '@/hooks/useCells';
import { useTeams } from '@/hooks/useTeams';
import { useMembers } from '@/hooks/useMembers';

interface MemberAssignDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  member: Profile | null;
}

export const MemberAssignDialog = ({ open, onOpenChange, member }: MemberAssignDialogProps) => {
  const { fellowships } = useFellowships();
  const { cells } = useCells();
  const { teams } = useTeams();
  const { assignToFellowship, assignToCell, assignToTeam } = useMembers();
  const [assignments, setAssignments] = useState({
    fellowship_id: '',
    cell_id: '',
    team_id: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  React.useEffect(() => {
    if (member) {
      setAssignments({
        fellowship_id: member.fellowship_id || '',
        cell_id: member.cell_id || '',
        team_id: '', // We'll need to fetch this from team_members table
      });
    }
  }, [member]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!member) return;
    
    setIsSubmitting(true);

    // Update fellowship assignment
    if (assignments.fellowship_id !== (member.fellowship_id || '')) {
      await assignToFellowship(member.id, assignments.fellowship_id || null);
    }

    // Update cell assignment
    if (assignments.cell_id !== (member.cell_id || '')) {
      await assignToCell(member.id, assignments.cell_id || null);
    }

    // Update team assignment
    await assignToTeam(member.id, assignments.team_id || null);

    setIsSubmitting(false);
    onOpenChange(false);
  };

  if (!member) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Assign Member</DialogTitle>
          <DialogDescription>
            Assign {member.name} to fellowship, cell, and team. Each member can only be in one of each.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="fellowship">Fellowship</Label>
              <Select 
                value={assignments.fellowship_id} 
                onValueChange={(value) => setAssignments(prev => ({ ...prev, fellowship_id: value }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select fellowship" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">No fellowship</SelectItem>
                  {fellowships.map((fellowship) => (
                    <SelectItem key={fellowship.id} value={fellowship.id}>
                      {fellowship.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="cell">Cell</Label>
              <Select 
                value={assignments.cell_id} 
                onValueChange={(value) => setAssignments(prev => ({ ...prev, cell_id: value }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select cell" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">No cell</SelectItem>
                  {cells
                    .filter(cell => !assignments.fellowship_id || cell.fellowship_id === assignments.fellowship_id)
                    .map((cell) => (
                      <SelectItem key={cell.id} value={cell.id}>
                        {cell.name}
                      </SelectItem>
                    ))}
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="team">Team</Label>
              <Select 
                value={assignments.team_id} 
                onValueChange={(value) => setAssignments(prev => ({ ...prev, team_id: value }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select team" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">No team</SelectItem>
                  {teams
                    .filter(team => !assignments.fellowship_id || team.fellowship_id === assignments.fellowship_id)
                    .map((team) => (
                      <SelectItem key={team.id} value={team.id}>
                        {team.name}
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
              {isSubmitting ? 'Updating...' : 'Update Assignments'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};
