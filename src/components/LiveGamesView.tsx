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

    // Check relevance tier (1 = High/SA, 2 = Medium/Major Intl, 3 = Low/Other)
    const getRelevanceTier = (fixture: Fixture): number => {
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

        const pslLeagues = [
            'premier soccer league', 'psl', 'south africa premier',
            'dstv premiership', 'premiership', 'betway premiership'
        ];

        const majorLeagues = [
            'premier league', 'laliga', 'bundesliga', 'serie a', 'ligue 1',
            'champions league', 'europa league', 'fa cup', 'carabao cup'
        ];

        const homeTeam = fixture.homeTeam.toLowerCase();
        const awayTeam = fixture.awayTeam.toLowerCase();
        const league = fixture.league.toLowerCase();

        console.log(`Checking Relevance: ${homeTeam} vs ${awayTeam} (${league})`);

        // Tier 1: South African context
        if (pslLeagues.some(l => league.includes(l))) return 1;
        if (league.includes('afcon') || league.includes('africa cup')) return 1;
        if (saTeams.some(team => homeTeam.includes(team) || awayTeam.includes(team))) return 1;

        // Tier 2: Major European Leagues
        if (majorLeagues.some(l => league.includes(l))) return 2;

        // Tier 3: Everything else
        return 3;
    };

    const loadFixtures = async () => {
        setIsLoading(true);
        setError(null);

        // 1. Immediate Load: Use static Game Week fixtures so screen is never empty
        const { pslFixtures } = await import('@/data/pslFixtures');
        const staticFixtures = pslFixtures.map(f => ({
            fixtureId: f.id,
            league: 'Betway Premiership',
            homeTeam: f.homeTeam,
            awayTeam: f.awayTeam,
            homeScore: null,
            awayScore: null,
            status: f.status === 'Scheduled' ? 'Not Started' : 'Finished',
            time: f.time,
            date: f.date,
            tier: 1 // Always relevant
        })) as unknown as (Fixture & { tier: number })[];

        // Start with static data to avoid blank screen
        setFixtures(staticFixtures.map(f => ({ ...f, time: convertToSATime(f.time) })));

        try {
            // 2. Background Sync: Try to get fresh live data
            const data = await fetchFixtures();

            // Sort and filter: Include Tier 1 first, then Tier 2 if needed to fill up to 5
            const tieredFixtures = data.map(f => ({ ...f, tier: getRelevanceTier(f) }));

            // We display all fixtures available, sorted by relevance and status
            let relevantFixtures = tieredFixtures;

            // Sort by Date (Descending/Newest first usually, but for fixtures Upcoming first?), Tier, then Time
            relevantFixtures.sort((a, b) => {
                if (a.date !== b.date) return b.date.localeCompare(a.date); // Newest dates first (e.g. today/upcoming)
                if (a.tier !== b.tier) return a.tier - b.tier;
                return a.time.localeCompare(b.time);
            });

            // Convert all times to SA time
            const fixturesWithSATime = relevantFixtures.map(fixture => ({
                ...fixture,
                time: convertToSATime(fixture.time)
            }));

            console.log("Fixtures Loaded into View:", fixturesWithSATime);

            // Only update if we actually found something relevant via API
            if (fixturesWithSATime.length > 0) {
                setFixtures(fixturesWithSATime);
            }
        } catch (err) {
            console.error(err);
            // Don't show error to user if we have static data showing successfully
            // setError(err instanceof Error ? err.message : "Failed to load live games.");
        } finally {
            setIsLoading(false);
        }
    };

    const groupFixturesByDate = (fixtures: Fixture[]) => {
        const groups: { [key: string]: Fixture[] } = {};

        fixtures.forEach(fixture => {
            let label = fixture.date || 'Upcoming';
            // Try to make label pretty
            try {
                const dateObj = new Date(fixture.date);
                const today = new Date();
                const yesterday = new Date();
                yesterday.setDate(yesterday.getDate() - 1);

                const dStr = dateObj.toISOString().split('T')[0];
                const tStr = today.toISOString().split('T')[0];
                const yStr = yesterday.toISOString().split('T')[0];

                if (dStr === tStr) label = "Today's Action";
                else if (dStr === yStr) label = "Yesterday's Results";
                else label = dateObj.toLocaleDateString('en-ZA', { weekday: 'short', day: 'numeric', month: 'short' });
            } catch (e) {
                // Keep original string if parse fails
            }

            if (!groups[label]) groups[label] = [];
            groups[label].push(fixture);
        });

        return groups;
    };

    const getStatusIndicator = () => {
        if (isLoading && fixtures.length === 0) return <Badge variant="outline" className="border-yellow-200 text-yellow-700 bg-yellow-50 animate-pulse">Syncing...</Badge>;
        if (error && fixtures.length === 0) return <Badge variant="destructive" className="animate-pulse">Offline / Error</Badge>;
        if (fixtures.length === 0) return <Badge variant="outline" className="border-orange-200 text-orange-700 bg-orange-50">No Matches</Badge>;
        return <Badge variant="outline" className="border-green-200 text-green-700 bg-green-50 flex gap-1 items-center"><div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" /> Live</Badge>;
    };

    useEffect(() => {
        loadFixtures();
    }, []);

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'In Progress': return 'bg-red-600 text-white animate-pulse font-bold tracking-widest';
            case 'Finished': return 'bg-gray-800 text-white font-semibold';
            case 'Postponed': return 'bg-orange-500 text-white font-semibold';
            case 'Not Started': return 'bg-blue-600 text-white font-semibold';
            default: return 'bg-gray-500 text-white font-semibold';
        }
    };

    const getStatusText = (status: string) => {
        switch (status) {
            case 'In Progress': return 'LIVE';
            case 'Finished': return 'Full Time';
            case 'Postponed': return 'Postponed';
            case 'Not Started': return 'Upcoming';
            default: return status;
        }
    };

    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-3">
                        Live Games {getStatusIndicator()}
                    </h2>
                    <p className="text-sm text-gray-600">Latest Action & Results (SAST)</p>
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
                <div className="space-y-6">
                    {Object.entries(groupFixturesByDate(fixtures)).map(([dateLabel, dateFixtures]) => (
                        <div key={dateLabel}>
                            <h3 className="text-sm font-bold text-gray-500 bg-gray-50 px-3 py-1 rounded inline-block mb-3 border border-gray-200">
                                {dateLabel}
                            </h3>
                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                                {dateFixtures.map((fixture) => (
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
                                                        {fixture.homeLogo ? (
                                                            <img src={fixture.homeLogo} alt={fixture.homeTeam} className="w-8 h-8 rounded-full flex-shrink-0 object-contain bg-white shadow-sm p-0.5" />
                                                        ) : (
                                                            <div className="w-8 h-8 bg-gray-200 rounded-full flex-shrink-0 flex items-center justify-center font-bold text-gray-500 text-xs shadow-inner">
                                                                {fixture.homeTeam.substring(0, 2)}
                                                            </div>
                                                        )}
                                                        <span className="text-sm font-bold text-gray-900 truncate">{fixture.homeTeam}</span>
                                                    </div>
                                                    <span className="text-2xl font-bold font-mono text-gray-800 ml-2">{fixture.homeScore ?? '-'}</span>
                                                </div>

                                                {/* Away Team */}
                                                <div className="flex items-center justify-between">
                                                    <div className="flex items-center space-x-2 flex-1 min-w-0">
                                                        {fixture.awayLogo ? (
                                                            <img src={fixture.awayLogo} alt={fixture.awayTeam} className="w-8 h-8 rounded-full flex-shrink-0 object-contain bg-white shadow-sm p-0.5" />
                                                        ) : (
                                                            <div className="w-8 h-8 bg-gray-200 rounded-full flex-shrink-0 flex items-center justify-center font-bold text-gray-500 text-xs shadow-inner">
                                                                {fixture.awayTeam.substring(0, 2)}
                                                            </div>
                                                        )}
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
                                                    <span>Live</span>
                                                </div>
                                            </div>
                                        </CardContent>
                                    </Card>
                                ))}
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};
