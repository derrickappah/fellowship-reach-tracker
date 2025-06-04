
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Plus, Search, Church, Users, Group } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';

export const ManageFellowships = () => {
  const { user } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');
  const [showCreateForm, setShowCreateForm] = useState(false);

  // Only admins can access this component
  if (user?.role !== 'admin') {
    return (
      <div className="text-center py-8">
        <h2 className="text-xl font-semibold text-gray-900 mb-2">Access Denied</h2>
        <p className="text-gray-600">You don't have permission to manage fellowships.</p>
      </div>
    );
  }

  // Mock data - replace with real Supabase queries later
  const mockFellowships = [
    {
      id: '1',
      name: 'Victory Fellowship',
      leaderId: '1',
      leaderName: 'Pastor John',
      description: 'Main fellowship for young adults',
      cellCount: 3,
      memberCount: 12,
      createdAt: new Date('2024-01-01')
    },
    {
      id: '2',
      name: 'Grace Fellowship',
      leaderId: '2',
      leaderName: 'Leader Mary',
      description: 'Family-oriented fellowship',
      cellCount: 2,
      memberCount: 8,
      createdAt: new Date('2024-01-15')
    }
  ];

  const filteredFellowships = mockFellowships.filter(fellowship =>
    fellowship.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    fellowship.description?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Manage Fellowships</h1>
          <p className="text-gray-600">Manage all church fellowships</p>
        </div>
        <Button onClick={() => setShowCreateForm(true)}>
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
                Led by {fellowship.leaderName}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <p className="text-sm text-gray-600">{fellowship.description}</p>
                
                <div className="flex justify-between text-sm">
                  <div className="flex items-center">
                    <Group className="mr-1 h-4 w-4 text-gray-400" />
                    {fellowship.cellCount} cells
                  </div>
                  <div className="flex items-center">
                    <Users className="mr-1 h-4 w-4 text-gray-400" />
                    {fellowship.memberCount} members
                  </div>
                </div>
                
                <div className="flex gap-2">
                  <Button size="sm" variant="outline" className="flex-1">
                    Edit Fellowship
                  </Button>
                  <Button size="sm" variant="outline" className="flex-1">
                    View Details
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
              <Button onClick={() => setShowCreateForm(true)}>
                <Plus className="mr-2 h-4 w-4" />
                Create Your First Fellowship
              </Button>
            )}
          </CardContent>
        </Card>
      )}

      {/* Create Form Modal/Dialog would go here */}
      {showCreateForm && (
        <Card className="max-w-md mx-auto">
          <CardHeader>
            <CardTitle>Create New Fellowship</CardTitle>
            <CardDescription>Set up a new fellowship</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-center py-4 text-gray-500">
              Create fellowship form will be implemented
            </div>
            <div className="flex gap-2">
              <Button onClick={() => setShowCreateForm(false)} variant="outline" className="flex-1">
                Cancel
              </Button>
              <Button className="flex-1">Create Fellowship</Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};
