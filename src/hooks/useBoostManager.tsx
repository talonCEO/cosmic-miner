
import { useGame } from '@/context/GameContext';
import * as GameMechanics from '@/utils/GameMechanics';

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
  
  return {
    calculateTapMultiplier,
    calculateGlobalIncomeMultiplier,
    calculateTotalCostReduction,
    hasActiveBoosts
  };
};
