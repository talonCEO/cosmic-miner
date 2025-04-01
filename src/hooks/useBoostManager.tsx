import { useGame } from '@/context/GameContext';
import * as GameMechanics from '@/utils/GameMechanics';
import { Artifact } from '@/utils/artifactsData';
import { Perk } from '@/utils/types';
import { formatNumber } from '@/utils/gameLogic';
import { getElementName } from '@/utils/managersData';
import { calculateEssenceIncomeBoost } from '@/utils/gameLogic';
import { INVENTORY_ITEMS } from '@/components/menu/types'; // Added import

/**
 * Centralized hook for managing all boosts in the game
 */
export const useBoostManager = () => {
  const { state } = useGame();

  const calculateTapMultiplier = (): number => {
    let multiplier = GameMechanics.calculateClickMultiplier(state);
    // Apply perma-tap boost (1% per stack)
    const permaTapMultiplier = 1 + (state.permaTapBoosts || 0) * INVENTORY_ITEMS.PERMA_TAP.effect!.value;
    multiplier *= permaTapMultiplier;
    return multiplier;
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
   * Calculate total passive income multiplier from artifacts
   */
  const calculatePassiveIncomeMultiplier = (): number => {
    return GameMechanics.calculateArtifactProductionMultiplier(state);
  };

  const calculateTotalCPS = (): number => {
    let baseCPS = GameMechanics.calculateTotalCoinsPerSecond(state);
    // Apply perma-passive boost (1% per stack)
    const permaPassiveMultiplier = 1 + (state.permaPassiveBoosts || 0) * INVENTORY_ITEMS.PERMA_PASSIVE.effect!.value;
    return baseCPS * permaPassiveMultiplier;
  };

  /**
   * Check if user has active boosts
   */
  const hasActiveBoosts = (): boolean => {
    return (
      calculateTapMultiplier() > 1 ||
      calculateGlobalIncomeMultiplier() > 1 ||
      calculateTotalCostReduction() < 1 ||
      calculatePassiveIncomeMultiplier() > 1 ||
      state.activeBoosts.some(b => b.id === 'boost-critical-chance' && GameMechanics.getRemaining(b) > 0) ||
      state.autoTapActive || state.autoTap
    );
  };

  /**
   * Get the highest unlocked perk value for a specific parent (manager or artifact)
   */
  const getHighestUnlockedPerkValue = (parentId: string): Perk | null => {
    const artifact = state.artifacts.find((a) => a.id === parentId);
    const manager = state.managers.find((m) => m.id === parentId);

    if (!artifact && !manager) return null;

    const perks = artifact ? artifact.perks : manager ? manager.perks : [];
    if (!perks) return null;

    const unlockedPerks = perks.filter(
      (perk) => state.unlockedPerks.includes(perk.id) || perk.unlocked
    );

    if (unlockedPerks.length === 0) return null;

    return unlockedPerks.sort((a, b) => b.effect.value - a.effect.value)[0];
  };

  /**
   * Format effect description based on artifact or manager and highest perk value
   */
  const formatEffectDescription = (item: Artifact, highestPerk: Perk | null): string => {
    if (!item.effect) return item.bonus || 'No effect';

    const effectValue = highestPerk ? highestPerk.effect.value : item.effect.value;

    switch (item.effect.type) {
      case 'production':
        return `Increases passive income by ${formatNumber(effectValue * 100)}%`;
      case 'tap':
        return `${formatNumber(effectValue)}x tap multiplier`;
      case 'essence':
        return `${formatNumber(effectValue * 100)}% more essence from prestiging`;
      case 'cost':
        return `Reduces upgrade costs by ${formatNumber(effectValue * 100)}%`;
      case 'startingCoins':
        return `Start with ${formatNumber(effectValue)} coins after each prestige`;
      default:
        return item.bonus || 'No effect';
    }
  };

  /**
   * Calculate total boost effects across all categories
   */
  const getBoostTotals = () => {
    const globalMultiplier = calculateGlobalIncomeMultiplier() * calculateEssenceIncomeBoost(state.totalEssence);
    const tapPower = Math.max(0, GameMechanics.calculateAbilityTapMultiplier(state.abilities) - 1);
    const passiveIncome = Math.max(0, calculatePassiveIncomeMultiplier() - 1 + (calculateEssenceIncomeBoost(state.totalEssence) - 1));
    const essenceReward = Math.max(0, GameMechanics.calculateEssenceBoost(state) - 1);
    const costReduction = Math.min(1, Math.max(0.1, calculateTotalCostReduction()));

    return {
      globalMultiplier,
      tapPower,
      passiveIncome,
      essenceReward,
      costReduction,
    };
  };

  return {
    calculateTapMultiplier,
    calculateGlobalIncomeMultiplier,
    calculateTotalCostReduction,
    calculatePassiveIncomeMultiplier,
    calculateTotalCPS,
    hasActiveBoosts,
    getElementName,
    getHighestUnlockedPerkValue,
    formatEffectDescription,
    getBoostTotals,
  };
};