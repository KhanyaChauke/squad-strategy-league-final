
import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { useAuth } from '@/contexts/AuthContext';
import { createLeague, joinLeague, getUserLeagues, getLeagueDetails, League } from '@/services/leagueService';
import { db } from '@/integrations/firebase/client';
import { doc, getDoc } from 'firebase/firestore';
import { Plus, Users, Trophy, ChevronLeft, Copy, Check, Medal, User as UserIcon } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { LeaderboardView } from './LeaderboardView';
import { UserTeamView } from './UserTeamView';

// Internal component for displaying a specific league's leaderboard
const LeagueDetailView = ({ league, onBack }: { league: League; onBack: () => void }) => {
    const [members, setMembers] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
    const [isTeamModalOpen, setIsTeamModalOpen] = useState(false);
    const { toast } = useToast();

    useEffect(() => {
        const fetchMembers = async () => {
            setIsLoading(true);
            try {
                const memberDataPromises = league.members.map(async (memberId) => {
                    const userDoc = await getDoc(doc(db, 'users', memberId));
                    if (userDoc.exists()) {
                        const data = userDoc.data();
                        const lastGwPoints = data.history && data.history.length > 0
                            ? data.history[data.history.length - 1].totalPoints
                            : 0;
                        return {
                            id: userDoc.id,
                            managerName: data.fullName || 'Unknown',
                            teamName: data.teamName || 'Team',
                            totalPoints: data.totalPoints || 0,
                            gameweekPoints: lastGwPoints
                        };
                    }
                    return null;
                });

                const fetchedMembers = (await Promise.all(memberDataPromises)).filter(m => m !== null);
                // Sort by points desc
                fetchedMembers.sort((a, b) => b.totalPoints - a.totalPoints);

                // Add rank
                const rankedMembers = fetchedMembers.map((m, index) => ({
                    ...m,
                    rank: index + 1
                }));

                setMembers(rankedMembers);
            } catch (error) {
                console.error("Error fetching league members", error);
            } finally {
                setIsLoading(false);
            }
        };

        fetchMembers();
    }, [league]);

    const copyCode = () => {
        navigator.clipboard.writeText(league.code);
        toast({ title: "Code Copied!", description: "Share this code with your friends." });
    };

    const handleUserClick = (userId: string) => {
        setSelectedUserId(userId);
        setIsTeamModalOpen(true);
    };

    const getRankIcon = (rank: number) => {
        switch (rank) {
            case 1: return <Trophy className="h-5 w-5 text-yellow-500" />;
            case 2: return <Medal className="h-5 w-5 text-gray-400" />;
            case 3: return <Medal className="h-5 w-5 text-amber-600" />;
            default: return <span className="text-gray-500 font-bold w-5 text-center">{rank}</span>;
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center space-x-2">
                <Button variant="ghost" size="sm" onClick={onBack} className="p-0 hover:bg-transparent">
                    <ChevronLeft className="h-5 w-5 mr-1" /> Back
                </Button>
            </div>

            <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-100">
                <div className="flex justify-between items-start">
                    <div>
                        <h2 className="text-2xl font-bold text-gray-900">{league.name}</h2>
                        <div className="flex items-center mt-2 space-x-2">
                            <span className="text-sm text-gray-500">League Code:</span>
                            <code className="bg-gray-100 px-2 py-1 rounded text-sm font-mono font-bold text-gray-700">{league.code}</code>
                            <Button variant="ghost" size="icon" className="h-6 w-6" onClick={copyCode}>
                                <Copy className="h-3 w-3" />
                            </Button>
                        </div>
                    </div>
                    <div className="text-right">
                        <div className="flex items-center justify-end text-sm text-gray-500 mb-1">
                            <Users className="h-4 w-4 mr-1" />
                            {league.members.length} Members
                        </div>
                    </div>
                </div>
            </div>

            <Card>
                <CardHeader className="pb-2">
                    <CardTitle className="text-lg">Standings</CardTitle>
                </CardHeader>
                <CardContent>
                    {isLoading ? (
                        <div className="text-center py-8">
                            <div className="animate-spin h-6 w-6 border-2 border-primary border-t-transparent rounded-full mx-auto mb-2"></div>
                            <p className="text-sm text-gray-500">Loading members...</p>
                        </div>
                    ) : members.length === 0 ? (
                        <div className="text-center py-8 text-gray-500">No members found.</div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead>
                                    <tr className="border-b text-left text-[10px] md:text-xs font-semibold uppercase tracking-wider text-gray-500 bg-gray-50">
                                        <th className="px-3 py-2">Pos</th>
                                        <th className="px-3 py-2">Manager</th>
                                        <th className="px-3 py-2 text-right">GW</th>
                                        <th className="px-3 py-2 text-right">Total</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100">
                                    {members.map((member) => (
                                        <tr
                                            key={member.id}
                                            className="hover:bg-gray-50 cursor-pointer"
                                            onClick={() => handleUserClick(member.id)}
                                        >
                                            <td className="px-3 py-3">
                                                <div className="flex items-center">
                                                    {getRankIcon(member.rank)}
                                                </div>
                                            </td>
                                            <td className="px-3 py-3">
                                                <div>
                                                    <div className="font-semibold text-sm text-gray-900">{member.teamName}</div>
                                                    <div className="text-xs text-gray-500">{member.managerName}</div>
                                                </div>
                                            </td>
                                            <td className="px-3 py-3 text-right">
                                                <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-green-50 text-green-700">
                                                    {member.gameweekPoints}
                                                </span>
                                            </td>
                                            <td className="px-3 py-3 text-right">
                                                <span className="font-bold text-gray-900">{member.totalPoints}</span>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </CardContent>
            </Card>

            <Dialog open={isTeamModalOpen} onOpenChange={setIsTeamModalOpen}>
                <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto w-full p-2 sm:p-6 bg-white/95 backdrop-blur-3xl">
                    <DialogHeader className="mb-2">
                        <DialogTitle>Team Viewer</DialogTitle>
                    </DialogHeader>
                    {selectedUserId && (
                        <div className="mt-2">
                            <UserTeamView userId={selectedUserId} onClose={() => setIsTeamModalOpen(false)} />
                        </div>
                    )}
                </DialogContent>
            </Dialog>
        </div>
    );
};

export const LeaguesView = () => {
    const { user } = useAuth();
    const { toast } = useToast();
    const [activeTab, setActiveTab] = useState("global");
    const [userLeagues, setUserLeagues] = useState<League[]>([]);
    const [selectedLeague, setSelectedLeague] = useState<League | null>(null);
    const [isLoadingLeagues, setIsLoadingLeagues] = useState(false);

    // Modals
    const [isCreateOpen, setIsCreateOpen] = useState(false);
    const [isJoinOpen, setIsJoinOpen] = useState(false);

    // Inputs
    const [newLeagueName, setNewLeagueName] = useState("");
    const [joinCode, setJoinCode] = useState("");

    const fetchUserLeagues = async () => {
        if (!user) return;
        setIsLoadingLeagues(true);
        try {
            const leagues = await getUserLeagues(user.id);
            setUserLeagues(leagues);
        } catch (error) {
            console.error(error);
        } finally {
            setIsLoadingLeagues(false);
        }
    };

    useEffect(() => {
        if (activeTab === 'private') {
            fetchUserLeagues();
        }
    }, [activeTab, user]);

    const handleCreateLeague = async () => {
        if (!newLeagueName.trim() || !user) return;
        try {
            const code = await createLeague(newLeagueName, user.id);
            toast({ title: "League Created!", description: `Your league code is: ${code}` });
            setIsCreateOpen(false);
            setNewLeagueName("");
            fetchUserLeagues();
        } catch (error) {
            toast({ title: "Error", description: "Failed to create league.", variant: "destructive" });
        }
    };

    const handleJoinLeague = async () => {
        if (!joinCode.trim() || !user) return;
        try {
            const name = await joinLeague(joinCode, user.id);
            toast({ title: "Joined League!", description: `You successfully joined ${name}` });
            setIsJoinOpen(false);
            setJoinCode("");
            fetchUserLeagues();
        } catch (error: any) {
            toast({ title: "Error", description: error.message || "Failed to join league.", variant: "destructive" });
        }
    };

    if (selectedLeague) {
        return <LeagueDetailView league={selectedLeague} onBack={() => setSelectedLeague(null)} />;
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-3xl font-bold text-gray-900">Leagues</h2>
                    <p className="text-gray-600">Compete with friends or the world.</p>
                </div>
            </div>

            <Tabs defaultValue="global" value={activeTab} onValueChange={setActiveTab} className="w-full">
                <TabsList className="grid w-full grid-cols-2 max-w-[400px]">
                    <TabsTrigger value="global">Global Standings</TabsTrigger>
                    <TabsTrigger value="private">My Leagues</TabsTrigger>
                </TabsList>

                <TabsContent value="global" className="mt-6">
                    <LeaderboardView />
                </TabsContent>

                <TabsContent value="private" className="mt-6 space-y-6">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <Card
                            className="border-dashed border-2 cursor-pointer hover:border-green-500 hover:bg-green-50 transition-all flex flex-col items-center justify-center p-6 text-center h-40"
                            onClick={() => setIsCreateOpen(true)}
                        >
                            <div className="bg-green-100 p-3 rounded-full mb-3">
                                <Plus className="h-6 w-6 text-green-600" />
                            </div>
                            <h3 className="font-semibold text-gray-900">Create a League</h3>
                            <p className="text-sm text-gray-500 mt-1">Start your own competition</p>
                        </Card>

                        <Card
                            className="border-dashed border-2 cursor-pointer hover:border-blue-500 hover:bg-blue-50 transition-all flex flex-col items-center justify-center p-6 text-center h-40"
                            onClick={() => setIsJoinOpen(true)}
                        >
                            <div className="bg-blue-100 p-3 rounded-full mb-3">
                                <Users className="h-6 w-6 text-blue-600" />
                            </div>
                            <h3 className="font-semibold text-gray-900">Join a League</h3>
                            <p className="text-sm text-gray-500 mt-1">Enter a code to join</p>
                        </Card>
                    </div>

                    <div className="space-y-4">
                        <h3 className="text-lg font-semibold text-gray-900">Your Leagues</h3>
                        {isLoadingLeagues ? (
                            <div className="text-center py-8">
                                <div className="animate-spin h-6 w-6 border-2 border-primary border-t-transparent rounded-full mx-auto mb-2"></div>
                            </div>
                        ) : userLeagues.length === 0 ? (
                            <div className="text-center py-12 bg-gray-50 rounded-lg border border-gray-100">
                                <Trophy className="h-10 w-10 text-gray-300 mx-auto mb-3" />
                                <p className="text-gray-500">You haven't joined any leagues yet.</p>
                            </div>
                        ) : (
                            <div className="grid gap-4">
                                {userLeagues.map((league) => (
                                    <Card
                                        key={league.id}
                                        className="cursor-pointer hover:shadow-md transition-shadow"
                                        onClick={() => setSelectedLeague(league)}
                                    >
                                        <CardContent className="p-4 flex justify-between items-center">
                                            <div className="flex items-center space-x-4">
                                                <div className="bg-green-100 p-2 rounded-lg">
                                                    <Trophy className="h-5 w-5 text-green-600" />
                                                </div>
                                                <div>
                                                    <h4 className="font-semibold text-gray-900">{league.name}</h4>
                                                    <p className="text-xs text-gray-500">{league.members.length} Managers</p>
                                                </div>
                                            </div>
                                            <div className="text-right">
                                                <Button variant="ghost" size="sm" className="text-gray-400">
                                                    View <ChevronLeft className="h-4 w-4 rotate-180 ml-1" />
                                                </Button>
                                            </div>
                                        </CardContent>
                                    </Card>
                                ))}
                            </div>
                        )}
                    </div>
                </TabsContent>
            </Tabs>

            {/* Create League Dialog */}
            <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Create a League</DialogTitle>
                        <DialogDescription>Create a private league and invite your friends.</DialogDescription>
                    </DialogHeader>
                    <div className="py-4">
                        <Input
                            placeholder="League Name (e.g. Office Rivals)"
                            value={newLeagueName}
                            onChange={(e) => setNewLeagueName(e.target.value)}
                        />
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setIsCreateOpen(false)}>Cancel</Button>
                        <Button onClick={handleCreateLeague}>Create League</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Join League Dialog */}
            <Dialog open={isJoinOpen} onOpenChange={setIsJoinOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Join a League</DialogTitle>
                        <DialogDescription>Enter the 6-character code shared by the league creator.</DialogDescription>
                    </DialogHeader>
                    <div className="py-4">
                        <Input
                            placeholder="League Code (e.g. X7Y2Z1)"
                            value={joinCode}
                            onChange={(e) => setJoinCode(e.target.value.toUpperCase())}
                            maxLength={6}
                        />
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setIsJoinOpen(false)}>Cancel</Button>
                        <Button onClick={handleJoinLeague}>Join League</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
};
