import React from 'react';
import { Badge } from '@/components/ui/badge';
import { Shield, Flag, Trophy } from 'lucide-react';

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
  team: string;
  nationality: string;
  rating: number;
  pace: number;
  shooting: number;
  passing: number;
  defending: number;
  dribbling: number;
  physical: number;
  price: number;
}

interface FifaCardProps {
  player?: Player;
  isEmpty?: boolean;
  size?: 'small' | 'medium' | 'large';
  onEmptyClick?: () => void;
  onPlayerClick?: (player: Player) => void;
  showRemoveOverlay?: boolean;
}

const getPlayerImage = (teamName: string) => {
  const team = teamName.toLowerCase();
  if (team.includes('sundowns')) return sundownsJersey;
  if (team.includes('pirates')) return piratesJersey;
  if (team.includes('chiefs')) return chiefsJersey;
  if (team.includes('cape town city')) return capeTownCityJersey;
  if (team.includes('supersport')) return supersportJersey;
  return defaultJersey;
};

// Gold card colors
// TOTS (Blue/Cyan) Card Style based on user image
const CARD_BG = 'bg-gradient-to-br from-[#0f172a] via-[#1e3a8a] to-[#172554]'; // Deep Navy to Royal Blue
const CARD_BORDER = 'border-[#22d3ee] shadow-[0_0_15px_rgba(34,211,238,0.5)]'; // Cyan glow
const TEXT_GOLD = 'text-[#facc15]'; // Yellow/Gold for stats
const TEXT_CYAN = 'text-[#22d3ee]'; // Cyan accents

