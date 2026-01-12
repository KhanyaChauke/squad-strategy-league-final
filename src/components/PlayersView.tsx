
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useAuth } from '@/contexts/AuthContext';
import { playersDatabase, searchPlayers, getPlayersByPosition } from '@/data/playersData';
import { useToast } from '@/hooks/use-toast';
import { Search, TrendingUp } from 'lucide-react';
import { FifaCardDetailed } from '@/components/FifaCard';

export const PlayersView = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [positionFilter, setPositionFilter] = useState('all');
  const [teamFilter, setTeamFilter] = useState('all');
  const [sortBy, setSortBy] = useState('rating');
  const { user, addPlayerToSquad, addPlayerToBench } = useAuth();
  const { toast } = useToast();

  const selectedFormation = user?.selectedFormation;

  const getFilteredPlayers = () => {
    let players = playersDatabase;

    // Apply search filter
    if (searchQuery.trim()) {
      players = searchPlayers(searchQuery);
    }

    // Apply position filter
    if (positionFilter !== 'all') {
      players = getPlayersByPosition(positionFilter);
      if (searchQuery.trim()) {
        players = players.filter(player =>
          player.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          player.team.toLowerCase().includes(searchQuery.toLowerCase())
        );
      }
    }

    // Apply team filter
    if (teamFilter !== 'all') {
      players = players.filter(player => player.team === teamFilter);
    }

    // Apply sorting
    switch (sortBy) {
      case 'rating':
        players.sort((a, b) => b.rating - a.rating);
        break;
      case 'price':
        players.sort((a, b) => b.price - a.price);
        break;
      case 'name':
        players.sort((a, b) => a.name.localeCompare(b.name));
        break;
      default:
        break;
    }

    return players;
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-ZA', {
      style: 'currency',
      currency: 'ZAR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const handleAddPlayer = (player: any) => {
    const success = addPlayerToSquad(player);

    if (success) {
      toast({
        title: "Player Added!",
        description: `${player.name} has been added to your squad.`
      });
    } else {
      let message = "Failed to add player.";
      console.log("Add Player Failed - Debug:", {
        budget: user?.budget,
        price: player.price,
        isBudgetIssue: (user?.budget || 0) < player.price,
        formation: selectedFormation,
        positionCount: user?.squad?.filter(p => p.position === player.position).length
      });

      if (selectedFormation) {
        const currentPositionCount = user?.squad?.filter(p => p.position === player.position).length || 0;
        const maxForPosition = selectedFormation.positions[player.position as keyof typeof selectedFormation.positions];
        if (currentPositionCount >= maxForPosition) {
          message = `Your ${selectedFormation.name} formation only allows ${maxForPosition} ${player.position} players.`;
        } else if ((user?.budget || 0) < player.price) {
          message = `Insufficient budget. You have ${formatCurrency(user?.budget || 0)} but this player costs ${formatCurrency(player.price)}.`;
        } else if (user?.squad?.some(p => p.id === player.id)) {
          message = "Player is already in your squad.";
        }
      } else {
        if ((user?.squad?.length || 0) + (user?.bench?.length || 0) >= 15) {
          message = "Your total squad is full (15 players maximum).";
        } else if ((user?.budget || 0) < player.price) {
          message = `Insufficient budget. You have ${formatCurrency(user?.budget || 0)} but this player costs ${formatCurrency(player.price)}.`;
        } else if (user?.squad?.some(p => p.id === player.id)) {
          message = "Player is already in your squad.";
        }
      }

      toast({
        title: "Cannot Add Player",
        description: message,
        variant: "destructive"
      });
    }
  };

  const handleAddToBench = (player: any) => {
    const success = addPlayerToBench(player);

    if (success) {
      toast({
        title: "Player Added to Bench!",
        description: `${player.name} has been added to your bench.`
      });
    } else {
      let message = "Failed to add player to bench.";

      if ((user?.squad?.length || 0) + (user?.bench?.length || 0) >= 15) {
        message = "Your total squad is full (15 players maximum).";
      } else if (user?.bench?.length >= 4) {
        message = "Your bench is full (4 players maximum).";
      } else if (user?.budget && user.budget < player.price) {
        message = "Insufficient budget for this player.";
      } else if (user?.squad?.some(p => p.id === player.id) || user?.bench?.some(p => p.id === player.id)) {
        message = "Player is already in your squad or bench.";
      }

      toast({
        title: "Cannot Add Player to Bench",
        description: message,
        variant: "destructive"
      });
    }
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

  const getRatingColor = (rating: number) => {
    if (rating >= 85) return 'text-green-600';
    if (rating >= 80) return 'text-blue-600';
    if (rating >= 75) return 'text-orange-600';
    return 'text-gray-600';
  };

  const filteredPlayers = getFilteredPlayers();

  // Get unique teams for dropdown
  const uniqueTeams = Array.from(new Set(playersDatabase.map(player => player.team))).sort();

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between space-y-4 md:space-y-0">
        <div>
          <h2 className="text-3xl font-bold text-gray-900">Player Database</h2>
          <p className="text-gray-600">Browse and add players to your squad</p>
        </div>

        <div className="bg-white rounded-lg p-4 shadow-sm border">
          <div className="flex items-center space-x-4 text-sm">
            <div className="flex items-center space-x-2">
              <span className="text-gray-600">Budget:</span>
              <span className="font-bold text-green-600">
                {formatCurrency(user?.budget || 0)}
              </span>
            </div>
            <div className="flex items-center space-x-2">
              <span className="text-gray-600">Total Players:</span>
              <span className="font-bold">
                {(user?.squad?.length || 0) + (user?.bench?.length || 0)}/15
              </span>
            </div>
            <div className="flex items-center space-x-2">
              <span className="text-gray-600">Starting XI:</span>
              <span className="font-bold">
                {user?.squad?.length || 0}/{selectedFormation ? Object.values(selectedFormation.positions).reduce((a, b) => a + b, 0) : 11}
              </span>
            </div>
            <div className="flex items-center space-x-2">
              <span className="text-gray-600">Bench:</span>
              <span className="font-bold">
                {user?.bench?.length || 0}/4
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Search & Filter</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col md:flex-row space-y-4 md:space-y-0 md:space-x-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="Search players or clubs..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            <Select value={positionFilter} onValueChange={setPositionFilter}>
              <SelectTrigger className="w-full md:w-40">
                <SelectValue placeholder="Position" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Positions</SelectItem>
                <SelectItem value="GK">Goalkeeper</SelectItem>
                <SelectItem value="DEF">Defender</SelectItem>
                <SelectItem value="MID">Midfielder</SelectItem>
                <SelectItem value="ATT">Attacker</SelectItem>
              </SelectContent>
            </Select>

            <Select value={teamFilter} onValueChange={setTeamFilter}>
              <SelectTrigger className="w-full md:w-48">
                <SelectValue placeholder="Team" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Teams</SelectItem>
                {uniqueTeams.map((team) => (
                  <SelectItem key={team} value={team}>
                    {team}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger className="w-full md:w-40">
                <SelectValue placeholder="Sort by" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="rating">Rating</SelectItem>
                <SelectItem value="price">Price</SelectItem>
                <SelectItem value="name">Name</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Players Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 justify-items-center">
        {filteredPlayers.map((player) => (
          <div key={player.id} className="relative group w-fit flex justify-center mx-auto">
            <FifaCardDetailed
              player={player}
            />

            {/* Action Buttons Overlay - Mobile optimized */}
            <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity duration-200 rounded-xl flex flex-col justify-end p-2 z-10">
              <div className="space-y-2 mb-2">
                <Button
                  onClick={() => handleAddPlayer(player)}
                  className="w-full text-xs md:text-sm h-8 md:h-10 bg-blue-600 hover:bg-blue-700 text-white px-1 shadow-lg"
                  disabled={
                    user?.squad?.some(p => p.id === player.id) ||
                    user?.bench?.some(p => p.id === player.id) ||
                    (selectedFormation && (user?.squad?.filter(p => p.position === player.position).length || 0) >= selectedFormation.positions[player.position as keyof typeof selectedFormation.positions]) ||
                    (!selectedFormation && (user?.squad?.length || 0) >= 11) ||
                    (user?.budget || 0) < player.price
                  }
                >
                  Add Squad
                </Button>
                <Button
                  onClick={() => handleAddToBench(player)}
                  variant="outline"
                  className="w-full text-xs md:text-sm h-8 md:h-10 bg-white/90 text-black border-white hover:bg-white px-1 shadow-lg"
                  disabled={
                    user?.squad?.some(p => p.id === player.id) ||
                    user?.bench?.some(p => p.id === player.id) ||
                    ((user?.squad?.length || 0) + (user?.bench?.length || 0)) >= 15 ||
                    (user?.bench?.length || 0) >= 4 ||
                    (user?.budget || 0) < player.price
                  }
                >
                  Add Bench
                </Button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {filteredPlayers.length === 0 && (
        <Card>
          <CardContent className="text-center py-12">
            <TrendingUp className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500">No players found matching your criteria.</p>
            <p className="text-gray-400 text-sm">Try adjusting your search or filters.</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};
