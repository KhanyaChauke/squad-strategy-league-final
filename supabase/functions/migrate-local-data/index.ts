import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Enhanced PSL Players Data
const enhancedPSLData = [
  // Kaizer Chiefs
  { id: "001", name: "Itumeleng Khune", position: "GK", club: "Kaizer Chiefs", rating: 85, pace: 45, shooting: 20, passing: 70, defending: 15, dribbling: 40, physical: 75 },
  { id: "002", name: "Keagan Dolly", position: "MID", club: "Kaizer Chiefs", rating: 82, pace: 75, shooting: 78, passing: 80, defending: 35, dribbling: 85, physical: 70 },
  { id: "003", name: "Khama Billiat", position: "ATT", club: "Kaizer Chiefs", rating: 84, pace: 88, shooting: 75, passing: 78, defending: 25, dribbling: 90, physical: 65 },
  { id: "004", name: "Siyabonga Ngezana", position: "DEF", club: "Kaizer Chiefs", rating: 76, pace: 65, shooting: 25, passing: 70, defending: 85, dribbling: 45, physical: 80 },
  { id: "005", name: "Yusuf Maart", position: "MID", club: "Kaizer Chiefs", rating: 79, pace: 70, shooting: 65, passing: 82, defending: 75, dribbling: 70, physical: 78 },
  
  // Orlando Pirates
  { id: "006", name: "Sipho Chaine", position: "GK", club: "Orlando Pirates", rating: 82, pace: 50, shooting: 25, passing: 75, defending: 20, dribbling: 45, physical: 80 },
  { id: "007", name: "Thembinkosi Lorch", position: "ATT", club: "Orlando Pirates", rating: 86, pace: 85, shooting: 82, passing: 75, defending: 30, dribbling: 88, physical: 70 },
  { id: "008", name: "Goodman Mosele", position: "MID", club: "Orlando Pirates", rating: 77, pace: 72, shooting: 60, passing: 78, defending: 70, dribbling: 75, physical: 68 },
  { id: "009", name: "Innocent Maela", position: "DEF", club: "Orlando Pirates", rating: 78, pace: 75, shooting: 30, passing: 72, defending: 82, dribbling: 55, physical: 78 },
  { id: "010", name: "Monnapule Saleng", position: "ATT", club: "Orlando Pirates", rating: 80, pace: 90, shooting: 70, passing: 65, defending: 25, dribbling: 85, physical: 65 },
  
  // Mamelodi Sundowns
  { id: "011", name: "Denis Onyango", position: "GK", club: "Mamelodi Sundowns", rating: 88, pace: 40, shooting: 15, passing: 80, defending: 25, dribbling: 50, physical: 85 },
  { id: "012", name: "Themba Zwane", position: "MID", club: "Mamelodi Sundowns", rating: 87, pace: 78, shooting: 80, passing: 88, defending: 45, dribbling: 90, physical: 70 },
  { id: "013", name: "Peter Shalulile", position: "ATT", club: "Mamelodi Sundowns", rating: 85, pace: 82, shooting: 88, passing: 70, defending: 20, dribbling: 80, physical: 85 },
  { id: "014", name: "Mothobi Mvala", position: "DEF", club: "Mamelodi Sundowns", rating: 83, pace: 70, shooting: 35, passing: 82, defending: 88, dribbling: 60, physical: 85 },
  { id: "015", name: "Marcelo Allende", position: "MID", club: "Mamelodi Sundowns", rating: 81, pace: 75, shooting: 72, passing: 85, defending: 65, dribbling: 82, physical: 75 },
  
  // SuperSport United
  { id: "016", name: "Ricardo Goss", position: "GK", club: "SuperSport United", rating: 80, pace: 48, shooting: 20, passing: 72, defending: 18, dribbling: 42, physical: 78 },
  { id: "017", name: "Bradley Grobler", position: "ATT", club: "SuperSport United", rating: 83, pace: 75, shooting: 85, passing: 70, defending: 25, dribbling: 72, physical: 82 },
  { id: "018", name: "Teboho Mokoena", position: "MID", club: "SuperSport United", rating: 84, pace: 78, shooting: 75, passing: 85, defending: 70, dribbling: 80, physical: 75 },
  { id: "019", name: "Luke Fleurs", position: "DEF", club: "SuperSport United", rating: 79, pace: 72, shooting: 28, passing: 75, defending: 85, dribbling: 58, physical: 80 },
  { id: "020", name: "Sipho Mbule", position: "MID", club: "SuperSport United", rating: 78, pace: 80, shooting: 68, passing: 78, defending: 55, dribbling: 82, physical: 68 },
  
  // Cape Town City
  { id: "021", name: "Darren Keet", position: "GK", club: "Cape Town City", rating: 81, pace: 45, shooting: 22, passing: 74, defending: 20, dribbling: 48, physical: 76 },
  { id: "022", name: "Khanyisa Mayo", position: "ATT", club: "Cape Town City", rating: 79, pace: 85, shooting: 78, passing: 68, defending: 28, dribbling: 82, physical: 72 },
  { id: "023", name: "Thabo Nodada", position: "MID", club: "Cape Town City", rating: 77, pace: 75, shooting: 65, passing: 80, defending: 68, dribbling: 75, physical: 70 },
  { id: "024", name: "Terrence Mashego", position: "DEF", club: "Cape Town City", rating: 76, pace: 78, shooting: 32, passing: 70, defending: 80, dribbling: 62, physical: 75 },
  { id: "025", name: "Darwin González", position: "MID", club: "Cape Town City", rating: 75, pace: 70, shooting: 70, passing: 75, defending: 50, dribbling: 78, physical: 68 },
];

