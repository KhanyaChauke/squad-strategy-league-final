interface Player {
  id: string;
  name: string;
  position: 'GK' | 'DEF' | 'MID' | 'ATT';
  club: string;
  rating: number;
  pace: number;
  shooting: number;
  passing: number;
  defending: number;
  dribbling: number;
  physical: number;
  cost: number;
  imageUrl?: string;
}

export const playersDatabase: Player[] = [
  // Goalkeepers
  {
    id: 'gk1',
    name: 'Ronwen Williams',
    position: 'GK',
    club: 'Mamelodi Sundowns',
    rating: 87,
    pace: 45,
    shooting: 15,
    passing: 78,
    defending: 42,
    dribbling: 35,
    physical: 88,
    cost: 180000000
  },
  {
    id: 'gk2',
    name: 'Itumeleng Khune',
    position: 'GK',
    club: 'Kaizer Chiefs',
    rating: 82,
    pace: 42,
    shooting: 12,
    passing: 75,
    defending: 40,
    dribbling: 32,
    physical: 85,
    cost: 150000000
  },
  {
    id: 'gk3',
    name: 'Veli Mothwa',
    position: 'GK',
    club: 'AmaZulu',
    rating: 79,
    pace: 48,
    shooting: 14,
    passing: 72,
    defending: 38,
    dribbling: 30,
    physical: 82,
    cost: 120000000
  },

  // Defenders
  {
    id: 'def1',
    name: 'Rushine De Reuck',
    position: 'DEF',
    club: 'Mamelodi Sundowns',
    rating: 84,
    pace: 75,
    shooting: 28,
    passing: 82,
    defending: 89,
    dribbling: 65,
    physical: 88,
    cost: 200000000
  },
  {
    id: 'def2',
    name: 'Grant Kekana',
    position: 'DEF',
    club: 'Mamelodi Sundowns',
    rating: 82,
    pace: 68,
    shooting: 32,
    passing: 85,
    defending: 87,
    dribbling: 62,
    physical: 84,
    cost: 190000000
  },
  {
    id: 'def3',
    name: 'Innocent Maela',
    position: 'DEF',
    club: 'Orlando Pirates',
    rating: 81,
    pace: 78,
    shooting: 35,
    passing: 79,
    defending: 85,
    dribbling: 68,
    physical: 82,
    cost: 170000000
  },
  {
    id: 'def4',
    name: 'Nkosinathi Sibisi',
    position: 'DEF',
    club: 'Orlando Pirates',
    rating: 80,
    pace: 72,
    shooting: 25,
    passing: 78,
    defending: 86,
    dribbling: 58,
    physical: 85,
    cost: 160000000
  },
  {
    id: 'def5',
    name: 'Siyanda Xulu',
    position: 'DEF',
    club: 'AmaZulu',
    rating: 78,
    pace: 65,
    shooting: 22,
    passing: 76,
    defending: 84,
    dribbling: 55,
    physical: 83,
    cost: 140000000
  },

  // Midfielders
  {
    id: 'mid1',
    name: 'Themba Zwane',
    position: 'MID',
    club: 'Mamelodi Sundowns',
    rating: 88,
    pace: 82,
    shooting: 78,
    passing: 89,
    defending: 65,
    dribbling: 91,
    physical: 75,
    cost: 250000000
  },
  {
    id: 'mid2',
    name: 'Teboho Mokoena',
    position: 'MID',
    club: 'Mamelodi Sundowns',
    rating: 85,
    pace: 78,
    shooting: 82,
    passing: 87,
    defending: 79,
    dribbling: 84,
    physical: 81,
    cost: 220000000
  },
  {
    id: 'mid3',
    name: 'Keagan Dolly',
    position: 'MID',
    club: 'Kaizer Chiefs',
    rating: 83,
    pace: 75,
    shooting: 79,
    passing: 85,
    defending: 58,
    dribbling: 88,
    physical: 72,
    cost: 200000000
  },
  {
    id: 'mid4',
    name: 'Goodman Mosele',
    position: 'MID',
    club: 'Orlando Pirates',
    rating: 79,
    pace: 76,
    shooting: 68,
    passing: 82,
    defending: 74,
    dribbling: 78,
    physical: 76,
    cost: 160000000
  },
  {
    id: 'mid5',
    name: 'Monnapule Saleng',
    position: 'MID',
    club: 'Orlando Pirates',
    rating: 81,
    pace: 88,
    shooting: 75,
    passing: 78,
    defending: 45,
    dribbling: 85,
    physical: 68,
    cost: 180000000
  },

  // Attackers
  {
    id: 'att1',
    name: 'Peter Shalulile',
    position: 'ATT',
    club: 'Mamelodi Sundowns',
    rating: 87,
    pace: 82,
    shooting: 91,
    passing: 78,
    defending: 35,
    dribbling: 85,
    physical: 84,
    cost: 280000000
  },
  {
    id: 'att2',
    name: 'Evidence Makgopa',
    position: 'ATT',
    club: 'Orlando Pirates',
    rating: 82,
    pace: 85,
    shooting: 86,
    passing: 72,
    defending: 32,
    dribbling: 81,
    physical: 79,
    cost: 210000000
  },
  {
    id: 'att3',
    name: 'Ranga Chivaviro',
    position: 'ATT',
    club: 'Kaizer Chiefs',
    rating: 78,
    pace: 78,
    shooting: 82,
    passing: 68,
    defending: 28,
    dribbling: 75,
    physical: 81,
    cost: 170000000
  },
  {
    id: 'att4',
    name: 'Khanyisa Mayo',
    position: 'ATT',
    club: 'Cape Town City',
    rating: 80,
    pace: 84,
    shooting: 84,
    passing: 70,
    defending: 30,
    dribbling: 79,
    physical: 76,
    cost: 190000000
  },
  {
    id: 'att5',
    name: 'Iqraam Rayners',
    position: 'ATT',
    club: 'Stellenbosch FC',
    rating: 79,
    pace: 86,
    shooting: 81,
    passing: 65,
    defending: 25,
    dribbling: 77,
    physical: 73,
    cost: 160000000
  }
];

export const getPlayersByPosition = (position?: string) => {
  if (!position) return playersDatabase;
  return playersDatabase.filter(player => player.position === position);
};

export const getPlayerById = (id: string) => {
  return playersDatabase.find(player => player.id === id);
};

export const searchPlayers = (query: string) => {
  const lowercaseQuery = query.toLowerCase();
  return playersDatabase.filter(player => 
    player.name.toLowerCase().includes(lowercaseQuery) ||
    player.club.toLowerCase().includes(lowercaseQuery) ||
    player.position.toLowerCase().includes(lowercaseQuery)
  );
};
