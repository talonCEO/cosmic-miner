
import React, { useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { getTitleById } from '@/data/playerProgressionData';
import { Edit, X, Check, Gem } from 'lucide-react';
import { formatNumber } from '@/utils/gameLogic';
import { toast } from "sonner";

export interface PlayerCardProps {
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
  hasChangedUsername: boolean;
  onTitleChange: (titleId: string) => Promise<void>;
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
  hasChangedUsername,
  onTitleChange
}) => {
  const [isEditingName, setIsEditingName] = useState(false);
  const [newName, setNewName] = useState(playerName);
  
  // Calculate progress percentage
  const progressPercentage = Math.min(100, (playerExp / playerMaxExp) * 100);
  
  // Get the title display name from the title ID
  const titleDisplay = getTitleById(playerTitle)?.name || 'Space Pilot';
  
  // Handle name edit form submission
  const handleSubmitName = (e: React.FormEvent) => {
    e.preventDefault();
    if (newName.trim() !== playerName) {
      onNameChange(newName.trim());
    }
    setIsEditingName(false);
  };
  
  // Handle cancel edit
  const handleCancelEdit = () => {
    setNewName(playerName);
    setIsEditingName(false);
  };
  
  return (
    <div className="bg-slate-800 rounded-lg p-4 shadow-md">
      {/* Player header with level and name */}
      <div className="flex justify-between items-center mb-3">
        <div className="flex items-center">
          <span className="inline-flex justify-center items-center w-7 h-7 bg-indigo-600 text-white font-semibold rounded-full text-sm">
            {playerLevel}
          </span>
          
          {isEditingName ? (
            <form onSubmit={handleSubmitName} className="flex ml-2">
              <input
                type="text"
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                className="bg-slate-700 border border-slate-600 rounded px-2 py-1 text-white text-sm w-32"
                autoFocus
                maxLength={20}
              />
              <button 
                type="submit" 
                className="ml-1 text-green-400 hover:text-green-300"
                title="Save name"
              >
                <Check size={18} />
              </button>
              <button 
                type="button" 
                onClick={handleCancelEdit}
                className="ml-1 text-red-400 hover:text-red-300"
                title="Cancel"
              >
                <X size={18} />
              </button>
            </form>
          ) : (
            <div className="flex items-center ml-2">
              <h3 className="font-semibold text-white">
                {playerName}
              </h3>
              <button 
                onClick={() => setIsEditingName(true)}
                className="ml-1 text-slate-400 hover:text-white"
                title={hasChangedUsername ? "Change name (costs 200 gems)" : "Change name (first change free)"}
              >
                <Edit size={14} />
              </button>
              {hasChangedUsername && (
                <div className="ml-1 flex items-center text-xs text-slate-500">
                  <Gem className="h-3 w-3 mr-0.5 text-purple-400" />
                  <span>200</span>
                </div>
              )}
            </div>
          )}
        </div>
        
        <Badge variant="outline" className="px-2 py-1 text-xs border-indigo-500/30 text-indigo-300">
          ID: {userId}
        </Badge>
      </div>
      
      {/* Title badge */}
      <div className="mb-4">
        <button 
          onClick={() => onTitleChange(playerTitle)}
          className="inline-block px-3 py-1 bg-indigo-900/40 text-indigo-300 text-xs rounded-full border border-indigo-700/30 hover:bg-indigo-800/40 transition-colors"
        >
          {titleDisplay}
        </button>
      </div>
      
      {/* XP progress bar */}
      <div className="mb-4">
        <div className="flex justify-between items-center text-xs mb-1">
          <span className="text-slate-400">Level {playerLevel} Progress</span>
          <span className="text-slate-400">{Math.round(playerExp).toLocaleString()} / {playerMaxExp.toLocaleString()} XP</span>
        </div>
        <div className="w-full bg-slate-700 rounded-full h-2 overflow-hidden">
          <div 
            className="bg-gradient-to-r from-indigo-500 to-purple-500 h-full"
            style={{ width: `${progressPercentage}%` }}
          />
        </div>
      </div>
      
      {/* Currency overview */}
      <div className="grid grid-cols-3 gap-2 text-center">
        <div className="bg-slate-700/50 rounded p-2">
          <p className="text-xs text-slate-400 mb-1">Coins</p>
          <p className="font-medium text-green-300">{formatNumber(coins)}</p>
        </div>
        <div className="bg-slate-700/50 rounded p-2">
          <p className="text-xs text-slate-400 mb-1">Gems</p>
          <p className="font-medium text-purple-300">{formatNumber(gems)}</p>
        </div>
        <div className="bg-slate-700/50 rounded p-2">
          <p className="text-xs text-slate-400 mb-1">Essence</p>
          <p className="font-medium text-blue-300">{formatNumber(essence)}</p>
        </div>
      </div>
    </div>
  );
};

export default PlayerCard;
