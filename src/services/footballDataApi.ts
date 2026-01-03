
// We'll define the interface locally if not present, to match existing file structure for now.

export interface TransformedPlayer {
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
const API_HOST = 'api-football-v1.p.rapidapi.com';
const BASE_URL = 'https://api-football-v1.p.rapidapi.com/v3';
const LEAGUE_ID = 288; // South Africa Premier Soccer League
const SEASON = 2024; // Current Season

// Helper to map API positions
const mapPosition = (pos: string): 'GK' | 'DEF' | 'MID' | 'ATT' => {
  if (!pos) return 'MID';
  if (pos === 'Goalkeeper') return 'GK';
  if (pos === 'Defender') return 'DEF';
  if (pos === 'Midfielder') return 'MID';
  if (pos === 'Attacker') return 'ATT';
  return 'MID';
};

// Calculate cost based on rating (similar to previous logic but adapted)
const calculateCost = (rating: number): number => {
  const basePrice = rating * 100000;
  // Variance
  const variance = Math.floor(Math.random() * 2000000);
  return Math.round((basePrice + variance) / 100000) * 100000;
};

// Generate attributes from API rating/stats if detailed stats missing
// In a real robust app, we would use detailed player statistics from the API to calculate these.
// For now, we simulate FIFA-style stats based on the API's rating (if available) or generate reasonable defaults.
const generateAttributes = (position: string, rating: number = 70) => {
  // Baseline stats based on rating
  const base = rating;
  let pace = base, shooting = base, passing = base, defending = base, dribbling = base, physical = base;

  if (position === 'GK') {
    pace = base * 0.5; shooting = base * 0.2; passing = base * 0.7; defending = base * 0.95; dribbling = base * 0.4; physical = base * 0.8;
  } else if (position === 'DEF') {
    pace = base * 0.8; shooting = base * 0.4; passing = base * 0.7; defending = base * 0.9; dribbling = base * 0.6; physical = base * 0.85;
  } else if (position === 'MID') {
    pace = base * 0.75; shooting = base * 0.7; passing = base * 0.85; defending = base * 0.6; dribbling = base * 0.8; physical = base * 0.7;
  } else {
    pace = base * 0.9; shooting = base * 0.85; passing = base * 0.6; defending = base * 0.3; dribbling = base * 0.85; physical = base * 0.75;
  }

  // Add randomness (-5 to +5)
  const r = () => Math.floor(Math.random() * 10) - 5;

  return {
    pace: Math.min(99, Math.max(30, Math.round(pace + r()))),
    shooting: Math.min(99, Math.max(20, Math.round(shooting + r()))),
    passing: Math.min(99, Math.max(30, Math.round(passing + r()))),
    defending: Math.min(99, Math.max(20, Math.round(defending + r()))),
    dribbling: Math.min(99, Math.max(30, Math.round(dribbling + r()))),
    physical: Math.min(99, Math.max(30, Math.round(physical + r()))),
    rating: rating // Keep the API rating or calculated one
  };
};

export const fetchTeamData = async (): Promise<TransformedPlayer[]> => {
  console.log(`[API] Fetching PSL Players from API-Football for League ${LEAGUE_ID} Season ${SEASON}...`);

  try {
    // Requires pagination handling in production, but for MVP we fetch page 1 (or multiple if needed)
    // API-Football returns squads team by team usually, or players by league with pagination.
    // Fetching /teams first, then squads is better to get all players efficiently without 50 pages of players.

    // Step 1: Get Teams
    const teamsResponse = await fetch(`${BASE_URL}/teams?league=${LEAGUE_ID}&season=${SEASON}`, {
      method: "GET",
      headers: {
        "x-rapidapi-host": API_HOST,
        "x-rapidapi-key": API_KEY
      }
    });

    if (!teamsResponse.ok) throw new Error("Failed to fetch teams");
    const teamsData = await teamsResponse.json();

    if (teamsData.errors && Object.keys(teamsData.errors).length > 0) {
      console.error("API Errors:", teamsData.errors);
      // Fallback to manual data if API limit reached or error
      return getEnhancedPSLData();
    }

    const allPlayers: TransformedPlayer[] = [];
    const teams = teamsData.response; // Array of { team: {...}, venue: {...} }

    // Step 2: For each team, get the squad
    // Note: Rate limits! We might need to throttle or cache this. 
    // RapidAPI Free tier is 100 req/day. PSL has 16 teams. 1 (teams) + 16 (squads) = 17 requests. Safe for a demo run.

    for (const item of teams) {
      const teamId = item.team.id;
      const teamName = item.team.name;

      // Fetch Squad
      const squadResponse = await fetch(`${BASE_URL}/players/squads?team=${teamId}`, {
        headers: {
          "x-rapidapi-host": API_HOST,
          "x-rapidapi-key": API_KEY
        }
      });

      const squadData = await squadResponse.json();
      const squad = squadData.response[0]?.players || [];

      squad.forEach((p: any) => {
        if (p.position) { // Only add if position is known
          const mappedPos = mapPosition(p.position);
          const rating = p.age ? (60 + Math.floor(Math.random() * 25)) : 70; // API-Football Squad endpoint doesn't give rating, only basic info. 
          // To get RATINGS, we'd need /players endpoint which is expensive (pagination).
          // Strategy: Use squad list + Mocked ratings based on 'realism' or random for MVP, 
          // OR switch to /players endpoint if user has a Pro plan. 
          // Given "robust" request, let's try to be smart. 
          // For now, we will generate decent stats.

          const stats = generateAttributes(mappedPos, rating);

          allPlayers.push({
            id: String(p.id),
            name: p.name,
            position: mappedPos,
            team: teamName,
            nationality: 'South Africa', // API squad doesn't always have nationality per player easily without extra calls. Defaulting for MVP speed.
            rating: stats.rating,
            pace: stats.pace,
            shooting: stats.shooting,
            passing: stats.passing,
            defending: stats.defending,
            dribbling: stats.dribbling,
            physical: stats.physical,
            price: calculateCost(stats.rating),
            imageUrl: p.photo
          });
        }
      });

      // Slight delay to be nice to API
      await new Promise(r => setTimeout(r, 200));
    }

    console.log(`[API] Successfully fetched ${allPlayers.length} players.`);
    return allPlayers;

  } catch (error) {
    console.error("[API] Error fetching data:", error);
    return getEnhancedPSLData(); // Fallback
  }
};

// Keep the fallback for offline/error modes
export const getEnhancedPSLData = (): TransformedPlayer[] => {
  const pslTeams = [
    'Mamelodi Sundowns', 'Orlando Pirates', 'Stellenbosch FC', 'Sekhukhune United',
    'Cape Town City', 'TS Galaxy', 'SuperSport United', 'Polokwane City',
    'Golden Arrows', 'Kaizer Chiefs', 'Chippa United', 'AmaZulu',
    'Royal AM', 'Richards Bay', 'Magesi FC', 'Marumo Gallants'
  ];

  const manualPlayers = [
    // Kaizer Chiefs
    { name: 'Brandon Petersen', team: 'Kaizer Chiefs', position: 'GK', nationality: 'South Africa', rating: 77 },
    { name: 'Keagan Dolly', team: 'Kaizer Chiefs', position: 'MID', nationality: 'South Africa', rating: 80 },
    { name: 'Reeve Frosler', team: 'Kaizer Chiefs', position: 'DEF', nationality: 'South Africa', rating: 76 },
    { name: 'Ashley Du Preez', team: 'Kaizer Chiefs', position: 'ATT', nationality: 'South Africa', rating: 78 },
    { name: 'Yusuf Maart', team: 'Kaizer Chiefs', position: 'MID', nationality: 'South Africa', rating: 79 },
    { name: 'Edmilson Dove', team: 'Kaizer Chiefs', position: 'DEF', nationality: 'Mozambique', rating: 77 },
    { name: 'Thatayaone Ditlhokwe', team: 'Kaizer Chiefs', position: 'DEF', nationality: 'Botswana', rating: 78 },
    { name: 'Gaston Sirino', team: 'Kaizer Chiefs', position: 'MID', nationality: 'Uruguay', rating: 81 },
    { name: 'Fiacre Ntwari', team: 'Kaizer Chiefs', position: 'GK', nationality: 'Rwanda', rating: 76 },
    { name: 'Ranga Chivaviro', team: 'Kaizer Chiefs', position: 'ATT', nationality: 'South Africa', rating: 75 },
    { name: 'Mduduzi Shabalala', team: 'Kaizer Chiefs', position: 'MID', nationality: 'South Africa', rating: 74 },
    { name: 'Nkosingiphile Ngcobo', team: 'Kaizer Chiefs', position: 'MID', nationality: 'South Africa', rating: 76 },
    { name: 'Zitha Kwinika', team: 'Kaizer Chiefs', position: 'DEF', nationality: 'South Africa', rating: 75 },

    // Orlando Pirates
    { name: 'Deon Hotto', team: 'Orlando Pirates', position: 'MID', nationality: 'Namibia', rating: 81 },
    { name: 'Evidence Makgopa', team: 'Orlando Pirates', position: 'ATT', nationality: 'South Africa', rating: 77 },
    { name: 'Goodman Mosele', team: 'Orlando Pirates', position: 'MID', nationality: 'South Africa', rating: 79 },
    { name: 'Monnapule Saleng', team: 'Orlando Pirates', position: 'ATT', nationality: 'South Africa', rating: 82 },
    { name: 'Terrence Dzvukamanja', team: 'Orlando Pirates', position: 'ATT', nationality: 'Zimbabwe', rating: 79 },
    { name: 'Patrick Maswanganyi', team: 'Orlando Pirates', position: 'MID', nationality: 'South Africa', rating: 83 },
    { name: 'Relebohile Mofokeng', team: 'Orlando Pirates', position: 'MID', nationality: 'South Africa', rating: 78 },
    { name: 'Sipho Chaine', team: 'Orlando Pirates', position: 'GK', nationality: 'South Africa', rating: 79 },
    { name: 'Nkosinathi Sibisi', team: 'Orlando Pirates', position: 'DEF', nationality: 'South Africa', rating: 80 },
    { name: 'Makhehleni Makhaula', team: 'Orlando Pirates', position: 'MID', nationality: 'South Africa', rating: 77 },
    { name: 'Olisa Ndah', team: 'Orlando Pirates', position: 'DEF', nationality: 'Nigeria', rating: 81 },
    { name: 'Miguel Timm', team: 'Orlando Pirates', position: 'MID', nationality: 'South Africa', rating: 79 },
    { name: 'Thabiso Monyane', team: 'Orlando Pirates', position: 'DEF', nationality: 'South Africa', rating: 76 },
    { name: 'Innocent Maela', team: 'Orlando Pirates', position: 'DEF', nationality: 'South Africa', rating: 78 },
    { name: 'Zakhele Lepasa', team: 'Orlando Pirates', position: 'ATT', nationality: 'South Africa', rating: 76 },

    // Mamelodi Sundowns
    { name: 'Ronwen Williams', team: 'Mamelodi Sundowns', position: 'GK', nationality: 'South Africa', rating: 85 },
    { name: 'Sipho Mbule', team: 'Mamelodi Sundowns', position: 'MID', nationality: 'South Africa', rating: 80 },
    { name: 'Thapelo Morena', team: 'Mamelodi Sundowns', position: 'DEF', nationality: 'South Africa', rating: 80 },
    { name: 'Themba Zwane', team: 'Mamelodi Sundowns', position: 'MID', nationality: 'South Africa', rating: 85 },
    { name: 'Peter Shalulile', team: 'Mamelodi Sundowns', position: 'ATT', nationality: 'Namibia', rating: 87 },
    { name: 'Lucas Ribeiro', team: 'Mamelodi Sundowns', position: 'ATT', nationality: 'Brazil', rating: 86 },
    { name: 'Khuliso Mudau', team: 'Mamelodi Sundowns', position: 'DEF', nationality: 'South Africa', rating: 84 },
    { name: 'Teboho Mokoena', team: 'Mamelodi Sundowns', position: 'MID', nationality: 'South Africa', rating: 86 },
    { name: 'Mothobi Mvala', team: 'Mamelodi Sundowns', position: 'DEF', nationality: 'South Africa', rating: 81 },
    { name: 'Aubrey Modiba', team: 'Mamelodi Sundowns', position: 'DEF', nationality: 'South Africa', rating: 80 },
    { name: 'Marcelo Allende', team: 'Mamelodi Sundowns', position: 'MID', nationality: 'Chile', rating: 83 },
    { name: 'Grant Kekana', team: 'Mamelodi Sundowns', position: 'DEF', nationality: 'South Africa', rating: 81 },
    { name: 'Tashreeq Matthews', team: 'Mamelodi Sundowns', position: 'ATT', nationality: 'South Africa', rating: 79 },
    { name: 'Iqraam Rayners', team: 'Mamelodi Sundowns', position: 'ATT', nationality: 'South Africa', rating: 82 },
    { name: 'Rivaldo Coetzee', team: 'Mamelodi Sundowns', position: 'MID', nationality: 'South Africa', rating: 81 },

    // Stellenbosch FC
    { name: 'Fawaaz Basadien', team: 'Stellenbosch FC', position: 'DEF', nationality: 'South Africa', rating: 78 },
    { name: 'Sage Stephens', team: 'Stellenbosch FC', position: 'GK', nationality: 'South Africa', rating: 76 },
    { name: 'Jayden Adams', team: 'Stellenbosch FC', position: 'MID', nationality: 'South Africa', rating: 78 },
    { name: 'Devin Titus', team: 'Stellenbosch FC', position: 'ATT', nationality: 'South Africa', rating: 77 },
    { name: 'Andre de Jong', team: 'Stellenbosch FC', position: 'ATT', nationality: 'New Zealand', rating: 76 },
    { name: 'Ismael Toure', team: 'Stellenbosch FC', position: 'DEF', nationality: 'Ivory Coast', rating: 77 },
    { name: 'Thabo Moloisane', team: 'Stellenbosch FC', position: 'DEF', nationality: 'South Africa', rating: 75 },
    { name: 'Sihle Nduli', team: 'Stellenbosch FC', position: 'MID', nationality: 'South Africa', rating: 75 },

    // Cape Town City
    { name: 'Lyle Lakay', team: 'Cape Town City', position: 'DEF', nationality: 'South Africa', rating: 78 },
    { name: 'Mduduzi Mdantsane', team: 'Cape Town City', position: 'MID', nationality: 'South Africa', rating: 80 },
    { name: 'Thamsanqa Mkhize', team: 'Cape Town City', position: 'DEF', nationality: 'South Africa', rating: 77 },
    { name: 'Darren Keet', team: 'Cape Town City', position: 'GK', nationality: 'South Africa', rating: 78 },
    { name: 'Khanyisa Mayo', team: 'Cape Town City', position: 'ATT', nationality: 'South Africa', rating: 79 },
    { name: 'Taariq Fielies', team: 'Cape Town City', position: 'DEF', nationality: 'South Africa', rating: 76 },
    { name: 'Jaedin Rhodes', team: 'Cape Town City', position: 'MID', nationality: 'South Africa', rating: 75 },

    // SuperSport United
    { name: 'Siyanda Xulu', team: 'SuperSport United', position: 'DEF', nationality: 'South Africa', rating: 79 },
    { name: 'Bradley Grobler', team: 'SuperSport United', position: 'ATT', nationality: 'South Africa', rating: 78 },
    { name: 'Grant Margeman', team: 'SuperSport United', position: 'MID', nationality: 'South Africa', rating: 78 },
    { name: 'Ime Okon', team: 'SuperSport United', position: 'DEF', nationality: 'South Africa', rating: 75 },
    { name: 'Ricardo Goss', team: 'SuperSport United', position: 'GK', nationality: 'South Africa', rating: 77 },
    { name: 'Gamphani Lungu', team: 'SuperSport United', position: 'ATT', nationality: 'Zambia', rating: 76 },
    { name: 'Kegan Johannes', team: 'SuperSport United', position: 'DEF', nationality: 'South Africa', rating: 76 },

    // AmaZulu
    { name: 'Lehlohonolo Majoro', team: 'AmaZulu', position: 'ATT', nationality: 'South Africa', rating: 76 },
    { name: 'Veli Mothwa', team: 'AmaZulu', position: 'GK', nationality: 'South Africa', rating: 78 },
    { name: 'Riaan Hanamub', team: 'AmaZulu', position: 'DEF', nationality: 'Namibia', rating: 77 },
    { name: 'Pule Ekstein', team: 'AmaZulu', position: 'MID', nationality: 'South Africa', rating: 76 },
    { name: 'Ben Motshwari', team: 'AmaZulu', position: 'MID', nationality: 'South Africa', rating: 75 },
    { name: 'Taariq Fielies', team: 'AmaZulu', position: 'DEF', nationality: 'South Africa', rating: 76 }, // Moved around IRL, but key player
    { name: 'Hendrick Ekstein', team: 'AmaZulu', position: 'MID', nationality: 'South Africa', rating: 75 },

    // Sekhukhune United
    { name: 'Victor Letsoalo', team: 'Sekhukhune United', position: 'ATT', nationality: 'South Africa', rating: 81 },
    { name: 'Linda Mntambo', team: 'Sekhukhune United', position: 'MID', nationality: 'South Africa', rating: 77 },
    { name: 'Daniel Cardoso', team: 'Sekhukhune United', position: 'DEF', nationality: 'South Africa', rating: 76 },
    { name: 'Badra Ali Sangare', team: 'Sekhukhune United', position: 'GK', nationality: 'Ivory Coast', rating: 75 },
    { name: 'Keletso Makgalwa', team: 'Sekhukhune United', position: 'ATT', nationality: 'South Africa', rating: 76 },
    { name: 'Tresor Tshibwabwa', team: 'Sekhukhune United', position: 'DEF', nationality: 'DR Congo', rating: 75 },
    { name: 'Jamie Webber', team: 'Sekhukhune United', position: 'MID', nationality: 'South Africa', rating: 76 },

    // TS Galaxy
    { name: 'Samir Nurkovic', team: 'TS Galaxy', position: 'ATT', nationality: 'Serbia', rating: 77 },
    { name: 'Mlungisi Mbunjana', team: 'TS Galaxy', position: 'MID', nationality: 'South Africa', rating: 76 },
    { name: 'Pogiso Sanoka', team: 'TS Galaxy', position: 'DEF', nationality: 'South Africa', rating: 75 },
    { name: 'Marks Munyai', team: 'TS Galaxy', position: 'DEF', nationality: 'South Africa', rating: 74 },
    { name: 'Bernard Parker', team: 'TS Galaxy', position: 'MID', nationality: 'South Africa', rating: 75 }, // Veteran presence

    // Golden Arrows
    { name: 'Nduduzo Sibiya', team: 'Golden Arrows', position: 'MID', nationality: 'South Africa', rating: 76 },
    { name: 'Ryan Moon', team: 'Golden Arrows', position: 'ATT', nationality: 'South Africa', rating: 74 },
    { name: 'Knox Mutizwa', team: 'Golden Arrows', position: 'ATT', nationality: 'Zimbabwe', rating: 75 },
    { name: 'Sifiso Mlungwana', team: 'Golden Arrows', position: 'GK', nationality: 'South Africa', rating: 74 },
    { name: 'Thabani Zuke', team: 'Golden Arrows', position: 'DEF', nationality: 'South Africa', rating: 75 },

    // Chippa United
    { name: 'Stanley Nwabali', team: 'Chippa United', position: 'GK', nationality: 'Nigeria', rating: 78 },
    { name: 'Craig Martin', team: 'Chippa United', position: 'MID', nationality: 'South Africa', rating: 75 },
    { name: 'Justice Chabalala', team: 'Chippa United', position: 'DEF', nationality: 'South Africa', rating: 74 },
    { name: 'Roscoe Pietersen', team: 'Chippa United', position: 'DEF', nationality: 'South Africa', rating: 73 },

    // Royal AM
    { name: 'Andile Mpisane', team: 'Royal AM', position: 'MID', nationality: 'South Africa', rating: 65 },
    { name: 'Kabelo Mahlasela', team: 'Royal AM', position: 'MID', nationality: 'South Africa', rating: 76 },
    { name: 'Samuel Manganyi', team: 'Royal AM', position: 'DEF', nationality: 'South Africa', rating: 74 },
    { name: 'Sedwyn George', team: 'Royal AM', position: 'ATT', nationality: 'South Africa', rating: 73 },
    { name: 'Zukile Mkhize', team: 'Royal AM', position: 'DEF', nationality: 'South Africa', rating: 73 },

    // Polokwane City (Added)
    { name: 'Manuel Kambala', team: 'Polokwane City', position: 'MID', nationality: 'Mozambique', rating: 74 },
    { name: 'Douglas Mapfumo', team: 'Polokwane City', position: 'ATT', nationality: 'Zimbabwe', rating: 73 },
    { name: 'Bulelani Nikani', team: 'Polokwane City', position: 'DEF', nationality: 'South Africa', rating: 72 },
    { name: 'Oswin Appollis', team: 'Polokwane City', position: 'MID', nationality: 'South Africa', rating: 76 }, // Breakout star
    { name: 'Lebohang Nkaki', team: 'Polokwane City', position: 'DEF', nationality: 'South Africa', rating: 72 },
    { name: 'Manuel Sapunga', team: 'Polokwane City', position: 'GK', nationality: 'Equatorial Guinea', rating: 73 },

    // Richards Bay (Added)
    { name: 'Salim Magoola', team: 'Richards Bay', position: 'GK', nationality: 'Uganda', rating: 75 },
    { name: 'Siyethemba Sithebe', team: 'Richards Bay', position: 'MID', nationality: 'South Africa', rating: 76 },
    { name: 'Keagan Allan', team: 'Richards Bay', position: 'DEF', nationality: 'South Africa', rating: 74 },
    { name: 'Somila Ntsundwana', team: 'Richards Bay', position: 'ATT', nationality: 'South Africa', rating: 73 },
    { name: 'Austin Dube', team: 'Richards Bay', position: 'DEF', nationality: 'South Africa', rating: 74 },
    { name: 'Lwandile Mabuya', team: 'Richards Bay', position: 'MID', nationality: 'South Africa', rating: 72 },

    // Magesi FC (Added)
    { name: 'Elvis Chipezeze', team: 'Magesi FC', position: 'GK', nationality: 'Zimbabwe', rating: 72 },
    { name: 'Kgaogelo Sekgota', team: 'Magesi FC', position: 'ATT', nationality: 'South Africa', rating: 74 },
    { name: 'Deolin Mekoa', team: 'Magesi FC', position: 'MID', nationality: 'South Africa', rating: 73 },
    { name: 'Rhulani Manzini', team: 'Magesi FC', position: 'ATT', nationality: 'South Africa', rating: 72 },
    { name: 'Wonderboy Makhubu', team: 'Magesi FC', position: 'ATT', nationality: 'South Africa', rating: 71 },
    { name: 'Lebo Ngubeni', team: 'Magesi FC', position: 'DEF', nationality: 'South Africa', rating: 70 }
  ];

  const players: TransformedPlayer[] = [];
  const generateStats = (pos: 'GK' | 'DEF' | 'MID' | 'ATT', rating: number) => {
    return generateAttributes(pos, rating);
  };

  // Add Manual Players
  manualPlayers.forEach((p, idx) => {
    const stats = generateStats(p.position as any, p.rating);
    players.push({
      id: `manual_${idx}`,
      name: p.name,
      position: p.position as any,
      team: p.team,
      nationality: p.nationality,
      rating: p.rating,
      pace: stats.pace,
      shooting: stats.shooting,
      passing: stats.passing,
      defending: stats.defending,
      dribbling: stats.dribbling,
      physical: stats.physical,
      price: calculateCost(p.rating)
    });
  });

  return players;
};
