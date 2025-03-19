
import { 
  GameState
} from '@/context/GameContext';

/**
 * Calculate the value of a single tap/click
 */
export const calculateTapValue = (state: GameState): number => {
  let tapPower = state.coinsPerClick;
  
  // Add permanent tap boosts
  const permanentTapBoosts = state.activeBoosts.filter(boost => boost.type === 'baseTapBoost');
  permanentTapBoosts.forEach(boost => {
    tapPower += boost.value;
  });
  
  // Apply multipliers from abilities
  const abilities = state.abilities.filter(a => a.unlocked);
  abilities.forEach(ability => {
    // Apply ability multipliers (example values)
    if (ability.id === 'ability-2' && ability.unlocked) tapPower *= 1.5;
    if (ability.id === 'ability-5' && ability.unlocked) tapPower *= 1.15;
    if (ability.id === 'ability-8' && ability.unlocked) tapPower *= 1.85;
    if (ability.id === 'ability-11' && ability.unlocked) tapPower *= 2.2;
  });
  
  // Apply tap boost multipliers
  const tapBoost = state.activeBoosts.find(boost => boost.type === 'tapMultiplier' && boost.remainingUses && boost.remainingUses > 0);
  if (tapBoost) {
    tapPower *= tapBoost.value;
  }
  
  // Apply global multiplier
  tapPower *= state.incomeMultiplier;
  
  return tapPower;
};

/**
 * Calculate the passive income per second
 */
export const calculatePassiveIncome = (state: GameState): number => {
  let baseIncome = state.coinsPerSecond;
  
  // Add permanent passive boosts
  const permanentPassiveBoosts = state.activeBoosts.filter(boost => boost.type === 'basePassiveBoost');
  permanentPassiveBoosts.forEach(boost => {
    baseIncome += boost.value;
  });
  
  // Apply artifact multipliers
  baseIncome *= calculateArtifactProductionMultiplier(state);
  
  // Apply global income multiplier
  baseIncome *= state.incomeMultiplier;
  
  // Apply active boosts
  const coinMultiplierBoost = state.activeBoosts.find(boost => boost.type === 'coinMultiplier');
  if (coinMultiplierBoost) {
    baseIncome *= coinMultiplierBoost.value;
  }
  
  return baseIncome;
};

/**
 * Calculate auto-tap income
 */
export const calculateAutoTapIncome = (state: GameState): number => {
  if (!state.autoTap) return 0;
  
  const tapValue = calculateTapValue(state);
  
  // Check for auto-tap boost
  const autoTapBoost = state.activeBoosts.find(boost => boost.type === 'autoTap');
  const autoTapRate = autoTapBoost ? autoTapBoost.value : 1;
  
  return tapValue * autoTapRate * 0.1; // Assuming 10 ticks per second (0.1s per tick)
};

/**
 * Calculate cost reduction from abilities and other sources
 */
export const calculateCostReduction = (state: GameState): number => {
  let reduction = 1;
  
  // Check for cost reduction boost
  const costReductionBoost = state.activeBoosts.find(boost => boost.type === 'costReduction');
  if (costReductionBoost) {
    reduction *= costReductionBoost.value;
  }
  
  // Apply ability bonuses
  const abilities = state.abilities.filter(a => a.unlocked);
  abilities.forEach(ability => {
    if (ability.id === 'ability-3' && ability.unlocked) reduction *= 0.95;
    if (ability.id === 'ability-4' && ability.unlocked) reduction *= 0.85;
    if (ability.id === 'ability-9' && ability.unlocked) reduction *= 0.7;
    if (ability.id === 'ability-12' && ability.unlocked) reduction *= 0.55;
  });
  
  return reduction;
};

/**
 * Calculate the global income multiplier from all sources
 */
export const calculateGlobalIncomeMultiplier = (state: GameState): number => {
  let multiplier = state.incomeMultiplier;
  
  // Include boost multipliers
  const coinMultiplierBoost = state.activeBoosts.find(boost => boost.type === 'coinMultiplier');
  if (coinMultiplierBoost) {
    multiplier *= coinMultiplierBoost.value;
  }
  
  // Apply ability multipliers
  const abilities = state.abilities.filter(a => a.unlocked);
  abilities.forEach(ability => {
    if (ability.id === 'ability-3' && ability.unlocked) multiplier *= 1.4;
    if (ability.id === 'ability-6' && ability.unlocked) multiplier *= 1.45;
    if (ability.id === 'ability-10' && ability.unlocked) multiplier *= 1.55;
    if (ability.id === 'ability-11' && ability.unlocked) multiplier *= 1.8;
    if (ability.id === 'ability-13' && ability.unlocked) multiplier *= 2.0;
  });
  
  return multiplier;
};

