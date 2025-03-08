
import React from 'react';
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
  const canAfford = state.skillPoints >= perk.cost;
  const isUnlocked = state.unlockedPerks.includes(perk.id) || perk.unlocked;
  
  // Default icon if none provided
  const perkIcon = icon || <Gem size={16} className="text-purple-400" />;
  
  const handleClick = () => {
    if (disabled || isUnlocked || !canAfford) return;
    onUnlock(perk.id, parentId);
  };
  
  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <button
            onClick={handleClick}
            className={`w-9 h-9 rounded-full flex items-center justify-center mb-2 transition-all
              ${isUnlocked
                ? 'bg-purple-500/20 border-2 border-purple-500 opacity-100'
                : disabled
                  ? 'bg-slate-800/40 border-2 border-slate-700/40 cursor-not-allowed opacity-50'
                  : canAfford
                    ? 'bg-purple-800/40 border-2 border-purple-500/40 hover:bg-purple-700/30 opacity-100'
                    : 'bg-slate-800/40 border-2 border-slate-600/40 cursor-not-allowed opacity-75'
              }`}
            disabled={disabled || isUnlocked || !canAfford}
          >
            {perkIcon}
          </button>
        </TooltipTrigger>
        <TooltipContent side="top" className="bg-slate-800 border-slate-700 p-2 w-48">
          <div className="space-y-1">
            <p className="font-semibold text-white">{perk.name}</p>
            <p className="text-xs text-slate-300">{perk.description}</p>
            {!isUnlocked && (
              <p className={`text-xs mt-1 ${canAfford ? 'text-green-400' : 'text-red-400'}`}>
                Cost: {perk.cost} skill points
              </p>
            )}
            {isUnlocked && (
              <p className="text-xs text-purple-400">Unlocked</p>
            )}
          </div>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};

export default PerkButton;
