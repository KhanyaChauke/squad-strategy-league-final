
import { db } from '@/integrations/firebase/client';
import { doc, setDoc, getDoc, collection, getDocs } from 'firebase/firestore';
import { PSLStanding, standings2023_2024, standings2024_2025 } from '@/data/historicalStandings';

// Collection Name
const STANDINGS_COLLECTION = 'league_standings';

// Save standings for a specific season
export const saveSeasonStandings = async (season: string, standings: PSLStanding[]) => {
    try {
        const seasonId = season.replace('/', '_'); // 2023/2024 -> 2023_2024
        const docRef = doc(db, STANDINGS_COLLECTION, seasonId);
        await setDoc(docRef, {
            season: season,
            teams: standings,
            updatedAt: new Date().toISOString()
        });
        console.log(`Saved standings for ${season}`);
        return true;
    } catch (error) {
        console.error("Error saving standings:", error);
        return false;
    }
};

// Fetch standings for a specific season
export const getSeasonStandingsFromDb = async (season: string): Promise<PSLStanding[] | null> => {
    try {
        const seasonId = season.replace('/', '_');
        const docRef = doc(db, STANDINGS_COLLECTION, seasonId);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
            return docSnap.data().teams as PSLStanding[];
        } else {
            return null;
        }
    } catch (error) {
        console.error("Error fetching standings:", error);
        return null;
    }
};

// Seed the database with the static historical data
export const seedHistoricalDatabase = async () => {
    await saveSeasonStandings('2023/2024', standings2023_2024);
    await saveSeasonStandings('2024/2025', standings2024_2025);
    return "Seeding Complete";
};
