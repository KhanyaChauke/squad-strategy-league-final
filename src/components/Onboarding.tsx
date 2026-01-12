import React, { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Trophy, Check, ArrowRight } from 'lucide-react';
import { teamKits, getTeamKit } from '@/data/teamKits';

interface OnboardingProps {
    onComplete: () => void;
}

export const Onboarding: React.FC<OnboardingProps> = ({ onComplete }) => {
    const [step, setStep] = useState<'welcome' | 'team-selection'>('welcome');
    const [selectedTeam, setSelectedTeam] = useState<string | null>(null);

    // Get list of teams from the teamkits data
    // We filter out any potential placeholders if necessary, but teamKits usually has real teams
    const teams = Object.values(teamKits).map(k => k.teamName).sort();

    const handleContinue = () => {
        setStep('team-selection');
    };

    const handleTeamSelect = (teamName: string) => {
        setSelectedTeam(teamName);
    };

    const handleFinish = () => {
        if (selectedTeam) {
            localStorage.setItem('userFavouriteTeam', selectedTeam);
            localStorage.setItem('hasOnboarded', 'true');
            // We can also fire a custom event if we want other components to react immediately
            window.dispatchEvent(new Event('onboarding-complete'));
            onComplete();
        }
    };

    if (step === 'welcome') {
        return (
            <div className="fixed inset-0 z-50 bg-gradient-to-br from-green-900 via-green-800 to-black text-white flex flex-col items-center justify-center p-6 animate-in fade-in duration-500">
                <div className="max-w-md w-full text-center space-y-8">
                    <div className="flex justify-center mb-8">
                        <div className="bg-white/10 p-6 rounded-full ring-4 ring-yellow-500/50 shadow-2xl">
                            <Trophy className="h-20 w-20 text-yellow-400" />
                        </div>
                    </div>

                    <div className="space-y-4">
                        <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight bg-gradient-to-r from-yellow-400 to-yellow-200 bg-clip-text text-transparent transform transition-all hover:scale-105">
                            Sawubona!
                        </h1>
                        <p className="text-2xl font-bold text-white">
                            Welcome to Touchline SA
                        </p>
                        <p className="text-lg text-gray-300 leading-relaxed">
                            Experience the thrill of the <span className="text-yellow-400 font-bold">Betway Premiership</span> like never before.
                            Build your legacy in South Africa's premier fantasy league.
                        </p>
                    </div>

                    <div className="pt-8">
                        <Button
                            onClick={handleContinue}
                            size="lg"
                            className="w-full text-xl py-8 bg-yellow-500 hover:bg-yellow-400 text-green-900 font-bold shadow-lg hover:shadow-xl transition-all transform hover:-translate-y-1 rounded-xl"
                        >
                            Get Started <ArrowRight className="ml-2 h-6 w-6" />
                        </Button>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="fixed inset-0 z-50 bg-gray-50 flex flex-col animate-in slide-in-from-right duration-500">
            {/* Header */}
            <div className="bg-white shadow-sm p-6 text-center border-b">
                <h2 className="text-2xl font-bold text-gray-900">Which team do you support?</h2>
                <p className="text-gray-500">Select your favourite Betway Premiership club</p>
            </div>

            {/* Grid */}
            <div className="flex-1 overflow-y-auto p-6">
                <div className="max-w-4xl mx-auto grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                    {teams.map((team) => {
                        const kit = getTeamKit(team);
                        const isSelected = selectedTeam === team;

                        return (
                            <Card
                                key={team}
                                onClick={() => handleTeamSelect(team)}
                                className={`cursor-pointer transition-all duration-200 transform hover:shadow-md border-2 
                                    ${isSelected
                                        ? 'border-green-600 bg-green-50 scale-105 ring-2 ring-green-600 ring-offset-2'
                                        : 'border-transparent hover:border-green-200 hover:-translate-y-1'
                                    }`}
                            >
                                <CardContent className="p-4 flex flex-col items-center justify-center space-y-3 min-h-[160px]">
                                    <div className="relative">
                                        {kit?.logo || kit?.homeKit ? (
                                            <img
                                                src={kit?.logo || kit?.homeKit}
                                                alt={team}
                                                className="h-20 w-20 object-contain drop-shadow-md"
                                                onError={(e) => {
                                                    (e.target as HTMLImageElement).style.display = 'none';
                                                }}
                                            />
                                        ) : (
                                            <div className="h-20 w-20 bg-gray-200 rounded-full flex items-center justify-center">
                                                <span className="text-2xl font-bold text-gray-400">{team.substring(0, 1)}</span>
                                            </div>
                                        )}
                                        {isSelected && (
                                            <div className="absolute -top-2 -right-2 bg-green-600 text-white rounded-full p-1 shadow-sm">
                                                <Check className="h-4 w-4" />
                                            </div>
                                        )}
                                    </div>
                                    <span className={`font-bold text-center text-sm ${isSelected ? 'text-green-700' : 'text-gray-700'}`}>
                                        {team}
                                    </span>
                                </CardContent>
                            </Card>
                        );
                    })}
                </div>
            </div>

            {/* Footer */}
            <div className="bg-white p-6 border-t shadow-lg">
                <div className="max-w-md mx-auto">
                    <Button
                        onClick={handleFinish}
                        disabled={!selectedTeam}
                        className={`w-full py-6 text-lg font-bold transition-all ${selectedTeam ? 'bg-green-600 hover:bg-green-700 text-white shadow-md' : 'bg-gray-200 text-gray-400'}`}
                    >
                        Continue
                    </Button>
                </div>
            </div>
        </div>
    );
};
