
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Plus, Users, UserPlus, Settings, Edit, Trash2 } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useGroups } from '@/hooks/useGroups';
import { CreateGroupDialog } from './CreateGroupDialog';
import { EditGroupDialog } from './EditGroupDialog';
import { DeleteConfirmDialog } from '@/components/ui/delete-confirm-dialog';

export const ManageGroups = () => {
  const { user } = useAuth();
  const { groups, loading, deleteGroup } = useGroups();
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [editingGroup, setEditingGroup] = useState<any>(null);
  const [deletingGroup, setDeletingGroup] = useState<any>(null);

  const filteredGroups = user?.role === 'admin' 
    ? groups 
    : groups.filter(group => group.fellowship_id === user?.fellowship_id);

  const handleDelete = async () => {
    if (deletingGroup) {
      await deleteGroup(deletingGroup.id);
      setDeletingGroup(null);
    }
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
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Manage Groups</h1>
          <p className="text-gray-600">
            {user?.role === 'admin' ? 'Manage all outreach groups' : 'Manage your fellowship groups'}
          </p>
        </div>
        <Button onClick={() => setShowCreateDialog(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Create Group
        </Button>
      </div>

      {/* Groups Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredGroups.map((group) => (
          <Card key={group.id}>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg">{group.name}</CardTitle>
                <Badge variant={group.is_active ? 'default' : 'secondary'}>
                  {group.is_active ? 'Active' : 'Inactive'}
                </Badge>
              </div>
              <CardDescription>
                {group.fellowship?.name} • Led by {group.leader?.name || 'No leader assigned'}
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
                    onClick={() => setEditingGroup(group)}
                  >
                    <Edit className="mr-2 h-3 w-3" />
                    Edit
                  </Button>
                  <Button 
                    size="sm" 
                    variant="outline"
                    onClick={() => setDeletingGroup(group)}
                    className="text-red-600 hover:text-red-700"
                  >
                    <Trash2 className="h-3 w-3" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredGroups.length === 0 && (
        <Card>
          <CardContent className="text-center py-8">
            <Users className="mx-auto h-12 w-12 text-gray-400 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No groups found</h3>
            <p className="text-gray-600 mb-4">
              Get started by creating your first outreach group.
            </p>
            <Button onClick={() => setShowCreateDialog(true)}>
              <Plus className="mr-2 h-4 w-4" />
              Create Your First Group
            </Button>
          </CardContent>
        </Card>
      )}

      <CreateGroupDialog 
        open={showCreateDialog} 
        onOpenChange={setShowCreateDialog} 
      />

      <EditGroupDialog 
        group={editingGroup}
        open={!!editingGroup} 
        onOpenChange={(open) => !open && setEditingGroup(null)} 
      />

      <DeleteConfirmDialog
        open={!!deletingGroup}
        onOpenChange={(open) => !open && setDeletingGroup(null)}
        onConfirm={handleDelete}
        title="Delete Group"
        description={`Are you sure you want to delete "${deletingGroup?.name}"? This action cannot be undone.`}
      />
    </div>
  );
};
