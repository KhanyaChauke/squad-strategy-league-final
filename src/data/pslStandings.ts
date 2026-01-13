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

// Updated snapshot based on user provided table
export const pslStandings: PSLStanding[] = [
    { rank: 1, team: 'Orlando Pirates', played: 12, won: 9, drawn: 1, lost: 2, goalsFor: 18, goalsAgainst: 5, goalDifference: 13, points: 28, form: ['W', 'W', 'W', 'L', 'W'] },
    { rank: 2, team: 'Mamelodi Sundowns', played: 13, won: 7, drawn: 5, lost: 1, goalsFor: 20, goalsAgainst: 7, goalDifference: 13, points: 26, form: ['W', 'D', 'W', 'D', 'W'] },
    { rank: 3, team: 'Sekhukhune United', played: 13, won: 7, drawn: 4, lost: 2, goalsFor: 16, goalsAgainst: 7, goalDifference: 9, points: 25, form: ['W', 'W', 'D', 'W', 'L'] },
    { rank: 4, team: 'Kaizer Chiefs', played: 13, won: 6, drawn: 6, lost: 1, goalsFor: 13, goalsAgainst: 6, goalDifference: 7, points: 24, form: ['W', 'D', 'W', 'D', 'W'] },
    { rank: 5, team: 'AmaZulu FC', played: 14, won: 7, drawn: 3, lost: 4, goalsFor: 15, goalsAgainst: 12, goalDifference: 3, points: 24, form: ['W', 'L', 'W', 'W', 'D'] },
    { rank: 6, team: 'Polokwane City', played: 14, won: 6, drawn: 5, lost: 3, goalsFor: 11, goalsAgainst: 8, goalDifference: 3, points: 23, form: ['W', 'D', 'L', 'W', 'D'] },
    { rank: 7, team: 'Durban City', played: 15, won: 6, drawn: 4, lost: 5, goalsFor: 14, goalsAgainst: 11, goalDifference: 3, points: 22, form: ['L', 'W', 'W', 'D', 'L'] },
    { rank: 8, team: 'TS Galaxy', played: 14, won: 6, drawn: 3, lost: 5, goalsFor: 18, goalsAgainst: 13, goalDifference: 5, points: 21, form: ['W', 'L', 'W', 'D', 'L'] },
    { rank: 9, team: 'Richards Bay', played: 14, won: 4, drawn: 5, lost: 5, goalsFor: 11, goalsAgainst: 13, goalDifference: -2, points: 17, form: ['D', 'D', 'W', 'L', 'L'] },
    { rank: 10, team: 'Golden Arrows', played: 14, won: 5, drawn: 1, lost: 8, goalsFor: 19, goalsAgainst: 19, goalDifference: 0, points: 16, form: ['L', 'L', 'W', 'L', 'W'] },
    { rank: 11, team: 'Siwelele', played: 15, won: 4, drawn: 4, lost: 7, goalsFor: 8, goalsAgainst: 13, goalDifference: -5, points: 16, form: ['D', 'L', 'L', 'W', 'D'] },
    { rank: 12, team: 'Marumo Gallants', played: 14, won: 3, drawn: 6, lost: 5, goalsFor: 12, goalsAgainst: 17, goalDifference: -5, points: 15, form: ['D', 'D', 'L', 'W', 'L'] },
    { rank: 13, team: 'Orbit College FC', played: 14, won: 4, drawn: 1, lost: 9, goalsFor: 12, goalsAgainst: 25, goalDifference: -13, points: 13, form: ['L', 'W', 'L', 'L', 'L'] },
    { rank: 14, team: 'Stellenbosch FC', played: 14, won: 3, drawn: 3, lost: 8, goalsFor: 10, goalsAgainst: 18, goalDifference: -8, points: 12, form: ['L', 'L', 'L', 'D', 'W'] },
    { rank: 15, team: 'Magesi FC', played: 14, won: 2, drawn: 5, lost: 7, goalsFor: 10, goalsAgainst: 19, goalDifference: -9, points: 11, form: ['D', 'L', 'D', 'L', 'D'] },
    { rank: 16, team: 'Chippa United', played: 15, won: 1, drawn: 6, lost: 8, goalsFor: 7, goalsAgainst: 21, goalDifference: -14, points: 9, form: ['L', 'D', 'L', 'L', 'D'] }
];
