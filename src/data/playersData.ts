
import { getEnhancedPSLData } from '@/services/footballDataApi';

export interface Player {
  id: string;
  name: string;
  position: 'GK' | 'DEF' | 'MID' | 'ATT';
  club: string;
  nationality: string;
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

// Generate enhanced PSL database with proper budget balancing
const rawPlayersData: Player[] = getEnhancedPSLData();

// Ensure budget is balanced for a starting 11
// Average cost per player should be around 90-100M for a 1B budget
const totalBudget = 1000000000; // 1 billion
const averageCostPerPlayer = totalBudget / 11; // ~90M per player

// Adjust player costs to ensure budget balance
const adjustedPlayers = rawPlayersData.map(player => {
  const positionMultipliers = {
    GK: 0.7,   // Goalkeepers cheaper
    DEF: 0.8,  // Defenders slightly cheaper
    MID: 1.0,  // Midfielders at average
    ATT: 1.4   // Attackers more expensive
  };
  
  const ratingMultiplier = player.rating / 80; // Scale based on rating
  const baselineCost = averageCostPerPlayer * positionMultipliers[player.position] * ratingMultiplier;
  
  // Add variance but keep within reasonable bounds
  const variance = baselineCost * 0.3;
  const adjustedCost = baselineCost + (Math.random() * variance * 2 - variance);
  
  return {
    ...player,
    cost: Math.max(20000000, Math.round(adjustedCost / 5000000) * 5000000) // Minimum 20M, round to 5M
  };
});

// Export the final players database
export const playersDatabase = adjustedPlayers;

export const getPlayersByPosition = (position?: string) => {
  if (!position) return adjustedPlayers;
  return adjustedPlayers.filter(player => player.position === position);
};

export const getPlayerById = (id: string) => {
  return adjustedPlayers.find(player => player.id === id);
};

export const searchPlayers = (query: string) => {
  const lowercaseQuery = query.toLowerCase();
  return adjustedPlayers.filter(player => 
    player.name.toLowerCase().includes(lowercaseQuery) ||
    player.club.toLowerCase().includes(lowercaseQuery) ||
    player.position.toLowerCase().includes(lowercaseQuery)
  );
};

// Helper function to get budget-optimized squad suggestions
export const getBudgetOptimizedSquad = (budget: number = 1000000000) => {
  const formation = { GK: 1, DEF: 4, MID: 4, ATT: 2 }; // 4-4-2 formation
  const squad: Player[] = [];
  let remainingBudget = budget;
  
  // Sort players by value for money (rating per cost)
  const valueForMoney = adjustedPlayers.map(player => ({
    ...player,
    valueRatio: player.rating / (player.cost / 1000000)
  })).sort((a, b) => b.valueRatio - a.valueRatio);
  
  // Fill each position with best value players
  Object.entries(formation).forEach(([pos, count]) => {
    const position = pos as 'GK' | 'DEF' | 'MID' | 'ATT';
    const positionPlayers = valueForMoney.filter(p => 
      p.position === position && 
      !squad.some(s => s.id === p.id)
    );
    
    for (let i = 0; i < count && positionPlayers.length > 0; i++) {
      const affordablePlayers = positionPlayers.filter(p => p.cost <= remainingBudget);
      if (affordablePlayers.length > 0) {
        const selectedPlayer = affordablePlayers[0];
        squad.push(selectedPlayer);
        remainingBudget -= selectedPlayer.cost;
      }
    }
  });
  
  return { squad, remainingBudget };
};
