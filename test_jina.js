
const JINA_API_KEY = "jina_dbf46d3721184e1caf32abf59aca6abe1GfgenzyFdPyFlnA9c3ZT3bs3J-k";
const query = '"Betway Premiership" OR "Kaizer Chiefs" OR "Orlando Pirates" OR "Mamelodi Sundowns" OR "PSL" news';

async function testJina() {
    try {
        console.log("Testing Jina API...");
        const url = `https://s.jina.ai/${encodeURIComponent(query)}`;
        console.log("URL:", url);

        const response = await fetch(url, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${JINA_API_KEY}`,
                'Accept': 'application/json',
                'X-Retain-Images': 'none'
            }
        });

        console.log("Status:", response.status);
        const text = await response.text();
        console.log("Raw Response Length:", text.length);

        try {
            const data = JSON.parse(text);
            const articles = data.data || data;
            console.log("Articles found:", Array.isArray(articles) ? articles.length : "Not an array");

            if (Array.isArray(articles)) {
                articles.slice(0, 3).forEach((item, i) => {
                    console.log(`\n--- Article ${i + 1} ---`);
                    console.log("Title:", item.title);
                    console.log("URL:", item.url);
                    console.log("Date:", item.publishedTime || item.date || item.publishedAt);
                });
            } else {
                console.log("Response structure:", data);
            }
        } catch (e) {
            console.log("JSON Parse Error:", e);
            console.log("First 500 chars:", text.slice(0, 500));
        }

    } catch (e) {
        console.error("Request Error:", e);
    }
}

testJina();
