export interface PSLStanding {
    rank: number;
    team: string;
    points: number;
    played: number;
    win: number;
    draw: number;
    loss: number;
    goalsFor: number;
    goalsAgainst: number;
    goalDifference: number;
    form?: string[];
}

export const standings2023_2024: PSLStanding[] = [
    { rank: 1, team: 'Mamelodi Sundowns', played: 30, win: 22, draw: 7, loss: 1, goalsFor: 52, goalsAgainst: 11, goalDifference: 41, points: 73, form: ['W', 'D', 'W', 'W', 'L'] },
    { rank: 2, team: 'Orlando Pirates', played: 30, win: 15, draw: 8, loss: 7, goalsFor: 44, goalsAgainst: 26, goalDifference: 18, points: 53, form: ['W', 'D', 'L', 'W', 'W'] },
    { rank: 3, team: 'Stellenbosch FC', played: 30, win: 14, draw: 8, loss: 8, goalsFor: 39, goalsAgainst: 24, goalDifference: 15, points: 50, form: ['W', 'L', 'W', 'D', 'W'] },
    { rank: 4, team: 'Sekhukhune United', played: 30, win: 12, draw: 9, loss: 9, goalsFor: 31, goalsAgainst: 24, goalDifference: 7, points: 45, form: ['D', 'W', 'D', 'L', 'D'] },
    { rank: 5, team: 'Cape Town City', played: 30, win: 12, draw: 9, loss: 9, goalsFor: 32, goalsAgainst: 26, goalDifference: 6, points: 45, form: ['W', 'W', 'L', 'D', 'W'] },
    { rank: 6, team: 'SuperSport United', played: 30, win: 11, draw: 11, loss: 8, goalsFor: 35, goalsAgainst: 33, goalDifference: 2, points: 44, form: ['D', 'D', 'W', 'D', 'L'] },
    { rank: 7, team: 'TS Galaxy', played: 30, win: 11, draw: 8, loss: 11, goalsFor: 30, goalsAgainst: 26, goalDifference: 4, points: 41, form: ['L', 'W', 'L', 'D', 'L'] },
    { rank: 8, team: 'Polokwane City', played: 30, win: 9, draw: 12, loss: 9, goalsFor: 21, goalsAgainst: 27, goalDifference: -6, points: 39, form: ['D', 'W', 'D', 'W', 'D'] },
    { rank: 9, team: 'Golden Arrows', played: 30, win: 10, draw: 7, loss: 13, goalsFor: 35, goalsAgainst: 49, goalDifference: -14, points: 37, form: ['D', 'L', 'D', 'W', 'D'] },
    { rank: 10, team: 'Kaizer Chiefs', played: 30, win: 9, draw: 9, loss: 12, goalsFor: 25, goalsAgainst: 30, goalDifference: -5, points: 36, form: ['D', 'D', 'L', 'D', 'L'] },
    { rank: 11, team: 'AmaZulu', played: 30, win: 8, draw: 11, loss: 11, goalsFor: 24, goalsAgainst: 30, goalDifference: -6, points: 35, form: ['L', 'D', 'W', 'L', 'L'] },
    { rank: 12, team: 'Chippa United', played: 30, win: 8, draw: 10, loss: 12, goalsFor: 26, goalsAgainst: 29, goalDifference: -3, points: 34, form: ['L', 'L', 'D', 'L', 'L'] },
    { rank: 13, team: 'Royal AM', played: 30, win: 9, draw: 6, loss: 15, goalsFor: 24, goalsAgainst: 43, goalDifference: -19, points: 33, form: ['L', 'L', 'L', 'D', 'W'] },
    { rank: 14, team: 'Moroka Swallows', played: 30, win: 8, draw: 8, loss: 14, goalsFor: 24, goalsAgainst: 36, goalDifference: -12, points: 32, form: ['W', 'L', 'D', 'W', 'L'] },
    { rank: 15, team: 'Richards Bay', played: 30, win: 8, draw: 6, loss: 16, goalsFor: 24, goalsAgainst: 37, goalDifference: -13, points: 30, form: ['W', 'D', 'W', 'L', 'W'] },
    { rank: 16, team: 'Cape Town Spurs', played: 30, win: 6, draw: 5, loss: 19, goalsFor: 23, goalsAgainst: 45, goalDifference: -22, points: 23, form: ['W', 'L', 'D', 'L', 'W'] }
];

