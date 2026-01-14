import { db } from '@/integrations/firebase/client';
import { collection, getDocs, setDoc, doc, deleteDoc, query, orderBy, limit, Timestamp } from 'firebase/firestore';

export interface NewsArticle {
    id: string;
    title: string;
    summary: string;
    date: string;
    publishedAt?: any; // Firestore Timestamp
    source: string;
    imageUrl: string;
    tag: string;
    tagColor: string;
    url: string;
}

export const setStoredNewsApiKey = (key: string) => {
    localStorage.setItem('psl_user_api_key', key);
};

export const getStoredNewsApiKey = () => {
    return localStorage.getItem('psl_user_api_key');
};

const NEWS_API_ORG_KEY = "92c9846c875047eeac8fda27eeacb14d";
const HARDCODED_API_KEY = "1a5d324f62mshf82070b791b2f3ap10994fjsnd9dc8ed92749"; // Legacy RapidAPI key (LiveScore)
const API_FOOTBALL_KEY = "1a5d324f62mshf82070b791b2f3ap10994fjsnd9dc8ed92749";
const GNEWS_API_KEY = "46b746a39e92802f3adcc087019909cc";
const JINA_API_KEY = "jina_dbf46d3721184e1caf32abf59aca6abe1GfgenzyFdPyFlnA9c3ZT3bs3J-k";


const CACHE_KEY_NEWS = 'cached_psl_news_v2';
const CACHE_KEY_FIXTURES = 'cached_live_fixtures';
const CACHE_DURATION = 1000 * 60 * 60 * 24; // 24 hours

const saveToCache = (key: string, data: any) => {
    try {
        const cacheEntry = {
            timestamp: Date.now(),
            data: data
        };
        localStorage.setItem(key, JSON.stringify(cacheEntry));
    } catch (e) {
        console.warn('Failed to save to cache:', e);
    }
};

const getFromCache = (key: string): any | null => {
    try {
        const cached = localStorage.getItem(key);
        if (!cached) return null;

        const { timestamp, data } = JSON.parse(cached);
        if (Date.now() - timestamp > CACHE_DURATION) {
            console.log(`Cache for ${key} expired.`);
            return null;
        }
        return data;
    } catch (e) {
        console.warn('Failed to read from cache:', e);
        return null;
    }
};

export const fetchPSLNews = async (apiKey: string): Promise<NewsArticle[]> => {
    try {
        // 1. Try to fetch from Firestore first
        const newsRef = collection(db, 'news');
        const q = query(newsRef, orderBy('publishedAt', 'desc'), limit(20));
        const querySnapshot = await getDocs(q);

        const cachedNews = querySnapshot.docs.map(doc => ({
            ...doc.data(),
            id: doc.id
        })) as NewsArticle[];

        // 2. Decide if we need to sync with API
        const latestArticle = cachedNews[0];
        const lastSyncTime = latestArticle && (latestArticle as any).syncedAt
            ? (latestArticle as any).syncedAt.toMillis()
            : 0;

        const latestArticleTime = latestArticle && latestArticle.publishedAt
            ? latestArticle.publishedAt.toMillis()
            : 0;

        // Sync if:
        // 1. No news (empty)
        // 2. Last sync was > 12 hours ago (periodic update)
        // 3. The latest news we have is > 48 hours old (content is stale, regardless of when we last checked)
        const isSyncStale = Date.now() - lastSyncTime > (1000 * 60 * 60 * 12);
        const isContentStale = Date.now() - latestArticleTime > (1000 * 60 * 60 * 48);

        const shouldSync = true; // FORCE SYNC ENABLED TEMPORARILY


        if (shouldSync) {
            try {
                console.log(`Syncing news... (Empty: ${cachedNews.length === 0}, SyncStale: ${isSyncStale}, ContentStale: ${isContentStale})`);
                await syncNewsWithAPI(apiKey);

                // Re-fetch after sync
                const freshSnapshot = await getDocs(q);
                return freshSnapshot.docs.map(doc => ({
                    ...doc.data(),
                    id: doc.id
                })) as NewsArticle[];
            } catch (syncError) {
                console.warn("News sync failed, falling back to cached/stale data:", syncError);
                // Fallback to existing data if sync fails
                if (cachedNews.length > 0) {
                    return cachedNews;
                }
                throw syncError; // Only throw if we truly have nothing
            }
        }

        return cachedNews;
    } catch (e) {
        console.warn("Firestore fetch/sync failed, checking local cache...", e);
        const localCached = getFromCache(CACHE_KEY_NEWS);
        if (localCached) return localCached;

        // If we have no cache and an error occurred, propagate it
        throw new Error(e instanceof Error ? e.message : "Failed to connect to news service");
    }
};

const getOneWeekAgoDate = () => {
    const date = new Date();
    date.setDate(date.getDate() - 7);
    return date.toISOString().split('T')[0]; // YYYY-MM-DD
};

