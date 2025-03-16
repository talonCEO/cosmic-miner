
import React, { useState, useEffect } from 'react';
import { useGame } from '@/context/GameContext';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Lock } from 'lucide-react';
import Perk1Icon from '@/assets/images/icons/perk1.png';
import Perk2Icon from '@/assets/images/icons/perk2.png';
import Perk3Icon from '@/assets/images/icons/perk3.png';

export interface PerkProps {
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
  const [tooltipTimer, setTooltipTimer] = useState<NodeJS.Timeout | null>(null);
  const canAfford = state.skillPoints >= perk.cost;
  const isUnlocked = state.unlockedPerks.includes(perk.id) || perk.unlocked;
  
  const isManagerPerk = parentId.includes("manager");
  const borderColor = isManagerPerk ? 'border-indigo-500' : 'border-purple-500';
  const hoverBgColor = isManagerPerk ? 'hover:bg-indigo-700/30' : 'hover:bg-purple-700/30';
  const activeBgColor = isManagerPerk ? 'bg-indigo-500/20' : 'bg-purple-500/20';
  
  const getPerkIcon = () => {
    if (icon) return icon;
    switch (perk.cost) {
      case 3:
        return <img src={Perk1Icon} alt="Perk 1" className="w-4 h-4" />;
      case 6:
        return <img src={Perk2Icon} alt="Perk 2" className="w-4 h-4" />;
      case 12:
        return <img src={Perk3Icon} alt="Perk 3" className="w-4 h-4" />;
      default:
        return <img src={Perk1Icon} alt="Default Perk" className="w-4 h-4" />; // Fallback
    }
  };
  
  useEffect(() => {
    return () => {
      if (tooltipTimer) clearTimeout(tooltipTimer);
    };
  }, [tooltipTimer]);
  
  const handleClick = () => {
    setIsTooltipOpen(true);
    if (tooltipTimer) clearTimeout(tooltipTimer);
    const timer = setTimeout(() => {
      setIsTooltipOpen(false);
    }, 5000);
    setTooltipTimer(timer);
    
    if (!(disabled || isUnlocked || !canAfford)) {
      onUnlock(perk.id, parentId);
    }
  };
  
  const perkIcon = getPerkIcon();
  
  return (
    <TooltipProvider>
      <Tooltip open={isTooltipOpen} onOpenChange={setIsTooltipOpen}>
        <TooltipTrigger asChild>
          <button
            onClick={handleClick}
            className={`w-9 h-9 rounded-full flex items-center justify-center mb-2 transition-all relative
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
            {!isUnlocked && (
              <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-40 rounded-full">
                <Lock className="w-3.5 h-3.5 text-gray-400" />
              </div>
            )}
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
