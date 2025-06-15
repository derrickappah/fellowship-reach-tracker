
import React from 'react';
import { Card, CardTitle } from '@/components/ui/card';
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
          card: 'bg-yellow-100 border-yellow-300 dark:bg-yellow-500/20 dark:border-yellow-500/30 hover:border-yellow-400 dark:hover:border-yellow-500/50',
          iconWrapper: 'bg-yellow-200 text-yellow-700 dark:bg-yellow-500/30 dark:text-yellow-300',
          title: 'text-yellow-900 dark:text-yellow-200',
          badge: 'bg-yellow-200 text-yellow-800 border-transparent dark:bg-yellow-800/50 dark:text-yellow-100'
        };
      case 'purple':
        return {
          card: 'bg-purple-100 border-purple-300 dark:bg-purple-500/20 dark:border-purple-500/30 hover:border-purple-400 dark:hover:border-purple-500/50',
          iconWrapper: 'bg-purple-200 text-purple-700 dark:bg-purple-500/30 dark:text-purple-300',
          title: 'text-purple-900 dark:text-purple-200',
          badge: 'bg-purple-200 text-purple-800 border-transparent dark:bg-purple-800/50 dark:text-purple-100'
        };
      case 'green':
        return {
          card: 'bg-green-100 border-green-300 dark:bg-green-500/20 dark:border-green-500/30 hover:border-green-400 dark:hover:border-green-500/50',
          iconWrapper: 'bg-green-200 text-green-700 dark:bg-green-500/30 dark:text-green-300',
          title: 'text-green-900 dark:text-green-200',
          badge: 'bg-green-200 text-green-800 border-transparent dark:bg-green-800/50 dark:text-green-100'
        };
      case 'blue':
      default:
        return {
          card: 'bg-blue-100 border-blue-300 dark:bg-blue-500/20 dark:border-blue-500/30 hover:border-blue-400 dark:hover:border-blue-500/50',
          iconWrapper: 'bg-blue-200 text-blue-700 dark:bg-blue-500/30 dark:text-blue-300',
          title: 'text-blue-900 dark:text-blue-200',
          badge: 'bg-blue-200 text-blue-800 border-transparent dark:bg-blue-800/50 dark:text-blue-100'
        };
    }
  };

  const colorScheme = getColorScheme(achievement.badge_color);

  return (
    <Card 
      className={`transition-all duration-300 hover:shadow-lg animate-fade-in ${
        earned ? colorScheme.card : 'bg-gray-100 dark:bg-gray-800 border-gray-200 dark:border-gray-700 opacity-60'
      }`}
      style={{ animationDelay: `${index * 100}ms`, animationFillMode: 'backwards' }}
    >
      <div className="flex items-start p-3 sm:p-4 space-x-3 sm:space-x-4">
        <div className={`flex-shrink-0 w-10 h-10 sm:w-12 sm:h-12 rounded-full flex items-center justify-center transition-colors duration-300 ${
          earned ? colorScheme.iconWrapper : 'bg-gray-200 dark:bg-gray-700'
        }`}>
          <IconComponent className={`h-5 w-5 sm:h-6 sm:h-6 transition-colors duration-300 ${
            earned ? 'text-current' : 'text-gray-400 dark:text-gray-500'
          }`} />
        </div>
        <div className="flex-grow space-y-0.5">
          <CardTitle className={`text-sm sm:text-base font-semibold leading-tight transition-colors duration-300 ${earned ? colorScheme.title : 'text-gray-800 dark:text-gray-200'}`}>
            {achievement.name}
          </CardTitle>
          <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">{achievement.description}</p>
          
          <div className="flex flex-wrap items-center gap-x-2 gap-y-1 pt-1">
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
        </div>
      </div>
    </Card>
  );
};
