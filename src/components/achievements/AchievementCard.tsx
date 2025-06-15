
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Achievement } from '@/types/achievements';
import { Trophy, Star, Award, Users, UserCheck, Heart, Target, UserCog } from 'lucide-react';
import { format } from 'date-fns';

interface AchievementCardProps {
  achievement: Achievement;
  earned: boolean;
  earnedAt?: string;
  index?: number;
}

export const AchievementCard: React.FC<AchievementCardProps> = ({ 
  achievement, 
  earned, 
  earnedAt,
  index = 0 
}) => {
  const getIconComponent = (iconName?: string) => {
    switch (iconName) {
      case 'Trophy':
        return Trophy;
      case 'Star':
        return Star;
      case 'Award':
        return Award;
      case 'Users':
        return Users;
      case 'UserCheck':
        return UserCheck;
      case 'Heart':
        return Heart;
      case 'Target':
        return Target;
      case 'UserCog':
        return UserCog;
      default:
        return Trophy;
    }
  };

  const IconComponent = getIconComponent(achievement.icon);

  const getColorScheme = (color?: string) => {
    switch (color) {
      case 'gold':
        return {
          card: 'bg-yellow-50/60 border-yellow-200 dark:bg-yellow-900/20 dark:border-yellow-800/50 hover:border-yellow-300 dark:hover:border-yellow-700',
          iconWrapper: 'bg-yellow-100 text-yellow-600 dark:bg-yellow-500/10 dark:text-yellow-400',
          title: 'text-yellow-900 dark:text-yellow-300',
          badge: 'bg-yellow-100 text-yellow-800 border-yellow-200 dark:bg-yellow-900/70 dark:text-yellow-200 dark:border-yellow-700'
        };
      case 'purple':
        return {
          card: 'bg-purple-50/60 border-purple-200 dark:bg-purple-900/20 dark:border-purple-800/50 hover:border-purple-300 dark:hover:border-purple-700',
          iconWrapper: 'bg-purple-100 text-purple-600 dark:bg-purple-500/10 dark:text-purple-400',
          title: 'text-purple-900 dark:text-purple-300',
          badge: 'bg-purple-100 text-purple-800 border-purple-200 dark:bg-purple-900/70 dark:text-purple-200 dark:border-purple-700'
        };
      case 'green':
        return {
          card: 'bg-green-50/60 border-green-200 dark:bg-green-900/20 dark:border-green-800/50 hover:border-green-300 dark:hover:border-green-700',
          iconWrapper: 'bg-green-100 text-green-600 dark:bg-green-500/10 dark:text-green-400',
          title: 'text-green-900 dark:text-green-300',
          badge: 'bg-green-100 text-green-800 border-green-200 dark:bg-green-900/70 dark:text-green-200 dark:border-green-700'
        };
      case 'blue':
      default:
        return {
          card: 'bg-blue-50/60 border-blue-200 dark:bg-blue-900/20 dark:border-blue-800/50 hover:border-blue-300 dark:hover:border-blue-700',
          iconWrapper: 'bg-blue-100 text-blue-600 dark:bg-blue-500/10 dark:text-blue-400',
          title: 'text-blue-900 dark:text-blue-300',
          badge: 'bg-blue-100 text-blue-800 border-blue-200 dark:bg-blue-900/70 dark:text-blue-200 dark:border-blue-700'
        };
    }
  };

  const colorScheme = getColorScheme(achievement.badge_color);

  return (
    <Card 
      className={`transition-all duration-300 hover:shadow-lg animate-fade-in ${
        earned ? colorScheme.card : 'opacity-70 bg-gray-50 dark:bg-gray-800/50'
      }`}
      style={{ animationDelay: `${index * 100}ms`, animationFillMode: 'backwards' }}
    >
      <CardHeader className="text-center pb-2">
        <div className="mx-auto mb-2">
          <div className={`w-16 h-16 rounded-full flex items-center justify-center transition-colors duration-300 ${
            earned ? colorScheme.iconWrapper : 'bg-gray-200 dark:bg-gray-700'
          }`}>
            <IconComponent className={`h-8 w-8 transition-colors duration-300 ${
              earned ? 'text-current' : 'text-gray-400 dark:text-gray-500'
            }`} />
          </div>
        </div>
        <CardTitle className={`text-lg transition-colors duration-300 ${earned ? colorScheme.title : 'text-gray-800 dark:text-gray-200'}`}>
          {achievement.name}
        </CardTitle>
      </CardHeader>
      <CardContent className="text-center space-y-2">
        <p className="text-sm text-gray-600 dark:text-gray-400">{achievement.description}</p>
        
        <div className="flex flex-col items-center gap-2">
          <Badge 
            className={`text-xs ${
              earned ? colorScheme.badge : 'bg-gray-100 text-gray-700 border-transparent dark:bg-gray-700 dark:text-gray-300'
            }`}
          >
            {achievement.threshold} {achievement.type.replace(/_/g, ' ')}
          </Badge>
          
          {earned && earnedAt && (
            <p className="text-xs text-green-600 font-medium dark:text-green-400">
              Earned {format(new Date(earnedAt), 'MMM d, yyyy')}
            </p>
          )}
          
          {!earned && (
            <p className="text-xs text-gray-500 dark:text-gray-400">
              Not earned yet
            </p>
          )}
        </div>
      </CardContent>
    </Card>
  );
};
