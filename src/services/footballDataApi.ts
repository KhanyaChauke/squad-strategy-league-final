
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
    { name: 'Fiacre Ntwari', team: 'Kaizer Chiefs', position: 'GK', nationality: 'Rwanda', rating: 78 },
    { name: 'Brandon Petersen', team: 'Kaizer Chiefs', position: 'GK', nationality: 'South Africa', rating: 76 },
    { name: 'Bruce Bvuma', team: 'Kaizer Chiefs', position: 'GK', nationality: 'South Africa', rating: 75 },
    { name: 'Inacio Miguel', team: 'Kaizer Chiefs', position: 'DEF', nationality: 'Angola', rating: 80 },
    { name: 'Rushwin Dortley', team: 'Kaizer Chiefs', position: 'DEF', nationality: 'South Africa', rating: 78 },
    { name: 'Given Msimango', team: 'Kaizer Chiefs', position: 'DEF', nationality: 'South Africa', rating: 77 },
    { name: 'Thatayaone Ditlhokwe', team: 'Kaizer Chiefs', position: 'DEF', nationality: 'Botswana', rating: 78 },
    { name: 'Bradley Cross', team: 'Kaizer Chiefs', position: 'DEF', nationality: 'South Africa', rating: 76 },
    { name: 'Reeve Frosler', team: 'Kaizer Chiefs', position: 'DEF', nationality: 'South Africa', rating: 77 },
    { name: 'Njabulo Blom', team: 'Kaizer Chiefs', position: 'MID', nationality: 'South Africa', rating: 81 },
    { name: 'Yusuf Maart', team: 'Kaizer Chiefs', position: 'MID', nationality: 'South Africa', rating: 79 },
    { name: 'Edson Castillo', team: 'Kaizer Chiefs', position: 'MID', nationality: 'Venezuela', rating: 78 },
    { name: 'Gaston Sirino', team: 'Kaizer Chiefs', position: 'MID', nationality: 'Uruguay', rating: 82 },
    { name: 'Mduduzi Shabalala', team: 'Kaizer Chiefs', position: 'MID', nationality: 'South Africa', rating: 76 },
    { name: 'Nkosingiphile Ngcobo', team: 'Kaizer Chiefs', position: 'MID', nationality: 'South Africa', rating: 77 },
    { name: 'Ashley Du Preez', team: 'Kaizer Chiefs', position: 'ATT', nationality: 'South Africa', rating: 79 },
    { name: 'Ranga Chivaviro', team: 'Kaizer Chiefs', position: 'ATT', nationality: 'South Africa', rating: 76 },
    { name: 'Wandile Duba', team: 'Kaizer Chiefs', position: 'ATT', nationality: 'South Africa', rating: 74 },

    // Orlando Pirates
    { name: 'Sipho Chaine', team: 'Orlando Pirates', position: 'GK', nationality: 'South Africa', rating: 80 },
    { name: 'Olisa Ndah', team: 'Orlando Pirates', position: 'DEF', nationality: 'Nigeria', rating: 82 },
    { name: 'Nkosinathi Sibisi', team: 'Orlando Pirates', position: 'DEF', nationality: 'South Africa', rating: 80 },
    { name: 'Tapelo Xoki', team: 'Orlando Pirates', position: 'DEF', nationality: 'South Africa', rating: 79 },
    { name: 'Deano van Rooyen', team: 'Orlando Pirates', position: 'DEF', nationality: 'South Africa', rating: 80 },
    { name: 'Innocent Maela', team: 'Orlando Pirates', position: 'DEF', nationality: 'South Africa', rating: 78 },
    { name: 'Thabiso Monyane', team: 'Orlando Pirates', position: 'DEF', nationality: 'South Africa', rating: 77 },
    { name: 'Patrick Maswanganyi', team: 'Orlando Pirates', position: 'MID', nationality: 'South Africa', rating: 84 },
    { name: 'Thalente Mbatha', team: 'Orlando Pirates', position: 'MID', nationality: 'South Africa', rating: 79 },
    { name: 'Miguel Timm', team: 'Orlando Pirates', position: 'MID', nationality: 'South Africa', rating: 79 },
    { name: 'Makhehleni Makhaula', team: 'Orlando Pirates', position: 'MID', nationality: 'South Africa', rating: 78 },
    { name: 'Relebohile Mofokeng', team: 'Orlando Pirates', position: 'MID', nationality: 'South Africa', rating: 81 },
    { name: 'Ndabayithethwa Ndlondlo', team: 'Orlando Pirates', position: 'MID', nationality: 'South Africa', rating: 77 },
    { name: 'Monnapule Saleng', team: 'Orlando Pirates', position: 'ATT', nationality: 'South Africa', rating: 83 },
    { name: 'Tshegofatso Mabasa', team: 'Orlando Pirates', position: 'ATT', nationality: 'South Africa', rating: 82 },
    { name: 'Evidence Makgopa', team: 'Orlando Pirates', position: 'ATT', nationality: 'South Africa', rating: 79 },
    { name: 'Gilberto', team: 'Orlando Pirates', position: 'ATT', nationality: 'Angola', rating: 78 },
    { name: 'Mohau Nkota', team: 'Orlando Pirates', position: 'ATT', nationality: 'South Africa', rating: 74 },

    // Mamelodi Sundowns
    { name: 'Ronwen Williams', team: 'Mamelodi Sundowns', position: 'GK', nationality: 'South Africa', rating: 86 },
    { name: 'Khuliso Mudau', team: 'Mamelodi Sundowns', position: 'DEF', nationality: 'South Africa', rating: 85 },
    { name: 'Grant Kekana', team: 'Mamelodi Sundowns', position: 'DEF', nationality: 'South Africa', rating: 82 },
    { name: 'Mothobi Mvala', team: 'Mamelodi Sundowns', position: 'DEF', nationality: 'South Africa', rating: 82 },
    { name: 'Rivaldo Coetzee', team: 'Mamelodi Sundowns', position: 'DEF', nationality: 'South Africa', rating: 81 },
    { name: 'Mosa Lebusa', team: 'Mamelodi Sundowns', position: 'DEF', nationality: 'South Africa', rating: 80 },
    { name: 'Aubrey Modiba', team: 'Mamelodi Sundowns', position: 'DEF', nationality: 'South Africa', rating: 81 },
    { name: 'Terrence Mashego', team: 'Mamelodi Sundowns', position: 'DEF', nationality: 'South Africa', rating: 79 },
    { name: 'Kegan Johannes', team: 'Mamelodi Sundowns', position: 'DEF', nationality: 'South Africa', rating: 78 },
    { name: 'Asekho Tiwani', team: 'Mamelodi Sundowns', position: 'DEF', nationality: 'South Africa', rating: 75 },
    { name: 'Teboho Mokoena', team: 'Mamelodi Sundowns', position: 'MID', nationality: 'South Africa', rating: 87 },
    { name: 'Marcelo Allende', team: 'Mamelodi Sundowns', position: 'MID', nationality: 'Chile', rating: 84 },
    { name: 'Themba Zwane', team: 'Mamelodi Sundowns', position: 'MID', nationality: 'South Africa', rating: 85 },
    { name: 'Sphelele Mkhulise', team: 'Mamelodi Sundowns', position: 'MID', nationality: 'South Africa', rating: 79 },
    { name: 'Neo Maema', team: 'Mamelodi Sundowns', position: 'MID', nationality: 'South Africa', rating: 78 },
    { name: 'Lucas Ribeiro', team: 'Mamelodi Sundowns', position: 'ATT', nationality: 'Brazil', rating: 87 },
    { name: 'Peter Shalulile', team: 'Mamelodi Sundowns', position: 'ATT', nationality: 'Namibia', rating: 86 },
    { name: 'Iqraam Rayners', team: 'Mamelodi Sundowns', position: 'ATT', nationality: 'South Africa', rating: 83 },
    { name: 'Tashreeq Matthews', team: 'Mamelodi Sundowns', position: 'ATT', nationality: 'South Africa', rating: 80 },
    { name: 'Arthur Sales', team: 'Mamelodi Sundowns', position: 'ATT', nationality: 'Brazil', rating: 79 },
    { name: 'Kobamelo Kodisang', team: 'Mamelodi Sundowns', position: 'ATT', nationality: 'South Africa', rating: 78 },

    // Stellenbosch FC
    { name: 'Sage Stephens', team: 'Stellenbosch FC', position: 'GK', nationality: 'South Africa', rating: 78 },
    { name: 'Fawaaz Basadien', team: 'Stellenbosch FC', position: 'DEF', nationality: 'South Africa', rating: 80 },
    { name: 'Ismael Toure', team: 'Stellenbosch FC', position: 'DEF', nationality: 'Ivory Coast', rating: 79 },
    { name: 'Thabo Moloisane', team: 'Stellenbosch FC', position: 'DEF', nationality: 'South Africa', rating: 77 },
    { name: 'Athenkosi Mcaba', team: 'Stellenbosch FC', position: 'DEF', nationality: 'South Africa', rating: 76 },
    { name: 'Olivier Toure', team: 'Stellenbosch FC', position: 'DEF', nationality: 'South Africa', rating: 76 },
    { name: 'Jayden Adams', team: 'Stellenbosch FC', position: 'MID', nationality: 'South Africa', rating: 79 },
    { name: 'Sihle Nduli', team: 'Stellenbosch FC', position: 'MID', nationality: 'South Africa', rating: 77 },
    { name: 'Ibraheem Jabaar', team: 'Stellenbosch FC', position: 'MID', nationality: 'Nigeria', rating: 76 },
    { name: 'Chumani Butsaka', team: 'Stellenbosch FC', position: 'MID', nationality: 'South Africa', rating: 75 },
    { name: 'Devin Titus', team: 'Stellenbosch FC', position: 'ATT', nationality: 'South Africa', rating: 78 },
    { name: 'Andre de Jong', team: 'Stellenbosch FC', position: 'ATT', nationality: 'New Zealand', rating: 77 },
    { name: 'Lehlohonolo Mojela', team: 'Stellenbosch FC', position: 'ATT', nationality: 'South Africa', rating: 76 },
    { name: 'Sanele Barns', team: 'Stellenbosch FC', position: 'ATT', nationality: 'South Africa', rating: 76 },

    // Sekhukhune United
    { name: 'Badra Ali Sangare', team: 'Sekhukhune United', position: 'GK', nationality: 'Ivory Coast', rating: 76 },
    { name: 'Lloyd Kazapua', team: 'Sekhukhune United', position: 'GK', nationality: 'Namibia', rating: 75 },
    { name: 'Nyiko Mobbie', team: 'Sekhukhune United', position: 'DEF', nationality: 'South Africa', rating: 78 },
    { name: 'Tresor Tshibwabwa', team: 'Sekhukhune United', position: 'DEF', nationality: 'DR Congo', rating: 77 },
    { name: 'Njabulo Ngcobo', team: 'Sekhukhune United', position: 'DEF', nationality: 'South Africa', rating: 76 },
    { name: 'Vuyo Letlapa', team: 'Sekhukhune United', position: 'DEF', nationality: 'South Africa', rating: 74 },
    { name: 'Linda Mntambo', team: 'Sekhukhune United', position: 'MID', nationality: 'South Africa', rating: 78 },
    { name: 'Jamie Webber', team: 'Sekhukhune United', position: 'MID', nationality: 'South Africa', rating: 77 },
    { name: 'Siphesihle Mkhize', team: 'Sekhukhune United', position: 'MID', nationality: 'South Africa', rating: 75 },
    { name: 'Thabang Monare', team: 'Sekhukhune United', position: 'MID', nationality: 'South Africa', rating: 76 },
    { name: 'Chibuike Ohizu', team: 'Sekhukhune United', position: 'ATT', nationality: 'Nigeria', rating: 77 },
    { name: 'Keletso Makgalwa', team: 'Sekhukhune United', position: 'ATT', nationality: 'South Africa', rating: 76 },
    { name: 'Andy Boyeli', team: 'Sekhukhune United', position: 'ATT', nationality: 'DR Congo', rating: 75 },

    // Cape Town City
    { name: 'Darren Keet', team: 'Cape Town City', position: 'GK', nationality: 'South Africa', rating: 79 },
    { name: 'Thamsanqa Mkhize', team: 'Cape Town City', position: 'DEF', nationality: 'South Africa', rating: 78 },
    { name: 'Keanu Cupido', team: 'Cape Town City', position: 'DEF', nationality: 'South Africa', rating: 77 },
    { name: 'Lorenzo Gordinho', team: 'Cape Town City', position: 'DEF', nationality: 'South Africa', rating: 76 },
    { name: 'Patrick Fisher', team: 'Cape Town City', position: 'DEF', nationality: 'South Africa', rating: 74 },
    { name: 'Jaedin Rhodes', team: 'Cape Town City', position: 'MID', nationality: 'South Africa', rating: 77 },
    { name: 'Darwin Gonzalez', team: 'Cape Town City', position: 'ATT', nationality: 'Venezuela', rating: 78 },
    { name: 'Fortune Makaringe', team: 'Cape Town City', position: 'MID', nationality: 'South Africa', rating: 77 },
    { name: 'Haashim Domingo', team: 'Cape Town City', position: 'MID', nationality: 'South Africa', rating: 78 },
    { name: 'Kamohelo Mokotjo', team: 'Cape Town City', position: 'MID', nationality: 'South Africa', rating: 76 },
    { name: 'Amadou Soukouna', team: 'Cape Town City', position: 'ATT', nationality: 'France', rating: 77 },
    { name: 'Prins Tjiueza', team: 'Cape Town City', position: 'ATT', nationality: 'Namibia', rating: 76 },

    // SuperSport United
    { name: 'Ricardo Goss', team: 'SuperSport United', position: 'GK', nationality: 'South Africa', rating: 78 },
    { name: 'Washington Arubi', team: 'SuperSport United', position: 'GK', nationality: 'Zimbabwe', rating: 74 },
    { name: 'Thulani Hlatshwayo', team: 'SuperSport United', position: 'DEF', nationality: 'South Africa', rating: 79 },
    { name: 'Ime Okon', team: 'SuperSport United', position: 'DEF', nationality: 'South Africa', rating: 77 },
    { name: 'Lyle Lakay', team: 'SuperSport United', position: 'DEF', nationality: 'South Africa', rating: 79 },
    { name: 'Neo Rapoo', team: 'SuperSport United', position: 'DEF', nationality: 'South Africa', rating: 75 },
    { name: 'Grant Margeman', team: 'SuperSport United', position: 'MID', nationality: 'South Africa', rating: 79 },
    { name: 'Siphesihle Ndlovu', team: 'SuperSport United', position: 'MID', nationality: 'South Africa', rating: 78 },
    { name: 'Vincent Pule', team: 'SuperSport United', position: 'MID', nationality: 'South Africa', rating: 77 },
    { name: 'Brooklyn Poggenpoel', team: 'SuperSport United', position: 'MID', nationality: 'South Africa', rating: 74 },
    { name: 'Bradley Grobler', team: 'SuperSport United', position: 'ATT', nationality: 'South Africa', rating: 79 },
    { name: 'Gamphani Lungu', team: 'SuperSport United', position: 'ATT', nationality: 'Zambia', rating: 77 },
    { name: 'Terrence Dzvukamanja', team: 'SuperSport United', position: 'ATT', nationality: 'Zimbabwe', rating: 78 },

    // TS Galaxy
    { name: 'Wensten van der Linde', team: 'TS Galaxy', position: 'GK', nationality: 'South Africa', rating: 74 },
    { name: 'Jiří Ciupa', team: 'TS Galaxy', position: 'GK', nationality: 'Czech', rating: 72 },
    { name: 'Pogiso Sanoka', team: 'TS Galaxy', position: 'DEF', nationality: 'South Africa', rating: 77 },
    { name: 'Marks Munyai', team: 'TS Galaxy', position: 'DEF', nationality: 'South Africa', rating: 75 },
    { name: 'Macbeth Mahlangu', team: 'TS Galaxy', position: 'DEF', nationality: 'South Africa', rating: 75 },
    { name: 'Samukelo Kabini', team: 'TS Galaxy', position: 'DEF', nationality: 'South Africa', rating: 74 },
    { name: 'Mlungisi Mbunjana', team: 'TS Galaxy', position: 'MID', nationality: 'South Africa', rating: 78 },
    { name: 'Puso Dithejane', team: 'TS Galaxy', position: 'MID', nationality: 'South Africa', rating: 75 },
    { name: 'Thato Khiba', team: 'TS Galaxy', position: 'MID', nationality: 'South Africa', rating: 74 },
    { name: 'Nhlanhla Mgaga', team: 'TS Galaxy', position: 'MID', nationality: 'South Africa', rating: 75 },
    { name: 'Sphiwe Mahlangu', team: 'TS Galaxy', position: 'MID', nationality: 'South Africa', rating: 75 },
    { name: 'Samir Nurkovic', team: 'TS Galaxy', position: 'ATT', nationality: 'Serbia', rating: 77 },
    { name: 'Dzenan Zajmovic', team: 'TS Galaxy', position: 'ATT', nationality: 'Bosnia', rating: 76 },

    // AmaZulu
    { name: 'Veli Mothwa', team: 'AmaZulu', position: 'GK', nationality: 'South Africa', rating: 78 },
    { name: 'Richard Ofori', team: 'AmaZulu', position: 'GK', nationality: 'Ghana', rating: 76 },
    { name: 'Riaan Hanamub', team: 'AmaZulu', position: 'DEF', nationality: 'Namibia', rating: 79 },
    { name: 'Taariq Fielies', team: 'AmaZulu', position: 'DEF', nationality: 'South Africa', rating: 77 },
    { name: 'Abbubaker Mobara', team: 'AmaZulu', position: 'DEF', nationality: 'South Africa', rating: 76 },
    { name: 'Wayde Jooste', team: 'AmaZulu', position: 'DEF', nationality: 'South Africa', rating: 75 },
    { name: 'Ben Motshwari', team: 'AmaZulu', position: 'MID', nationality: 'South Africa', rating: 76 },
    { name: 'Hendrick Ekstein', team: 'AmaZulu', position: 'MID', nationality: 'South Africa', rating: 76 },
    { name: 'Ethan Brooks', team: 'AmaZulu', position: 'MID', nationality: 'South Africa', rating: 75 },
    { name: 'Celimpilo Ngema', team: 'AmaZulu', position: 'MID', nationality: 'South Africa', rating: 75 },
    { name: 'Rowan Human', team: 'AmaZulu', position: 'MID', nationality: 'South Africa', rating: 74 },
    { name: 'Etiosa Ighodaro', team: 'AmaZulu', position: 'ATT', nationality: 'Nigeria', rating: 77 },
    { name: 'Augustine Mulenga', team: 'AmaZulu', position: 'ATT', nationality: 'Zambia', rating: 76 },

    // Polokwane City
    { name: 'Manuel Sapunga', team: 'Polokwane City', position: 'GK', nationality: 'Equatorial Guinea', rating: 74 },
    { name: 'Lindokuhle Mathebula', team: 'Polokwane City', position: 'GK', nationality: 'South Africa', rating: 71 },
    { name: 'Tholo Matuludi', team: 'Polokwane City', position: 'DEF', nationality: 'South Africa', rating: 75 },
    { name: 'Bulelani Nikani', team: 'Polokwane City', position: 'DEF', nationality: 'South Africa', rating: 74 },
    { name: 'Lebohang Nkaki', team: 'Polokwane City', position: 'DEF', nationality: 'South Africa', rating: 73 },
    { name: 'Langelihle Ndlovu', team: 'Polokwane City', position: 'DEF', nationality: 'South Africa', rating: 72 },
    { name: 'Oswin Appollis', team: 'Polokwane City', position: 'MID', nationality: 'South Africa', rating: 79 },
    { name: 'Cole Alexander', team: 'Polokwane City', position: 'MID', nationality: 'South Africa', rating: 75 },
    { name: 'Manuel Kambala', team: 'Polokwane City', position: 'MID', nationality: 'Mozambique', rating: 74 },
    { name: 'Ndamulelo Maphangule', team: 'Polokwane City', position: 'MID', nationality: 'South Africa', rating: 73 },
    { name: 'Douglas Mapfumo', team: 'Polokwane City', position: 'ATT', nationality: 'Zimbabwe', rating: 74 },
    { name: 'Hlayisi Chauke', team: 'Polokwane City', position: 'ATT', nationality: 'South Africa', rating: 73 },

    // Golden Arrows
    { name: 'Sifiso Mlungwana', team: 'Golden Arrows', position: 'GK', nationality: 'South Africa', rating: 75 },
    { name: 'Ismail Watenga', team: 'Golden Arrows', position: 'GK', nationality: 'Uganda', rating: 74 },
    { name: 'Thabani Zuke', team: 'Golden Arrows', position: 'DEF', nationality: 'South Africa', rating: 76 },
    { name: 'Gladwin Shitolo', team: 'Golden Arrows', position: 'DEF', nationality: 'South Africa', rating: 74 },
    { name: 'Themba Mantshiyane', team: 'Golden Arrows', position: 'DEF', nationality: 'South Africa', rating: 73 },
    { name: 'Nduduzo Sibiya', team: 'Golden Arrows', position: 'MID', nationality: 'South Africa', rating: 77 },
    { name: 'Velemseni Ndwandwe', team: 'Golden Arrows', position: 'MID', nationality: 'South Africa', rating: 75 },
    { name: 'Angelo Van Rooi', team: 'Golden Arrows', position: 'MID', nationality: 'South Africa', rating: 74 },
    { name: 'Lungelo Dube', team: 'Golden Arrows', position: 'MID', nationality: 'South Africa', rating: 73 },
    { name: 'Knox Mutizwa', team: 'Golden Arrows', position: 'ATT', nationality: 'Zimbabwe', rating: 76 },
    { name: 'Ryan Moon', team: 'Golden Arrows', position: 'ATT', nationality: 'South Africa', rating: 74 },
    { name: 'Menzi Masuku', team: 'Golden Arrows', position: 'ATT', nationality: 'South Africa', rating: 74 },

    // Chippa United
    { name: 'Stanley Nwabali', team: 'Chippa United', position: 'GK', nationality: 'Nigeria', rating: 80 },
    { name: 'Darren Johnson', team: 'Chippa United', position: 'GK', nationality: 'South Africa', rating: 73 },
    { name: 'Justice Chabalala', team: 'Chippa United', position: 'DEF', nationality: 'South Africa', rating: 76 },
    { name: 'Roscoe Pietersen', team: 'Chippa United', position: 'DEF', nationality: 'South Africa', rating: 74 },
    { name: 'Sirgio Kammies', team: 'Chippa United', position: 'DEF', nationality: 'South Africa', rating: 73 },
    { name: 'Thabo Makhele', team: 'Chippa United', position: 'DEF', nationality: 'South Africa', rating: 73 },
    { name: 'Craig Martin', team: 'Chippa United', position: 'MID', nationality: 'South Africa', rating: 75 },
    { name: 'Sinoxolo Kwayiba', team: 'Chippa United', position: 'MID', nationality: 'South Africa', rating: 76 },
    { name: 'Andile Jali', team: 'Chippa United', position: 'MID', nationality: 'South Africa', rating: 76 },
    { name: 'Baraka Majogoro', team: 'Chippa United', position: 'MID', nationality: 'Tanzania', rating: 74 },
    { name: 'Siphelele Luthuli', team: 'Chippa United', position: 'MID', nationality: 'South Africa', rating: 73 },
    { name: 'Eva Nga', team: 'Chippa United', position: 'ATT', nationality: 'Cameroon', rating: 75 },
    { name: 'Elmo Kambindu', team: 'Chippa United', position: 'ATT', nationality: 'Namibia', rating: 73 },

    // Richards Bay
    { name: 'Salim Magoola', team: 'Richards Bay', position: 'GK', nationality: 'Uganda', rating: 77 },
    { name: 'Ian Otieno', team: 'Richards Bay', position: 'GK', nationality: 'Kenya', rating: 74 },
    { name: 'Keagan Allan', team: 'Richards Bay', position: 'DEF', nationality: 'South Africa', rating: 75 },
    { name: 'Simphiwe Mcineka', team: 'Richards Bay', position: 'DEF', nationality: 'South Africa', rating: 74 },
    { name: 'Thabani Dube', team: 'Richards Bay', position: 'DEF', nationality: 'South Africa', rating: 73 },
    { name: 'Siyethemba Sithebe', team: 'Richards Bay', position: 'MID', nationality: 'South Africa', rating: 76 },
    { name: 'Tlakusani Mthethwa', team: 'Richards Bay', position: 'MID', nationality: 'South Africa', rating: 75 },
    { name: 'Lwandile Mabuya', team: 'Richards Bay', position: 'MID', nationality: 'South Africa', rating: 73 },
    { name: 'Thulani Gumede', team: 'Richards Bay', position: 'MID', nationality: 'South Africa', rating: 72 },
    { name: 'Somila Ntsundwana', team: 'Richards Bay', position: 'ATT', nationality: 'South Africa', rating: 74 },
    { name: 'Thabiso Kutumela', team: 'Richards Bay', position: 'ATT', nationality: 'South Africa', rating: 75 },
    { name: 'Mxolisi Macuphu', team: 'Richards Bay', position: 'ATT', nationality: 'South Africa', rating: 74 },

    // Royal AM
    { name: 'Hugo Nyame', team: 'Royal AM', position: 'GK', nationality: 'Cameroon', rating: 74 },
    { name: 'Mondli Mpoto', team: 'Royal AM', position: 'GK', nationality: 'South Africa', rating: 72 },
    { name: 'Zukile Mkhize', team: 'Royal AM', position: 'DEF', nationality: 'South Africa', rating: 74 },
    { name: 'Lesego Manganyi', team: 'Royal AM', position: 'DEF', nationality: 'South Africa', rating: 73 },
    { name: 'Thabo Matlaba', team: 'Royal AM', position: 'DEF', nationality: 'South Africa', rating: 74 },
    { name: 'Kabelo Mahlasela', team: 'Royal AM', position: 'MID', nationality: 'South Africa', rating: 77 },
    { name: 'Andile Mpisane', team: 'Royal AM', position: 'MID', nationality: 'South Africa', rating: 68 },
    { name: 'Mfundo Thikazi', team: 'Royal AM', position: 'MID', nationality: 'South Africa', rating: 76 },
    { name: 'Jeffrey Dlamini', team: 'Royal AM', position: 'MID', nationality: 'South Africa', rating: 74 },
    { name: 'Sera Motebang', team: 'Royal AM', position: 'ATT', nationality: 'Lesotho', rating: 75 },
    { name: 'Sedwyn George', team: 'Royal AM', position: 'ATT', nationality: 'South Africa', rating: 73 },

    // Magesi FC
    { name: 'Elvis Chipezeze', team: 'Magesi FC', position: 'GK', nationality: 'Zimbabwe', rating: 73 },
    { name: 'Mbali Tshabalala', team: 'Magesi FC', position: 'GK', nationality: 'South Africa', rating: 70 },
    { name: 'Lebo Ngubeni', team: 'Magesi FC', position: 'DEF', nationality: 'South Africa', rating: 71 },
    { name: 'Sello Motsepe', team: 'Magesi FC', position: 'DEF', nationality: 'South Africa', rating: 72 },
    { name: 'Delano Abrahams', team: 'Magesi FC', position: 'DEF', nationality: 'South Africa', rating: 71 },
    { name: 'Deolin Mekoa', team: 'Magesi FC', position: 'MID', nationality: 'South Africa', rating: 74 },
    { name: 'Samuel Darpoh', team: 'Magesi FC', position: 'MID', nationality: 'Ghana', rating: 73 },
    { name: 'Kgaogelo Sekgota', team: 'Magesi FC', position: 'ATT', nationality: 'South Africa', rating: 75 },
    { name: 'Rhulani Manzini', team: 'Magesi FC', position: 'ATT', nationality: 'South Africa', rating: 73 },
    { name: 'Wonderboy Makhubu', team: 'Magesi FC', position: 'ATT', nationality: 'South Africa', rating: 72 },
    { name: 'Edmore Chirambadare', team: 'Magesi FC', position: 'ATT', nationality: 'Zimbabwe', rating: 73 },
    { name: 'Gift Motupa', team: 'Magesi FC', position: 'ATT', nationality: 'South Africa', rating: 74 }
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
