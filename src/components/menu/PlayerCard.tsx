import React from 'react';
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { Coins, Sparkles } from 'lucide-react';
import { Input } from "@/components/ui/input";
import { useGame } from '@/context/GameContext';
import { PORTRAITS, TITLES } from '@/data/playerProgressionData';
import { Edit2 } from 'lucide-react';

interface PlayerCardProps {
  playerName: string;
  playerTitle: string;
  playerLevel: number;
  playerExp: number;
  playerMaxExp: number;
  coins: number;
  essence: number;
  userId: string;
  portrait: string;
}

const PlayerCard: React.FC<PlayerCardProps> = ({
  playerName,
  playerTitle,
  playerLevel,
  playerExp,
  playerMaxExp,
  coins,
  essence,
  userId,
  portrait,
}) => {
  const { setMenuType } = useGame();

  const progressPercentage = (playerExp / playerMaxExp) * 100;

  const titleData = TITLES.find(t => t.id === playerTitle);
  const portraitData = PORTRAITS.find(p => p.id === portrait);

  const handleEditClick = () => {
    if (setMenuType) {
      setMenuType('customize');
    }
  };

  return (
    <div className="bg-gradient-to-br from-indigo-900/80 to-purple-900/80 p-4 rounded-lg border border-indigo-500/30 relative">
      <div className="flex items-center gap-3">
        <div className="relative">
          <div className="w-16 h-16 rounded-full overflow-hidden border-2 border-indigo-400">
            <img
              src={portraitData?.image || '/portraits/default.png'}
              alt={portraitData?.name || 'Default Portrait'}
              className="w-full h-full object-cover"
            />
          </div>
          <button
            onClick={handleEditClick}
            className="absolute bottom-0 right-0 bg-indigo-600 p-1 rounded-full hover:bg-indigo-700 transition-colors"
          >
            <Edit2 size={14} />
          </button>
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <h2 className="text-lg font-semibold text-white truncate">{playerName}</h2>
          </div>
          <p className="text-sm text-indigo-200 truncate">
            {titleData?.name || 'Space Pilot'}
          </p>
          <div className="mt-1">
            <div className="flex items-center justify-between text-xs text-indigo-300">
              <span>Level {playerLevel}</span>
              <span>{Math.floor(playerExp)} / {playerMaxExp} XP</span>
            </div>
            <Progress value={progressPercentage} className="h-2 mt-1 bg-indigo-700" />
          </div>
        </div>
      </div>

      <div className="mt-3 grid grid-cols-2 gap-2 text-sm">
        <div className="flex items-center gap-1">
          <Coins size={16} className="text-yellow-400" />
          <span className="text-yellow-200">{Math.floor(coins).toLocaleString()}</span>
        </div>
        <div className="flex items-center gap-1">
          <Sparkles size={16} className="text-amber-400" />
          <span className="text-amber-200">{Math.floor(essence).toLocaleString()}</span>
        </div>
      </div>

      <div className="mt-2 text-xs text-indigo-300 truncate">
        ID: {userId}
      </div>
    </div>
  );
};

export default PlayerCard;