// Fictional 2024/2025 Standings (Projected Past)
export const standings2024_2025: PSLStanding[] = [
    { rank: 1, team: 'Mamelodi Sundowns', played: 30, win: 23, draw: 6, loss: 1, goalsFor: 58, goalsAgainst: 14, goalDifference: 44, points: 75, form: ['W', 'W', 'W', 'D', 'W'] },
    { rank: 2, team: 'Stellenbosch FC', played: 30, win: 17, draw: 8, loss: 5, goalsFor: 45, goalsAgainst: 22, goalDifference: 23, points: 59, form: ['W', 'W', 'D', 'W', 'L'] },
    { rank: 3, team: 'Orlando Pirates', played: 30, win: 16, draw: 9, loss: 5, goalsFor: 48, goalsAgainst: 25, goalDifference: 23, points: 57, form: ['W', 'D', 'W', 'W', 'D'] },
    { rank: 4, team: 'Kaizer Chiefs', played: 30, win: 14, draw: 8, loss: 8, goalsFor: 38, goalsAgainst: 28, goalDifference: 10, points: 50, form: ['W', 'D', 'L', 'W', 'W'] },
    { rank: 5, team: 'SuperSport United', played: 30, win: 11, draw: 12, loss: 7, goalsFor: 34, goalsAgainst: 29, goalDifference: 5, points: 45, form: ['D', 'D', 'W', 'L', 'D'] },
    { rank: 6, team: 'Cape Town City', played: 30, win: 11, draw: 10, loss: 9, goalsFor: 33, goalsAgainst: 30, goalDifference: 3, points: 43, form: ['W', 'L', 'W', 'L', 'W'] },
    { rank: 7, team: 'Sekhukhune United', played: 30, win: 10, draw: 11, loss: 9, goalsFor: 29, goalsAgainst: 28, goalDifference: 1, points: 41, form: ['D', 'W', 'L', 'D', 'D'] },
    { rank: 8, team: 'AmaZulu', played: 30, win: 9, draw: 12, loss: 9, goalsFor: 27, goalsAgainst: 29, goalDifference: -2, points: 39, form: ['D', 'D', 'D', 'W', 'L'] },
    { rank: 9, team: 'TS Galaxy', played: 30, win: 9, draw: 10, loss: 11, goalsFor: 28, goalsAgainst: 32, goalDifference: -4, points: 37, form: ['L', 'W', 'L', 'L', 'D'] },
    { rank: 10, team: 'Polokwane City', played: 30, win: 8, draw: 12, loss: 10, goalsFor: 25, goalsAgainst: 31, goalDifference: -6, points: 36, form: ['D', 'L', 'D', 'W', 'D'] },
    { rank: 11, team: 'Golden Arrows', played: 30, win: 8, draw: 10, loss: 12, goalsFor: 28, goalsAgainst: 38, goalDifference: -10, points: 34, form: ['L', 'D', 'L', 'W', 'L'] },
    { rank: 12, team: 'Chippa United', played: 30, win: 7, draw: 11, loss: 12, goalsFor: 24, goalsAgainst: 35, goalDifference: -11, points: 32, form: ['D', 'L', 'D', 'D', 'W'] },
    { rank: 13, team: 'Richards Bay', played: 30, win: 7, draw: 9, loss: 14, goalsFor: 22, goalsAgainst: 36, goalDifference: -14, points: 30, form: ['W', 'D', 'L', 'L', 'D'] },
    { rank: 14, team: 'Royal AM', played: 30, win: 6, draw: 11, loss: 13, goalsFor: 23, goalsAgainst: 40, goalDifference: -17, points: 29, form: ['L', 'D', 'L', 'D', 'L'] },
    { rank: 15, team: 'Magesi FC', played: 30, win: 6, draw: 8, loss: 16, goalsFor: 20, goalsAgainst: 42, goalDifference: -22, points: 26, form: ['L', 'W', 'L', 'D', 'L'] },
    { rank: 16, team: 'Marumo Gallants', played: 30, win: 4, draw: 9, loss: 17, goalsFor: 19, goalsAgainst: 45, goalDifference: -26, points: 21, form: ['L', 'L', 'L', 'L', 'D'] }
];

export const getHistoricalStandings = (season: string): PSLStanding[] | null => {
    switch (season) {
        case '2023/2024': return standings2023_2024;
        case '2024/2025': return standings2024_2025;
        default: return null;
    }
};
