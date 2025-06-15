
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { supabase } from '@/integrations/supabase/client';
import { Trophy, Users, Target } from 'lucide-react';

interface LeaderboardEntry {
  id: string;
  name: string;
  score: number;
  achievements_count?: number;
  invitations_count?: number;
}

export const LeaderboardCard = () => {
  const [userLeaderboard, setUserLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [teamLeaderboard, setTeamLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchLeaderboards = async () => {
    try {
      setLoading(true);

      // Fetch user leaderboard based on achievements count
      const { data: users } = await supabase
        .from('profiles')
        .select('id, name');

      if (users) {
        const userScores = await Promise.all(
          users.map(async (user) => {
            const { data: achievements } = await supabase
              .from('user_achievements')
              .select('*')
              .eq('user_id', user.id);
            
            const { data: invitations } = await supabase
              .from('invitees')
              .select('*')
              .eq('invited_by', user.id);

            return {
              ...user,
              score: achievements?.length || 0,
              achievements_count: achievements?.length || 0,
              invitations_count: invitations?.length || 0,
            };
          })
        );

        setUserLeaderboard(
          userScores
            .sort((a, b) => b.score - a.score)
            .slice(0, 10)
        );
      }

      // Fetch team leaderboard based on team achievements
      const { data: teams } = await supabase
        .from('teams')
        .select('id, name');

      if (teams) {
        const teamScores = await Promise.all(
          teams.map(async (team) => {
            const { data: achievements } = await supabase
              .from('team_achievements')
              .select('*')
              .eq('team_id', team.id);

            return {
              ...team,
              score: achievements?.length || 0,
            };
          })
        );

        setTeamLeaderboard(
          teamScores
            .sort((a, b) => b.score - a.score)
            .slice(0, 10)
        );
      }
    } catch (error) {
      console.log('Error fetching leaderboards:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLeaderboards();
  }, []);

  const getRankIcon = (rank: number) => {
    if (rank === 1) return '🥇';
    if (rank === 2) return '🥈';
    if (rank === 3) return '🥉';
    return rank.toString();
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <Tabs defaultValue="users" className="w-full">
      <TabsList className="grid w-full grid-cols-2">
        <TabsTrigger value="users">Individual</TabsTrigger>
        <TabsTrigger value="teams">Teams</TabsTrigger>
      </TabsList>

      <TabsContent value="users">
        <Card className="animate-fade-in">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Trophy className="h-5 w-5" />
              Top Achievers
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {userLeaderboard.map((user, index) => (
                <div 
                  key={user.id} 
                  className="flex items-center justify-between p-3 rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center font-bold text-blue-800">
                      {getRankIcon(index + 1)}
                    </div>
                    <div>
                      <p className="font-medium">{user.name}</p>
                      <p className="text-sm text-gray-600">
                        {user.invitations_count} invitations sent
                      </p>
                    </div>
                  </div>
                  <Badge variant="secondary">
                    {user.achievements_count} achievements
                  </Badge>
                </div>
              ))}
              
              {userLeaderboard.length === 0 && (
                <p className="text-center text-gray-500 py-4">
                  No data available yet
                </p>
              )}
            </div>
          </CardContent>
        </Card>
      </TabsContent>

      <TabsContent value="teams">
        <Card className="animate-fade-in">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              Top Teams
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {teamLeaderboard.map((team, index) => (
                <div 
                  key={team.id} 
                  className="flex items-center justify-between p-3 rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center font-bold text-green-800">
                      {getRankIcon(index + 1)}
                    </div>
                    <div>
                      <p className="font-medium">{team.name}</p>
                    </div>
                  </div>
                  <Badge variant="secondary">
                    {team.score} achievements
                  </Badge>
                </div>
              ))}
              
              {teamLeaderboard.length === 0 && (
                <p className="text-center text-gray-500 py-4">
                  No team data available yet
                </p>
              )}
            </div>
          </CardContent>
        </Card>
      </TabsContent>
    </Tabs>
  );
};
