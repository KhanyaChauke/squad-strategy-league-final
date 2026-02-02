
import { calculatePoints, MatchStats } from './pointsService';

const API_KEY = import.meta.env.VITE_RAPID_API_KEY || '1a5d324f62mshf82070b791b2f3ap10994fjsnd9dc8ed92749';
const API_HOST = 'api-football-v1.p.rapidapi.com';
const BASE_URL = 'https://api-football-v1.p.rapidapi.com/v3';
const LEAGUE_ID = 288; // South Africa Premier Soccer League
const SEASON = 2024;

// Interface for what we return to the app
export interface RealPlayerPerformance {
    playerId: string; // The API-Football Player ID
    name: string;
    team: string;
    stats: MatchStats;
    points: number;
    fixtureId: number;
}

// 1. Fetch Fixtures for a specific Gameweek (or date range)
export const fetchFixturesForGameweek = async (fromDate: string, toDate: string) => {
    console.log(`[RealStats] Fetching fixtures from ${fromDate} to ${toDate}`);
    const url = `${BASE_URL}/fixtures?league=${LEAGUE_ID}&season=${SEASON}&from=${fromDate}&to=${toDate}`;

    try {
        const response = await fetch(url, {
            method: "GET",
            headers: {
                "x-rapidapi-host": API_HOST,
                "x-rapidapi-key": API_KEY
            }
        });

        const data = await response.json();
        return data.response || [];
    } catch (error) {
        console.error("Error fetching fixtures:", error);
        return [];
    }
};

// 2. Fetch Detailed Stats for a specific Fixture
// This is the "Repurposed" part: leveraging the API's deep stats capability
export const fetchFixturePlayerStats = async (fixtureId: number, homeTeamId: number, awayTeamId: number, goalsHome: number, goalsAway: number): Promise<RealPlayerPerformance[]> => {
    const url = `${BASE_URL}/fixtures/players?fixture=${fixtureId}`;

    try {
        const response = await fetch(url, {
            headers: {
                "x-rapidapi-host": API_HOST,
                "x-rapidapi-key": API_KEY
            }
        });

        const data = await response.json(); // { response: [ { team:..., players: [...] }, { team:..., players: [...] } ] }

        if (!data.response || data.response.length === 0) return [];

        const performances: RealPlayerPerformance[] = [];

        // Iterate through both teams in the fixture
        data.response.forEach((teamData: any) => {
            const teamName = teamData.team.name;
            const currentTeamId = teamData.team.id;

            // Determine Result
            let result: 'WIN' | 'LOSS' | 'DRAW' = 'DRAW';
            if (goalsHome === goalsAway) {
                result = 'DRAW';
            } else if (currentTeamId === homeTeamId) {
                result = goalsHome > goalsAway ? 'WIN' : 'LOSS';
            } else if (currentTeamId === awayTeamId) {
                result = goalsAway > goalsHome ? 'WIN' : 'LOSS';
            }

            teamData.players.forEach((p: any) => {
                const raw = p.statistics[0]; // Stats for this specific game

                // Map API stats to our MatchStats interface
                const cleanStats: MatchStats = {
                    minutesPlayed: raw.games.minutes || 0,
                    goals: raw.goals.total || 0,
                    assists: raw.goals.assists || 0,
                    cleanSheet: false, // Logic below
                    saves: raw.goals.saves || 0,
                    penaltiesSaved: raw.penalty.saved || 0,
                    yellowCards: raw.cards.yellow || 0,
                    redCards: raw.cards.red || 0,
                    ownGoals: 0,
                    goalsConceded: raw.goals.conceded || 0
                };

                // Logic to determine Clean Sheet
                if (cleanStats.minutesPlayed >= 60 && cleanStats.goalsConceded === 0) {
                    cleanStats.cleanSheet = true;
                }

                // Determine Position
                let pos: 'GK' | 'DEF' | 'MID' | 'ATT' = 'MID';
                if (raw.games.position === 'G') pos = 'GK';
                else if (raw.games.position === 'D') pos = 'DEF';
                else if (raw.games.position === 'M') pos = 'MID';
                else if (raw.games.position === 'F') pos = 'ATT';

                // Repurpose the existing Points Calculator
                const pointsResult = calculatePoints(cleanStats, pos);

                performances.push({
                    playerId: String(p.player.id),
                    name: p.player.name,
                    team: teamName,
                    stats: cleanStats,
                    points: pointsResult.total,
                    fixtureId: fixtureId
                });
            });
        });

        return performances;

    } catch (error) {
        console.error(`Error fetching stats for fixture ${fixtureId}:`, error);
        return [];
    }
};

// 3. MASTER FUNCTION: Get All Player Scores for a Date Range
export const getRealGameweekScores = async (fromDate: string, toDate: string) => {
    const fixtures = await fetchFixturesForGameweek(fromDate, toDate);
    console.log(`[RealStats] Found ${fixtures.length} matches. Processing stats...`);

    let allPlayerScores: RealPlayerPerformance[] = [];

    for (const fixture of fixtures) {
        // Only process finished games
        if (['FT', 'AET', 'PEN'].includes(fixture.fixture.status.short)) {
            const stats = await fetchFixturePlayerStats(
                fixture.fixture.id,
                fixture.teams.home.id,
                fixture.teams.away.id,
                fixture.goals.home ?? 0,
                fixture.goals.away ?? 0
            );
            allPlayerScores = [...allPlayerScores, ...stats];
            // Rate limit safety
            await new Promise(r => setTimeout(r, 200));
        }
    }

    console.log(`[RealStats] Calculated scores for ${allPlayerScores.length} players.`);
    return allPlayerScores;
};
