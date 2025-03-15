
import React, { useState, useEffect } from 'react';
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Edit2, Check, Lock, Gift } from 'lucide-react';
import { getTitleById, getLevelFromExp } from '@/data/playerProgressionData';
import { toast } from 'sonner';
import { useFirebase } from '@/context/FirebaseContext';

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
  userId?: string; // Make optional for backward compatibility
  hasChangedUsername?: boolean; // Whether the user has used their free name change
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
  hasChangedUsername = false
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [name, setName] = useState(playerName);
  const [isChestAvailable, setIsChestAvailable] = useState(false);
  const [titleDisplay, setTitleDisplay] = useState(playerTitle);
  const { spendGems } = useFirebase();
  
  const { currentLevel, nextLevel, progress } = getLevelFromExp(playerExp);
  
  useEffect(() => {
    const title = getTitleById(playerTitle);
    if (title) {
      setTitleDisplay(title.name);
    } else {
      setTitleDisplay(playerTitle);
    }
  }, [playerTitle]);
  
  const playerUID = userId || React.useMemo(() => {
    return Math.floor(10000000 + Math.random() * 90000000).toString();
  }, []);
  
  const handleSaveName = async () => {
    if (name.trim()) {
      // Show payment info if this is not the first change
      if (hasChangedUsername) {
        toast.info("Username changes after the first one cost 200 gems.");
      }
      
      onNameChange(name);
      setIsEditing(false);
    }
  };
  
  const formatCurrency = (amount: number) => {
    if (amount >= 1000000) {
      return `${(Math.round(amount / 100000) / 10).toFixed(1)}M`;
    } else if (amount >= 1000) {
      return `${(Math.round(amount / 100) / 10).toFixed(1)}K`;
    }
    return amount.toFixed(0); // Round to whole number
  };

  const handleChestClick = () => {
    if (isChestAvailable) {
      console.log('Treasure chest opened!');
      setIsChestAvailable(false);
    }
  };
  
  const getNextLevelText = () => {
    if (!nextLevel) {
      return "Max Level";
    }
    return `${Math.round(playerExp)}/${nextLevel.expRequired}`;
  };
  
  return (
    <div className="bg-indigo-600/20 rounded-lg p-3 border border-indigo-500/30 mb-3">
      <div className="flex">
        {/* Left column: Avatar and Title */}
        <div className="flex flex-col items-center pt-2">
          <Avatar className="h-16 w-16 border-2 border-amber-500/50 mb-1">
            <AvatarImage src="/placeholder.svg" alt="Player avatar" />
            <AvatarFallback className="bg-indigo-700/50 text-white text-lg">
              {playerName.substring(0, 2).toUpperCase()}
            </AvatarFallback>
          </Avatar>
          <div className="mt-1 pt-0.5 bg-gradient-to-r from-purple-600 to-indigo-600 text-white text-xs px-1.5 py-0.5 rounded font-medium text-center">
            {titleDisplay}
          </div>
        </div>
        
        {/* Middle column: Player info */}
        <div className="ml-3 flex-1 pt-2"> {/* Added pt-2 for top padding */}
          {isEditing ? (
            <div className="flex items-center gap-2 mb-2">
              <Input 
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="h-7 text-white bg-indigo-700/50 border-indigo-500"
                maxLength={15}
              />
              <Button 
                size="icon" 
                variant="ghost" 
                className="h-7 w-7 p-0"
                onClick={handleSaveName}
              >
                <Check size={14} className="text-green-400" />
              </Button>
            </div>
          ) : (
            <div className="flex items-center mb-2">
              <Button 
                size="icon" 
                variant="ghost"
                className="h-6 w-6 p-0 mr-1"
                onClick={() => setIsEditing(true)}
              >
                <Edit2 size={14} className="text-slate-300" />
              </Button>
              <h3 className="text-sm font-semibold text-white">{playerName}</h3>
              {hasChangedUsername && (
                <div className="ml-2 text-xs text-amber-300">(200 gems to change)</div>
              )}
            </div>
          )}
          
          <div className="flex items-center gap-2 mb-1 pt-3"> {/* Added pt-1 for level display padding */}
            <div className="text-white text-xs font-medium">
              Level {currentLevel.level}
            </div>
            
            {currentLevel.rewards && (
              <div className="text-xs text-amber-400">
                {currentLevel.rewards.skillPoints ? `+${currentLevel.rewards.skillPoints} SP` : ''}
                {currentLevel.rewards.essence ? ` +${currentLevel.rewards.essence} Essence` : ''}
              </div>
            )}
          </div>
          
          <div className="space-y-0.5">
            <div className="flex justify-between text-xs text-slate-300">
              <span>XP</span>
              <span>{getNextLevelText()}</span>
            </div>
            <Progress value={progress} className="h-1.5 bg-slate-700/50" indicatorClassName="bg-gradient-to-r from-amber-500 to-yellow-500" />
          </div>
        </div>
        
        {/* Right column: Treasure Chest Button above Currency info */}
        <div className="ml-4 flex flex-col items-end space-y-2">
          <Button
            variant="ghost"
            size="icon"
            className={`h-10 w-10 p-0 transition-all ${
              isChestAvailable ? 'opacity-100' : 'opacity-50'
            }`}
            onClick={handleChestClick}
            disabled={!isChestAvailable}
          >
            <div className="relative flex items-center justify-center h-full w-full">
              <Gift 
                size={24} 
                className={`text-yellow-400 ${isChestAvailable ? 'stroke-2' : 'stroke-1'}`}
              />
              {!isChestAvailable && (
                <Lock 
                  size={16} 
                  className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-gray-600"
                />
              )}
            </div>
          </Button>

          <div className="flex flex-col justify-center space-y-1 min-w-20">
            <div className="flex items-center justify-between">
              <span className="text-amber-400 text-xs font-semibold">Coins:</span>
              <span className="text-white text-xs">{formatCurrency(coins)}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-purple-400 text-xs font-semibold">Gems:</span>
              <span className="text-white text-xs">{formatCurrency(gems)}</span>
            </div>
            <div className="flex items-center justify-between">
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
