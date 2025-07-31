import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/contexts/AuthContext';
import { Trash2, Users, TrendingUp, Target, Star } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { TeamChemistry } from '@/components/TeamChemistry';

export const SquadView = () => {
  const { user, removePlayerFromSquad } = useAuth();
  const { toast } = useToast();

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-ZA', {
      style: 'currency',
      currency: 'ZAR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const handleRemovePlayer = (player: any) => {
    removePlayerFromSquad(player.id);
    toast({
      title: "Player Removed",
      description: `${player.name} has been removed from your squad.`
    });
  };

  const getPositionColor = (position: string) => {
    switch (position) {
      case 'GK': return 'bg-yellow-100 text-yellow-800';
      case 'DEF': return 'bg-blue-100 text-blue-800';
      case 'MID': return 'bg-green-100 text-green-800';
      case 'ATT': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getJerseyColor = (position: string) => {
    switch (position) {
      case 'GK': return '#fbbf24'; // Yellow
      case 'DEF': return '#3b82f6'; // Blue
      case 'MID': return '#22c55e'; // Green
      case 'ATT': return '#ef4444'; // Red
      default: return '#6b7280'; // Gray
    }
  };

  const getRatingColor = (rating: number) => {
    if (rating >= 85) return 'text-green-600';
    if (rating >= 80) return 'text-blue-600';
    if (rating >= 75) return 'text-orange-600';
    return 'text-gray-600';
  };

  const getPlayersByPosition = (position: string) => {
    return user?.squad.filter(player => player.position === position) || [];
  };

  const squadValue = user?.squad.reduce((total, player) => total + player.cost, 0) || 0;
  const averageRating = user?.squad.length ? 
    Math.round(user.squad.reduce((sum, player) => sum + player.rating, 0) / user.squad.length) : 0;

  const positionCounts = {
    GK: getPlayersByPosition('GK').length,
    DEF: getPlayersByPosition('DEF').length,
    MID: getPlayersByPosition('MID').length,
    ATT: getPlayersByPosition('ATT').length,
  };

  const JerseyIcon = ({ player, isEmpty = false }: { player?: any, isEmpty?: boolean }) => {
    if (isEmpty) {
      return (
        <div className="flex flex-col items-center space-y-1">
          <div className="w-16 h-20 border-2 border-dashed border-white/50 rounded-lg flex items-center justify-center">
            <span className="text-white/50 text-xs font-bold">EMPTY</span>
          </div>
        </div>
      );
    }

    if (!player) return null;

    return (
      <div className="flex flex-col items-center space-y-1">
        <div 
          className="w-16 h-20 rounded-lg flex flex-col items-center justify-center text-white font-bold shadow-lg border-2 relative"
          style={{ 
            backgroundColor: getJerseyColor(player.position),
            borderColor: 'rgba(255,255,255,0.3)'
          }}
        >
          {/* Jersey number */}
          <div className="text-lg font-black mb-1">
            {user?.squad.findIndex(p => p.id === player.id) + 1}
          </div>
          {/* Player initials */}
          <div className="text-xs leading-tight text-center">
            {player.name.split(' ').map(n => n[0]).join('')}
          </div>
        </div>
        <div className="text-xs text-white font-medium text-center max-w-20 truncate">
          {player.name.split(' ')[0]}
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between space-y-4 md:space-y-0">
        <div>
          <h2 className="text-3xl font-bold text-gray-900">My Squad</h2>
          <p className="text-gray-600">Manage your fantasy team</p>
        </div>
        
        <div className="bg-white rounded-lg p-4 shadow-sm border">
          <div className="flex items-center space-x-4 text-sm">
            <div className="flex items-center space-x-2">
              <span className="text-gray-600">Players:</span>
              <span className="font-bold">
                {user?.squad.length || 0}/11
              </span>
            </div>
            <div className="flex items-center space-x-2">
              <span className="text-gray-600">Budget Left:</span>
              <span className="font-bold text-green-600">
                {formatCurrency(user?.budget || 0)}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Squad Overview */}
      <div className="grid md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Squad Value</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {formatCurrency(squadValue)}
            </div>
            <p className="text-xs text-muted-foreground">
              Total investment
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Average Rating</CardTitle>
            <Star className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${getRatingColor(averageRating)}`}>
              {averageRating}
            </div>
            <p className="text-xs text-muted-foreground">
              Squad quality
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Formation</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {positionCounts.GK}-{positionCounts.DEF}-{positionCounts.MID}-{positionCounts.ATT}
            </div>
            <p className="text-xs text-muted-foreground">
              Current setup
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Team Chemistry */}
      <TeamChemistry 
        squad={user?.squad.map(player => ({
          id: player.id,
          name: player.name,
          club: player.club,
          nationality: player.nationality,
          position: player.position
        })) || []} 
      />

      {/* Formation Visualization */}
      <Card>
        <CardHeader>
          <CardTitle>Squad Formation</CardTitle>
          <CardDescription>Visual representation of your team setup with jerseys</CardDescription>
        </CardHeader>
        <CardContent>
          <div 
            className="rounded-lg p-8 min-h-[700px] relative overflow-hidden"
            style={{
              background: 'linear-gradient(180deg, #16a34a 0%, #22c55e 50%, #16a34a 100%)',
              backgroundImage: `
                repeating-linear-gradient(0deg, rgba(255,255,255,0.1) 0px, rgba(255,255,255,0.1) 1px, transparent 1px, transparent 40px),
                repeating-linear-gradient(90deg, rgba(255,255,255,0.1) 0px, rgba(255,255,255,0.1) 1px, transparent 1px, transparent 60px)
              `
            }}
          >
            {/* Field lines */}
            <div className="absolute inset-0 opacity-30">
              <div className="absolute top-1/2 left-0 right-0 h-0.5 bg-white"></div>
              <div className="absolute top-1/2 left-1/2 w-0.5 h-full bg-white transform -translate-x-1/2"></div>
              <div className="absolute top-1/2 left-1/2 w-24 h-24 border border-white rounded-full transform -translate-x-1/2 -translate-y-1/2"></div>
              {/* Goal areas */}
              <div className="absolute bottom-0 left-1/2 w-32 h-16 border-t border-l border-r border-white transform -translate-x-1/2"></div>
              <div className="absolute top-0 left-1/2 w-32 h-16 border-b border-l border-r border-white transform -translate-x-1/2"></div>
            </div>
            
            {/* Players positioned on field */}
            <div className="relative h-full flex flex-col justify-between py-8">
              {/* Attackers (Top) */}
              <div className="flex justify-center space-x-12">
                {getPlayersByPosition('ATT').slice(0, 2).map((player, index) => (
                  <JerseyIcon key={player.id} player={player} />
                ))}
                {Array(Math.max(0, 2 - positionCounts.ATT)).fill(0).map((_, index) => (
                  <JerseyIcon key={`empty-att-${index}`} isEmpty />
                ))}
              </div>
              
              {/* Midfielders */}
              <div className="flex justify-center space-x-8">
                {getPlayersByPosition('MID').slice(0, 4).map((player, index) => (
                  <JerseyIcon key={player.id} player={player} />
                ))}
                {Array(Math.max(0, 4 - positionCounts.MID)).fill(0).map((_, index) => (
                  <JerseyIcon key={`empty-mid-${index}`} isEmpty />
                ))}
              </div>
              
              {/* Defenders */}
              <div className="flex justify-center space-x-6">
                {getPlayersByPosition('DEF').slice(0, 4).map((player, index) => (
                  <JerseyIcon key={player.id} player={player} />
                ))}
                {Array(Math.max(0, 4 - positionCounts.DEF)).fill(0).map((_, index) => (
                  <JerseyIcon key={`empty-def-${index}`} isEmpty />
                ))}
              </div>
              
              {/* Goalkeepers (Bottom) */}
              <div className="flex justify-center">
                {getPlayersByPosition('GK').slice(0, 1).map((player, index) => (
                  <JerseyIcon key={player.id} player={player} />
                ))}
                {Array(Math.max(0, 1 - positionCounts.GK)).fill(0).map((_, index) => (
                  <JerseyIcon key={`empty-gk-${index}`} isEmpty />
                ))}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Player List */}
      {user?.squad && user.squad.length > 0 ? (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {user.squad.map((player) => (
            <Card key={player.id} className="card-hover">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="text-lg">{player.name}</CardTitle>
                    <CardDescription className="flex items-center space-x-2">
                      <span>{player.club}</span>
                      <Badge className={getPositionColor(player.position)} variant="secondary">
                        {player.position}
                      </Badge>
                    </CardDescription>
                  </div>
                  <div className="text-right">
                    <div className={`text-2xl font-bold ${getRatingColor(player.rating)}`}>
                      {player.rating}
                    </div>
                    <div className="flex items-center text-yellow-500">
                      <Star className="h-3 w-3 fill-current" />
                    </div>
                  </div>
                </div>
              </CardHeader>
              
              <CardContent className="space-y-4">
                {/* Player Stats */}
                <div className="grid grid-cols-3 gap-2 text-xs">
                  <div className="text-center">
                    <div className="text-lg font-semibold">{player.pace}</div>
                    <div className="text-gray-500">PAC</div>
                  </div>
                  <div className="text-center">
                    <div className="text-lg font-semibold">{player.shooting}</div>
                    <div className="text-gray-500">SHO</div>
                  </div>
                  <div className="text-center">
                    <div className="text-lg font-semibold">{player.passing}</div>
                    <div className="text-gray-500">PAS</div>
                  </div>
                  <div className="text-center">
                    <div className="text-lg font-semibold">{player.defending}</div>
                    <div className="text-gray-500">DEF</div>
                  </div>
                  <div className="text-center">
                    <div className="text-lg font-semibold">{player.dribbling}</div>
                    <div className="text-gray-500">DRI</div>
                  </div>
                  <div className="text-center">
                    <div className="text-lg font-semibold">{player.physical}</div>
                    <div className="text-gray-500">PHY</div>
                  </div>
                </div>
                
                {/* Cost and Remove Button */}
                <div className="flex items-center justify-between pt-2 border-t">
                  <div>
                    <div className="text-sm text-gray-500">Cost</div>
                    <div className="font-bold text-green-600">
                      {formatCurrency(player.cost)}
                    </div>
                  </div>
                  
                  <Button
                    onClick={() => handleRemovePlayer(player)}
                    variant="destructive"
                    size="sm"
                  >
                    <Trash2 className="h-4 w-4 mr-1" />
                    Remove
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <Card>
          <CardContent className="text-center py-12">
            <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500 mb-2">Your squad is empty</p>
            <p className="text-gray-400 text-sm">Start building your dream team by browsing players!</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};
