
import React, { useState } from 'react';
import { useChurch } from '@/context/ChurchContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Plus, Group, Trash2, Users } from 'lucide-react';
import { CreateCellForm } from './CreateCellForm';

export const ManageCells = () => {
  const { cells, members, fellowships, currentUser, deleteCell } = useChurch();
  const [showCreateForm, setShowCreateForm] = useState(false);

  const userCells = currentUser?.role === 'admin'
    ? cells
    : cells.filter(c => c.fellowshipId === currentUser?.fellowshipId);

  const getLeaderName = (leaderId?: string) => {
    if (!leaderId) return 'No Leader';
    return members.find(m => m.id === leaderId)?.name || 'Unknown Leader';
  };

  const getFellowshipName = (fellowshipId: string) => {
    return fellowships.find(f => f.id === fellowshipId)?.name || 'Unknown Fellowship';
  };

  const handleDeleteCell = (cellId: string) => {
    if (confirm('Are you sure you want to delete this cell? This will affect all its members.')) {
      deleteCell(cellId);
    }
  };

  const canManageCells = currentUser?.role === 'admin' || currentUser?.role === 'fellowship_leader';

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Manage Cells</h1>
        {canManageCells && (
          <Button onClick={() => setShowCreateForm(true)}>
            <Plus className="mr-2 h-4 w-4" />
            Create Cell
          </Button>
        )}
      </div>

      {showCreateForm && (
        <Card>
          <CardHeader>
            <CardTitle>Create New Cell</CardTitle>
          </CardHeader>
          <CardContent>
            <CreateCellForm onSuccess={() => setShowCreateForm(false)} />
          </CardContent>
        </Card>
      )}

      <div className="grid gap-4">
        {userCells.length === 0 ? (
          <Card>
            <CardContent className="text-center py-12">
              <Group className="h-16 w-16 mx-auto text-gray-400 mb-4" />
              <h2 className="text-xl font-semibold mb-2">No Cells Found</h2>
              <p className="text-gray-600 mb-4">
                {canManageCells 
                  ? 'Create your first cell to organize members.'
                  : 'No cells are available for your fellowship.'}
              </p>
            </CardContent>
          </Card>
        ) : (
          userCells.map((cell) => (
            <Card key={cell.id}>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-lg">{cell.name}</CardTitle>
                    <p className="text-sm text-muted-foreground">
                      {getFellowshipName(cell.fellowshipId)}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      Led by {getLeaderName(cell.leaderId)}
                    </p>
                  </div>
                  {canManageCells && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDeleteCell(cell.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-2">
                  <Users className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm">
                    {cell.memberCount} {cell.memberCount === 1 ? 'Member' : 'Members'}
                  </span>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
};
