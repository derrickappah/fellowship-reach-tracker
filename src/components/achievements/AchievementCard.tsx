
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Achievement } from '@/types/achievements';
import { Trophy, Star, Award } from 'lucide-react';
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
      default:
        return Trophy;
    }
  };

  const IconComponent = getIconComponent(achievement.icon);

  const getBadgeColor = (color?: string) => {
    switch (color) {
      case 'gold':
        return 'bg-yellow-100 text-yellow-800 border-yellow-300';
      case 'purple':
        return 'bg-purple-100 text-purple-800 border-purple-300';
      case 'green':
        return 'bg-green-100 text-green-800 border-green-300';
      case 'blue':
      default:
        return 'bg-blue-100 text-blue-800 border-blue-300';
    }
  };

  return (
    <Card 
      className={`transition-all duration-300 hover:shadow-lg animate-fade-in ${
        earned ? 'border-green-200 bg-green-50/30' : 'opacity-70'
      }`}
      style={{ animationDelay: `${index * 100}ms`, animationFillMode: 'backwards' }}
    >
      <CardHeader className="text-center pb-2">
        <div className="mx-auto mb-2">
          <div className={`w-16 h-16 rounded-full flex items-center justify-center ${
            earned ? getBadgeColor(achievement.badge_color) : 'bg-gray-100'
          }`}>
            <IconComponent className={`h-8 w-8 ${
              earned ? 'text-current' : 'text-gray-400'
            }`} />
          </div>
        </div>
        <CardTitle className="text-lg">{achievement.name}</CardTitle>
      </CardHeader>
      <CardContent className="text-center space-y-2">
        <p className="text-sm text-gray-600">{achievement.description}</p>
        
        <div className="flex flex-col items-center gap-2">
          <Badge variant={earned ? 'default' : 'secondary'} className="text-xs">
            {achievement.threshold} {achievement.type.replace('_', ' ')}
          </Badge>
          
          {earned && earnedAt && (
            <p className="text-xs text-green-600 font-medium">
              Earned {format(new Date(earnedAt), 'MMM d, yyyy')}
            </p>
          )}
          
          {!earned && (
            <p className="text-xs text-gray-500">
              Not earned yet
            </p>
          )}
        </div>
      </CardContent>
    </Card>
  );
};
