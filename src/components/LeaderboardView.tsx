
import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Trophy, Medal, User as UserIcon } from 'lucide-react';
import { db } from '@/integrations/firebase/client';
import { collection, query, orderBy, limit, getDocs } from 'firebase/firestore';

interface LeaderboardEntry {
    id: string;
    rank: number;
    managerName: string;
    teamName: string;
    totalPoints: number;
    gameweekPoints: number;
}

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
                    // Get last gameweek points safely
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
                    <h2 className="text-3xl font-bold text-gray-900">Global League</h2>
                    <p className="text-gray-600">See who's leading the pack in the Squad Strategy League.</p>
                </div>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Top 50 Managers</CardTitle>
                    <CardDescription>Rankings updated after every gameweek.</CardDescription>
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
