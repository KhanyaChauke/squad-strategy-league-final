
import fetch from 'node-fetch';

const NETLIFY_URL = 'https://betafpsl.netlify.app/.netlify/functions/news'; // Or localhost if dev

// --- Test 1: News Filtering ---
async function testNewsFiltering() {
    console.log("---------------------------------------------------");
    console.log("🧪 TEST 1: News Filtering Compliance");
    console.log("---------------------------------------------------");

    try {
        console.log(`Fetching news from: ${NETLIFY_URL}`);
        const response = await fetch(NETLIFY_URL);

        if (!response.ok) {
            console.error(`❌ HTTP Error: ${response.status} ${response.statusText}`);
            return;
        }

        const data = await response.json();

        if (!data.articles || data.articles.length === 0) {
            console.warn("⚠️ No articles returned. Cannot verify filtering.");
            return;
        }

        console.log(`✅ Fetched ${data.articles.length} articles from ${data.source}`);

        let passCount = 0;
        let failCount = 0;

        // Strict keywords that MUST be present in valid results
        const keywords = ['soccer', 'football', 'psl', 'chiefs', 'pirates', 'sundowns', 'bafana', 'betway'];

        data.articles.forEach((article, index) => {
            const content = (article.title + " " + article.summary).toLowerCase();
            const hasKeyword = keywords.some(k => content.includes(k));

            if (hasKeyword) {
                passCount++;
            } else {
                failCount++;
                console.warn(`    ⚠️ Potential Non-Football Article: "${article.title}"`);
            }
        });

        if (failCount === 0) {
            console.log(`✅ ALL ${passCount} articles appear to be football-related.`);
        } else {
            console.log(`⚠️ ${failCount} articles might be unrelated (or just missing keywords).`);
        }

    } catch (error) {
        console.error("❌ News Test Failed:", error.message);
    }
}

// --- Test 2: Budget Logic Logic Verification ---
function testBudgetLogic() {
    console.log("\n---------------------------------------------------");
    console.log("🧪 TEST 2: Budget Calculation Logic (Simulation)");
    console.log("---------------------------------------------------");

    // Scenario A: String vs Number bug
    const userBudgetStr = "100000"; // User budget as string (simulating DB glitch)
    const playerPrice = 50000;

    console.log(`Scenario: String Budget ("${userBudgetStr}") vs Number Price (${playerPrice})`);

    // Old flawed logic simulation
    const oldLogicResult = userBudgetStr + playerPrice; // "10000050000"
    console.log(`    ❌ [Old Logic Risk] 'budget + price' = ${oldLogicResult} (Concatenation!)`);

    // New Fixed Logic
    const newLogicAdd = Number(userBudgetStr) + Number(playerPrice);
    const newLogicSub = Number(userBudgetStr) - Number(playerPrice);

    if (newLogicAdd === 150000 && newLogicSub === 50000) {
        console.log(`    ✅ [New Logic] Number() casting works correctly:`);
        console.log(`       Addition: ${newLogicAdd}`);
        console.log(`       Subtraction: ${newLogicSub}`);
    } else {
        console.error(`    ❌ [New Logic] Failed!`);
    }

    // Scenario B: Affordability Check
    const lowBudget = "40000";
    const check = Number(lowBudget) < playerPrice; // 40000 < 50000 -> true

    if (check) {
        console.log(`    ✅ [New Logic] Affordability check passed (40000 is less than 50000).`);
    } else {
        console.error(`    ❌ [New Logic] Affordability check fail.`);
    }
}

// execute
async function runTests() {
    testBudgetLogic();
    await testNewsFiltering();
}

runTests();
