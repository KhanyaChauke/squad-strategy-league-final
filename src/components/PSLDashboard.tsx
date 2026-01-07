
import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { db } from '@/integrations/firebase/client';
import { collection, getDocs, query, orderBy, limit } from 'firebase/firestore';
import { Trophy, TrendingUp, Star, Users, Target } from 'lucide-react';

// Sample data removed to prevent false information
const sampleStandings: PSLStanding[] = [];

interface PSLStanding {
  rank: number;
  team: string;
  points: number;
  played: number;
  win: number;
  draw: number;
  loss: number;
  goalsFor: number;
  goalsAgainst: number;
  goalDifference: number;
}

interface Player {
  id: string;
  name: string;
  team: string;
  position: string;
  price: number;
  rating: number;
}

interface TopScorer {
  rank: number;
  player: string;
  team: string;
  goals: number;
  assists: number;
  played: number;
}

export const PSLDashboard = () => {
  const [standings, setStandings] = useState<PSLStanding[]>(sampleStandings);
  const [topPlayers, setTopPlayers] = useState<Player[]>([]);
  const [leagueTopScorers, setLeagueTopScorers] = useState<TopScorer[]>([]); // New State
  const [loading, setLoading] = useState(true);
  const [apiError, setApiError] = useState<string | null>(null);

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      setApiError(null);

      try {
        // 1. Fetch Top Valued Players (from your existing players collection)
        const playersRef = collection(db, 'players');
        const q = query(playersRef, orderBy('price', 'desc'), limit(3));
        const querySnapshot = await getDocs(q);

        const playersData = querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        })) as Player[];

        setTopPlayers(playersData);

        // 2. Fetch Standings & Scorers (from Google-synced Firebase collections)
        const { fetchStandings, fetchTopScorers } = await import('@/services/newsService');

        // This will automatically check if sync is needed
        const [liveStandings, liveScorers] = await Promise.all([
          fetchStandings(),
          fetchTopScorers()
        ]);

        if (liveStandings && liveStandings.length > 0) {
          setStandings(liveStandings);
        }

        if (liveScorers && liveScorers.length > 0) {
          setLeagueTopScorers(liveScorers);
        }

      } catch (error) {
        console.error("Error loading dashboard data:", error);
        setApiError("Using cached data. Some live stats might be delayed.");
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-ZA', {
      style: 'currency',
      currency: 'ZAR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const getRankBadgeColor = (rank: number) => {
    if (rank === 1) return 'bg-gradient-to-r from-green-500 to-purple-500 text-white border-none';
    if (rank === 2) return 'bg-purple-500 text-white';
    if (rank === 15) return 'bg-orange-500 text-white';
    if (rank === 16) return 'bg-red-500 text-white';
    return 'bg-gray-200 text-gray-800';
  };

  const getPositionColor = (position: string) => {
    switch (position) {
      case 'GK': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'DEF': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'MID': return 'bg-green-100 text-green-800 border-green-200';
      case 'ATT': return 'bg-red-100 text-red-800 border-red-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded mb-4"></div>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2">
              <div className="h-96 bg-gray-200 rounded"></div>
            </div>
            <div className="space-y-4">
              <div className="h-32 bg-gray-200 rounded"></div>
              <div className="h-32 bg-gray-200 rounded"></div>
              <div className="h-32 bg-gray-200 rounded"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold text-gray-900 flex items-center gap-2">
            <Trophy className="h-8 w-8 text-yellow-500" />
            PSL Season Overview
          </h2>
          <p className="text-gray-600">Current standings and top performers</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* PSL Standings Table */}
        <div className="lg:col-span-2">
          {apiError && (
            <div className="mb-4 bg-yellow-50 text-yellow-800 p-3 rounded-md text-sm border border-yellow-200">
              {apiError}
            </div>
          )}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                PSL League Table
              </CardTitle>
              <CardDescription>
                Current Premier Soccer League standings
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-12">Pos</TableHead>
                      <TableHead>Team</TableHead>
                      <TableHead className="text-center">MP</TableHead>
                      <TableHead className="text-center">W</TableHead>
                      <TableHead className="text-center">D</TableHead>
                      <TableHead className="text-center">L</TableHead>
                      <TableHead className="text-center">GF</TableHead>
                      <TableHead className="text-center">GA</TableHead>
                      <TableHead className="text-center">GD</TableHead>
                      <TableHead className="text-center font-bold sticky right-0 bg-white z-10 shadow-[-2px_0_5px_rgba(0,0,0,0.1)]">Pts</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {standings.length > 0 ? (
                      standings.map((team) => (
                        <TableRow key={team.rank} className="group hover:bg-gray-50">
                          <TableCell>
                            <Badge className={getRankBadgeColor(team.rank)}>
                              {team.rank}
                            </Badge>
                          </TableCell>
                          <TableCell className="font-medium">{team.team}</TableCell>
                          <TableCell className="text-center">{team.played}</TableCell>
                          <TableCell className="text-center">{team.win}</TableCell>
                          <TableCell className="text-center">{team.draw}</TableCell>
                          <TableCell className="text-center">{team.loss}</TableCell>
                          <TableCell className="text-center">{team.goalsFor}</TableCell>
                          <TableCell className="text-center">{team.goalsAgainst}</TableCell>
                          <TableCell className="text-center">
                            <span className={team.goalDifference > 0 ? 'text-green-600' : team.goalDifference < 0 ? 'text-red-600' : 'text-gray-600'}>
                              {team.goalDifference > 0 ? '+' : ''}{team.goalDifference}
                            </span>
                          </TableCell>
                          <TableCell className="text-center font-bold sticky right-0 bg-white group-hover:bg-gray-50 z-10 shadow-[-2px_0_5px_rgba(0,0,0,0.1)]">{team.points}</TableCell>
                        </TableRow>
                      ))
                    ) : (
                      <TableRow>
                        <TableCell colSpan={10} className="text-center py-8 text-gray-500">
                          No standings data available at the moment.
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </div>

              {/* Legend */}
              <div className="mt-6 grid grid-cols-2 md:grid-cols-4 gap-4 text-xs">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-gradient-to-r from-green-500 to-purple-500"></div>
                  <span>Champions & CAF</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-purple-500"></div>
                  <span>CAF Qualification</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-orange-500"></div>
                  <span>Relegation Play-offs</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-red-500"></div>
                  <span>Relegation</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* League Top Scorers & Top Rated */}
        <div className="space-y-6">
          {/* League Top Scorers */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Target className="h-5 w-5 text-green-500" />
                League Top Scorers
              </CardTitle>
              <CardDescription>
                Top goalscorers in the PSL
              </CardDescription>
            </CardHeader>
            <CardContent className="p-0">
              <Table>
                <TableBody>
                  {leagueTopScorers.map((scorer) => (
                    <TableRow key={scorer.rank}>
                      <TableCell className="w-8 font-bold text-gray-500">#{scorer.rank}</TableCell>
                      <TableCell>
                        <div className="font-semibold">{scorer.player}</div>
                        <div className="text-xs text-gray-500">{scorer.team}</div>
                      </TableCell>
                      <TableCell className="text-right font-bold text-green-600">
                        {scorer.goals} <span className="text-xs font-normal text-gray-400">Goals</span>
                      </TableCell>
                    </TableRow>
                  ))}
                  {leagueTopScorers.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={3} className="text-center text-gray-500 py-4">Loading stats...</TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Star className="h-5 w-5 text-yellow-500" />
                Most Valuable Players
              </CardTitle>
              <CardDescription>
                Highest market value in Fantasy League
              </CardDescription>
            </CardHeader>
          </Card>

          {topPlayers.map((player, index) => (
            <Card key={player.id} className="relative overflow-hidden">
              <div className="absolute top-2 right-2">
                <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">
                  #{index + 1}
                </Badge>
              </div>
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="space-y-1">
                    <CardTitle className="text-lg">{player.name}</CardTitle>
                    <CardDescription className="flex items-center gap-2">
                      <span>{player.team}</span>
                      <Badge className={getPositionColor(player.position)} variant="outline">
                        {player.position}
                      </Badge>
                    </CardDescription>
                  </div>
                  <div className="text-right">
                    <div className="text-2xl font-bold text-primary">
                      {formatCurrency(player.price)}
                    </div>
                    <div className="flex items-center text-yellow-500">
                      <Star className="h-3 w-3 fill-current" />
                    </div>
                  </div>
                </div>
              </CardHeader>

              <CardContent className="space-y-3">
                {/* Player Status */}
                <div className="pt-2 border-t">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-500">Status</span>
                    <Badge variant="default">
                      Available
                    </Badge>
                  </div>
                </div>

                {/* Market Value */}
                <div className="pt-2 border-t">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-500">Market Value</span>
                    <span className="font-bold text-green-600">
                      {formatCurrency(player.price)}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
};