
export interface Fixture {
    id: string;
    homeTeam: string;
    awayTeam: string;
    date: string;
    time: string;
    status: 'Scheduled' | 'Finished';
}

// A mock of the upcoming Gameweek (Matchday 12/13/14 etc)
// Ideally this would cover the full season, but here is the active set for the "Next Opponent" feature.
export const pslFixtures: Fixture[] = [
    { id: 'gw15-1', homeTeam: 'Mamelodi Sundowns', awayTeam: 'Orlando Pirates', date: '2026-01-14', time: '15:30', status: 'Scheduled' },
    { id: 'gw15-2', homeTeam: 'Kaizer Chiefs', awayTeam: 'Stellenbosch FC', date: '2026-01-14', time: '17:30', status: 'Scheduled' },
    { id: 'gw15-3', homeTeam: 'Cape Town City', awayTeam: 'SuperSport United', date: '2026-01-15', time: '19:30', status: 'Scheduled' },
    { id: 'gw15-4', homeTeam: 'AmaZulu', awayTeam: 'Golden Arrows', date: '2026-01-15', time: '15:30', status: 'Scheduled' },
    { id: 'gw15-5', homeTeam: 'TS Galaxy', awayTeam: 'Sekhukhune United', date: '2026-01-16', time: '15:30', status: 'Scheduled' },
    { id: 'gw15-6', homeTeam: 'Chippa United', awayTeam: 'Richards Bay', date: '2026-01-16', time: '19:30', status: 'Scheduled' },
    { id: 'gw15-7', homeTeam: 'Polokwane City', awayTeam: 'Royal AM', date: '2026-01-17', time: '15:30', status: 'Scheduled' },
    { id: 'gw15-8', homeTeam: 'Magesi FC', awayTeam: 'Gallants', date: '2026-01-17', time: '15:30', status: 'Scheduled' }
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
