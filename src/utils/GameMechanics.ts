import { GameState, Ability, Upgrade } from '@/context/GameContext';
import { isGoodValue } from '@/utils/gameLogic';

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
  if (state.coinsPerSecond <= 0) return 0;
  
  // Apply ability boosts to passive income
  const passiveIncomeMultiplier = calculateAbilityPassiveMultiplier(state.abilities);
  
  // Apply artifact global production boosts to passive income
  const artifactProductionMultiplier = calculateArtifactProductionMultiplier(state);
  
  // Apply manager element boosts
  const managerBoostMultiplier = calculateManagerBoostMultiplier(state);
  
  // Return the total CPS with all multipliers applied
  return state.coinsPerSecond * 
         passiveIncomeMultiplier * 
         artifactProductionMultiplier *
         managerBoostMultiplier;
};

/**
 * Calculate artifact production multiplier based on owned artifacts and their perks
 */
export const calculateArtifactProductionMultiplier = (state: GameState): number => {
  let multiplier = 1;
  
  // Check for artifact-1 (Quantum Computer)
  if (state.ownedArtifacts.includes("artifact-1")) {
    // Find the artifact
    const artifact = state.artifacts.find(a => a.id === "artifact-1");
    if (artifact && artifact.effect) {
      // Get base effect value
      multiplier += artifact.effect.value;
      
      // Check for unlocked perks
      if (artifact.perks) {
        const unlockedPerks = artifact.perks.filter(perk => 
          perk.unlocked || state.unlockedPerks.includes(perk.id)
        );
        
        // If perks are unlocked, use the highest value perk instead of base value
        if (unlockedPerks.length > 0) {
          // Sort by effect value in descending order and take the highest
          const highestPerk = unlockedPerks.sort((a, b) => 
            b.effect.value - a.effect.value
          )[0];
          
          // Replace base multiplier with perk multiplier (subtract base and add perk value)
          multiplier = multiplier - artifact.effect.value + highestPerk.effect.value;
        }
      }
    }
  }
  
  // Check for artifact-6 (Neutron Wand)
  if (state.ownedArtifacts.includes("artifact-6")) {
    // Find the artifact
    const artifact = state.artifacts.find(a => a.id === "artifact-6");
    if (artifact && artifact.effect) {
      // Get base effect value
      multiplier += artifact.effect.value;
      
      // Check for unlocked perks
      if (artifact.perks) {
        const unlockedPerks = artifact.perks.filter(perk => 
          perk.unlocked || state.unlockedPerks.includes(perk.id)
        );
        
        // If perks are unlocked, use the highest value perk instead of base value
        if (unlockedPerks.length > 0) {
          // Sort by effect value in descending order and take the highest
          const highestPerk = unlockedPerks.sort((a, b) => 
            b.effect.value - a.effect.value
          )[0];
          
          // Replace base multiplier with perk multiplier (subtract base and add perk value)
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
  
  // Process each manager
  state.managers.forEach(manager => {
    if (state.ownedManagers.includes(manager.id) && manager.boosts) {
      // Get base boost value (50% by default)
      let managerBoostValue = 0.5; // 50% boost
      
      // Check for unlocked perks that enhance element boost
      if (manager.perks) {
        const unlockedPerks = manager.perks.filter(perk => 
          perk.unlocked || state.unlockedPerks.includes(perk.id)
        );
        
        // Find highest boost perk if any
        const boostPerks = unlockedPerks.filter(perk => 
          perk.effect && perk.effect.type === "elementBoost"
        );
        
        if (boostPerks.length > 0) {
          // Sort by effect value in descending order and take the highest
          const highestPerk = boostPerks.sort((a, b) => 
            b.effect.value - a.effect.value
          )[0];
          
          // Replace base boost with perk boost
          managerBoostValue = highestPerk.effect.value;
        }
      }
      
      // Apply the boost to the relevant elements
      // Each manager boosts the elements listed in their "boosts" array
      // We add the boost percentage to the total multiplier
      manager.boosts.forEach(elementId => {
        // Find the upgrade for this element
        const elementUpgrade = state.upgrades.find(u => u.id === elementId);
        if (elementUpgrade) {
          // Calculate this element's contribution to total CPS
          const elementCPS = elementUpgrade.coinsPerSecondBonus * elementUpgrade.level;
          const elementBoost = elementCPS * managerBoostValue;
          
          // Add proportional boost to total multiplier based on this element's percentage of total CPS
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

  // Get tap multiplier from tap power upgrade
  const tapPowerUpgrade = state.upgrades.find(u => u.id === 'tap-power-1');
  const tapBoostMultiplier = tapPowerUpgrade ? 1 + (tapPowerUpgrade.level * tapPowerUpgrade.coinsPerClickBonus) : 1;
  
  const clickMultiplier = calculateClickMultiplier(state.ownedArtifacts);
  
  // Auto tap is 40% as effective as manual clicks
  const baseClickValue = state.coinsPerClick * 0.35;
  const coinsPerSecondBonus = state.coinsPerSecond * 0.05;
  
  // Scale for the tick interval
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
  
  // Apply cost reduction from abilities, artifacts, etc.
  const costReduction = calculateCostReduction(state);
  
  // Calculate cost for bulk purchase
  return Math.floor(calculateBulkPurchaseCost(
    upgrade.baseCost, 
    upgrade.level, 
    quantity, 
    1.15 // UPGRADE_COST_GROWTH
  ) * costReduction);
};

/**
 * Calculate the total cost reduction from all sources
 */
export const calculateCostReduction = (state: GameState): number => {
  let costReduction = 1.0; // Start with no reduction (multiplier of 1)
  
  // Apply artifact cost reductions
  if (state.ownedArtifacts.includes("artifact-1")) { // Cosmic Abacus
    costReduction -= 0.05; // 5% reduction
  }
  if (state.ownedArtifacts.includes("artifact-6")) { // Astral Calculator
    costReduction -= 0.1; // 10% reduction
  }
  
  // Apply ability cost reductions
  if (state.abilities.find(a => a.id === "ability-3" && a.unlocked)) {
    costReduction -= 0.05; // Neural Mining Matrix: 5% cost reduction
  }
  if (state.abilities.find(a => a.id === "ability-4" && a.unlocked)) {
    costReduction -= 0.15; // Graviton Shield Generator: 15% cost reduction
  }
  if (state.abilities.find(a => a.id === "ability-9" && a.unlocked)) {
    costReduction -= 0.30; // Nano-Bot Mining Swarm: 30% cost reduction
  }
  if (state.abilities.find(a => a.id === "ability-12" && a.unlocked)) {
    costReduction -= 0.45; // Quantum Tunneling Drill: 45% cost reduction
  }
  
  // Apply manager perk cost reductions
  // Iterate through managers and check for unlocked cost reduction perks
  state.managers.forEach(manager => {
    if (state.ownedManagers.includes(manager.id) && manager.perks) {
      manager.perks.forEach(perk => {
        if (perk.unlocked && perk.effect.type === 'cost-reduction') {
          costReduction -= perk.effect.value;
        }
      });
    }
  });
  
  // Ensure cost reduction doesn't go below 50%
  return Math.max(0.5, costReduction);
};

/**
 * Calculate bulk purchase cost for multiple levels of an upgrade
 * Uses the sum of geometric series formula
 */
export const calculateBulkPurchaseCost = (
  baseCost: number, 
  currentLevel: number, 
  quantity: number, 
  growthRate: number = 1.15
): number => {
  // Sum of geometric series: a * (1 - r^n) / (1 - r)
  // Where a is the first term (baseCost * growthRate^currentLevel)
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
  // Solve for n in: coins = baseCost * growthRate^currentLevel * (1 - growthRate^n) / (1 - growthRate)
  const a = baseCost * Math.pow(growthRate, currentLevel);
  const term = (coins * (1 - growthRate)) / a;
  const rightSide = 1 - term;
  
  // Handle edge cases
  if (rightSide <= 0) {
    // Player can afford a very large quantity
    return 1000; // Set an arbitrary high limit to prevent performance issues
  }
  
  // Calculate the quantity: n = log(rightSide) / log(growthRate)
  return Math.floor(Math.log(rightSide) / Math.log(growthRate));
};

/**
 * Calculate click multiplier from artifacts and other sources
 */
export const calculateClickMultiplier = (ownedArtifacts: string[] = []): number => {
  let multiplier = 1;
  
  if (ownedArtifacts.includes("artifact-2")) { // Space Rocket
    multiplier += 0.5; // adds 50% (1.5x multiplier)
  }
  if (ownedArtifacts.includes("artifact-7")) { // Molecular Flask
    multiplier += 1.5; // adds 150% (additional 2.5x multiplier)
  }
  
  return multiplier;
};

/**
 * Calculate ability tap/click multiplier
 */
export const calculateAbilityTapMultiplier = (abilities: Ability[]): number => {
  let multiplier = 1;
  
  if (abilities.find(a => a.id === "ability-2" && a.unlocked)) {
    multiplier += 0.5; // Quantum Vibration Enhancer: +50% tap power
  }
  if (abilities.find(a => a.id === "ability-8" && a.unlocked)) {
    multiplier += 0.85; // Plasma Discharge Excavator: +85% tap value
  }
  if (abilities.find(a => a.id === "ability-11" && a.unlocked)) {
    multiplier += 1.2; // Supernova Core Extractor: +120% tap value
  }
  
  return multiplier;
};

/**
 * Calculate ability passive income multiplier
 */
export const calculateAbilityPassiveMultiplier = (abilities: Ability[]): number => {
  let multiplier = 1;
  
  if (abilities.find(a => a.id === "ability-2" && a.unlocked)) {
    multiplier += 0.25; // Quantum Vibration Enhancer: +25% passive income
  }
  if (abilities.find(a => a.id === "ability-4" && a.unlocked)) {
    multiplier += 0.2; // Graviton Shield Generator: +20% passive income
  }
  if (abilities.find(a => a.id === "ability-6" && a.unlocked)) {
    multiplier += 0.3; // Dark Matter Attractor: +30% passive income
  }
  if (abilities.find(a => a.id === "ability-8" && a.unlocked)) {
    multiplier += 0.55; // Plasma Discharge Excavator: +55% passive income
  }
  if (abilities.find(a => a.id === "ability-9" && a.unlocked)) {
    multiplier += 0.65; // Nano-Bot Mining Swarm: +65% passive income
  }
  if (abilities.find(a => a.id === "ability-12" && a.unlocked)) {
    multiplier += 1.0; // Quantum Tunneling Drill: doubles passive income
  }
  
  return multiplier;
};

/**
 * Calculate global income multiplier from all sources
 * (Only applies to abilities now, not artifacts)
 */
export const calculateGlobalIncomeMultiplier = (state: GameState): number => {
  let multiplier = 1;
  
  // Apply ability global income boosts
  if (state.abilities.find(a => a.id === "ability-3" && a.unlocked)) {
    multiplier += 0.4; // Neural Mining Matrix: +40% all income
  }
  if (state.abilities.find(a => a.id === "ability-6" && a.unlocked)) {
    multiplier += 0.45; // Dark Matter Attractor: +45% all income
  }
  if (state.abilities.find(a => a.id === "ability-10" && a.unlocked)) {
    multiplier += 0.55; // Interstellar Navigation AI: +55% global income
  }
  if (state.abilities.find(a => a.id === "ability-11" && a.unlocked)) {
    multiplier += 0.8; // Supernova Core Extractor: +80% all income
  }
  if (state.abilities.find(a => a.id === "ability-13" && a.unlocked)) {
    multiplier += 1.0; // Cosmic Singularity Engine: +100% all income
  }
  
  // Apply manager perk income multipliers (keeping this logic for any global multipliers)
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
  if (totalCoins < 100000) return 0; // Minimum 100K coins to get any essence
  
  // New exponential scaling formula based on coin thresholds
  // First 5 essence: 1 per 100K coins up to 500K
  // Next 5 essence: 1 per 200K coins up to 1.5M
  // Next 5 essence: 1 per 400K coins up to 3.5M
  // And so on, doubling the requirement each tier
  
  let essence = 0;
  let remaining = totalCoins;
  let threshold = 100000;
  let tierSize = 5; // 5 essence per tier
  let tierProgress = 0;
  
  while (remaining >= threshold && essence < 1000) { // Cap at 1000 essence for safety
    // Add an essence point
    essence++;
    tierProgress++;
    remaining -= threshold;
    
    // Check if we finished a tier
    if (tierProgress >= tierSize) {
      tierProgress = 0;
      threshold *= 2; // Double the requirement for the next tier
    }
  }
  
  // Apply artifact bonuses
  let multiplier = 1;
  if (state.ownedArtifacts.includes("artifact-3")) { // Element Scanner
    multiplier += 0.25; // 25% more essence
  }
  if (state.ownedArtifacts.includes("artifact-8")) { // Quantum Microscope
    multiplier += 0.5; // 50% more essence
  }
  
  // Apply ability bonuses for essence rewards
  if (state.abilities.find(a => a.id === "ability-7" && a.unlocked)) {
    multiplier += 0.15; // Galactic Achievement Scanner: +15% essence
  }
  if (state.abilities.find(a => a.id === "ability-10" && a.unlocked)) {
    multiplier += 0.2; // Interstellar Navigation AI: +20% essence rewards
  }
  if (state.abilities.find(a => a.id === "ability-13" && a.unlocked)) {
    multiplier += 0.35; // Cosmic Singularity Engine: +35% essence gain
  }
  
  // Apply manager and artifact perk bonuses for essence
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
  
  if (ownedArtifacts.includes("artifact-4")) { // Cosmic Seed
    startingCoins += 1000; // Start with 1,000 coins
  }
  if (ownedArtifacts.includes("artifact-9")) { // Neutron Shard
    startingCoins += 10000; // Additional 10,000 coins
  }
  
  return startingCoins;
};

/**
 * Evaluate if an upgrade is a good value (worth buying)
 */
export const isGoodValue = (cost: number, coinsPerSecondBonus: number): boolean => {
  if (coinsPerSecondBonus <= 0) return false;
  
  // Calculate how many seconds it would take to earn back the investment
  const paybackPeriod = cost / coinsPerSecondBonus;
  
  // If it pays for itself in less than 100 seconds, it's a good value
  return paybackPeriod < 100;
};

/**
 * Helper for calculating upgrade values
 */
const calculateUpgradeValue = (upgrade: Upgrade, level: number): number => {
  if (upgrade.category === 'tap') {
    // For tap power upgrades
    return level * (upgrade.coinsPerClickBonus || 0);
  } else {
    // For element and production upgrades
    return level * (upgrade.coinsPerSecondBonus || 0);
  }
};
