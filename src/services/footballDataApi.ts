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
  club: string;
  rating: number;
  pace: number;
  shooting: number;
  passing: number;
  defending: number;
  dribbling: number;
  physical: number;
  cost: number;
  imageUrl?: string;
}

const API_KEY = 'YOUR_API_KEY'; // Users need to get this from football-data.org
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
                club: team.name,
                rating: Math.round(stats.rating),
                pace: Math.round(stats.pace),
                shooting: Math.round(stats.shooting),
                passing: Math.round(stats.passing),
                defending: Math.round(stats.defending),
                dribbling: Math.round(stats.dribbling),
                physical: Math.round(stats.physical),
                cost
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
    'Mamelodi Sundowns', 'Orlando Pirates', 'Kaizer Chiefs', 'AmaZulu', 'Cape Town City',
    'Stellenbosch FC', 'SuperSport United', 'Golden Arrows', 'Sekhukhune United', 'Royal AM',
    'Maritzburg United', 'Chippa United', 'Baroka FC', 'TS Galaxy', 'Swallows FC'
  ];

  const playerNames = [
    // Goalkeepers
    'Ronwen Williams', 'Itumeleng Khune', 'Veli Mothwa', 'Brandon Petersen', 'Siyabonga Mbatha',
    'Rushwin Dortley', 'Darren Keet', 'Jody February', 'Daniel Akpeyi', 'Bruce Bvuma',
    
    // Defenders  
    'Rushine De Reuck', 'Grant Kekana', 'Innocent Maela', 'Nkosinathi Sibisi', 'Siyanda Xulu',
    'Njabulo Ngcobo', 'Ramahlwe Mphahlele', 'Happy Jele', 'Thulani Hlatshwayo', 'Clayton Daniels',
    'Luke Fleurs', 'Terrence Mashego', 'Divine Lunga', 'Nyiko Mobbie', 'Sbonelo Cele',
    'Abdelmounaim Boutouil', 'Tebogo Tlolane', 'Sandile Mthethwa', 'Mothobi Mvala', 'Lorenzo Gordinho',
    
    // Midfielders
    'Themba Zwane', 'Teboho Mokoena', 'Keagan Dolly', 'Goodman Mosele', 'Monnapule Saleng',
    'Siphelele Ntshangase', 'Kermit Erasmus', 'Khama Billiat', 'Lebohang Maboe', 'Sphelele Mkhulise',
    'Vincent Pule', 'Thabo Qalinge', 'Bandile Shandu', 'Fortune Makaringe', 'Ben Motshwari',
    'George Maluleka', 'Cole Alexander', 'Dumisani Zuma', 'Yusuf Maart', 'Kabelo Mahlasela',
    'Keletso Makgalwa', 'Ethan Brooks', 'Thabang Monare', 'Njabulo Blom', 'Ashley Du Preez',
    
    // Attackers
    'Peter Shalulile', 'Evidence Makgopa', 'Ranga Chivaviro', 'Khanyisa Mayo', 'Iqraam Rayners',
    'Cassius Mailula', 'Zakhele Lepasa', 'Gabadinho Mhango', 'Kermit Erasmus', 'Victor Letsoalo',
    'Lyle Foster', 'Luther Singh', 'Fagrie Lakay', 'Bradley Grobler', 'Bongokuhle Hlongwane',
    'Judas Moseamedi', 'Sipho Mbule', 'Tshegofatso Mabasa', 'Kwame Peprah', 'Bienvenu Eva Nga'
  ];

  const players: TransformedPlayer[] = [];
  let playerIndex = 0;

  // Generate players for each position ensuring balanced squad building
  const positionCounts = { GK: 15, DEF: 40, MID: 35, ATT: 30 };
  
  Object.entries(positionCounts).forEach(([pos, count]) => {
    const position = pos as 'GK' | 'DEF' | 'MID' | 'ATT';
    
    for (let i = 0; i < count; i++) {
      const stats = generatePlayerStats(position);
      const rating = Math.round(stats.rating);
      const cost = calculatePlayerCost(rating, position);
      
      players.push({
        id: `psl_${position.toLowerCase()}_${i + 1}`,
        name: playerNames[playerIndex % playerNames.length] || `${position} Player ${i + 1}`,
        position,
        club: pslTeams[Math.floor(Math.random() * pslTeams.length)],
        rating,
        pace: Math.round(stats.pace),
        shooting: Math.round(stats.shooting),
        passing: Math.round(stats.passing),
        defending: Math.round(stats.defending),
        dribbling: Math.round(stats.dribbling),
        physical: Math.round(stats.physical),
        cost
      });
      
      playerIndex++;
    }
  });

  return players;
};
