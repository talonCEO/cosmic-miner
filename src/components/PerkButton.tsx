
import React from 'react';
import { Perk } from '@/utils/types';
import { useGame } from '@/context/GameContext';
import { 
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Sparkles } from 'lucide-react';

interface PerkButtonProps {
  perk: Perk;
  parentId: string;
  onUnlock: (perkId: string, parentId: string) => void;
}

const PerkButton: React.FC<PerkButtonProps> = ({ perk, parentId, onUnlock }) => {
  const { state } = useGame();
  const canUnlock = state.skillPoints >= perk.cost && !perk.unlocked;
  
  const handleClick = () => {
    if (canUnlock) {
      onUnlock(perk.id, parentId);
    }
  };
  
  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <button 
            onClick={handleClick}
            className={`w-8 h-8 flex items-center justify-center rounded-full mb-1
              ${perk.unlocked 
                ? 'bg-green-500/20 border border-green-500/50 text-green-300' 
                : 'bg-slate-700/30 border border-slate-600/50 text-slate-400 opacity-50 hover:opacity-70'}`}
          >
            <div className="text-lg">{perk.icon}</div>
            {!perk.unlocked && (
              <div className="absolute bottom-0 right-0 bg-indigo-800 rounded-full w-4 h-4 flex items-center justify-center text-[8px] font-bold text-white">
                {perk.cost}
              </div>
            )}
          </button>
        </TooltipTrigger>
        <TooltipContent side="left" className="max-w-[200px] p-2 text-xs">
          <div>
            <div className="font-bold">{perk.name}</div>
            <div className="text-slate-300">{perk.description}</div>
            {!perk.unlocked && (
              <div className="mt-1 flex items-center text-[10px] font-medium text-indigo-300">
                <Sparkles size={10} className="mr-1" />
                Cost: {perk.cost} skill points
                {state.skillPoints < perk.cost && (
                  <span className="text-red-300 ml-1">
                    (Need {perk.cost - state.skillPoints} more)
                  </span>
                )}
              </div>
            )}
          </div>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};

export default PerkButton;
