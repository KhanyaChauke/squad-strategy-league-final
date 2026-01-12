export interface PSLStanding {
    rank: number;
    team: string;
    played: number;
    won: number;
    drawn: number;
    lost: number;
    goalsFor: number;
    goalsAgainst: number;
    goalDifference: number;
    points: number;
    form: string[]; // ['W', 'D', 'L', 'W', 'W']
}

// Realistic snapshot for Jan 2026 (approx Matchday 14/15)
export const pslStandings: PSLStanding[] = [
    { rank: 1, team: 'Mamelodi Sundowns', played: 14, won: 11, drawn: 2, lost: 1, goalsFor: 28, goalsAgainst: 7, goalDifference: 21, points: 35, form: ['W', 'W', 'D', 'W', 'W'] },
    { rank: 2, team: 'Orlando Pirates', played: 14, won: 9, drawn: 3, lost: 2, goalsFor: 24, goalsAgainst: 10, goalDifference: 14, points: 30, form: ['W', 'D', 'W', 'W', 'L'] },
    { rank: 3, team: 'Stellenbosch FC', played: 14, won: 8, drawn: 4, lost: 2, goalsFor: 20, goalsAgainst: 12, goalDifference: 8, points: 28, form: ['W', 'W', 'D', 'L', 'W'] },
    { rank: 4, team: 'Sekhukhune United', played: 14, won: 7, drawn: 4, lost: 3, goalsFor: 18, goalsAgainst: 11, goalDifference: 7, points: 25, form: ['D', 'W', 'W', 'L', 'D'] },
    { rank: 5, team: 'Kaizer Chiefs', played: 13, won: 7, drawn: 3, lost: 3, goalsFor: 19, goalsAgainst: 13, goalDifference: 6, points: 24, form: ['L', 'W', 'W', 'D', 'W'] },
    { rank: 6, team: 'SuperSport United', played: 14, won: 6, drawn: 5, lost: 3, goalsFor: 17, goalsAgainst: 14, goalDifference: 3, points: 23, form: ['D', 'D', 'W', 'L', 'W'] },
    { rank: 7, team: 'Cape Town City', played: 14, won: 5, drawn: 5, lost: 4, goalsFor: 16, goalsAgainst: 15, goalDifference: 1, points: 20, form: ['W', 'L', 'D', 'D', 'W'] },
    { rank: 8, team: 'TS Galaxy', played: 14, won: 5, drawn: 4, lost: 5, goalsFor: 14, goalsAgainst: 14, goalDifference: 0, points: 19, form: ['W', 'L', 'W', 'L', 'D'] },
    { rank: 9, team: 'Polokwane City', played: 14, won: 4, drawn: 6, lost: 4, goalsFor: 12, goalsAgainst: 13, goalDifference: -1, points: 18, form: ['D', 'D', 'L', 'W', 'D'] },
    { rank: 10, team: 'Golden Arrows', played: 14, won: 5, drawn: 2, lost: 7, goalsFor: 15, goalsAgainst: 20, goalDifference: -5, points: 17, form: ['L', 'L', 'W', 'L', 'W'] },
    { rank: 11, team: 'AmaZulu FC', played: 14, won: 4, drawn: 4, lost: 6, goalsFor: 11, goalsAgainst: 16, goalDifference: -5, points: 16, form: ['D', 'W', 'L', 'D', 'L'] },
    { rank: 12, team: 'Chippa United', played: 14, won: 4, drawn: 3, lost: 7, goalsFor: 13, goalsAgainst: 19, goalDifference: -6, points: 15, form: ['L', 'W', 'L', 'L', 'D'] },
    { rank: 13, team: 'Siwelele', played: 14, won: 3, drawn: 5, lost: 6, goalsFor: 12, goalsAgainst: 18, goalDifference: -6, points: 14, form: ['D', 'L', 'D', 'W', 'L'] },
    { rank: 14, team: 'Richards Bay', played: 14, won: 3, drawn: 3, lost: 8, goalsFor: 10, goalsAgainst: 19, goalDifference: -9, points: 12, form: ['W', 'L', 'L', 'D', 'L'] },
    { rank: 15, team: 'Marumo Gallants', played: 14, won: 2, drawn: 4, lost: 8, goalsFor: 9, goalsAgainst: 20, goalDifference: -11, points: 10, form: ['L', 'D', 'L', 'L', 'W'] },
    { rank: 16, team: 'Magesi FC', played: 14, won: 2, drawn: 3, lost: 9, goalsFor: 8, goalsAgainst: 21, goalDifference: -13, points: 9, form: ['L', 'L', 'D', 'L', 'L'] }
];
