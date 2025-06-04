
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import { Users, Church, Group, User } from 'lucide-react';

interface DashboardProps {
  onNavigate: (section: string) => void;
}

export const Dashboard: React.FC<DashboardProps> = ({ onNavigate }) => {
  const { user } = useAuth();

  // Mock data for now - will be replaced with real Supabase queries later
  const mockStats = {
    fellowships: 2,
    cells: 3,
    members: 12,
    groups: 1,
    weeklyInvitees: 5,
    attendanceRate: 75,
    conversionRate: 60
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Welcome, {user?.name}</h1>
          <p className="text-gray-600">
            {user?.role === 'admin' ? 'System Administrator' : 
             user?.role === 'fellowship_leader' ? 'Fellowship Leader' : 
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
            <div className="text-2xl font-bold">{mockStats.fellowships}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Cells</CardTitle>
            <Group className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{mockStats.cells}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Members</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{mockStats.members}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Outreach Groups</CardTitle>
            <User className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{mockStats.groups}</div>
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
            <div className="text-3xl font-bold text-blue-600">{mockStats.weeklyInvitees}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Attendance Rate</CardTitle>
            <CardDescription>Invitees who attended service</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-green-600">{mockStats.attendanceRate}%</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Conversion Rate</CardTitle>
            <CardDescription>Invitees who joined a cell</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-purple-600">{mockStats.conversionRate}%</div>
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
            {(user?.role === 'admin' || user?.role === 'fellowship_leader') && (
              <>
                <Button onClick={() => onNavigate('groups')} variant="outline">
                  Manage Groups
                </Button>
                <Button onClick={() => onNavigate('members')} variant="outline">
                  View Members
                </Button>
              </>
            )}
            {user?.role === 'admin' && (
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
