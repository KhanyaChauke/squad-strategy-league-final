// const fetch = require('node-fetch'); // Removed: node-fetch v3 is ESM-only. Node 18+ has global fetch.

// --- Helper Functions ---

const getOneWeekAgoDate = () => {
    const date = new Date();
    date.setDate(date.getDate() - 7);
    return date.toISOString().split('T')[0];
};

const getFallbackImage = (title) => {
    const lowerTitle = title.toLowerCase();
    if (lowerTitle.includes('chiefs') || lowerTitle.includes('amakhosi')) return 'https://images.unsplash.com/photo-1560272564-c83b66b1ad12?auto=format&fit=crop&q=80&w=800';
    if (lowerTitle.includes('pirates') || lowerTitle.includes('buccaneers')) return 'https://images.unsplash.com/photo-1508098682722-e99c43a406b2?auto=format&fit=crop&q=80&w=800';
    if (lowerTitle.includes('sundowns') || lowerTitle.includes('downs')) return 'https://images.unsplash.com/photo-1614632537423-1e6c2e7e0aab?auto=format&fit=crop&q=80&w=800';
    if (lowerTitle.includes('bafana')) return 'https://images.unsplash.com/photo-1574629810360-7efbbe195018?auto=format&fit=crop&q=80&w=800';
    if (lowerTitle.includes('transfer')) return 'https://images.unsplash.com/photo-1551958219-acbc608c6377?auto=format&fit=crop&q=80&w=800';
    return 'https://images.unsplash.com/photo-1579952363873-27f3bade9f55?auto=format&fit=crop&q=80&w=800';
};

const normalizeArticle = (item, source) => {
    const title = item.title;
    const lowerTitle = title.toLowerCase();

    let tag = 'Soccer';
    let tagColor = 'bg-blue-600';

    if (lowerTitle.includes('chiefs') || lowerTitle.includes('pirates') || lowerTitle.includes('sundowns')) {
        tag = 'PSL Giants';
        tagColor = 'bg-yellow-600';
    } else if (lowerTitle.includes('transfer') || lowerTitle.includes('sign')) {
        tag = 'Transfer News';
        tagColor = 'bg-purple-600';
    } else if (lowerTitle.includes('bafana') || lowerTitle.includes('banyana')) {
        tag = 'National Team';
        tagColor = 'bg-green-600';
    } else if (lowerTitle.includes('psl') || lowerTitle.includes('premiership')) {
        tag = 'PSL';
        tagColor = 'bg-green-600';
    }

    // Determine published date
    const dateStr = item.publishedAt || item.publishedTime || new Date().toISOString();

    return {
        title: item.title,
        summary: item.description || item.content || '',
        publishedAt: dateStr,
        source: source,
        imageUrl: item.urlToImage || item.image || getFallbackImage(item.title),
        url: item.url,
        tag,
        tagColor
    };
};

export const handler = async (event, context) => {
    const logs = [];
    const log = (msg) => {
        console.log(msg);
        logs.push(msg);
    };

    try {
        log("Function started. Node " + process.version);

        const NEWS_API_KEY = process.env.NEWS_API_ORG_KEY;
        const GNEWS_API_KEY = process.env.GNEWS_API_KEY;

        log(`Keys present: NewsAPI=${!!NEWS_API_KEY}, GNews=${!!GNEWS_API_KEY}`);

        if (!NEWS_API_KEY && !GNEWS_API_KEY) {
            throw new Error("Server API Keys not configured in Netlify.");
        }

        // 1. Try NewsAPI
        if (NEWS_API_KEY) {
            try {
                log("Attempting NewsAPI...");
                const start = getOneWeekAgoDate();
                const query = '("South Africa" AND (soccer OR football)) OR "Betway Premiership" OR "Kaizer Chiefs" OR "Orlando Pirates" OR "Mamelodi Sundowns" OR "Bafana Bafana"';
                const url = `https://newsapi.org/v2/everything?q=${encodeURIComponent(query)}&from=${start}&sortBy=publishedAt&language=en&apiKey=${NEWS_API_KEY}`;

                log("Fetching URL: " + url.replace(NEWS_API_KEY, "REDACTED"));
                const response = await fetch(url);
                log(`NewsAPI Response Status: ${response.status}`);

                const data = await response.json();

                if (response.ok && data.status === 'ok' && Array.isArray(data.articles)) {
                    log(`NewsAPI Success. Found ${data.articles.length} articles.`);
                    const validArticles = data.articles
                        .filter(a => a.title !== '[Removed]')
                        .map(a => normalizeArticle(a, a.source.name || 'NewsAPI'));

                    return {
                        statusCode: 200,
                        headers: { 'Access-Control-Allow-Origin': '*', 'Content-Type': 'application/json' },
                        body: JSON.stringify({ articles: validArticles, source: 'NewsAPI', debug_logs: logs })
                    };
                }
                log("NewsAPI Error Payload: " + JSON.stringify(data));
            } catch (e) {
                log("NewsAPI Exception: " + e.message);
            }
        }

        // 2. Try GNews
        if (GNEWS_API_KEY) {
            try {
                log("Attempting GNews...");
                const query = '"South African football" OR PSL OR "Betway Premiership" OR "Bafana Bafana" OR "Kaizer Chiefs" OR "Orlando Pirates" OR Sundowns';
                const url = `https://gnews.io/api/v4/search?q=${encodeURIComponent(query)}&lang=en&country=za&max=10&apikey=${GNEWS_API_KEY}`;

                const response = await fetch(url);
                log(`GNews Response Status: ${response.status}`);
                const data = await response.json();

                if (response.ok && data.articles) {
                    log(`GNews Success. Found ${data.articles.length} articles.`);
                    const validArticles = data.articles.map(a => normalizeArticle(a, a.source.name || 'GNews'));
                    return {
                        statusCode: 200,
                        headers: { 'Access-Control-Allow-Origin': '*', 'Content-Type': 'application/json' },
                        body: JSON.stringify({ articles: validArticles, source: 'GNews', debug_logs: logs })
                    };
                }
                log("GNews Error Payload: " + JSON.stringify(data));
            } catch (e) {
                log("GNews Exception: " + e.message);
            }
        }

        // 3. All Failed
        return {
            statusCode: 503,
            headers: { 'Access-Control-Allow-Origin': '*', 'Content-Type': 'application/json' },
            body: JSON.stringify({ error: "All news sources failed", debug_logs: logs })
        };

    } catch (e) {
        log("CRITICAL FAILURE: " + e.message);
        return {
            statusCode: 500,
            headers: { 'Access-Control-Allow-Origin': '*', 'Content-Type': 'application/json' },
            body: JSON.stringify({ error: e.message, debug_logs: logs })
        };
    }
};
