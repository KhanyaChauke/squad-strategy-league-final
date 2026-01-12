export interface TeamKit {
    teamName: string;
    homeKit: string; // URL to image
    awayKit: string; // URL to image
    thirdKit?: string; // Optional
    goalkeeperKit?: string; // Optional
}

// Placeholder URL or empty string indicates "no jersey"
// Placeholder URL or empty string indicates "no jersey"
export const teamKits: Record<string, TeamKit> = {
    'Mamelodi Sundowns': {
        teamName: 'Mamelodi Sundowns',
        homeKit: '/jerseys/sundowns.jpg',
        awayKit: ''
    },
    'Orlando Pirates': {
        teamName: 'Orlando Pirates',
        homeKit: '/jerseys/orlando pirates.webp',
        awayKit: ''
    },
    'Stellenbosch FC': {
        teamName: 'Stellenbosch FC',
        homeKit: '/jerseys/stellenbosch.png',
        awayKit: ''
    },
    'Sekhukhune United': {
        teamName: 'Sekhukhune United',
        homeKit: '/jerseys/sekhukhune.jpeg',
        awayKit: ''
    },
    'Kaizer Chiefs': {
        teamName: 'Kaizer Chiefs',
        homeKit: '/jerseys/chiefs.jpeg',
        awayKit: ''
    },
    'SuperSport United': {
        teamName: 'SuperSport United',
        homeKit: '', // Image not found in provided list
        awayKit: ''
    },
    'Cape Town City': {
        teamName: 'Cape Town City',
        homeKit: '', // Image not found in provided list
        awayKit: ''
    },
    'TS Galaxy': {
        teamName: 'TS Galaxy',
        homeKit: '/jerseys/Ts galaxy.jpeg',
        awayKit: ''
    },
    'Polokwane City': {
        teamName: 'Polokwane City',
        homeKit: '/jerseys/polokwane Fc.jpeg',
        awayKit: ''
    },
    'Golden Arrows': {
        teamName: 'Golden Arrows',
        homeKit: '/jerseys/golden arrows.jpeg',
        awayKit: ''
    },
    'AmaZulu FC': {
        teamName: 'AmaZulu', // Match standard usage often 'AmaZulu' without FC in some contexts, but keys here are what matters
        homeKit: '/jerseys/Amzulu2.jpeg',
        awayKit: ''
    },
    'Chippa United': {
        teamName: 'Chippa United',
        homeKit: '/jerseys/chippa united.jpeg',
        awayKit: ''
    },
    'Royal AM': {
        teamName: 'Royal AM',
        homeKit: '/jerseys/siwelele fc.jpeg', // Best guess based on user files
        awayKit: ''
    },
    'Richards Bay': {
        teamName: 'Richards Bay',
        homeKit: '/jerseys/richards.png',
        awayKit: ''
    },
    'Marumo Gallants': {
        teamName: 'Marumo Gallants',
        homeKit: '/jerseys/Marumo.jpeg',
        awayKit: ''
    },
    'Magesi FC': {
        teamName: 'Magesi FC',
        homeKit: '', // Image not found in provided list
        awayKit: ''
    }
};

export const getTeamKit = (teamName: string): TeamKit | undefined => {
    // Normalization helper
    const normalized = teamName.trim();
    return teamKits[normalized] || Object.values(teamKits).find(k => k.teamName.toLowerCase() === normalized.toLowerCase());
};
