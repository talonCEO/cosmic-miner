import { GameState } from '@/context/GameContext';
import { BoostEffect } from '@/utils/types';

// Constants for boost IDs from types.ts
const BOOST_IDS = {
  DOUBLE_COINS: 'boost-double-coins',
  TIME_WARP: 'boost-time-warp',
  AUTO_TAP: 'boost-auto-tap',
  TAP_BOOST: 'boost-tap-boost',
  CHEAP_UPGRADES: 'boost-cheap-upgrades',
  ESSENCE_BOOST: 'boost-essence-boost',
  PERMA_TAP: 'boost-perma-tap',
  PERMA_PASSIVE: 'boost-perma-passive',
};

// Helper to calculate remaining time or taps
const getRemaining = (boost: BoostEffect): number => {
  if (!boost.duration || !boost.activatedAt) return Infinity; // Permanent boosts
  const now = Date.now() / 1000; // Current time in seconds
  const elapsed = now - boost.activatedAt;
  return Math.max(0, boost.duration - elapsed);
};

// Main function to apply active boost effects
export const applyActiveBoosts = (state: GameState): GameState => {
  const now = Date.now() / 1000;
  let updatedState = { ...state };
  let activeBoosts = [...state.activeBoosts];
  let shouldUpdateBoosts = false;

  // Filter out expired boosts (except permanent ones or tap-based)
  activeBoosts = activeBoosts.filter(boost => {
    if (boost.id === BOOST_IDS.TAP_BOOST) {
      return boost.remainingTime !== undefined && boost.remainingTime > 0; // Tap count
    }
    return !boost.duration || getRemaining(boost) > 0;
  });

  // Apply effects
  activeBoosts.forEach(boost => {
    switch (boost.id) {
      case BOOST_IDS.DOUBLE_COINS: {
        // x2 global multiplier for 30 minutes (stacks multiplicatively)
        const multiplier = Math.pow(2, boost.quantity);
        updatedState.coinsPerClick *= multiplier;
        updatedState.coinsPerSecond *= multiplier;
        break;
      }
      case BOOST_IDS.TIME_WARP: {
        // Instantly add 2 hours of passive income (one-time effect)
        const income = state.coinsPerSecond * 2 * 60 * 60; // 2 hours
        updatedState.coins += income * boost.quantity;
        updatedState.totalEarned += income * boost.quantity;
        // Remove after applying (one-time use)
        activeBoosts = activeBoosts.filter(b => b.id !== BOOST_IDS.TIME_WARP);
        shouldUpdateBoosts = true;
        break;
      }
      case BOOST_IDS.AUTO_TAP: {
        // Auto-tap 5 times per second for 10 minutes
        const tapsPerSecond = 5 * boost.quantity;
        updatedState.autoTapTapsPerSecond = (updatedState.autoTapTapsPerSecond || 0) + tapsPerSecond;
        break;
      }
      case BOOST_IDS.TAP_BOOST: {
        // 5x tap power for 100 taps (tracks remaining taps)
        if (boost.remainingTime !== undefined && boost.remainingTime > 0) {
          updatedState.coinsPerClick *= 5 * boost.quantity;
        }
        break;
      }
      case BOOST_IDS.CHEAP_UPGRADES: {
        // 10% cost reduction (0.9x) for 10 minutes (stacks multiplicatively)
        const reduction = Math.pow(0.9, boost.quantity);
        updatedState.upgrades = updatedState.upgrades.map(upgrade => ({
          ...upgrade,
          cost: upgrade.baseCost * Math.pow(1.08, upgrade.level) * reduction,
        }));
        break;
      }
      case BOOST_IDS.ESSENCE_BOOST: {
        // +25% essence reward until prestige (stacks multiplicatively)
        const multiplier = Math.pow(1.25, boost.quantity);
        updatedState.essenceMultiplier = (updatedState.essenceMultiplier || 1) * multiplier;
        break;
      }
      case BOOST_IDS.PERMA_TAP: {
        // Permanent +1 to base tap power per use
        updatedState.coinsPerClickBase = (updatedState.coinsPerClickBase || 1) + boost.quantity;
        break;
      }
      case BOOST_IDS.PERMA_PASSIVE: {
        // Permanent +1 to base passive income per use
        updatedState.coinsPerSecondBase = (updatedState.coinsPerSecondBase || 0) + boost.quantity;
        break;
      }
    }
  });

  // Update remaining taps for TAP_BOOST
  if (state.tapBoostTapsRemaining !== undefined && state.tapBoostTapsRemaining > 0) {
    const tapBoosts = activeBoosts.filter(b => b.id === BOOST_IDS.TAP_BOOST);
    tapBoosts.forEach(boost => {
      boost.remainingTime = state.tapBoostTapsRemaining;
      if (boost.remainingTime <= 0) {
        activeBoosts = activeBoosts.filter(b => b !== boost);
        shouldUpdateBoosts = true;
      }
    });
  }

  if (shouldUpdateBoosts) {
    updatedState.activeBoosts = activeBoosts;
  }

  return updatedState;
};

// Function to integrate with GameMechanics
export const enhanceGameMechanics = (state: GameState): GameState => {
  let enhancedState = { ...state };

  // Apply base values from permanent boosts
  enhancedState.coinsPerClickBase = enhancedState.coinsPerClickBase || 1;
  enhancedState.coinsPerSecondBase = enhancedState.coinsPerSecondBase || 0;
  enhancedState.essenceMultiplier = enhancedState.essenceMultiplier || 1;

  // Calculate tap value and passive income with existing mechanics
  enhancedState.coinsPerClick = calculateTapValue(enhancedState);
  enhancedState.coinsPerSecond = calculatePassiveIncome(enhancedState);

  // Apply active boosts as final layer
  enhancedState = applyActiveBoosts(enhancedState);

  return enhancedState;
};

// Helper to calculate tap value (modified from GameMechanics.ts)
const calculateTapValue = (state: GameState): number => {
  let baseValue = state.coinsPerClickBase || 1;
  const clickMultiplier = GameMechanics.calculateClickMultiplier(state);
  const tapBoostMultiplier = GameMechanics.calculateAbilityTapMultiplier(state);
  return baseValue * clickMultiplier * tapBoostMultiplier;
};

// Helper to calculate passive income (modified from GameMechanics.ts)
const calculatePassiveIncome = (state: GameState): number => {
  let baseIncome = state.coinsPerSecondBase || 0;
  const passiveIncomeMultiplier = GameMechanics.calculatePassiveIncomeMultiplier(state);
  const artifactProductionMultiplier = GameMechanics.calculateArtifactProductionMultiplier(state);
  const managerBoostMultiplier = GameMechanics.calculateManagerBoostMultiplier(state);
  return baseIncome + (state.coinsPerSecond || 0) * passiveIncomeMultiplier * artifactProductionMultiplier * managerBoostMultiplier;
};

// Export for reference to original mechanics
import * as GameMechanics from './GameMechanics';