const getFallbackImage = (title: string): string => {
    const lowerTitle = title.toLowerCase();

    // Kaizer Chiefs (Yellow/Gold vibes)
    if (lowerTitle.includes('chiefs') || lowerTitle.includes('amakhosi') || lowerTitle.includes('naturena')) {
        return 'https://images.unsplash.com/photo-1560272564-c83b66b1ad12?auto=format&fit=crop&q=80&w=800';
    }
    // Orlando Pirates (Black/White/Dark vibes)
    if (lowerTitle.includes('pirates') || lowerTitle.includes('buccaneers')) {
        return 'https://images.unsplash.com/photo-1508098682722-e99c43a406b2?auto=format&fit=crop&q=80&w=800';
    }
    // Sundowns (Yellow/Blue/Bright)
    if (lowerTitle.includes('sundowns') || lowerTitle.includes('downs') || lowerTitle.includes('masandawana')) {
        return 'https://images.unsplash.com/photo-1614632537423-1e6c2e7e0aab?auto=format&fit=crop&q=80&w=800';
    }
    // National Team
    if (lowerTitle.includes('bafana')) {
        return 'https://images.unsplash.com/photo-1574629810360-7efbbe195018?auto=format&fit=crop&q=80&w=800';
    }
    // Transfers (Business/Writing/Jersey)
    if (lowerTitle.includes('transfer') || lowerTitle.includes('sign') || lowerTitle.includes('deal')) {
        return 'https://images.unsplash.com/photo-1551958219-acbc608c6377?auto=format&fit=crop&q=80&w=800';
    }

    // General Football variants to avoid monotony
    const generals = [
        'https://images.unsplash.com/photo-1522778119026-d647f0565c6a?auto=format&fit=crop&q=80&w=800',
        'https://images.unsplash.com/photo-1517466787929-bc90951d6dbd?auto=format&fit=crop&q=80&w=800',
        'https://images.unsplash.com/photo-1579952363873-27f3bade9f55?auto=format&fit=crop&q=80&w=800',
        'https://images.unsplash.com/photo-1431324155629-1a6deb1dec8d?auto=format&fit=crop&q=80&w=800'
    ];

    // Pick based on title length hash to be deterministic for same title
    const index = title.length % generals.length;
    return generals[index];
};

const clearNewsCollection = async () => {
    try {
        const newsRef = collection(db, 'news');
        const snapshot = await getDocs(newsRef);
        if (!snapshot.empty) {
            console.log(`Clearing ${snapshot.size} old news articles...`);
            const deletePromises = snapshot.docs.map(doc => deleteDoc(doc.ref));
            await Promise.all(deletePromises);
            console.log('Old news articles cleared.');
        }
    } catch (e) {
        console.error('Error clearing news collection:', e);
    }
};

export const syncNewsWithAPI = async (apiKey: string) => {
    console.log("Starting Aggregated News Sync (Cross-referencing multiple platforms)...");

    // 1. Clear old news ONCE at the start
    await clearNewsCollection();

    // 2. Define sources
    // We prioritize Jina (Deep Search) and NewsAPI (Mainstream) for cross-referencing
    const syncTasks = [];

    // Jina
    const jinaKey = (apiKey && apiKey.startsWith('jina_')) ? apiKey : JINA_API_KEY;
    if (jinaKey) {
        syncTasks.push(syncFromJina(jinaKey).then(success => ({ source: 'Jina', success })));
    }

    // NewsAPI
    const newsKey = (apiKey && !apiKey.startsWith('jina_')) ? apiKey : NEWS_API_ORG_KEY;
    if (newsKey) {
        syncTasks.push(syncFromNewsOrg(newsKey).then(success => ({ source: 'NewsAPI', success })));
    }

    // Execute in parallel to aggregate results
    const results = await Promise.all(syncTasks);
    const successCount = results.filter(r => r.success).length;

    console.log(`Sync completed. Successful sources: ${successCount}/${results.length}`);

    // 3. Fallback if everything failed
    if (successCount === 0) {
        console.log("All primary sources failed. Attempting GNews fallback...");
        await syncFromGNews(GNEWS_API_KEY);
    }
};



const syncFromGNews = async (apiKey: string): Promise<{ success: boolean; error?: string }> => {
    try {
        console.log("Fetching news from GNews...");
        // Search for specific SA football terms, with broader fallback tags
        const query = 'psl OR "kaizer chiefs" OR "orlando pirates" OR sundowns OR "bafana bafana" OR soccer OR football';
        const response = await fetch(`https://gnews.io/api/v4/search?q=${encodeURIComponent(query)}&lang=en&country=za&max=10&apikey=${apiKey}`);
        const data = await response.json();

        if (response.status !== 200) {
            return { success: false, error: data.errors?.[0] || `GNews Error ${response.status}` };
        }

        if (data.articles && Array.isArray(data.articles) && data.articles.length > 0) {
            // await clearNewsCollection(); // Removed for aggregation
            const syncTime = Timestamp.now();
            console.log(`Synced ${data.articles.length} articles from GNews`);

            for (const item of data.articles) {
                const title = item.title;
                const lowerTitle = title.toLowerCase();
                const description = item.description || '';
                let tag = 'Soccer';
                let tagColor = 'bg-blue-600';

                if (lowerTitle.includes('chiefs') || lowerTitle.includes('pirates') || lowerTitle.includes('sundowns')) {
                    tag = 'PSL Giants';
                    tagColor = 'bg-yellow-600';
                } else if (lowerTitle.includes('transfer') || lowerTitle.includes('sign')) {
                    tag = 'Transfer News';
                    tagColor = 'bg-purple-600';
                } else if (lowerTitle.includes('bafana')) {
                    tag = 'National Team';
                    tagColor = 'bg-green-600';
                }

                const docId = btoa(item.url).slice(0, 20);
                // Default to yesterday for undated items so they don't displace confirmed fresh news
                const publishedAt = item.publishedAt ? Timestamp.fromDate(new Date(item.publishedAt)) : Timestamp.fromMillis(Date.now() - 86400000);

                const newsData = {
                    title,
                    summary: description,
                    date: item.publishedAt ? formatRelativeTime(item.publishedAt) : 'Recent',
                    publishedAt,
                    syncedAt: syncTime,
                    source: item.source.name || 'GNews',
                    imageUrl: item.image || getFallbackImage(title),
                    tag,
                    tagColor,
                    url: item.url
                };

                await setDoc(doc(db, 'news', docId), newsData, { merge: true });
            }
            return { success: true };
        } else {
            return { success: false, error: "Invalid GNews response format" };
        }
    } catch (e) {
        return { success: false, error: e instanceof Error ? e.message : "GNews Network Error" };
    }
};

