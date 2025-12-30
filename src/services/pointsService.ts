export interface MatchStats {
    minutesPlayed: number;
    goals: number;
    assists: number;
    cleanSheet: boolean;
    saves: number;
    penaltiesSaved: number;
    yellowCards: number;
    redCards: number;
    ownGoals: number;
    goalsConceded: number;
}

export interface PointsBreakdown {
    total: number;
    breakdown: {
        minutes: number;
        goals: number;
        assists: number;
        cleanSheet: number;
        saves: number;
        penaltiesSaved: number;
        cards: number;
        ownGoals: number;
        conceded: number; // usually -1 per 2 goals conceded for DEF/GK
    };
}

export const POINTS_RULES = {
    MINUTES_UP_TO_60: 1,
    MINUTES_60_PLUS: 2,
    GOAL_GK: 6,
    GOAL_DEF: 6,
    GOAL_MID: 5,
    GOAL_ATT: 4,
    ASSIST: 3,
    CLEAN_SHEET_GK_DEF: 4,
    CLEAN_SHEET_MID: 1,
    SAVES_PER_3: 1,
    PENALTY_SAVE: 5,
    YELLOW_CARD: -1,
    RED_CARD: -3,
    OWN_GOAL: -2,
    GOALS_CONCEDED_GK_DEF_PER_2: -1
};

export const calculatePoints = (stats: MatchStats, position: 'GK' | 'DEF' | 'MID' | 'ATT'): PointsBreakdown => {
    let points = 0;
    const breakdown = {
        minutes: 0,
        goals: 0,
        assists: 0,
        cleanSheet: 0,
        saves: 0,
        penaltiesSaved: 0,
        cards: 0,
        ownGoals: 0,
        conceded: 0
    };

    // 1. Playing Time
    if (stats.minutesPlayed > 0) {
        if (stats.minutesPlayed >= 60) {
            breakdown.minutes = POINTS_RULES.MINUTES_60_PLUS;
        } else {
            breakdown.minutes = POINTS_RULES.MINUTES_UP_TO_60;
        }
    }
    points += breakdown.minutes;

    // 2. Attacking Returns (Goals)
    let goalPoints = 0;
    switch (position) {
        case 'GK':
        case 'DEF':
            goalPoints = POINTS_RULES.GOAL_DEF;
            break;
        case 'MID':
            goalPoints = POINTS_RULES.GOAL_MID;
            break;
        case 'ATT':
            goalPoints = POINTS_RULES.GOAL_ATT;
            break;
    }
    breakdown.goals = stats.goals * goalPoints;
    points += breakdown.goals;

    // Assists
    breakdown.assists = stats.assists * POINTS_RULES.ASSIST;
    points += breakdown.assists;

    // 3. Defensive Contributions (Clean Sheets)
    if (stats.cleanSheet && stats.minutesPlayed >= 60) {
        if (position === 'GK' || position === 'DEF') {
            breakdown.cleanSheet = POINTS_RULES.CLEAN_SHEET_GK_DEF;
        } else if (position === 'MID') {
            breakdown.cleanSheet = POINTS_RULES.CLEAN_SHEET_MID;
        }
    }
    points += breakdown.cleanSheet;

    // 4. Goalkeeper Specifics
    if (position === 'GK') {
        // Saves
        breakdown.saves = Math.floor(stats.saves / 3) * POINTS_RULES.SAVES_PER_3;
        points += breakdown.saves;

        // Penalty Saves
        breakdown.penaltiesSaved = stats.penaltiesSaved * POINTS_RULES.PENALTY_SAVE;
        points += breakdown.penaltiesSaved;

        // Goals Conceded (Standard FPL rule: -1 for every 2 goals conceded)
        if (stats.goalsConceded >= 2) {
            breakdown.conceded = Math.floor(stats.goalsConceded / 2) * POINTS_RULES.GOALS_CONCEDED_GK_DEF_PER_2;
            points += breakdown.conceded;
        }
    } else if (position === 'DEF') {
        // Goals Conceded for Defenders
        if (stats.goalsConceded >= 2) {
            breakdown.conceded = Math.floor(stats.goalsConceded / 2) * POINTS_RULES.GOALS_CONCEDED_GK_DEF_PER_2;
            points += breakdown.conceded;
        }
    }

    // 5. Discipline & Errors (Standard FPL Extras - checking if user wants these? They aren't in the prompt but are standard.)
    // User prompt didn't explicitly ask for cards/own goals, but implied "Standard FPL". 
    // I will include them but 0 them out if not in stats, to be complete.
    breakdown.cards = (stats.yellowCards * POINTS_RULES.YELLOW_CARD) + (stats.redCards * POINTS_RULES.RED_CARD);
    points += breakdown.cards;

    breakdown.ownGoals = stats.ownGoals * POINTS_RULES.OWN_GOAL;
    points += breakdown.ownGoals;


    return { total: points, breakdown };
};
