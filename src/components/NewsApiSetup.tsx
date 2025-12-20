
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Newspaper, ExternalLink, Key } from 'lucide-react';
import { setStoredNewsApiKey } from '@/services/newsService';
import { useToast } from '@/hooks/use-toast';

interface NewsApiSetupProps {
    onConnect: () => void;
}

export const NewsApiSetup = ({ onConnect }: NewsApiSetupProps) => {
    const [provider, setProvider] = useState<'newsapi' | 'rapidapi'>('newsapi');
    const [apiKey, setApiKey] = useState('');
    const [apiHost, setApiHost] = useState('free-livescore-api.p.rapidapi.com');
    const { toast } = useToast();

    const handleConnect = () => {
        const trimmedKey = apiKey.trim();
        const trimmedHost = apiHost.trim();

        if (provider === 'newsapi') {
            if (trimmedKey.includes('msh')) {
                toast({
                    title: "Invalid Key Type",
                    description: "This looks like a RapidAPI key. Please switch to the RapidAPI tab.",
                    variant: "destructive",
                });
                return;
            }
        }

        if (trimmedKey) {
            setStoredNewsApiKey(trimmedKey);
            if (provider === 'rapidapi') {
                localStorage.setItem('psl_news_api_host', trimmedHost);
                localStorage.setItem('psl_news_provider', 'rapidapi');
            } else {
                localStorage.setItem('psl_news_provider', 'newsapi');
            }

            toast({
                title: "API Key Saved",
                description: `Connected to ${provider === 'newsapi' ? 'NewsAPI.org' : 'RapidAPI'} successfully.`,
            });
            onConnect();
        }
    };

    return (
        <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-100 mb-6">
            <CardHeader>
                <CardTitle className="flex items-center gap-2 text-blue-800">
                    <Newspaper className="h-5 w-5" />
                    Configure News Source
                </CardTitle>
                <CardDescription className="text-blue-600">
                    Choose your news provider to get the latest PSL updates.
                </CardDescription>
            </CardHeader>
            <CardContent>
                <div className="space-y-4">
                    <div className="flex gap-4 border-b border-blue-200 pb-4">
                        <Button
                            variant={provider === 'newsapi' ? 'default' : 'ghost'}
                            onClick={() => setProvider('newsapi')}
                            className={provider === 'newsapi' ? 'bg-blue-600' : 'text-blue-700 hover:bg-blue-100'}
                        >
                            NewsAPI.org
                        </Button>
                        <Button
                            variant={provider === 'rapidapi' ? 'default' : 'ghost'}
                            onClick={() => setProvider('rapidapi')}
                            className={provider === 'rapidapi' ? 'bg-blue-600' : 'text-blue-700 hover:bg-blue-100'}
                        >
                            RapidAPI
                        </Button>
                    </div>

                    <div className="flex flex-col md:flex-row gap-4 items-end">
                        <div className="w-full space-y-4">
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-blue-900">API Key</label>
                                <div className="relative">
                                    <Key className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-400" />
                                    <Input
                                        type="password"
                                        placeholder={provider === 'newsapi' ? "Enter NewsAPI key" : "Enter RapidAPI key"}
                                        className="pl-9 bg-white"
                                        value={apiKey}
                                        onChange={(e) => setApiKey(e.target.value)}
                                    />
                                </div>
                            </div>

                            {provider === 'rapidapi' && (
                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-blue-900">API Host</label>
                                    <Input
                                        placeholder="e.g. free-livescore-api.p.rapidapi.com"
                                        className="bg-white"
                                        value={apiHost}
                                        onChange={(e) => setApiHost(e.target.value)}
                                    />
                                    <p className="text-xs text-blue-600">
                                        The host URL found in your RapidAPI dashboard (X-RapidAPI-Host).
                                    </p>
                                </div>
                            )}
                        </div>

                        <div className="flex gap-2 pb-0.5">
                            <Button onClick={handleConnect} disabled={!apiKey.trim()} className="bg-blue-600 hover:bg-blue-700 whitespace-nowrap">
                                Connect
                            </Button>
                        </div>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
};
