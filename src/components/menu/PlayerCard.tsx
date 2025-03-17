import React from 'react';
import { Edit2, Coins, Sparkles } from 'lucide-react';
import { Progress } from "@/components/ui/progress";
import { PORTRAITS, TITLES } from '@/data/playerProgressionData';
import { formatNumber } from '@/utils/gameLogic';
import { Button } from '@/components/ui/button';
import { DialogTrigger } from '@/components/ui/dialog';

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
  const portraitData = PORTRAITS.find(p => p.id === portrait) || PORTRAITS[0];
  const titleData = TITLES.find(t => t.id === playerTitle) || TITLES[0];

  return (
    <div className="relative bg-gradient-to-br from-indigo-900/80 to-indigo-800/80 border border-indigo-500/30 rounded-xl p-3 shadow-lg">
      <div className="flex items-start gap-3">
        <div className="relative flex-shrink-0">
          <div className="w-16 h-16 rounded-full overflow-hidden border-2 border-indigo-400 shadow-md">
            <img
              src={portraitData.image}
              alt={portraitData.name}
              className="w-full h-full object-cover"
            />
          </div>
          <span className="absolute -bottom-1 -right-1 bg-indigo-600 text-white text-xs font-bold px-1.5 py-0.5 rounded-full border border-indigo-400 shadow">
            {playerLevel}
          </span>
        </div>

        <div className="flex-1 min-w-0 space-y-1">
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <h2 className="text-lg font-semibold text-white truncate">{playerName}</h2>
            </div>
            <DialogTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                className="p-1 h-6 w-6 text-indigo-300 hover:text-indigo-100 hover:bg-indigo-700/50 rounded-full"
              >
                <Edit2 size={14} />
              </Button>
            </DialogTrigger>
          </div>

          <p className="text-sm text-indigo-200 truncate">{titleData.name}</p>

          <div className="space-y-0.5">
            <Progress
              value={(playerExp / playerMaxExp) * 100}
              className="h-1.5 bg-indigo-700/50"
            />
            <p className="text-xs text-indigo-300">
              {formatNumber(playerExp)} / {formatNumber(playerMaxExp)} EXP
            </p>
          </div>
        </div>
      </div>

      <div className="mt-2 pt-2 border-t border-indigo-500/20 flex items-center justify-between gap-2 text-sm">
        <div className="flex items-center gap-1">
          <Coins size={16} className="text-yellow-400" />
          <span className="text-yellow-200">{formatNumber(coins)}</span>
        </div>
        <div className="flex items-center gap-1">
          <Sparkles size={16} className="text-amber-400" />
          <span className="text-amber-200">{formatNumber(essence)}</span>
        </div>
        <span className="text-indigo-300 truncate">ID: {userId}</span>
      </div>
    </div>
  );
};

export default PlayerCard;
