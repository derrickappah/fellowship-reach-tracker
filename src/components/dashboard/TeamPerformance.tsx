
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useTeamPerformance } from '@/hooks/useTeamPerformance';
import { Users, Target, TrendingUp, Award } from 'lucide-react';
import { format } from 'date-fns';

interface TeamPerformanceProps {
  selectedDate: Date;
}

export const TeamPerformance = ({ selectedDate }: TeamPerformanceProps) => {
  const { teamPerformance, loading } = useTeamPerformance(selectedDate);

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[1, 2, 3, 4].map((i) => (
          <Card key={i} className="animate-pulse">
            <CardHeader className="pb-2">
              <div className="h-4 bg-gray-200 rounded w-3/4"></div>
            </CardHeader>
            <CardContent>
              <div className="h-8 bg-gray-200 rounded w-1/2"></div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Team Performance Overview</h2>
        <Badge variant="outline">
          {format(selectedDate, "MMMM yyyy")}
        </Badge>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Teams</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">
              {teamPerformance?.totalTeams || 0}
            </div>
            <p className="text-xs text-muted-foreground">
              Active teams
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Invitees</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {teamPerformance?.totalInvitees || 0}
            </div>
            <p className="text-xs text-muted-foreground">
              People invited this month
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Attendance Rate</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-600">
              {teamPerformance?.attendanceRate || 0}%
            </div>
            <p className="text-xs text-muted-foreground">
              Of invited people attended
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Top Performer</CardTitle>
            <Award className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">
              {teamPerformance?.topTeam?.name || 'N/A'}
            </div>
            <p className="text-xs text-muted-foreground">
              {teamPerformance?.topTeam?.invitees || 0} invitees
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Team Details */}
      <Card>
        <CardHeader>
          <CardTitle>Team Performance Details</CardTitle>
          <CardDescription>
            Performance breakdown by team for {format(selectedDate, "MMMM yyyy")}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {teamPerformance?.teams?.map((team) => (
              <div key={team.id} className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex items-center space-x-4">
                  <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                    <Users className="h-5 w-5 text-blue-600" />
                  </div>
                  <div>
                    <h3 className="font-medium">{team.name}</h3>
                    <p className="text-sm text-muted-foreground">
                      {team.members} members
                    </p>
                  </div>
                </div>
                <div className="text-right space-y-1">
                  <div className="flex items-center space-x-4">
                    <div className="text-center">
                      <div className="text-lg font-bold text-green-600">{team.invitees}</div>
                      <div className="text-xs text-muted-foreground">Invitees</div>
                    </div>
                    <div className="text-center">
                      <div className="text-lg font-bold text-blue-600">{team.attendees}</div>
                      <div className="text-xs text-muted-foreground">Attended</div>
                    </div>
                    <div className="text-center">
                      <div className="text-lg font-bold text-purple-600">{team.conversions}</div>
                      <div className="text-xs text-muted-foreground">Joined</div>
                    </div>
                  </div>
                  <Badge variant={team.invitees > 5 ? "default" : "secondary"}>
                    {team.invitees > 5 ? "High Performer" : "Getting Started"}
                  </Badge>
                </div>
              </div>
            ))}
            
            {(!teamPerformance?.teams || teamPerformance.teams.length === 0) && (
              <div className="text-center py-8 text-muted-foreground">
                No team performance data available for this period.
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
