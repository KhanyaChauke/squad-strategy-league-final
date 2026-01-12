
export interface Fixture {
    id: string;
    homeTeam: string;
    awayTeam: string;
    date: string; // YYYY-MM-DD
    time: string;
    venue?: string;
    status: 'Scheduled' | 'Finished';
}

// Fixtures based on provided schedule (Jan 2026)
export const pslFixtures: Fixture[] = [
    // 19 Jan
    { id: 'jan19-1', homeTeam: 'Mamelodi Sundowns', awayTeam: 'Orbit College FC', date: '2026-01-19', time: '19:30', venue: 'Loftus Versfeld Stadium, Pretoria', status: 'Scheduled' },

    // 20 Jan
    { id: 'jan20-1', homeTeam: 'Kaizer Chiefs', awayTeam: 'Golden Arrows', date: '2026-01-20', time: '19:30', venue: 'FNB Stadium, Johannesburg', status: 'Scheduled' },
    { id: 'jan20-2', homeTeam: 'Sekhukhune United', awayTeam: 'Stellenbosch FC', date: '2026-01-20', time: '19:30', venue: 'Peter Mokaba Stadium, Polokwane', status: 'Scheduled' },

    // 21 Jan
    { id: 'jan21-1', homeTeam: 'TS Galaxy', awayTeam: 'Marumo Gallants', date: '2026-01-21', time: '19:30', venue: 'Mbombela Stadium, Nelspruit', status: 'Scheduled' },

    // 23 Jan
    { id: 'jan23-1', homeTeam: 'Richards Bay', awayTeam: 'Royal AM', date: '2026-01-23', time: '19:30', venue: 'Richards Bay Stadium, Richards Bay', status: 'Scheduled' }, // "Siwelele" usually refers to Bloem Celtic/Royal AM culture

    // 24 Jan
    { id: 'jan24-1', homeTeam: 'Orbit College FC', awayTeam: 'Chippa United', date: '2026-01-24', time: '15:30', venue: 'Olympia Park, Rustenburg', status: 'Scheduled' },
    { id: 'jan24-2', homeTeam: 'Sekhukhune United', awayTeam: 'Orlando Pirates', date: '2026-01-24', time: '15:30', venue: 'Peter Mokaba Stadium, Polokwane', status: 'Scheduled' },

    // 25 Jan (Listed under 24 Jan block header often in schedules but date is 25th)
    { id: 'jan25-1', homeTeam: 'AmaZulu FC', awayTeam: 'TS Galaxy', date: '2026-01-25', time: '15:30', venue: 'Moses Mabhida Stadium, Durban', status: 'Scheduled' }
];

export const getNextOpponent = (teamName: string): string | undefined => {
    if (!teamName) return undefined;

    const normalizedTeam = teamName.toLowerCase();

    // Find the first scheduled game involving this team
    const fixture = pslFixtures.find(f =>
        f.status === 'Scheduled' &&
        (f.homeTeam.toLowerCase().includes(normalizedTeam) || f.awayTeam.toLowerCase().includes(normalizedTeam))
    );

    if (fixture) {
        const isHome = fixture.homeTeam.toLowerCase().includes(normalizedTeam);
        const opponent = isHome ? fixture.awayTeam : fixture.homeTeam;

        // Return 3-letter code
        return getTeamAbbreviation(opponent);
    }

    return undefined;
};

const getTeamAbbreviation = (teamName: string): string => {
    const t = teamName.toLowerCase();
    if (t.includes('sundowns')) return 'MAM'; // Mamelodi
    if (t.includes('pirates')) return 'ORL';
    if (t.includes('chiefs')) return 'KAI';
    if (t.includes('city')) return 'CTC'; // Cape Town City
    if (t.includes('stellenbosch')) return 'STEL';
    if (t.includes('supersport')) return 'SSU';
    if (t.includes('amazulu')) return 'AMA';
    if (t.includes('arrows')) return 'GOL'; // Golden Arrows
    if (t.includes('galaxy')) return 'TSG';
    if (t.includes('sekhukhune')) return 'SEK';
    if (t.includes('chippa')) return 'CHI';
    if (t.includes('richards')) return 'RIC';
    if (t.includes('polokwane')) return 'POL';
    if (t.includes('royal')) return 'ROY';
    if (t.includes('magesi')) return 'MAG';
    if (t.includes('gallants')) return 'GAL';

    return teamName.substring(0, 3).toUpperCase();
};
