
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useTeamPerformance } from '@/hooks/useTeamPerformance';
import { Users, Target, TrendingUp, Award, Calendar } from 'lucide-react';
import { format, startOfWeek, endOfWeek } from 'date-fns';

interface TeamPerformanceProps {
  selectedDate: Date;
}

export const TeamPerformance = ({ selectedDate }: TeamPerformanceProps) => {
  const { teamPerformance, loading } = useTeamPerformance(selectedDate);

  const weekStart = startOfWeek(selectedDate, { weekStartsOn: 1 });
  const weekEnd = endOfWeek(selectedDate, { weekStartsOn: 1 });

  // Add debugging logs to see what the component receives
  console.log('=== TEAM PERFORMANCE COMPONENT DEBUG ===');
  console.log('teamPerformance received by component:', teamPerformance);
  console.log('loading state:', loading);
  console.log('totalInvitees from state:', teamPerformance?.totalInvitees);
  console.log('totalTeams from state:', teamPerformance?.totalTeams);
  console.log('attendanceRate from state:', teamPerformance?.attendanceRate);
  console.log('topTeam from state:', teamPerformance?.topTeam);

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[1, 2, 3, 4].map((i) => (
          <Card key={i} className="animate-pulse">
            <CardHeader className="pb-2">
              <div className="h-4 bg-muted rounded w-3/4"></div>
            </CardHeader>
            <CardContent>
              <div className="h-8 bg-muted rounded w-1/2"></div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  // Force display actual values and add fallbacks
  const displayTotalTeams = teamPerformance?.totalTeams ?? 0;
  const displayTotalInvitees = teamPerformance?.totalInvitees ?? 0;
  const displayAttendanceRate = teamPerformance?.attendanceRate ?? 0;
  const displayTopTeam = teamPerformance?.topTeam;

  console.log('Display values:', {
    displayTotalTeams,
    displayTotalInvitees,
    displayAttendanceRate,
    displayTopTeam
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-foreground">Weekly Team Performance</h2>
        <Badge variant="outline" className="flex items-center gap-2">
          <Calendar className="h-3 w-3" />
          {format(weekStart, "MMM d")} - {format(weekEnd, "MMM d, yyyy")}
        </Badge>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Teams</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
              {displayTotalTeams}
            </div>
            <p className="text-xs text-muted-foreground">
              Active teams this week
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Invitees</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600 dark:text-green-400">
              {displayTotalInvitees}
            </div>
            <p className="text-xs text-muted-foreground">
              People invited this week
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Attendance Rate</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">
              {displayAttendanceRate}%
            </div>
            <p className="text-xs text-muted-foreground">
              Of invited people attended
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Top Performer</CardTitle>
            <Award className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600 dark:text-orange-400">
              {displayTopTeam?.name || 'N/A'}
            </div>
            <p className="text-xs text-muted-foreground">
              {displayTopTeam?.invitees || 0} invitees
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Team Details */}
      <Card>
        <CardHeader>
          <CardTitle className="text-foreground">Weekly Team Performance Breakdown</CardTitle>
          <CardDescription>
            Performance by team for the week of {format(weekStart, "MMM d")} - {format(weekEnd, "MMM d, yyyy")}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {teamPerformance?.teams?.map((team) => (
              <div key={team.id} className="border border-border rounded-lg p-4 bg-card">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center space-x-4">
                    <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center">
                      <Users className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                    </div>
                    <div>
                      <h3 className="font-medium text-foreground">{team.name}</h3>
                      <p className="text-sm text-muted-foreground">
                        {team.members} members
                      </p>
                    </div>
                  </div>
                  <Badge variant={team.totalInvitees > 5 ? "default" : "secondary"}>
                    {team.totalInvitees > 5 ? "High Performer" : "Getting Started"}
                  </Badge>
                </div>

                {/* Service breakdown */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {/* Wednesday Service */}
                  <div className="bg-blue-50 dark:bg-blue-900/20 p-3 rounded-lg">
                    <h4 className="font-medium text-blue-900 dark:text-blue-100 mb-2">Wednesday Midweek</h4>
                    <div className="flex justify-between text-sm text-blue-800 dark:text-blue-200">
                      <span>Invited: <span className="font-bold text-blue-900 dark:text-blue-100">{team.wednesdayInvitees}</span></span>
                      <span>Attended: <span className="font-bold text-blue-600 dark:text-blue-400">{team.wednesdayAttendees}</span></span>
                    </div>
                  </div>

                  {/* Sunday Service */}
                  <div className="bg-green-50 dark:bg-green-900/20 p-3 rounded-lg">
                    <h4 className="font-medium text-green-900 dark:text-green-100 mb-2">Sunday Service</h4>
                    <div className="flex justify-between text-sm text-green-800 dark:text-green-200">
                      <span>Invited: <span className="font-bold text-green-900 dark:text-green-100">{team.sundayInvitees}</span></span>
                      <span>Attended: <span className="font-bold text-green-600 dark:text-green-400">{team.sundayAttendees}</span></span>
                    </div>
                  </div>

                  {/* Total Performance */}
                  <div className="bg-purple-50 dark:bg-purple-900/20 p-3 rounded-lg">
                    <h4 className="font-medium text-purple-900 dark:text-purple-100 mb-2">Weekly Total</h4>
                    <div className="space-y-1 text-sm text-purple-800 dark:text-purple-200">
                      <div className="flex justify-between">
                        <span>Total Invited:</span>
                        <span className="font-bold text-purple-900 dark:text-purple-100">{team.totalInvitees}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Total Attended:</span>
                        <span className="font-bold text-purple-600 dark:text-purple-400">{team.totalAttendees}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Joined Cell:</span>
                        <span className="font-bold text-orange-600 dark:text-orange-400">{team.conversions}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
            
            {(!teamPerformance?.teams || teamPerformance.teams.length === 0) && (
              <div className="text-center py-8 text-muted-foreground">
                No team performance data available for this week.
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
