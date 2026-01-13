import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { db } from '@/integrations/firebase/client';
import { doc, getDoc } from 'firebase/firestore';
import { FifaCard } from '@/components/FifaCard';
import { getNextOpponent } from '@/data/pslFixtures';
import { formations } from '@/components/FormationSelector';
import { Loader2, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { User } from '@/contexts/AuthContext';

// Reusing interfaces from AuthContext (User, Player) is ideal, 
// but since I'm just reading, I can trust the specific fields I need 
// or import them. I already imported User from AuthContext.

interface UserTeamViewProps {
    userId: string;
    onClose: () => void;
}

export const UserTeamView: React.FC<UserTeamViewProps> = ({ userId, onClose }) => {
    const [viewedUser, setViewedUser] = useState<User | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchUser = async () => {
            if (!userId) return;
            setIsLoading(true);
            try {
                const userDocRef = doc(db, 'users', userId);
                const userSnap = await getDoc(userDocRef);

                if (userSnap.exists()) {
                    setViewedUser(userSnap.data() as User);
                } else {
                    console.error("User not found");
                }
            } catch (error) {
                console.error("Error fetching user team:", error);
            } finally {
                setIsLoading(false);
            }
        };

        fetchUser();
    }, [userId]);

    if (isLoading) {
        return (
            <div className="flex flex-col items-center justify-center p-12">
                <Loader2 className="h-10 w-10 animate-spin text-green-600 mb-4" />
                <p className="text-gray-500">Scouting opposition team...</p>
            </div>
        );
    }

    if (!viewedUser) {
        return (
            <div className="text-center p-12 text-red-500">
                User not found or errors loading team.
            </div>
        );
    }

    const selectedFormation = viewedUser.selectedFormation
        ? formations.find(f => f.id === viewedUser.selectedFormation?.id)
        : null;

    // Fallback if no formation is selected (shouldn't happen for active users normally)
    const activeFormation = selectedFormation || formations.find(f => f.id === '4-4-2')!;

    const getPlayersByPosition = (position: string) => {
        return viewedUser.squad.filter(player => player.position === position) || [];
    };

    const latestResult = viewedUser.history && viewedUser.history.length > 0
        ? viewedUser.history[viewedUser.history.length - 1]
        : null;

    const getPlayerPoints = (playerId: string) => {
        return latestResult?.playerStats?.[playerId]?.points;
    };

    const getPlayerOpponent = (playerTeam: string) => {
        return getNextOpponent(playerTeam);
    };

    const positionCounts = {
        GK: getPlayersByPosition('GK').length,
        DEF: getPlayersByPosition('DEF').length,
        MID: getPlayersByPosition('MID').length,
        ATT: getPlayersByPosition('ATT').length,
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between pb-2 border-b">
                <div>
                    <h2 className="text-2xl font-bold text-gray-900">{viewedUser.teamName || 'Team Name Not Set'}</h2>
                    <p className="text-gray-600 text-sm">Manager: {viewedUser.fullName}</p>
                </div>
                <div className="text-right">
                    <div className="text-2xl font-bold text-green-600">{viewedUser.totalPoints} pts</div>
                    <div className="text-xs text-gray-500">Total Score</div>
                </div>
            </div>

            {/* Formation Visualization */}
            <Card className="border-0 shadow-none">
                <CardContent className="p-0 sm:p-4">
                    <div
                        className="relative w-full h-[650px] sm:h-[700px] rounded-lg overflow-hidden shadow-xl border-4 border-[#4a8a2a]"
                        style={{
                            background: 'repeating-linear-gradient(to bottom, #63aa36, #63aa36 5%, #589a2f 5%, #589a2f 10%)'
                        }}
                    >
                        {/* Soccer pitch markings using SVG for precision */}
                        <svg className="absolute inset-0 w-full h-full pointer-events-none" viewBox="0 0 100 150" preserveAspectRatio="none">
                            {/* Outline / Touchlines & Goal lines */}
                            <rect x="5" y="5" width="90" height="140" fill="none" stroke="white" strokeWidth="0.6" />

                            {/* Center Line */}
                            <line x1="5" y1="75" x2="95" y2="75" stroke="white" strokeWidth="0.6" />

                            {/* Center Circle */}
                            <circle cx="50" cy="75" r="10" fill="none" stroke="white" strokeWidth="0.6" />
                            <circle cx="50" cy="75" r="0.8" fill="white" />

                            {/* --- TOP GOAL (Opponent) --- */}
                            {/* Penalty Area */}
                            <rect x="22" y="5" width="56" height="24" fill="none" stroke="white" strokeWidth="0.6" />
                            {/* Goal Area */}
                            <rect x="37" y="5" width="26" height="8" fill="none" stroke="white" strokeWidth="0.6" />
                            {/* Penalty Arc */}
                            <path d="M 42,29 A 9,9 0 0,0 58,29" fill="none" stroke="white" strokeWidth="0.6" />
                            {/* Penalty Spot */}
                            <circle cx="50" cy="17" r="0.6" fill="white" />

                            {/* --- BOTTOM GOAL (Home) --- */}
                            {/* Penalty Area */}
                            <rect x="22" y="121" width="56" height="24" fill="none" stroke="white" strokeWidth="0.6" />
                            {/* Goal Area */}
                            <rect x="37" y="137" width="26" height="8" fill="none" stroke="white" strokeWidth="0.6" />
                            {/* Penalty Arc */}
                            <path d="M 42,121 A 9,9 0 0,1 58,121" fill="none" stroke="white" strokeWidth="0.6" />
                            {/* Penalty Spot */}
                            <circle cx="50" cy="133" r="0.6" fill="white" />

                            {/* Corner Arcs */}
                            <path d="M 5,8 A 3,3 0 0,0 8,5" fill="none" stroke="white" strokeWidth="0.6" />
                            <path d="M 92,5 A 3,3 0 0,0 95,8" fill="none" stroke="white" strokeWidth="0.6" />
                            <path d="M 5,142 A 3,3 0 0,1 8,145" fill="none" stroke="white" strokeWidth="0.6" />
                            <path d="M 95,142 A 3,3 0 0,0 92,145" fill="none" stroke="white" strokeWidth="0.6" />

                            {/* Goals (Visual only, slightly outside lines) */}
                            <rect x="44" y="2" width="12" height="3" fill="transparent" stroke="white" strokeWidth="0.5" strokeOpacity="0.5" />
                            <rect x="44" y="145" width="12" height="3" fill="transparent" stroke="white" strokeWidth="0.5" strokeOpacity="0.5" />
                        </svg>

                        {/* Players positioned on field */}
                        <div className="absolute inset-0 flex flex-col justify-between py-12 px-2 sm:px-8">
                            {/* Attackers (Forward line) */}
                            <div className="flex justify-center items-center h-32">
                                <div className="flex space-x-2 sm:space-x-6">
                                    {getPlayersByPosition('ATT').slice(0, activeFormation?.positions.ATT || 3).map((player) => (
                                        <FifaCard
                                            key={player.id}
                                            player={player}
                                            size="small"
                                            points={getPlayerPoints(player.id)}
                                            opponent={getPlayerOpponent(player.team)}
                                        />
                                    ))}
                                </div>
                            </div>

                            {/* Midfielders (Middle line) */}
                            <div className="flex justify-center items-center h-32">
                                <div className="flex space-x-2 sm:space-x-4">
                                    {getPlayersByPosition('MID').slice(0, activeFormation?.positions.MID || 4).map((player) => (
                                        <FifaCard
                                            key={player.id}
                                            player={player}
                                            size="small"
                                            points={getPlayerPoints(player.id)}
                                            opponent={getPlayerOpponent(player.team)}
                                        />
                                    ))}
                                </div>
                            </div>

                            {/* Defenders (Defense line) */}
                            <div className="flex justify-center items-center h-32">
                                <div className="flex space-x-2 sm:space-x-3">
                                    {getPlayersByPosition('DEF').slice(0, activeFormation?.positions.DEF || 4).map((player) => (
                                        <FifaCard
                                            key={player.id}
                                            player={player}
                                            size="small"
                                            points={getPlayerPoints(player.id)}
                                            opponent={getPlayerOpponent(player.team)}
                                        />
                                    ))}
                                </div>
                            </div>

                            {/* Goalkeeper (Goal line) */}
                            <div className="flex justify-center items-end h-32 pb-4">
                                {getPlayersByPosition('GK').slice(0, activeFormation?.positions.GK || 1).map((player) => (
                                    <FifaCard
                                        key={player.id}
                                        player={player}
                                        size="small"
                                        points={getPlayerPoints(player.id)}
                                        opponent={getPlayerOpponent(player.team)}
                                    />
                                ))}
                            </div>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Bench Section */}
            {viewedUser.bench && viewedUser.bench.length > 0 && (
                <div className="mt-4">
                    <h3 className="text-sm font-bold uppercase text-gray-500 mb-3">Substitutes Bench</h3>
                    <div className="flex flex-wrap justify-center gap-4">
                        {viewedUser.bench.map((benchPlayer) => (
                            <FifaCard
                                key={benchPlayer.id}
                                player={benchPlayer}
                                size="small"
                                points={getPlayerPoints(benchPlayer.id)}
                            />
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
};
