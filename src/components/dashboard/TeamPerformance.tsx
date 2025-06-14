import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useTeamPerformance } from '@/hooks/useTeamPerformance';
import { Users, Target, TrendingUp, Award, Calendar, Medal, UserCheck } from 'lucide-react';
import { format, startOfWeek, endOfWeek, formatISO } from 'date-fns';
import { supabase } from '@/integrations/supabase/client';

interface TeamPerformanceProps {
  selectedDate: Date;
}

export const TeamPerformance = ({ selectedDate }: TeamPerformanceProps) => {
  const { teamPerformance, loading } = useTeamPerformance(selectedDate);
  const [topInviter, setTopInviter] = useState<{ name: string; count: number } | null>(null);
  const [topInviterLoading, setTopInviterLoading] = useState(true);
  const [confirmedInvites, setConfirmedInvites] = useState(0);
  const [confirmedInvitesLoading, setConfirmedInvitesLoading] = useState(true);

  const weekStart = startOfWeek(selectedDate, { weekStartsOn: 1 });
  const weekEnd = endOfWeek(selectedDate, { weekStartsOn: 1 });

  useEffect(() => {
    const fetchTopInviter = async () => {
      if (!selectedDate) return;
      setTopInviterLoading(true);
      try {
        const weekStartIso = formatISO(startOfWeek(selectedDate, { weekStartsOn: 1 }));
        const weekEndIso = formatISO(endOfWeek(selectedDate, { weekStartsOn: 1 }));

        const { data: invitees, error: inviteesError } = await supabase
          .from('invitees')
          .select('invited_by')
          .gte('invite_date', weekStartIso)
          .lte('invite_date', weekEndIso)
          .not('invited_by', 'is', null);

        if (inviteesError) throw inviteesError;

        if (!invitees || invitees.length === 0) {
          setTopInviter(null);
          return;
        }

        const inviterCounts = invitees.reduce((acc, { invited_by }) => {
          if (invited_by) {
            acc[invited_by] = (acc[invited_by] || 0) + 1;
          }
          return acc;
        }, {} as Record<string, number>);

        const topInviterId = Object.keys(inviterCounts).length > 0
          ? Object.keys(inviterCounts).reduce((a, b) => inviterCounts[a] > inviterCounts[b] ? a : b)
          : null;
        
        if (!topInviterId) {
          setTopInviter(null);
          return;
        }

        const { data: profile, error: profileError } = await supabase
          .from('profiles')
          .select('name')
          .eq('id', topInviterId)
          .single();

        if (profileError) {
          setTopInviter(null);
          console.error('Error fetching top inviter profile:', profileError.message);
        } else if (profile) {
          setTopInviter({ name: profile.name, count: inviterCounts[topInviterId] });
        }
      } catch (error: any) {
        console.error('Error fetching top inviter:', error.message);
        setTopInviter(null);
      } finally {
        setTopInviterLoading(false);
      }
    };

    fetchTopInviter();
  }, [selectedDate]);

  useEffect(() => {
    const fetchConfirmedInvites = async () => {
      if (!selectedDate) return;
      setConfirmedInvitesLoading(true);
      try {
        const weekStartIso = formatISO(startOfWeek(selectedDate, { weekStartsOn: 1 }));
        const weekEndIso = formatISO(endOfWeek(selectedDate, { weekStartsOn: 1 }));

        const { count, error } = await supabase
          .from('invitees')
          .select('*', { count: 'exact', head: true })
          .in('status', ['confirmed', 'attended', 'joined_cell'])
          .gte('invite_date', weekStartIso)
          .lte('invite_date', weekEndIso);

        if (error) throw error;
        
        setConfirmedInvites(count || 0);
      } catch (error: any) {
        console.error('Error fetching confirmed invites:', error.message);
        setConfirmedInvites(0);
      } finally {
        setConfirmedInvitesLoading(false);
      }
    };

    fetchConfirmedInvites();
  }, [selectedDate]);

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
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 md:gap-6">
        {[1, 2, 3, 4, 5, 6].map((i) => (
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
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
        <h2 className="text-xl sm:text-2xl font-bold text-foreground">Weekly Team Performance</h2>
        <Badge variant="outline" className="flex items-center gap-2 self-start sm:self-center">
          <Calendar className="h-3 w-3" />
          {format(weekStart, "MMM d")} - {format(weekEnd, "MMM d, yyyy")}
        </Badge>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 md:gap-6">
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
            <CardTitle className="text-sm font-medium text-muted-foreground">Confirmed Invites</CardTitle>
            <UserCheck className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {confirmedInvitesLoading ? (
              <div className="space-y-2">
                <div className="h-7 bg-muted rounded w-3/4 animate-pulse"></div>
                <div className="h-3 bg-muted rounded w-1/2 animate-pulse"></div>
              </div>
            ) : (
              <>
                <div className="text-2xl font-bold text-cyan-600 dark:text-cyan-400">
                  {confirmedInvites}
                </div>
                <p className="text-xs text-muted-foreground">
                  Invitees who confirmed attendance
                </p>
              </>
            )}
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
              {teamPerformance?.topTeam?.name || 'N/A'}
            </div>
            <p className="text-xs text-muted-foreground">
              {teamPerformance?.topTeam?.invitees || 0} invitees
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Top Inviter</CardTitle>
            <Medal className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {topInviterLoading ? (
              <div className="space-y-2">
                <div className="h-7 bg-muted rounded w-3/4 animate-pulse"></div>
                <div className="h-3 bg-muted rounded w-1/2 animate-pulse"></div>
              </div>
            ) : (
              <>
                <div className="text-2xl font-bold text-yellow-600 dark:text-yellow-400">
                  {topInviter?.name || 'N/A'}
                </div>
                <p className="text-xs text-muted-foreground">
                  {topInviter ? `${topInviter.count} invitees this week` : 'No invites this week'}
                </p>
              </>
            )}
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
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mb-4">
                  <div className="flex items-center space-x-4">
                    <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center flex-shrink-0">
                      <Users className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                    </div>
                    <div>
                      <h3 className="font-medium text-foreground">{team.name}</h3>
                      <p className="text-sm text-muted-foreground">
                        {team.members} members
                      </p>
                    </div>
                  </div>
                  <Badge variant={team.totalInvitees > 5 ? "default" : "secondary"} className="self-start sm:self-center">
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
