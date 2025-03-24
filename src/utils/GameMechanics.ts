import { GameState, Ability } from '@/context/GameContext';
import { calculateClickMultiplier as utilsCalculateClickMultiplier } from '@/hooks/useGameMechanics';
import { BoostEffect } from '@/components/menu/types';

/**
 * GameMechanics.ts
 * 
 * This file centralizes all game mechanics calculations, including:
 * - Income calculations (per click and passive)
 * - Upgrade costs and effects
 * - Boost effects from abilities, managers, artifacts, perks
 * - Resource gain calculations (coins, essence)
 * - NEW: Applying active boost effects from inventory items
 */

const enhanceGameMechanics = (state: GameState): GameState => {
  let enhancedState = { ...state };

  // Calculate base values without active boosts
  enhancedState.coinsPerClick = calculateBaseTapValue(enhancedState);
  enhancedState.coinsPerSecond = calculateBasePassiveIncome(enhancedState);

  // Apply active boosts from inventory items
  enhancedState = applyActiveBoosts(enhancedState);

  return enhancedState;
};

// Define boost IDs for clarity
const BOOST_IDS = {
  DOUBLE_COINS: 'boost-double-coins',
  TIME_WARP: 'boost-time-warp',
  AUTO_TAP: 'boost-auto-tap',
  TAP_BOOST: 'boost-tap-boost',
  CHEAP_UPGRADES: 'boost-cheap-upgrades',
  ESSENCE_BOOST: 'boost-essence-boost',
  PERMA_TAP: 'boost-perma-tap',
  PERMA_PASSIVE: 'boost-perma-passive'
};

// Helper to calculate remaining time for timed boosts
const getRemaining = (boost: BoostEffect): number => {
  if (!boost.duration || !boost.activatedAt) return Infinity; // Permanent boosts
  const now = Date.now() / 1000; // Current time in seconds
  const elapsed = now - boost.activatedAt;
  return Math.max(0, boost.duration - elapsed);
};

// Apply effects of active boosts from inventory items
const applyActiveBoosts = (state: GameState): GameState => {
  let updatedState = { ...state };
  const activeBoosts = updatedState.activeBoosts || [];

  activeBoosts.forEach(boost => {
    const remaining = getRemaining(boost);
    if (remaining <= 0 && boost.id !== BOOST_IDS.TAP_BOOST) return;

    switch (boost.id) {
      case BOOST_IDS.DOUBLE_COINS:
        const doubleCoinsMultiplier = Math.pow(2, boost.quantity);
        updatedState.coinsPerClick *= doubleCoinsMultiplier;
        updatedState.coinsPerSecond *= doubleCoinsMultiplier;
        break;
      case BOOST_IDS.TIME_WARP:
        const income = updatedState.coinsPerSecond * 2 * 60 * 60; // 2 hours
        updatedState.coins += income * boost.quantity;
        updatedState.totalEarned += income * boost.quantity;
        updatedState.activeBoosts = updatedState.activeBoosts.filter(b => b.id !== BOOST_IDS.TIME_WARP);
        break;
      case BOOST_IDS.AUTO_TAP:
        updatedState.autoTapTapsPerSecond = (updatedState.autoTapTapsPerSecond || 0) + (5 * boost.quantity);
        break;
      case BOOST_IDS.TAP_BOOST:
        if ((updatedState.tapBoostTapsRemaining || 0) > 0) {
          updatedState.coinsPerClick *= 5 * boost.quantity;
          updatedState.tapBoostTapsRemaining = (updatedState.tapBoostTapsRemaining || 0) - 1;
          if (updatedState.tapBoostTapsRemaining <= 0) {
            updatedState.activeBoosts = updatedState.activeBoosts.filter(b => b.id !== BOOST_IDS.TAP_BOOST);
          }
        }
        break;
      case BOOST_IDS.CHEAP_UPGRADES:
        updatedState.costReductionMultiplier = 0.9; // Set to 0.9 directly, no stacking
        break;
      case BOOST_IDS.ESSENCE_BOOST:
        updatedState.essenceMultiplier = (updatedState.essenceMultiplier || 1) * Math.pow(1.25, boost.quantity);
        break;
      case BOOST_IDS.PERMA_TAP:
        updatedState.coinsPerClickBase = (updatedState.coinsPerClickBase || updatedState.coinsPerClick) + boost.quantity;
        break;
      case BOOST_IDS.PERMA_PASSIVE:
        updatedState.coinsPerSecondBase = (updatedState.coinsPerSecondBase || updatedState.coinsPerSecond) + boost.quantity;
        break;
    }
  });

  return updatedState;
};

/**
 * Calculate the total tap/click value considering all boosts
 */
export const calculateTapValue = (state: GameState): number => {
  const enhancedState = enhanceGameMechanics(state);
  // Apply permanent tap boost at the end
  return Math.max(0, enhancedState.coinsPerClick + (state.permaTapBoosts || 0));
};

/**
 * Base tap value calculation (without active boosts)
 */
const calculateBaseTapValue = (state: GameState): number => {
  const tapPowerUpgrade = state.upgrades.find(u => u.id === 'tap-power-1');
  const tapBoostMultiplier = tapPowerUpgrade ? 1 + (tapPowerUpgrade.level * tapPowerUpgrade.coinsPerClickBonus) : 1;
  const clickMultiplier = calculateClickMultiplier(state.ownedArtifacts);
  const baseClickValue = state.coinsPerClickBase || state.coinsPerClick;
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
  return (state.coinsPerSecondBase || state.coinsPerSecond) * passiveIncomeMultiplier * artifactProductionMultiplier * managerBoostMultiplier;
};

