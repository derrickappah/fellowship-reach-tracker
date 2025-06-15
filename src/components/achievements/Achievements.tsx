
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Trophy, Target, Users, Award } from 'lucide-react';
import { useAchievements } from '@/hooks/useAchievements';
import { useGoals } from '@/hooks/useGoals';
import { AchievementCard } from './AchievementCard';
import { LeaderboardCard } from './LeaderboardCard';
import { GoalCard } from './GoalCard';
import { CreateGoalDialog } from './CreateGoalDialog';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';

export const Achievements = () => {
  const { achievements, userAchievements, teamAchievements, loading: achievementsLoading } = useAchievements();
  const { goals, loading: goalsLoading } = useGoals();
  const [showCreateGoalDialog, setShowCreateGoalDialog] = useState(false);
  const { user } = useAuth();

  const myAchievements = userAchievements.filter(ua => ua.user_id === user?.id);
  const myGoals = goals.filter(goal => 
    (goal.goal_type === 'individual' && goal.entity_id === user?.id) ||
    (goal.goal_type === 'team' && goal.entity_id && user?.id)
  );

  if (achievementsLoading || goalsLoading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between animate-fade-in">
        <div>
          <h1 className="text-3xl font-bold">Achievements & Goals</h1>
          <p className="text-gray-600">Track your progress, earn badges, and compete with others</p>
        </div>
        <Button onClick={() => setShowCreateGoalDialog(true)} className="hover:scale-105 transition-transform duration-200">
          <Plus className="mr-2 h-4 w-4" />
          Create Goal
        </Button>
      </div>

      <Tabs defaultValue="overview" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="achievements">Achievements</TabsTrigger>
          <TabsTrigger value="leaderboard">Leaderboard</TabsTrigger>
          <TabsTrigger value="goals">Goals</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card className="animate-fade-in">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">My Achievements</CardTitle>
                <Trophy className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{myAchievements.length}</div>
                <p className="text-xs text-muted-foreground">
                  out of {achievements.length} total
                </p>
              </CardContent>
            </Card>

            <Card className="animate-fade-in" style={{ animationDelay: '100ms', animationFillMode: 'backwards' }}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Active Goals</CardTitle>
                <Target className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{myGoals.length}</div>
                <p className="text-xs text-muted-foreground">
                  personal & team goals
                </p>
              </CardContent>
            </Card>

            <Card className="animate-fade-in" style={{ animationDelay: '200ms', animationFillMode: 'backwards' }}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Team Achievements</CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{teamAchievements.length}</div>
                <p className="text-xs text-muted-foreground">
                  across all teams
                </p>
              </CardContent>
            </Card>

            <Card className="animate-fade-in" style={{ animationDelay: '300ms', animationFillMode: 'backwards' }}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Completion Rate</CardTitle>
                <Award className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {achievements.length > 0 ? Math.round((myAchievements.length / achievements.length) * 100) : 0}%
                </div>
                <p className="text-xs text-muted-foreground">
                  achievement progress
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Recent Achievements */}
          <Card className="animate-fade-in" style={{ animationDelay: '400ms', animationFillMode: 'backwards' }}>
            <CardHeader>
              <CardTitle>Recent Achievements</CardTitle>
              <CardDescription>Latest badges earned by you and your teams</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {[...myAchievements].slice(0, 3).map((userAchievement, index) => (
                  <AchievementCard 
                    key={userAchievement.id} 
                    achievement={userAchievement.achievement!}
                    earned={true}
                    earnedAt={userAchievement.earned_at}
                    index={index}
                  />
                ))}
                {myAchievements.length === 0 && (
                  <p className="text-gray-500 col-span-full text-center py-4">
                    No achievements earned yet. Start inviting people to earn your first badge!
                  </p>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="achievements" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {achievements.map((achievement, index) => {
              const userEarned = myAchievements.find(ua => ua.achievement_id === achievement.id);
              return (
                <AchievementCard 
                  key={achievement.id} 
                  achievement={achievement}
                  earned={!!userEarned}
                  earnedAt={userEarned?.earned_at}
                  index={index}
                />
              );
            })}
          </div>
        </TabsContent>

        <TabsContent value="leaderboard" className="space-y-6">
          <LeaderboardCard />
        </TabsContent>

        <TabsContent value="goals" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {myGoals.map((goal, index) => (
              <GoalCard key={goal.id} goal={goal} index={index} />
            ))}
            {myGoals.length === 0 && (
              <Card className="col-span-full animate-fade-in">
                <CardContent className="text-center py-8">
                  <Target className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No goals set</h3>
                  <p className="text-gray-600 mb-4">Create your first goal to start tracking progress</p>
                  <Button onClick={() => setShowCreateGoalDialog(true)}>
                    <Plus className="mr-2 h-4 w-4" />
                    Create Goal
                  </Button>
                </CardContent>
              </Card>
            )}
          </div>
        </TabsContent>
      </Tabs>

      <CreateGoalDialog 
        open={showCreateGoalDialog} 
        onOpenChange={setShowCreateGoalDialog} 
      />
    </div>
  );
};
