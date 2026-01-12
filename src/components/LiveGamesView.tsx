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

    // Helper to get static logos for PSL teams if API doesn't provide them
    const getTeamLogo = (teamName: string): string | undefined => {
        const t = teamName.toLowerCase();
        let logoUrl: string | undefined;

        // Specific logos for user request
        if (t.includes('orbit')) logoUrl = 'https://upload.wikimedia.org/wikipedia/en/2/23/Orbit_College_FC_logo.png';
        else if (t.includes('siwelele') || t.includes('celtic')) logoUrl = 'https://a.espncdn.com/combiner/i?img=/i/teamlogos/soccer/500/2322.png&h=200&w=200'; // Celtic identity
        // PSL Standard
        else if (t.includes('sundowns')) logoUrl = 'https://a.espncdn.com/combiner/i?img=/i/teamlogos/soccer/500/2324.png&h=200&w=200';
        else if (t.includes('pirates')) logoUrl = 'https://a.espncdn.com/combiner/i?img=/i/teamlogos/soccer/500/2327.png&h=200&w=200';
        else if (t.includes('chiefs')) logoUrl = 'https://a.espncdn.com/combiner/i?img=/i/teamlogos/soccer/500/2323.png&h=200&w=200';
        else if (t.includes('stellenbosch')) logoUrl = 'https://a.espncdn.com/combiner/i?img=/i/teamlogos/soccer/500/18804.png&h=200&w=200';
        else if (t.includes('city') && t.includes('cape')) logoUrl = 'https://a.espncdn.com/combiner/i?img=/i/teamlogos/soccer/500/17724.png&h=200&w=200';
        else if (t.includes('supersport')) logoUrl = 'https://a.espncdn.com/combiner/i?img=/i/teamlogos/soccer/500/2627.png&h=200&w=200';
        else if (t.includes('amazulu')) logoUrl = 'https://a.espncdn.com/combiner/i?img=/i/teamlogos/soccer/500/2326.png&h=200&w=200';
        else if (t.includes('arrows')) logoUrl = 'https://a.espncdn.com/combiner/i?img=/i/teamlogos/soccer/500/4556.png&h=200&w=200';
        else if (t.includes('galaxy')) logoUrl = 'https://a.espncdn.com/combiner/i?img=/i/teamlogos/soccer/500/19864.png&h=200&w=200';
        else if (t.includes('sekhukhune')) logoUrl = 'https://a.espncdn.com/combiner/i?img=/i/teamlogos/soccer/500/20348.png&h=200&w=200';
        else if (t.includes('chippa')) logoUrl = 'https://a.espncdn.com/combiner/i?img=/i/teamlogos/soccer/500/13735.png&h=200&w=200';
        else if (t.includes('richards')) logoUrl = 'https://a.espncdn.com/combiner/i?img=/i/teamlogos/soccer/500/20347.png&h=200&w=200';
        else if (t.includes('polokwane')) logoUrl = 'https://a.espncdn.com/combiner/i?img=/i/teamlogos/soccer/500/14107.png&h=200&w=200';
        else if (t.includes('royal')) logoUrl = 'https://a.espncdn.com/combiner/i?img=/i/teamlogos/soccer/500/20346.png&h=200&w=200';
        else if (t.includes('gallants') || t.includes('marumo')) logoUrl = 'https://a.espncdn.com/combiner/i?img=/i/teamlogos/soccer/500/20349.png&h=200&w=200';

        // console.log(`GetLogo for ${teamName}: ${logoUrl}`);
        return logoUrl;
    };

    // New component to handle image errors robustly
    // New component to handle image errors robustly
    const TeamLogo = ({ name, url }: { name: string, url?: string }) => {
        const [imgError, setImgError] = useState(false);
        const effectiveUrl = url || getTeamLogo(name);

        if (effectiveUrl && !imgError) {
            return (
                <img
                    src={effectiveUrl}
                    alt={name}
                    className="w-8 h-8 rounded-full object-contain bg-white shadow-sm p-0.5"
                    onError={(e) => {
                        console.warn(`Failed to load logo for ${name}: ${effectiveUrl}`);
                        setImgError(true);
                    }}
                    referrerPolicy="no-referrer"
                />
            );
        }

        // Fallback: Colorful Initials
        const initials = name.substring(0, 2).toUpperCase();
        // Simple hash for consistent color
        const hash = name.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
        const colors = ['bg-blue-500', 'bg-green-500', 'bg-red-500', 'bg-yellow-500', 'bg-purple-500', 'bg-indigo-500', 'bg-orange-500', 'bg-pink-500'];
        const colorClass = colors[hash % colors.length];

        return (
            <div className={`w-8 h-8 ${colorClass} rounded-full flex items-center justify-center font-bold text-white text-[10px] shadow-sm border border-white`}>
                {initials}
            </div>
        );
    };

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
                            <div className="flex flex-col gap-4">
                                {dateFixtures.map(fixture => (
                                    <Card key={fixture.fixtureId} className="overflow-hidden hover:shadow-md transition-shadow">
                                        <CardContent className="p-3">
                                            <div className="flex items-center justify-between">

                                                {/* Home Team (Left) */}
                                                <div className="flex items-center justify-end flex-1 space-x-3 text-right">
                                                    <span className="text-sm font-bold text-gray-900 hidden sm:block truncate">{fixture.homeTeam}</span>
                                                    <span className="text-xs font-bold text-gray-900 sm:hidden truncate max-w-[80px]">{fixture.homeTeam.substring(0, 3).toUpperCase()}</span>
                                                    <TeamLogo name={fixture.homeTeam} url={fixture.homeLogo} />
                                                </div>

                                                {/* Center Status/Score/VS */}
                                                <div className="flex flex-col items-center justify-center w-24 px-1 mx-2 bg-gray-50 rounded py-1">
                                                    {fixture.status === 'Not Started' ? (
                                                        <>
                                                            <div className="text-xs font-black text-gray-400 mb-0.5">VS</div>
                                                            <div className="text-[10px] text-gray-500 font-mono">{fixture.time}</div>
                                                            {(fixture as any).venue && (
                                                                <div className="text-[8px] text-gray-400 text-center truncate w-32 mt-0.5 leading-tight">
                                                                    {(fixture as any).venue}
                                                                </div>
                                                            )}
                                                        </>
                                                    ) : (
                                                        <>
                                                            <div className="flex items-center space-x-1 font-mono font-black text-lg text-gray-800">
                                                                <span>{fixture.homeScore ?? 0}</span>
                                                                <span className="text-gray-400 text-xs">-</span>
                                                                <span>{fixture.awayScore ?? 0}</span>
                                                            </div>
                                                            <Badge variant="outline" className={`${getStatusColor(fixture.status)} text-[8px] h-4 px-1 py-0`}>
                                                                {fixture.status === 'In Progress' ? 'LIVE' : 'FT'}
                                                            </Badge>
                                                        </>
                                                    )}
                                                </div>

                                                {/* Away Team (Right) */}
                                                <div className="flex items-center justify-start flex-1 space-x-3 text-left">
                                                    <TeamLogo name={fixture.awayTeam} url={fixture.awayLogo} />
                                                    <span className="text-sm font-bold text-gray-900 hidden sm:block truncate">{fixture.awayTeam}</span>
                                                    <span className="text-xs font-bold text-gray-900 sm:hidden truncate max-w-[80px]">{fixture.awayTeam.substring(0, 3).toUpperCase()}</span>
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
