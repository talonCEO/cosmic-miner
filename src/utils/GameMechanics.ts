import { GameState } from './GameContext';
import { INVENTORY_ITEMS } from '@/components/menu/types';

export const calculateTapValue = (state: GameState): number => {
  let tapPowerUpgrade = state.upgrades.find(u => u.id === 'tap-power-1');
  let tapBoostMultiplier = tapPowerUpgrade ? 1 + (tapPowerUpgrade.level * tapPowerUpgrade.coinsPerClickBonus) : 1;
  let clickMultiplier = calculateClickMultiplier(state.ownedArtifacts);
  let baseClickValue = state.coinsPerClick;
  let coinsPerSecondBonus = state.coinsPerSecond * 0.05;
  let abilityTapMultiplier = calculateAbilityTapMultiplier(state.abilities);

  // Apply TAP_BOOST (5x for 100 taps)
  if (state.boosts["boost-tap-boost"]?.active && state.boosts["boost-tap-boost"].remainingUses) {
    tapBoostMultiplier *= INVENTORY_ITEMS.TAP_BOOST.effect!.value; // 5x multiplier
  }

  // Apply PERMA_TAP (permanent +1 per use)
  if (state.boosts["boost-perma-tap"]?.purchased) {
    baseClickValue += state.boosts["boost-perma-tap"].purchased * INVENTORY_ITEMS.PERMA_TAP.effect!.value;
  }

  return (baseClickValue + coinsPerSecondBonus) * clickMultiplier * tapBoostMultiplier * abilityTapMultiplier;
};

export const calculatePassiveIncome = (state: GameState, tickInterval: number = 100): number => {
  if (state.coinsPerSecond <= 0) return 0;

  let passiveIncomeMultiplier = calculateAbilityPassiveMultiplier(state.abilities);
  let artifactProductionMultiplier = calculateArtifactProductionMultiplier(state);
  let managerBoostMultiplier = calculateManagerBoostMultiplier(state);

  // Apply DOUBLE_COINS (x2 multiplier)
  if (state.boosts["boost-double-coins"]?.active) {
    passiveIncomeMultiplier *= INVENTORY_ITEMS.DOUBLE_COINS.effect!.value; // x2
  }

  // Apply PERMA_PASSIVE (permanent +1 per use)
  let basePassive = state.coinsPerSecond;
  if (state.boosts["boost-perma-passive"]?.purchased) {
    basePassive += state.boosts["boost-perma-passive"].purchased * INVENTORY_ITEMS.PERMA_PASSIVE.effect!.value;
  }

  // Apply AUTO_TAP (5 taps/sec for 2 minutes base, +2 minutes per additional)
  let autoTapIncome = 0;
  if (state.boosts["boost-auto-tap"]?.active) {
    const tapsPerSecond = INVENTORY_ITEMS.AUTO_TAP.effect!.value; // 5 taps/sec
    const tapValue = calculateTapValue(state);
    autoTapIncome = tapValue * tapsPerSecond * (tickInterval / 1000); // Scaled for tick interval
  }

  return (basePassive / (1000 / tickInterval)) * passiveIncomeMultiplier * artifactProductionMultiplier * managerBoostMultiplier + autoTapIncome;
};

export const calculateUpgradeCost = (state: GameState, upgradeId: string, quantity: number = 1): number => {
  const upgrade = state.upgrades.find(u => u.id === upgradeId);
  if (!upgrade) return Infinity;

  let costReduction = calculateCostReduction(state);

  // Apply CHEAP_UPGRADES (10% reduction, stacks multiplicatively)
  if (state.boosts["boost-cheap-upgrades"]?.active) {
    costReduction *= INVENTORY_ITEMS.CHEAP_UPGRADES.effect!.value; // 0.9 (10% reduction)
  }

  return Math.floor(calculateBulkPurchaseCost(upgrade.baseCost, upgrade.level, quantity, 1.15) * costReduction);
};

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
  // Apply ESSENCE_BOOST (+25% per use)
  if (state.boosts["boost-essence-boost"]?.purchased) {
    multiplier *= Math.pow(INVENTORY_ITEMS.ESSENCE_BOOST.effect!.value, state.boosts["boost-essence-boost"].purchased);
  }

  if (state.ownedArtifacts.includes("artifact-3")) multiplier += 0.25;
  if (state.ownedArtifacts.includes("artifact-8")) multiplier += 0.5;
  if (state.abilities.find(a => a.id === "ability-7" && a.unlocked)) multiplier += 0.15;
  if (state.abilities.find(a => a.id === "ability-10" && a.unlocked)) multiplier += 0.2;
  if (state.abilities.find(a => a.id === "ability-13" && a.unlocked)) multiplier += 0.35;

  return Math.floor(essence * multiplier);
};

export const calculateBaseCoinsPerSecond = (state: GameState): number => {
  let base = state.upgrades.reduce((total, upgrade) => total + (upgrade.coinsPerSecondBonus * upgrade.level), 0);
  return base;
};

// Existing helper functions (unchanged)
export const calculateClickMultiplier = (ownedArtifacts: string[]): number => {
  let multiplier = 1;
  if (ownedArtifacts.includes("artifact-1")) multiplier += 0.25;
  if (ownedArtifacts.includes("artifact-6")) multiplier += 0.5;
  return multiplier;
};

export const calculateCostReduction = (state: GameState): number => {
  let reduction = 1;
  if (state.ownedArtifacts.includes("artifact-2")) reduction -= 0.1;
  if (state.abilities.find(a => a.id === "ability-5" && a.unlocked)) reduction -= 0.05;
  return reduction;
};

export const calculateBulkPurchaseCost = (baseCost: number, currentLevel: number, quantity: number, growthRate: number): number => {
  let totalCost = 0;
  for (let i = 0; i < quantity; i++) {
    totalCost += baseCost * Math.pow(growthRate, currentLevel + i);
  }
  return totalCost;
};

export const calculateArtifactProductionMultiplier = (state: GameState): number => {
  let multiplier = 1;
  if (state.ownedArtifacts.includes("artifact-4")) multiplier += 0.2;
  if (state.ownedArtifacts.includes("artifact-7")) multiplier += 0.3;
  return multiplier;
};

export const calculateManagerBoostMultiplier = (state: GameState): number => {
  return state.managers.reduce((total, manager) => total + (manager.unlocked ? manager.boost : 0), 1);
};

export const calculateAbilityPassiveMultiplier = (state: GameState): number => {
  let multiplier = 1;
  state.abilities.forEach(ability => {
    if (ability.unlocked) {
      if (ability.id === "ability-1") multiplier += 0.1;
      if (ability.id === "ability-4") multiplier += 0.15;
      if (ability.id === "ability-9") multiplier += 0.25;
    }
  });
  return multiplier;
};

export const calculateAbilityTapMultiplier = (state: GameState): number => {
  let multiplier = 1;
  state.abilities.forEach(ability => {
    if (ability.unlocked) {
      if (ability.id === "ability-2") multiplier += 0.2;
      if (ability.id === "ability-6") multiplier += 0.3;
    }
  });
  return multiplier;
};
