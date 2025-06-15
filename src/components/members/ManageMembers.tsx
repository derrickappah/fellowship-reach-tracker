
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Plus, Search, Mail, Phone, Users, Edit } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useMembers } from '@/hooks/useMembers';
import { MemberAssignDialog } from './MemberAssignDialog';

export const ManageMembers = () => {
  const { user } = useAuth();
  const { members, loading } = useMembers();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedMember, setSelectedMember] = useState<any>(null);

  const filteredMembers = members.filter(member => {
    const matchesSearch = member.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         member.email.toLowerCase().includes(searchTerm.toLowerCase());
    
    if (user?.role === 'admin') {
      return matchesSearch;
    } else if (user?.role === 'fellowship_leader') {
      // Fellowship leaders can only see members in their fellowship
      const isInSameFellowship = member.fellowship_memberships?.some(
        fm => fm.fellowship && user.fellowship_id
      );
      return matchesSearch && isInSameFellowship;
    }
    return false;
  });

  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case 'admin': return 'destructive';
      case 'fellowship_leader': return 'default';
      case 'team_leader': return 'default';
      case 'team_member': return 'secondary';
      case 'member': return 'secondary';
      default: return 'secondary';
    }
  };

  const formatRole = (role: string) => {
    return role.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase());
  };

  const getFellowshipName = (member: any) => {
    return member.fellowship_memberships?.[0]?.fellowship?.name || 'No fellowship';
  };

  const getCellName = (member: any) => {
    return member.cell_memberships?.[0]?.cell?.name || 'No cell';
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
          <h1 className="text-3xl font-bold">Manage Members</h1>
          <p className="text-gray-600">
            {user?.role === 'admin' ? 'Manage all church members' : 'Manage your fellowship members'}
          </p>
        </div>
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
                <Badge variant={getRoleBadgeColor(member.user_role?.role || 'member')}>
                  {formatRole(member.user_role?.role || 'member')}
                </Badge>
              </div>
              <CardDescription>
                {getFellowshipName(member)} • {getCellName(member)}
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
                
                {(user?.role === 'admin' || user?.role === 'fellowship_leader') && (
                  <div className="pt-2">
                    <Button 
                      size="sm" 
                      variant="outline" 
                      className="w-full"
                      onClick={() => setSelectedMember(member)}
                    >
                      <Edit className="mr-2 h-3 w-3" />
                      Edit Assignments
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

      <MemberAssignDialog
        open={!!selectedMember}
        onOpenChange={(open) => !open && setSelectedMember(null)}
        member={selectedMember}
      />
    </div>
  );
};
