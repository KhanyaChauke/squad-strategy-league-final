import React from 'react';
import { Badge } from '@/components/ui/badge';

// Import jersey images for player representation
import sundownsJersey from '@/assets/jerseys/sundowns-jersey.png';
import piratesJersey from '@/assets/jerseys/pirates-jersey.png';
import chiefsJersey from '@/assets/jerseys/chiefs-jersey.png';
import capeTownCityJersey from '@/assets/jerseys/cape-town-city-jersey.png';
import supersportJersey from '@/assets/jerseys/supersport-jersey.png';
import defaultJersey from '@/assets/jerseys/default-jersey.png';

interface Player {
  id: string;
  name: string;
  position: 'GK' | 'DEF' | 'MID' | 'ATT';
  club: string;
  nationality: string;
  rating: number;
  pace: number;
  shooting: number;
  passing: number;
  defending: number;
  dribbling: number;
  physical: number;
  cost: number;
}

interface FifaCardProps {
  player?: Player;
  isEmpty?: boolean;
  size?: 'small' | 'medium' | 'large';
  onEmptyClick?: () => void;
  onPlayerClick?: (player: Player) => void;
  showRemoveOverlay?: boolean;
}

const getPlayerImage = (clubName: string) => {
  const club = clubName.toLowerCase();
  if (club.includes('sundowns')) return sundownsJersey;
  if (club.includes('pirates')) return piratesJersey;
  if (club.includes('chiefs')) return chiefsJersey;
  if (club.includes('cape town city')) return capeTownCityJersey;
  if (club.includes('supersport')) return supersportJersey;
  return defaultJersey;
};

const getCardColor = (rating: number) => {
  if (rating >= 90) return 'from-yellow-400 to-yellow-600'; // Icon
  if (rating >= 85) return 'from-purple-400 to-purple-600'; // Hero/TOTW
  if (rating >= 80) return 'from-blue-400 to-blue-600'; // Rare
  if (rating >= 75) return 'from-green-400 to-green-600'; // Non-rare
  return 'from-gray-400 to-gray-600'; // Bronze
};

const getPositionColor = (position: string) => {
  switch (position) {
    case 'GK': return 'bg-yellow-500 text-black';
    case 'DEF': return 'bg-blue-500 text-white';
    case 'MID': return 'bg-green-500 text-white';
    case 'ATT': return 'bg-red-500 text-white';
    default: return 'bg-gray-500 text-white';
  }
};

const getSizeClasses = (size: 'small' | 'medium' | 'large') => {
  switch (size) {
    case 'small':
      return {
        container: 'w-24 h-32',
        rating: 'text-lg',
        position: 'text-xs',
        name: 'text-xs',
        stats: 'text-xs',
        image: 'w-12 h-16'
      };
    case 'medium':
      return {
        container: 'w-32 h-44',
        rating: 'text-xl',
        position: 'text-sm',
        name: 'text-sm',
        stats: 'text-xs',
        image: 'w-16 h-20'
      };
    case 'large':
      return {
        container: 'w-48 h-64',
        rating: 'text-3xl',
        position: 'text-base',
        name: 'text-base',
        stats: 'text-sm',
        image: 'w-24 h-32'
      };
  }
};

export const FifaCard: React.FC<FifaCardProps> = ({ 
  player, 
  isEmpty = false, 
  size = 'medium',
  onEmptyClick,
  onPlayerClick,
  showRemoveOverlay = false
}) => {
  const sizeClasses = getSizeClasses(size);

  if (isEmpty) {
    return (
      <div
        className={`${sizeClasses.container} bg-gradient-to-br from-gray-200 to-gray-400 rounded-lg border-2 border-dashed border-gray-300 flex flex-col items-center justify-center cursor-pointer hover:from-gray-300 hover:to-gray-500 transition-all duration-200 group`}
        onClick={onEmptyClick}
      >
        <div className="text-gray-600 group-hover:text-gray-800">
          <svg className="w-8 h-8 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
          </svg>
        </div>
        <span className={`${sizeClasses.name} font-bold text-gray-600 group-hover:text-gray-800`}>
          ADD
        </span>
      </div>
    );
  }

  if (!player) return null;

  const cardColor = getCardColor(player.rating);
  const positionColor = getPositionColor(player.position);

  return (
    <div
      className={`${sizeClasses.container} bg-gradient-to-br ${cardColor} rounded-lg shadow-lg border-2 border-white relative overflow-hidden cursor-pointer transform hover:scale-105 transition-transform duration-200 group`}
      onClick={() => onPlayerClick?.(player)}
    >
      {/* Card Background Pattern */}
      <div className="absolute inset-0 opacity-10">
        <svg className="w-full h-full" viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
          <pattern id="hexagons" x="0" y="0" width="20" height="20" patternUnits="userSpaceOnUse">
            <polygon points="10,2 18,7 18,13 10,18 2,13 2,7" fill="white" stroke="white" strokeWidth="0.5"/>
          </pattern>
          <rect width="100" height="100" fill="url(#hexagons)" />
        </svg>
      </div>

      {/* Remove Overlay */}
      {showRemoveOverlay && (
        <div className="absolute inset-0 bg-red-500/80 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200 z-20">
          <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </div>
      )}

      {/* Rating */}
      <div className="absolute top-2 left-2 z-10">
        <div className={`${sizeClasses.rating} font-black text-white drop-shadow-lg`}>
          {player.rating}
        </div>
      </div>

      {/* Position */}
      <div className="absolute top-2 right-2 z-10">
        <Badge className={`${positionColor} ${sizeClasses.position} px-1 py-0 font-bold`}>
          {player.position}
        </Badge>
      </div>

      {/* Player Image */}
      <div className="flex justify-center items-center mt-6 mb-2">
        <div className={`${sizeClasses.image} relative`}>
          <img 
            src={getPlayerImage(player.club)} 
            alt={player.name}
            className="w-full h-full object-contain drop-shadow-lg"
          />
        </div>
      </div>

      {/* Player Name */}
      <div className="absolute bottom-8 left-0 right-0 px-2 z-10">
        <div className={`${sizeClasses.name} font-bold text-white text-center truncate drop-shadow-lg`}>
          {player.name.toUpperCase()}
        </div>
      </div>

      {/* Stats (only for medium and large sizes) */}
      {(size === 'medium' || size === 'large') && (
        <div className="absolute bottom-1 left-0 right-0 px-1 z-10">
          <div className={`${sizeClasses.stats} text-white grid grid-cols-3 gap-1 text-center`}>
            <div>
              <div className="font-bold">{player.pace}</div>
              <div className="opacity-80">PAC</div>
            </div>
            <div>
              <div className="font-bold">{player.shooting}</div>
              <div className="opacity-80">SHO</div>
            </div>
            <div>
              <div className="font-bold">{player.passing}</div>
              <div className="opacity-80">PAS</div>
            </div>
          </div>
        </div>
      )}

      {/* Club Badge (small indicator) */}
      <div className="absolute bottom-2 right-2 w-4 h-4 bg-white/20 rounded-full"></div>
    </div>
  );
};

