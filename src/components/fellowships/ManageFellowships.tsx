
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Plus, Search, Church, Users, Group, Edit, Trash2, UserPlus } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useFellowships } from '@/hooks/useFellowships';
import { CreateFellowshipDialog } from './CreateFellowshipDialog';
import { EditFellowshipDialog } from './EditFellowshipDialog';
import { DeleteConfirmDialog } from '@/components/ui/delete-confirm-dialog';
import { MemberListDialog } from '@/components/members/MemberListDialog';

export const ManageFellowships = () => {
  const { user } = useAuth();
  const { fellowships, loading, deleteFellowship } = useFellowships();
  const [searchTerm, setSearchTerm] = useState('');
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [editingFellowship, setEditingFellowship] = useState<any>(null);
  const [deletingFellowship, setDeletingFellowship] = useState<any>(null);
  const [memberDialog, setMemberDialog] = useState<{ open: boolean; fellowship: any } | null>(null);

  // Only admins can access this component
  if (user?.role !== 'admin') {
    return (
      <div className="text-center py-8">
        <h2 className="text-xl font-semibold text-gray-900 mb-2">Access Denied</h2>
        <p className="text-gray-600">You don't have permission to manage fellowships.</p>
      </div>
    );
  }

  const filteredFellowships = fellowships.filter(fellowship =>
    fellowship.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    fellowship.description?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleDelete = async () => {
    if (deletingFellowship) {
      await deleteFellowship(deletingFellowship.id);
      setDeletingFellowship(null);
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
          <h1 className="text-3xl font-bold">Manage Fellowships</h1>
          <p className="text-gray-600">Manage all church fellowships</p>
        </div>
        <Button onClick={() => setShowCreateDialog(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Create Fellowship
        </Button>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
        <Input
          placeholder="Search fellowships by name or description..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-10"
        />
      </div>

      {/* Fellowships Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {filteredFellowships.map((fellowship) => (
          <Card key={fellowship.id}>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg flex items-center">
                  <Church className="mr-2 h-5 w-5" />
                  {fellowship.name}
                </CardTitle>
                <Badge variant="default">Active</Badge>
              </div>
              <CardDescription>
                Led by {fellowship.leader?.name || 'No leader assigned'}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <p className="text-sm text-gray-600">{fellowship.description}</p>
                
                <div className="flex justify-between text-sm">
                  <div className="flex items-center">
                    <Group className="mr-1 h-4 w-4 text-gray-400" />
                    {fellowship.cell_count || 0} cells
                  </div>
                  <div className="flex items-center">
                    <Users className="mr-1 h-4 w-4 text-gray-400" />
                    {fellowship.member_count || 0} members
                  </div>
                </div>
                
                <div className="flex gap-2">
                  <Button 
                    size="sm" 
                    variant="outline" 
                    onClick={() => setEditingFellowship(fellowship)}
                  >
                    <Edit className="mr-2 h-3 w-3" />
                    Edit
                  </Button>
                  <Button 
                    size="sm" 
                    variant="outline"
                    onClick={() => setMemberDialog({ open: true, fellowship })}
                  >
                    <UserPlus className="mr-2 h-3 w-3" />
                    Members
                  </Button>
                  <Button 
                    size="sm" 
                    variant="outline" 
                    onClick={() => setDeletingFellowship(fellowship)}
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

      {filteredFellowships.length === 0 && (
        <Card>
          <CardContent className="text-center py-8">
            <Church className="mx-auto h-12 w-12 text-gray-400 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No fellowships found</h3>
            <p className="text-gray-600 mb-4">
              {searchTerm ? 'Try adjusting your search terms.' : 'Get started by creating your first fellowship.'}
            </p>
            {!searchTerm && (
              <Button onClick={() => setShowCreateDialog(true)}>
                <Plus className="mr-2 h-4 w-4" />
                Create Your First Fellowship
              </Button>
            )}
          </CardContent>
        </Card>
      )}

      <CreateFellowshipDialog 
        open={showCreateDialog} 
        onOpenChange={setShowCreateDialog} 
      />

      <EditFellowshipDialog 
        fellowship={editingFellowship}
        open={!!editingFellowship} 
        onOpenChange={(open) => !open && setEditingFellowship(null)} 
      />

      <DeleteConfirmDialog
        open={!!deletingFellowship}
        onOpenChange={(open) => !open && setDeletingFellowship(null)}
        onConfirm={handleDelete}
        title="Delete Fellowship"
        description={`Are you sure you want to delete "${deletingFellowship?.name}"? This action cannot be undone.`}
      />

      {memberDialog && (
        <MemberListDialog
          open={memberDialog.open}
          onOpenChange={(open) => !open && setMemberDialog(null)}
          title="Manage Fellowship Members"
          type="fellowship"
          entityId={memberDialog.fellowship.id}
          entityName={memberDialog.fellowship.name}
        />
      )}
    </div>
  );
};
