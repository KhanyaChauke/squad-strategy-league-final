import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Calendar, ExternalLink, ChevronRight, Newspaper, RefreshCw, AlertCircle } from 'lucide-react';
import { NewsApiSetup } from './NewsApiSetup';
import { fetchPSLNews, getStoredNewsApiKey, removeStoredNewsApiKey, NewsArticle } from '@/services/newsService';
import { Alert, AlertDescription } from '@/components/ui/alert';

const MOCK_NEWS: NewsArticle[] = [
    {
        id: '1',
        title: 'Chiefs Secure Last-Minute Winner in Soweto Derby',
        summary: 'Amakhosi fans erupted in joy as a stoppage-time goal sealed a dramatic victory over their arch-rivals Orlando Pirates at a sold-out FNB Stadium.',
        date: '2 hours ago',
        source: 'Soccer Laduma',
        imageUrl: 'https://images.unsplash.com/photo-1556056504-5c7696c4c28d?auto=format&fit=crop&q=80&w=800',
        tag: 'Match Report',
        tagColor: 'bg-yellow-500',
        url: '#'
    },
    {
        id: '2',
        title: 'Sundowns Announce Record-Breaking Signing',
        summary: 'The Brazilians have once again flexed their financial muscle, bringing in a top South American talent to bolster their CAF Champions League ambitions.',
        date: '5 hours ago',
        source: 'KickOff',
        imageUrl: 'https://images.unsplash.com/photo-1522778119026-d647f0565c6a?auto=format&fit=crop&q=80&w=800',
        tag: 'Transfer News',
        tagColor: 'bg-blue-500',
        url: '#'
    },
    {
        id: '3',
        title: 'PSL Title Race Heats Up: Top 4 Analysis',
        summary: 'With only 10 games remaining, we take a deep dive into the statistics and remaining fixtures for the teams vying for the league title.',
        date: '1 day ago',
        source: 'SuperSport',
        imageUrl: 'https://images.unsplash.com/photo-1431324155629-1a6deb1dec8d?auto=format&fit=crop&q=80&w=800',
        tag: 'Analysis',
        tagColor: 'bg-green-500',
        url: '#'
    },
    {
        id: '4',
        title: 'Bafana Bafana Squad Announced for AFCON Qualifiers',
        summary: 'Coach Hugo Broos has named his 23-man squad for the upcoming crucial qualifiers, with a few surprise inclusions and notable omissions.',
        date: '2 days ago',
        source: 'SAFA.net',
        imageUrl: 'https://images.unsplash.com/photo-1579952363873-27f3bade9f55?auto=format&fit=crop&q=80&w=800',
        tag: 'International',
        tagColor: 'bg-yellow-600',
        url: '#'
    },
    {
        id: '5',
        title: 'Cape Town City Unveil New Home Kit',
        summary: 'The Citizens have dropped their latest home jersey for the upcoming season, featuring a bold new design inspired by Table Mountain.',
        date: '3 days ago',
        source: 'iDiski Times',
        imageUrl: 'https://images.unsplash.com/photo-1517927033932-b3d18e61fb3a?auto=format&fit=crop&q=80&w=800',
        tag: 'Kit Launch',
        tagColor: 'bg-blue-600',
        url: '#'
    }
];

export const NewsView = () => {
    const [news, setNews] = useState<NewsArticle[]>(MOCK_NEWS);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [hasApiKey, setHasApiKey] = useState(!!getStoredNewsApiKey());
    const [showSetup, setShowSetup] = useState(!getStoredNewsApiKey());

    const loadNews = async () => {
        const apiKey = getStoredNewsApiKey();
        if (!apiKey) {
            setNews(MOCK_NEWS);
            return;
        }

        setLoading(true);
        setError(null);
        try {
            const articles = await fetchPSLNews(apiKey);
            setNews(articles);
        } catch (err) {
            console.error(err);
            setError('Failed to fetch latest news. Showing cached stories.');
            setNews(MOCK_NEWS);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (hasApiKey) {
            loadNews();
        }
    }, [hasApiKey]);

    const handleConnect = () => {
        setHasApiKey(true);
        setShowSetup(false);
        loadNews();
    };

    const handleDisconnect = () => {
        removeStoredNewsApiKey();
        setHasApiKey(false);
        setShowSetup(true);
        setNews(MOCK_NEWS);
    };

    return (
        <div className="space-y-6 animate-fade-in">
            <div className="flex justify-between items-center">
                <div>
                    <h2 className="text-3xl font-bold text-gray-800">Latest News</h2>
                    <p className="text-gray-500">Stay updated with the latest from the PSL and South African football.</p>
                </div>
                <div className="flex gap-2">
                    {hasApiKey && (
                        <Button variant="outline" onClick={loadNews} disabled={loading}>
                            <RefreshCw className={`mr-2 h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
                            Refresh
                        </Button>
                    )}
                    <Button variant="outline" className="hidden md:flex" onClick={() => setShowSetup(!showSetup)}>
                        <Newspaper className="mr-2 h-4 w-4" />
                        {showSetup ? 'Hide Setup' : 'API Setup'}
                    </Button>
                </div>
            </div>

            {showSetup && <NewsApiSetup onConnect={handleConnect} />}

            {error && (
                <Alert variant="destructive">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>{error}</AlertDescription>
                </Alert>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* News Feed - Full width now */}
                <div className="lg:col-span-3 space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {news.map((item) => (
                            <Card key={item.id} className="group overflow-hidden hover:shadow-xl transition-all duration-300 border-gray-200 flex flex-col h-full">
                                <div className="relative h-48 overflow-hidden shrink-0">
                                    <div className="absolute top-3 left-3 z-10">
                                        <Badge className={`${item.tagColor} text-white border-none shadow-sm`}>
                                            {item.tag}
                                        </Badge>
                                    </div>
                                    <img
                                        src={item.imageUrl}
                                        alt={item.title}
                                        className="w-full h-full object-cover transform group-hover:scale-110 transition-transform duration-500"
                                        onError={(e) => {
                                            (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1522778119026-d647f0565c6a?auto=format&fit=crop&q=80&w=800';
                                        }}
                                    />
                                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                                </div>

                                <CardHeader className="pb-2">
                                    <div className="flex justify-between items-center text-xs text-gray-500 mb-2">
                                        <span className="flex items-center">
                                            <Calendar className="h-3 w-3 mr-1" />
                                            {item.date}
                                        </span>
                                        <span className="font-medium text-green-600 truncate max-w-[120px]">{item.source}</span>
                                    </div>
                                    <CardTitle className="text-xl leading-tight group-hover:text-green-700 transition-colors line-clamp-2">
                                        {item.title}
                                    </CardTitle>
                                </CardHeader>

                                <CardContent className="flex-grow">
                                    <CardDescription className="line-clamp-3 text-gray-600">
                                        {item.summary}
                                    </CardDescription>
                                </CardContent>

                                <CardFooter className="pt-0 mt-auto">
                                    <Button
                                        variant="ghost"
                                        className="w-full justify-between hover:text-green-700 hover:bg-green-50 group-hover:translate-x-1 transition-all"
                                        asChild
                                    >
                                        <a href={item.url} target="_blank" rel="noopener noreferrer">
                                            Read Full Story
                                            <ChevronRight className="h-4 w-4 ml-2" />
                                        </a>
                                    </Button>
                                </CardFooter>
                            </Card>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};
