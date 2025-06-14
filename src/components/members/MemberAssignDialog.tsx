
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
  member: any; // Changed from Profile | null to support full member data with memberships
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
        fellowship_id: member.fellowship_memberships?.[0]?.fellowship_id || '',
        cell_id: member.cell_memberships?.[0]?.cell_id || '',
        team_id: member.team_memberships?.[0]?.team_id || '',
      });
    } else {
      setAssignments({
        fellowship_id: '',
        cell_id: '',
        team_id: '',
      });
    }
  }, [member]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!member) return;
    
    setIsSubmitting(true);

    const currentFellowshipId = member.fellowship_memberships?.[0]?.fellowship_id;
    if (assignments.fellowship_id !== (currentFellowshipId || '')) {
      await assignToFellowship(member.id, assignments.fellowship_id || null);
    }

    const currentCellId = member.cell_memberships?.[0]?.cell_id;
    if (assignments.cell_id !== (currentCellId || '')) {
      await assignToCell(member.id, assignments.cell_id || null);
    }

    const currentTeamId = member.team_memberships?.[0]?.team_id;
    if (assignments.team_id !== (currentTeamId || '')) {
      await assignToTeam(member.id, assignments.team_id || null);
    }

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
                value={assignments.fellowship_id || 'unassigned'}
                onValueChange={(value) => setAssignments(prev => ({ ...prev, fellowship_id: value === 'unassigned' ? '' : value }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select fellowship" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="unassigned">No fellowship</SelectItem>
                  {fellowships
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
              <Label htmlFor="cell">Cell</Label>
              <Select
                value={assignments.cell_id || 'unassigned'}
                onValueChange={(value) => setAssignments(prev => ({ ...prev, cell_id: value === 'unassigned' ? '' : value }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select cell" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="unassigned">No cell</SelectItem>
                  {cells
                    .filter(cell => cell.id && typeof cell.id === 'string' && cell.id.trim() !== '' && (!assignments.fellowship_id || cell.fellowship_id === assignments.fellowship_id))
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
                value={assignments.team_id || 'unassigned'}
                onValueChange={(value) => setAssignments(prev => ({ ...prev, team_id: value === 'unassigned' ? '' : value }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select team" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="unassigned">No team</SelectItem>
                  {teams
                    .filter(team => team.id && typeof team.id === 'string' && team.id.trim() !== '' && (!assignments.fellowship_id || team.fellowship_id === assignments.fellowship_id))
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
