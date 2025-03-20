import { GameState, Ability } from '@/context/GameContext';
import { calculateClickMultiplier as utilsCalculateClickMultiplier } from '@/hooks/useGameMechanics';
import { INVENTORY_ITEMS } from '@/components/menu/types'; // Added for boost effects

/**
 * GameMechanics.ts
 * 
 * This file centralizes all game mechanics calculations, including:
 * - Income calculations (per click and passive)
 * - Upgrade costs and effects
 * - Boost effects from abilities, managers, artifacts, perks
 * - Resource gain calculations (coins, essence)
 */

/**
 * Calculate the total tap/click value considering all boosts
 */
export const calculateTapValue = (state: GameState): number => {
  // Get tap multiplier from tap power upgrade
  const tapPowerUpgrade = state.upgrades.find(u => u.id === 'tap-power-1');
  const tapBoostMultiplier = tapPowerUpgrade ? 1 + (tapPowerUpgrade.level * tapPowerUpgrade.coinsPerClickBonus) : 1;
  
  // Get click multiplier from artifacts
  const clickMultiplier = calculateClickMultiplier(state.ownedArtifacts);
  
  // Base click value plus a small percentage of coins per second
  const baseClickValue = state.coinsPerClick;
  const coinsPerSecondBonus = state.coinsPerSecond * 0.05;
  
  // Apply ability boosts to tap value
  const abilityTapMultiplier = calculateAbilityTapMultiplier(state.abilities);
  
  // Apply all multipliers
  return (baseClickValue + coinsPerSecondBonus) * 
         clickMultiplier * 
         tapBoostMultiplier * 
         abilityTapMultiplier;
};

/**
 * Calculate passive income considering all boosts
 */
export const calculatePassiveIncome = (state: GameState, tickInterval: number = 100): number => {
  if (state.coinsPerSecond <= 0) return 0;
  
  // Apply ability boosts to passive income
  const passiveIncomeMultiplier = calculateAbilityPassiveMultiplier(state.abilities);
  
  // Apply artifact global production boosts to passive income
  const artifactProductionMultiplier = calculateArtifactProductionMultiplier(state);
  
  // Apply manager element boosts
  const managerBoostMultiplier = calculateManagerBoostMultiplier(state);
  
  // Calculate passive income scaled for the tick interval (in milliseconds)
  return (state.coinsPerSecond / (1000 / tickInterval)) * 
         passiveIncomeMultiplier * 
         artifactProductionMultiplier *
         managerBoostMultiplier;
};

/**
 * Calculate the total CPS (Coins Per Second) with all multipliers applied
 * This is for display purposes in the stats panel
 */
export const calculateTotalCoinsPerSecond = (state: GameState): number => {
  // Start with base CPS
  let baseCPS = state.coinsPerSecond;
  
  // Add permanent passive boost
  if (state.boosts["boost-perma-passive"]?.purchased) {
    baseCPS += state.boosts["boost-perma-passive"].purchased * INVENTORY_ITEMS.PERMA_PASSIVE.effect!.value;
  }
  
  if (baseCPS <= 0) return 0;
  
  // Apply ability boosts to passive income
  const passiveIncomeMultiplier = calculateAbilityPassiveMultiplier(state.abilities);
  
  // Apply artifact global production boosts to passive income
  const artifactProductionMultiplier = calculateArtifactProductionMultiplier(state);
  
  // Apply manager element boosts
  const managerBoostMultiplier = calculateManagerBoostMultiplier(state);
  
  // Apply coin multiplier from boosts
  const coinMultiplier = calculateCoinMultiplier(state);
  
  // Return the total CPS with all multipliers applied
  return baseCPS * 
         passiveIncomeMultiplier * 
         artifactProductionMultiplier * 
         managerBoostMultiplier * 
         coinMultiplier;
};

/**
 * Calculate coin multiplier from active boosts
 */
export const calculateCoinMultiplier = (state: GameState): number => {
  let multiplier = 1;
  if (state.boosts["boost-double-coins"]?.active) {
    multiplier *= INVENTORY_ITEMS.DOUBLE_COINS.effect!.value;
  }
  // Add other coin-affecting boosts here if introduced in the future
  return multiplier;
};

/**
 * Calculate artifact production multiplier based on owned artifacts and their perks
 */
