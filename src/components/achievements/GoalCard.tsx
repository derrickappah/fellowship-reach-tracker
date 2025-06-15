
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Goal } from '@/types/achievements';
import { Target, Calendar, Trash2 } from 'lucide-react';
import { format } from 'date-fns';
import { Button } from '@/components/ui/button';
import { useGoals } from '@/hooks/useGoals';

interface GoalCardProps {
  goal: Goal;
  index?: number;
}

export const GoalCard: React.FC<GoalCardProps> = ({ goal, index = 0 }) => {
  const { deleteGoal } = useGoals();
  const progress = Math.min((goal.current_value / goal.target_value) * 100, 100);
  const isCompleted = goal.current_value >= goal.target_value;

  const handleDelete = () => {
    if (window.confirm('Are you sure you want to delete this goal?')) {
      deleteGoal(goal.id);
    }
  };

  return (
    <Card 
      className={`transition-all duration-300 hover:shadow-lg animate-fade-in ${
        isCompleted ? 'border-green-200 bg-green-50/30' : ''
      }`}
      style={{ animationDelay: `${index * 100}ms`, animationFillMode: 'backwards' }}
    >
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-2">
            <Target className="h-5 w-5 text-blue-600" />
            <CardTitle className="text-lg">{goal.title}</CardTitle>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant={goal.goal_type === 'team' ? 'default' : 'secondary'}>
              {goal.goal_type}
            </Badge>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleDelete}
              className="text-red-600 hover:text-red-700"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        </div>
        {goal.description && (
          <p className="text-sm text-gray-600">{goal.description}</p>
        )}
      </CardHeader>
      
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span>Progress</span>
            <span className="font-medium">
              {goal.current_value} / {goal.target_value}
            </span>
          </div>
          <Progress value={progress} className="h-2" />
          <p className="text-xs text-gray-500 text-right">
            {progress.toFixed(1)}% complete
          </p>
        </div>

        {goal.deadline && (
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <Calendar className="h-4 w-4" />
            <span>Due: {format(new Date(goal.deadline), 'MMM d, yyyy')}</span>
          </div>
        )}

        {isCompleted && (
          <Badge variant="default" className="w-full justify-center bg-green-600">
            🎉 Goal Completed!
          </Badge>
        )}
      </CardContent>
    </Card>
  );
};
