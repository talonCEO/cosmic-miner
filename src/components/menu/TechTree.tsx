import React, { useRef } from 'react';
import { Shield, Zap, Brain, Star, TargetIcon, HandCoins, Trophy, CloudLightning, Gem, Sparkles, Rocket, Gauge, Compass, Flower, Flame } from 'lucide-react';
import { DialogClose, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useGame } from '@/context/GameContext';
import { useToast } from '@/hooks/use-toast';
import { Ability } from './types';
import { ScrollArea } from "@/components/ui/scroll-area";

const TechTree: React.FC = () => {
  const { state, unlockAbility } = useGame();
  const { toast } = useToast();
  const treeRef = useRef<HTMLDivElement>(null);

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

  // Check if any ability in Row 2 is unlocked
  const isRow2Unlocked = (abilitiesByRow[2] || []).some(ability => ability.unlocked);

  return (
    <>
      <DialogHeader className="p-4 border-b border-indigo-500/20">
        <DialogTitle className="text-center text-xl">Tech Tree</DialogTitle>
        <DialogDescription className="text-center text-slate-300">
          Spend skill points to unlock powerful abilities
        </DialogDescription>
      </DialogHeader>

      <ScrollArea className="h-[60vh]">
        <div
          className="flex flex-col p-4 relative"
          ref={treeRef}
          style={{
            background: 'url("data:image/svg+xml,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' width=\'20\' height=\'20\' viewBox=\'0 0 20 20\'%3E%3Cpath fill=\'none\' stroke=\'rgba(75,85,99,0.2)\' stroke-width=\'1\' d=\'M0 10h20M10 0v20\'/%3E%3C/svg%3E") repeat',
          }}
        >
          {/* Tech Tree Structure with Gradient Bands */}
          <div className="relative flex flex-col gap-4 items-center pb-8">
            {Object.keys(abilitiesByRow).sort((a, b) => Number(a) - Number(b)).map((rowKey) => {
              const rowNum = parseInt(rowKey);
              const abilities = abilitiesByRow[rowNum];
              // Row 1 only glows if Row 2 has an unlocked ability
              const isRowUnlocked = rowNum === 1 ? isRow2Unlocked : abilities.some(ability => ability.unlocked);

              return (
                <div
                  key={rowKey}
                  className="relative w-full row-container"
                  style={{
                    // Horizontal gradient band for each row
                    background: isRowUnlocked
                      ? 'linear-gradient(to bottom, rgba(6, 182, 212, 0.15), transparent)'
                      : 'linear-gradient(to bottom, rgba(6, 182, 212, 0.05), transparent)',
                    padding: '10px 0', // Space for the band
                    position: 'relative',
                  }}
                >
                  {/* Vertical connector to next row */}
                  {rowNum < 5 && (
                    <div
                      className="absolute left-1/2 -bottom-4 w-1 h-12"
                      style={{
                        background: isRowUnlocked && abilitiesByRow[rowNum + 1]?.some(a => a.unlocked)
                          ? 'linear-gradient(to bottom, rgba(6, 182, 212, 0.2), transparent)'
                          : 'linear-gradient(to bottom, rgba(6, 182, 212, 0.1), transparent)',
                        transform: 'translateX(-50%)',
                      }}
                    />
                  )}

                  <div className="flex justify-center gap-16 mt-10 relative z-10">
                    {abilities.map((ability) => (
                      <div
                        key={ability.id}
                        data-ability-id={ability.id}
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
                        <div
                          className={`mt-2 px-3 py-1 rounded-full text-xs font-semibold
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

          {/* Skill Points Display */}
          <div className="mb-6 flex flex-col items-center justify-center gap-2 bg-blue-600/20 p-3 rounded-lg border border-blue-500/30 relative z-10">
            <div className="flex items-center gap-2">
              <Gem className="text-blue-400" size={24} />
              <span className="text-blue-300 font-semibold text-xl">{state.skillPoints} Skill Points</span>
            </div>
            <p className="text-xs text-blue-300 mt-1 text-center">
              Skill Points are earned from unlocking achievements, hiring managers, discovering artifacts, and reaching upgrade milestones.
            </p>
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
