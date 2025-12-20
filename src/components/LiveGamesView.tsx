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

    const loadFixtures = async () => {
        setIsLoading(true);
        setError(null);
        try {
            const data = await fetchFixtures();
            setFixtures(data);
            if (data.length === 0) {
                // If API returns nothing (common in off-season/no games today), 
                // we could show a message.
            }
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
            case 'In Progress': return 'bg-green-500 hover:bg-green-600 animate-pulse';
            case 'Finished': return 'bg-gray-500 hover:bg-gray-600';
            case 'Postponed': return 'bg-red-500 hover:bg-red-600';
            default: return 'bg-blue-500 hover:bg-blue-600';
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-3xl font-bold text-gray-900">Live Games</h2>
                    <p className="text-gray-600">Follow today's live PSL action</p>
                </div>
                <div className="flex items-center space-x-2 text-sm text-gray-500">
                    <Calendar className="h-4 w-4" />
                    <span>{new Date().toLocaleDateString('en-ZA', { weekday: 'long', day: 'numeric', month: 'long' })}</span>
                </div>
            </div>

            {isLoading ? (
                <div className="text-center py-12">
                    <div className="animate-spin h-8 w-8 border-4 border-blue-500 border-t-transparent rounded-full mx-auto mb-4"></div>
                    <p className="text-gray-500">Loading fixtures...</p>
                </div>
            ) : error ? (
                <div className="text-center py-12 bg-red-50 rounded-lg">
                    <p className="text-red-600 mb-4">{error}</p>
                    <Button onClick={loadFixtures} variant="outline" className="border-red-200 hover:bg-red-100">
                        <RefreshCw className="mr-2 h-4 w-4" /> Try Again
                    </Button>
                </div>
            ) : fixtures.length === 0 ? (
                <div className="text-center py-12 bg-gray-50 rounded-lg border border-dashed border-gray-300">
                    <Trophy className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                    <h3 className="text-lg font-medium text-gray-900">No Matches Today</h3>
                    <p className="text-gray-500">Check back later for live PSL fixtures.</p>
                </div>
            ) : (
                <div className="grid gap-6">
                    {fixtures.map((fixture) => (
                        <Card key={fixture.fixtureId} className="overflow-hidden hover:shadow-md transition-shadow">
                            <CardContent className="p-0">
                                <div className="grid grid-cols-1 md:grid-cols-12">

                                    {/* Status/Time Strip */}
                                    <div className="col-span-12 md:col-span-2 bg-gray-50 p-4 flex flex-row md:flex-col items-center justify-between md:justify-center border-b md:border-b-0 md:border-r">
                                        <div className="flex flex-col items-center">
                                            <Badge className={`${getStatusColor(fixture.status)} mb-2`}>
                                                {fixture.status}
                                            </Badge>
                                            <span className="text-xl font-bold text-gray-700">{fixture.time}</span>
                                        </div>
                                        <div className="md:mt-4 text-xs text-gray-400 flex items-center">
                                            <Tv className="h-3 w-3 mr-1" />
                                            <span>SS PSL</span>
                                        </div>
                                    </div>

                                    {/* Teams & Scores */}
                                    <div className="col-span-12 md:col-span-10 p-6">
                                        <div className="text-xs text-blue-600 font-bold uppercase tracking-wider mb-4 flex items-center">
                                            <Trophy className="h-3 w-3 mr-1" />
                                            {fixture.league}
                                        </div>

                                        <div className="flex items-center justify-between">
                                            {/* Home Team */}
                                            <div className="flex-1 flex flex-col md:flex-row items-center md:justify-end text-center md:text-right space-y-2 md:space-y-0 md:space-x-4">
                                                <span className="text-lg md:text-xl font-bold text-gray-900">{fixture.homeTeam}</span>
                                                <div className="w-12 h-12 bg-gray-200 rounded-full flex-shrink-0"></div> {/* Logo Placeholder */}
                                            </div>

                                            {/* Score Board */}
                                            <div className="px-6 flex flex-col items-center">
                                                <div className="text-3xl md:text-4xl font-bold font-mono text-gray-800 bg-gray-100 px-4 py-2 rounded-lg tracking-widest">
                                                    {fixture.homeScore ?? '-'} : {fixture.awayScore ?? '-'}
                                                </div>
                                            </div>

                                            {/* Away Team */}
                                            <div className="flex-1 flex flex-col-reverse md:flex-row items-center md:justify-start text-center md:text-left space-y-2 md:space-y-0 md:space-x-4">
                                                <div className="w-12 h-12 bg-gray-200 rounded-full flex-shrink-0 md:mr-4"></div> {/* Logo Placeholder */}
                                                <span className="text-lg md:text-xl font-bold text-gray-900">{fixture.awayTeam}</span>
                                            </div>
                                        </div>
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
