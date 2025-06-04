
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Plus, Search, Mail, Phone, Users } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';

export const ManageMembers = () => {
  const { user } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');
  const [showCreateForm, setShowCreateForm] = useState(false);

  // Mock data - replace with real Supabase queries later
  const mockMembers = [
    {
      id: '1',
      name: 'Pastor John',
      email: 'john@church.com',
      phone: '+1234567890',
      role: 'admin',
      fellowshipId: '1',
      fellowshipName: 'Victory Fellowship',
      cellId: '1',
      cellName: 'Cell Alpha',
      createdAt: new Date('2024-01-01')
    },
    {
      id: '2',
      name: 'Leader Mary',
      email: 'mary@church.com',
      phone: '+1234567891',
      role: 'fellowship_leader',
      fellowshipId: '2',
      fellowshipName: 'Grace Fellowship',
      cellId: '2',
      cellName: 'Cell Beta',
      createdAt: new Date('2024-01-01')
    },
    {
      id: '3',
      name: 'Member Sarah',
      email: 'sarah@church.com',
      phone: '+1234567892',
      role: 'member',
      fellowshipId: '1',
      fellowshipName: 'Victory Fellowship',
      cellId: '1',
      cellName: 'Cell Alpha',
      createdAt: new Date('2024-01-15')
    }
  ];

  const filteredMembers = mockMembers.filter(member => {
    const matchesSearch = member.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         member.email.toLowerCase().includes(searchTerm.toLowerCase());
    
    if (user?.role === 'admin') {
      return matchesSearch;
    } else if (user?.role === 'fellowship_leader') {
      return matchesSearch && member.fellowshipId === user.fellowship_id;
    }
    return false;
  });

  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case 'admin': return 'destructive';
      case 'fellowship_leader': return 'default';
      case 'member': return 'secondary';
      default: return 'secondary';
    }
  };

  const formatRole = (role: string) => {
    return role.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase());
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Manage Members</h1>
          <p className="text-gray-600">
            {user?.role === 'admin' ? 'Manage all church members' : 'Manage your fellowship members'}
          </p>
        </div>
        {user?.role === 'admin' && (
          <Button onClick={() => setShowCreateForm(true)}>
            <Plus className="mr-2 h-4 w-4" />
            Add Member
          </Button>
        )}
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
        <Input
          placeholder="Search members by name or email..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-10"
        />
      </div>

      {/* Members Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredMembers.map((member) => (
          <Card key={member.id}>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg">{member.name}</CardTitle>
                <Badge variant={getRoleBadgeColor(member.role)}>
                  {formatRole(member.role)}
                </Badge>
              </div>
              <CardDescription>
                {member.fellowshipName} • {member.cellName}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex items-center text-sm text-gray-600">
                  <Mail className="mr-2 h-4 w-4" />
                  {member.email}
                </div>
                
                {member.phone && (
                  <div className="flex items-center text-sm text-gray-600">
                    <Phone className="mr-2 h-4 w-4" />
                    {member.phone}
                  </div>
                )}
                
                {user?.role === 'admin' && (
                  <div className="pt-2">
                    <Button size="sm" variant="outline" className="w-full">
                      Edit Member
                    </Button>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredMembers.length === 0 && (
        <Card>
          <CardContent className="text-center py-8">
            <Users className="mx-auto h-12 w-12 text-gray-400 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No members found</h3>
            <p className="text-gray-600 mb-4">
              {searchTerm ? 'Try adjusting your search terms.' : 'No members in your fellowship yet.'}
            </p>
          </CardContent>
        </Card>
      )}

      {/* Create Form Modal/Dialog would go here */}
      {showCreateForm && (
        <Card className="max-w-md mx-auto">
          <CardHeader>
            <CardTitle>Add New Member</CardTitle>
            <CardDescription>Add a new church member</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-center py-4 text-gray-500">
              Add member form will be implemented
            </div>
            <div className="flex gap-2">
              <Button onClick={() => setShowCreateForm(false)} variant="outline" className="flex-1">
                Cancel
              </Button>
              <Button className="flex-1">Add Member</Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};
