import { useMemo } from 'react';

export interface PlayerForChemistry {
  id: string;
  name: string;
  club: string;
  nationality: string;
  position: string;
}

export interface ChemistryResult {
  totalChemistry: number;
  maxPossibleChemistry: number;
  chemistryPercentage: number;
  chemistryGrade: 'Poor' | 'Average' | 'Good' | 'Excellent';
  chemistryColor: string;
}

export const useTeamChemistry = (squad: PlayerForChemistry[]): ChemistryResult => {
  return useMemo(() => {
    if (squad.length < 2) {
      return {
        totalChemistry: 0,
        maxPossibleChemistry: 0,
        chemistryPercentage: 0,
        chemistryGrade: 'Poor',
        chemistryColor: '#ef4444'
      };
    }

    let totalChemistry = 0;
    const squadSize = squad.length;
    
    // Calculate chemistry for every unique pair of players
    for (let i = 0; i < squadSize; i++) {
      for (let j = i + 1; j < squadSize; j++) {
        const player1 = squad[i];
        const player2 = squad[j];
        
        // Add chemistry points for shared attributes
        if (player1.club === player2.club) {
          totalChemistry += 5; // Same club
        }
        
        if (player1.nationality === player2.nationality) {
          totalChemistry += 3; // Same nationality
        }
        
        if (player1.position === player2.position) {
          totalChemistry += 1; // Same position
        }
      }
    }
    
    // Calculate maximum possible chemistry
    // For 11 players: 55 unique pairs × 9 points (5+3+1) = 495 max
    const numberOfPairs = (squadSize * (squadSize - 1)) / 2;
    const maxPossibleChemistry = numberOfPairs * 9; // Max points per pair
    
    // Calculate percentage (scale to 100)
    const chemistryPercentage = maxPossibleChemistry > 0 ? (totalChemistry / maxPossibleChemistry) * 100 : 0;
    
    // Determine grade and color
    let chemistryGrade: ChemistryResult['chemistryGrade'];
    let chemistryColor: string;
    
    if (chemistryPercentage >= 75) {
      chemistryGrade = 'Excellent';
      chemistryColor = '#22c55e'; // Green
    } else if (chemistryPercentage >= 50) {
      chemistryGrade = 'Good';
      chemistryColor = '#3b82f6'; // Blue
    } else if (chemistryPercentage >= 25) {
      chemistryGrade = 'Average';
      chemistryColor = '#f59e0b'; // Yellow
    } else {
      chemistryGrade = 'Poor';
      chemistryColor = '#ef4444'; // Red
    }
    
    return {
      totalChemistry,
      maxPossibleChemistry,
      chemistryPercentage: Math.round(chemistryPercentage),
      chemistryGrade,
      chemistryColor
    };
  }, [squad]);
};