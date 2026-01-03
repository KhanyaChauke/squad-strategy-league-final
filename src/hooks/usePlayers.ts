import { useState, useEffect } from 'react';
import { db } from '@/integrations/firebase/client';
import { collection, getDocs, QuerySnapshot, DocumentData } from 'firebase/firestore';
import { playersDatabase as fallbackPlayers, Player } from '@/data/playersData';

export const usePlayers = () => {
    const [players, setPlayers] = useState<Player[]>(fallbackPlayers);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchPlayers = async () => {
            try {
                console.log("Fetching players from Firestore...");
                const querySnapshot = await getDocs(collection(db, 'players'));

                if (!querySnapshot.empty) {
                    const dbPlayers: Player[] = [];
                    querySnapshot.forEach((doc) => {
                        dbPlayers.push(doc.data() as Player);
                    });
                    console.log(`Loaded ${dbPlayers.length} players from database.`);
                    setPlayers(dbPlayers);
                } else {
                    console.warn("Firestore 'players' collection is empty. Using fallback data.");
                    // players is already set to fallbackPlayers
                }
            } catch (err) {
                console.error("Error fetching players from DB:", err);
                setError("Failed to load players from database.");
                // players remains fallback
            } finally {
                setLoading(false);
            }
        };

        fetchPlayers();
    }, []);

    return { players, loading, error };
};
