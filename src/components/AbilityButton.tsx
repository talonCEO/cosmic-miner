
import React from 'react';
import { Sparkles } from 'lucide-react';
import { 
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface AbilityButtonProps {
  id: string;
  name: string;
  description: string;
  cost: number;
  icon: React.ReactNode;
  unlocked: boolean;
  onUnlock: (id: string) => void;
  canAfford: boolean;
}

const AbilityButton: React.FC<AbilityButtonProps> = ({
  id,
  name,
  description,
  cost,
  icon,
  unlocked,
  onUnlock,
  canAfford
}) => {
  const handleClick = () => {
    if (!unlocked && canAfford) {
      onUnlock(id);
    }
  };

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <button
            onClick={handleClick}
            className={`relative rounded-full w-8 h-8 flex items-center justify-center ${
              unlocked 
                ? 'bg-indigo-500/60 border border-indigo-300' 
                : canAfford
                  ? 'bg-green-500/60 border border-green-300 cursor-pointer'
                  : 'bg-slate-700/60 border border-slate-500 cursor-not-allowed'
            }`}
            style={{ opacity: unlocked ? 1 : 0.5 }}
          >
            {icon}
            
            {!unlocked && (
              <div className="absolute -bottom-1 -right-1 bg-slate-800/90 border border-slate-600 rounded-full w-4 h-4 flex items-center justify-center">
                <Sparkles size={8} className="text-yellow-300" />
                <span className="text-[6px] font-bold text-white">{cost}</span>
              </div>
            )}
          </button>
        </TooltipTrigger>
        <TooltipContent side="right" className="bg-slate-800 border border-slate-600 text-white max-w-56">
          <div>
            <p className="font-semibold text-sm">{name}</p>
            <p className="text-xs text-slate-300">{description}</p>
            {!unlocked && (
              <p className={`text-xs mt-1 font-semibold ${canAfford ? 'text-green-400' : 'text-red-400'}`}>
                {canAfford ? 'Click to unlock' : `Requires ${cost} skill points`}
              </p>
            )}
            {unlocked && (
              <p className="text-xs mt-1 font-semibold text-indigo-300">Unlocked</p>
            )}
          </div>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};

export default AbilityButton;
