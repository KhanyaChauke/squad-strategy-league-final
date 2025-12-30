import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Calendar, Clock, Trophy, Tv, RefreshCw } from 'lucide-react';
import { fetchFixtures, Fixture } from '@/services/newsService';
import { Button } from '@/components/ui/button';

export const LiveGamesView = () => {
    const [fixtures, setFixtures] = useState<Fixture[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // Convert UTC time to South African time (SAST = UTC+2)
    const convertToSATime = (utcTime: string): string => {
        if (!utcTime || utcTime === 'TBD') return utcTime;

        try {
            // Parse the UTC time (format: "HH:MM")
            const [hours, minutes] = utcTime.split(':').map(Number);

            // Add 2 hours for SAST
            let saHours = hours + 2;

            // Handle day overflow
            if (saHours >= 24) {
                saHours -= 24;
            }

            // Format back to HH:MM
            return `${String(saHours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}`;
        } catch (e) {
            return utcTime;
        }
    };

    // Check if match is relevant (South African or AFCON)
    const isRelevantMatch = (fixture: Fixture): boolean => {
        const saTeams = [
            'south africa', 'bafana', 'banyana',
            'kaizer chiefs', 'chiefs',
            'orlando pirates', 'pirates',
            'mamelodi sundowns', 'sundowns',
            'cape town city', 'cape town',
            'stellenbosch', 'amazulu', 'golden arrows',
            'ts galaxy', 'galaxy', 'supersport united', 'supersport',
            'sekhukhune', 'chippa', 'richards bay',
            'polokwane', 'royal am', 'magesi'
        ];

        const afconKeywords = [
            'afcon', 'africa cup', 'african cup', 'caf', 'african nations'
        ];

        const pslLeagues = [
            'premier soccer league', 'psl', 'south africa premier',
            'dstv premiership', 'premiership'
        ];

        const homeTeam = fixture.homeTeam.toLowerCase();
        const awayTeam = fixture.awayTeam.toLowerCase();
        const league = fixture.league.toLowerCase();

        // Check if it's a PSL league
        if (pslLeagues.some(l => league.includes(l))) {
            return true;
        }

        // Check if it's AFCON related
        if (afconKeywords.some(keyword => league.includes(keyword))) {
            return true;
        }

        // Check if any South African team is playing
        if (saTeams.some(team => homeTeam.includes(team) || awayTeam.includes(team))) {
            return true;
        }

        return false;
    };

    const loadFixtures = async () => {
        setIsLoading(true);
        setError(null);
        try {
            const data = await fetchFixtures();

            // Filter for South African and AFCON matches only
            const relevantFixtures = data.filter(isRelevantMatch);

            // Convert all times to SA time
            const fixturesWithSATime = relevantFixtures.map(fixture => ({
                ...fixture,
                time: convertToSATime(fixture.time)
            }));
            setFixtures(fixturesWithSATime);
        } catch (err) {
            console.error(err);
            setError("Failed to load live games. Please check your API connection.");
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        loadFixtures();
    }, []);

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'In Progress': return 'bg-green-500 text-white animate-pulse font-bold';
            case 'Finished': return 'bg-gray-600 text-white font-semibold';
            case 'Postponed': return 'bg-red-500 text-white font-semibold';
            default: return 'bg-blue-500 text-white font-semibold'; // Not Started
        }
    };

    const getStatusText = (status: string) => {
        switch (status) {
            case 'In Progress': return '🔴 LIVE';
            case 'Finished': return '✓ FT';
            case 'Postponed': return '⚠ POSTPONED';
            default: return status;
        }
    };

    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-2xl font-bold text-gray-900">Live Games</h2>
                    <p className="text-sm text-gray-600">Follow today's live PSL action (SAST)</p>
                </div>
                <div className="flex items-center space-x-2 text-sm text-gray-500">
                    <Calendar className="h-4 w-4" />
                    <span>{new Date().toLocaleDateString('en-ZA', { weekday: 'short', day: 'numeric', month: 'short' })}</span>
                </div>
            </div>

            {isLoading ? (
                <div className="text-center py-8">
                    <div className="animate-spin h-8 w-8 border-4 border-blue-500 border-t-transparent rounded-full mx-auto mb-4"></div>
                    <p className="text-gray-500 text-sm">Loading fixtures...</p>
                </div>
            ) : error ? (
                <div className="text-center py-8 bg-red-50 rounded-lg">
                    <p className="text-red-600 mb-4 text-sm">{error}</p>
                    <Button onClick={loadFixtures} variant="outline" className="border-red-200 hover:bg-red-100" size="sm">
                        <RefreshCw className="mr-2 h-4 w-4" /> Try Again
                    </Button>
                </div>
            ) : fixtures.length === 0 ? (
                <div className="text-center py-8 bg-gray-50 rounded-lg border border-dashed border-gray-300">
                    <Trophy className="h-10 w-10 text-gray-300 mx-auto mb-2" />
                    <h3 className="text-base font-medium text-gray-900">No Matches Today</h3>
                    <p className="text-sm text-gray-500">Check back later for live PSL fixtures.</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                    {fixtures.map((fixture) => (
                        <Card key={fixture.fixtureId} className="overflow-hidden hover:shadow-md transition-shadow">
                            <CardContent className="p-4">
                                {/* League & Status Row */}
                                <div className="flex items-center justify-between mb-3">
                                    <div className="flex items-center text-xs text-blue-600 font-semibold">
                                        <Trophy className="h-3 w-3 mr-1" />
                                        <span className="truncate">{fixture.league}</span>
                                    </div>
                                    <Badge className={`${getStatusColor(fixture.status)} text-xs px-2 py-1`}>
                                        {getStatusText(fixture.status)}
                                    </Badge>
                                </div>

                                {/* Match Details */}
                                <div className="space-y-2">
                                    {/* Home Team */}
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center space-x-2 flex-1 min-w-0">
                                            <div className="w-8 h-8 bg-gray-200 rounded-full flex-shrink-0"></div>
                                            <span className="text-sm font-bold text-gray-900 truncate">{fixture.homeTeam}</span>
                                        </div>
                                        <span className="text-2xl font-bold font-mono text-gray-800 ml-2">{fixture.homeScore ?? '-'}</span>
                                    </div>

                                    {/* Away Team */}
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center space-x-2 flex-1 min-w-0">
                                            <div className="w-8 h-8 bg-gray-200 rounded-full flex-shrink-0"></div>
                                            <span className="text-sm font-bold text-gray-900 truncate">{fixture.awayTeam}</span>
                                        </div>
                                        <span className="text-2xl font-bold font-mono text-gray-800 ml-2">{fixture.awayScore ?? '-'}</span>
                                    </div>
                                </div>

                                {/* Time & Broadcast */}
                                <div className="flex items-center justify-between mt-3 pt-3 border-t border-gray-100">
                                    <div className="flex items-center text-xs text-gray-500">
                                        <Clock className="h-3 w-3 mr-1" />
                                        <span className="font-semibold">{fixture.time} SAST</span>
                                    </div>
                                    <div className="flex items-center text-xs text-gray-400">
                                        <Tv className="h-3 w-3 mr-1" />
                                        <span>SS PSL</span>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            )}
        </div>
    );
};
