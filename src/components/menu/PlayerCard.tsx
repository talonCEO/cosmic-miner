
import React, { useState } from 'react';
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Edit2, Check } from 'lucide-react';

interface PlayerCardProps {
  playerName: string;
  playerRank: string;
  playerLevel: number;
  playerExp: number;
  playerMaxExp: number;
  coins: number;
  gems: number;
  essence: number;
  onNameChange: (newName: string) => void;
}

const PlayerCard: React.FC<PlayerCardProps> = ({
  playerName,
  playerRank,
  playerLevel,
  playerExp,
  playerMaxExp,
  coins,
  gems,
  essence,
  onNameChange
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [name, setName] = useState(playerName);
  const expPercentage = (playerExp / playerMaxExp) * 100;
  
  // Generate a random but static UID for the player
  const playerUID = React.useMemo(() => {
    return Math.floor(10000000 + Math.random() * 90000000);
  }, []);
  
  const handleSaveName = () => {
    if (name.trim()) {
      onNameChange(name);
      setIsEditing(false);
    }
  };
  
  const formatCurrency = (amount: number) => {
    if (amount >= 1000000) {
      return `${(amount / 1000000).toFixed(1)}M`;
    } else if (amount >= 1000) {
      return `${(amount / 1000).toFixed(1)}K`;
    }
    return amount.toString();
  };
  
  return (
    <div className="bg-indigo-600/20 rounded-lg p-3 border border-indigo-500/30 mb-3">
      <div className="flex">
        {/* Left column: Avatar */}
        <Avatar className="h-16 w-16 border-2 border-amber-500/50">
          <AvatarImage src="/placeholder.svg" alt="Player avatar" />
          <AvatarFallback className="bg-indigo-700/50 text-white text-lg">
            {playerName.substring(0, 2).toUpperCase()}
          </AvatarFallback>
        </Avatar>
        
        {/* Middle column: Player info */}
        <div className="ml-3 flex-1">
          {isEditing ? (
            <div className="flex items-center gap-2 mb-1">
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
            <div className="flex items-center mb-1">
              <Button 
                size="icon" 
                variant="ghost"
                className="h-6 w-6 p-0 mr-1"
                onClick={() => setIsEditing(true)}
              >
                <Edit2 size={14} className="text-slate-300" />
              </Button>
              <h3 className="text-sm font-semibold text-white">{playerName}</h3>
              <span className="text-xs text-slate-400/40 ml-2">#{playerUID}</span>
            </div>
          )}
          
          <div className="flex items-center gap-2 mb-1">
            <div className="bg-gradient-to-r from-purple-600 to-indigo-600 text-white text-xs px-1.5 py-0.5 rounded font-medium">
              {playerRank}
            </div>
            <div className="text-white text-xs font-medium">
              Level {playerLevel}
            </div>
          </div>
          
          <div className="space-y-0.5">
            <div className="flex justify-between text-xs text-slate-300">
              <span>XP</span>
              <span>{playerExp}/{playerMaxExp}</span>
            </div>
            <Progress value={expPercentage} className="h-1.5 bg-slate-700/50" indicatorClassName="bg-gradient-to-r from-amber-500 to-yellow-500" />
          </div>
        </div>
        
        {/* Right column: Currency info */}
        <div className="ml-4 flex flex-col justify-center space-y-1 min-w-20">
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
  );
};

export default PlayerCard;
