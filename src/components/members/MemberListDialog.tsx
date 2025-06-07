import React, { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Search, UserPlus, UserMinus } from 'lucide-react';
import { Profile } from '@/types/supabase';
import { useMembers } from '@/hooks/useMembers';
import { MemberAssignDialog } from './MemberAssignDialog';

interface MemberListDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  type: 'fellowship' | 'cell' | 'team';
  entityId: string;
  entityName: string;
}

export const MemberListDialog = ({ open, onOpenChange, title, type, entityId, entityName }: MemberListDialogProps) => {
  const { members, assignToFellowship, assignToCell, assignToTeam } = useMembers();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedMember, setSelectedMember] = useState<Profile | null>(null);
  const [showAssignDialog, setShowAssignDialog] = useState(false);

  const currentMembers = members.filter(member => {
    switch (type) {
      case 'fellowship':
        return member.fellowship_id === entityId;
      case 'cell':
        return member.cell_id === entityId;
      case 'team':
        // This would need to be fetched from team_members table
        return false; // Placeholder
      default:
        return false;
    }
  });

  const availableMembers = members.filter(member => {
    const matchesSearch = member.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         member.email.toLowerCase().includes(searchTerm.toLowerCase());
    
    switch (type) {
      case 'fellowship':
        return matchesSearch && !member.fellowship_id;
      case 'cell':
        return matchesSearch && !member.cell_id;
      case 'team':
        return matchesSearch; // Would need to check team_members table
      default:
        return false;
    }
  });

  const handleAddMember = async (member: Profile) => {
    switch (type) {
      case 'fellowship':
        await assignToFellowship(member.id, entityId);
        break;
      case 'cell':
        await assignToCell(member.id, entityId);
        break;
      case 'team':
        await assignToTeam(member.id, entityId);
        break;
    }
  };

  const handleRemoveMember = async (member: Profile) => {
    switch (type) {
      case 'fellowship':
        await assignToFellowship(member.id, null);
        break;
      case 'cell':
        await assignToCell(member.id, null);
        break;
      case 'team':
        await assignToTeam(member.id, null);
        break;
    }
  };

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-[600px] max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{title}</DialogTitle>
            <DialogDescription>
              Manage members for {entityName}
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            {/* Current Members */}
            <div>
              <h3 className="text-lg font-medium mb-3">Current Members ({currentMembers.length})</h3>
              <div className="space-y-2 max-h-40 overflow-y-auto">
                {currentMembers.map((member) => (
                  <div key={member.id} className="flex items-center justify-between p-2 border rounded">
                    <div>
                      <p className="font-medium">{member.name}</p>
                      <p className="text-sm text-gray-600">{member.email}</p>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => {
                          setSelectedMember(member);
                          setShowAssignDialog(true);
                        }}
                      >
                        Edit
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleRemoveMember(member)}
                      >
                        <UserMinus className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
                {currentMembers.length === 0 && (
                  <p className="text-gray-500 text-center py-4">No members assigned</p>
                )}
              </div>
            </div>

            {/* Add Members */}
            <div>
              <h3 className="text-lg font-medium mb-3">Add Members</h3>
              <div className="relative mb-3">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="Search available members..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              <div className="space-y-2 max-h-40 overflow-y-auto">
                {availableMembers.map((member) => (
                  <div key={member.id} className="flex items-center justify-between p-2 border rounded">
                    <div>
                      <p className="font-medium">{member.name}</p>
                      <p className="text-sm text-gray-600">{member.email}</p>
                      <div className="flex gap-1 mt-1">
                        {member.fellowship_id && <Badge variant="secondary" className="text-xs">Fellowship</Badge>}
                        {member.cell_id && <Badge variant="secondary" className="text-xs">Cell</Badge>}
                      </div>
                    </div>
                    <Button
                      size="sm"
                      onClick={() => handleAddMember(member)}
                    >
                      <UserPlus className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
                {availableMembers.length === 0 && searchTerm && (
                  <p className="text-gray-500 text-center py-4">No available members found</p>
                )}
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <MemberAssignDialog
        open={showAssignDialog}
        onOpenChange={setShowAssignDialog}
        member={selectedMember}
      />
    </>
  );
};
