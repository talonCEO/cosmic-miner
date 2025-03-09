
import { useGame } from '@/context/GameContext';
import * as GameMechanics from '@/utils/GameMechanics';
import { Artifact } from '@/utils/artifactsData';
import { Perk } from '@/utils/types';
import { formatNumber } from '@/utils/gameLogic';

/**
 * Centralized hook for managing all boosts in the game
 */
export const useBoostManager = () => {
  const { state } = useGame();
  
  /**
   * Calculate total tap/click multiplier from all sources
   */
  const calculateTapMultiplier = (): number => {
    return GameMechanics.calculateClickMultiplier(state.ownedArtifacts);
  };
  
  /**
   * Calculate total global income multiplier from all sources
   */
  const calculateGlobalIncomeMultiplier = (): number => {
    return GameMechanics.calculateGlobalIncomeMultiplier(state);
  };
  
  /**
   * Calculate total cost reduction from all sources
   */
  const calculateTotalCostReduction = (): number => {
    return GameMechanics.calculateCostReduction(state);
  };
  
  /**
   * Check if user has active boosts
   */
  const hasActiveBoosts = (): boolean => {
    return calculateTapMultiplier() > 1 || 
           calculateGlobalIncomeMultiplier() > 1 || 
           calculateTotalCostReduction() < 1;
  };
  
  /**
   * Get element name from element ID
   */
  const getElementName = (elementId: string): string => {
    const elementMap: Record<string, string> = {
      'element-1': 'Hydrogen',
      'element-2': 'Helium',
      'element-3': 'Lithium', 
      'element-4': 'Carbon',
      'element-5': 'Oxygen',
      'element-6': 'Iron',
      'element-7': 'Gold',
      'element-8': 'Uranium',
      'element-9': 'Plutonium',
      'element-10': 'Dark Matter'
    };
    
    return elementMap[elementId] || elementId;
  };
  
  /**
   * Get the highest unlocked perk value for a specific parent (manager or artifact)
   */
  const getHighestUnlockedPerkValue = (parentId: string): Perk | null => {
    // Find the parent in artifacts or managers
    const artifact = state.artifacts.find(a => a.id === parentId);
    const manager = state.managers.find(m => m.id === parentId);
    
    if (!artifact && !manager) return null;
    
    const perks = artifact ? artifact.perks : manager ? manager.perks : [];
    if (!perks) return null;
    
    // Filter unlocked perks and find the one with highest value
    const unlockedPerks = perks.filter(perk => 
      state.unlockedPerks.includes(perk.id) || perk.unlocked
    );
    
    if (unlockedPerks.length === 0) return null;
    
    // Sort by effect value and return the highest
    return unlockedPerks.sort((a, b) => b.effect.value - a.effect.value)[0];
  };
  
  /**
   * Format effect description based on artifact or manager and highest perk value
   */
  const formatEffectDescription = (item: Artifact, highestPerk: Perk | null): string => {
    if (!item.effect) return item.bonus || "No effect";
    
    const effectValue = highestPerk ? highestPerk.effect.value : item.effect.value;
    
    switch (item.effect.type) {
      case "production":
        return `Increases all production by ${formatNumber(effectValue * 100)}%`;
      case "tap":
        return `${formatNumber(effectValue)}x tap multiplier`;
      case "essence":
        return `${formatNumber(effectValue * 100)}% more essence from prestiging`;
      case "cost":
        return `Reduces upgrade costs by ${formatNumber(effectValue * 100)}%`;
      case "startingCoins":
        return `Start with ${formatNumber(effectValue)} coins after each prestige`;
      default:
        return item.bonus;
    }
  };
  
  return {
    calculateTapMultiplier,
    calculateGlobalIncomeMultiplier,
    calculateTotalCostReduction,
    hasActiveBoosts,
    getElementName,
    getHighestUnlockedPerkValue,
    formatEffectDescription
  };
};
