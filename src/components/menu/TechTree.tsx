import React, { useRef, useEffect } from 'react';
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

  // Calculate SVG paths for flow diagram
  const renderFlowDiagram = () => {
    const paths: JSX.Element[] = [];
    const rowElements = treeRef.current?.querySelectorAll('.row-container');

    if (!rowElements) return null;

    // Map ability IDs to their DOM positions
    const getNodePosition = (abilityId: string) => {
      const node = treeRef.current?.querySelector(`[data-ability-id="${abilityId}"]`);
      if (!node) return null;
      const rect = node.getBoundingClientRect();
      const containerRect = treeRef.current?.getBoundingClientRect();
      return {
        x: rect.left - (containerRect?.left || 0) + rect.width / 2,
        y: rect.top - (containerRect?.top || 0) + rect.height / 2,
      };
    };

    // Draw paths from Row 1 to Row 2, and Row 2 downward
    const row1Abilities = abilitiesByRow[1] || [];
    const row2Abilities = abilitiesByRow[2] || [];

    // Row 1 to Row 2 connections
    row1Abilities.forEach((row1Ability) => {
      row2Abilities.forEach((row2Ability) => {
        if (row2Ability.requiredAbilities.includes(row1Ability.id)) {
          const start = getNodePosition(row1Ability.id);
          const end = getNodePosition(row2Ability.id);
          if (start && end) {
            paths.push(
              <path
                key={`${row1Ability.id}-${row2Ability.id}`}
                d={`M${start.x},${start.y} L${end.x},${end.y}`}
                stroke="#60A5FA" // Light blue
                strokeWidth="2"
                opacity="0.2"
                fill="none"
              />
            );
          }
        }
      });
    });

    // Row 2 to subsequent rows
    for (let row = 2; row < 5; row++) {
      const currentRowAbilities = abilitiesByRow[row] || [];
      const nextRowAbilities = abilitiesByRow[row + 1] || [];
      currentRowAbilities.forEach((currentAbility) => {
        nextRowAbilities.forEach((nextAbility) => {
          if (nextAbility.requiredAbilities.includes(currentAbility.id)) {
            const start = getNodePosition(currentAbility.id);
            const end = getNodePosition(nextAbility.id);
            if (start && end) {
              paths.push(
                <path
                  key={`${currentAbility.id}-${nextAbility.id}`}
                  d={`M${start.x},${start.y} L${end.x},${end.y}`}
                  stroke="#60A5FA"
                  strokeWidth="2"
                  opacity="0.2"
                  fill="none"
                />
              );
            }
          }
        });
      });
    }

    return paths;
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
        <div className="flex flex-col p-4 relative" ref={treeRef}>
          {/* SVG Background for Flow Diagram */}
          <svg
            className="absolute top-0 left-0 w-full h-full pointer-events-none"
            style={{ zIndex: 0 }}
          >
            {renderFlowDiagram()}
          </svg>

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

          {/* Tech Tree Structure */}
          <div className="relative flex flex-col gap-4 items-center pb-8 z-10">
            {Object.keys(abilitiesByRow).sort((a, b) => Number(a) - Number(b)).map((rowKey) => {
              const rowNum = parseInt(rowKey);
              const abilities = abilitiesByRow[rowNum];

              return (
                <div key={rowKey} className="relative w-full row-container">
                  <div className="flex justify-center gap-16 mt-10">
                    {abilities.map((ability) => (
                      <div
                        key={ability.id}
                        data-ability-id={ability.id} // Add identifier for position calculation
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
