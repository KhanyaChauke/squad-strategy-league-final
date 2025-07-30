import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Zap, Users, Globe, Building } from 'lucide-react';
import { useTeamChemistry, PlayerForChemistry } from '@/hooks/useTeamChemistry';

interface TeamChemistryProps {
  squad: PlayerForChemistry[];
  className?: string;
}

export const TeamChemistry: React.FC<TeamChemistryProps> = ({ squad, className = "" }) => {
  const chemistry = useTeamChemistry(squad);
  
  // Calculate additional stats for display
  const clubConnections = React.useMemo(() => {
    const clubs = squad.reduce((acc, player) => {
      acc[player.club] = (acc[player.club] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    
    return Object.entries(clubs)
      .filter(([_, count]) => count > 1)
      .map(([club, count]) => ({ club, count }))
      .sort((a, b) => b.count - a.count);
  }, [squad]);
  
  const nationalityConnections = React.useMemo(() => {
    const nationalities = squad.reduce((acc, player) => {
      acc[player.nationality] = (acc[player.nationality] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    
    return Object.entries(nationalities)
      .filter(([_, count]) => count > 1)
      .map(([nationality, count]) => ({ nationality, count }))
      .sort((a, b) => b.count - a.count);
  }, [squad]);

  return (
    <Card className={`${className} relative overflow-hidden`}>
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center space-x-2">
          <Zap className="h-5 w-5 text-yellow-500" />
          <span>Team Chemistry</span>
        </CardTitle>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* Main Chemistry Display */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <div className="flex items-center space-x-2">
                <span className="text-2xl font-bold" style={{ color: chemistry.chemistryColor }}>
                  {chemistry.chemistryPercentage}%
                </span>
                <Badge 
                  variant="secondary" 
                  className="text-xs"
                  style={{ 
                    backgroundColor: `${chemistry.chemistryColor}20`,
                    color: chemistry.chemistryColor,
                    borderColor: chemistry.chemistryColor
                  }}
                >
                  {chemistry.chemistryGrade}
                </Badge>
              </div>
              <p className="text-xs text-muted-foreground">
                {chemistry.totalChemistry} / {chemistry.maxPossibleChemistry} points
              </p>
            </div>
          </div>
          
          {/* Progress Bar */}
          <div className="space-y-2">
            <Progress 
              value={chemistry.chemistryPercentage} 
              className="h-3 bg-muted animate-fade-in"
            />
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>0%</span>
              <span>50%</span>
              <span>100%</span>
            </div>
          </div>
        </div>
        
        {/* Chemistry Breakdown */}
        {squad.length >= 2 && (
          <div className="grid grid-cols-1 gap-3 pt-2 border-t">
            {/* Club Connections */}
            {clubConnections.length > 0 && (
              <div className="space-y-2">
                <div className="flex items-center space-x-2">
                  <Building className="h-4 w-4 text-blue-500" />
                  <span className="text-sm font-medium">Club Links</span>
                </div>
                <div className="flex flex-wrap gap-1">
                  {clubConnections.map(({ club, count }) => (
                    <Badge key={club} variant="outline" className="text-xs">
                      {club} ({count})
                    </Badge>
                  ))}
                </div>
              </div>
            )}
            
            {/* Nationality Connections */}
            {nationalityConnections.length > 0 && (
              <div className="space-y-2">
                <div className="flex items-center space-x-2">
                  <Globe className="h-4 w-4 text-green-500" />
                  <span className="text-sm font-medium">Nation Links</span>
                </div>
                <div className="flex flex-wrap gap-1">
                  {nationalityConnections.map(({ nationality, count }) => (
                    <Badge key={nationality} variant="outline" className="text-xs">
                      {nationality} ({count})
                    </Badge>
                  ))}
                </div>
              </div>
            )}
            
            {/* Squad Size Info */}
            <div className="flex items-center justify-between text-xs text-muted-foreground pt-1">
              <div className="flex items-center space-x-1">
                <Users className="h-3 w-3" />
                <span>{squad.length} players</span>
              </div>
              <span>{((squad.length * (squad.length - 1)) / 2)} connections</span>
            </div>
          </div>
        )}
        
        {/* Empty State */}
        {squad.length < 2 && (
          <div className="text-center py-4 text-muted-foreground">
            <Users className="h-8 w-8 mx-auto mb-2 opacity-50" />
            <p className="text-sm">Add more players to calculate chemistry</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};