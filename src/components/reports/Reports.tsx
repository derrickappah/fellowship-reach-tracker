
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { useAuth } from '@/contexts/AuthContext';

export const Reports = () => {
  const { user } = useAuth();

  // Mock data - replace with real Supabase queries later
  const weeklyData = [
    { week: 'Week 1', invitees: 4, attendees: 3, conversions: 1 },
    { week: 'Week 2', invitees: 6, attendees: 4, conversions: 2 },
    { week: 'Week 3', invitees: 3, attendees: 2, conversions: 1 },
    { week: 'Week 4', invitees: 5, attendees: 4, conversions: 3 },
  ];

  const statusData = [
    { name: 'Invited', value: 8, color: '#8884d8' },
    { name: 'Attended', value: 6, color: '#82ca9d' },
    { name: 'Joined Cell', value: 4, color: '#ffc658' },
    { name: 'No Show', value: 2, color: '#ff7c7c' },
  ];

  const stats = {
    totalInvitees: 20,
    totalAttendees: 13,
    conversionRate: 65,
    averageWeeklyInvites: 4.5
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Reports & Analytics</h1>
          <p className="text-gray-600">
            {user?.role === 'admin' ? 'System-wide analytics' : 
             user?.role === 'fellowship_leader' ? 'Fellowship analytics' : 
             'Your outreach analytics'}
          </p>
        </div>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total Invitees</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{stats.totalInvitees}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total Attendees</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{stats.totalAttendees}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Conversion Rate</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-600">{stats.conversionRate}%</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Avg Weekly Invites</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">{stats.averageWeeklyInvites}</div>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Weekly Performance</CardTitle>
            <CardDescription>Invitees, attendees, and conversions over time</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={weeklyData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="week" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="invitees" fill="#8884d8" name="Invitees" />
                <Bar dataKey="attendees" fill="#82ca9d" name="Attendees" />
                <Bar dataKey="conversions" fill="#ffc658" name="Conversions" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Invitee Status Distribution</CardTitle>
            <CardDescription>Current status of all invitees</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={statusData}
                  cx="50%"
                  cy="50%"
                  outerRadius={80}
                  dataKey="value"
                  label={({ name, value }) => `${name}: ${value}`}
                >
                  {statusData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Additional insights for admins */}
      {user?.role === 'admin' && (
        <Card>
          <CardHeader>
            <CardTitle>Fellowship Performance</CardTitle>
            <CardDescription>Comparative performance across fellowships</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-center py-8 text-gray-500">
              Fellowship comparison charts will be implemented with real data
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};
