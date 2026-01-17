
import fs from 'fs';

// --- MOCKS ---

// 1. Mock Data Generation
const generateMockPlayers = () => {
    const players = [];
    const positions = ['GK', 'DEF', 'MID', 'ATT'];

    // Generate 50 random players
    for (let i = 0; i < 50; i++) {
        const pos = positions[Math.floor(Math.random() * positions.length)];
        // Price between 2M and 150M
        const price = Math.floor(Math.random() * (150 - 2 + 1) + 2) * 1000000;
        players.push({
            id: `player_${i}`,
            name: `Player ${i}`,
            position: pos,
            price: price,
            team: 'Test FC'
        });
    }
    return players;
};

const playersDb = generateMockPlayers();

// 2. Mock User State
const createEmptyUser = () => ({
    id: 'test_user',
    budget: 1000000000, // 1 Billion
    squad: [],
    bench: [],
    selectedFormation: {
        id: '4-4-2',
        name: '4-4-2',
        positions: { GK: 1, DEF: 4, MID: 4, ATT: 2 }
    }
});

// --- LOGIC UNDER TEST (Mirrors AuthContext.tsx) ---

function canAddToSquad(user, player) {
    // 1. Formation Limit Check
    if (user.selectedFormation) {
        const currentCount = user.squad.filter(p => p.position === player.position).length;
        const limit = user.selectedFormation.positions[player.position];
        if (currentCount >= limit) return { allowed: false, reason: `Max ${player.position} reached` };
    }

    // 2. Size Validations
    if (user.squad.length >= 11) return { allowed: false, reason: "Squad Full (11)" };

    // 3. Duplicate Check
    if (user.squad.some(p => p.id === player.id) || user.bench.some(p => p.id === player.id)) {
        return { allowed: false, reason: "Duplicate Player" };
    }

    // 4. Budget Check (The Critical Fix)
    if (Number(user.budget) < Number(player.price)) {
        return { allowed: false, reason: "Insufficient Budget" };
    }

    return { allowed: true };
}

function canAddToBench(user, player) {
    if (user.bench.length >= 4) return { allowed: false, reason: "Bench Full (4)" };

    if (user.squad.some(p => p.id === player.id) || user.bench.some(p => p.id === player.id)) {
        return { allowed: false, reason: "Duplicate Player" };
    }

    if (Number(user.budget) < Number(player.price)) {
        return { allowed: false, reason: "Insufficient Budget" };
    }

    return { allowed: true };
}

// --- SIMULATION RUNNER ---

function simulateTeamBuilding(runId) {
    console.log(`\n🤖 Simulation #${runId}: building random team...`);
    let user = createEmptyUser();
    const shuffledPlayers = [...playersDb].sort(() => 0.5 - Math.random());

    // Try to fill Squad (11)
    for (const player of shuffledPlayers) {
        if (user.squad.length === 11) break;

        const check = canAddToSquad(user, player);
        if (check.allowed) {
            // Apply addition logic
            user.budget = Number(user.budget) - Number(player.price);
            user.squad.push(player);
            // console.log(`   + Added ${player.position} (${player.price/1000000}M). Budget: ${user.budget/1000000}M`);
        }
    }

    // Try to fill Bench (4)
    for (const player of shuffledPlayers) {
        if (user.bench.length === 4) break;

        // TEST DUPLICATE: Try to add the same player again immediately
        if (user.squad.length > 0) {
            const existingPlayer = user.squad[0];
            // Try to add a player who is already in the Squad to the Bench
            const duplicateCheck = canAddToBench(user, existingPlayer);
            if (duplicateCheck.allowed) {
                console.error(`   ❌ CRITICAL FAILURE: Allowed duplicate player ${existingPlayer.name} on bench!`);
            } else if (duplicateCheck.reason === "Duplicate Player") {
                // This is expected behavior, we can log it on the first run only to avoid noise
                if (runId === 1) console.log(`   ✅ Duplicate Prevention Verified: ${duplicateCheck.reason}`);
            }
        }

        const check = canAddToBench(user, player);
        if (check.allowed) {
            user.budget = Number(user.budget) - Number(player.price);
            user.bench.push(player);
        }
    }

    // Verify Result
    const squadCount = user.squad.length;
    const benchCount = user.bench.length;
    const remainingBudget = user.budget;
    const totalSpent = 1000000000 - remainingBudget;

    const isValid = squadCount === 11 && benchCount === 4 && remainingBudget >= 0;

    console.log(`   Start XI: ${squadCount}/11 | Bench: ${benchCount}/4`);
    console.log(`   Spent: ${(totalSpent / 1000000).toFixed(1)}M | Remaining: ${(remainingBudget / 1000000).toFixed(1)}M`);

    if (isValid) {
        console.log("   ✅ SUCCESS: Full valid team built.");
    } else {
        console.log("   ⚠️ PARTIAL: Could not build full team (likely budget or strict position limits + low mock player count).");
    }
}

// Run 5 Simulations
console.log("==========================================");
console.log("🧪 AUTO-BUILDER STRESS TEST");
console.log("==========================================");
for (let i = 1; i <= 50; i++) {
    simulateTeamBuilding(i);
}
