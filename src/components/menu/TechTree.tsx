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

  // Render pathway lines
  const renderPathways = () => {
    const paths: JSX.Element[] = [];
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

    // Row 1 (center) to Row 2 (center)
    const row1Center = abilitiesByRow[1]?.[Math.floor(abilitiesByRow[1].length / 2)];
    const row2Center = abilitiesByRow[2]?.[Math.floor(abilitiesByRow[2].length / 2)];
    if (row1Center && row2Center) {
      const start = getNodePosition(row1Center.id);
      const end = getNodePosition(row2Center.id);
      if (start && end) {
        paths.push(
          <path
            key="row1-to-row2"
            d={`M${start.x},${start.y} L${end.x},${end.y}`}
            stroke="#A5B4FC" // Soft indigo
            strokeWidth="1.5"
            strokeDasharray="4 4"
            opacity="0.3"
            fill="none"
            className="animate-pulse-slow"
          />
        );
      }
    }

    // Row 2 downward branching
    for (let row = 2; row < 5; row++) {
      const currentRowAbilities = abilitiesByRow[row] || [];
      const nextRowAbilities = abilitiesByRow[row + 1] || [];
      currentRowAbilities.forEach((currentAbility, index) => {
        nextRowAbilities.forEach((nextAbility, nextIndex) => {
          // Simple branching logic: connect to closest or same-index ability
          if (Math.abs(index - nextIndex) <= 1 || nextAbility.requiredAbilities.includes(currentAbility.id)) {
            const start = getNodePosition(currentAbility.id);
            const end = getNodePosition(nextAbility.id);
            if (start && end) {
              paths.push(
                <path
                  key={`${currentAbility.id}-${nextAbility.id}`}
                  d={`M${start.x},${start.y} Q${start.x},${(start.y + end.y) / 2} ${end.x},${end.y}`}
                  stroke="#A5B4FC"
                  strokeWidth="1.5"
                  strokeDasharray="4 4"
                  opacity="0.3"
                  fill="none"
                  className="animate-pulse-slow"
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
        <div
          className="flex flex-col p-4 relative"
          ref={treeRef}
          style={{
            background: 'radial-gradient(circle at center, rgba(55, 65, 81, 0.9) 0%, rgba(17, 24, 39, 1) 70%)',
          }}
        >
          {/* SVG for Pathways */}
          <svg
            className="absolute top-0 left-0 w-full h-full pointer-events-none"
            style={{ zIndex: 1 }}
          >
            {renderPathways()}
            {/* Star-like dots at ability nodes */}
            {Object.values(abilitiesByRow).flat().map((ability) => {
              const pos = treeRef.current?.querySelector(`[data-ability-id="${ability.id}"]`)?.getBoundingClientRect();
              const containerRect = treeRef.current?.getBoundingClientRect();
              if (pos && containerRect) {
                const x = pos.left - containerRect.left + pos.width / 2;
                const y = pos.top - containerRect.top + pos.height / 2;
                return (
                  <circle
                    key={`dot-${ability.id}`}
                    cx={x}
                    cy={y}
                    r="2"
                    fill="#A5B4FC"
                    opacity="0.5"
                  />
                );
              }
              return null;
            })}
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

      {/* Custom CSS for animation */}
      <style jsx>{`
        .animate-pulse-slow {
          animation: pulse 4s infinite ease-in-out;
        }
        @keyframes pulse {
          0%, 100% { opacity: 0.3; }
          50% { opacity: 0.6; }
        }
      `}</style>
    </>
  );
};

export default TechTree;
