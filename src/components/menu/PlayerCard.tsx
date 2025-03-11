
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
  onNameChange: (newName: string) => void;
}

const PlayerCard: React.FC<PlayerCardProps> = ({
  playerName,
  playerRank,
  playerLevel,
  playerExp,
  playerMaxExp,
  onNameChange
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [name, setName] = useState(playerName);
  const expPercentage = (playerExp / playerMaxExp) * 100;
  
  const handleSaveName = () => {
    if (name.trim()) {
      onNameChange(name);
      setIsEditing(false);
    }
  };
  
  return (
    <div className="bg-indigo-600/20 rounded-lg p-3 border border-indigo-500/30 mb-3">
      <div className="flex">
        <Avatar className="h-16 w-16 border-2 border-amber-500/50">
          <AvatarImage src="/placeholder.svg" alt="Player avatar" />
          <AvatarFallback className="bg-indigo-700/50 text-white text-lg">
            {playerName.substring(0, 2).toUpperCase()}
          </AvatarFallback>
        </Avatar>
        
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
            <div className="flex items-center justify-between mb-1">
              <h3 className="text-sm font-semibold text-white">{playerName}</h3>
              <Button 
                size="icon" 
                variant="ghost"
                className="h-6 w-6 p-0"
                onClick={() => setIsEditing(true)}
              >
                <Edit2 size={14} className="text-slate-300" />
              </Button>
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
      </div>
    </div>
  );
};

export default PlayerCard;
