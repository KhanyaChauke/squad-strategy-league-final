import { supabase } from "@/integrations/supabase/client";

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
    const { data, error } = await supabase
      .from('players')
      .insert([examplePlayer])
      .select();

    if (error) {
      console.error('Error uploading player:', error);
      return { success: false, error: error.message };
    }

    console.log('Player uploaded successfully:', data);
    return { success: true, data };
  } catch (err) {
    console.error('Unexpected error:', err);
    return { success: false, error: 'Unexpected error occurred' };
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
    const { data, error } = await supabase
      .from('players')
      .insert(players)
      .select();

    if (error) {
      console.error('Error uploading players:', error);
      return { success: false, error: error.message };
    }

    console.log(`${players.length} players uploaded successfully`);
    return { success: true, data };
  } catch (err) {
    console.error('Unexpected error:', err);
    return { success: false, error: 'Unexpected error occurred' };
  }
}