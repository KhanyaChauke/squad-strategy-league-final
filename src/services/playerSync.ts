import { db } from '@/integrations/firebase/client';
import { fetchTeamData, TransformedPlayer } from './footballDataApi';
import { collection, writeBatch, doc } from 'firebase/firestore';

export const syncPlayersToFirestore = async (): Promise<number> => {
    console.log("Starting player sync process...");
    try {
        // 1. Fetch data from API (or fallback if API fails)
        const players = await fetchTeamData();

        if (!players || players.length === 0) {
            console.warn("No players returned to sync.");
            return 0;
        }

        console.log(`Preparing to sync ${players.length} players to Firestore...`);

        // 2. Batch write to Firestore
        // Firestore allows max 500 operations per batch.
        const chunkSize = 450;
        let totalSynced = 0;

        for (let i = 0; i < players.length; i += chunkSize) {
            const chunk = players.slice(i, i + chunkSize);
            const batch = writeBatch(db);

            chunk.forEach(player => {
                const playerRef = doc(db, 'players', player.id);
                batch.set(playerRef, player, { merge: true });
            });

            await batch.commit();
            totalSynced += chunk.length;
            console.log(`Batch committed: ${totalSynced}/${players.length}`);
        }

        console.log("Sync completed successfully.");
        return totalSynced;

    } catch (error) {
        console.error("Error syncing players to Firestore:", error);
        throw error;
    }
};
