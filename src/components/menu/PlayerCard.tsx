import React, { useState, useEffect } from 'react';
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Edit2, Check, PenSquare } from 'lucide-react';
import { getTitleById, getPortraitById, LEVELS } from '@/data/playerProgressionData';
import { useGame } from '@/context/GameContext';
import { Dialog, DialogTrigger } from "@/components/ui/dialog";
import EditCustomization from './EditCustomization';
import DefaultAvatar from '@/assets/images/icons/profile.png';
import { formatNumber } from '@/utils/gameLogic';

interface PlayerCardProps {
  onNameChange: (newName: string) => void;
  userId: string;
}

const PlayerCard: React.FC<PlayerCardProps> = ({ onNameChange, userId }) => {
  const { state, addGems, dispatch } = useGame();
  const player = state.playerData;
  const [isEditing, setIsEditing] = useState(false);
  const [tempName, setTempName] = useState(player.name);
  const [isCustomizationOpen, setIsCustomizationOpen] = useState(false);
  const [isChestAvailable] = useState(false);
  const [expProgress, setExpProgress] = useState(0); // For animation

  const nameChangeCount = player.nameChangeCount || 0;
  const nameChangeCost = nameChangeCount === 0 ? 0 : 200;
  const canEditName = state.gems >= nameChangeCost || nameChangeCount === 0;

  // Get current and next level data directly from LEVELS based on player.level
  const currentLevelData = LEVELS.find(l => l.level === player.level) || LEVELS[0];
  const nextLevelData = LEVELS.find(l => l.level === player.level + 1) || null;
  const currentExp = player.experience || 0;
  const expToNextLevel = nextLevelData ? nextLevelData.expRequired : currentLevelData.expRequired;
  const expRange = nextLevelData ? (nextLevelData.expRequired - currentLevelData.expRequired) : 0;
  const progressToNext = nextLevelData
    ? Math.min(Math.max(((currentExp - currentLevelData.expRequired) / expRange) * 100, 0), 100)
    : 100;

  const titleData = getTitleById(player.title) || getTitleById('space_pilot');
  const portraitData = getPortraitById(player.portrait) || getPortraitById('default');

  // Animate EXP bar
  useEffect(() => {
    // Smoothly transition to the new progress value
    let start = expProgress;
    const end = progressToNext;
    const duration = 500; // Animation duration in ms
    const startTime = performance.now();

    const animate = (currentTime: number) => {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const easedProgress = start + (end - start) * (1 - Math.pow(1 - progress, 4)); // Ease-out quart
      setExpProgress(easedProgress);

      if (progress < 1) {
        requestAnimationFrame(animate);
      }
    };

    requestAnimationFrame(animate);
  }, [progressToNext]);

  const handleSaveName = () => {
    if (!isEditing || !tempName.trim()) return;
    if (nameChangeCost > 0 && state.gems < nameChangeCost) return;
    if (nameChangeCost > 0) addGems(-nameChangeCost);
    dispatch({ type: 'UPDATE_PLAYER_NAME', name: tempName });
    onNameChange(tempName);
    dispatch({ type: 'UPDATE_NAME_CHANGE_COUNT', count: nameChangeCount + 1 });
    setIsEditing(false);
  };

  const getNextLevelText = () => {
    if (!nextLevelData) return "Max Level";
    const roundedExp = Math.round(currentExp * 10) / 10;
    return `${formatNumber(roundedExp)}/${formatNumber(nextLevelData.expRequired)}`;
  };

  return (
    <div className="bg-indigo-600/20 rounded-lg p-3 border border-indigo-500/30 mb-3">
      <div className="flex relative">
        <div className="flex flex-col items-center pt-2">
          <div className="relative w-24 h-24 mb-1">
            <img
              src={portraitData?.pngPath || DefaultAvatar}
              alt={portraitData?.name || 'Default'}
              className="absolute w-24 h-24 -top-0 -left-0 z-[10002] object-contain opacity-80"
              onError={(e) => (e.currentTarget.src = DefaultAvatar)}
            />
            <Avatar className="absolute h-20 w-20 border-2 border-amber-500/50 top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-[10001]">
              <AvatarImage src={DefaultAvatar} alt={player.name} />
              <AvatarFallback className="bg-indigo-700/50 text-white text-lg">
                {player.name.substring(0, 2).toUpperCase()}
              </AvatarFallback>
            </Avatar>
          </div>
          <div className="mt-1 pt-0.5 bg-gradient-to-r from-purple-600 to-indigo-600 text-white text-xs px-1.5 py-0.5 rounded font-medium text-center">
            {titleData?.name || 'Space Pilot'}
          </div>
        </div>

        <div className="ml-3 flex-1 pt-2">
          {isEditing ? (
            <div className="flex items-center gap-2 mb-4">
              <Input
                value={tempName}
                onChange={(e) => setTempName(e.target.value)} // Fixed typo: targetValue -> target.value
                className="h-7 text-white bg-indigo-700/50 border-indigo-500"
                maxLength={15}
              />
              <Button size="icon" variant="ghost" className="h-7 w-7 p-0" onClick={handleSaveName}>
                <Check size={14} className="text-green-400" />
              </Button>
            </div>
          ) : (
            <div className="mb-6 mt-2">
              <h3 className="text-m font-semibold text-white">{player.name}</h3>
              {nameChangeCount > 0 && (
                <span className="flex items-center text-xs text-purple-400 mt-1">
                  <Gem size={12} className="mr-1" /> 200
                </span>
              )}
            </div>
          )}

          <div className="flex items-center gap-2 mb-1 pt-3 relative">
            <div className="text-white text-xs font-medium">Level {player.level}</div>
            <Button
              variant="ghost"
              size="icon"
              className={`absolute right-0 h-8 w-8 p-0 transition-all ${isChestAvailable ? 'opacity-100' : 'opacity-50'}`}
              onClick={() => console.log('Treasure chest clicked!')}
              disabled={!isChestAvailable}
            >
              {/* Icon removed as per your request */}
            </Button>
          </div>

          <div className="space-y-0.5">
            <div className="flex justify-between text-xs text-slate-300">
              <span>XP</span>
              <span>{getNextLevelText()}</span>
            </div>
            <Progress
              value={expProgress}
              className="h-1.5 bg-slate-700/50"
              indicatorClassName="bg-gradient-to-r from-amber-500 to-yellow-500 transition-all duration-500 ease-out"
            />
          </div>
        </div>

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
            <Button
              size="icon"
              variant="ghost"
              className="h-6 w-6 p-0"
              onClick={() => setIsEditing(true)}
              title="Edit Name"
              disabled={!canEditName}
            >
              <Edit2 size={14} className={canEditName ? "text-slate-300" : "text-slate-500"} />
            </Button>
          </div>

          <div className="absolute bottom-0 right-0 flex flex-col justify-end space-y-1">
            <div className="flex items-center justify-between min-w-20">
              <span className="text-amber-400 text-xs font-semibold">Coins:</span>
              <span className="text-white text-xs">{formatNumber(state.coins)}</span>
            </div>
            <div className="flex items-center justify-between min-w-20">
              <span className="text-purple-400 text-xs font-semibold">Gems:</span>
              <span className="text-white text-xs">{formatNumber(state.gems)}</span>
            </div>
            <div className="flex items-center justify-between min-w-20">
              <span className="text-blue-400 text-xs font-semibold">Essence:</span>
              <span className="text-white text-xs">{formatNumber(state.essence)}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PlayerCard;