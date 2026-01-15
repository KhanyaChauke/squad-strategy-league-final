export interface TeamKit {
    teamName: string;
    homeKit: string; // URL to image
    awayKit: string; // URL to image
    logo?: string; // URL to logo
    thirdKit?: string; // Optional
    goalkeeperKit?: string; // Optional
}

// Placeholder URL or empty string indicates "no jersey"
export const teamKits: Record<string, TeamKit> = {
    'Mamelodi Sundowns': {
        teamName: 'Mamelodi Sundowns',
        homeKit: '/jerseys/sundowns.jpg',
        awayKit: '',
        logo: '/logos/Mamelodi Sundowns logo.png'
    },
    'Orlando Pirates': {
        teamName: 'Orlando Pirates',
        homeKit: '/jerseys/orlando pirates.webp',
        awayKit: '',
        logo: '/logos/Orland Pirates logo.png'
    },
    'Stellenbosch FC': {
        teamName: 'Stellenbosch FC',
        homeKit: '/jerseys/stellenbosch.png',
        awayKit: '',
        logo: '/logos/Stellenbosch FC logo.png'
    },
    'Sekhukhune United': {
        teamName: 'Sekhukhune United',
        homeKit: '/jerseys/sekhukhune.jpeg',
        awayKit: '',
        logo: '/logos/Sekhukhune United FC logo.png'
    },
    'Kaizer Chiefs': {
        teamName: 'Kaizer Chiefs',
        homeKit: '/jerseys/chiefs.jpeg',
        awayKit: '',
        logo: '/logos/Kaizer Chiefs logo.png'
    },
    'SuperSport United': {
        teamName: 'SuperSport United',
        homeKit: '/jerseys/supersport.png',
        awayKit: '',
        logo: '/logos/SuperSport United logo.png' // Assuming standard naming convention
    },
    'Cape Town City': {
        teamName: 'Cape Town City',
        homeKit: '/jerseys/capetowncity.png',
        awayKit: '',
        logo: '/logos/Cape Town City logo.png' // Assuming standard naming convention
    },
    'TS Galaxy': {
        teamName: 'TS Galaxy',
        homeKit: '/jerseys/Ts galaxy.jpeg',
        awayKit: '',
        logo: '/logos/TS galaxy logo.png'
    },
    'Polokwane City': {
        teamName: 'Polokwane City',
        homeKit: '/jerseys/polokwane Fc.jpeg',
        awayKit: '',
        logo: '/logos/Polokwane City logo.png'
    },
    'Golden Arrows': {
        teamName: 'Golden Arrows',
        homeKit: '/jerseys/golden arrows.jpeg',
        awayKit: '',
        logo: '/logos/Golden Arrows logo.png'
    },
    'AmaZulu FC': {
        teamName: 'AmaZulu',
        homeKit: '/jerseys/Amzulu2.jpeg',
        awayKit: '',
        logo: '/logos/AmaZulu FC logo.png'
    },
    'AmaZulu': {
        teamName: 'AmaZulu',
        homeKit: '/jerseys/Amzulu2.jpeg',
        awayKit: '',
        logo: '/logos/AmaZulu FC logo.png'
    },
    'Chippa United': {
        teamName: 'Chippa United',
        homeKit: '/jerseys/chippa united.jpeg',
        awayKit: '',
        logo: '/logos/Chippa United logo.png'
    },
    'Royal AM': {
        teamName: 'Royal AM',
        homeKit: '/jerseys/siwelele fc.jpeg',
        awayKit: '',
        logo: '/logos/Siwelele FC logo.png'
    },
    'Richards Bay': {
        teamName: 'Richards Bay',
        homeKit: '/jerseys/richards.png',
        awayKit: '',
        logo: '/logos/Richards Bay logo.png'
    },
    'Marumo Gallants': {
        teamName: 'Marumo Gallants',
        homeKit: '/jerseys/Marumo.jpeg',
        awayKit: '',
        logo: '/logos/Marumo Gallants logo.png'
    },
    'Magesi FC': {
        teamName: 'Magesi FC',
        homeKit: '/jerseys/Orbit college.jpeg',
        awayKit: '',
        logo: '/logos/Magesi FC logo.png'
    },
    'Durban City': {
        teamName: 'Durban City',
        homeKit: '', // No jersey yet
        awayKit: '',
        logo: '/logos/Durban City FC logo.png'
    },
    'Orbit College FC': {
        teamName: 'Orbit College FC',
        homeKit: '', // No jersey yet
        awayKit: '',
        logo: '/logos/Orbit College logo.png'
    },
    'Siwelele': {
        teamName: 'Siwelele', // Assuming Royal AM alias or separate
        homeKit: '/jerseys/siwelele fc.jpeg',
        awayKit: '',
        logo: '/logos/Siwelele FC logo.png'
    }
};

export const getTeamKit = (teamName: string): TeamKit | undefined => {
    // Normalization helper
    const normalized = teamName.trim();
    return teamKits[normalized] || Object.values(teamKits).find(k => k.teamName.toLowerCase() === normalized.toLowerCase());
};
