import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Fixture } from '@/services/newsService';
import { Tv } from 'lucide-react';

interface LiveFixtureCardProps {
    fixture: Fixture;
    variant?: 'default' | 'compact';
}

export const LiveFixtureCard = ({ fixture, variant = 'default' }: LiveFixtureCardProps) => {
    const getStatusText = (status: string) => {
        switch (status) {
            case 'In Progress': return 'LIVE';
            case 'Finished': return 'Full Time';
            case 'Postponed': return 'Postponed';
            case 'Not Started': return 'Upcoming';
            default: return status;
        }
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'In Progress': return 'bg-red-600 animate-pulse font-bold tracking-widest';
            case 'Finished': return 'bg-gray-800';
            case 'Postponed': return 'bg-orange-500';
            case 'Not Started': return 'bg-blue-600';
            default: return 'bg-gray-500';
        }
    };

    if (variant === 'compact') {
        return (
            <Card className="min-w-[200px] hover:shadow-md transition-shadow">
                <CardContent className="p-3">
                    <div className="flex justify-between items-center mb-2">
                        <Badge className={`${getStatusColor(fixture.status)} text-[10px] px-1 py-0 h-4`}>
                            {getStatusText(fixture.status)}
                        </Badge>
                        <span className="text-xs font-bold text-gray-500">{fixture.time}</span>
                    </div>
                    <div className="space-y-1">
                        <div className="flex justify-between items-center">
                            <span className="text-sm font-medium truncate max-w-[120px]">{fixture.homeTeam}</span>
                            <span className="font-bold">{fixture.homeScore ?? '-'}</span>
                        </div>
                        <div className="flex justify-between items-center">
                            <span className="text-sm font-medium truncate max-w-[120px]">{fixture.awayTeam}</span>
                            <span className="font-bold">{fixture.awayScore ?? '-'}</span>
                        </div>
                    </div>
                </CardContent>
            </Card>
        );
    }

    return (
        <Card className="overflow-hidden hover:shadow-md transition-shadow">
            <CardContent className="p-0">
                <div className="grid grid-cols-1 md:grid-cols-12">
                    {/* Status/Time Strip */}
                    <div className="col-span-12 md:col-span-2 bg-gray-50 p-4 flex flex-row md:flex-col items-center justify-between md:justify-center border-b md:border-b-0 md:border-r">
                        <div className="flex flex-col items-center">
                            <Badge className={`${getStatusColor(fixture.status)} mb-2 px-3 py-1 text-sm border-none shadow-md`}>
                                {getStatusText(fixture.status)}
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
                            <span className="mr-1">🏆</span>
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
    );
};
