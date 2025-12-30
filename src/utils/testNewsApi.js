
const TEST_KEY = "1a5d324f62mshf82070b791b2f3ap10994fjsnd9dc8ed92749";

async function testApi() {
    console.log("Testing RapidAPI News Fetch...");
    const apiHost = 'free-livescore-api.p.rapidapi.com';
    try {
        const response = await fetch(`https://${apiHost}/news?league=PSL&country=za`, {
            method: 'GET',
            headers: {
                'X-RapidAPI-Key': TEST_KEY,
                'X-RapidAPI-Host': apiHost
            }
        });

        console.log("Response status:", response.status);
        if (response.ok) {
            const data = await response.json();
            console.log("Data received:", JSON.stringify(data).substring(0, 200) + "...");
        } else {
            console.log("Error response:", await response.text());
        }

    } catch (error) {
        console.error("Fetch failed:", error);
    }
}

testApi();
