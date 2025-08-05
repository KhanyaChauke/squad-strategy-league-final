import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface FootballDataPlayer {
  id: number;
  name: string;
  position: string;
  dateOfBirth: string;
  nationality: string;
}

interface FootballDataTeam {
  id: number;
  name: string;
  shortName: string;
  tla: string;
  squad: FootballDataPlayer[];
}

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

    const footballDataApiKey = Deno.env.get('FOOTBALL_DATA_API_KEY');
    
    if (!footballDataApiKey) {
      return new Response(
        JSON.stringify({ error: 'Football Data API key not configured' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log('Starting database population...');

    // Fetch South African Premier League data (Competition ID: 2031)
    const response = await fetch('https://api.football-data.org/v4/competitions/BSA/teams', {
      headers: {
        'X-Auth-Token': footballDataApiKey,
      },
    });

    if (!response.ok) {
      console.error('Failed to fetch teams:', response.status, response.statusText);
      return new Response(
        JSON.stringify({ error: `API request failed: ${response.status}` }),
        { status: response.status, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const data = await response.json();
    const teams = data.teams as FootballDataTeam[];

    console.log(`Found ${teams.length} teams`);

    const playersToInsert = [];

    // Process each team and their players
    for (const team of teams) {
      console.log(`Processing team: ${team.name}`);
      
      for (const player of team.squad || []) {
        // Map position from API to our format
        let mappedPosition = 'MID';
        if (player.position) {
          const pos = player.position.toUpperCase();
          if (pos.includes('GOALKEEPER') || pos.includes('GK')) {
            mappedPosition = 'GK';
          } else if (pos.includes('DEFENCE') || pos.includes('DEFENDER') || pos.includes('DEF')) {
            mappedPosition = 'DEF';
          } else if (pos.includes('MIDFIELD') || pos.includes('MID')) {
            mappedPosition = 'MID';
          } else if (pos.includes('FORWARD') || pos.includes('ATTACK') || pos.includes('ATT')) {
            mappedPosition = 'ATT';
          }
        }

        // Generate realistic price based on position
        let basePrice = 50000000; // 50M base
        if (mappedPosition === 'GK') basePrice = 40000000;
        else if (mappedPosition === 'DEF') basePrice = 60000000;
        else if (mappedPosition === 'MID') basePrice = 80000000;
        else if (mappedPosition === 'ATT') basePrice = 100000000;

        // Add some randomness
        const price = basePrice + Math.random() * 50000000;

        playersToInsert.push({
          id: crypto.randomUUID(),
          name: player.name,
          position: mappedPosition,
          team: team.shortName || team.name,
          price: Math.round(price),
          status: 'available'
        });
      }
    }

    console.log(`Inserting ${playersToInsert.length} players into database...`);

    // Insert players into database
    const { data: insertedPlayers, error: playersError } = await supabaseClient
      .from('players')
      .insert(playersToInsert);

    if (playersError) {
      console.error('Error inserting players:', playersError);
      return new Response(
        JSON.stringify({ error: 'Failed to insert players', details: playersError }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Create initial gameweek
    const { data: existingGameweek } = await supabaseClient
      .from('gameweeks')
      .select('id')
      .eq('number', 1)
      .maybeSingle();

    if (!existingGameweek) {
      const nextWeek = new Date();
      nextWeek.setDate(nextWeek.getDate() + 7);

      const { error: gameweekError } = await supabaseClient
        .from('gameweeks')
        .insert({
          number: 1,
          deadline: nextWeek.toISOString(),
          is_active: true
        });

      if (gameweekError) {
        console.error('Error creating gameweek:', gameweekError);
      } else {
        console.log('Created initial gameweek');
      }
    }

    console.log('Database population completed successfully');

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: `Successfully populated database with ${playersToInsert.length} players from ${teams.length} teams` 
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in populate-database function:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});