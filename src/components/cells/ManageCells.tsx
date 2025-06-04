
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Plus, Search, Group, Users, Church } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';

export const ManageCells = () => {
  const { user } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');
  const [showCreateForm, setShowCreateForm] = useState(false);

  // Only admins can access this component
  if (user?.role !== 'admin') {
    return (
      <div className="text-center py-8">
        <h2 className="text-xl font-semibold text-gray-900 mb-2">Access Denied</h2>
        <p className="text-gray-600">You don't have permission to manage cells.</p>
      </div>
    );
  }

  // Mock data - replace with real Supabase queries later
  const mockCells = [
    {
      id: '1',
      name: 'Cell Alpha',
      fellowshipId: '1',
      fellowshipName: 'Victory Fellowship',
      leaderId: '3',
      leaderName: 'Leader Alice',
      memberCount: 4,
      createdAt: new Date('2024-01-05')
    },
    {
      id: '2',
      name: 'Cell Beta',
      fellowshipId: '1',
      fellowshipName: 'Victory Fellowship',
      leaderId: '4',
      leaderName: 'Leader Bob',
      memberCount: 4,
      createdAt: new Date('2024-01-10')
    },
    {
      id: '3',
      name: 'Cell Gamma',
      fellowshipId: '1',
      fellowshipName: 'Victory Fellowship',
      leaderId: '5',
      leaderName: 'Leader Charlie',
      memberCount: 4,
      createdAt: new Date('2024-01-12')
    },
    {
      id: '4',
      name: 'Cell Delta',
      fellowshipId: '2',
      fellowshipName: 'Grace Fellowship',
      leaderId: '6',
      leaderName: 'Leader Diana',
      memberCount: 3,
      createdAt: new Date('2024-01-20')
    }
  ];

  const filteredCells = mockCells.filter(cell =>
    cell.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    cell.fellowshipName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    cell.leaderName.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Manage Cells</h1>
          <p className="text-gray-600">Manage all church cells</p>
        </div>
        <Button onClick={() => setShowCreateForm(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Create Cell
        </Button>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
        <Input
          placeholder="Search cells by name, fellowship, or leader..."
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
                {cell.fellowshipName} • Led by {cell.leaderName}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center text-sm text-gray-600">
                  <Users className="mr-2 h-4 w-4" />
                  {cell.memberCount} members
                </div>
                
                <div className="flex items-center text-sm text-gray-600">
                  <Church className="mr-2 h-4 w-4" />
                  {cell.fellowshipName}
                </div>
                
                <div className="flex gap-2">
                  <Button size="sm" variant="outline" className="flex-1">
                    Edit Cell
                  </Button>
                  <Button size="sm" variant="outline" className="flex-1">
                    View Members
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
              <Button onClick={() => setShowCreateForm(true)}>
                <Plus className="mr-2 h-4 w-4" />
                Create Your First Cell
              </Button>
            )}
          </CardContent>
        </Card>
      )}

      {/* Create Form Modal/Dialog would go here */}
      {showCreateForm && (
        <Card className="max-w-md mx-auto">
          <CardHeader>
            <CardTitle>Create New Cell</CardTitle>
            <CardDescription>Set up a new cell group</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-center py-4 text-gray-500">
              Create cell form will be implemented
            </div>
            <div className="flex gap-2">
              <Button onClick={() => setShowCreateForm(false)} variant="outline" className="flex-1">
                Cancel
              </Button>
              <Button className="flex-1">Create Cell</Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};
