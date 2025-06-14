
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Plus, Users, UserPlus, Settings, Edit, Trash2 } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useTeams } from '@/hooks/useTeams';
import { CreateTeamDialog } from './CreateTeamDialog';
import { EditTeamDialog } from './EditTeamDialog';
import { DeleteConfirmDialog } from '@/components/ui/delete-confirm-dialog';
import { MemberListDialog } from '@/components/members/MemberListDialog';
import { TeamInvitesDialog } from './TeamInvitesDialog';

export const ManageTeams = () => {
  const { user } = useAuth();
  const { teams, loading, deleteTeam } = useTeams();
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [editingTeam, setEditingTeam] = useState<any>(null);
  const [deletingTeam, setDeletingTeam] = useState<any>(null);
  const [memberDialog, setMemberDialog] = useState<{ open: boolean; team: any } | null>(null);
  const [teamInvitesDialog, setTeamInvitesDialog] = useState<{ open: boolean; team: any } | null>(null);

  const filteredTeams = user?.role === 'admin' 
    ? teams 
    : teams.filter(team => team.fellowship_id === user?.fellowship_id);

  const handleDelete = async () => {
    if (deletingTeam) {
      await deleteTeam(deletingTeam.id);
      setDeletingTeam(null);
    }
  };

  const handleCardClick = (team: any, event: React.MouseEvent) => {
    // Prevent card click when clicking on buttons
    if ((event.target as HTMLElement).closest('button')) {
      return;
    }
    setTeamInvitesDialog({ open: true, team });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between animate-fade-in">
        <div>
          <h1 className="text-3xl font-bold">Manage Teams</h1>
          <p className="text-gray-600">
            {user?.role === 'admin' ? 'Manage all outreach teams' : 'Manage your fellowship teams'}
          </p>
        </div>
        <Button onClick={() => setShowCreateDialog(true)} className="hover:scale-105 transition-transform duration-200">
          <Plus className="mr-2 h-4 w-4" />
          Create Team
        </Button>
      </div>

      {/* Teams Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredTeams.map((team, index) => (
          <Card 
            key={team.id} 
            className="cursor-pointer transition-all duration-300 hover:shadow-lg hover:scale-105 hover:bg-accent/10 animate-fade-in"
            style={{ animationDelay: `${index * 100}ms`, animationFillMode: 'backwards' }}
            onClick={(e) => handleCardClick(team, e)}
          >
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg">{team.name}</CardTitle>
                <Badge variant={team.is_active ? 'default' : 'secondary'} className="transition-colors duration-200">
                  {team.is_active ? 'Active' : 'Inactive'}
                </Badge>
              </div>
              <CardDescription>
                {team.fellowship?.name || 'No fellowship'} • Led by {team.leader?.name || 'No leader assigned'}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center text-sm text-gray-600">
                  <Users className="mr-2 h-4 w-4" />
                  0 members
                </div>
                
                <div className="flex gap-2">
                  <Button 
                    size="sm" 
                    variant="outline" 
                    onClick={() => setEditingTeam(team)}
                    className="hover:scale-105 transition-all duration-200"
                  >
                    <Edit className="mr-2 h-3 w-3" />
                    Edit
                  </Button>
                  <Button 
                    size="sm" 
                    variant="outline"
                    onClick={() => setMemberDialog({ open: true, team })}
                    className="hover:scale-105 transition-all duration-200"
                  >
                    <UserPlus className="mr-2 h-3 w-3" />
                    Members
                  </Button>
                  <Button 
                    size="sm" 
                    variant="outline"
                    onClick={() => setDeletingTeam(team)}
                    className="text-red-600 hover:text-red-700 hover:scale-105 transition-all duration-200"
                  >
                    <Trash2 className="h-3 w-3" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredTeams.length === 0 && (
        <Card className="animate-fade-in">
          <CardContent className="text-center py-8">
            <Users className="mx-auto h-12 w-12 text-gray-400 mb-4 animate-pulse" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No teams found</h3>
            <p className="text-gray-600 mb-4">
              Get started by creating your first outreach team.
            </p>
            <Button onClick={() => setShowCreateDialog(true)} className="hover:scale-105 transition-transform duration-200">
              <Plus className="mr-2 h-4 w-4" />
              Create Your First Team
            </Button>
          </CardContent>
        </Card>
      )}

      <CreateTeamDialog 
        open={showCreateDialog} 
        onOpenChange={setShowCreateDialog} 
      />

      <EditTeamDialog 
        team={editingTeam}
        open={!!editingTeam} 
        onOpenChange={(open) => !open && setEditingTeam(null)} 
      />

      <DeleteConfirmDialog
        open={!!deletingTeam}
        onOpenChange={(open) => !open && setDeletingTeam(null)}
        onConfirm={handleDelete}
        title="Delete Team"
        description={`Are you sure you want to delete "${deletingTeam?.name}"? This action cannot be undone.`}
      />

      {memberDialog && (
        <MemberListDialog
          open={memberDialog.open}
          onOpenChange={(open) => !open && setMemberDialog(null)}
          title="Manage Team Members"
          type="team"
          entityId={memberDialog.team.id}
          entityName={memberDialog.team.name}
        />
      )}

      {teamInvitesDialog && (
        <TeamInvitesDialog
          open={teamInvitesDialog.open}
          onOpenChange={(open) => !open && setTeamInvitesDialog(null)}
          team={teamInvitesDialog.team}
        />
      )}
    </div>
  );
};
