
import React from 'react';
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useGame } from '@/context/GameContext';
import { managers } from '@/utils/managersData';
import { formatNumber } from '@/utils/gameLogic';
import PerkButton from './PerkButton';

/**
 * Managers Component
 * 
 * Displays all managers available in the game, both owned and unowned.
 * For owned managers, displays their perks that can be unlocked with skill points.
 * 
 * Managers provide special bonuses that affect gameplay in various ways:
 * - Element production boosts
 * - Passive income increases
 * - Automation of specific game mechanics
 * - Cost reductions
 */
const Managers: React.FC = () => {
  const { state, unlockPerk } = useGame();
  
  // Helper function to get element name from element ID
  const getElementName = (elementId: string): string => {
    const element = state.upgrades.find(u => u.id === elementId);
    return element ? element.name : elementId;
  };
  
  return (
    <div className="w-full max-w-md mx-auto pb-8">
      <h2 className="text-lg font-medium mb-4 text-center text-slate-100">Element Managers</h2>
      
      <div className="space-y-4">
        {managers.map((manager, index) => {
          const isOwned = state.ownedManagers.includes(manager.id);
          
          // Generate a more detailed bonus description for managers with element boosts
          let bonusDescription = manager.bonus;
          if (manager.boosts && manager.boosts.length > 0) {
            const boostedElements = manager.boosts.map(getElementName).join(' and ');
            bonusDescription = `Increases ${boostedElements} production by 50%`;
          }
          
          return (
            <div 
              key={manager.id}
              className={`bg-slate-800/40 backdrop-blur-sm rounded-xl border ${isOwned ? 'border-indigo-500/40' : 'border-slate-700/40'} p-4 flex items-start gap-4 transition-all
                ${!isOwned ? 'opacity-50' : 'hover:shadow-md hover:shadow-indigo-500/20'}`}
            >
              {/* Manager Avatar */}
              <Avatar className="h-16 w-16 rounded-xl border-2 border-indigo-500/30 shadow-lg shadow-indigo-500/10">
                <AvatarImage src={manager.avatar} alt={manager.name} />
                <AvatarFallback className="bg-indigo-900/50 text-indigo-300 rounded-xl">
                  {manager.name.substring(0, 2)}
                </AvatarFallback>
              </Avatar>
              
              {/* Manager Info */}
              <div className="flex-1">
                <div className="flex justify-between items-start">
                  <h3 className="font-bold text-slate-100">{manager.name}</h3>
                </div>
                <p className="text-sm text-slate-300 mt-1">{manager.description}</p>
                <p className="text-xs text-indigo-400 mt-2 font-medium">
                  {bonusDescription}
                </p>
              </div>
              
              {/* Perk Buttons - Only shown for owned managers */}
              {isOwned && manager.perks && (
                <div className="flex flex-col items-center justify-center ml-auto">
                  {manager.perks.map(perk => (
                    <PerkButton 
                      key={perk.id}
                      perk={perk}
                      parentId={manager.id}
                      onUnlock={unlockPerk}
                    />
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default Managers;
