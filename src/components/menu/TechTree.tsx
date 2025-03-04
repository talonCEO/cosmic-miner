
import React from 'react';
import { Droplet, ArrowDown } from 'lucide-react';
import { DialogClose, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useGame } from '@/context/GameContext';
import { useToast } from '@/components/ui/use-toast';

const TechTree: React.FC = () => {
  const { state, unlockAbility } = useGame();
  const { toast } = useToast();
  
  // Group abilities by row for easier rendering
  const abilitiesByRow = state.abilities.reduce((acc, ability) => {
    if (!acc[ability.row]) {
      acc[ability.row] = [];
    }
    acc[ability.row].push(ability);
    return acc;
  }, {} as Record<number, Ability[]>);

  // Check if an ability can be unlocked
  const canUnlockAbility = (ability: Ability): boolean => {
    if (ability.unlocked) return false;
    if (state.skillPoints < ability.cost) return false;
    
    // Check if all required abilities are unlocked
    return ability.requiredAbilities.every(requiredId => {
      const requiredAbility = state.abilities.find(a => a.id === requiredId);
      return requiredAbility && requiredAbility.unlocked;
    });
  };

  // Handle ability unlock
  const handleUnlockAbility = (abilityId: string, abilityName: string) => {
    const ability = state.abilities.find(a => a.id === abilityId);
    if (!ability || !canUnlockAbility(ability)) return;

    unlockAbility(abilityId);
    
    toast({
      title: `${abilityName} Unlocked!`,
      description: `${ability.description}`,
      variant: "default",
    });
  };

  return (
    <>
      <DialogHeader className="p-4 border-b border-indigo-500/20">
        <DialogTitle className="text-center text-xl">Tech Tree</DialogTitle>
        <DialogDescription className="text-center text-slate-300">
          Spend skill points to unlock powerful abilities
        </DialogDescription>
      </DialogHeader>
      
      <div className="flex flex-col p-4 h-[70vh] overflow-y-auto">
        {/* Skill Points Display */}
        <div className="mb-6 flex items-center justify-center gap-2 bg-blue-600/20 p-3 rounded-lg border border-blue-500/30">
          <Droplet className="text-blue-400" size={24} />
          <span className="text-blue-300 font-semibold text-xl">{state.skillPoints} Skill Points</span>
        </div>
        
        {/* Tech Tree Structure */}
        <div className="relative flex flex-col gap-8 items-center">
          {/* Render abilities by row */}
          {Object.keys(abilitiesByRow).map((row) => (
            <div key={row} className="flex justify-center gap-4 relative w-full">
              {/* Connection lines to parent abilities */}
              {parseInt(row) > 0 && (
                <div className="absolute top-0 left-0 w-full h-full pointer-events-none">
                  {abilitiesByRow[parseInt(row)].map(ability => {
                    return ability.requiredAbilities.map(requiredId => {
                      const requiredAbility = state.abilities.find(a => a.id === requiredId);
                      if (!requiredAbility) return null;
                      
                      // Calculate connection line position based on column values
                      // This is a simplified approach and might need adjustment based on actual layout
                      return (
                        <div 
                          key={`${ability.id}-${requiredId}`}
                          className="absolute transform -translate-y-8"
                          style={{
                            left: `${(ability.column * 20) + 10}%`,
                            top: '0',
                            height: '40px',
                            width: '1px',
                            background: ability.unlocked ? 'rgba(147, 197, 253, 0.8)' : 'rgba(147, 197, 253, 0.3)'
                          }}
                        >
                          <ArrowDown 
                            size={16} 
                            className="absolute -bottom-2 -left-2"
                            style={{
                              opacity: ability.unlocked ? 1 : 0.3,
                              color: ability.unlocked ? 'rgb(147, 197, 253)' : 'rgb(147, 197, 253)'
                            }}
                          />
                        </div>
                      );
                    });
                  })}
                </div>
              )}
              
              {/* Ability boxes */}
              {abilitiesByRow[parseInt(row)].sort((a, b) => a.column - b.column).map(ability => (
                <div 
                  key={ability.id}
                  style={{
                    opacity: ability.unlocked ? 1 : 0.5,
                    width: '18%',
                    position: 'relative'
                  }}
                  className="flex flex-col items-center"
                >
                  <button
                    onClick={() => canUnlockAbility(ability) && handleUnlockAbility(ability.id, ability.name)}
                    disabled={!canUnlockAbility(ability)}
                    className={`w-16 h-16 rounded-full flex items-center justify-center bg-opacity-20 border-2 relative
                      ${ability.unlocked 
                        ? 'bg-indigo-700 border-indigo-400 shadow-lg shadow-indigo-500/20' 
                        : canUnlockAbility(ability)
                          ? 'bg-green-700 border-green-400 shadow-lg shadow-green-500/20 cursor-pointer animate-pulse'
                          : 'bg-gray-700 border-gray-500 cursor-not-allowed'
                      }`}
                  >
                    <span className="text-2xl">{ability.icon}</span>
                    {canUnlockAbility(ability) && (
                      <div className="absolute -top-1 -right-1 w-5 h-5 bg-green-500 rounded-full flex items-center justify-center">
                        <span className="text-xs text-white">+</span>
                      </div>
                    )}
                  </button>
                  <h3 className="text-sm mt-2 font-medium text-center">{ability.name}</h3>
                  <p className="text-xs text-center text-slate-300 mt-1">{ability.description}</p>
                  <div className={`mt-2 px-3 py-1 rounded-full text-xs font-semibold
                    ${ability.unlocked
                      ? 'bg-indigo-900/50 text-indigo-200'
                      : canUnlockAbility(ability)
                        ? 'bg-green-800/50 text-green-200'
                        : 'bg-gray-800/50 text-gray-300'
                    }`}
                  >
                    {ability.unlocked ? 'Unlocked' : `${ability.cost} SP`}
                  </div>
                </div>
              ))}
            </div>
          ))}
        </div>
      </div>
      
      <div className="p-4 border-t border-indigo-500/20">
        <DialogClose className="w-full bg-slate-700/80 text-slate-200 py-3 px-4 rounded-lg font-medium hover:bg-slate-600 transition-colors">
          Back
        </DialogClose>
      </div>
    </>
  );
};

export default TechTree;
