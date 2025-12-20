
export interface NewsArticle {
    id: string;
    title: string;
    summary: string;
    date: string;
    source: string;
    imageUrl: string;
    tag: string;
    tagColor: string;
    url: string;
}

const HARDCODED_API_KEY = "1a5d324f62mshf82070b791b2f3ap10994fjsnd9dc8ed92749";
const STORAGE_KEY = 'psl_news_api_key';

export const getStoredNewsApiKey = (): string | null => {
    return localStorage.getItem(STORAGE_KEY) || localStorage.getItem('rapid_api_key') || HARDCODED_API_KEY;
};

export const setStoredNewsApiKey = (key: string) => {
    localStorage.setItem(STORAGE_KEY, key);
};

export const removeStoredNewsApiKey = () => {
    localStorage.removeItem(STORAGE_KEY);
};

export const fetchPSLNews = async (apiKey: string): Promise<NewsArticle[]> => {
    if (!apiKey) throw new Error('No API key provided');

    const provider = localStorage.getItem('psl_news_provider') || 'newsapi';
    const apiHost = localStorage.getItem('psl_news_api_host');

    if (provider === 'rapidapi' && apiHost) {
        // RapidAPI Implementation
        try {
            // Trying a generic news endpoint for livescore APIs
            const response = await fetch(`https://${apiHost}/news?league=PSL&country=za`, {
                method: 'GET',
                headers: {
                    'X-RapidAPI-Key': apiKey,
                    'X-RapidAPI-Host': apiHost
                }
            });

            if (!response.ok) {
                // If the specific endpoint fails, we might want to try a fallback or just throw
                // Many free livescore APIs don't actually have news, so this is a best-effort attempt.
                throw new Error(`RapidAPI Error: ${response.status}`);
            }

            const data = await response.json();

            // If data is empty or not in expected format, return empty array to trigger fallback
            if (!data || (Array.isArray(data) && data.length === 0)) {
                return [];
            }

            // Transform data if it exists (this is speculative based on common formats)
            return Array.isArray(data) ? data.map((item: any, index: number) => ({
                id: `rapid-${index}`,
                title: item.title || 'News Update',
                summary: item.description || item.summary || 'Click to read more.',
                date: new Date().toLocaleDateString(), // Fallback date
                source: 'LiveScore API',
                imageUrl: item.image || 'https://images.unsplash.com/photo-1522778119026-d647f0565c6a?auto=format&fit=crop&q=80&w=800',
                tag: 'Live Update',
                tagColor: 'bg-indigo-500',
                url: item.url || '#'
            })) : [];

        } catch (e) {
            console.warn("RapidAPI fetch failed or not supported, falling back to mock", e);
            // Return empty array to allow component to show mock data as fallback
            return [];
        }
    } else {
        // NewsAPI.org Implementation
        const query = 'PSL South Africa OR Kaizer Chiefs OR Orlando Pirates OR Mamelodi Sundowns';
        const url = `https://newsapi.org/v2/everything?q=${encodeURIComponent(query)}&language=en&sortBy=publishedAt&pageSize=10&apiKey=${apiKey}`;

        const response = await fetch(url);
        const data = await response.json();

        if (data.status === 'error') {
            throw new Error(data.message || 'Failed to fetch news');
        }

        return data.articles.map((article: any, index: number) => ({
            id: `news-${index}`,
            title: article.title,
            summary: article.description || article.content || 'No description available.',
            date: new Date(article.publishedAt).toLocaleDateString('en-ZA', {
                year: 'numeric',
                month: 'short',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
            }),
            source: article.source.name,
            imageUrl: article.urlToImage || 'https://images.unsplash.com/photo-1522778119026-d647f0565c6a?auto=format&fit=crop&q=80&w=800',
            tag: 'Latest',
            tagColor: 'bg-blue-500',
            url: article.url
        }));
    }
};
// ... (existing code)

