
import React, { useState, useEffect } from 'react';
import { Perk } from '@/utils/types';
import { useGame } from '@/context/GameContext';
import { Sparkles } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';

interface PerkButtonProps {
  perk: Perk;
  parentId: string;
  onUnlock: (perkId: string, parentId: string) => void;
}

const PerkButton: React.FC<PerkButtonProps> = ({ perk, parentId, onUnlock }) => {
  const { state } = useGame();
  const canUnlock = state.skillPoints >= perk.cost && !perk.unlocked;
  const [showTooltip, setShowTooltip] = useState(false);
  const [tooltipTimer, setTooltipTimer] = useState<NodeJS.Timeout | null>(null);

  const handleShowTooltip = () => {
    if (tooltipTimer) {
      clearTimeout(tooltipTimer);
    }
    
    setShowTooltip(true);
    
    const timer = setTimeout(() => {
      setShowTooltip(false);
    }, 8000);
    
    setTooltipTimer(timer);
  };

  useEffect(() => {
    return () => {
      if (tooltipTimer) {
        clearTimeout(tooltipTimer);
      }
    };
  }, [tooltipTimer]);
  
  const handleClick = () => {
    if (canUnlock) {
      onUnlock(perk.id, parentId);
      toast.success(`Unlocked: ${perk.name}`);
    } else {
      handleShowTooltip();
      if (state.skillPoints < perk.cost) {
        toast.error(`Need ${perk.cost - state.skillPoints} more skill points!`);
      }
    }
  };
  
  // Format the effect description based on the type
  const getEffectDescription = () => {
    switch (perk.effect.type) {
      case 'elementBoost':
        if (perk.effect.elements && perk.effect.elements.length > 0) {
          const elementNames = perk.effect.elements.map(elementId => {
            const element = state.upgrades.find(u => u.id === elementId);
            return element ? element.name : 'Unknown Element';
          }).join(' and ');
          return `Increases ${elementNames} production by ${perk.effect.value * 100}%`;
        }
        return perk.description;
      default:
        return perk.description;
    }
  };
  
  return (
    <div className="relative">
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
      
      <AnimatePresence>
        {showTooltip && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            transition={{ duration: 0.3 }}
            className="absolute right-0 bottom-full -translate-x-full mb-2 z-50 w-[200px]"
          >
            <div className="bg-slate-800 text-slate-100 p-2 rounded-md shadow-lg border border-slate-700 text-xs">
              <div className="font-bold">{perk.name}</div>
              <div className="text-slate-300">{getEffectDescription()}</div>
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
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default PerkButton;
