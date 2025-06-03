
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useChurch } from '@/context/ChurchContext';
import { Users, Church, Group, User } from 'lucide-react';

interface DashboardProps {
  onNavigate: (section: string) => void;
}

export const Dashboard: React.FC<DashboardProps> = ({ onNavigate }) => {
  const { fellowships, cells, members, groups, invitees, currentUser } = useChurch();

  const weeklyInvitees = invitees.filter(i => {
    const weekAgo = new Date();
    weekAgo.setDate(weekAgo.getDate() - 7);
    return i.inviteDate >= weekAgo;
  });

  const attendanceRate = invitees.length > 0 ? 
    (invitees.filter(i => i.attendedService).length / invitees.length * 100).toFixed(1) : 0;

  const conversionRate = invitees.length > 0 ? 
    (invitees.filter(i => i.cellId).length / invitees.length * 100).toFixed(1) : 0;

  const userFellowship = currentUser?.fellowshipId ? 
    fellowships.find(f => f.id === currentUser.fellowshipId) : null;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Welcome, {currentUser?.name}</h1>
          <p className="text-gray-600">
            {currentUser?.role === 'admin' ? 'System Administrator' : 
             currentUser?.role === 'fellowship_leader' ? `${userFellowship?.name} Leader` : 
             'Church Member'}
          </p>
        </div>
        <Button onClick={() => onNavigate('invitees')}>
          Register New Invitee
        </Button>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Fellowships</CardTitle>
            <Church className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{fellowships.length}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Cells</CardTitle>
            <Group className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{cells.length}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Members</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{members.length}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Outreach Groups</CardTitle>
            <User className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{groups.filter(g => g.isActive).length}</div>
          </CardContent>
        </Card>
      </div>

      {/* Weekly Performance */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>This Week's Invitees</CardTitle>
            <CardDescription>New people reached through outreach</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-blue-600">{weeklyInvitees.length}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Attendance Rate</CardTitle>
            <CardDescription>Invitees who attended service</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-green-600">{attendanceRate}%</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Conversion Rate</CardTitle>
            <CardDescription>Invitees who joined a cell</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-purple-600">{conversionRate}%</div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
          <CardDescription>Common tasks for your role</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Button onClick={() => onNavigate('invitees')} variant="outline">
              Register Invitee
            </Button>
            <Button onClick={() => onNavigate('reports')} variant="outline">
              View Reports
            </Button>
            {(currentUser?.role === 'admin' || currentUser?.role === 'fellowship_leader') && (
              <>
                <Button onClick={() => onNavigate('groups')} variant="outline">
                  Manage Groups
                </Button>
                <Button onClick={() => onNavigate('members')} variant="outline">
                  View Members
                </Button>
              </>
            )}
            {currentUser?.role === 'admin' && (
              <>
                <Button onClick={() => onNavigate('fellowships')} variant="outline">
                  Manage Fellowships
                </Button>
                <Button onClick={() => onNavigate('cells')} variant="outline">
                  Manage Cells
                </Button>
              </>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
