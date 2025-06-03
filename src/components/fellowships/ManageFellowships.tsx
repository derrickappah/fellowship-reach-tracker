
import React, { useState } from 'react';
import { useChurch } from '@/context/ChurchContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Plus, Church, Trash2, Users } from 'lucide-react';
import { CreateFellowshipForm } from './CreateFellowshipForm';

export const ManageFellowships = () => {
  const { fellowships, members, currentUser, deleteFellowship } = useChurch();
  const [showCreateForm, setShowCreateForm] = useState(false);

  const getLeaderName = (leaderId: string) => {
    return members.find(m => m.id === leaderId)?.name || 'Unknown Leader';
  };

  const handleDeleteFellowship = (fellowshipId: string) => {
    if (confirm('Are you sure you want to delete this fellowship? This will affect all its cells and members.')) {
      deleteFellowship(fellowshipId);
    }
  };

  if (currentUser?.role !== 'admin') {
    return (
      <div className="text-center py-12">
        <Church className="h-16 w-16 mx-auto text-gray-400 mb-4" />
        <h2 className="text-2xl font-bold mb-2">Access Denied</h2>
        <p className="text-gray-600">Only administrators can manage fellowships.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Manage Fellowships</h1>
        <Button onClick={() => setShowCreateForm(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Create Fellowship
        </Button>
      </div>

      {showCreateForm && (
        <Card>
          <CardHeader>
            <CardTitle>Create New Fellowship</CardTitle>
          </CardHeader>
          <CardContent>
            <CreateFellowshipForm onSuccess={() => setShowCreateForm(false)} />
          </CardContent>
        </Card>
      )}

      <div className="grid gap-4">
        {fellowships.length === 0 ? (
          <Card>
            <CardContent className="text-center py-12">
              <Church className="h-16 w-16 mx-auto text-gray-400 mb-4" />
              <h2 className="text-xl font-semibold mb-2">No Fellowships Found</h2>
              <p className="text-gray-600 mb-4">Create your first fellowship to get started.</p>
            </CardContent>
          </Card>
        ) : (
          fellowships.map((fellowship) => (
            <Card key={fellowship.id}>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-lg">{fellowship.name}</CardTitle>
                    <p className="text-sm text-muted-foreground">
                      Led by {getLeaderName(fellowship.leaderId)}
                    </p>
                    {fellowship.description && (
                      <p className="text-sm text-muted-foreground mt-1">
                        {fellowship.description}
                      </p>
                    )}
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleDeleteFellowship(fellowship.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex gap-4">
                  <div className="flex items-center gap-2">
                    <Church className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm">
                      {fellowship.cellCount} {fellowship.cellCount === 1 ? 'Cell' : 'Cells'}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Users className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm">
                      {fellowship.memberCount} {fellowship.memberCount === 1 ? 'Member' : 'Members'}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
};
