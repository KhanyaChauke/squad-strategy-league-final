import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Calendar, ExternalLink, ChevronRight, Newspaper, RefreshCw, AlertCircle, Clock } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { syncNewsWithAPI, fetchPSLNews, NewsArticle } from '@/services/newsService';
import { Alert, AlertDescription } from '@/components/ui/alert';

const ADMIN_EMAILS = ['admin@psl.co.za', 'khanya@example.com', 'test@example.com']; // Valid admin emails

export const NewsView = () => {
    const { user } = useAuth();
    const isAdmin = user && (ADMIN_EMAILS.includes(user.email) || user.email.startsWith('admin'));
    const [news, setNews] = useState<NewsArticle[]>([]);
    const [loading, setLoading] = useState(true);
    const [isSyncing, setIsSyncing] = useState(false); // For admin sync
    const [error, setError] = useState<string | null>(null);
    const [activeCategory, setActiveCategory] = useState('All');

    const categories = ['All', 'Transfer', 'PSL Giants', 'National Team', 'Management'];

    const loadNews = async () => {
        setLoading(true);
        setError(null);
        try {
            const articles = await fetchPSLNews('');
            setNews(articles || []);
        } catch (err) {
            console.error(err);
            setError(err instanceof Error ? err.message : 'Failed to fetch latest news.');
            setNews([]);
        } finally {
            setLoading(false);
        }
    };

    const handleAdminSync = async () => {
        if (!isAdmin) return;
        setIsSyncing(true);
        try {
            // Force sync with API (passing empty key relying on env/stored)
            await syncNewsWithAPI('');
            // Reload to see changes
            await loadNews();
        } catch (err) {
            console.error("Admin sync failed:", err);
            setError("Admin Manual Sync Failed");
        } finally {
            setIsSyncing(false);
        }
    };

    const getStatusIndicator = () => {
        if (loading) return <Badge variant="outline" className="border-yellow-200 text-yellow-700 bg-yellow-50 animate-pulse">Connecting...</Badge>;
        if (error) return <Badge variant="destructive" className="animate-pulse">Offline / Error</Badge>;
        if (news.length === 0) return <Badge variant="outline" className="border-orange-200 text-orange-700 bg-orange-50">No News Found</Badge>;
        return <Badge variant="outline" className="border-green-200 text-green-700 bg-green-50 flex gap-1 items-center"><div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" /> Live</Badge>;
    };

    useEffect(() => {
        loadNews();
    }, []);

    const filteredNews = activeCategory === 'All'
        ? news
        : news.filter(item => item.tag === activeCategory);

    const featuredArticle = filteredNews[0];
    const otherArticles = filteredNews.slice(1);

    const formatTime = (item: NewsArticle) => {
        if (item.publishedAt && typeof item.publishedAt.toDate === 'function') {
            const date = item.publishedAt.toDate();
            const now = new Date();
            const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

            if (diffInSeconds < 60) return 'Just now';
            if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
            if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;
            return date.toLocaleDateString();
        }
        return item.date;
    };

    return (
        <div className="space-y-8 animate-fade-in pb-12">
            {/* Header Section */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white/50 p-6 rounded-2xl backdrop-blur-sm border border-gray-100 shadow-sm">
                <div>
                    <h2 className="text-4xl font-extrabold text-gray-900 tracking-tight flex items-center">
                        <Newspaper className="mr-3 h-8 w-8 text-green-600" />
                        Live News
                    </h2>
                    <p className="text-gray-500 mt-1 font-medium italic">Your daily digest of South African football</p>
                </div>
                <div className="flex gap-3 items-center">
                    {getStatusIndicator()}
                    <Button
                        variant="outline"
                        onClick={loadNews}
                        disabled={loading || isSyncing}
                        className="rounded-full px-6 hover:bg-green-50 hover:text-green-700 hover:border-green-200 transition-all border-gray-200"
                    >
                        <RefreshCw className={`mr-2 h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
                        Refresh
                    </Button>
                    {isAdmin && (
                        <Button
                            variant="destructive"
                            onClick={handleAdminSync}
                            disabled={isSyncing || loading}
                            className="rounded-full px-4 shadow-sm"
                        >
                            <RefreshCw className={`mr-2 h-4 w-4 ${isSyncing ? 'animate-spin' : ''}`} />
                            {isSyncing ? 'Syncing...' : 'Force Sync'}
                        </Button>
                    )}
                </div>
            </div>

            {/* Breaking News Ticker (if news exists) */}
            {news.length > 0 && (
                <div className="bg-green-600 text-white py-2 px-4 rounded-lg overflow-hidden flex items-center shadow-lg">
                    <Badge variant="secondary" className="bg-white text-green-700 mr-4 font-bold shrink-0 animate-pulse">BREAKING</Badge>
                    <div className="whitespace-nowrap animate-marquee font-medium">
                        {news.slice(0, 3).map((item, i) => (
                            <span key={item.id} className="mr-12 opacity-95">
                                • {item.title}
                            </span>
                        ))}
                    </div>
                </div>
            )}

            {/* Category Filter */}
            <div className="flex flex-wrap gap-2 py-2">
                {categories.map(category => (
                    <Button
                        key={category}
                        variant={activeCategory === category ? "default" : "outline"}
                        onClick={() => setActiveCategory(category)}
                        className={`rounded-full px-6 h-9 text-sm font-semibold transition-all ${activeCategory === category
                            ? 'bg-green-700 hover:bg-green-800 shadow-md'
                            : 'hover:bg-green-50 hover:text-green-700 border-gray-200'
                            }`}
                    >
                        {category}
                    </Button>
                ))}
            </div>

            {error && (
                <Alert variant="destructive" className="bg-red-50 border-red-200 text-red-800 rounded-xl">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription className="font-medium">{error}</AlertDescription>
                </Alert>
            )}

            {loading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {[1, 2, 3, 4, 5, 6].map(i => (
                        <div key={i} className="h-[400px] bg-gray-100 animate-pulse rounded-2xl border border-gray-200" />
                    ))}
                </div>
            ) : filteredNews.length === 0 ? (
                <div className="text-center py-20 bg-gray-50/50 rounded-3xl border-2 border-dashed border-gray-200 flex flex-col items-center">
                    <div className="bg-white p-6 rounded-full shadow-sm mb-6">
                        <Newspaper className="h-16 w-16 text-gray-300" />
                    </div>
                    <h3 className="text-2xl font-bold text-gray-800 mb-2">No Stories Found</h3>
                    <p className="text-gray-500 max-w-md mx-auto px-4">We couldn't find any news in the {activeCategory} category right now. Check back shortly for updates!</p>
                </div>
            ) : (
                <div className="space-y-12">
                    {/* Featured Article */}
                    {activeCategory === 'All' && featuredArticle && (
                        <Card className="group overflow-hidden border-none shadow-2xl rounded-3xl bg-white">
                            <div className="grid grid-cols-1 lg:grid-cols-2">
                                <div className="relative h-64 lg:h-auto overflow-hidden">
                                    <div className="absolute top-6 left-6 z-20">
                                        <Badge className={`${featuredArticle.tagColor} text-white px-4 py-1.5 text-sm font-bold border-none shadow-lg ring-2 ring-white/20`}>
                                            Featured Result
                                        </Badge>
                                    </div>
                                    <img
                                        src={featuredArticle.imageUrl}
                                        alt={featuredArticle.title}
                                        className="absolute inset-0 w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-700"
                                    />
                                    <div className="absolute inset-0 bg-gradient-to-r from-black/60 via-black/20 to-transparent lg:block hidden" />
                                </div>
                                <div className="p-8 lg:p-12 flex flex-col justify-center bg-white">
                                    <div className="flex items-center gap-4 text-sm text-gray-500 mb-4">
                                        <span className="flex items-center bg-gray-100 px-3 py-1 rounded-full font-medium">
                                            <Calendar className="h-3.5 w-3.5 mr-2 text-green-600" />
                                            {formatTime(featuredArticle)}
                                        </span>
                                        <span className="font-bold text-green-700 uppercase tracking-widest text-[10px]">{featuredArticle.source}</span>
                                    </div>
                                    <h3 className="text-3xl lg:text-4xl font-extrabold text-gray-900 mb-6 leading-[1.15] group-hover:text-green-700 transition-colors">
                                        {featuredArticle.title}
                                    </h3>
                                    <p className="text-gray-600 text-lg mb-8 leading-relaxed line-clamp-3">
                                        {featuredArticle.summary}
                                    </p>
                                    <Button
                                        className="w-fit bg-green-700 hover:bg-green-800 text-white rounded-xl px-10 py-6 h-auto shadow-xl hover:shadow-green-200/50 transition-all font-bold text-lg"
                                        asChild
                                    >
                                        <a href={featuredArticle.url} target="_blank" rel="noopener noreferrer">
                                            Explore Story
                                            <ExternalLink className="ml-3 h-5 w-5" />
                                        </a>
                                    </Button>
                                </div>
                            </div>
                        </Card>
                    )}

                    {/* News Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {(activeCategory === 'All' ? otherArticles : filteredNews).map((item) => (
                            <Card key={item.id} className="group overflow-hidden hover:shadow-2xl transition-all duration-500 border-gray-100 flex flex-col h-full rounded-2xl bg-white shadow-sm ring-1 ring-gray-900/5">
                                <div className="relative h-56 overflow-hidden shrink-0">
                                    <div className="absolute top-4 left-4 z-10">
                                        <Badge className={`${item.tagColor} text-white font-bold border-none shadow-md backdrop-blur-sm px-3`}>
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
                                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end p-6">
                                        <span className="text-white font-bold flex items-center">
                                            Read More <ChevronRight className="ml-1 h-4 w-4" />
                                        </span>
                                    </div>
                                </div>

                                <CardHeader className="pb-3 pt-6">
                                    <div className="flex justify-between items-center text-[10px] font-bold uppercase tracking-wider text-gray-500 mb-3">
                                        <span className="flex items-center">
                                            <Clock className="h-3 w-3 mr-1.5 text-green-600" />
                                            {formatTime(item)}
                                        </span>
                                        <span className="text-green-700 bg-green-50 px-2 py-0.5 rounded">{item.source}</span>
                                    </div>
                                    <CardTitle className="text-xl leading-tight font-bold text-gray-900 group-hover:text-green-700 transition-colors line-clamp-2 min-h-[56px]">
                                        {item.title}
                                    </CardTitle>
                                </CardHeader>

                                <CardContent className="flex-grow pt-0">
                                    <CardDescription className="line-clamp-3 text-gray-600 text-sm leading-relaxed">
                                        {item.summary}
                                    </CardDescription>
                                </CardContent>

                                <CardFooter className="pt-4 pb-6 mt-auto">
                                    <Button
                                        variant="outline"
                                        className="w-full justify-between rounded-xl border-gray-200 font-semibold group-hover:border-green-200 group-hover:bg-green-50 group-hover:text-green-700 transition-all"
                                        asChild
                                    >
                                        <a href={item.url} target="_blank" rel="noopener noreferrer">
                                            View Details
                                            <ExternalLink className="h-4 w-4 opacity-0 group-hover:opacity-100 transition-opacity" />
                                        </a>
                                    </Button>
                                </CardFooter>
                            </Card>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
};
