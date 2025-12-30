
import { Player } from '@/contexts/AuthContext';
import { calculatePoints, MatchStats } from './pointsService';
import { playersDatabase } from '@/data/playersData';

export interface GameweekResult {
    gameweek: number;
    totalPoints: number;
    squadPoints: number;
    benchPoints: number;
    playerStats: Record<string, { points: number; stats: MatchStats }>; // Map playerId -> result
    date: string;
}

// Helper to generate random match stats for simulation
const generateRandomStats = (position: string): MatchStats => {
    const isGK = position === 'GK';
    const isDEF = position === 'DEF';
    const isMID = position === 'MID';
    const isATT = position === 'ATT';

    // Base randoms
    const minutes = Math.random() > 0.1 ? 90 : Math.floor(Math.random() * 90); // 90% chance of full game

    // Goals (weighted by position)
    let goals = 0;
    if (isATT && Math.random() > 0.6) goals = Math.floor(Math.random() * 2) + 1;
    else if (isMID && Math.random() > 0.8) goals = 1;
    else if (isDEF && Math.random() > 0.95) goals = 1;

    // Assists
    let assists = 0;
    if (Math.random() > 0.8) assists = 1;

    // Clean Sheets
    const cleanSheet = (isGK || isDEF) && Math.random() > 0.7; // 30% chance of CS for defenders

    // GK Stats
    const saves = isGK ? Math.floor(Math.random() * 6) : 0;
    const penaltiesSaved = isGK && Math.random() > 0.95 ? 1 : 0;

    // Bad stuff
    const yellowCards = Math.random() > 0.85 ? 1 : 0;
    const redCards = Math.random() > 0.98 ? 1 : 0;
    const ownGoals = Math.random() > 0.99 ? 1 : 0;
    const goalsConceded = cleanSheet ? 0 : Math.floor(Math.random() * 3) + 1;

    return {
        minutesPlayed: minutes,
        goals,
        assists,
        cleanSheet,
        saves,
        penaltiesSaved,
        yellowCards,
        redCards,
        ownGoals,
        goalsConceded
    };
};

export const simulateGameweek = (squad: Player[], bench: Player[], gameweekNumber: number): GameweekResult => {
    const playerStats: Record<string, { points: number; stats: MatchStats }> = {};
    let squadPoints = 0;
    let benchPoints = 0;

    // Process Starting 11
    squad.forEach(player => {
        const stats = generateRandomStats(player.position);
        const { total } = calculatePoints(stats, player.position);
        playerStats[player.id] = { points: total, stats };
        squadPoints += total;
    });

    // Process Bench (Points calculated but don't count towards total unless subbed - for now just tracking)
    bench.forEach(player => {
        const stats = generateRandomStats(player.position);
        const { total } = calculatePoints(stats, player.position);
        playerStats[player.id] = { points: total, stats };
        benchPoints += total;
    });

    return {
        gameweek: gameweekNumber,
        totalPoints: squadPoints, // Standard rule: Only starting 11 counts
        squadPoints,
        benchPoints,
        playerStats,
        date: new Date().toISOString()
    };
};

// Admin function to simulate a gameweek for ALL players in the DB (for leaderboards/mocks)
export const simulateUniverseGameweek = (gameweekNumber: number) => {
    // This would ideally store global match results for the week
    // For MVP, we just return a map of random scores for every player ID
    const universeResults: Record<string, { points: number; stats: MatchStats }> = {};

    playersDatabase.forEach(player => {
        const stats = generateRandomStats(player.position);
        const { total } = calculatePoints(stats, player.position);
        universeResults[player.id] = { points: total, stats };
    });

    return universeResults;
};
