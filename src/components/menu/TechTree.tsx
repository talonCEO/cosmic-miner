
import React from 'react';
import { Shield, Zap, Brain, Star, TargetIcon, HandCoins, Trophy, CloudLightning, Gem } from 'lucide-react';
import { DialogClose, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useGame } from '@/context/GameContext';
import { useToast } from '@/components/ui/use-toast';
import { Ability } from './types';
import { ScrollArea } from "@/components/ui/scroll-area";

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
      
      <ScrollArea className="h-[60vh]">
        <div className="flex flex-col p-4 relative">
          {/* Skill Points Display */}
          <div className="mb-6 flex items-center justify-center gap-2 bg-blue-600/20 p-3 rounded-lg border border-blue-500/30">
            <Gem className="text-blue-400" size={24} />
            <span className="text-blue-300 font-semibold text-xl">{state.skillPoints} Skill Points</span>
          </div>
          
          {/* Tech Tree Structure */}
          <div className="relative flex flex-col gap-16 items-center pb-8">
            {/* Render abilities by row */}
            {Object.keys(abilitiesByRow).sort((a, b) => Number(a) - Number(b)).map((rowKey) => {
              const rowNum = parseInt(rowKey);
              const abilities = abilitiesByRow[rowNum];
              
              return (
                <div key={rowKey} className="relative w-full">
                  {/* Tier Label - Moved up to be in line with arrows, except for tier 1 */}
                  <div className="absolute left-0 top-0 h-full flex items-center">
                    <div className={`text-4xl font-bold opacity-25 text-slate-500 ${rowNum !== 1 ? '-translate-y-8' : ''}`}>
                      Tier {rowNum}
                    </div>
                  </div>
                  
                  {/* Connection lines to parent abilities */}
                  {rowNum > 1 && abilities.map((ability) => {
                    // Only show connection line for the middle ability (column 2)
                    if (ability.column !== 2) return null;
                    
                    return ability.requiredAbilities.map(requiredId => {
                      const requiredAbility = state.abilities.find(a => a.id === requiredId);
                      if (!requiredAbility) return null;
                      
                      return (
                        <div 
                          key={`${ability.id}-${requiredId}`}
                          className={`absolute left-1/2 top-0 w-0.5 h-16 -translate-y-full
                            ${ability.unlocked ? 'bg-indigo-400' : 'bg-indigo-400/30'}`}
                          style={{
                            transform: `translateX(0) translateY(-100%)`,
                          }}
                        >
                          <div 
                            className="absolute -bottom-0.5 left-1/2 transform -translate-x-1/2 w-0 h-0"
                            style={{
                              borderLeft: '6px solid transparent',
                              borderRight: '6px solid transparent',
                              borderTop: ability.unlocked 
                                ? '6px solid rgba(129, 140, 248, 1)' 
                                : '6px solid rgba(129, 140, 248, 0.3)',
                            }}
                          />
                        </div>
                      );
                    });
                  })}
                  
                  {/* Ability boxes - 3 abilities per row maximum */}
                  <div className="flex justify-center gap-16 mt-10">
                    {abilities.map((ability) => (
                      <div 
                        key={ability.id}
                        style={{ opacity: ability.unlocked ? 1 : 0.5 }}
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
                          {ability.icon}
                          {canUnlockAbility(ability) && (
                            <div className="absolute -top-1 -right-1 w-5 h-5 bg-green-500 rounded-full flex items-center justify-center">
                              <span className="text-xs text-white">+</span>
                            </div>
                          )}
                        </button>
                        <h3 className="text-sm mt-2 font-medium text-center">{ability.name}</h3>
                        <p className="text-xs text-center text-slate-300 mt-1 max-w-48">{ability.description}</p>
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
                </div>
              );
            })}
          </div>
        </div>
      </ScrollArea>
      
      <div className="p-4 border-t border-indigo-500/20">
        <DialogClose className="w-full bg-slate-700/80 text-slate-200 py-3 px-4 rounded-lg font-medium hover:bg-slate-600 transition-colors">
          Back
        </DialogClose>
      </div>
    </>
  );
};

export default TechTree;
