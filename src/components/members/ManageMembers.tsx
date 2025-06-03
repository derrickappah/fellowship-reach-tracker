
import React, { useState } from 'react';
import { useChurch } from '@/context/ChurchContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Plus, Users, Trash2, Edit, Search } from 'lucide-react';
import { CreateMemberForm } from './CreateMemberForm';

export const ManageMembers = () => {
  const { members, cells, fellowships, currentUser, deleteMember } = useChurch();
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  const userMembers = currentUser?.role === 'admin'
    ? members
    : members.filter(m => m.fellowshipId === currentUser?.fellowshipId);

  const filteredMembers = userMembers.filter(member =>
    member.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    member.email?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getCellName = (cellId: string) => {
    return cells.find(c => c.id === cellId)?.name || 'No Cell';
  };

  const getFellowshipName = (fellowshipId: string) => {
    return fellowships.find(f => f.id === fellowshipId)?.name || 'Unknown Fellowship';
  };

  const handleDeleteMember = (memberId: string) => {
    if (confirm('Are you sure you want to delete this member?')) {
      deleteMember(memberId);
    }
  };

  const canManageMembers = currentUser?.role === 'admin' || currentUser?.role === 'fellowship_leader';

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Manage Members</h1>
        {canManageMembers && (
          <Button onClick={() => setShowCreateForm(true)}>
            <Plus className="mr-2 h-4 w-4" />
            Add Member
          </Button>
        )}
      </div>

      {showCreateForm && (
        <Card>
          <CardHeader>
            <CardTitle>Add New Member</CardTitle>
          </CardHeader>
          <CardContent>
            <CreateMemberForm onSuccess={() => setShowCreateForm(false)} />
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Members ({filteredMembers.length})
          </CardTitle>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
            <Input
              placeholder="Search members..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {filteredMembers.length === 0 ? (
              <div className="text-center py-8">
                <Users className="h-16 w-16 mx-auto text-gray-400 mb-4" />
                <h3 className="text-lg font-semibold mb-2">No Members Found</h3>
                <p className="text-muted-foreground">
                  {searchTerm ? 'No members match your search.' : 'No members have been added yet.'}
                </p>
              </div>
            ) : (
              filteredMembers.map((member) => (
                <div key={member.id} className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex-1">
                    <div className="flex items-center gap-3">
                      <div>
                        <h3 className="font-medium">{member.name}</h3>
                        <p className="text-sm text-muted-foreground">{member.email}</p>
                        {member.phone && (
                          <p className="text-sm text-muted-foreground">{member.phone}</p>
                        )}
                      </div>
                    </div>
                    <div className="flex gap-2 mt-2">
                      <Badge variant="outline" className="capitalize">
                        {member.role.replace('_', ' ')}
                      </Badge>
                      <Badge variant="secondary">
                        {getFellowshipName(member.fellowshipId)}
                      </Badge>
                      <Badge variant="outline">
                        {getCellName(member.cellId)}
                      </Badge>
                    </div>
                  </div>
                  {canManageMembers && member.id !== currentUser?.id && (
                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDeleteMember(member.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
