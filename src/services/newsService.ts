import { db } from '@/integrations/firebase/client';
import { collection, getDocs, setDoc, doc, query, orderBy, limit, Timestamp } from 'firebase/firestore';

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
const HARDCODED_API_KEY = "1a5d324f62mshf82070b791b2f3ap10994fjsnd9dc8ed92749"; // Legacy RapidAPI key
const GNEWS_API_KEY = "46b746a39e92802f3adcc087019909cc";

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
        // Sync if: No news in DB OR oldest news is more than 6 hours old
        const shouldSync = cachedNews.length === 0 ||
            (cachedNews[0] as any).syncedAt?.toMillis() < Date.now() - (1000 * 60 * 60 * 6);

        if (shouldSync) {
            console.log('Syncing news with API...');
            await syncNewsWithAPI(apiKey);

            // Re-fetch after sync
            const freshSnapshot = await getDocs(q);
            return freshSnapshot.docs.map(doc => ({
                ...doc.data(),
                id: doc.id
            })) as NewsArticle[];
        }

        return cachedNews;
    } catch (e) {
        console.warn("Firestore fetch failed, checking local cache...", e);
        const localCached = getFromCache(CACHE_KEY_NEWS);
        if (localCached) return localCached;
        return [];
    }
};

const syncNewsWithAPI = async (apiKey: string) => {
    // Default to 'newsapi' since we have a valid key for it now
    const provider = localStorage.getItem('psl_news_provider') || 'newsapi';
    let syncSuccess = false;

    if (provider === 'rapidapi') {
        const effectiveKey = import.meta.env.VITE_RAPID_API_KEY || apiKey || getStoredNewsApiKey() || HARDCODED_API_KEY;
        if (effectiveKey) {
            syncSuccess = await syncFromRapidAPI(effectiveKey);
        }
    } else if (provider === 'newsapi') {
        const key = getStoredNewsApiKey() || apiKey || NEWS_API_ORG_KEY;
        if (key) {
            syncSuccess = await syncFromNewsOrg(key);
        }
    }

    // Fallback to GNews if primary failed
    if (!syncSuccess) {
        console.log("Primary news provider failed or not configured. Attempting fallback to GNews...");
        await syncFromGNews(GNEWS_API_KEY);
    }
};

const syncFromGNews = async (apiKey: string) => {
    try {
        console.log("Fetching news from GNews...");
        // Search for specific SA football terms
        const response = await fetch(`https://gnews.io/api/v4/search?q=psl OR "kaizer chiefs" OR "orlando pirates" OR sundowns OR "bafana bafana"&lang=en&country=za&max=10&apikey=${apiKey}`);
        const data = await response.json();

        if (data.articles && Array.isArray(data.articles)) {
            const syncTime = Timestamp.now();
            console.log(`Synced ${data.articles.length} articles from GNews`);

            for (const item of data.articles) {
                const title = item.title;
                const lowerTitle = title.toLowerCase();
                const description = item.description || '';

                // Skip non-sports logic handled by query generally, but double check context if needed
                // GNews search is usually pretty accurate with these keywords

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

                const docId = btoa(item.url).slice(0, 20); // Unique ID from URL
                const publishedAt = item.publishedAt ? Timestamp.fromDate(new Date(item.publishedAt)) : Timestamp.now();

                const newsData = {
                    title,
                    summary: description,
                    date: item.publishedAt ? formatRelativeTime(item.publishedAt) : 'Just now',
                    publishedAt,
                    syncedAt: syncTime,
                    source: item.source.name || 'GNews',
                    imageUrl: item.image || 'https://images.unsplash.com/photo-1522778119026-d647f0565c6a?auto=format&fit=crop&q=80&w=800',
                    tag,
                    tagColor,
                    url: item.url
                };

                await setDoc(doc(db, 'news', docId), newsData, { merge: true });
            }
            return true;
        } else {
            console.error("GNews Error:", data.errors);
            return false;
        }
    } catch (e) {
        console.error("GNews Sync failed:", e);
        return false;
    }
};