// Extended FIFA card for detailed view
export const FifaCardDetailed: React.FC<{ player: Player; onClick?: () => void }> = ({ 
  player, 
  onClick 
}) => {
  const cardColor = getCardColor(player.rating);
  const positionColor = getPositionColor(player.position);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-ZA', {
      style: 'currency',
      currency: 'ZAR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  return (
    <div
      className={`w-64 h-80 bg-gradient-to-br ${cardColor} rounded-xl shadow-2xl border-4 border-white relative overflow-hidden cursor-pointer transform hover:scale-105 transition-transform duration-200`}
      onClick={onClick}
    >
      {/* Card Background Pattern */}
      <div className="absolute inset-0 opacity-10">
        <svg className="w-full h-full" viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
          <pattern id="hexagons-detailed" x="0" y="0" width="15" height="15" patternUnits="userSpaceOnUse">
            <polygon points="7.5,1.5 13.5,5.25 13.5,9.75 7.5,13.5 1.5,9.75 1.5,5.25" fill="white" stroke="white" strokeWidth="0.3"/>
          </pattern>
          <rect width="100" height="100" fill="url(#hexagons-detailed)" />
        </svg>
      </div>

      {/* Rating */}
      <div className="absolute top-4 left-4 z-10">
        <div className="text-4xl font-black text-white drop-shadow-lg">
          {player.rating}
        </div>
      </div>

      {/* Position */}
      <div className="absolute top-4 right-4 z-10">
        <Badge className={`${positionColor} text-lg px-2 py-1 font-bold`}>
          {player.position}
        </Badge>
      </div>

      {/* Player Image */}
      <div className="flex justify-center items-center mt-16 mb-4">
        <div className="w-32 h-40 relative">
          <img 
            src={getPlayerImage(player.club)} 
            alt={player.name}
            className="w-full h-full object-contain drop-shadow-2xl"
          />
        </div>
      </div>

      {/* Player Name */}
      <div className="absolute bottom-20 left-0 right-0 px-4 z-10">
        <div className="text-lg font-bold text-white text-center drop-shadow-lg">
          {player.name.toUpperCase()}
        </div>
        <div className="text-sm text-white/90 text-center drop-shadow-lg">
          {player.club}
        </div>
      </div>

      {/* Stats */}
      <div className="absolute bottom-4 left-0 right-0 px-2 z-10">
        <div className="text-sm text-white grid grid-cols-3 gap-1 text-center">
          <div>
            <div className="text-lg font-bold">{player.pace}</div>
            <div className="opacity-90">PAC</div>
          </div>
          <div>
            <div className="text-lg font-bold">{player.shooting}</div>
            <div className="opacity-90">SHO</div>
          </div>
          <div>
            <div className="text-lg font-bold">{player.passing}</div>
            <div className="opacity-90">PAS</div>
          </div>
        </div>
        <div className="text-sm text-white grid grid-cols-3 gap-1 text-center mt-1">
          <div>
            <div className="text-lg font-bold">{player.dribbling}</div>
            <div className="opacity-90">DRI</div>
          </div>
          <div>
            <div className="text-lg font-bold">{player.defending}</div>
            <div className="opacity-90">DEF</div>
          </div>
          <div>
            <div className="text-lg font-bold">{player.physical}</div>
            <div className="opacity-90">PHY</div>
          </div>
        </div>
      </div>

      {/* Cost indicator */}
      <div className="absolute top-16 left-4 z-10">
        <div className="text-xs font-bold text-white/90 bg-black/30 rounded px-2 py-1">
          {formatCurrency(player.cost)}
        </div>
      </div>
    </div>
  );
};