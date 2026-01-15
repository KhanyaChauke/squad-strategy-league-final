import React from 'react';
import { Badge } from '@/components/ui/badge';
import { Shield, Flag } from 'lucide-react';
import { getTeamKit } from '@/data/teamKits';

// Import jersey images for player representation
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
  size?: 'small' | 'medium' | 'large' | 'responsive';
  onEmptyClick?: () => void;
  onPlayerClick?: (player: Player) => void;
  showRemoveOverlay?: boolean;
  points?: number;
  opponent?: string;
}

const getSurname = (name: string) => {
  if (!name) return "";
  const parts = name.trim().split(/\s+/);
  return parts[parts.length - 1];
};

const getPlayerImage = (teamName: string) => {
  const kit = getTeamKit(teamName);
  return kit?.homeKit || defaultJersey;
};

const getSizeClasses = (size: 'small' | 'medium' | 'large' | 'responsive') => {
  switch (size) {
    case 'small':
      return {
        container: 'w-20 h-28', // Compact for pitch
        image: 'w-16 h-16',
        nameBox: 'px-1 py-0.5 text-[10px]',
        badge: 'text-[9px] px-1'
      };
    case 'medium':
      return {
        container: 'w-32 h-44',
        image: 'w-24 h-24',
        nameBox: 'px-2 py-1 text-xs',
        badge: 'text-[10px] px-1.5'
      };
    case 'large':
      return {
        container: 'w-48 h-64',
        image: 'w-40 h-40',
        nameBox: 'px-4 py-2 text-lg',
        badge: 'text-sm px-2'
      };
    case 'responsive':
      return {
        container: 'w-32 h-44 md:w-48 md:h-64',
        image: 'w-24 h-24 md:w-40 md:h-40',
        nameBox: 'px-2 py-1 text-xs md:px-4 md:py-2 md:text-lg',
        badge: 'text-[10px] px-1.5 md:text-sm md:px-2'
      };
  }
};