export interface Standing {
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

export const fetchStandings = async (apiKey?: string): Promise<Standing[]> => {
    const effectiveKey = apiKey || localStorage.getItem('rapid_api_key') || HARDCODED_API_KEY;

    if (!effectiveKey) throw new Error('No API key provided');

    const apiHost = localStorage.getItem('psl_news_api_host') || 'free-livescore-api.p.rapidapi.com';

    try {
        const response = await fetch(`https://${apiHost}/leagues/standings?league=288&season=2024`, {
            method: 'GET',
            headers: {
                'X-RapidAPI-Key': effectiveKey,
                'X-RapidAPI-Host': apiHost
            }
        });

        if (!response.ok) {
            throw new Error(`API Error: ${response.status}`);
        }

        const data = await response.json();

        // Check if response has the expected structure
        if (!data || !data.response || !Array.isArray(data.response)) {
            console.warn("Unexpected API response format for standings:", data);
            return [];
        }

        // Helper to parse the response. 
        // Real API (API-Football) structure: response[0].league.standings[0] (array of teams)
        const leagueData = data.response[0]?.league;
        const standingsRaw = leagueData?.standings?.[0]; // Usually standings are in a nested array [[Team1, Team2...]]

        if (!standingsRaw || !Array.isArray(standingsRaw)) {
            return [];
        }

        return standingsRaw.map((item: any) => ({
            rank: item.rank,
            team: item.team.name,
            points: item.points,
            played: item.all.played,
            win: item.all.win,
            draw: item.all.draw,
            loss: item.all.lose,
            goalsFor: item.all.goals.for,
            goalsAgainst: item.all.goals.against,
            goalDifference: item.goalsDiff
        }));

    } catch (error) {
        console.error("Failed to fetch standings:", error);
        throw error;
    }
};
// ... (existing code for fetchStandings)

export interface Fixture {
    fixtureId: string;
    league: string;
    homeTeam: string;
    awayTeam: string;
    homeScore: number | null;
    awayScore: number | null;
    status: 'Not Started' | 'In Progress' | 'Finished' | 'Postponed';
    time: string;
}

export const fetchFixtures = async (apiKey?: string): Promise<Fixture[]> => {
    const effectiveKey = apiKey || localStorage.getItem('rapid_api_key') || HARDCODED_API_KEY;

    if (!effectiveKey) throw new Error('No API key provided');

    const apiHost = localStorage.getItem('psl_news_api_host') || 'free-livescore-api.p.rapidapi.com';

    try {
        // Fetch fixtures for PSL (League 288) for current season (2024)
        // Note: 'timezone' param is often useful but we'll stick to basics.
        // We'll try to get 'live' games first, or just 'next' few games if no live ones?
        // For a broad 'Live Games' tab, getting 'fixtures?league=288&season=2024' returns ALL.
        // That's too many. We usually want "Matches for Today".
        const today = new Date().toISOString().split('T')[0];

        // Construct URL: Try to get fixtures for "today"
        // API-Football format: /fixtures?league=288&season=2024&date=YYYY-MM-DD
        const url = `https://${apiHost}/fixtures?league=288&season=2024&date=${today}`;

        const response = await fetch(url, {
            method: 'GET',
            headers: {
                'X-RapidAPI-Key': effectiveKey,
                'X-RapidAPI-Host': apiHost
            }
        });

        if (!response.ok) {
            // Fallback: If 'date' filter isn't supported or fails, try just 'next' 10 fixtures
            // This handles cases where season is over or API differs.
            console.warn(`Specific date fetch failed (${response.status}), trying 'next 10' fallback...`);
            const fallbackUrl = `https://${apiHost}/fixtures?league=288&season=2024&next=10`;
            const fallbackResponse = await fetch(fallbackUrl, {
                method: 'GET',
                headers: { 'X-RapidAPI-Key': effectiveKey, 'X-RapidAPI-Host': apiHost }
            });

            if (!fallbackResponse.ok) throw new Error(`API Error: ${response.status}`);

            var data = await fallbackResponse.json();
        } else {
            var data = await response.json();
        }

        if (!data || !data.response || !Array.isArray(data.response)) {
            // Second Fallback: Maybe no games today. Let's return mock if strictly needed, 
            // but here we just return empty array so UI shows "No games today".
            return [];
        }

        return data.response.map((item: any) => {
            const statusShort = item.fixture.status.short;
            let status: Fixture['status'] = 'Not Started';

            if (['1H', '2H', 'HT', 'ET', 'P', 'BT'].includes(statusShort)) status = 'In Progress';
            else if (['FT', 'AET', 'PEN'].includes(statusShort)) status = 'Finished';
            else if (['PST', 'CANC', 'ABD'].includes(statusShort)) status = 'Postponed';

            return {
                fixtureId: String(item.fixture.id),
                league: item.league.name || 'PSL',
                homeTeam: item.teams.home.name,
                awayTeam: item.teams.away.name,
                homeScore: item.goals.home,
                awayScore: item.goals.away,
                status: status,
                time: new Date(item.fixture.date).toLocaleTimeString('en-ZA', { hour: '2-digit', minute: '2-digit' })
            };
        });

    } catch (error) {
        console.error("Failed to fetch fixtures:", error);
        throw error;
    }
};
