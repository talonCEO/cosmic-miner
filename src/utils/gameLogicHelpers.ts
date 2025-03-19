
// This file provides helper functions for boost management and game mechanics
import { GameState } from '@/context/GameContext';
import { INVENTORY_ITEMS } from '@/components/menu/types';

/**
 * Calculate the essence reward when applying boosts
 */
export const calculateEssenceRewardWithBoosts = (baseEssence: number, state: GameState): number => {
  let multiplier = 1;
  
  // Apply ESSENCE_BOOST if it's been purchased
  if (state.boosts && state.boosts["boost-essence-boost"]?.purchased) {
    // +25% per use, multiplicative
    multiplier *= Math.pow(INVENTORY_ITEMS.ESSENCE_BOOST.effect!.value, state.boosts["boost-essence-boost"].purchased);
  }
  
  return Math.floor(baseEssence * multiplier);
};

/**
 * Calculate upgrade cost with all applicable boosts
 */
export const calculateUpgradeCostWithBoosts = (baseCost: number, state: GameState): number => {
  let costMultiplier = 1;
  
  // Apply CHEAP_UPGRADES if active
  if (state.boosts && state.boosts["boost-cheap-upgrades"]?.active) {
    costMultiplier *= INVENTORY_ITEMS.CHEAP_UPGRADES.effect!.value; // 0.9 = 10% reduction
  }
  
  return Math.floor(baseCost * costMultiplier);
};

/**
 * Check if a boost is active and affecting game mechanics
 */
export const isBoostActive = (boostId: string, state: GameState): boolean => {
  return state.boosts && state.boosts[boostId]?.active === true;
};

/**
 * Get remaining duration or uses for an active boost
 */
export const getBoostRemainingInfo = (boostId: string, state: GameState): { type: 'time' | 'uses', value: number } | null => {
  if (!state.boosts || !state.boosts[boostId] || !state.boosts[boostId].active) {
    return null;
  }
  
  const boost = state.boosts[boostId];
  
  if (boost.remainingUses !== undefined) {
    return { type: 'uses', value: boost.remainingUses };
  }
  
  if (boost.remainingTime !== undefined) {
    return { type: 'time', value: boost.remainingTime };
  }
  
  return null;
};

/**
 * Format time in seconds to display format (mm:ss)
 */
export const formatTimeRemaining = (seconds: number): string => {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins}:${secs.toString().padStart(2, '0')}`;
};
