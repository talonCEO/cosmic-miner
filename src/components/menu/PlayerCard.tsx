
import React, { useState } from 'react';
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Edit2, Check, UserCircle, Key, Clock, Coins, Gem, Trophy, List, Layers } from 'lucide-react';

interface PlayerCardProps {
  playerName: string;
  playerRank: string;
  playerLevel: number;
  playerExp: number;
  playerMaxExp: number;
  uniqueId: string;
  playTime: string;
  coins: number;
  gems: number;
  essence: number;
  prestigeCount: number;
  leaderboardPlace: number;
  onNameChange: (newName: string) => void;
}

const PlayerCard: React.FC<PlayerCardProps> = ({
  playerName,
  playerRank,
  playerLevel,
  playerExp,
  playerMaxExp,
  uniqueId,
  playTime,
  coins,
  gems,
  essence,
  prestigeCount,
  leaderboardPlace,
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
    <div className="bg-indigo-600/20 rounded-lg p-4 border border-indigo-500/30 h-full flex flex-col">
      <div className="flex items-start mb-4">
        <Avatar className="h-24 w-24 border-2 border-amber-500/50">
          <AvatarImage src="/placeholder.svg" alt="Player avatar" />
          <AvatarFallback className="bg-indigo-700/50 text-white text-lg">
            {playerName.substring(0, 2).toUpperCase()}
          </AvatarFallback>
        </Avatar>
        
        <div className="ml-4 flex-1">
          {isEditing ? (
            <div className="flex items-center gap-2 mb-2">
              <Input 
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="h-9 text-white bg-indigo-700/50 border-indigo-500"
                maxLength={15}
              />
              <Button 
                size="icon" 
                variant="ghost" 
                className="h-9 w-9 p-0"
                onClick={handleSaveName}
              >
                <Check size={16} className="text-green-400" />
              </Button>
            </div>
          ) : (
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-lg font-semibold text-white">{playerName}</h3>
              <Button 
                size="icon" 
                variant="ghost"
                className="h-8 w-8 p-0"
                onClick={() => setIsEditing(true)}
              >
                <Edit2 size={16} className="text-slate-300" />
              </Button>
            </div>
          )}
          
          <div className="flex items-center gap-2 mb-2">
            <div className="bg-gradient-to-r from-purple-600 to-indigo-600 text-white px-2 py-1 rounded font-medium">
              {playerRank}
            </div>
            <div className="text-white font-medium">
              Level {playerLevel}
            </div>
          </div>
          
          <div className="space-y-1 mb-3">
            <div className="flex justify-between text-xs text-slate-300">
              <span>XP</span>
              <span>{playerExp}/{playerMaxExp}</span>
            </div>
            <Progress value={expPercentage} className="h-2 bg-slate-700/50" indicatorClassName="bg-gradient-to-r from-amber-500 to-yellow-500" />
          </div>
        </div>
      </div>
      
      <div className="grid grid-cols-2 gap-4 mt-1">
        <div className="flex items-center gap-2 p-2 bg-indigo-700/20 rounded-md border border-indigo-600/30">
          <Key size={18} className="text-amber-400" />
          <div>
            <div className="text-xs text-slate-300">Player ID</div>
            <div className="text-sm font-medium text-white">{uniqueId}</div>
          </div>
        </div>
        
        <div className="flex items-center gap-2 p-2 bg-indigo-700/20 rounded-md border border-indigo-600/30">
          <Clock size={18} className="text-blue-400" />
          <div>
            <div className="text-xs text-slate-300">Play Time</div>
            <div className="text-sm font-medium text-white">{playTime}</div>
          </div>
        </div>
        
        <div className="flex items-center gap-2 p-2 bg-indigo-700/20 rounded-md border border-indigo-600/30">
          <Coins size={18} className="text-yellow-400" />
          <div>
            <div className="text-xs text-slate-300">Coins</div>
            <div className="text-sm font-medium text-white">{coins.toLocaleString()}</div>
          </div>
        </div>
        
        <div className="flex items-center gap-2 p-2 bg-indigo-700/20 rounded-md border border-indigo-600/30">
          <Gem size={18} className="text-purple-400" />
          <div>
            <div className="text-xs text-slate-300">Gems</div>
            <div className="text-sm font-medium text-white">{gems.toLocaleString()}</div>
          </div>
        </div>
        
        <div className="flex items-center gap-2 p-2 bg-indigo-700/20 rounded-md border border-indigo-600/30">
          <Layers size={18} className="text-green-400" />
          <div>
            <div className="text-xs text-slate-300">Essence</div>
            <div className="text-sm font-medium text-white">{essence.toLocaleString()}</div>
          </div>
        </div>
        
        <div className="flex items-center gap-2 p-2 bg-indigo-700/20 rounded-md border border-indigo-600/30">
          <Trophy size={18} className="text-amber-400" />
          <div>
            <div className="text-xs text-slate-300">Prestige</div>
            <div className="text-sm font-medium text-white">{prestigeCount}</div>
          </div>
        </div>
        
        <div className="flex items-center gap-2 p-2 bg-indigo-700/20 rounded-md border border-indigo-600/30 col-span-2">
          <List size={18} className="text-indigo-400" />
          <div>
            <div className="text-xs text-slate-300">Leaderboard Rank</div>
            <div className="text-sm font-medium text-white">#{leaderboardPlace}</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PlayerCard;
