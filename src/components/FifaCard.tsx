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

  if (isEmpty) {
    return (
      <div
        className={`${sizeClasses.container} flex flex-col items-center justify-center cursor-pointer hover:opacity-80 transition-opacity group relative`}
        onClick={onEmptyClick}
      >
        <div className="w-full h-full border-2 border-dashed border-white/50 rounded-lg flex flex-col items-center justify-center bg-white/10 backdrop-blur-sm">
          <span className="text-white/70 text-2xl font-light">+</span>
        </div>
      </div>
    );
  }

  if (!player) return null;

  return (
    <div
      className={`${sizeClasses.container} relative flex flex-col items-center justify-end group cursor-pointer transition-transform hover:scale-105`}
      onClick={() => onPlayerClick?.(player)}
    >
      {/* Jersey Image - Floating above the name */}
      <div className="absolute top-0 w-full flex justify-center z-10">
        <img
          src={getPlayerImage(player.team)}
          alt={player.team}
          className={`${sizeClasses.image} object-contain pb-1 mix-blend-multiply brightness-105 contrast-125`}
        />
      </div>

      {/* Points Badge */}
      {points !== undefined && (
        <div className={`absolute top-0 right-0 z-20 font-bold bg-[#facc15] text-[#0f172a] rounded-full shadow-md ${sizeClasses.badge}`}>
          {points} pts
        </div>
      )}

      {/* Info Box (Surname & Position/Opponent context) */}
      <div className="w-full mt-auto relative z-20 flex flex-col items-center gap-[1px]">

        {/* Surname Box - FPL Purple */}
        <div className={`bg-[#37003c] text-white font-bold uppercase tracking-wider text-center shadow-sm w-full truncate rounded-t-sm ${sizeClasses.nameBox}`}>
          {getSurname(player.name)}
        </div>

        {/* Opponent/Position Box - FPL Green */}
        <div className="bg-[#00ff85] text-[#37003c] font-black uppercase text-center w-full truncate rounded-b-sm text-[10px] py-0.5 leading-tight">
          {opponent || player.position}
        </div>
      </div>

      {/* Remove Overlay */}
      {showRemoveOverlay && (
        <div
          className="absolute inset-0 bg-red-900/60 rounded-lg flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200 z-30"
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