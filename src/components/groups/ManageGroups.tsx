
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Plus, Users, UserPlus, Settings } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';

export const ManageGroups = () => {
  const { user } = useAuth();
  const [showCreateForm, setShowCreateForm] = useState(false);

  // Mock data - replace with real Supabase queries later
  const mockGroups = [
    {
      id: '1',
      name: 'Outreach Team Alpha',
      fellowshipId: '1',
      fellowshipName: 'Victory Fellowship',
      leaderId: '1',
      leaderName: 'Pastor John',
      memberCount: 3,
      isActive: true,
      createdAt: new Date('2024-02-01')
    },
    {
      id: '2',
      name: 'Youth Ministry Team',
      fellowshipId: '2',
      fellowshipName: 'Grace Fellowship',
      leaderId: '2',
      leaderName: 'Leader Mary',
      memberCount: 5,
      isActive: true,
      createdAt: new Date('2024-02-15')
    }
  ];

  const filteredGroups = user?.role === 'admin' 
    ? mockGroups 
    : mockGroups.filter(group => group.fellowshipId === user?.fellowship_id);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Manage Groups</h1>
          <p className="text-gray-600">
            {user?.role === 'admin' ? 'Manage all outreach groups' : 'Manage your fellowship groups'}
          </p>
        </div>
        <Button onClick={() => setShowCreateForm(true)}>
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
                <Badge variant={group.isActive ? 'default' : 'secondary'}>
                  {group.isActive ? 'Active' : 'Inactive'}
                </Badge>
              </div>
              <CardDescription>
                {group.fellowshipName} • Led by {group.leaderName}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center text-sm text-gray-600">
                  <Users className="mr-2 h-4 w-4" />
                  {group.memberCount} members
                </div>
                
                <div className="flex gap-2">
                  <Button size="sm" variant="outline" className="flex-1">
                    <UserPlus className="mr-2 h-3 w-3" />
                    Add Members
                  </Button>
                  <Button size="sm" variant="outline">
                    <Settings className="h-3 w-3" />
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
            <Button onClick={() => setShowCreateForm(true)}>
              <Plus className="mr-2 h-4 w-4" />
              Create Your First Group
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Create Form Modal/Dialog would go here */}
      {showCreateForm && (
        <Card className="max-w-md mx-auto">
          <CardHeader>
            <CardTitle>Create New Group</CardTitle>
            <CardDescription>Set up a new outreach group</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-center py-4 text-gray-500">
              Create group form will be implemented
            </div>
            <div className="flex gap-2">
              <Button onClick={() => setShowCreateForm(false)} variant="outline" className="flex-1">
                Cancel
              </Button>
              <Button className="flex-1">Create Group</Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};