/**
 * Calculate the total CPS (Coins Per Second) with all multipliers applied
 */
export const calculateTotalCoinsPerSecond = (state: GameState): number => {
  const enhancedState = enhanceGameMechanics(state);
  // Apply permanent passive boost at the end
  return Math.max(0, enhancedState.coinsPerSecond + (state.permaPassiveBoosts || 0));
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
        const unlockedPerks = artifact.perks.filter(perk => 
          perk.unlocked || state.unlockedPerks.includes(perk.id)
        );
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
        const unlockedPerks = artifact.perks.filter(perk => 
          perk.unlocked || state.unlockedPerks.includes(perk.id)
        );
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
        const unlockedPerks = manager.perks.filter(perk => 
          perk.unlocked || state.unlockedPerks.includes(perk.id)
        );
        const boostPerks = unlockedPerks.filter(perk => 
          perk.effect && perk.effect.type === "elementBoost"
        );
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

  // If neither base auto-tap nor boost is active, return 0
  if (!state.autoTap && !enhancedState.autoTapTapsPerSecond) return 0;

  // Calculate the base tap value (without active boosts like TAP_BOOST)
  const tapPowerUpgrade = state.upgrades.find(u => u.id === 'tap-power-1');
  const tapBoostMultiplier = tapPowerUpgrade ? 1 + (tapPowerUpgrade.level * tapPowerUpgrade.coinsPerClickBonus) : 1;
  const clickMultiplier = calculateClickMultiplier(state.ownedArtifacts);
  const baseClickValue = enhancedState.coinsPerClickBase || enhancedState.coinsPerClick;
  const coinsPerSecondBonus = enhancedState.coinsPerSecond * 0.05;
  const abilityTapMultiplier = calculateAbilityTapMultiplier(state.abilities);
  const baseTapValue = (baseClickValue + coinsPerSecondBonus) * clickMultiplier * tapBoostMultiplier * abilityTapMultiplier;

  // Determine total taps per second
  const baseAutoTapTapsPerSecond = state.autoTap ? 1 : 0; // Base auto-tap (1 tap/sec if enabled)
  const boostAutoTapTapsPerSecond = enhancedState.autoTapTapsPerSecond || 0; // From boost-auto-tap (5 taps/sec per stack)

  // If boost-auto-tap is active, override with tap value × 5 per second
  if (boostAutoTapTapsPerSecond > 0) {
    const boostIncomePerSecond = baseTapValue * 5; // tap value × 5 coins per second
    return boostIncomePerSecond * (tickInterval / 1000); // Adjust for tick interval
  }

  // Otherwise, calculate base auto-tap income (40% efficiency)
  const totalTapsPerSecond = baseAutoTapTapsPerSecond;
  return baseTapValue * totalTapsPerSecond * (tickInterval / 1000) * 0.4;
};

/**
 * Calculate costs for upgrades with all reductions
 */
export const calculateUpgradeCost = (state: GameState, upgradeId: string, quantity: number = 1): number => {
  const enhancedState = enhanceGameMechanics(state);
  const upgrade = enhancedState.upgrades.find(u => u.id === upgradeId);
  if (!upgrade) return Infinity;
  
  const costReduction = calculateCostReduction(enhancedState);
  let totalCost = calculateBulkPurchaseCost(upgrade.baseCost, upgrade.level, quantity, 1.08); // Use 1.08 growth rate from GameContext
  totalCost *= costReduction; // Apply other reductions first
  
  // Apply CHEAP_UPGRADES boost at the end (0.9 multiplier, no stacking below 0.9)
  const hasCheapUpgrades = enhancedState.activeBoosts.some(b => b.id === BOOST_IDS.CHEAP_UPGRADES && getRemaining(b) > 0);
  if (hasCheapUpgrades) {
    totalCost *= 0.9;
  }

  return Math.floor(totalCost);
};

/**
 * Calculate the total cost reduction from all sources (excluding CHEAP_UPGRADES)
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
  
  return Math.max(0.5, costReduction); // Minimum 50% cost (before CHEAP_UPGRADES)
};

/**
 * Calculate bulk purchase cost for multiple levels of an upgrade
 */
export const calculateBulkPurchaseCost = (baseCost: number, currentLevel: number, quantity: number, growthRate: number = 1.08): number => {
  const a = baseCost * Math.pow(growthRate, currentLevel);
  return Math.floor(a * (1 - Math.pow(growthRate, quantity)) / (1 - growthRate));
};

/**
 * Calculate maximum affordable quantity of an upgrade
 */
export const calculateMaxAffordableQuantity = (coins: number, baseCost: number, currentLevel: number, growthRate: number = 1.08): number => {
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
  
  // Apply temporary essence boost for this prestige only (resets on next prestige)
  const tempEssenceBoostStacks = state.tempEssenceBoostStacks || 0;
  const tempEssenceMultiplier = Math.pow(1.25, tempEssenceBoostStacks); // +25% per stack
  
  return Math.floor(essence * multiplier * (enhancedState.essenceMultiplier || 1) * tempEssenceMultiplier);
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