const getSizeClasses = (size: 'small' | 'medium' | 'large') => {
  switch (size) {
    case 'small':
      return {
        container: 'w-24 h-36 md:w-28 md:h-40', // Slightly smaller for grid
        rating: 'text-lg md:text-xl',
        position: 'text-[10px] md:text-xs',
        name: 'text-[10px] md:text-xs',
        stats: 'text-[8px] md:text-[9px]',
        image: 'w-12 h-12 md:w-16 md:h-16',
        iconSize: 10
      };
    case 'medium': // Used in Grid
      return {
        container: 'w-full aspect-[2/3] max-w-[180px]', // Fluid width
        rating: 'text-2xl',
        position: 'text-sm',
        name: 'text-sm md:text-base',
        stats: 'text-[10px] md:text-xs',
        image: 'w-20 h-20 md:w-24 md:h-24',
        iconSize: 14
      };
    case 'large':
      return {
        container: 'w-64 h-96',
        rating: 'text-5xl',
        position: 'text-xl',
        name: 'text-2xl',
        stats: 'text-base',
        image: 'w-40 h-40',
        iconSize: 24
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
        className={`${sizeClasses.container} bg-gray-100 rounded-t-2xl rounded-b-xl border-2 border-dashed border-gray-300 flex flex-col items-center justify-center cursor-pointer hover:bg-gray-200 transition-all duration-200 group relative overflow-hidden`}
        onClick={onEmptyClick}
      >
        <div className="text-gray-400 group-hover:text-gray-600">
          <svg className="w-12 h-12 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
          </svg>
        </div>
        <span className="font-bold text-gray-400 group-hover:text-gray-600">
          ADD PLAYER
        </span>
      </div>
    );
  }

  if (!player) return null;

  return (
    <div
      className={`${sizeClasses.container} relative transition-transform duration-200 hover:scale-105 cursor-pointer group font-oswald`}
      style={{ fontFamily: "'Oswald', sans-serif" }}
      onClick={() => onPlayerClick?.(player)}
    >
      {/* 
        Shape Container: 
        Using clip-path to create the specific FIFA shield shape.
      */}
      <div
        className={`absolute inset-0 ${CARD_BG} z-0`}
        style={{
          clipPath: 'polygon(0% 0%, 100% 0%, 100% 85%, 50% 100%, 0% 85%)', // Classic Shield Shape
        }}
      >
        {/* Border Glow Simulation */}
        <div className="absolute inset-0 bg-[#22d3ee] opacity-30 blur-md"></div>
        <div className="absolute inset-[2px] bg-gradient-to-b from-[#0f172a] to-[#1e3a8a] z-10"
          style={{ clipPath: 'polygon(0% 0%, 100% 0%, 100% 85%, 50% 100%, 0% 85%)' }}>

          {/* Background Texture/Shards */}
          <div className="absolute inset-0 opacity-40 bg-[linear-gradient(45deg,transparent_25%,rgba(68,255,255,0.1)_50%,transparent_75%,transparent_100%)] bg-[length:20px_20px]"></div>
          <div className="absolute top-0 right-0 w-full h-full bg-[radial-gradient(circle_at_50%_0%,rgba(34,211,238,0.2)_0%,transparent_70%)]"></div>
        </div>
      </div>

      {/* Content Layer */}
      <div className="relative z-20 h-full flex flex-col pointer-events-none">

        {/* Top Section */}
        <div className="flex flex-row h-[55%] relative">

          {/* Left Pillar: Rating, Pos, Country, Club */}
          <div className="w-[25%] flex flex-col items-center pt-6 pl-2 space-y-1">
            <span className={`font-bold ${TEXT_GOLD} text-3xl md:text-4xl leading-none`}>
              {player.rating}
            </span>
            <span className={`${TEXT_GOLD} text-xs md:text-sm uppercase font-medium leading-none`}>
              {player.position}
            </span>

            <div className="w-full flex justify-center py-1">
              <div className="w-6 h-[1px] bg-cyan-500/30"></div>
            </div>

            {/* Country */}
            <div className="w-6 h-4 relative overflow-hidden rounded-[2px] shadow-sm" title={player.nationality}>
              <Flag size={sizeClasses.iconSize + 8} className="absolute inset-0 w-full h-full object-cover" />
            </div>

            {/* Club */}
            <div className="pt-1">
              <Shield size={sizeClasses.iconSize + 6} className="text-white fill-white/10" />
            </div>
          </div>

          {/* Player Image Area */}
          <div className="w-[75%] h-full flex items-end justify-center pr-2 pb-1">
            <img
              src={getPlayerImage(player.team)}
              alt={player.name}
              className="w-full h-[90%] object-contain drop-shadow-[0_0_10px_rgba(0,0,0,0.5)] transform translate-y-2"
            />
          </div>

        </div>

        {/* Bottom Section: Name & Stats */}
        <div className="h-[45%] flex flex-col relative z-20">

          {/* Divider */}
          <div className="w-[80%] mx-auto h-[1px] bg-gradient-to-r from-transparent via-[#22d3ee] to-transparent opacity-50 mb-1"></div>

          {/* Name */}
          <div className="flex justify-center items-center pb-1">
            <span className={`font-bold uppercase tracking-wider ${TEXT_GOLD} ${sizeClasses.name} truncate max-w-[90%] text-center drop-shadow-md`}>
              {player.name}
            </span>
          </div>

          {/* Stats Grid */}
          <div className={`grid grid-cols-2 gap-x-2 gap-y-0.5 px-4 ${sizeClasses.stats}`}>
            <div className="flex items-center space-x-1">
              <span className={`font-bold ${TEXT_GOLD}`}>{player.pace}</span>
              <span className={`font-light ${TEXT_CYAN}`}>PAC</span>
            </div>
            <div className="flex items-center space-x-1">
              <span className={`font-bold ${TEXT_GOLD}`}>{player.dribbling}</span>
              <span className={`font-light ${TEXT_CYAN}`}>DRI</span>
            </div>
            <div className="flex items-center space-x-1">
              <span className={`font-bold ${TEXT_GOLD}`}>{player.shooting}</span>
              <span className={`font-light ${TEXT_CYAN}`}>SHO</span>
            </div>
            <div className="flex items-center space-x-1">
              <span className={`font-bold ${TEXT_GOLD}`}>{player.defending}</span>
              <span className={`font-light ${TEXT_CYAN}`}>DEF</span>
            </div>
            <div className="flex items-center space-x-1">
              <span className={`font-bold ${TEXT_GOLD}`}>{player.passing}</span>
              <span className={`font-light ${TEXT_CYAN}`}>PAS</span>
            </div>
            <div className="flex items-center space-x-1">
              <span className={`font-bold ${TEXT_GOLD}`}>{player.physical}</span>
              <span className={`font-light ${TEXT_CYAN}`}>PHY</span>
            </div>
          </div>
        </div>

        {/* Remove Overlay */}
        {showRemoveOverlay && (
          <div
            className="absolute inset-0 bg-red-900/80 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200 z-30"
            style={{ clipPath: 'polygon(0% 0%, 100% 0%, 100% 85%, 50% 100%, 0% 85%)' }}
          >
            <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </div>
        )}
      </div>
    </div>
  );
};

// Extended FIFA card for detailed view - Reusing the same logic but larger
export const FifaCardDetailed: React.FC<{ player: Player; onClick?: () => void }> = ({
  player,
  onClick
}) => {
  // Reuse the main component with 'large' size for consistency,
  // but wrap it to handle the specific detailed view needs if any.
  // For now, we'll just render the FifaCard in large mode.
  return (
    <div onClick={onClick}>
      <FifaCard player={player} size="large" />

      {/* Price Tag Overlay for Detailed View */}
      <div className="mt-4 text-center">
        <Badge variant="secondary" className="text-lg px-4 py-1 bg-black text-white border border-gold-500">
          {new Intl.NumberFormat('en-ZA', {
            style: 'currency',
            currency: 'ZAR',
            minimumFractionDigits: 0,
            maximumFractionDigits: 0,
          }).format(player.price)}
        </Badge>
      </div>
    </div>
  );
};