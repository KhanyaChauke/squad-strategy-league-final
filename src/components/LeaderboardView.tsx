
import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Trophy, Medal, User as UserIcon } from 'lucide-react';
import { db } from '@/integrations/firebase/client';
import { collection, query, orderBy, limit, getDocs } from 'firebase/firestore';
import { getTeamKit } from '@/data/teamKits';

interface LeaderboardEntry {
    id: string;
    rank: number;
    managerName: string;
    teamName: string;
    totalPoints: number;
    gameweekPoints: number;
}

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { pslStandings } from "@/data/pslStandings";

export const LeaderboardView = () => {
    const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchLeaderboard = async () => {
            setIsLoading(true);
            try {
                const usersRef = collection(db, 'users');
                const q = query(usersRef, orderBy('totalPoints', 'desc'), limit(50));
                const querySnapshot = await getDocs(q);

                const entries: LeaderboardEntry[] = [];
                let rank = 1;

                querySnapshot.forEach((doc) => {
                    const data = doc.data();
                    const lastGwPoints = data.history && data.history.length > 0
                        ? data.history[data.history.length - 1].totalPoints
                        : 0;

                    entries.push({
                        id: doc.id,
                        rank: rank++,
                        managerName: data.fullName || 'Unknown Manager',
                        teamName: data.teamName || 'Team ' + rank,
                        totalPoints: data.totalPoints || 0,
                        gameweekPoints: lastGwPoints
                    });
                });

                setLeaderboard(entries);
            } catch (error) {
                console.error("Error fetching leaderboard:", error);
            } finally {
                setIsLoading(false);
            }
        };

        fetchLeaderboard();
    }, []);

    // Helper to get static logos (Duplicated from LiveGamesView for consistency)
    const getTeamLogo = (teamName: string): string | undefined => {
        const localKit = getTeamKit(teamName);
        if (localKit && localKit.homeKit) return localKit.homeKit;
        const t = teamName.toLowerCase();
        if (t.includes('orbit')) return 'https://upload.wikimedia.org/wikipedia/en/2/23/Orbit_College_FC_logo.png';
        if (t.includes('siwelele') || t.includes('celtic')) return 'https://a.espncdn.com/combiner/i?img=/i/teamlogos/soccer/500/2322.png&h=200&w=200';
        if (t.includes('sundowns')) return 'https://a.espncdn.com/combiner/i?img=/i/teamlogos/soccer/500/2324.png&h=200&w=200';
        if (t.includes('pirates')) return 'https://a.espncdn.com/combiner/i?img=/i/teamlogos/soccer/500/2327.png&h=200&w=200';
        if (t.includes('chiefs')) return 'https://a.espncdn.com/combiner/i?img=/i/teamlogos/soccer/500/2323.png&h=200&w=200';
        if (t.includes('stellenbosch')) return 'https://a.espncdn.com/combiner/i?img=/i/teamlogos/soccer/500/18804.png&h=200&w=200';
        if (t.includes('city') && t.includes('cape')) return 'https://a.espncdn.com/combiner/i?img=/i/teamlogos/soccer/500/17724.png&h=200&w=200';
        if (t.includes('supersport')) return 'https://a.espncdn.com/combiner/i?img=/i/teamlogos/soccer/500/2627.png&h=200&w=200';
        if (t.includes('amazulu')) return 'https://a.espncdn.com/combiner/i?img=/i/teamlogos/soccer/500/2326.png&h=200&w=200';
        if (t.includes('arrows')) return 'https://a.espncdn.com/combiner/i?img=/i/teamlogos/soccer/500/4556.png&h=200&w=200';
        if (t.includes('galaxy')) return 'https://a.espncdn.com/combiner/i?img=/i/teamlogos/soccer/500/19864.png&h=200&w=200';
        if (t.includes('sekhukhune')) return 'https://a.espncdn.com/combiner/i?img=/i/teamlogos/soccer/500/20348.png&h=200&w=200';
        if (t.includes('chippa')) return 'https://a.espncdn.com/combiner/i?img=/i/teamlogos/soccer/500/13735.png&h=200&w=200';
        if (t.includes('richards')) return 'https://a.espncdn.com/combiner/i?img=/i/teamlogos/soccer/500/20347.png&h=200&w=200';
        if (t.includes('polokwane')) return 'https://a.espncdn.com/combiner/i?img=/i/teamlogos/soccer/500/14107.png&h=200&w=200';
        if (t.includes('royal')) return 'https://a.espncdn.com/combiner/i?img=/i/teamlogos/soccer/500/20346.png&h=200&w=200';
        if (t.includes('gallants') || t.includes('marumo')) return 'https://a.espncdn.com/combiner/i?img=/i/teamlogos/soccer/500/20349.png&h=200&w=200';
        if (t.includes('magesi')) return 'https://upload.wikimedia.org/wikipedia/en/2/23/Orbit_College_FC_logo.png'; // Fallback for Magesi (proxy) or find specific
        return undefined;
    };

    const TeamLogo = ({ name }: { name: string }) => {
        const url = getTeamLogo(name);
        const [error, setError] = useState(false);

        if (url && !error) {
            return <img src={url} alt={name} className="w-6 h-6 object-contain" onError={() => setError(true)} referrerPolicy="no-referrer" />;
        }
        return (
            <div className="w-6 h-6 bg-gray-200 rounded-full flex items-center justify-center text-[8px] font-bold text-gray-500">
                {name.substring(0, 2)}
            </div>
        );
    };

    const getRankIcon = (rank: number) => {
        switch (rank) {
            case 1: return <Trophy className="h-6 w-6 text-yellow-500" />;
            case 2: return <Medal className="h-6 w-6 text-gray-400" />;
            case 3: return <Medal className="h-6 w-6 text-amber-600" />;
            default: return <span className="text-gray-500 font-bold w-6 text-center">{rank}</span>;
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-3xl font-bold text-gray-900">League Standings</h2>
                    <p className="text-gray-600">Track manager rankings and PSL team performance.</p>
                </div>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Top 50 Managers</CardTitle>
                    <CardDescription>Global rankings updated after every gameweek.</CardDescription>
                </CardHeader>
                <CardContent>
                    {isLoading ? (
                        <div className="text-center py-8">
                            <div className="animate-spin h-8 w-8 border-4 border-blue-500 border-t-transparent rounded-full mx-auto mb-4"></div>
                            <p className="text-gray-500">Loading standings...</p>
                        </div>
                    ) : leaderboard.length === 0 ? (
                        <div className="text-center py-8 text-gray-500">No managers found yet. Be the first to join!</div>
                    ) : (
                        <div className="overflow-x-auto w-full">
                            <table className="w-full">
                                <thead>
                                    <tr className="border-b text-left text-[10px] md:text-xs font-semibold uppercase tracking-wider text-gray-500 bg-gray-50">
                                        <th className="px-2 py-2 md:px-6 md:py-3 w-8 md:w-auto">Pos</th>
                                        <th className="px-2 py-2 md:px-6 md:py-3">
                                            <span className="md:hidden">Team</span>
                                            <span className="hidden md:inline">Team & Manager</span>
                                        </th>
                                        <th className="px-2 py-2 md:px-6 md:py-3 text-right">
                                            <span className="md:hidden">GW</span>
                                            <span className="hidden md:inline">GW Points</span>
                                        </th>
                                        <th className="px-2 py-2 md:px-6 md:py-3 text-right">
                                            <span className="md:hidden">Tot</span>
                                            <span className="hidden md:inline">Total Points</span>
                                        </th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100">
                                    {leaderboard.map((entry) => (
                                        <tr key={entry.id} className="hover:bg-gray-50 transition-colors">
                                            <td className="px-2 py-2 md:px-6 md:py-4 whitespace-nowrap">
                                                <div className="flex items-center justify-center md:justify-start">
                                                    {getRankIcon(entry.rank)}
                                                </div>
                                            </td>
                                            <td className="px-2 py-2 md:px-6 md:py-4">
                                                <div className="flex items-center">
                                                    <div className="hidden md:block bg-blue-100 p-2 rounded-full mr-3">
                                                        <UserIcon className="h-5 w-5 text-blue-600" />
                                                    </div>
                                                    <div>
                                                        <div className="font-bold text-gray-900 text-xs md:text-base truncate max-w-[120px] md:max-w-none">{entry.teamName}</div>
                                                        <div className="text-[10px] md:text-xs text-gray-500 truncate max-w-[120px] md:max-w-none">{entry.managerName}</div>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-2 py-2 md:px-6 md:py-4 text-right whitespace-nowrap">
                                                <span className="inline-flex items-center px-1.5 py-0.5 md:px-2.5 md:py-0.5 rounded-full text-[10px] md:text-xs font-medium bg-green-100 text-green-800">
                                                    {entry.gameweekPoints}
                                                </span>
                                            </td>
                                            <td className="px-2 py-2 md:px-6 md:py-4 text-right whitespace-nowrap">
                                                <span className="text-sm md:text-lg font-bold text-gray-900">{entry.totalPoints}</span>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
};
