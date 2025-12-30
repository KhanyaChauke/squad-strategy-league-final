interface FootballDataPlayer {
  id: number;
  name: string;
  position: string;
  dateOfBirth: string;
  nationality: string;
  value?: number;
}

interface FootballDataTeam {
  id: number;
  name: string;
  squad: FootballDataPlayer[];
}

interface TransformedPlayer {
  id: string;
  name: string;
  position: 'GK' | 'DEF' | 'MID' | 'ATT';
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
  imageUrl?: string;
}

const API_KEY = import.meta.env.VITE_RAPID_API_KEY || '1a5d324f62mshf82070b791b2f3ap10994fjsnd9dc8ed92749';
const BASE_URL = 'https://api.football-data.org/v4';

// Helper function to map Football-Data.org positions to our format
const mapPosition = (position: string): 'GK' | 'DEF' | 'MID' | 'ATT' => {
  const pos = position.toLowerCase();
  if (pos.includes('goalkeeper') || pos.includes('keeper')) return 'GK';
  if (pos.includes('defence') || pos.includes('defender') || pos.includes('back')) return 'DEF';
  if (pos.includes('midfield') || pos.includes('midfielder')) return 'MID';
  if (pos.includes('attack') || pos.includes('forward') || pos.includes('striker') || pos.includes('winger')) return 'ATT';
  return 'MID'; // Default fallback
};

// Generate realistic stats based on position and some randomization
const generatePlayerStats = (position: 'GK' | 'DEF' | 'MID' | 'ATT') => {
  const baseStats = {
    GK: { pace: 45, shooting: 15, passing: 75, defending: 85, dribbling: 35, physical: 85, rating: 78 },
    DEF: { pace: 70, shooting: 30, passing: 80, defending: 88, dribbling: 60, physical: 85, rating: 80 },
    MID: { pace: 75, shooting: 70, passing: 85, defending: 65, dribbling: 82, physical: 75, rating: 82 },
    ATT: { pace: 85, shooting: 88, passing: 70, defending: 30, dribbling: 85, physical: 78, rating: 84 }
  };

  const base = baseStats[position];
  const variance = 10; // ±10 points variance

  return {
    pace: Math.max(20, Math.min(99, base.pace + (Math.random() * variance * 2 - variance))),
    shooting: Math.max(20, Math.min(99, base.shooting + (Math.random() * variance * 2 - variance))),
    passing: Math.max(20, Math.min(99, base.passing + (Math.random() * variance * 2 - variance))),
    defending: Math.max(20, Math.min(99, base.defending + (Math.random() * variance * 2 - variance))),
    dribbling: Math.max(20, Math.min(99, base.dribbling + (Math.random() * variance * 2 - variance))),
    physical: Math.max(20, Math.min(99, base.physical + (Math.random() * variance * 2 - variance))),
    rating: Math.max(60, Math.min(95, base.rating + (Math.random() * variance * 2 - variance)))
  };
};

// Calculate player cost based on rating and position
const calculatePlayerCost = (rating: number, position: 'GK' | 'DEF' | 'MID' | 'ATT'): number => {
  const baseMultiplier = {
    GK: 0.8,
    DEF: 0.9,
    MID: 1.1,
    ATT: 1.3
  };

  // Base cost calculation: rating * position multiplier * base amount
  const baseCost = rating * baseMultiplier[position] * 1000000;

  // Add some variance
  const variance = baseCost * 0.2;
  const finalCost = baseCost + (Math.random() * variance * 2 - variance);

  // Reduce to 10% of original value
  return Math.round((finalCost * 0.1) / 1000000) * 1000000; // Round to nearest million
};