const syncFromJina = async (apiKey: string): Promise<boolean> => {
    try {
        console.log("Fetching news from Jina DeepSearch...");
        // More specific query to get STORIES, not landing pages - slightly broadened
        const query = '"Betway Premiership" OR "Kaizer Chiefs" OR "Orlando Pirates" OR "Mamelodi Sundowns" OR "PSL" news';

        const response = await fetch(`https://s.jina.ai/${encodeURIComponent(query)}`, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${apiKey}`,
                'Accept': 'application/json',
                'X-Retain-Images': 'none'
            }
        });

        if (!response.ok) {
            console.error(`Jina API Error: ${response.status}`);
            return false;
        }

        const responseData = await response.json();
        const articles = responseData.data || responseData;

        if (Array.isArray(articles) && articles.length > 0) {
            const syncTime = Timestamp.now();
            console.log(`Synced ${articles.length} articles from Jina`);

            let validArticlesCount = 0;

            for (const item of articles) {
                const title = item.title || 'Football News';
                const lowerTitle = title.toLowerCase();

                // Aggressive filtering of generic landing pages/meta titles
                if (lowerTitle.includes('live scores') && lowerTitle.includes('results')) continue;
                if (lowerTitle === 'soccer news' || lowerTitle === 'football news') continue;
                if (lowerTitle.includes('welcome to') && lowerTitle.includes('login')) continue;
                // Removed the < 4 words filter as "Chiefs win derby" is valid news (3 words)

                const description = item.description || item.content?.slice(0, 200) || 'Click to read more';

                let tag = 'Soccer';
                let tagColor = 'bg-blue-600';

                if (lowerTitle.includes('chiefs') || lowerTitle.includes('pirates') || lowerTitle.includes('sundowns')) {
                    tag = 'PSL Giants';
                    tagColor = 'bg-yellow-600';
                } else if (lowerTitle.includes('transfer') || lowerTitle.includes('sign')) {
                    tag = 'Transfer News';
                    tagColor = 'bg-purple-600';
                } else if (lowerTitle.includes('bafana')) {
                    tag = 'National Team';
                    tagColor = 'bg-green-600';
                }

                const docId = btoa(item.url || title).slice(0, 20);

                const rawDate = item.publishedTime || item.date || item.publishedAt;

                // Filter out news older than 14 days (relaxed from 7) to ensure we get *some* news during quiet periods
                if (rawDate) {
                    const dateObj = new Date(rawDate);
                    // Check if date is valid
                    if (!isNaN(dateObj.getTime())) {
                        const diffTime = Math.abs(Date.now() - dateObj.getTime());
                        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
                        if (diffDays > 14) continue;
                    }
                }

                const publishedAt = rawDate ? Timestamp.fromDate(new Date(rawDate)) : Timestamp.fromMillis(Date.now() - 86400000);
                const displayDate = rawDate ? formatRelativeTime(rawDate) : 'Recent';

                const newsData = {
                    title,
                    summary: description,
                    date: displayDate,
                    publishedAt,
                    syncedAt: syncTime,
                    source: 'Jina/Web',
                    imageUrl: item.image || item.imageUrl || item.thumbnail || getFallbackImage(title),
                    tag,
                    tagColor,
                    url: item.url || '#'
                };

                await setDoc(doc(db, 'news', docId), newsData, { merge: true });
                validArticlesCount++;
            }
            return validArticlesCount > 0;
        }
        return false;
    } catch (e) {
        console.error("Jina Sync failed:", e);
        return false;
    }
};

const syncFromNewsOrg = async (apiKey: string): Promise<boolean> => {
    try {
        // Use 'everything' endpoint to get older news (up to 2 weeks) if necessary to fill the quota
        // AND ensure we get enough relevant content.
        // Use 'everything' endpoint to get older news (up to 1 week)
        const fromDate = getOneWeekAgoDate();
        const query = '(soccer OR football OR psl OR "kaizer chiefs" OR "orlando pirates" OR sundowns OR "bafana bafana")';

        // We use 'everything' instead of 'top-headlines' to get a broader history
        const response = await fetch(`https://newsapi.org/v2/everything?q=${encodeURIComponent(query)}&from=${fromDate}&sortBy=publishedAt&language=en&apiKey=${apiKey}`);
        const data = await response.json();

        if (data.status === 'ok' && Array.isArray(data.articles) && data.articles.length > 0) {
            // await clearNewsCollection(); // Removed for aggregation
            const syncTime = Timestamp.now();
            console.log(`Synced ${data.articles.length} articles from NewsAPI.org (Everything)`);

            let savedCount = 0;

            for (const item of data.articles) {
                if (item.title === '[Removed]') continue;

                const title = item.title;
                const lowerTitle = title.toLowerCase();
                const description = (item.description || '').toLowerCase();
                const content = (item.content || '').toLowerCase();
                const combinedText = `${lowerTitle} ${description} ${content}`;

                // Strict Exclusion logic REMOVED to allow all content

                const summary = item.description || item.content || 'Click to read full story.';

                let tag = 'Soccer';
                let tagColor = 'bg-blue-600';

                if (lowerTitle.includes('chiefs') || lowerTitle.includes('pirates') || lowerTitle.includes('sundowns')) {
                    tag = 'PSL Giants';
                    tagColor = 'bg-yellow-600';
                } else if (lowerTitle.includes('transfer') || lowerTitle.includes('sign') || lowerTitle.includes('deal')) {
                    tag = 'Transfer News';
                    tagColor = 'bg-purple-600';
                } else if (lowerTitle.includes('bafana') || lowerTitle.includes('banyana')) {
                    tag = 'National Team';
                    tagColor = 'bg-green-600';
                }

                const docId = btoa(item.url).slice(0, 20);
                // Default to yesterday for undated items
                const publishedAt = item.publishedAt ? Timestamp.fromDate(new Date(item.publishedAt)) : Timestamp.fromMillis(Date.now() - 86400000);

                const newsData = {
                    title,
                    summary,
                    date: item.publishedAt ? formatRelativeTime(item.publishedAt) : 'Recent',
                    publishedAt,
                    syncedAt: syncTime,
                    source: item.source.name || 'NewsAPI',
                    imageUrl: item.urlToImage || getFallbackImage(title),
                    tag,
                    tagColor,
                    url: item.url
                };

                await setDoc(doc(db, 'news', docId), newsData, { merge: true });
                savedCount++;
            }
            return savedCount > 0;
        } else {
            console.error("NewsAPI Error:", data.message);
            return false;
        }
    } catch (e) {
        console.error("NewsAPI Sync failed:", e);
        return false;
    }
};

const syncFromRapidAPI = async (effectiveKey: string): Promise<{ success: boolean; error?: string }> => {
    const apiHost = 'livescore6.p.rapidapi.com';

    try {
        const response = await fetch(`https://${apiHost}/news/v3/list?countryCode=ZA&category=soccer`, {
            method: 'GET',
            headers: {
                'X-RapidAPI-Key': effectiveKey,
                'X-RapidAPI-Host': apiHost
            }
        });

        if (response.status !== 200) {
            return { success: false, error: `RapidAPI Error ${response.status}` };
        }

        const data = await response.json();

        if (data && data.topStories && Array.isArray(data.topStories) && data.topStories.length > 0) {
            // await clearNewsCollection(); // Removed for aggregation
            const syncTime = Timestamp.now();

            for (const item of data.topStories) {
                const title = item.title || 'South African News Update';
                const summary = item.description || 'Latest football development in South Africa.';

                let tag = 'Soccer';
                let tagColor = 'bg-blue-600';

                const lowerTitle = title.toLowerCase();
                if (lowerTitle.includes('transfer') || lowerTitle.includes('sign') || lowerTitle.includes('deal')) {
                    tag = 'Transfer';
                    tagColor = 'bg-purple-600';
                } else if (lowerTitle.includes('chiefs') || lowerTitle.includes('pirates') || lowerTitle.includes('sundowns')) {
                    tag = 'PSL Giants';
                    tagColor = 'bg-yellow-600';
                } else if (lowerTitle.includes('bafana') || lowerTitle.includes('banyana')) {
                    tag = 'National Team';
                    tagColor = 'bg-green-600';
                } else if (lowerTitle.includes('coach') || lowerTitle.includes('manager')) {
                    tag = 'Management';
                    tagColor = 'bg-red-600';
                }

                const docId = item.id ? String(item.id) : btoa(item.url || title).slice(0, 20);
                const publishedAt = item.published_at ? Timestamp.fromDate(new Date(item.published_at)) : Timestamp.now();

                const newsData = {
                    title,
                    summary,
                    date: item.published_at ? formatRelativeTime(item.published_at) : 'Just now',
                    publishedAt,
                    syncedAt: syncTime,
                    source: item.source || 'LiveScore',
                    imageUrl: item.mainMedia?.gallery?.[0]?.url || getFallbackImage(title),
                    tag,
                    tagColor,
                    url: item.url ? (item.url.startsWith('http') ? item.url : `https://www.livescore.com${item.url}`) : '#'
                };

                await setDoc(doc(db, 'news', docId), newsData, { merge: true });
            }
            console.log(`Successfully synced ${data.topStories.length} stories to Firebase.`);
            console.log(`Successfully synced ${data.topStories.length} stories to Firebase.`);
            return { success: true };
        }
        return { success: false, error: "RapidAPI format unexpected (no topStories)" };
    } catch (e) {
        return { success: false, error: e instanceof Error ? e.message : "RapidAPI Connection Error" };
    }
};

const formatRelativeTime = (dateString: string): string => {
    try {
        const date = new Date(dateString);
        const now = new Date();
        const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

        if (diffInSeconds < 60) return 'Just now';
        if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
        if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;
        if (diffInSeconds < 172800) return 'Yesterday';
        return date.toLocaleDateString();
    } catch {
        return 'Recently';
    }
};

export interface Fixture {
    fixtureId: string;
    league: string;
    homeTeam: string;
    awayTeam: string;
    homeScore: number | null;
    awayScore: number | null;
    status: 'Not Started' | 'In Progress' | 'Finished' | 'Postponed';
    time: string;
    date: string; // YYYY-MM-DD or readable date string
    syncedAt?: any;
    homeLogo?: string;
    awayLogo?: string;
}

export interface PSLStanding {
    rank: number;
    team: string;
    points: number;
    played: number;
    win: number;
    draw: number;
    loss: number;
    goalsFor: number;
    goalsAgainst: number;
    goalDifference: number;
}

export interface TopScorer {
    rank: number;
    player: string;
    team: string;
    goals: number;
    assists: number;
    played: number;
}

import { pslFixtures as staticFallbackFixtures } from '@/data/pslFixtures';

export const fetchFixtures = async (apiKey?: string): Promise<Fixture[]> => {
    try {
        const fixturesRef = collection(db, 'fixtures');
        const q = query(fixturesRef);
        const querySnapshot = await getDocs(q);

        const cachedFixtures = querySnapshot.docs.map(doc => ({
            ...doc.data(),
            fixtureId: doc.id
        })) as Fixture[];

        // Live data needs frequent sync (every 5 mins if possible, but let's do 10 mins for safety)
        const lastSync = cachedFixtures.length > 0 ? (cachedFixtures[0] as any).syncedAt?.toMillis() : 0;
        const shouldSync = Date.now() - lastSync > (1000 * 60 * 10);

        if (shouldSync) {
            console.log('Syncing fixtures... (Prioritizing API-Football)');
            await syncFixturesWithAPI(apiKey);
            const freshSnapshot = await getDocs(q);
            const freshData = freshSnapshot.docs.map(doc => ({
                ...doc.data(),
                fixtureId: doc.id
            })) as Fixture[];

            if (freshData.length > 0) return freshData;
        }

        if (cachedFixtures.length > 0) {
            // Check if we need to sync OLDER fixtures/results because we don't have enough
            // We want at least 5 relevant fixtures.
            const totalRelevant = cachedFixtures.length; // We trust the cache has a mix
            if (totalRelevant < 5) {
                console.log('Not enough fixtures in cache, fetching scheduled fixtures (Match Week)...');
                await syncScheduledFixtures(apiKey);
                // Re-fetch
                const freshSnapshot = await getDocs(q);
                return freshSnapshot.docs.map(doc => ({
                    ...doc.data(),
                    fixtureId: doc.id
                })) as Fixture[];
            }
            return cachedFixtures;
        }

        // --- FALLBACK: If API/Cache is completely empty, use static "Game Week 1" data ---
        console.log("No live/cached fixtures found. Using static First Game Week data.");
        return staticFallbackFixtures.map(f => ({
            fixtureId: f.id,
            league: 'Betway Premiership', // Default league
            homeTeam: f.homeTeam,
            awayTeam: f.awayTeam,
            homeScore: null,
            awayScore: null,
            status: f.status === 'Scheduled' ? 'Not Started' : 'Finished',
            time: f.time,
            date: f.date,
            syncedAt: Timestamp.now(),
            // No logos in static data, View will handle defaults
        }));

    } catch (e) {
        console.warn("Fixture sync failed:", e);
        const cached = getFromCache(CACHE_KEY_FIXTURES);
        if (cached) return cached;

        // Fallback on error too
        console.log("Error fetching live fixtures. Using static data as fallback.");
        return staticFallbackFixtures.map(f => ({
            fixtureId: f.id,
            league: 'Betway Premiership',
            homeTeam: f.homeTeam,
            awayTeam: f.awayTeam,
            homeScore: null,
            awayScore: null,
            status: f.status === 'Scheduled' ? 'Not Started' : 'Finished',
            time: f.time,
            date: f.date,
            syncedAt: Timestamp.now()
        }));
    }
};

const isPSLRelevant = (stage: any, event: any) => {
    const isRelevantLeague = ['premier soccer league', 'psl', 'dstv premiership', 'betway premiership', 'south africa'].some(t => (stage.Snm || '').toLowerCase().includes(t));
    const home = (event.T1?.[0]?.Nm || '').toLowerCase();
    const away = (event.T2?.[0]?.Nm || '').toLowerCase();
    const isRelevantTeam = ['final', 'chiefs', 'pirates', 'sundowns', 'bafana', 'supersport', 'amazulu', 'stellenbosch', 'cape town city', 'chippa', 'galaxy', 'arrows', 'polokwane', 'sekhukhune', 'royal am', 'richards bay', 'magesi'].some(t => home.includes(t) || away.includes(t));
    return isRelevantLeague || isRelevantTeam;
};

const syncFixturesWithAPI = async (apiKey?: string) => {
    // 1. Try API-Football First (Gold Standard)
    try {
        const success = await syncFixturesWithApiFootball();
        if (success) {
            console.log("API-Football Fixture Sync Successful");
            return;
        }
    } catch (e) {
        console.warn("API-Football Fixture Sync Failed, falling back...", e);
    }

    // 2. Fallback to RapidAPI (LiveScore)
    const effectiveKey = import.meta.env.VITE_RAPID_API_KEY || apiKey || getStoredNewsApiKey();
    if (!effectiveKey) return;
    const apiHost = 'livescore6.p.rapidapi.com';

    console.log("Attempting RapidAPI Fallback for fixtures...");

    try {
        const response = await fetch(`https://${apiHost}/matches/v2/list-live?category=soccer`, {
            method: 'GET',
            headers: {
                'X-RapidAPI-Key': effectiveKey,
                'X-RapidAPI-Host': apiHost
            }
        });

        const data = response.ok ? await response.json() : null;
        if (data && data.Stages) {
            const syncTime = Timestamp.now();

            for (const stage of data.Stages) {
                if (stage.Events) {
                    for (const event of stage.Events) {
                        if (!isPSLRelevant(stage, event)) continue;

                        const statusShort = event.Eps;
                        let status: Fixture['status'] = 'Not Started';
                        if (['1H', '2H', 'HT', 'ET', 'P', 'BT', 'LIVE'].includes(statusShort)) status = 'In Progress';
                        else if (['FT', 'AET', 'PEN'].includes(statusShort)) status = 'Finished';

                        const fixtureData = {
                            league: stage.Snm || 'International',
                            homeTeam: event.T1?.[0]?.Nm || 'Home',
                            awayTeam: event.T2?.[0]?.Nm || 'Away',
                            homeScore: event.Tr1 ? parseInt(event.Tr1) : null,
                            awayScore: event.Tr2 ? parseInt(event.Tr2) : null,
                            status: status,
                            time: event.Esd ? String(event.Esd).slice(8, 10) + ':' + String(event.Esd).slice(10, 12) : 'TBD',
                            date: event.Esd ? String(event.Esd).slice(0, 4) + '-' + String(event.Esd).slice(4, 6) + '-' + String(event.Esd).slice(6, 8) : new Date().toISOString().split('T')[0],
                            syncedAt: syncTime,
                            homeLogo: event.T1?.[0]?.Img || undefined,
                            awayLogo: event.T2?.[0]?.Img || undefined
                        };
                        await setDoc(doc(db, 'fixtures', String(event.Eid)), fixtureData, { merge: true });
                    }
                }
            }
        }
    } catch (e) {
        console.error("Fixture API Sync failed:", e);
    }
};

// --- API-Football Integration (RapidAPI) ---

const syncFixturesWithApiFootball = async (): Promise<boolean> => {
    // API-Football Host
    const apiHost = 'api-football-v1.p.rapidapi.com';
    const leagueId = 288; // South Africa Premier Soccer League
    const season = 2025; // Current Season

    // 1. Live Fixtures
    const liveUrl = `https://${apiHost}/v3/fixtures?league=${leagueId}&season=${season}&live=all`;

    try {
        const resp = await fetch(liveUrl, {
            method: 'GET',
            headers: {
                'X-RapidAPI-Key': API_FOOTBALL_KEY,
                'X-RapidAPI-Host': apiHost
            }
        });

        const json = await resp.json();

        // If not authenticated or error
        if (json.errors && Object.keys(json.errors).length > 0) {
            console.error("API-Football Error:", json.errors);
            return false;
        }

        const syncTime = Timestamp.now();
        let processedCount = 0;

        if (json.response && Array.isArray(json.response)) {
            for (const item of json.response) {
                // Mapping
                const fixture = item.fixture;
                const home = item.teams.home;
                const away = item.teams.away;
                const goals = item.goals;

                let status: Fixture['status'] = 'Not Started';
                const shortStatus = fixture.status.short;

                if (['1H', '2H', 'HT', 'ET', 'P', 'LIVE'].includes(shortStatus)) status = 'In Progress';
                else if (['FT', 'AET', 'PEN'].includes(shortStatus)) status = 'Finished';
                else if (['PST', 'CANC', 'ABD'].includes(shortStatus)) status = 'Postponed';

                const fixtureData = {
                    league: item.league.name || 'Betway Premiership',
                    homeTeam: home.name,
                    awayTeam: away.name,
                    homeScore: goals.home,
                    awayScore: goals.away,
                    status: status,
                    time: fixture.date ? new Date(fixture.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'TBD',
                    date: fixture.date ? fixture.date.split('T')[0] : new Date().toISOString().split('T')[0],
                    syncedAt: syncTime,
                    homeLogo: home.logo,
                    awayLogo: away.logo
                };

                await setDoc(doc(db, 'fixtures', String(fixture.id)), fixtureData, { merge: true });
                processedCount++;
            }
        }

        // If no live games, maybe fetch scheduled? 
        // For now, return true if we didn't error, even if 0 results (means no games live)
        if (processedCount === 0) {
            console.log("No LIVE games currently on API-Football.");
        }
        return true;
    } catch (e) {
        console.error("API-Football Live Sync Error", e);
        return false;
    }
};

const syncStandingsWithApiFootball = async (): Promise<boolean> => {
    // API-Football Host
    const apiHost = 'api-football-v1.p.rapidapi.com';
    const leagueId = 288; // South Africa Premier Soccer League
    // Start with 2024 if 2025 is not active yet in backend, but user specified 2025/2026
    const season = 2025;

    // v3 Endpoint
    const url = `https://${apiHost}/v3/standings?league=${leagueId}&season=${season}`;

    try {
        const resp = await fetch(url, {
            method: 'GET',
            headers: {
                'X-RapidAPI-Key': API_FOOTBALL_KEY,
                'X-RapidAPI-Host': apiHost
            }
        });
        const json = await resp.json();

        if (json.response && json.response.length > 0) {
            const leagueData = json.response[0].league;
            if (leagueData && leagueData.standings && leagueData.standings.length > 0) {
                const rows = leagueData.standings[0]; // Usually first array is the total table
                const syncTime = Timestamp.now();

                for (const row of rows) {
                    const standing: PSLStanding & { syncedAt: any } = {
                        rank: row.rank,
                        team: row.team.name,
                        played: row.all.played,
                        win: row.all.win,
                        draw: row.all.draw,
                        loss: row.all.lose,
                        goalsFor: row.all.goals.for,
                        goalsAgainst: row.all.goals.against,
                        goalDifference: row.goalsDiff,
                        points: row.points,
                        syncedAt: syncTime
                    };
                    await setDoc(doc(db, 'standings', `rank_${standing.rank}`), standing);
                }
                console.log("API-Football Standings Sync Successful");
                return true;
            }
        }
        return false;
    } catch (e) {
        console.error("API-Football Standings Sync Error", e);
        return false;
    }
};

const formatDateForApi = (date: Date): string => {
    const yyyy = date.getFullYear();
    const mm = String(date.getMonth() + 1).padStart(2, '0');
    const dd = String(date.getDate()).padStart(2, '0');
    return `${yyyy}${mm}${dd}`;
};

const syncScheduledFixtures = async (apiKey?: string) => {
    const effectiveKey = import.meta.env.VITE_RAPID_API_KEY || apiKey || getStoredNewsApiKey();
    if (!effectiveKey) return;
    const apiHost = 'livescore6.p.rapidapi.com';

    // Fetch fixtures for a "Match Week" window:
    // - Yesterday (Results)
    // - Today (Live/Upcoming)
    // - Next 5 days (Upcoming)
    const datesToSync = [];
    const today = new Date();

    // Previous day (Yesterday)
    const yesterday = new Date(today);
    yesterday.setDate(today.getDate() - 1);
    datesToSync.push(formatDateForApi(yesterday));

    // Today
    datesToSync.push(formatDateForApi(today));

    // Next 5 days
    for (let i = 1; i <= 5; i++) {
        const d = new Date(today);
        d.setDate(today.getDate() + i);
        datesToSync.push(formatDateForApi(d));
    }

    try {
        for (const dateStr of datesToSync) {
            console.log(`Syncing results for ${dateStr}...`);
            const response = await fetch(`https://${apiHost}/matches/v2/list-by-date?Category=soccer&Date=${dateStr}&Timezone=-2`, {
                method: 'GET',
                headers: {
                    'X-RapidAPI-Key': effectiveKey,
                    'X-RapidAPI-Host': apiHost
                }
            });
            const data = response.ok ? await response.json() : null;

            if (data && data.Stages) {
                for (const stage of data.Stages) {
                    // Filter for irrelevant leagues to save writes?
                    // Let's just write them and let the View do the strict filtering/tiering
                    // But we can prioritize PSL/Major leagues to avoid writing junk

                    const leagueName = stage.Snm || '';

                    // League filtering REMOVED - process all relevant soccer events returned
                    if (stage.Events) {
                        for (const event of stage.Events) {
                            if (!isPSLRelevant(stage, event)) continue;

                            // Parse Status properly
                            const statusShort = event.Eps;
                            let status: Fixture['status'] = 'Not Started';
                            if (['1H', '2H', 'HT', 'ET', 'P', 'BT', 'LIVE'].includes(statusShort)) status = 'In Progress';
                            else if (['FT', 'AET', 'PEN'].includes(statusShort)) status = 'Finished';
                            else if (['Postp.', 'Canc.'].includes(statusShort)) status = 'Postponed';

                            // Parse Time
                            // Esd is YYYYMMDDHHMMSS e.g. 20231024173000
                            // We need HH:MM
                            let timeStr = 'TBD';
                            if (event.Esd) {
                                const esdStr = String(event.Esd);
                                if (esdStr.length >= 12) {
                                    timeStr = esdStr.slice(8, 10) + ':' + esdStr.slice(10, 12);
                                }
                            }
                            if (status === 'Finished') timeStr = 'FT';
                            if (status === 'Postponed') timeStr = 'P-P';

                            // Safe score parsing (handle "0" vs null correctly)
                            const parseScore = (val: any) => {
                                if (val === undefined || val === null || val === '') return null;
                                const parsed = parseInt(val);
                                return isNaN(parsed) ? null : parsed;
                            };

                            const fixtureData = {
                                league: stage.Snm || 'International',
                                homeTeam: event.T1?.[0]?.Nm || 'Home',
                                awayTeam: event.T2?.[0]?.Nm || 'Away',
                                homeScore: parseScore(event.Tr1),
                                awayScore: parseScore(event.Tr2),
                                status: status,
                                time: timeStr,
                                date: dateStr.slice(0, 4) + '-' + dateStr.slice(4, 6) + '-' + dateStr.slice(6, 8), // Format YYYY-MM-DD
                                syncedAt: Timestamp.now(),
                                homeLogo: event.T1?.[0]?.Img || undefined,
                                awayLogo: event.T2?.[0]?.Img || undefined
                            };
                            await setDoc(doc(db, 'fixtures', String(event.Eid)), fixtureData, { merge: true });
                        }
                    }
                }
            }
        }
    } catch (e) {
        console.error("Past results sync failed:", e);
    }
};

export const fetchStandings = async (apiKey?: string): Promise<PSLStanding[]> => {
    try {
        const standingsRef = collection(db, 'standings');
        const q = query(standingsRef, orderBy('rank', 'asc'));
        const querySnapshot = await getDocs(q);

        const cached = querySnapshot.docs.map(doc => doc.data()) as PSLStanding[];

        // Standings change less frequently (every 12 hours)
        const shouldSync = cached.length === 0 ||
            (cached[0] as any).syncedAt?.toMillis() < Date.now() - (1000 * 60 * 60 * 12);

        if (shouldSync) {
            console.log('Syncing PSL Standings...');
            await syncStandingsWithAPI(apiKey);
            const fresh = await getDocs(q);
            return fresh.docs.map(doc => doc.data()) as PSLStanding[];
        }
        return cached;
    } catch (e) {
        console.error("Standings fetch failed:", e);
        return [];
    }
};

const syncStandingsWithAPI = async (apiKey?: string) => {
    // 1. API-Football Priority
    try {
        const success = await syncStandingsWithApiFootball();
        if (success) return; // Exit if successful
    } catch (e) {
        console.warn("API-Football Standings Sync Failed, falling back...", e);
    }

    // 2. RapidAPI Fallback
    const effectiveKey = import.meta.env.VITE_RAPID_API_KEY || apiKey || getStoredNewsApiKey();
    if (!effectiveKey) return;
    const apiHost = 'livescore6.p.rapidapi.com';

    try {
        const response = await fetch(`https://${apiHost}/leagues/v2/get-table?category=soccer&leagueId=41`, {
            method: 'GET',
            headers: { 'X-RapidAPI-Key': effectiveKey, 'X-RapidAPI-Host': apiHost }
        });

        const data = await response.json();
        if (data && data.Stages && data.Stages[0]?.LeagueTable?.Lp) {
            const syncTime = Timestamp.now();
            const rows = data.Stages[0].LeagueTable.Lp;

            for (const row of rows) {
                const standing: PSLStanding & { syncedAt: any } = {
                    rank: parseInt(row.Rnk),
                    team: row.Nm || 'Unknown',
                    played: parseInt(row.Pld),
                    win: parseInt(row.Wn),
                    draw: parseInt(row.Dr),
                    loss: parseInt(row.Ls),
                    goalsFor: parseInt(row.Gf),
                    goalsAgainst: parseInt(row.Ga),
                    goalDifference: parseInt(row.Gd),
                    points: parseInt(row.Pts),
                    syncedAt: syncTime
                };
                await setDoc(doc(db, 'standings', `rank_${standing.rank}`), standing);
            }
        }
    } catch (e) {
        console.error("Standings Sync Error:", e);
    }
};

export const fetchTopScorers = async (apiKey?: string): Promise<TopScorer[]> => {
    try {
        const scorersRef = collection(db, 'top_scorers');
        const q = query(scorersRef, orderBy('rank', 'asc'), limit(10));
        const querySnapshot = await getDocs(q);

        const cached = querySnapshot.docs.map(doc => doc.data()) as TopScorer[];

        const shouldSync = cached.length === 0 ||
            (cached[0] as any).syncedAt?.toMillis() < Date.now() - (1000 * 60 * 60 * 12);

        if (shouldSync) {
            console.log('Syncing Top Scorers...');
            // In many LiveScore APIs, scorers are part of league info or a separate call
            // Using a simplified mock sync if endpoint is not exactly known, 
            // but structure is ready for actual integration
            await syncScorersWithAPI(apiKey);
            const fresh = await getDocs(q);
            return fresh.docs.map(doc => doc.data()) as TopScorer[];
        }
        return cached;
    } catch (e) {
        return [];
    }
};

const syncScorersWithAPI = async (apiKey?: string) => {
    // Note: LiveScore6 RapidAPI sometimes nests scorers under 'leagues/v2/get-top-scorers'
    // This is a placeholder for the actual API call logic
    console.log("Scorers sync called - implementing structure");
};

const isSouthAfrican = (name: string): boolean => {
    const relevantTerms = ['South Africa', 'Bafana', 'Banyana', 'Kaizer', 'Chiefs', 'Pirates', 'Sundowns', 'Cape Town', 'Stellenbosch', 'Amazulu', 'Golden Arrows', 'Galaxy', 'Sekhukhune', 'Chippa', 'Richards Bay', 'Polokwane', 'Royal AM'];
    return relevantTerms.some(term => name.toLowerCase().includes(term.toLowerCase()));
};