export const calculateArtifactProductionMultiplier = (state: GameState): number => {
  let multiplier = 1;
  
  // Check for artifact-1 (Quantum Computer)
  if (state.ownedArtifacts.includes("artifact-1")) {
    const artifact = state.artifacts.find(a => a.id === "artifact-1");
    if (artifact && artifact.effect) {
      multiplier += artifact.effect.value;
      if (artifact.perks) {
        const unlockedPerks = artifact.perks.filter(perk => 
          perk.unlocked || state.unlockedPerks.includes(perk.id)
        );
        if (unlockedPerks.length > 0) {
          const highestPerk = unlockedPerks.sort((a, b) => 
            b.effect.value - a.effect.value
          )[0];
          multiplier = multiplier - artifact.effect.value + highestPerk.effect.value;
        }
      }
    }
  }
  
  // Check for artifact-6 (Neutron Wand)
  if (state.ownedArtifacts.includes("artifact-6")) {
    const artifact = state.artifacts.find(a => a.id === "artifact-6");
    if (artifact && artifact.effect) {
      multiplier += artifact.effect.value;
      if (artifact.perks) {
        const unlockedPerks = artifact.perks.filter(perk => 
          perk.unlocked || state.unlockedPerks.includes(perk.id)
        );
        if (unlockedPerks.length > 0) {
          const highestPerk = unlockedPerks.sort((a, b) => 
            b.effect.value - a.effect.value
          )[0];
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
          const highestPerk = boostPerks.sort((a, b) => 
            b.effect.value - a.effect.value
          )[0];
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
  if (!state.autoTap) return 0;

  const tapPowerUpgrade = state.upgrades.find(u => u.id === 'tap-power-1');
  const tapBoostMultiplier = tapPowerUpgrade ? 1 + (tapPowerUpgrade.level * tapPowerUpgrade.coinsPerClickBonus) : 1;
  
  const clickMultiplier = calculateClickMultiplier(state.ownedArtifacts);
  
  const baseClickValue = state.coinsPerClick * 0.35;
  const coinsPerSecondBonus = state.coinsPerSecond * 0.05;
  
  return (baseClickValue + coinsPerSecondBonus) * 
         state.incomeMultiplier * 
         clickMultiplier * 
         0.4 * 
         tapBoostMultiplier * 
         (tickInterval / 1000);
};

/**
 * Calculate costs for upgrades with all reductions
 */
export const calculateUpgradeCost = (
  state: GameState,
  upgradeId: string,
  quantity: number = 1
): number => {
  const upgrade = state.upgrades.find(u => u.id === upgradeId);
  if (!upgrade) return Infinity;
  
  const costReduction = calculateCostReduction(state);
  
  return Math.floor(calculateBulkPurchaseCost(
    upgrade.baseCost, 
    upgrade.level, 
    quantity, 
    1.15
  ) * costReduction);
};

/**
 * Calculate the total cost reduction from all sources
 */
export const calculateCostReduction = (state: GameState): number => {
  let costReduction = 1.0;
  
  if (state.ownedArtifacts.includes("artifact-1")) {
    costReduction -= 0.05;
  }
  if (state.ownedArtifacts.includes("artifact-6")) {
    costReduction -= 0.1;
  }
  
  if (state.abilities.find(a => a.id === "ability-3" && a.unlocked)) {
    costReduction -= 0.05;
  }
  if (state.abilities.find(a => a.id === "ability-4" && a.unlocked)) {
    costReduction -= 0.15;
  }
  if (state.abilities.find(a => a.id === "ability-9" && a.unlocked)) {
    costReduction -= 0.30;
  }
  if (state.abilities.find(a => a.id === "ability-12" && a.unlocked)) {
    costReduction -= 0.45;
  }
  
  state.managers.forEach(manager => {
    if (state.ownedManagers.includes(manager.id) && manager.perks) {
      manager.perks.forEach(perk => {
        if (perk.unlocked && perk.effect.type === 'cost-reduction') {
          costReduction -= perk.effect.value;
        }
      });
    }
  });
  
  return Math.max(0.5, costReduction);
};

/**
 * Calculate bulk purchase cost for multiple levels of an upgrade
 */
export const calculateBulkPurchaseCost = (
  baseCost: number, 
  currentLevel: number, 
  quantity: number, 
  growthRate: number = 1.15
): number => {
  const a = baseCost * Math.pow(growthRate, currentLevel);
  return Math.floor(a * (1 - Math.pow(growthRate, quantity)) / (1 - growthRate));
};

/**
 * Calculate maximum affordable quantity of an upgrade
 */
export const calculateMaxAffordableQuantity = (
  coins: number, 
  baseCost: number, 
  currentLevel: number, 
  growthRate: number = 1.15
): number => {
  const a = baseCost * Math.pow(growthRate, currentLevel);
  const term = (coins * (1 - growthRate)) / a;
  const rightSide = 1 - term;
  
  if (rightSide <= 0) {
    return 1000;
  }
  
  return Math.floor(Math.log(rightSide) / Math.log(growthRate));
};

/**
 * Calculate click multiplier from artifacts and other sources
 */
export const calculateClickMultiplier = (ownedArtifacts: string[] = []): number => {
  let multiplier = 1;
  
  if (ownedArtifacts.includes("artifact-2")) {
    multiplier += 0.5;
  }
  if (ownedArtifacts.includes("artifact-7")) {
    multiplier += 1.5;
  }
  
  return multiplier;
};

/**
 * Calculate ability tap/click multiplier
 */
export const calculateAbilityTapMultiplier = (abilities: Ability[]): number => {
  let multiplier = 1;
  
  if (abilities.find(a => a.id === "ability-2" && a.unlocked)) {
    multiplier += 0.5;
  }
  if (abilities.find(a => a.id === "ability-8" && a.unlocked)) {
    multiplier += 0.85;
  }
  if (abilities.find(a => a.id === "ability-11" && a.unlocked)) {
    multiplier += 1.2;
  }
  
  return multiplier;
};

/**
 * Calculate ability passive income multiplier
 */
export const calculateAbilityPassiveMultiplier = (abilities: Ability[]): number => {
  let multiplier = 1;
  
  if (abilities.find(a => a.id === "ability-2" && a.unlocked)) {
    multiplier += 0.25;
  }
  if (abilities.find(a => a.id === "ability-4" && a.unlocked)) {
    multiplier += 0.2;
  }
  if (abilities.find(a => a.id === "ability-6" && a.unlocked)) {
    multiplier += 0.3;
  }
  if (abilities.find(a => a.id === "ability-8" && a.unlocked)) {
    multiplier += 0.55;
  }
  if (abilities.find(a => a.id === "ability-9" && a.unlocked)) {
    multiplier += 0.65;
  }
  if (abilities.find(a => a.id === "ability-12" && a.unlocked)) {
    multiplier += 1.0;
  }
  
  return multiplier;
};

/**
 * Calculate global income multiplier from all sources
 */
export const calculateGlobalIncomeMultiplier = (state: GameState): number => {
  let multiplier = 1;
  
  if (state.abilities.find(a => a.id === "ability-3" && a.unlocked)) {
    multiplier += 0.4;
  }
  if (state.abilities.find(a => a.id === "ability-6" && a.unlocked)) {
    multiplier += 0.45;
  }
  if (state.abilities.find(a => a.id === "ability-10" && a.unlocked)) {
    multiplier += 0.55;
  }
  if (state.abilities.find(a => a.id === "ability-11" && a.unlocked)) {
    multiplier += 0.8;
  }
  if (state.abilities.find(a => a.id === "ability-13" && a.unlocked)) {
    multiplier += 1.0;
  }
  
  state.managers.forEach(manager => {
    if (state.ownedManagers.includes(manager.id) && manager.perks) {
      manager.perks.forEach(perk => {
        if (perk.unlocked && perk.effect && perk.effect.type === 'income-multiplier') {
          multiplier += perk.effect.value;
        }
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
  if (state.ownedArtifacts.includes("artifact-3")) {
    multiplier += 0.25;
  }
  if (state.ownedArtifacts.includes("artifact-8")) {
    multiplier += 0.5;
  }
  
  if (state.abilities.find(a => a.id === "ability-7" && a.unlocked)) {
    multiplier += 0.15;
  }
  if (state.abilities.find(a => a.id === "ability-10" && a.unlocked)) {
    multiplier += 0.2;
  }
  if (state.abilities.find(a => a.id === "ability-13" && a.unlocked)) {
    multiplier += 0.35;
  }
  
  state.managers.forEach(manager => {
    if (state.ownedManagers.includes(manager.id) && manager.perks) {
      manager.perks.forEach(perk => {
        if (perk.unlocked && perk.effect.type === 'essence-bonus') {
          multiplier += perk.effect.value;
        }
      });
    }
  });
  
  state.artifacts.forEach(artifact => {
    if (state.ownedArtifacts.includes(artifact.id) && artifact.perks) {
      artifact.perks.forEach(perk => {
        if (perk.unlocked && perk.effect.type === 'essence-bonus') {
          multiplier += perk.effect.value;
        }
      });
    }
  });
  
  return Math.floor(essence * multiplier);
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
  
  if (ownedArtifacts.includes("artifact-4")) {
    startingCoins += 1000;
  }
  if (ownedArtifacts.includes("artifact-9")) {
    startingCoins += 10000;
  }
  
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
