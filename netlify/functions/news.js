const fetch = require('node-fetch');

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

exports.handler = async (event, context) => {
    const NEWS_API_KEY = process.env.NEWS_API_ORG_KEY;
    const GNEWS_API_KEY = process.env.GNEWS_API_KEY;

    if (!NEWS_API_KEY && !GNEWS_API_KEY) {
        return {
            statusCode: 500,
            body: JSON.stringify({ error: "Server API Keys not configured" }),
            headers: {
                'Access-Control-Allow-Origin': '*',
                'Content-Type': 'application/json'
            }
        };
    }

    try {
        console.log("Serverless Function: Fetching News...");

        // 1. Try NewsAPI (Primary)
        if (NEWS_API_KEY) {
            try {
                const start = getOneWeekAgoDate();
                const query = '(soccer OR football OR psl OR "kaizer chiefs" OR "orlando pirates" OR sundowns OR "bafana bafana")';
                const url = `https://newsapi.org/v2/everything?q=${encodeURIComponent(query)}&from=${start}&sortBy=publishedAt&language=en&apiKey=${NEWS_API_KEY}`;

                // NOTE: Server-side calls to NewsAPI are allowed on Free Tier (unlike browser calls)
                const response = await fetch(url);
                const data = await response.json();

                if (response.ok && data.status === 'ok' && Array.isArray(data.articles) && data.articles.length > 0) {
                    const validArticles = data.articles
                        .filter(a => a.title !== '[Removed]')
                        .map(a => normalizeArticle(a, a.source.name || 'NewsAPI'));

                    return {
                        statusCode: 200,
                        headers: { 'Access-Control-Allow-Origin': '*', 'Content-Type': 'application/json' },
                        body: JSON.stringify({ articles: validArticles, source: 'NewsAPI' })
                    };
                }
                console.warn("NewsAPI returned empty or error", data);
            } catch (e) {
                console.error("NewsAPI failed:", e);
            }
        }

        // 2. Try GNews (Fallback)
        if (GNEWS_API_KEY) {
            try {
                console.log("Falling back to GNews...");
                const query = '"South African football" OR PSL OR "Betway Premiership" OR "Bafana Bafana" OR "Kaizer Chiefs" OR "Orlando Pirates" OR Sundowns';
                const url = `https://gnews.io/api/v4/search?q=${encodeURIComponent(query)}&lang=en&country=za&max=10&apikey=${GNEWS_API_KEY}`;

                const response = await fetch(url);
                const data = await response.json();

                if (response.ok && data.articles && Array.isArray(data.articles)) {
                    const validArticles = data.articles.map(a => normalizeArticle(a, a.source.name || 'GNews'));
                    return {
                        statusCode: 200,
                        headers: { 'Access-Control-Allow-Origin': '*', 'Content-Type': 'application/json' },
                        body: JSON.stringify({ articles: validArticles, source: 'GNews' })
                    };
                }
            } catch (e) {
                console.error("GNews failed:", e);
            }
        }

        // 3. All Failed
        return {
            statusCode: 503,
            headers: { 'Access-Control-Allow-Origin': '*', 'Content-Type': 'application/json' },
            body: JSON.stringify({ error: "All news sources failed", articles: [] })
        };

    } catch (e) {
        return {
            statusCode: 500,
            headers: { 'Access-Control-Allow-Origin': '*', 'Content-Type': 'application/json' },
            body: JSON.stringify({ error: e.message })
        };
    }
};
