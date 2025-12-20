              import { db } from "@/integrations/firebase/client";
import { collection, addDoc } from "firebase/firestore";

/**
 * Example of uploading one player to the database
 * This shows the exact structure needed for inserting player data
 */
export async function uploadSinglePlayerExample() {
  // Example player data - this is how you format data for the database
  const examplePlayer = {
    name: "Percy Tau",
    position: "ATT",
    team: "Mamelodi Sundowns",
    nationality: "South Africa",
    rating: 85,
    pace: 88,
    shooting: 82,
    passing: 78,
    defending: 35,
    dribbling: 86,
    physical: 75,
    price: 120000000 // Price in cents (1.2M in display)
  };

  try {
    const docRef = await addDoc(collection(db, "players"), examplePlayer);
    console.log('Player uploaded successfully with ID:', docRef.id);
    return { success: true, data: { id: docRef.id, ...examplePlayer } };
  } catch (err: any) {
    console.error('Unexpected error:', err);
    return { success: false, error: err.message || 'Unexpected error occurred' };
  }
}

/**
 * Upload multiple players at once
 */
export async function uploadMultiplePlayers(players: Array<{
  name: string;
  position: string;
  team: string;
  nationality: string;
  rating: number;
  pace: number;
  shooting: number;
  passing: number;
  defending: number;
  dribbling: number;
  physical: number;
  price: number;
}>) {
  try {
    const playersCollection = collection(db, "players");
    const uploadPromises = players.map(player => addDoc(playersCollection, player));

    const results = await Promise.all(uploadPromises);

    console.log(`${results.length} players uploaded successfully`);
    return { success: true, data: results.map(r => r.id) };
  } catch (err: any) {
    console.error('Unexpected error:', err);
    return { success: false, error: err.message || 'Unexpected error occurred' };
  }
}