const syncFromNewsOrg = async (apiKey: string): Promise<boolean> => {
    try {
        // Fetch Top Sports Headlines from South Africa
        const response = await fetch(`https://newsapi.org/v2/top-headlines?country=za&category=sports&apiKey=${apiKey}`);
        const data = await response.json();

        if (data.status === 'ok' && Array.isArray(data.articles)) {
            const syncTime = Timestamp.now();
            console.log(`Synced ${data.articles.length} articles from NewsAPI.org`);

            for (const item of data.articles) {
                if (item.title === '[Removed]') continue;

                const title = item.title;
                const lowerTitle = title.toLowerCase();
                const description = (item.description || '').toLowerCase();
                const content = (item.content || '').toLowerCase();
                const combinedText = `${lowerTitle} ${description} ${content}`;

                // Strict Football Filtering
                const soccerKeywords = ['soccer', 'football', 'psl', 'premier league', 'chiefs', 'pirates', 'sundowns',
                    'bafana', 'banyana', 'fifa', 'caf', 'coach', 'squad', 'transfer', 'sign',
                    'dstv', 'motsepe', 'betway', 'kaiser', 'orlando', 'mamelodi'];

                const excludeKeywords = ['cricket', 'rugby', 'proteas', 'springboks', 't20', 'odi', 'test match',
                    'lions', 'bulls', 'sharks', 'stormers', 'tennis', 'golf', 'f1', 'formula 1'];

                const isSoccer = soccerKeywords.some(keyword => combinedText.includes(keyword));
                const isExcluded = excludeKeywords.some(keyword => combinedText.includes(keyword));

                // If it's explicitly other sports, skip. If it's not clearly soccer, skip.
                if (isExcluded || !isSoccer) continue;

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

                const docId = btoa(item.url).slice(0, 20); // Unique ID from URL
                const publishedAt = item.publishedAt ? Timestamp.fromDate(new Date(item.publishedAt)) : Timestamp.now();

                const newsData = {
                    title,
                    summary,
                    date: item.publishedAt ? formatRelativeTime(item.publishedAt) : 'Just now',
                    publishedAt,
                    syncedAt: syncTime,
                    source: item.source.name || 'NewsAPI',
                    imageUrl: item.urlToImage || 'https://images.unsplash.com/photo-1522778119026-d647f0565c6a?auto=format&fit=crop&q=80&w=800',
                    tag,
                    tagColor,
                    url: item.url
                };

                await setDoc(doc(db, 'news', docId), newsData, { merge: true });
            }
            return true;
        } else {
            console.error("NewsAPI Error:", data.message);
            return false;
        }
    } catch (e) {
        console.error("NewsAPI Sync failed:", e);
        return false;
    }
};

const syncFromRapidAPI = async (effectiveKey: string): Promise<boolean> => {
    const apiHost = 'livescore6.p.rapidapi.com';

    try {
        const response = await fetch(`https://${apiHost}/news/v3/list?countryCode=ZA&category=soccer`, {
            method: 'GET',
            headers: {
                'X-RapidAPI-Key': effectiveKey,
                'X-RapidAPI-Host': apiHost
            }
        });

        const data = response.ok ? await response.json() : null;

        if (data && data.topStories && Array.isArray(data.topStories)) {
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
                    imageUrl: item.mainMedia?.gallery?.[0]?.url || 'https://images.unsplash.com/photo-1522778119026-d647f0565c6a?auto=format&fit=crop&q=80&w=800',
                    tag,
                    tagColor,
                    url: item.url ? (item.url.startsWith('http') ? item.url : `https://www.livescore.com${item.url}`) : '#'
                };

                await setDoc(doc(db, 'news', docId), newsData, { merge: true });
            }
            console.log(`Successfully synced ${data.topStories.length} stories to Firebase.`);
            return true;
        }
        return false;
    } catch (e) {
        console.error("API Sync failed:", e);
        return false;
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
    syncedAt?: any;
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
            console.log('Syncing fixtures with API...');
            await syncFixturesWithAPI(apiKey);
            const freshSnapshot = await getDocs(q);
            return freshSnapshot.docs.map(doc => ({
                ...doc.data(),
                fixtureId: doc.id
            })) as Fixture[];
        }

        return cachedFixtures.sort((a, b) => {
            const isRelevantA = isSouthAfrican(a.homeTeam) || isSouthAfrican(a.awayTeam);
            const isRelevantB = isSouthAfrican(b.homeTeam) || isSouthAfrican(b.awayTeam);
            if (isRelevantA && !isRelevantB) return -1;
            if (!isRelevantA && isRelevantB) return 1;
            return 0;
        });
    } catch (e) {
        console.warn("Fixture sync failed:", e);
        return getFromCache(CACHE_KEY_FIXTURES) || [];
    }
};

const syncFixturesWithAPI = async (apiKey?: string) => {
    const effectiveKey = import.meta.env.VITE_RAPID_API_KEY || apiKey || getStoredNewsApiKey();
    if (!effectiveKey) return;
    const apiHost = 'livescore6.p.rapidapi.com';

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
                            syncedAt: syncTime
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
