import { GameState, Ability } from '@/context/GameContext';
import { calculateClickMultiplier as utilsCalculateClickMultiplier } from '@/hooks/useGameMechanics';
import { BoostEffect } from '@/utils/types'; // Assuming types.ts is in utils

/**
 * GameMechanics.ts
 * 
 * This file centralizes all game mechanics calculations, including:
 * - Income calculations (per click and passive)
 * - Upgrade costs and effects
 * - Boost effects from abilities, managers, artifacts, perks
 * - Resource gain calculations (coins, essence)
 * - Active boost effects applied as a final layer
 */

const enhanceGameMechanics = (state: GameState): GameState => {
  let enhancedState = { ...state };

  // Apply base values from permanent boosts
  enhancedState.coinsPerClickBase = enhancedState.coinsPerClickBase || 1;
  enhancedState.coinsPerSecondBase = enhancedState.coinsPerSecondBase || 0;
  enhancedState.essenceMultiplier = enhancedState.essenceMultiplier || 1;

  // Calculate tap value and passive income with existing mechanics
  enhancedState.coinsPerClick = calculateBaseTapValue(enhancedState);
  enhancedState.coinsPerSecond = calculateBasePassiveIncome(enhancedState);

  // Apply active boosts as final layer
  enhancedState = applyActiveBoosts(enhancedState);

  return enhancedState;
};

// Boost IDs for reference
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