// Sample users data from localStorage
const sampleUsers = [
  {
    id: "demo-user-1",
    username: "FantasyKing",
    team_name: "Dream Team FC",
    budget: 950000000,
    formation: "4-3-3"
  },
  {
    id: "demo-user-2", 
    username: "SoccerPro",
    team_name: "Victory United",
    budget: 890000000,
    formation: "4-4-2"
  }
];

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? ''
    );

    console.log('Starting local data migration...');

    // Migrate players data
    console.log('Migrating players data...');
    const playersToInsert = enhancedPSLData.map(player => {
      // Generate realistic price based on rating and position
      let basePrice = player.rating * 1000000; // Base price from rating
      
      // Position multipliers
      const positionMultipliers = {
        'GK': 0.8,
        'DEF': 0.9, 
        'MID': 1.1,
        'ATT': 1.3
      };
      
      const multiplier = positionMultipliers[player.position as keyof typeof positionMultipliers] || 1.0;
      const price = Math.round(basePrice * multiplier);

      return {
        id: crypto.randomUUID(),
        name: player.name,
        position: player.position,
        team: player.club,
        price: price,
        status: 'available'
      };
    });

    const { data: playersData, error: playersError } = await supabaseClient
      .from('players')
      .insert(playersToInsert)
      .select();

    if (playersError) {
      console.error('Error inserting players:', playersError);
      return new Response(
        JSON.stringify({ error: 'Failed to insert players', details: playersError }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log(`Inserted ${playersData?.length} players`);

    // Migrate users data
    console.log('Migrating users data...');
    const usersToInsert = sampleUsers.map(user => ({
      id: crypto.randomUUID(),
      username: user.username,
      team_name: user.team_name,
      budget: user.budget,
      formation: user.formation
    }));

    const { data: usersData, error: usersError } = await supabaseClient
      .from('users')
      .insert(usersToInsert)
      .select();

    if (usersError) {
      console.error('Error inserting users:', usersError);
      return new Response(
        JSON.stringify({ error: 'Failed to insert users', details: usersError }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log(`Inserted ${usersData?.length} users`);

    // Create sample user teams (each user gets a basic squad)
    if (usersData && playersData && usersData.length > 0 && playersData.length > 0) {
      console.log('Creating sample user teams...');
      
      const { data: gameweek } = await supabaseClient
        .from('gameweeks')
        .select('id')
        .eq('is_active', true)
        .single();

      if (gameweek) {
        // Create a basic squad for the first user
        const userId = usersData[0].id;
        const gameweekId = gameweek.id;
        
        // Select players for a 4-4-2 formation
        const gk = playersData.find(p => p.position === 'GK');
        const defenders = playersData.filter(p => p.position === 'DEF').slice(0, 4);
        const midfielders = playersData.filter(p => p.position === 'MID').slice(0, 4);
        const attackers = playersData.filter(p => p.position === 'ATT').slice(0, 2);

        const squadPlayers = [gk, ...defenders, ...midfielders, ...attackers].filter(Boolean);

        const userTeamEntries = squadPlayers.map((player, index) => ({
          user_id: userId,
          gameweek_id: gameweekId,
          player_id: player.id,
          is_starting: true,
          is_captain: index === 10, // Make the second attacker captain
          is_vice_captain: index === 9 // Make the first attacker vice captain
        }));

        const { error: teamError } = await supabaseClient
          .from('user_teams')
          .insert(userTeamEntries);

        if (teamError) {
          console.error('Error creating user team:', teamError);
        } else {
          console.log('Created sample user team');
        }
      }
    }

    console.log('Local data migration completed successfully');

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: `Successfully migrated ${playersData?.length || 0} players and ${usersData?.length || 0} users to database` 
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in migrate-local-data function:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});