export const fetchTeamData = async (competitionId: number = 2019): Promise<TransformedPlayer[]> => {
  try {
    const response = await fetch(`${BASE_URL}/competitions/${competitionId}/teams`, {
      headers: {
        'X-Auth-Token': API_KEY
      }
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    const allPlayers: TransformedPlayer[] = [];

    // Process each team
    for (const team of data.teams.slice(0, 10)) { // Limit to first 10 teams for demo
      try {
        const teamResponse = await fetch(`${BASE_URL}/teams/${team.id}`, {
          headers: {
            'X-Auth-Token': API_KEY
          }
        });

        if (teamResponse.ok) {
          const teamData = await teamResponse.json();

          // Process squad members
          teamData.squad?.forEach((player: FootballDataPlayer) => {
            if (player.name && player.position) {
              const position = mapPosition(player.position);
              const stats = generatePlayerStats(position);
              const cost = calculatePlayerCost(Math.round(stats.rating), position);

              allPlayers.push({
                id: `api_${player.id}`,
                name: player.name,
                position,
                team: team.name,
                nationality: player.nationality || 'Unknown',
                rating: Math.round(stats.rating),
                pace: Math.round(stats.pace),
                shooting: Math.round(stats.shooting),
                passing: Math.round(stats.passing),
                defending: Math.round(stats.defending),
                dribbling: Math.round(stats.dribbling),
                physical: Math.round(stats.physical),
                price: cost
              });
            }
          });
        }
      } catch (error) {
        console.log(`Failed to fetch team ${team.id}:`, error);
      }
    }

    return allPlayers;
  } catch (error) {
    console.error('Failed to fetch team data:', error);
    return [];
  }
};

// Fallback enhanced PSL data when API is not available
export const getEnhancedPSLData = (): TransformedPlayer[] => {
  const pslTeams = [
    'Mamelodi Sundowns', 'Orlando Pirates', 'Stellenbosch FC', 'Sekhukhune United',
    'Cape Town City', 'TS Galaxy', 'SuperSport United', 'Polokwane City',
    'Golden Arrows', 'Kaizer Chiefs', 'Chippa United', 'AmaZulu',
    'Royal AM', 'Richards Bay', 'Magesi FC', 'Marumo Gallants'
  ];

  // Manual mappings for accurate top players
  const manualPlayers = [
    // Mamelodi Sundowns
    { name: 'Ronwen Williams', team: 'Mamelodi Sundowns', position: 'GK', nationality: 'South Africa', rating: 88 },
    { name: 'Teboho Mokoena', team: 'Mamelodi Sundowns', position: 'MID', nationality: 'South Africa', rating: 86 },
    { name: 'Peter Shalulile', team: 'Mamelodi Sundowns', position: 'ATT', nationality: 'Namibia', rating: 87 },
    { name: 'Themba Zwane', team: 'Mamelodi Sundowns', position: 'MID', nationality: 'South Africa', rating: 85 },
    { name: 'Lucas Ribeiro', team: 'Mamelodi Sundowns', position: 'ATT', nationality: 'Brazil', rating: 86 },
    { name: 'Khuliso Mudau', team: 'Mamelodi Sundowns', position: 'DEF', nationality: 'South Africa', rating: 84 },
    { name: 'Marcelo Allende', team: 'Mamelodi Sundowns', position: 'MID', nationality: 'Chile', rating: 84 },
    { name: 'Iqraam Rayners', team: 'Mamelodi Sundowns', position: 'ATT', nationality: 'South Africa', rating: 84 },
    { name: 'Grant Kekana', team: 'Mamelodi Sundowns', position: 'DEF', nationality: 'South Africa', rating: 83 },
    { name: 'Mothobi Mvala', team: 'Mamelodi Sundowns', position: 'DEF', nationality: 'South Africa', rating: 82 },
    { name: 'Aubrey Modiba', team: 'Mamelodi Sundowns', position: 'DEF', nationality: 'South Africa', rating: 81 },
    { name: 'Rivaldo Coetzee', team: 'Mamelodi Sundowns', position: 'MID', nationality: 'South Africa', rating: 80 },

    // Orlando Pirates
    { name: 'Patrick Maswanganyi', team: 'Orlando Pirates', position: 'MID', nationality: 'South Africa', rating: 85 },
    { name: 'Monnapule Saleng', team: 'Orlando Pirates', position: 'ATT', nationality: 'South Africa', rating: 84 },
    { name: 'Relebohile Mofokeng', team: 'Orlando Pirates', position: 'ATT', nationality: 'South Africa', rating: 83 },
    { name: 'Tshegofatso Mabasa', team: 'Orlando Pirates', position: 'ATT', nationality: 'South Africa', rating: 84 },
    { name: 'Olisa Ndah', team: 'Orlando Pirates', position: 'DEF', nationality: 'Nigeria', rating: 83 },
    { name: 'Evidence Makgopa', team: 'Orlando Pirates', position: 'ATT', nationality: 'South Africa', rating: 80 },
    { name: 'Thalente Mbatha', team: 'Orlando Pirates', position: 'MID', nationality: 'South Africa', rating: 81 },
    { name: 'Sipho Chaine', team: 'Orlando Pirates', position: 'GK', nationality: 'South Africa', rating: 82 },
    { name: 'Deon Hotto', team: 'Orlando Pirates', position: 'DEF', nationality: 'Namibia', rating: 81 },
    { name: 'Miguel Timm', team: 'Orlando Pirates', position: 'MID', nationality: 'South Africa', rating: 80 },
    { name: 'Innocent Maela', team: 'Orlando Pirates', position: 'DEF', nationality: 'South Africa', rating: 79 },
    { name: 'Thabiso Monyane', team: 'Orlando Pirates', position: 'DEF', nationality: 'South Africa', rating: 78 },

    // Kaizer Chiefs
    { name: 'Gaston Sirino', team: 'Kaizer Chiefs', position: 'MID', nationality: 'Uruguay', rating: 82 },
    { name: 'Ranga Chivaviro', team: 'Kaizer Chiefs', position: 'ATT', nationality: 'South Africa', rating: 79 },
    { name: 'Ashley Du Preez', team: 'Kaizer Chiefs', position: 'ATT', nationality: 'South Africa', rating: 80 },
    { name: 'Yusuf Maart', team: 'Kaizer Chiefs', position: 'MID', nationality: 'South Africa', rating: 79 },
    { name: 'Edson Castillo', team: 'Kaizer Chiefs', position: 'MID', nationality: 'Venezuela', rating: 80 },
    { name: 'Given Msimango', team: 'Kaizer Chiefs', position: 'DEF', nationality: 'South Africa', rating: 78 },
    { name: 'Inacio Miguel', team: 'Kaizer Chiefs', position: 'DEF', nationality: 'Angola', rating: 79 },
    { name: 'Rushwin Dortley', team: 'Kaizer Chiefs', position: 'DEF', nationality: 'South Africa', rating: 78 },
    { name: 'Fiacre Ntwari', team: 'Kaizer Chiefs', position: 'GK', nationality: 'Rwanda', rating: 79 },
    { name: 'Mduduzi Shabalala', team: 'Kaizer Chiefs', position: 'MID', nationality: 'South Africa', rating: 77 },
    { name: 'Pule Mmodi', team: 'Kaizer Chiefs', position: 'ATT', nationality: 'South Africa', rating: 78 },
    { name: 'Christian Saile', team: 'Kaizer Chiefs', position: 'ATT', nationality: 'DR Congo', rating: 77 },

    // Stellenbosch FC
    { name: 'Sage Stephens', team: 'Stellenbosch FC', position: 'GK', nationality: 'South Africa', rating: 81 },
    { name: 'Fawaaz Basadien', team: 'Stellenbosch FC', position: 'DEF', nationality: 'South Africa', rating: 82 },
    { name: 'Jayden Adams', team: 'Stellenbosch FC', position: 'MID', nationality: 'South Africa', rating: 81 },
    { name: 'Andre de Jong', team: 'Stellenbosch FC', position: 'ATT', nationality: 'New Zealand', rating: 79 },
    { name: 'Ismael Toure', team: 'Stellenbosch FC', position: 'DEF', nationality: 'Ivory Coast', rating: 80 },
    { name: 'Devin Titus', team: 'Stellenbosch FC', position: 'MID', nationality: 'South Africa', rating: 79 },

    // SuperSport United
    { name: 'Bradley Grobler', team: 'SuperSport United', position: 'ATT', nationality: 'South Africa', rating: 80 },
    { name: 'Ricardo Goss', team: 'SuperSport United', position: 'GK', nationality: 'South Africa', rating: 81 },
    { name: 'Grant Margeman', team: 'SuperSport United', position: 'MID', nationality: 'South Africa', rating: 79 },
    { name: 'Thulani Hlatshwayo', team: 'SuperSport United', position: 'DEF', nationality: 'South Africa', rating: 79 },

    // Cape Town City
    { name: 'Darren Keet', team: 'Cape Town City', position: 'GK', nationality: 'South Africa', rating: 80 },
    { name: 'Thamsanqa Mkhize', team: 'Cape Town City', position: 'DEF', nationality: 'South Africa', rating: 78 },
    { name: 'Darwin Gonzalez', team: 'Cape Town City', position: 'ATT', nationality: 'Venezuela', rating: 79 },
    { name: 'Jaushua Sotirio', team: 'Cape Town City', position: 'ATT', nationality: 'Australia', rating: 77 },

    // Chippa United
    { name: 'Stanley Nwabali', team: 'Chippa United', position: 'GK', nationality: 'Nigeria', rating: 83 },
    { name: 'Andile Jali', team: 'Chippa United', position: 'MID', nationality: 'South Africa', rating: 79 },
    { name: 'Bienvenu Eva Nga', team: 'Chippa United', position: 'ATT', nationality: 'Cameroon', rating: 77 },

    // TS Galaxy
    { name: 'Fiacre Ntwari', team: 'TS Galaxy', position: 'GK', nationality: 'Rwanda', rating: 79 },
    { name: 'Samir Nurkovic', team: 'TS Galaxy', position: 'ATT', nationality: 'Serbia', rating: 78 },
    { name: 'Puso Dithejane', team: 'TS Galaxy', position: 'MID', nationality: 'South Africa', rating: 76 },

    // Richards Bay
    { name: 'Salim Magoola', team: 'Richards Bay', position: 'GK', nationality: 'Uganda', rating: 80 },
    { name: 'Sanele Barns', team: 'Richards Bay', position: 'MID', nationality: 'South Africa', rating: 78 },
  ];

  const players: TransformedPlayer[] = [];

  // Add Manual Players First
  manualPlayers.forEach((p, index) => {
    const stats = generatePlayerStats(p.position as any);
    const rating = p.rating; // Use manual rating
    const cost = calculatePlayerCost(rating, p.position as any);

    players.push({
      id: `psl_manual_${index}`,
      name: p.name,
      position: p.position as 'GK' | 'DEF' | 'MID' | 'ATT',
      team: p.team,
      nationality: p.nationality,
      rating: rating,
      pace: Math.round(stats.pace * (rating / 80)), // Adjust stats slightly by rating
      shooting: Math.round(stats.shooting * (rating / 80)),
      passing: Math.round(stats.passing * (rating / 80)),
      defending: Math.round(stats.defending * (rating / 80)),
      dribbling: Math.round(stats.dribbling * (rating / 80)),
      physical: Math.round(stats.physical * (rating / 80)),
      price: cost
    });
  });

  // Fill the rest with fillers to reach proper squad sizes
  pslTeams.forEach(team => {
    // Check how many we have for this team already
    const existingPlayers = players.filter(p => p.team === team);
    const existingCount = existingPlayers.length;
    const targetCount = 18; // Each team should have at least 18 players for the game pool

    if (existingCount < targetCount) {
      for (let i = 0; i < targetCount - existingCount; i++) {
        const posRoll = Math.random();
        let pos: 'GK' | 'DEF' | 'MID' | 'ATT' = 'MID';
        if (posRoll < 0.1) pos = 'GK';
        else if (posRoll < 0.4) pos = 'DEF';
        else if (posRoll < 0.7) pos = 'MID';
        else pos = 'ATT';

        const stats = generatePlayerStats(pos);
        const rating = Math.max(65, Math.min(78, Math.round(stats.rating - 5))); // Fillers possess lower ratings
        const cost = calculatePlayerCost(rating, pos);

        players.push({
          id: `psl_gen_${team.replace(/\s/g, '')}_${i}`,
          name: `${team.split(' ')[0]} ${pos} ${i + 1}`, // Generic name "Mamelodi MID 1"
          position: pos,
          team: team,
          nationality: 'South Africa',
          rating: rating,
          pace: Math.round(stats.pace),
          shooting: Math.round(stats.shooting),
          passing: Math.round(stats.passing),
          defending: Math.round(stats.defending),
          dribbling: Math.round(stats.dribbling),
          physical: Math.round(stats.physical),
          price: cost
        });
      }
    }
  });

  return players;
};