// Apply active boost effects
const applyActiveBoosts = (state: GameState): GameState => {
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
        const multiplier = Math.pow(2, boost.quantity);
        updatedState.coinsPerClick *= multiplier;
        updatedState.coinsPerSecond *= multiplier;
        break;
      }
      case BOOST_IDS.TIME_WARP: {
        const income = state.coinsPerSecond * 2 * 60 * 60; // 2 hours
        updatedState.coins += income * boost.quantity;
        updatedState.totalEarned += income * boost.quantity;
        activeBoosts = activeBoosts.filter(b => b.id !== BOOST_IDS.TIME_WARP);
        shouldUpdateBoosts = true;
        break;
      }
      case BOOST_IDS.AUTO_TAP: {
        const tapsPerSecond = 5 * boost.quantity;
        updatedState.autoTapTapsPerSecond = (updatedState.autoTapTapsPerSecond || 0) + tapsPerSecond;
        break;
      }
      case BOOST_IDS.TAP_BOOST: {
        if (boost.remainingTime !== undefined && boost.remainingTime > 0) {
          updatedState.coinsPerClick *= 5 * boost.quantity;
        }
        break;
      }
      case BOOST_IDS.CHEAP_UPGRADES: {
        const reduction = Math.pow(0.9, boost.quantity);
        updatedState.upgrades = updatedState.upgrades.map(upgrade => ({
          ...upgrade,
          cost: upgrade.baseCost * Math.pow(1.08, upgrade.level) * reduction,
        }));
        break;
      }
      case BOOST_IDS.ESSENCE_BOOST: {
        const multiplier = Math.pow(1.25, boost.quantity);
        updatedState.essenceMultiplier = (updatedState.essenceMultiplier || 1) * multiplier;
        break;
      }
      case BOOST_IDS.PERMA_TAP: {
        updatedState.coinsPerClickBase = (updatedState.coinsPerClickBase || 1) + boost.quantity;
        break;
      }
      case BOOST_IDS.PERMA_PASSIVE: {
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

/**
 * Calculate the total tap/click value considering all boosts
 */
export const calculateTapValue = (state: GameState): number => {
  return enhanceGameMechanics(state).coinsPerClick;
};

/**
 * Base tap value calculation (without active boosts)
 */
const calculateBaseTapValue = (state: GameState): number => {
  const tapPowerUpgrade = state.upgrades.find(u => u.id === 'tap-power-1');
  const tapBoostMultiplier = tapPowerUpgrade ? 1 + (tapPowerUpgrade.level * tapPowerUpgrade.coinsPerClickBonus) : 1;
  const clickMultiplier = calculateClickMultiplier(state.ownedArtifacts);
  const baseClickValue = state.coinsPerClickBase || 1;
  const coinsPerSecondBonus = state.coinsPerSecond * 0.05;
  const abilityTapMultiplier = calculateAbilityTapMultiplier(state.abilities);
  return (baseClickValue + coinsPerSecondBonus) * clickMultiplier * tapBoostMultiplier * abilityTapMultiplier;
};

/**
 * Calculate passive income considering all boosts
 */
export const calculatePassiveIncome = (state: GameState, tickInterval: number = 100): number => {
  const enhancedState = enhanceGameMechanics(state);
  return enhancedState.coinsPerSecond * (tickInterval / 1000);
};

/**
 * Base passive income calculation (without active boosts)
 */
const calculateBasePassiveIncome = (state: GameState): number => {
  if (state.coinsPerSecond <= 0) return 0;
  const passiveIncomeMultiplier = calculateAbilityPassiveMultiplier(state.abilities);
  const artifactProductionMultiplier = calculateArtifactProductionMultiplier(state);
  const managerBoostMultiplier = calculateManagerBoostMultiplier(state);
  return (state.coinsPerSecondBase || 0) + state.coinsPerSecond * passiveIncomeMultiplier * artifactProductionMultiplier * managerBoostMultiplier;
};

/**
 * Calculate the total CPS (Coins Per Second) with all multipliers applied
 * This is for display purposes in the stats panel
 */
export const calculateTotalCoinsPerSecond = (state: GameState): number => {
  return enhanceGameMechanics(state).coinsPerSecond;
};

/**
 * Calculate artifact production multiplier based on owned artifacts and their perks
 */
export const calculateArtifactProductionMultiplier = (state: GameState): number => {
  let multiplier = 1;
  
  if (state.ownedArtifacts.includes("artifact-1")) {
    const artifact = state.artifacts.find(a => a.id === "artifact-1");
    if (artifact && artifact.effect) {
      multiplier += artifact.effect.value;
      if (artifact.perks) {
        const unlockedPerks = artifact.perks.filter(perk => perk.unlocked || state.unlockedPerks.includes(perk.id));
        if (unlockedPerks.length > 0) {
          const highestPerk = unlockedPerks.sort((a, b) => b.effect.value - a.effect.value)[0];
          multiplier = multiplier - artifact.effect.value + highestPerk.effect.value;
        }
      }
    }
  }
  
  if (state.ownedArtifacts.includes("artifact-6")) {
    const artifact = state.artifacts.find(a => a.id === "artifact-6");
    if (artifact && artifact.effect) {
      multiplier += artifact.effect.value;
      if (artifact.perks) {
        const unlockedPerks = artifact.perks.filter(perk => perk.unlocked || state.unlockedPerks.includes(perk.id));
        if (unlockedPerks.length > 0) {
          const highestPerk = unlockedPerks.sort((a, b) => b.effect.value - a.effect.value)[0];
          multiplier = multiplier - artifact.effect.value + highestPerk.effect.value;
        }
      }
    }
  }
  
  return multiplier;
};

/**
 * Calculate manager boost multiplier based on owned managers and their perks
 */
export const calculateManagerBoostMultiplier = (state: GameState): number => {
  let totalMultiplier = 1;
  
  state.managers.forEach(manager => {
    if (state.ownedManagers.includes(manager.id) && manager.boosts) {
      let managerBoostValue = 0.5;
      if (manager.perks) {
        const unlockedPerks = manager.perks.filter(perk => perk.unlocked || state.unlockedPerks.includes(perk.id));
        const boostPerks = unlockedPerks.filter(perk => perk.effect && perk.effect.type === "elementBoost");
        if (boostPerks.length > 0) {
          const highestPerk = boostPerks.sort((a, b) => b.effect.value - a.effect.value)[0];
          managerBoostValue = highestPerk.effect.value;
        }
      }
      
      manager.boosts.forEach(elementId => {
        const elementUpgrade = state.upgrades.find(u => u.id === elementId);
        if (elementUpgrade) {
          const elementCPS = elementUpgrade.coinsPerSecondBonus * elementUpgrade.level;
          const elementBoost = elementCPS * managerBoostValue;
          if (state.coinsPerSecond > 0) {
            totalMultiplier += (elementBoost / state.coinsPerSecond);
          }
        }
      });
    }
  });
  
  return totalMultiplier;
};

/**
 * Calculate auto-tap income considering all boosts
 */
export const calculateAutoTapIncome = (state: GameState, tickInterval: number = 100): number => {
  const enhancedState = enhanceGameMechanics(state);
  if (!state.autoTap && !enhancedState.autoTapTapsPerSecond) return 0;
  
  const tapPowerUpgrade = state.upgrades.find(u => u.id === 'tap-power-1');
  const tapBoostMultiplier = tapPowerUpgrade ? 1 + (tapPowerUpgrade.level * tapPowerUpgrade.coinsPerClickBonus) : 1;
  const clickMultiplier = calculateClickMultiplier(state.ownedArtifacts);
  const baseClickValue = enhancedState.coinsPerClickBase || 1;
  const coinsPerSecondBonus = enhancedState.coinsPerSecond * 0.05;
  const totalTapsPerSecond = (state.autoTap ? 1 : 0) + (enhancedState.autoTapTapsPerSecond || 0);
  return (baseClickValue + coinsPerSecondBonus) * clickMultiplier * tapBoostMultiplier * totalTapsPerSecond * (tickInterval / 1000);
};

/**
 * Calculate costs for upgrades with all reductions
 */
export const calculateUpgradeCost = (state: GameState, upgradeId: string, quantity: number = 1): number => {
  const enhancedState = enhanceGameMechanics(state);
  const upgrade = enhancedState.upgrades.find(u => u.id === upgradeId);
  if (!upgrade) return Infinity;
  return Math.floor(calculateBulkPurchaseCost(upgrade.baseCost, upgrade.level, quantity, 1.15) * calculateCostReduction(enhancedState));
};

/**
 * Calculate the total cost reduction from all sources
 */
export const calculateCostReduction = (state: GameState): number => {
  let costReduction = 1.0;
  
  if (state.ownedArtifacts.includes("artifact-1")) costReduction -= 0.05;
  if (state.ownedArtifacts.includes("artifact-6")) costReduction -= 0.1;
  
  if (state.abilities.find(a => a.id === "ability-3" && a.unlocked)) costReduction -= 0.05;
  if (state.abilities.find(a => a.id === "ability-4" && a.unlocked)) costReduction -= 0.15;
  if (state.abilities.find(a => a.id === "ability-9" && a.unlocked)) costReduction -= 0.30;
  if (state.abilities.find(a => a.id === "ability-12" && a.unlocked)) costReduction -= 0.45;
  
  state.managers.forEach(manager => {
    if (state.ownedManagers.includes(manager.id) && manager.perks) {
      manager.perks.forEach(perk => {
        if (perk.unlocked && perk.effect.type === 'cost-reduction') costReduction -= perk.effect.value;
      });
    }
  });
  
  return Math.max(0.5, costReduction);
};

/**
 * Calculate bulk purchase cost for multiple levels of an upgrade
 */
export const calculateBulkPurchaseCost = (baseCost: number, currentLevel: number, quantity: number, growthRate: number = 1.15): number => {
  const a = baseCost * Math.pow(growthRate, currentLevel);
  return Math.floor(a * (1 - Math.pow(growthRate, quantity)) / (1 - growthRate));
};

/**
 * Calculate maximum affordable quantity of an upgrade
 */
export const calculateMaxAffordableQuantity = (coins: number, baseCost: number, currentLevel: number, growthRate: number = 1.15): number => {
  const a = baseCost * Math.pow(growthRate, currentLevel);
  const term = (coins * (1 - growthRate)) / a;
  const rightSide = 1 - term;
  if (rightSide <= 0) return 1000;
  return Math.floor(Math.log(rightSide) / Math.log(growthRate));
};

/**
 * Calculate click multiplier from artifacts and other sources
 */
export const calculateClickMultiplier = (ownedArtifacts: string[] = []): number => {
  let multiplier = 1;
  if (ownedArtifacts.includes("artifact-2")) multiplier += 0.5;
  if (ownedArtifacts.includes("artifact-7")) multiplier += 1.5;
  return multiplier;
};

/**
 * Calculate ability tap/click multiplier
 */
export const calculateAbilityTapMultiplier = (abilities: Ability[]): number => {
  let multiplier = 1;
  if (abilities.find(a => a.id === "ability-2" && a.unlocked)) multiplier += 0.5;
  if (abilities.find(a => a.id === "ability-8" && a.unlocked)) multiplier += 0.85;
  if (abilities.find(a => a.id === "ability-11" && a.unlocked)) multiplier += 1.2;
  return multiplier;
};

/**
 * Calculate ability passive income multiplier
 */
export const calculateAbilityPassiveMultiplier = (abilities: Ability[]): number => {
  let multiplier = 1;
  if (abilities.find(a => a.id === "ability-2" && a.unlocked)) multiplier += 0.25;
  if (abilities.find(a => a.id === "ability-4" && a.unlocked)) multiplier += 0.2;
  if (abilities.find(a => a.id === "ability-6" && a.unlocked)) multiplier += 0.3;
  if (abilities.find(a => a.id === "ability-8" && a.unlocked)) multiplier += 0.55;
  if (abilities.find(a => a.id === "ability-9" && a.unlocked)) multiplier += 0.65;
  if (abilities.find(a => a.id === "ability-12" && a.unlocked)) multiplier += 1.0;
  return multiplier;
};

/**
 * Calculate global income multiplier from all sources
 */
export const calculateGlobalIncomeMultiplier = (state: GameState): number => {
  let multiplier = 1;
  if (state.abilities.find(a => a.id === "ability-3" && a.unlocked)) multiplier += 0.4;
  if (state.abilities.find(a => a.id === "ability-6" && a.unlocked)) multiplier += 0.45;
  if (state.abilities.find(a => a.id === "ability-10" && a.unlocked)) multiplier += 0.55;
  if (state.abilities.find(a => a.id === "ability-11" && a.unlocked)) multiplier += 0.8;
  if (state.abilities.find(a => a.id === "ability-13" && a.unlocked)) multiplier += 1.0;
  
  state.managers.forEach(manager => {
    if (state.ownedManagers.includes(manager.id) && manager.perks) {
      manager.perks.forEach(perk => {
        if (perk.unlocked && perk.effect && perk.effect.type === 'income-multiplier') multiplier += perk.effect.value;
      });
    }
  });
  
  return multiplier;
};

/**
 * Calculate essence reward with improved formula
 */
export const calculateEssenceReward = (totalCoins: number, state: GameState): number => {
  if (totalCoins < 100000) return 0;
  const enhancedState = enhanceGameMechanics(state);
  
  let essence = 0;
  let remaining = totalCoins;
  let threshold = 100000;
  let tierSize = 5;
  let tierProgress = 0;
  
  while (remaining >= threshold && essence < 1000) {
    essence++;
    tierProgress++;
    remaining -= threshold;
    if (tierProgress >= tierSize) {
      tierProgress = 0;
      threshold *= 2;
    }
  }
  
  let multiplier = 1;
  if (state.ownedArtifacts.includes("artifact-3")) multiplier += 0.25;
  if (state.ownedArtifacts.includes("artifact-8")) multiplier += 0.5;
  if (state.abilities.find(a => a.id === "ability-7" && a.unlocked)) multiplier += 0.15;
  if (state.abilities.find(a => a.id === "ability-10" && a.unlocked)) multiplier += 0.2;
  if (state.abilities.find(a => a.id === "ability-13" && a.unlocked)) multiplier += 0.35;
  
  state.managers.forEach(manager => {
    if (state.ownedManagers.includes(manager.id) && manager.perks) {
      manager.perks.forEach(perk => {
        if (perk.unlocked && perk.effect.type === 'essence-bonus') multiplier += perk.effect.value;
      });
    }
  });
  
  state.artifacts.forEach(artifact => {
    if (state.ownedArtifacts.includes(artifact.id) && artifact.perks) {
      artifact.perks.forEach(perk => {
        if (perk.unlocked && perk.effect.type === 'essence-bonus') multiplier += perk.effect.value;
      });
    }
  });
  
  return Math.floor(essence * multiplier * (enhancedState.essenceMultiplier || 1));
};

/**
 * Check if an upgrade has crossed a 100-level milestone for skill point rewards
 */
export const checkUpgradeMilestone = (oldLevel: number, newLevel: number): boolean => {
  const oldMilestone = Math.floor(oldLevel / 100);
  const newMilestone = Math.floor(newLevel / 100);
  return newMilestone > oldMilestone;
};

/**
 * Calculate starting coins after prestige based on artifacts
 */
export const calculateStartingCoins = (ownedArtifacts: string[]): number => {
  let startingCoins = 0;
  if (ownedArtifacts.includes("artifact-4")) startingCoins += 1000;
  if (ownedArtifacts.includes("artifact-9")) startingCoins += 10000;
  return startingCoins;
};

/**
 * Evaluate if an upgrade is a good value (worth buying)
 */
export const isGoodValue = (cost: number, coinsPerSecondBonus: number): boolean => {
  if (coinsPerSecondBonus <= 0) return false;
  const paybackPeriod = cost / coinsPerSecondBonus;
  return paybackPeriod < 100;
};
