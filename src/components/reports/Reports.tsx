
import React, { useState, useMemo } from 'react';
import { useChurch } from '@/context/ChurchContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { BarChart3, Users, UserCheck, TrendingUp } from 'lucide-react';
import { format, startOfWeek, endOfWeek, isWithinInterval } from 'date-fns';

export const Reports = () => {
  const { invitees, groups, cells, fellowships, members } = useChurch();
  const [selectedWeek, setSelectedWeek] = useState('current');
  const [filterBy, setFilterBy] = useState('all');

  const getCurrentWeekDates = () => {
    const now = new Date();
    return {
      start: startOfWeek(now),
      end: endOfWeek(now)
    };
  };

  const getLastWeekDates = () => {
    const now = new Date();
    const lastWeek = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    return {
      start: startOfWeek(lastWeek),
      end: endOfWeek(lastWeek)
    };
  };

  const filteredInvitees = useMemo(() => {
    let filtered = invitees;

    // Filter by week
    if (selectedWeek === 'current') {
      const { start, end } = getCurrentWeekDates();
      filtered = filtered.filter(inv => 
        isWithinInterval(inv.inviteDate, { start, end })
      );
    } else if (selectedWeek === 'last') {
      const { start, end } = getLastWeekDates();
      filtered = filtered.filter(inv => 
        isWithinInterval(inv.inviteDate, { start, end })
      );
    }

    return filtered;
  }, [invitees, selectedWeek]);

  const stats = useMemo(() => {
    const totalInvitees = filteredInvitees.length;
    const attendedService = filteredInvitees.filter(inv => inv.attendedService).length;
    const joinedCell = filteredInvitees.filter(inv => inv.status === 'joined_cell').length;
    const conversionRate = totalInvitees > 0 ? (joinedCell / totalInvitees * 100).toFixed(1) : '0';

    return {
      totalInvitees,
      attendedService,
      joinedCell,
      conversionRate
    };
  }, [filteredInvitees]);

  const groupStats = useMemo(() => {
    const groupData = groups.map(group => {
      const groupInvitees = filteredInvitees.filter(inv => inv.groupId === group.id);
      const attended = groupInvitees.filter(inv => inv.attendedService).length;
      const joined = groupInvitees.filter(inv => inv.status === 'joined_cell').length;
      
      return {
        groupName: group.name,
        totalInvitees: groupInvitees.length,
        attended,
        joined,
        conversionRate: groupInvitees.length > 0 ? (joined / groupInvitees.length * 100).toFixed(1) : '0'
      };
    });

    return groupData.sort((a, b) => b.totalInvitees - a.totalInvitees);
  }, [groups, filteredInvitees]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <h1 className="text-3xl font-bold">Reports & Analytics</h1>
        
        <div className="flex flex-col sm:flex-row gap-2">
          <Select value={selectedWeek} onValueChange={setSelectedWeek}>
            <SelectTrigger className="w-40">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="current">Current Week</SelectItem>
              <SelectItem value="last">Last Week</SelectItem>
              <SelectItem value="all">All Time</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Invitees</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalInvitees}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Attended Service</CardTitle>
            <UserCheck className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.attendedService}</div>
            <p className="text-xs text-muted-foreground">
              {stats.totalInvitees > 0 ? (stats.attendedService / stats.totalInvitees * 100).toFixed(1) : 0}% of total
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Joined Cell</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.joinedCell}</div>
            <p className="text-xs text-muted-foreground">
              {stats.totalInvitees > 0 ? (stats.joinedCell / stats.totalInvitees * 100).toFixed(1) : 0}% of total
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Conversion Rate</CardTitle>
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.conversionRate}%</div>
            <p className="text-xs text-muted-foreground">Invitee to cell member</p>
          </CardContent>
        </Card>
      </div>

      {/* Group Performance */}
      <Card>
        <CardHeader>
          <CardTitle>Group Performance</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {groupStats.length === 0 ? (
              <p className="text-muted-foreground text-center py-4">No data available for the selected period</p>
            ) : (
              groupStats.map((group, index) => (
                <div key={index} className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex-1">
                    <h3 className="font-medium">{group.groupName}</h3>
                    <div className="flex gap-4 mt-2">
                      <span className="text-sm text-muted-foreground">
                        Total: {group.totalInvitees}
                      </span>
                      <span className="text-sm text-muted-foreground">
                        Attended: {group.attended}
                      </span>
                      <span className="text-sm text-muted-foreground">
                        Joined: {group.joined}
                      </span>
                    </div>
                  </div>
                  <Badge variant={Number(group.conversionRate) > 50 ? "default" : "secondary"}>
                    {group.conversionRate}% conversion
                  </Badge>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>

      {/* Recent Invitees */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Invitees</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {filteredInvitees.length === 0 ? (
              <p className="text-muted-foreground text-center py-4">No invitees for the selected period</p>
            ) : (
              filteredInvitees.slice(0, 10).map((invitee) => {
                const group = groups.find(g => g.id === invitee.groupId);
                const cell = cells.find(c => c.id === invitee.cellId);
                
                return (
                  <div key={invitee.id} className="flex items-center justify-between p-3 border rounded">
                    <div>
                      <p className="font-medium">{invitee.name}</p>
                      <p className="text-sm text-muted-foreground">
                        Invited by {group?.name || 'Unknown Group'} • {format(invitee.inviteDate, 'MMM dd, yyyy')}
                      </p>
                    </div>
                    <div className="flex gap-2">
                      <Badge variant={invitee.attendedService ? "default" : "secondary"}>
                        {invitee.attendedService ? "Attended" : "Pending"}
                      </Badge>
                      {invitee.cellId && (
                        <Badge variant="outline">
                          Joined {cell?.name || 'Cell'}
                        </Badge>
                      )}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
