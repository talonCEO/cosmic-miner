import { GameState, Ability } from '@/context/GameContext';
import { calculateClickMultiplier as utilsCalculateClickMultiplier } from '@/hooks/useGameMechanics';
import { BoostEffect } from '@/components/menu/types';
import { calculateEssenceMultiplier } from '@/utils/gameLogic'; // Import essence multiplier

/**
 * GameMechanics.ts
 * 
 * Centralizes all game mechanics calculations, including:
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

  // Apply essence multiplier based on total essence
  const essenceMultiplier = calculateEssenceMultiplier(state.totalEssence || 0);
  enhancedState.coinsPerClick *= essenceMultiplier;
  enhancedState.coinsPerSecond *= essenceMultiplier;

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
        // No need to apply here; handled in calculateTapValue
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
  let tapValue = Math.max(0, enhancedState.coinsPerClick + (state.permaTapBoosts || 0));
  
  // Apply tap boost if active
  if (state.tapBoostActive && (state.tapBoostTapsRemaining || 0) > 0) {
    tapValue *= 5; // ×5 multiplier when boost is active
  }
  
  return tapValue;
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
 * Calculate the boost multiplier based on upgrade level thresholds
 */
export const getLevelBoostMultiplier = (level: number): number => {
  const thresholds = [
    { level: 1000, boost: 15.0 }, // +1500%
    { level: 750, boost: 10.0 },  // +1000%
    { level: 500, boost: 7.0 },   // +700%
    { level: 400, boost: 5.0 },   // +500%
    { level: 300, boost: 3.5 },   // +350%
    { level: 200, boost: 2.5 },   // +250%
    { level: 100, boost: 1.5 },   // +150%
    { level: 50, boost: 1.0 },    // +100%
    { level: 25, boost: 0.5 },    // +50%
    { level: 10, boost: 0.25 },   // +25%
    { level: 5, boost: 0.1 },     // +10%
  ];

  for (const threshold of thresholds) {
    if (level >= threshold.level) {
      return threshold.boost;
    }
  }
  return 0;
};

/**
 * Calculate base passive income with manager boosts applied per element
 */
const calculateBasePassiveIncome = (state: GameState): number => {
  let totalBasePassive = (state.coinsPerSecondBase || 0); // Start with permanent base
  const managerBoosts = calculateManagerBoostMultiplier(state);

  state.upgrades.forEach(upgrade => {
    if (upgrade.category === 'element' && upgrade.coinsPerSecondBonus > 0) {
      const baseIncome = upgrade.coinsPerSecondBonus * upgrade.level;
      const levelBoostMultiplier = getLevelBoostMultiplier(upgrade.level);
      const managerBoost = managerBoosts[upgrade.id] || 1;
      totalBasePassive += baseIncome * (1 + levelBoostMultiplier) * managerBoost;
    }
  });

  const totalLevels = state.upgrades.reduce((sum, u) => sum + u.level, 0);
  const globalScaling = 1 + totalLevels / 1000; // +0.1% per 10 levels
  const passiveIncomeMultiplier = calculateAbilityPassiveMultiplier(state.abilities);
  const artifactProductionMultiplier = calculateArtifactProductionMultiplier(state);
  return totalBasePassive * globalScaling * passiveIncomeMultiplier * artifactProductionMultiplier;
};

/**
 * Calculate total CPS (Coins Per Second) with all multipliers applied
 */
export const calculateTotalCoinsPerSecond = (state: GameState): number => {
  const enhancedState = enhanceGameMechanics(state);
  return Math.max(0, enhancedState.coinsPerSecond + (state.permaPassiveBoosts || 0));
};

/**
 * Calculate manager boost multiplier per element
 */
