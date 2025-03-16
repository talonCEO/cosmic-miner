import React, { useState } from 'react';
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Progress } from "@/components/ui/progress";
import { Check, Edit2, Trophy, Gem, Coins, Sparkles } from 'lucide-react';
import { motion } from 'framer-motion';
import { getTitleById } from '@/data/playerProgressionData';

export interface PlayerCardProps {
  playerName: string;
  playerTitle: string;
  playerLevel: number;
  playerExp: number;
  playerMaxExp: number;
  coins: number;
  gems?: number; // Make gems optional
  essence?: number; // Make essence optional
  onNameChange?: (newName: string) => void;
  userId?: string;
}

const PlayerCard: React.FC<PlayerCardProps> = ({
  playerName,
  playerTitle,
  playerLevel,
  playerExp,
  playerMaxExp,
  coins,
  gems = 0,
  essence = 0,
  onNameChange,
  userId
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [localName, setLocalName] = useState(playerName);
  
  const handleNameEdit = () => {
    setIsEditing(true);
  };
  
  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setLocalName(e.target.value);
  };
  
  const handleNameSubmit = () => {
    if (onNameChange) {
      onNameChange(localName);
    }
    setIsEditing(false);
  };
  
  const titleData = getTitleById(playerTitle);
  const titleName = titleData ? titleData.name : "Space Explorer";
  
  return (
    <div className="bg-indigo-600/10 rounded-lg border border-indigo-500/20 p-4">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center">
          <Avatar className="h-12 w-12 mr-3">
            <AvatarImage src="/astronaut.png" alt={playerName} />
            <AvatarFallback className="bg-indigo-800/80 text-white text-sm">
              {playerName.substring(0, 2).toUpperCase()}
            </AvatarFallback>
          </Avatar>
          <div>
            {isEditing ? (
              <div className="flex items-center">
                <input
                  type="text"
                  value={localName}
                  onChange={handleNameChange}
                  className="bg-slate-800 border border-slate-600 rounded-md px-2 py-1 text-sm text-white mr-2"
                />
                <button
                  onClick={handleNameSubmit}
                  className="bg-indigo-500 hover:bg-indigo-600 text-white rounded-md px-3 py-1 text-xs"
                >
                  Save
                </button>
              </div>
            ) : (
              <div className="flex items-center">
                <h3 className="text-white font-medium mr-2">{localName}</h3>
                <button onClick={handleNameEdit} className="hover:text-indigo-300 transition-colors">
                  <Edit2 size={14} />
                </button>
              </div>
            )}
            <p className="text-gray-400 text-sm">{titleName} (Level {playerLevel})</p>
          </div>
        </div>
        {userId && (
          <div className="text-gray-500 text-xs">UID: {userId}</div>
        )}
      </div>
      
      <div className="mb-4">
        <div className="flex items-center justify-between text-xs text-gray-400 mb-1">
          <span>Level Progress</span>
          <span>{playerExp} / {playerMaxExp}</span>
        </div>
        <Progress value={(playerExp / playerMaxExp) * 100} className="h-2 bg-indigo-500/20" />
      </div>
      
      <div className="grid grid-cols-3 gap-2">
        <div className="flex items-center bg-indigo-500/10 rounded-md p-2">
          <Coins size={16} className="text-yellow-400 mr-1" />
          <span className="text-sm text-white">{coins.toLocaleString()}</span>
        </div>
        
        <div className="flex items-center bg-indigo-500/10 rounded-md p-2">
          <Gem size={16} className="text-purple-400 mr-1" />
          <span className="text-sm text-white">{gems.toLocaleString()}</span>
        </div>
        
        <div className="flex items-center bg-indigo-500/10 rounded-md p-2">
          <Sparkles size={16} className="text-amber-400 mr-1" />
          <span className="text-sm text-white">{essence.toLocaleString()}</span>
        </div>
      </div>
    </div>
  );
};

export default PlayerCard;
