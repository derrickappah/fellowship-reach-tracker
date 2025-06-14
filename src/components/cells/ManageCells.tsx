import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Plus, Search, Group, Users, Church, Edit, Trash2, UserPlus } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useCells } from '@/hooks/useCells';
import { CreateCellDialog } from './CreateCellDialog';
import { EditCellDialog } from './EditCellDialog';
import { DeleteConfirmDialog } from '@/components/ui/delete-confirm-dialog';
import { MemberListDialog } from '@/components/members/MemberListDialog';
import { Cell } from '@/types/supabase'; // Import Cell type

export const ManageCells = () => {
  const { user } = useAuth();
  const { cells, loading, deleteCell } = useCells();
  const [searchTerm, setSearchTerm] = useState('');
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [editingCell, setEditingCell] = useState<Cell | null>(null); // Changed type from any to Cell | null
  const [deletingCell, setDeletingCell] = useState<Cell | null>(null); // Changed type from any to Cell | null
  const [memberDialog, setMemberDialog] = useState<{ open: boolean; cell: Cell } | null>(null); // Assuming cell here is also of type Cell

  // Only admins can access this component
  if (user?.role !== 'admin') {
    return (
      <div className="text-center py-8">
        <h2 className="text-xl font-semibold text-gray-900 mb-2">Access Denied</h2>
        <p className="text-gray-600">You don't have permission to manage cells.</p>
      </div>
    );
  }

  const filteredCells = cells.filter(cell =>
    cell.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleDelete = async () => {
    if (deletingCell) {
      await deleteCell(deletingCell.id);
      setDeletingCell(null);
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
          <h1 className="text-3xl font-bold">Manage Cells</h1>
          <p className="text-gray-600">Manage all church cells</p>
        </div>
        <Button onClick={() => setShowCreateDialog(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Create Cell
        </Button>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
        <Input
          placeholder="Search cells by name..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-10"
        />
      </div>

      {/* Cells Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredCells.map((cell) => (
          <Card key={cell.id}>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg flex items-center">
                  <Group className="mr-2 h-5 w-5" />
                  {cell.name}
                </CardTitle>
                <Badge variant="default">Active</Badge>
              </div>
              <CardDescription>
                {cell.fellowship?.name || 'No fellowship'} • Led by {cell.leader?.name || 'No leader assigned'}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center text-sm text-gray-600">
                  <Users className="mr-2 h-4 w-4" />
                  {cell.member_count || 0} members
                </div>
                
                <div className="flex gap-2">
                  <Button 
                    size="sm" 
                    variant="outline"
                    onClick={() => setEditingCell(cell)}
                  >
                    <Edit className="mr-2 h-3 w-3" />
                    Edit
                  </Button>
                  <Button 
                    size="sm" 
                    variant="outline"
                    onClick={() => setMemberDialog({ open: true, cell })}
                  >
                    <UserPlus className="mr-2 h-3 w-3" />
                    Members
                  </Button>
                  <Button 
                    size="sm" 
                    variant="outline"
                    onClick={() => setDeletingCell(cell)}
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

      {filteredCells.length === 0 && (
        <Card>
          <CardContent className="text-center py-8">
            <Group className="mx-auto h-12 w-12 text-gray-400 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No cells found</h3>
            <p className="text-gray-600 mb-4">
              {searchTerm ? 'Try adjusting your search terms.' : 'Get started by creating your first cell.'}
            </p>
            {!searchTerm && (
              <Button onClick={() => setShowCreateDialog(true)}>
                <Plus className="mr-2 h-4 w-4" />
                Create Your First Cell
              </Button>
            )}
          </CardContent>
        </Card>
      )}

      <CreateCellDialog 
        open={showCreateDialog} 
        onOpenChange={setShowCreateDialog} 
      />

      <EditCellDialog 
        cell={editingCell}
        open={!!editingCell && typeof editingCell.id === 'string'}
        onOpenChange={(open) => {
          if (!open) setEditingCell(null);
        }}
      />

      <DeleteConfirmDialog
        open={!!deletingCell}
        onOpenChange={(open) => !open && setDeletingCell(null)}
        onConfirm={handleDelete}
        title="Delete Cell"
        description={`Are you sure you want to delete "${deletingCell?.name}"? This action cannot be undone.`}
      />

      {memberDialog && (
        <MemberListDialog
          open={memberDialog.open}
          onOpenChange={(open) => !open && setMemberDialog(null)}
          title="Manage Cell Members"
          type="cell"
          entityId={memberDialog.cell.id}
          entityName={memberDialog.cell.name}
        />
      )}
    </div>
  );
};
