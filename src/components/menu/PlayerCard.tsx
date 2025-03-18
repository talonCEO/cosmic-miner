
import React, { useState, useEffect } from 'react';
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { Gift, Gem, PenSquare } from 'lucide-react';
import { getTitleById, getLevelFromExp, getPortraitById } from '@/data/playerProgressionData';
import { useGame } from '@/context/GameContext';
import { Dialog, DialogTrigger } from "@/components/ui/dialog";
import EditCustomization from './EditCustomization';

interface PlayerCardProps {
  playerName: string;
  playerTitle: string;
  playerLevel: number;
  playerExp: number;
  playerMaxExp: number;
  coins: number;
  gems: number;
  essence: number;
  onNameChange: (newName: string) => void;
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
  gems,
  essence,
  onNameChange,
  userId,
  portrait,
}) => {
  const { state } = useGame();
  const [isChestAvailable, setIsChestAvailable] = useState(false);
  const [titleDisplay, setTitleDisplay] = useState(playerTitle);
  const [isCustomizationOpen, setIsCustomizationOpen] = useState(false);

  const { currentLevel, nextLevel, progress } = getLevelFromExp(playerExp);

  useEffect(() => {
    const title = getTitleById(playerTitle);
    setTitleDisplay(title ? title.name : playerTitle);
  }, [playerTitle]);

  const formatCurrency = (amount: number) => {
    if (amount >= 1000000) return `${(Math.round(amount / 100000) / 10).toFixed(1)}M`;
    if (amount >= 1000) return `${(Math.round(amount / 100) / 10).toFixed(1)}K`;
    return amount.toFixed(1);
  };

  const handleChestClick = () => {
    if (isChestAvailable) {
      console.log('Treasure chest opened!');
      setIsChestAvailable(false);
    }
  };

  const getNextLevelText = () => {
    if (!nextLevel) return "Max Level";
    const roundedExp = Math.round(playerExp * 10) / 10;
    return `${roundedExp}/${nextLevel.expRequired}`;
  };

  const portraitData = getPortraitById(portrait) || getPortraitById('default');

  return (
    <div className="bg-indigo-600/20 rounded-lg p-3 border border-indigo-500/30 mb-3">
      <div className="flex relative">
        {/* Left Column: Portrait */}
        <div className="flex flex-col items-center pt-2">
          <div className="relative w-24 h-24 mb-1 overflow-visible">
            <img
              src={portraitData?.pngPath}
              alt={portraitData?.name}
              className="absolute h-24 w-24 -top-0 -left-0 z-[10002] rounded-full object-cover opacity-80"
            />
            <Avatar className="absolute h-20 w-20 border-2 border-amber-500/50 top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-[10001]">
              <AvatarFallback className="bg-indigo-700/50 text-white text-lg">
                {playerName.substring(0, 2).toUpperCase()}
              </AvatarFallback>
            </Avatar>
          </div>
          <div className="mt-1 pt-0.5 bg-gradient-to-r from-purple-600 to-indigo-600 text-white text-xs px-1.5 py-0.5 rounded font-medium text-center">
            {titleDisplay}
          </div>
        </div>

        {/* Middle Column: Name, Level, XP */}
        <div className="ml-3 flex-1 pt-2">
          <div className="mb-6 mt-2">
            <h3 className="text-m font-semibold text-white">{playerName}</h3>
          </div>

          <div className="flex items-center gap-2 mb-1 pt-3 relative">
            <div className="text-white text-xs font-medium">Level {currentLevel.level}</div>
            {currentLevel.rewards && (
              <div className="text-xs text-amber-400">
                {currentLevel.rewards.skillPoints ? `+${currentLevel.rewards.skillPoints} SP` : ''}
                {currentLevel.rewards.essence ? ` +${currentLevel.rewards.essence} Essence` : ''}
              </div>
            )}
            <Button
              variant="ghost"
              size="icon"
              className={`absolute right-0 h-8 w-8 p-0 transition-all ${isChestAvailable ? 'opacity-100' : 'opacity-50'}`}
              onClick={handleChestClick}
              disabled={!isChestAvailable}
            >
              <div className="relative flex items-center justify-center h-full w-full">
                <Gift size={20} className={`text-yellow-400 ${isChestAvailable ? 'stroke-2' : 'stroke-1'}`} />
              </div>
            </Button>
          </div>

          <div className="space-y-0.5">
            <div className="flex justify-between text-xs text-slate-300">
              <span>XP</span>
              <span>{getNextLevelText()}</span>
            </div>
            <Progress
              value={progress}
              className="h-1.5 bg-slate-700/50"
              indicatorClassName="bg-gradient-to-r from-amber-500 to-yellow-500"
            />
          </div>
        </div>

        {/* Right Column: Buttons and Currency */}
        <div className="ml-4 flex flex-col items-end relative min-w-20">
          <div className="absolute top-0 right-0 flex gap-2">
            <Dialog open={isCustomizationOpen} onOpenChange={setIsCustomizationOpen}>
              <DialogTrigger asChild>
                <Button
                  size="icon"
                  variant="ghost"
                  className="h-6 w-6 p-0"
                  title="Customize Profile"
                >
                  <PenSquare size={14} className="text-slate-300" />
                </Button>
              </DialogTrigger>
              <EditCustomization onClose={() => setIsCustomizationOpen(false)} />
            </Dialog>
          </div>

          <div className="absolute bottom-0 right-0 flex flex-col justify-end space-y-1">
            <div className="flex items-center justify-between min-w-20">
              <span className="text-amber-400 text-xs font-semibold">Coins:</span>
              <span className="text-white text-xs">{formatCurrency(coins)}</span>
            </div>
            <div className="flex items-center justify-between min-w-20">
              <span className="text-purple-400 text-xs font-semibold">Gems:</span>
              <span className="text-white text-xs">{formatCurrency(gems)}</span>
            </div>
            <div className="flex items-center justify-between min-w-20">
              <span className="text-blue-400 text-xs font-semibold">Essence:</span>
              <span className="text-white text-xs">{formatCurrency(essence)}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PlayerCard;
