
import React, { useState } from 'react';
import { useGame } from '@/context/GameContext';
import { Gem } from 'lucide-react';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"

interface PerkProps {
  perk: {
    id: string;
    name: string;
    description: string;
    cost: number;
    unlocked?: boolean;
    category?: string;
    effect: {
      type: string;
      value: number;
    };
  };
  parentId: string;
  onUnlock: (perkId: string, parentId: string) => void;
  disabled?: boolean;
  icon?: React.ReactNode;
}

const PerkButton: React.FC<PerkProps> = ({ perk, parentId, onUnlock, disabled = false, icon }) => {
  const { state } = useGame();
  const [isTooltipOpen, setIsTooltipOpen] = useState(false);
  const canAfford = state.skillPoints >= perk.cost;
  const isUnlocked = state.unlockedPerks.includes(perk.id) || perk.unlocked;
  
  // Default icon if none provided
  const perkIcon = icon || <Gem size={16} className="text-purple-400" />;
  
  const handleClick = () => {
    // Handle unlock action if conditions are met
    if (disabled || isUnlocked || !canAfford) {
      // If can't unlock, just toggle tooltip
      setIsTooltipOpen(prev => !prev);
    } else {
      // If can unlock, perform unlock
      onUnlock(perk.id, parentId);
    }
  };
  
  // Determine whether this is a manager or artifact perk for coloring
  const isManagerPerk = parentId.includes("manager");
  const borderColor = isManagerPerk ? 'border-indigo-500' : 'border-purple-500';
  const hoverBgColor = isManagerPerk ? 'hover:bg-indigo-700/30' : 'hover:bg-purple-700/30';
  const activeBgColor = isManagerPerk ? 'bg-indigo-500/20' : 'bg-purple-500/20';
  const disabledBorderColor = 'border-slate-700/40';
  
  return (
    <TooltipProvider>
      <Tooltip open={isTooltipOpen} onOpenChange={setIsTooltipOpen}>
        <TooltipTrigger asChild>
          <button
            onClick={handleClick}
            className={`w-9 h-9 rounded-full flex items-center justify-center mb-2 transition-all
              ${isUnlocked
                ? `${activeBgColor} border-2 ${borderColor} opacity-100`
                : disabled
                  ? 'bg-slate-800/40 border-2 border-slate-700/40 cursor-not-allowed opacity-50'
                  : canAfford
                    ? `bg-slate-800/40 border-2 ${isManagerPerk ? 'border-indigo-500/40' : 'border-purple-500/40'} ${hoverBgColor} opacity-100`
                    : 'bg-slate-800/40 border-2 border-slate-600/40 cursor-not-allowed opacity-75'
              }`}
          >
            {perkIcon}
          </button>
        </TooltipTrigger>
        <TooltipContent 
          side="top" 
          className="bg-slate-800 border-slate-700 p-2 w-48"
        >
          <div className="space-y-1">
            <p className="font-semibold text-white">{perk.name}</p>
            <p className="text-xs text-slate-300">{perk.description}</p>
            {!isUnlocked && (
              <p className={`text-xs mt-1 ${canAfford ? 'text-green-400' : 'text-red-400'}`}>
                Cost: {perk.cost} skill points
              </p>
            )}
            {isUnlocked && (
              <p className={`text-xs ${isManagerPerk ? 'text-indigo-400' : 'text-purple-400'}`}>Unlocked</p>
            )}
          </div>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};

export default PerkButton;