/**
 * Calculate the artifact production multiplier
 */
export const calculateArtifactProductionMultiplier = (state: GameState): number => {
  let multiplier = 1;
  
  // Add multipliers from artifacts
  state.ownedArtifacts.forEach(artifactId => {
    const artifact = state.artifacts.find(a => a.id === artifactId);
    if (artifact && artifact.effect?.type === 'production') {
      multiplier += artifact.effect.value;
    }
  });
  
  // Apply ability bonuses for passive income
  const abilities = state.abilities.filter(a => a.unlocked);
  abilities.forEach(ability => {
    if (ability.id === 'ability-2' && ability.unlocked) multiplier *= 1.25;
    if (ability.id === 'ability-4' && ability.unlocked) multiplier *= 1.2;
    if (ability.id === 'ability-6' && ability.unlocked) multiplier *= 1.3;
    if (ability.id === 'ability-8' && ability.unlocked) multiplier *= 1.55;
    if (ability.id === 'ability-9' && ability.unlocked) multiplier *= 1.65;
    if (ability.id === 'ability-12' && ability.unlocked) multiplier *= 2;
  });
  
  return multiplier;
};

/**
 * Calculate starting coins after prestige
 */
export const calculateStartingCoins = (ownedArtifacts: string[]): number => {
  const BASE_STARTING_COINS = 0;
  let bonus = 0;
  
  // Add starting coin bonuses from artifacts
  ownedArtifacts.forEach(artifactId => {
    // Example implementation - you'd need to reference the actual artifacts data
    if (artifactId === 'artifact-ancient-coin') bonus += 100;
    if (artifactId === 'artifact-treasure-chest') bonus += 500;
    if (artifactId === 'artifact-wealth-orb') bonus += 1000;
  });
  
  return BASE_STARTING_COINS + bonus;
};

/**
 * Check if an upgrade level crossing a milestone should award skill points
 */
export const checkUpgradeMilestone = (oldLevel: number, newLevel: number): boolean => {
  const milestones = [10, 25, 50, 100, 200, 500, 1000];
  return milestones.some(milestone => 
    oldLevel < milestone && newLevel >= milestone
  );
};

/**
 * Calculate the essence reward for prestiging
 */
export const calculateEssenceReward = (totalCoins: number, state: GameState): number => {
  // Base formula for essence calculation
  const baseEssence = Math.floor(Math.sqrt(totalCoins / 1e4));
  
  // Apply essence multiplier from abilities
  let multiplier = 1;
  
  state.abilities.forEach(ability => {
    if (ability.unlocked) {
      if (ability.id === 'ability-7') multiplier *= 1.15;
      if (ability.id === 'ability-10') multiplier *= 1.2;
      if (ability.id === 'ability-13') multiplier *= 1.35;
    }
  });
  
  // Apply essence boost if active
  const essenceBoost = state.activeBoosts.find(boost => boost.type === 'essenceMultiplier');
  if (essenceBoost) {
    multiplier *= essenceBoost.value;
  }
  
  return Math.max(1, Math.floor(baseEssence * multiplier));
};

/**
 * Calculate the boost from managers
 */
export const calculateManagerBoost = (state: GameState, categoryId: string): number => {
  let boost = 0;
  
  state.ownedManagers.forEach(managerId => {
    const manager = state.managers.find(m => m.id === managerId);
    if (manager && manager.boosts) {
      manager.boosts.forEach(boostItem => {
        if (boostItem.category === categoryId) {
          boost += boostItem.value;
        }
      });
    }
  });
  
  return boost;
};

/**
 * Calculate the cost to purchase multiple upgrades at once
 */
export const calculateBulkPurchaseCost = (
  baseCost: number,
  currentLevel: number,
  quantity: number,
  growthRate: number
): number => {
  let totalCost = 0;
  
  for (let i = 0; i < quantity; i++) {
    totalCost += Math.floor(baseCost * Math.pow(growthRate, currentLevel + i));
  }
  
  return totalCost;
};

/**
 * Calculate the maximum number of upgrades that can be purchased with current coins
 */
export const calculateMaxAffordableQuantity = (
  availableCoins: number,
  baseCost: number,
  currentLevel: number,
  growthRate: number
): number => {
  let quantity = 0;
  let cost = 0;
  let nextUpgradeCost = 0;
  
  do {
    nextUpgradeCost = Math.floor(baseCost * Math.pow(growthRate, currentLevel + quantity));
    if (cost + nextUpgradeCost <= availableCoins) {
      cost += nextUpgradeCost;
      quantity++;
    } else {
      break;
    }
  } while (true);
  
  return quantity;
};
