import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { useAuth } from '@/contexts/AuthContext';
import { Trash2, Users, TrendingUp, Target, Star, Settings, Plus, X, Save } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { FormationSelector, formations, Formation } from '@/components/FormationSelector';
import { playersDatabase, Player } from '@/data/playersData';
import { FifaCard } from '@/components/FifaCard';
import { usePlayers } from '@/hooks/usePlayers';

// ... (existing imports for jerseys)
import sundownsJersey from '@/assets/jerseys/sundowns-jersey.png';
import piratesJersey from '@/assets/jerseys/pirates-jersey.png';
import chiefsJersey from '@/assets/jerseys/chiefs-jersey.png';
import capeTownCityJersey from '@/assets/jerseys/cape-town-city-jersey.png';
import supersportJersey from '@/assets/jerseys/supersport-jersey.png';
import defaultJersey from '@/assets/jerseys/default-jersey.png';

export const SquadView = () => {
  const { user, removePlayerFromSquad, removePlayerFromBench, substitutePlayer, setFormation, addPlayerToSquad, addPlayerToBench, saveSquad } = useAuth();
  const { toast } = useToast();
  const { players: availablePlayers, loading } = usePlayers(); // Use hook
  const [showFormationSelector, setShowFormationSelector] = useState(!user?.selectedFormation);
  const [isSaveDialogOpen, setIsSaveDialogOpen] = useState(false);
  const [playerSelectionDialog, setPlayerSelectionDialog] = useState<{
    isOpen: boolean;
    position: 'GK' | 'DEF' | 'MID' | 'ATT' | null;
  }>({ isOpen: false, position: null });

  const latestResult = user?.history && user.history.length > 0
    ? user.history[user.history.length - 1]
    : null;

  const getPlayerPoints = (playerId: string) => {
    return latestResult?.playerStats?.[playerId]?.points;
  };

  // ... (existing handlers: handleFormationSelect, formatCurrency)

  const handleManualSave = async () => {
    setIsSaveDialogOpen(false);

    const success = await saveSquad();

    if (success) {
      toast({
        title: "Squad Saved Successfully",
        description: "Your team setup has been securely saved to the database.",
        className: "bg-green-50 border-green-200"
      });
    } else {
      toast({
        title: "Save Failed",
        description: "There was an error saving your squad. Please check your connection and try again.",
        variant: "destructive"
      });
    }
  };

  // ... (existing handlers)

  // ... (render logic)

  // Inside return statement, add the button and dialog
  // I will target the header section where "Change Formation" is.

  const [sortConfig, setSortConfig] = useState<{ key: keyof Player, direction: 'asc' | 'desc' } | null>({ key: 'rating', direction: 'desc' });

  // ... (sort handlers)

  // ... (getDialogPlayers)

  if (showFormationSelector) {
    // ...
  }



  const handleFormationSelect = (formation: Formation) => {
    setFormation(formation);
    setShowFormationSelector(false);
    toast({
      title: "Formation Selected",
      description: `You've selected the ${formation.name} formation. Now build your squad accordingly.`
    });
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-ZA', {
      style: 'currency',
      currency: 'ZAR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const handleRemovePlayer = async (player: any) => {
    await removePlayerFromSquad(player.id);
    toast({
      title: "Player Removed",
      description: `${player.name} has been removed from your squad.`
    });
  };

  const handleRemoveBenchPlayer = async (player: any) => {
    await removePlayerFromBench(player.id);
    toast({
      title: "Player Removed",
      description: `${player.name} has been removed from your bench.`
    });
  };

  const handleSubstitution = async (squadPlayer: any, benchPlayer: any) => {
    const success = await substitutePlayer(squadPlayer.id, benchPlayer.id);
    if (success) {
      toast({
        title: "Substitution Made",
        description: `${benchPlayer.name} has replaced ${squadPlayer.name} on the field.`
      });
    } else {
      toast({
        title: "Substitution Failed",
        description: "Players must be in the same position to be substituted.",
        variant: "destructive"
      });
    }
  };

  const [selectedSlotType, setSelectedSlotType] = useState<'squad' | 'bench'>('squad');

  const handleEmptySlotClick = (position: 'GK' | 'DEF' | 'MID' | 'ATT') => {
    setSelectedSlotType('squad');
    setPlayerSelectionDialog({ isOpen: true, position });
  };

  const handleEmptyBenchSlotClick = () => {
    setSelectedSlotType('bench');
    setPlayerSelectionDialog({ isOpen: true, position: 'MID' }); // Default start, visually imperfect but functional
  };

  const handlePlayerSelect = async (player: Player) => {
    if (!player) return;

    let success = false;
    if (selectedSlotType === 'bench') {
      success = await addPlayerToBench(player);
    } else {
      success = await addPlayerToSquad(player);
    }

    if (success) {
      toast({
        title: "Player Added",
        description: `${player.name} has been added to your ${selectedSlotType}.`
      });
      setPlayerSelectionDialog({ isOpen: false, position: null });
    } else {
      toast({
        title: "Cannot Add Player",
        description: `${selectedSlotType === 'bench' ? 'Bench full (max 4)' : 'Check squad limits'} or budget insufficient.`,
        variant: "destructive"
      });
    }
  };

  const getAvailablePlayersForPosition = (position: 'GK' | 'DEF' | 'MID' | 'ATT') => {
    return availablePlayers
      .filter(player =>
        player.position === position &&
        !user?.squad?.some(squadPlayer => squadPlayer.id === player.id) &&
        !user?.bench?.some(benchPlayer => benchPlayer.id === player.id) &&
        player.price <= (user?.budget || 0)
      )
      .sort((a, b) => b.rating - a.rating);
  };

  const getDialogPlayers = () => {
    if (!playerSelectionDialog.position) return [];
    // Could add loading spinner here if loading is true
    const players = getAvailablePlayersForPosition(playerSelectionDialog.position);
    return players;
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

  const getJerseyImage = (clubName: string) => {
    const club = clubName.toLowerCase();
    if (club.includes('sundowns')) return sundownsJersey;
    if (club.includes('pirates')) return piratesJersey;
    if (club.includes('chiefs')) return chiefsJersey;
    if (club.includes('cape town city')) return capeTownCityJersey;
    if (club.includes('supersport')) return supersportJersey;
    return defaultJersey;
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

  const squadValue = (user?.squad.reduce((total, player) => total + player.price, 0) || 0) +
    (user?.bench.reduce((total, player) => total + player.price, 0) || 0);

  const totalPlayers = (user?.squad?.length || 0) + (user?.bench?.length || 0);
  const averageRating = totalPlayers ?
    Math.round(((user?.squad.reduce((sum, player) => sum + player.rating, 0) || 0) +
      (user?.bench.reduce((sum, player) => sum + player.rating, 0) || 0)) / totalPlayers) : 0;

  const positionCounts = {
    GK: getPlayersByPosition('GK').length,
    DEF: getPlayersByPosition('DEF').length,
    MID: getPlayersByPosition('MID').length,
    ATT: getPlayersByPosition('ATT').length,
  };


  // Show formation selector if no formation is selected
  if (showFormationSelector) {
    return (
      <div className="space-y-6">
        <FormationSelector
          selectedFormation={user?.selectedFormation ? formations.find(f => f.id === user.selectedFormation?.id) || null : null}
          onFormationSelect={handleFormationSelect}
          currentSquad={user?.squad || []}
        />
      </div>
    );
  }

  const selectedFormation = user?.selectedFormation ? formations.find(f => f.id === user.selectedFormation.id) : null;

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between space-y-4 md:space-y-0">
        <div>
          <h2 className="text-3xl font-bold text-gray-900">My Squad</h2>
          <p className="text-gray-600">
            {selectedFormation ? `Formation: ${selectedFormation.name} (${selectedFormation.style})` : 'Manage your fantasy team'}
          </p>
        </div>

        <div className="bg-white rounded-lg p-4 shadow-sm border">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4 text-sm">
              <div className="flex items-center space-x-2">
                <span className="text-gray-600">Players:</span>
                <span className="font-bold">
                  {(user?.squad.length || 0) + (user?.bench.length || 0)}/15
                </span>
              </div>
              <div className="flex items-center space-x-2">
                <span className="text-gray-600">Budget Left:</span>
                <span className="font-bold text-green-600">
                  {formatCurrency(user?.budget || 0)}
                </span>
              </div>
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowFormationSelector(true)}
                className="flex items-center space-x-2"
              >
                <Settings className="h-4 w-4" />
                <span className="hidden sm:inline">Change Formation</span>
              </Button>

              <Button
                size="sm"
                onClick={() => setIsSaveDialogOpen(true)}
                className="flex items-center space-x-2 bg-green-600 hover:bg-green-700 text-white"
              >
                <Save className="h-4 w-4" />
                <span>Save Squad</span>
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Squad Overview & Chemistry */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-2 md:gap-4">
        <Card className="p-3 md:p-6">
          <CardHeader className="p-0 pb-2 space-y-0">
            <CardTitle className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Value</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <div className="text-lg md:text-2xl font-bold text-green-600 truncate">
              {formatCurrency(squadValue)}
            </div>
          </CardContent>
        </Card>

        <Card className="p-3 md:p-6">
          <CardHeader className="p-0 pb-2 space-y-0">
            <CardTitle className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Avg Rating</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <div className={`text-lg md:text-2xl font-bold ${getRatingColor(averageRating)}`}>
              {averageRating}
            </div>
          </CardContent>
        </Card>

        <Card className="p-3 md:p-6">
          <CardHeader className="p-0 pb-2 space-y-0">
            <CardTitle className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Formation</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <div className="text-lg md:text-2xl font-bold truncate">
              {selectedFormation?.name || `${positionCounts.GK}-${positionCounts.DEF}-${positionCounts.MID}-${positionCounts.ATT}`}
            </div>
            <p className="text-[10px] md:text-xs text-muted-foreground truncate">
              {selectedFormation?.style || 'Current setup'}
            </p>
          </CardContent>
        </Card>


      </div>

      {/* Formation Visualization */}
      <Card>
        <CardHeader>
          <CardTitle>Squad Formation</CardTitle>
          <CardDescription>Visual representation of your team setup on the pitch</CardDescription>
        </CardHeader>
        <CardContent className="p-4">
          <div
            className="relative w-full h-[700px] rounded-lg overflow-hidden border-2 border-white"
            style={{
              background: 'linear-gradient(180deg, #1e5128 0%, #2d7a2d 20%, #4ade80 40%, #22c55e 60%, #4ade80 80%, #2d7a2d 100%)',
              backgroundSize: '100% 100%'
            }}
          >
            {/* Soccer pitch markings */}
            <div className="absolute inset-0">
              {/* Outer boundary */}
              <div className="absolute inset-4 border-2 border-white/80 rounded-sm"></div>

              {/* Center line */}
              <div className="absolute top-1/2 left-4 right-4 h-0.5 bg-white/80 transform -translate-y-0.5"></div>

              {/* Center circle */}
              <div className="absolute top-1/2 left-1/2 w-32 h-32 border-2 border-white/80 rounded-full transform -translate-x-1/2 -translate-y-1/2"></div>
              <div className="absolute top-1/2 left-1/2 w-2 h-2 bg-white/80 rounded-full transform -translate-x-1/2 -translate-y-1/2"></div>

              {/* Goal area (bottom - our goal) */}
              <div className="absolute bottom-4 left-1/2 w-48 h-16 border-2 border-white/80 border-b-0 transform -translate-x-1/2"></div>

              {/* 6-yard box (bottom) */}
              <div className="absolute bottom-4 left-1/2 w-24 h-8 border-2 border-white/80 border-b-0 transform -translate-x-1/2"></div>

              {/* Penalty area (bottom) */}
              <div className="absolute bottom-4 left-1/2 w-56 h-20 border-2 border-white/80 border-b-0 transform -translate-x-1/2"></div>

              {/* Penalty spot (bottom) */}
              <div className="absolute bottom-16 left-1/2 w-2 h-2 bg-white/80 rounded-full transform -translate-x-1/2"></div>

              {/* Goal posts (bottom) */}
              <div className="absolute bottom-4 left-1/2 w-16 h-1 bg-white transform -translate-x-1/2"></div>

              {/* Goal area (top - opponent goal) */}
              <div className="absolute top-4 left-1/2 w-48 h-16 border-2 border-white/80 border-t-0 transform -translate-x-1/2"></div>

              {/* 6-yard box (top) */}
              <div className="absolute top-4 left-1/2 w-24 h-8 border-2 border-white/80 border-t-0 transform -translate-x-1/2"></div>

              {/* Penalty area (top) */}
              <div className="absolute top-4 left-1/2 w-56 h-20 border-2 border-white/80 border-t-0 transform -translate-x-1/2"></div>

              {/* Penalty spot (top) */}
              <div className="absolute top-16 left-1/2 w-2 h-2 bg-white/80 rounded-full transform -translate-x-1/2"></div>

              {/* Goal posts (top) */}
              <div className="absolute top-4 left-1/2 w-16 h-1 bg-white transform -translate-x-1/2"></div>

              {/* Corner arcs */}
              <div className="absolute top-4 left-4 w-8 h-8 border-2 border-white/80 border-r-0 border-b-0 rounded-tl-full"></div>
              <div className="absolute top-4 right-4 w-8 h-8 border-2 border-white/80 border-l-0 border-b-0 rounded-tr-full"></div>
              <div className="absolute bottom-4 left-4 w-8 h-8 border-2 border-white/80 border-r-0 border-t-0 rounded-bl-full"></div>
              <div className="absolute bottom-4 right-4 w-8 h-8 border-2 border-white/80 border-l-0 border-t-0 rounded-br-full"></div>
            </div>

            {/* Players positioned on field */}
            <div className="absolute inset-0 flex flex-col justify-between py-12 px-8">
              {/* Attackers (Forward line) */}
              <div className="flex justify-center items-center h-32">
                <div className="flex space-x-6">
                  {getPlayersByPosition('ATT').slice(0, selectedFormation?.positions.ATT || 3).map((player, index) => (
                    <FifaCard
                      key={player.id}
                      player={player}
                      size="small"
                      onPlayerClick={handleRemovePlayer}
                      showRemoveOverlay
                      points={getPlayerPoints(player.id)}
                    />
                  ))}
                  {Array(Math.max(0, (selectedFormation?.positions.ATT || 3) - positionCounts.ATT)).fill(0).map((_, index) => (
                    <FifaCard
                      key={`empty-att-${index}`}
                      isEmpty
                      size="small"
                      onEmptyClick={() => handleEmptySlotClick('ATT')}
                    />
                  ))}
                </div>
              </div>

              {/* Midfielders (Middle line) */}
              <div className="flex justify-center items-center h-32">
                <div className="flex space-x-4">
                  {getPlayersByPosition('MID').slice(0, selectedFormation?.positions.MID || 4).map((player, index) => (
                    <FifaCard
                      key={player.id}
                      player={player}
                      size="small"
                      onPlayerClick={handleRemovePlayer}
                      showRemoveOverlay
                      points={getPlayerPoints(player.id)}
                    />
                  ))}
                  {Array(Math.max(0, (selectedFormation?.positions.MID || 4) - positionCounts.MID)).fill(0).map((_, index) => (
                    <FifaCard
                      key={`empty-mid-${index}`}
                      isEmpty
                      size="small"
                      onEmptyClick={() => handleEmptySlotClick('MID')}
                    />
                  ))}
                </div>
              </div>

              {/* Defenders (Defense line) */}
              <div className="flex justify-center items-center h-32">
                <div className="flex space-x-3">
                  {getPlayersByPosition('DEF').slice(0, selectedFormation?.positions.DEF || 4).map((player, index) => (
                    <FifaCard
                      key={player.id}
                      player={player}
                      size="small"
                      onPlayerClick={handleRemovePlayer}
                      showRemoveOverlay
                      points={getPlayerPoints(player.id)}
                    />
                  ))}
                  {Array(Math.max(0, (selectedFormation?.positions.DEF || 4) - positionCounts.DEF)).fill(0).map((_, index) => (
                    <FifaCard
                      key={`empty-def-${index}`}
                      isEmpty
                      size="small"
                      onEmptyClick={() => handleEmptySlotClick('DEF')}
                    />
                  ))}
                </div>
              </div>

              {/* Goalkeeper (Goal line) */}
              <div className="flex justify-center items-end h-32 pb-4">
                {getPlayersByPosition('GK').slice(0, selectedFormation?.positions.GK || 1).map((player, index) => (
                  <FifaCard
                    key={player.id}
                    player={player}
                    size="small"
                    onPlayerClick={handleRemovePlayer}
                    showRemoveOverlay
                    points={getPlayerPoints(player.id)}
                  />
                ))}
                {Array(Math.max(0, (selectedFormation?.positions.GK || 1) - positionCounts.GK)).fill(0).map((_, index) => (
                  <FifaCard
                    key={`empty-gk-${index}`}
                    isEmpty
                    size="small"
                    onEmptyClick={() => handleEmptySlotClick('GK')}
                  />
                ))}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Bench Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Users className="h-5 w-5" />
            <span>Substitutes Bench</span>
          </CardTitle>
          <CardDescription>
            Your bench players (Max 4) - Click to substitute with field players of the same position
          </CardDescription>
        </CardHeader>
        <CardContent>
          {user?.bench && user.bench.length > 0 ? (
            <div className="flex flex-wrap justify-center gap-6">
              {user.bench.map((benchPlayer) => (
                <div key={benchPlayer.id} className="flex flex-col items-center space-y-3">
                  <FifaCard
                    player={benchPlayer}
                    size="small"
                    onPlayerClick={() => { }}
                    points={getPlayerPoints(benchPlayer.id)}
                  />

                  {/* Substitution Controls */}
                  <div className="w-28 space-y-1">
                    <div className="text-[10px] font-bold text-center border-b pb-1 text-gray-500 uppercase tracking-tighter">Sub for:</div>
                    <div className="flex flex-col gap-1 max-h-24 overflow-y-auto pr-1">
                      {getPlayersByPosition(benchPlayer.position).map((squadPlayer) => (
                        <Button
                          key={squadPlayer.id}
                          onClick={() => handleSubstitution(squadPlayer, benchPlayer)}
                          variant="secondary"
                          size="sm"
                          className="w-full text-[10px] h-7 px-1 bg-white border border-blue-100 hover:bg-blue-50 font-oswald uppercase"
                        >
                          {squadPlayer.name.split(' ').pop()}
                        </Button>
                      ))}
                      {getPlayersByPosition(benchPlayer.position).length === 0 && (
                        <p className="text-[10px] text-center text-gray-400 italic">No field {benchPlayer.position}s</p>
                      )}
                    </div>

                    <Button
                      onClick={() => handleRemoveBenchPlayer(benchPlayer)}
                      variant="ghost"
                      size="sm"
                      className="w-full h-6 text-red-500 hover:text-red-700 hover:bg-red-50 text-[10px] font-medium"
                    >
                      <Trash2 className="h-3 w-3 mr-1" /> Remove
                    </Button>
                  </div>
                </div>
              ))}

              {/* Empty Bench Slots */}
              {Array(4 - (user?.bench?.length || 0)).fill(0).map((_, index) => (
                <div key={`empty-bench-${index}`} className="flex flex-col items-center">
                  <FifaCard
                    isEmpty
                    size="small"
                    onEmptyClick={() => setPlayerSelectionDialog({ isOpen: true, position: null })}
                  />
                  <div className="h-10"></div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-10 border-2 border-dashed border-gray-200 rounded-xl bg-gray-50">
              <Plus className="h-8 w-8 mx-auto text-gray-400 mb-2" />
              <p className="text-gray-500">Your bench is empty</p>
              <Button
                variant="outline"
                size="sm"
                className="mt-4"
                onClick={() => setPlayerSelectionDialog({ isOpen: true, position: null })}
              >
                Add Players
              </Button>
            </div>
          )}
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
                      <span>{player.team}</span>
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
                      {formatCurrency(player.price)}
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

      {/* Save Confirmation Dialog */}
      <AlertDialog open={isSaveDialogOpen} onOpenChange={setIsSaveDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Save Squad Changes?</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to save your current squad configuration?
              Ensure you have a full starting 11 and bench before the gameweek deadline.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleManualSave} className="bg-green-600 hover:bg-green-700">
              Confirm Save
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Player Selection Dialog */}
      <Dialog
        open={playerSelectionDialog.isOpen}
        onOpenChange={(open) => setPlayerSelectionDialog({ isOpen: open, position: null })}
      >
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              Select {playerSelectionDialog.position} Player
            </DialogTitle>
            <DialogDescription>
              Choose a player to add to your squad from available {playerSelectionDialog.position} players within your budget.
            </DialogDescription>
          </DialogHeader>

          <div className="flex gap-2 p-4 border-b overflow-x-auto">
            {(['GK', 'DEF', 'MID', 'ATT'] as const).map(pos => (
              <Button
                key={pos}
                variant={playerSelectionDialog.position === pos ? "default" : "outline"}
                size="sm"
                onClick={() => setPlayerSelectionDialog(prev => ({ ...prev, position: pos }))}
              >
                {pos}
              </Button>
            ))}
          </div>

          <div className="max-h-[60vh] overflow-y-auto p-4">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Player</TableHead>
                  <TableHead>Team</TableHead>
                  <TableHead>Rating</TableHead>
                  <TableHead>Position</TableHead>
                  <TableHead>Price</TableHead>
                  <TableHead className="text-right">Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {playerSelectionDialog.position &&
                  getAvailablePlayersForPosition(playerSelectionDialog.position).map((player) => (
                    <TableRow key={player.id}>
                      <TableCell className="font-medium flex items-center gap-3">
                        <Avatar className="h-10 w-10">
                          <AvatarImage src={getJerseyImage(player.team)} alt={player.name} className="object-cover" />
                          <AvatarFallback>{player.name.substring(0, 2)}</AvatarFallback>
                        </Avatar>
                        {player.name}
                      </TableCell>
                      <TableCell>{player.team}</TableCell>
                      <TableCell>
                        <span className={`font-bold ${getRatingColor(player.rating)}`}>
                          {player.rating}
                        </span>
                      </TableCell>
                      <TableCell>
                        <Badge className={`${getPositionColor(player.position)}`} variant="secondary">
                          {player.position}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-green-600 font-bold">
                        {formatCurrency(player.price)}
                      </TableCell>
                      <TableCell className="text-right">
                        <Button
                          size="sm"
                          onClick={() => handlePlayerSelect(player)}
                          className="bg-green-600 hover:bg-green-700 text-white"
                        >
                          <Plus className="h-4 w-4 mr-1" />
                          Select
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                }
              </TableBody>
            </Table>

            {playerSelectionDialog.position && getAvailablePlayersForPosition(playerSelectionDialog.position).length === 0 && (
              <div className="text-center py-12">
                <p className="text-muted-foreground">No players found for {playerSelectionDialog.position}</p>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};