export const calculateManagerBoostMultiplier = (state: GameState): Record<string, number> => {
  const elementBoosts: Record<string, number> = {};
  state.managers.forEach(manager => {
    if (state.ownedManagers.includes(manager.id) && manager.boosts) {
      let managerBoostValue = 0.5; // Base boost of 50%
      if (manager.perks) {
        const boostPerks = manager.perks.filter(perk =>
          (perk.unlocked || state.unlockedPerks.includes(perk.id)) &&
          perk.effect?.type === "elementBoost"
        );
        if (boostPerks.length > 0) {
          const highestPerk = boostPerks.sort((a, b) => b.effect.value - a.effect.value)[0];
          managerBoostValue += highestPerk.effect.value; // Add highest perk value
        }
      }
      manager.boosts.forEach(elementId => {
        elementBoosts[elementId] = (elementBoosts[elementId] || 1) * (1 + managerBoostValue);
      });
    }
  });
  return elementBoosts;
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
 * Calculate auto-tap income considering all boosts
 */
export const calculateAutoTapIncome = (state: GameState, tickInterval: number = 100): number => {
  const enhancedState = enhanceGameMechanics(state);

  if (!state.autoTap && !enhancedState.autoTapTapsPerSecond) return 0;

  const tapPowerUpgrade = state.upgrades.find(u => u.id === 'tap-power-1');
  const tapBoostMultiplier = tapPowerUpgrade ? 1 + (tapPowerUpgrade.level * tapPowerUpgrade.coinsPerClickBonus) : 1;
  const clickMultiplier = calculateClickMultiplier(state.ownedArtifacts);
  const baseClickValue = enhancedState.coinsPerClickBase || enhancedState.coinsPerClick;
  const coinsPerSecondBonus = enhancedState.coinsPerSecond * 0.05;
  const abilityTapMultiplier = calculateAbilityTapMultiplier(state.abilities);
  let baseTapValue = (baseClickValue + coinsPerSecondBonus) * clickMultiplier * tapBoostMultiplier * abilityTapMultiplier;

  // Apply tap boost to baseTapValue if active
  if (state.tapBoostActive && (state.tapBoostTapsRemaining || 0) > 0) {
    baseTapValue *= 5;
  }

  const baseAutoTapTapsPerSecond = state.autoTap ? 1 : 0;
  const boostAutoTapTapsPerSecond = enhancedState.autoTapTapsPerSecond || 0;

  if (boostAutoTapTapsPerSecond > 0) {
    const boostIncomePerSecond = baseTapValue * 5; // Auto-tap boost multiplier
    return boostIncomePerSecond * (tickInterval / 1000);
  }

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
  let totalCost = calculateBulkPurchaseCost(upgrade.baseCost, upgrade.level, quantity, 1.08);
  totalCost *= costReduction;

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

  return Math.max(0.5, costReduction);
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
 * Calculate essence reward with tiered progression
 */
export const calculateEssenceReward = (totalCoins: number, state: GameState): number => {
  if (totalCoins < 100000) return 0;

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

  const tempEssenceBoostStacks = state.tempEssenceBoostStacks || 0;
  const tempEssenceMultiplier = Math.pow(1.25, tempEssenceBoostStacks);

  return Math.floor(essence * multiplier * (state.essenceMultiplier || 1) * tempEssenceMultiplier);
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

export {
  enhanceGameMechanics,
  calculateTapValue,
  calculateBaseTapValue,
  getLevelBoostMultiplier,
  calculateBasePassiveIncome,
  calculateTotalCoinsPerSecond,
  calculateManagerBoostMultiplier,
  calculateArtifactProductionMultiplier,
  calculateAutoTapIncome,
  calculateUpgradeCost,
  calculateCostReduction,
  calculateBulkPurchaseCost,
  calculateMaxAffordableQuantity,
  calculateClickMultiplier,
  calculateAbilityTapMultiplier,
  calculateAbilityPassiveMultiplier,
  calculateGlobalIncomeMultiplier,
  calculateEssenceReward,
  checkUpgradeMilestone,
  calculateStartingCoins,
  isGoodValue
};
