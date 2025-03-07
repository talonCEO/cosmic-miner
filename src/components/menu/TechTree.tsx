import React, { useRef, useState } from 'react';
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
  // Track which abilities have just been unlocked to trigger burst
  const [justUnlocked, setJustUnlocked] = useState<string[]>([]);

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

  // Handle ability unlock with burst effect
  const handleUnlockAbility = (abilityId: string, abilityName: string) => {
    const ability = state.abilities.find(a => a.id === abilityId);
    if (!ability || !canUnlockAbility(ability)) return;

    unlockAbility(abilityId);
    // Add to justUnlocked to trigger burst, then remove after animation
    setJustUnlocked((prev) => [...prev, abilityId]);
    setTimeout(() => {
      setJustUnlocked((prev) => prev.filter((id) => id !== abilityId));
    }, 500); // Match animation duration (0.5s)
    toast({
      title: `${abilityName} Unlocked!`,
      description: `${ability.description}`,
      variant: "default",
    });
  };

  // Check if any ability in Row 2 is unlocked
  const isRow2Unlocked = (abilitiesByRow[2] || []).some(ability => ability.unlocked);

  // Render circuit-like pathways (straight lines)
  const renderCircuitPathways = () => {
    const paths: JSX.Element[] = [];
    const getNodePosition = (abilityId: string) => {
      const node = treeRef.current?.querySelector(`[data-ability-id="${abilityId}"]`);
      if (!node) return null;
      const rect = node.getBoundingClientRect();
      const containerRect = treeRef.current?.getBoundingClientRect();
      if (!containerRect) return null;
      return {
        x: rect.left - containerRect.left + rect.width / 2,
        y: rect.top - containerRect.top + rect.height / 2,
      };
    };

    // Connect Row 1 to Row 2
    const row1Abilities = abilitiesByRow[1] || [];
    const row2Abilities = abilitiesByRow[2] || [];
    row1Abilities.forEach((row1Ability) => {
      row2Abilities.forEach((row2Ability) => {
        if (row2Ability.requiredAbilities.includes(row1Ability.id) || Math.abs(row1Abilities.indexOf(row1Ability) - row2Abilities.indexOf(row2Ability)) <= 1) {
          const start = getNodePosition(row1Ability.id);
          const end = getNodePosition(row2Ability.id);
          if (start && end && row1Ability.unlocked && row2Ability.unlocked) {
            paths.push(
              <path
                key={`${row1Ability.id}-${row2Ability.id}`}
                d={`M${start.x},${start.y} L${end.x},${end.y}`}
                stroke="url(#circuitGradient)"
                strokeWidth="2"
                opacity="0.4"
                fill="none"
                className="animate-flow"
              />
            );
          }
        }
      });
    });

    // Connect subsequent rows, including Row 4 to Row 5
    for (let row = 2; row <= 5; row++) {
      const currentRowAbilities = abilitiesByRow[row] || [];
      const nextRowAbilities = abilitiesByRow[row + 1] || [];
      currentRowAbilities.forEach((currentAbility, currentIndex) => {
        nextRowAbilities.forEach((nextAbility, nextIndex) => {
          if (nextAbility.requiredAbilities.includes(currentAbility.id) || Math.abs(currentIndex - nextIndex) <= 1) {
            const start = getNodePosition(currentAbility.id);
            const end = getNodePosition(nextAbility.id);
            if (start && end && currentAbility.unlocked && nextAbility.unlocked) {
              paths.push(
                <path
                  key={`${currentAbility.id}-${nextAbility.id}`}
                  d={`M${start.x},${start.y} L${end.x},${end.y}`}
                  stroke="url(#circuitGradient)"
                  strokeWidth="2"
                  opacity="0.4"
                  fill="none"
                  className="animate-flow"
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
            background: 'url("data:image/svg+xml,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' width=\'20\' height=\'20\' viewBox=\'0 0 20 20\'%3E%3Cpath fill=\'none\' stroke=\'rgba(75,85,99,0.2)\' stroke-width=\'1\' d=\'M0 10h20M10 0v20\'/%3E%3C/svg%3E") repeat',
          }}
        >
          {/* SVG for Circuit Pathways */}
          <svg
            className="absolute top-0 left-0 w-full h-full pointer-events-none"
            style={{ zIndex: 1 }}
          >
            <defs>
              <linearGradient id="circuitGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" style={{ stopColor: '#06B6D4', stopOpacity: 0.8 }} />
                <stop offset="100%" style={{ stopColor: '#22D3EE', stopOpacity: 0.8 }} />
              </linearGradient>
            </defs>
            {renderCircuitPathways()}
            {/* Glowing node effects */}
            {Object.values(abilitiesByRow).flat().map((ability) => {
              const pos = treeRef.current?.querySelector(`[data-ability-id="${ability.id}"]`)?.getBoundingClientRect();
              const containerRect = treeRef.current?.getBoundingClientRect();
              const shouldShowCircle = ability.unlocked && (ability.row !== 1 || isRow2Unlocked);
              if (pos && containerRect && shouldShowCircle) {
                const x = pos.left - containerRect.left + pos.width / 2;
                const y = pos.top - containerRect.top + pos.height / 2 - 8;
                return (
                  <circle
                    key={`glow-${ability.id}`}
                    cx={x}
                    cy={y}
                    r="4"
                    fill="#22D3EE"
                    opacity="0.2"
                    className="animate-pulse"
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
                              ? `bg-indigo-700 border-indigo-400 shadow-lg shadow-indigo-500/20 ${justUnlocked.includes(ability.id) ? 'animate-burst' : ''}`
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

      {/* Custom CSS for animations */}
      <style jsx>{`
        .animate-flow {
          animation: flow 3s infinite linear;
        }
        @keyframes flow {
          0% { stroke-dashoffset: 0; }
          100% { stroke-dashoffset: -20; }
        }
        .animate-burst {
          animation: burst 0.5s ease-out forwards;
        }
        @keyframes burst {
          0% {
            box-shadow: 0 0 0 0 rgba(34, 211, 238, 0.8);
          }
          100% {
            box-shadow: 0 0 20px 10px rgba(34, 211, 238, 0);
          }
        }
      `}</style>
    </>
  );
};

export default TechTree;
