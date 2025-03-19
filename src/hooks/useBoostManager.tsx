
import { useGame } from '@/context/GameContext';
import * as GameMechanics from '@/utils/GameMechanics';
import { Artifact } from '@/utils/artifactsData';
import { Perk } from '@/utils/types';
import { formatNumber } from '@/utils/gameLogic';
import { INVENTORY_ITEMS } from '@/components/menu/types';

/**
 * Centralized hook for managing all boosts in the game
 */
export const useBoostManager = () => {
  const { state } = useGame();
  
  /**
   * Calculate total tap/click multiplier from all sources
   */
  const calculateTapMultiplier = (): number => {
    let tapMultiplier = GameMechanics.calculateClickMultiplier(state.ownedArtifacts);
    
    // Add tap boost if active
    if (state.boosts["boost-tap-boost"]?.active && state.boosts["boost-tap-boost"].remainingUses) {
      tapMultiplier *= INVENTORY_ITEMS.TAP_BOOST.effect!.value;
    }
    
    return tapMultiplier;
  };
  
  /**
   * Calculate total global income multiplier from all sources
   */
  const calculateGlobalIncomeMultiplier = (): number => {
    let multiplier = 1;
    
    // Apply DOUBLE_COINS
    if (state.boosts["boost-double-coins"]?.active) {
      multiplier *= INVENTORY_ITEMS.DOUBLE_COINS.effect!.value;
    }
    
    return multiplier;
  };
  
  /**
   * Calculate total cost reduction from all sources
   */
  const calculateTotalCostReduction = (): number => {
    let reduction = GameMechanics.calculateCostReduction(state);
    
    // Apply CHEAP_UPGRADES
    if (state.boosts["boost-cheap-upgrades"]?.active) {
      reduction *= INVENTORY_ITEMS.CHEAP_UPGRADES.effect!.value;
    }
    
    return reduction;
  };
  
  /**
   * Calculate total passive income multiplier from artifacts
   */
  const calculatePassiveIncomeMultiplier = (): number => {
    return GameMechanics.calculateArtifactProductionMultiplier(state);
  };
  
  /**
   * Calculate total CPS with all multipliers applied
   */
  const calculateTotalCPS = (): number => {
    return GameMechanics.calculateTotalCoinsPerSecond(state);
  };
  
  /**
   * Get the total active boosts count
   */
  const getActiveBoostsCount = (): number => {
    return Object.values(state.boosts).filter(boost => boost.active).length;
  };
  
  /**
   * Check if user has active boosts
   */
  const hasActiveBoosts = (): boolean => {
    return calculateTapMultiplier() > 1 || 
           calculateGlobalIncomeMultiplier() > 1 || 
           calculateTotalCostReduction() < 1 ||
           calculatePassiveIncomeMultiplier() > 1;
  };
  
  /**
   * Format boost effect description based on type
   */
  const formatBoostEffect = (boostId: string): string => {
    const boost = state.boosts[boostId];
    if (!boost) return '';
    
    const item = INVENTORY_ITEMS[boostId as keyof typeof INVENTORY_ITEMS];
    if (!item || !item.effect) return '';
    
    switch (item.effect.type) {
      case 'coinMultiplier':
        return `${item.effect.value}x coin multiplier`;
      case 'timeWarp':
        return `${item.effect.value / 60} minutes of passive income`;
      case 'autoTap':
        return `${item.effect.value} taps/sec`;
      case 'tapMultiplier':
        return `${item.effect.value}x tap power`;
      case 'costReduction':
        return `${(1 - item.effect.value) * 100}% cheaper upgrades`;
      case 'essenceMultiplier':
        return `+${(item.effect.value - 1) * 100}% essence`;
      case 'baseTapBoost':
        return `+${item.effect.value * boost.purchased} tap power`;
      case 'basePassiveBoost':
        return `+${item.effect.value * boost.purchased} passive income`;
      default:
        return 'Unknown effect';
    }
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
        return `Increases passive income by ${formatNumber(effectValue * 100)}%`;
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
    calculatePassiveIncomeMultiplier,
    calculateTotalCPS,
    hasActiveBoosts,
    getActiveBoostsCount,
    formatBoostEffect,
    getElementName,
    getHighestUnlockedPerkValue,
    formatEffectDescription
  };
};