export const FifaCard: React.FC<FifaCardProps> = ({
  player,
  isEmpty = false,
  size = 'medium',
  onEmptyClick,
  onPlayerClick,
  showRemoveOverlay = false,
  points,
  opponent
}) => {
  const sizeClasses = getSizeClasses(size);
  const kit = player ? getTeamKit(player.team) : null;

  if (isEmpty) {
    return (
      <div
        className={`${sizeClasses.container} flex flex-col items-center justify-center cursor-pointer hover:opacity-80 transition-opacity group relative`}
        onClick={onEmptyClick}
      >
        <div className="w-full h-full border-2 border-dashed border-white/40 rounded-t-xl rounded-b-[2rem] flex flex-col items-center justify-center bg-white/5 backdrop-blur-sm shadow-inner">
          <span className="text-white/70 text-4xl font-light">+</span>
        </div>
      </div>
    );
  }

  if (!player) return null;

  // Determine card background based on rating (Gold/Silver/Bronze concept, but using FPSL style)
  // For now, consistent premium 'Gold-ish' look for all, or dynamic based on rating.
  const isSpecial = player.rating >= 85;
  const bgClass = isSpecial
    ? "bg-gradient-to-b from-[#f7e07c] via-[#e4c259] to-[#b88a00]" // Rare Gold
    : "bg-gradient-to-b from-[#e2e2e2] via-[#dcdcdc] to-[#9a9a9a]"; // Silver/Normal Gold fallback or modify as needed.

  // Actually, let's use a nice dark premium card for FPSL style but with the LAYOUT of FIFA.
  // The user asked for "original fifa card format", which implies the Gold/Shield look.
  // Let's go with a standard Gold Ultimate Team style.

  return (
    <div
      className={`${sizeClasses.container} relative flex flex-col items-center justify-start group cursor-pointer transition-transform hover:scale-[1.02] select-none text-black`}
      onClick={() => onPlayerClick?.(player)}
    >
      {/* Card Shield Shape & Background */}
      <div className="absolute inset-0 bg-[#e4c259] rounded-t-lg rounded-b-[2.5rem] shadow-xl overflow-hidden border-[3px] border-[#cfaa48]">
        {/* Inner Texture/Gradient */}
        <div className="absolute inset-1 border border-[#b88a00]/30 rounded-t-md rounded-b-[2.2rem] bg-gradient-to-br from-[#f9f1d0] via-[#eed688] to-[#cba32d]"></div>
      </div>

      {/* Content Layer */}
      <div className="relative z-10 w-full h-full flex flex-col pt-3 px-3 pb-4">

        {/* Top Section: Rating/Info & Image */}
        <div className="flex flex-row flex-1 min-h-0">

          {/* Left Column: Rating, Pos, Club */}
          <div className="flex flex-col items-center w-1/4 pt-1 space-y-0.5">
            <span className="font-['Oswald'] font-bold text-2xl md:text-3xl leading-none text-[#3e3216]">{player.rating}</span>
            <span className="font-['Oswald'] text-xs md:text-sm font-medium uppercase text-[#3e3216]">{player.position}</span>

            <div className="w-4/5 h-[1px] bg-[#9e7d22] my-1 opacity-60"></div>

            {/* Club Logo */}
            {kit?.logo ? (
              <img src={kit.logo} alt="Club" className="w-6 h-6 object-contain" />
            ) : (
              <Shield className="w-5 h-5 text-[#3e3216]" />
            )}

            {/* Nation (Flag placeholder or code) */}
            <span className="text-[10px] font-bold text-[#3e3216] opacity-80 pt-1">{player.nationality.slice(0, 3).toUpperCase()}</span>
          </div>

          {/* Right Area: Jersey Image */}
          <div className="flex-1 flex justify-center items-center relative">
            <img
              src={getPlayerImage(player.team)}
              alt={player.team}
              className={`${sizeClasses.image} object-contain mix-blend-multiply brightness-110 contrast-125 bg-transparent drop-shadow-sm`}
            />
          </div>
        </div>

        {/* Name Bar */}
        <div className="flex flex-col items-center justify-center mt-[-10px] mb-1 z-20">
          <span className="font-['Oswald'] uppercase font-bold text-lg md:text-xl text-[#3e3216] tracking-tight truncate max-w-full px-1">
            {getSurname(player.name)}
          </span>
          {/* Horizontal Divider */}
          <div className="w-full h-[1px] bg-[#9e7d22] opacity-50 mb-1"></div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 gap-x-2 gap-y-[1px] w-full px-1">
          <div className="flex items-center justify-center space-x-1">
            <span className="font-bold font-['Oswald'] text-[#3e3216] text-xs md:text-sm">{player.pace}</span>
            <span className="font-light text-[9px] md:text-[10px] uppercase text-[#3e3216]">PAC</span>
          </div>
          <div className="flex items-center justify-center space-x-1">
            <span className="font-bold font-['Oswald'] text-[#3e3216] text-xs md:text-sm">{player.dribbling}</span>
            <span className="font-light text-[9px] md:text-[10px] uppercase text-[#3e3216]">DRI</span>
          </div>

          <div className="flex items-center justify-center space-x-1">
            <span className="font-bold font-['Oswald'] text-[#3e3216] text-xs md:text-sm">{player.shooting}</span>
            <span className="font-light text-[9px] md:text-[10px] uppercase text-[#3e3216]">SHO</span>
          </div>
          <div className="flex items-center justify-center space-x-1">
            <span className="font-bold font-['Oswald'] text-[#3e3216] text-xs md:text-sm">{player.defending}</span>
            <span className="font-light text-[9px] md:text-[10px] uppercase text-[#3e3216]">DEF</span>
          </div>

          <div className="flex items-center justify-center space-x-1">
            <span className="font-bold font-['Oswald'] text-[#3e3216] text-xs md:text-sm">{player.passing}</span>
            <span className="font-light text-[9px] md:text-[10px] uppercase text-[#3e3216]">PAS</span>
          </div>
          <div className="flex items-center justify-center space-x-1">
            <span className="font-bold font-['Oswald'] text-[#3e3216] text-xs md:text-sm">{player.physical}</span>
            <span className="font-light text-[9px] md:text-[10px] uppercase text-[#3e3216]">PHY</span>
          </div>
        </div>

      </div>

      {/* Points Badge (Top Right) - if applicable */}
      {points !== undefined && (
        <div className="absolute top-2 right-2 z-30 font-bold bg-white border border-[#cfaa48] text-[#3e3216] rounded-full w-6 h-6 flex items-center justify-center text-xs shadow-sm">
          {points}
        </div>
      )}

      {/* Remove Overlay */}
      {showRemoveOverlay && (
        <div
          className="absolute inset-0 bg-red-900/60 rounded-t-lg rounded-b-[2.5rem] flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200 z-40"
        >
          <div className="bg-red-600 text-white text-xs px-2 py-1 rounded font-bold shadow-sm">
            REMOVE
          </div>
        </div>
      )}
    </div>
  );
};

// Simplified detailed view re-using the new design
export const FifaCardDetailed: React.FC<{ player: Player; onClick?: () => void; size?: 'small' | 'medium' | 'large' | 'responsive' }> = ({
  player,
  onClick,
  size = 'responsive'
}) => {
  return (
    <div onClick={onClick} className="flex flex-col items-center">
      <FifaCard player={player} size={size} />
      <div className="mt-2 text-center">
        <Badge variant="secondary" className="text-xs px-2 py-0.5 md:text-lg md:px-4 md:py-1 bg-black text-white border border-gold-500">
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