
import React, { useState } from 'react';
import { useChurch } from '@/context/ChurchContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Plus, Users, Trash2, Edit } from 'lucide-react';
import { CreateGroupForm } from './CreateGroupForm';

export const ManageGroups = () => {
  const { groups, members, fellowships, currentUser, deleteGroup } = useChurch();
  const [showCreateForm, setShowCreateForm] = useState(false);

  const userGroups = currentUser?.role === 'admin' 
    ? groups 
    : groups.filter(g => g.fellowshipId === currentUser?.fellowshipId);

  const getGroupMembers = (memberIds: string[]) => {
    return memberIds.map(id => members.find(m => m.id === id)).filter(Boolean);
  };

  const getFellowshipName = (fellowshipId: string) => {
    return fellowships.find(f => f.id === fellowshipId)?.name || 'Unknown Fellowship';
  };

  const handleDeleteGroup = (groupId: string) => {
    if (confirm('Are you sure you want to delete this group?')) {
      deleteGroup(groupId);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Manage Groups</h1>
        {(currentUser?.role === 'admin' || currentUser?.role === 'fellowship_leader') && (
          <Button onClick={() => setShowCreateForm(true)}>
            <Plus className="mr-2 h-4 w-4" />
            Create Group
          </Button>
        )}
      </div>

      {showCreateForm && (
        <Card>
          <CardHeader>
            <CardTitle>Create New Group</CardTitle>
          </CardHeader>
          <CardContent>
            <CreateGroupForm onSuccess={() => setShowCreateForm(false)} />
          </CardContent>
        </Card>
      )}

      <div className="grid gap-4">
        {userGroups.length === 0 ? (
          <Card>
            <CardContent className="text-center py-12">
              <Users className="h-16 w-16 mx-auto text-gray-400 mb-4" />
              <h2 className="text-xl font-semibold mb-2">No Groups Found</h2>
              <p className="text-gray-600 mb-4">
                {currentUser?.role === 'admin' || currentUser?.role === 'fellowship_leader' 
                  ? 'Create your first group to start organizing outreach teams.'
                  : 'No groups are available for your fellowship.'}
              </p>
            </CardContent>
          </Card>
        ) : (
          userGroups.map((group) => {
            const groupMembers = getGroupMembers(group.memberIds);
            
            return (
              <Card key={group.id}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="text-lg">{group.name}</CardTitle>
                      <p className="text-sm text-muted-foreground">
                        {getFellowshipName(group.fellowshipId)}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant={group.isActive ? "default" : "secondary"}>
                        {group.isActive ? "Active" : "Inactive"}
                      </Badge>
                      {(currentUser?.role === 'admin' || currentUser?.role === 'fellowship_leader') && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleDeleteGroup(group.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div>
                    <h4 className="font-medium mb-2">Members ({groupMembers.length}/3)</h4>
                    <div className="space-y-2">
                      {groupMembers.map((member) => (
                        <div key={member.id} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                          <div>
                            <p className="font-medium">{member.name}</p>
                            <p className="text-sm text-muted-foreground">{member.email}</p>
                          </div>
                          <Badge variant="outline" className="capitalize">
                            {member.role.replace('_', ' ')}
                          </Badge>
                        </div>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })
        )}
      </div>
    </div>
  );
};
