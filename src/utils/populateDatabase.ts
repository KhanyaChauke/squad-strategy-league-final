
import { db } from "@/integrations/firebase/client";
import { collection, addDoc, getDocs, query, where, writeBatch, doc } from "firebase/firestore";

const BASE_URL = "https://api-football-v1.p.rapidapi.com/v3";
const LEAGUE_ID = 288; // Premier Soccer League
const SEASON = 2024;

interface ApiPlayer {
    id: number;
    name: string;
    age: number;
    number: number;
    position: string;
    photo: string;
}

interface ApiTeam {
    team: {
        id: number;
        name: string;
        logo: string;
    };
    players: ApiPlayer[];
}

// --------------------------------------------------------------------------
// OPTION: If you cannot access the API Setup UI, paste your key here:
const HARDCODED_API_KEY = "1a5d324f62mshf82070b791b2f3ap10994fjsnd9dc8ed92749"; // Paste key between quotes, e.g. "your-key-here"
// --------------------------------------------------------------------------

export async function populateDatabaseWithApiData(apiKey?: string) {
    const effectiveKey = apiKey || HARDCODED_API_KEY;

    if (!effectiveKey) {
        return { success: false, error: "No API Key provided. Please enter it in the App UI or hardcode it in populateDatabase.ts" };
    }

    console.log("Starting database population with key ending in...", effectiveKey.slice(-4));

    try {
        // 1. Fetch Teams
        console.log("Fetching teams...");
        const teamsResponse = await fetch(`${BASE_URL}/teams?league=${LEAGUE_ID}&season=${SEASON}`, {
            method: 'GET',
            headers: {
                'X-RapidAPI-Key': effectiveKey,
                'X-RapidAPI-Host': 'api-football-v1.p.rapidapi.com'
            }
        });

        const teamsData = await teamsResponse.json();
        const teams = teamsData.response;
        console.log(`Found ${teams.length} teams.`);

        let totalPlayers = 0;
        const batchSize = 500; // Firestore batch limit
        let batch = writeBatch(db);
        let operationCount = 0;

        // 2. Fetch Squad for each team
        for (const teamItem of teams) {
            const teamId = teamItem.team.id;
            const teamName = teamItem.team.name;
            console.log(`Fetching squad for ${teamName} (${teamId})...`);

            const squadResponse = await fetch(`${BASE_URL}/players/squads?team=${teamId}`, {
                method: 'GET',
                headers: {
                    'X-RapidAPI-Key': effectiveKey,
                    'X-RapidAPI-Host': 'api-football-v1.p.rapidapi.com'
                }
            });

            const squadData = await squadResponse.json();

            if (!squadData.response || squadData.response.length === 0) {
                console.log(`No squad data for ${teamName}`);
                continue;
            }

            const squad = squadData.response[0].players;

            for (const player of squad) {
                // Transform to our Player format
                // Note: API doesn't give detailed stats in the squad endpoint, so we'll randomize stats for now
                // to make the game playable, or set defaults.

                const positionMap: Record<string, string> = {
                    'Goalkeeper': 'GK',
                    'Defender': 'DEF',
                    'Midfielder': 'MID',
                    'Attacker': 'ATT'
                };

                const mappedPosition = positionMap[player.position] || 'MID';

                // Generate random stats based on position for gameplay
                const baseRating = Math.floor(Math.random() * (85 - 65) + 65);

                const newPlayer = {
                    name: player.name,
                    position: mappedPosition,
                    team: teamName,
                    nationality: "South Africa", // Defaulting as squad endpoint might not have it, or we can fetch detailed player profile but that costs more requests
                    rating: baseRating,
                    pace: Math.floor(Math.random() * 20 + 70),
                    shooting: Math.floor(Math.random() * 20 + 60),
                    passing: Math.floor(Math.random() * 20 + 60),
                    defending: Math.floor(Math.random() * 20 + 50),
                    dribbling: Math.floor(Math.random() * 20 + 60),
                    physical: Math.floor(Math.random() * 20 + 60),
                    price: baseRating * 1000000, // Simple price formula
                    imageUrl: player.photo
                };

                const playerRef = doc(collection(db, "players"));
                batch.set(playerRef, newPlayer);
                operationCount++;
                totalPlayers++;

                if (operationCount >= batchSize) {
                    await batch.commit();
                    batch = writeBatch(db);
                    operationCount = 0;
                }
            }

            // Sleep briefly to avoid hitting rate limits too hard (though 100/day is the hard limit)
            await new Promise(resolve => setTimeout(resolve, 1000));
        }

        if (operationCount > 0) {
            await batch.commit();
        }

        console.log(`Successfully uploaded ${totalPlayers} players to Firestore.`);
        return { success: true, count: totalPlayers };

    } catch (error: any) {
        console.error("Error populating database:", error);
        return { success: false, error: error.message };
    }
}
