
import { 
  calculateTapValue, 
  calculatePassiveIncome,
  calculateAutoTapIncome,
  calculateCostReduction,
  calculateClickMultiplier,
  calculateGlobalIncomeMultiplier,
  calculateArtifactProductionMultiplier,
  calculateStartingCoins,
  checkUpgradeMilestone,
  calculateEssenceReward,
  calculateManagerBoost,
  GameState,
  calculateBaseCoinsPerClick,
  calculateBaseCoinsPerSecond,
  calculateBulkPurchaseCost,
  calculateMaxAffordableQuantity
} from '@/context/GameContext';

// Re-export all the functions from GameContext for backward compatibility
export {
  calculateTapValue,
  calculatePassiveIncome,
  calculateAutoTapIncome,
  calculateCostReduction,
  calculateClickMultiplier,
  calculateGlobalIncomeMultiplier,
  calculateArtifactProductionMultiplier,
  calculateStartingCoins,
  checkUpgradeMilestone,
  calculateEssenceReward,
  calculateManagerBoost,
  calculateBaseCoinsPerClick,
  calculateBaseCoinsPerSecond,
  calculateBulkPurchaseCost,
  calculateMaxAffordableQuantity
};

/**
 * Calculate the total coins per second including all multipliers
 */
export const calculateTotalCoinsPerSecond = (state: GameState): number => {
  const baseCoinsPerSecond = calculateBaseCoinsPerSecond(state);
  const passiveMultiplier = calculateArtifactProductionMultiplier(state);
  const globalMultiplier = calculateGlobalIncomeMultiplier(state);
  
  return baseCoinsPerSecond * passiveMultiplier * globalMultiplier;
};
