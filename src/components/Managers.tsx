
import React from 'react';
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useGame } from '@/context/GameContext';
import { managers } from '@/utils/managersData';
import { formatNumber } from '@/utils/gameLogic';
import PerkButton from './PerkButton';
import { useBoostManager } from '@/hooks/useBoostManager';

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
  const { getElementName, getHighestUnlockedPerkValue } = useBoostManager();
  
  // Handle unlocking a perk without showing a toast
  const handleUnlockPerk = (perkId: string, parentId: string) => {
    unlockPerk(perkId, parentId);
  };
  
  return (
    <div className="w-full max-w-md mx-auto pb-8">
      <h2 className="text-lg font-medium mb-4 text-center text-slate-100">Element Managers</h2>
      
      <div className="space-y-4">
        {managers.map((manager, index) => {
          const isOwned = state.ownedManagers.includes(manager.id);
          
          // Get the highest unlocked perk if any
          const highestPerk = isOwned ? getHighestUnlockedPerkValue(manager.id) : null;
          
          // Generate a more detailed bonus description for managers with element boosts
          let bonusDescription = manager.bonus;
          if (manager.boosts && manager.boosts.length > 0) {
            const boostedElements = manager.boosts.map(getElementName).join(' and ');

            // If there's a highest perk, use its value instead of the base 50%
            const boostValue = highestPerk && highestPerk.effect.type === "elementBoost" 
              ? highestPerk.effect.value * 100 
              : 50;
              
            bonusDescription = `Increases ${boostedElements} production by ${boostValue}%`;
          }
          
          // Show perks for all managers except the default one, regardless of ownership
          const shouldShowPerks = manager.perks && manager.id !== "manager-default";
          
          // Calculate opacity based on ownership
          const managerOpacity = isOwned ? 'opacity-100' : 'opacity-50';
          
          // Check if manager has any unlocked perks
          const hasUnlockedPerks = isOwned && manager.perks && manager.perks.some(p => p.unlocked);
          
          return (
            <div 
              key={manager.id}
              className={`bg-slate-800/40 backdrop-blur-sm rounded-xl border ${isOwned ? 'border-indigo-500/40' : 'border-slate-700/40'} p-4 flex items-start gap-4 transition-all
                ${isOwned ? 'hover:shadow-md hover:shadow-indigo-500/20' : ''} ${managerOpacity}`}
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
              
              {/* Perk Buttons - Show for all managers that have perks, except default one */}
              {shouldShowPerks && (
                <div className="flex flex-col items-center justify-center ml-auto">
                  {manager.perks.map(perk => (
                    <PerkButton 
                      key={perk.id}
                      perk={perk}
                      parentId={manager.id}
                      onUnlock={handleUnlockPerk}
                      disabled={!isOwned}
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
