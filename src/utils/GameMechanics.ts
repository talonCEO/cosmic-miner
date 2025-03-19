import { GameState, Ability } from '@/context/GameContext';
import { calculateClickMultiplier, calculateProductionMultiplier } from '@/utils/gameLogic';
import { INVENTORY_ITEMS } from '@/components/menu/types';

export const calculateTapValue = (state: GameState): number => {
  const tapPowerUpgrade = state.upgrades.find(u => u.id === 'tap-power-1');
  const tapBoostMultiplier = tapPowerUpgrade ? 1 + (tapPowerUpgrade.level * tapPowerUpgrade.coinsPerClickBonus) : 1;
  const clickMultiplier = calculateClickMultiplier(state.ownedArtifacts);
  let baseClickValue = state.coinsPerClick;
  if (state.boosts['boost-perma-tap']?.purchased) {
    baseClickValue += state.boosts['boost-perma-tap'].purchased * INVENTORY_ITEMS.PERMA_TAP.effect!.value;
  }
  const coinsPerSecondBonus = state.coinsPerSecond * 0.05;
  const abilityTapMultiplier = calculateAbilityTapMultiplier(state.abilities);
  const bonuses = [];
  if (state.boosts['boost-tap-boost']?.active) {
    bonuses.push(INVENTORY_ITEMS.TAP_BOOST.effect!.value - 1); // 5x becomes +4
  }
  if (state.boosts['boost-double-coins']?.active) {
    bonuses.push(INVENTORY_ITEMS.DOUBLE_COINS.effect!.value - 1); // 2x becomes +1
  }
  return calculateProductionMultiplier(
    (baseClickValue + coinsPerSecondBonus) * clickMultiplier * tapBoostMultiplier * abilityTapMultiplier,
    bonuses
  );
};

export const calculatePassiveIncome = (state: GameState, tickInterval: number = 100): number => {
  if (state.coinsPerSecond <= 0) return 0;
  let basePassive = state.coinsPerSecond;
  if (state.boosts['boost-perma-passive']?.purchased) {
    basePassive += state.boosts['boost-perma-passive'].purchased * INVENTORY_ITEMS.PERMA_PASSIVE.effect!.value;
  }
  const passiveIncomeMultiplier = calculateAbilityPassiveMultiplier(state.abilities);
  const artifactProductionMultiplier = calculateArtifactProductionMultiplier(state);
  const managerBoostMultiplier = calculateManagerBoostMultiplier(state);
  const bonuses = [];
  if (state.boosts['boost-double-coins']?.active) {
    bonuses.push(INVENTORY_ITEMS.DOUBLE_COINS.effect!.value - 1); // 2x becomes +1
  }
  return calculateProductionMultiplier(
    (basePassive / (1000 / tickInterval)) * passiveIncomeMultiplier * artifactProductionMultiplier * managerBoostMultiplier,
    bonuses
  );
};

export const calculateTotalCoinsPerSecond = (state: GameState): number => {
  if (state.coinsPerSecond <= 0) return 0;
  let basePassive = state.coinsPerSecond;
  if (state.boosts['boost-perma-passive']?.purchased) {
    basePassive += state.boosts['boost-perma-passive'].purchased * INVENTORY_ITEMS.PERMA_PASSIVE.effect!.value;
  }
  const passiveIncomeMultiplier = calculateAbilityPassiveMultiplier(state.abilities);
  const artifactProductionMultiplier = calculateArtifactProductionMultiplier(state);
  const managerBoostMultiplier = calculateManagerBoostMultiplier(state);
  const bonuses = [];
  if (state.boosts['boost-double-coins']?.active) {
    bonuses.push(INVENTORY_ITEMS.DOUBLE_COINS.effect!.value - 1); // 2x becomes +1
  }
  return calculateProductionMultiplier(
    basePassive * passiveIncomeMultiplier * artifactProductionMultiplier * managerBoostMultiplier,
    bonuses
  );
};

export const calculateStartingCoins = (ownedArtifacts: string[]): number => {
  let startingCoins = 0;
  if (ownedArtifacts.includes('artifact-1')) startingCoins += 100; // Example artifact bonus
  return startingCoins;
};

export const calculateCostReduction = (state: GameState): number => {
  let reduction = 1;
  if (state.boosts['boost-cheap-upgrades']?.active) {
    reduction *= (1 - INVENTORY_ITEMS.CHEAP_UPGRADES.effect!.value); // 10% reduction becomes 0.9
  }
  if (state.ownedArtifacts.includes('artifact-4')) reduction *= 0.95; // Example artifact bonus
  return reduction;
};

export const checkUpgradeMilestone = (oldLevel: number, newLevel: number): boolean => {
  const milestones = [25, 50, 100, 250, 500, 1000];
  return milestones.some(m => oldLevel < m && newLevel >= m);
};

export const calculateAutoTapIncome = (state: GameState, tickInterval: number): number => {
  const tapValue = calculateTapValue(state);
  return tapValue / (1000 / tickInterval); // Adjust for tick rate
};

export const calculateAbilityTapMultiplier = (abilities: Ability[]): number => {
  let multiplier = 1;
  if (abilities.find(a => a.id === 'ability-2' && a.unlocked)) multiplier += 0.5; // Quantum Vibration Enhancer
  if (abilities.find(a => a.id === 'ability-13' && a.unlocked)) multiplier += 1.0; // Cosmic Singularity Engine
  return multiplier;
};

export const calculateAbilityPassiveMultiplier = (abilities: Ability[]): number => {
  let multiplier = 1;
  if (abilities.find(a => a.id === 'ability-2' && a.unlocked)) multiplier += 0.25; // Quantum Vibration Enhancer
  if (abilities.find(a => a.id === 'ability-13' && a.unlocked)) multiplier += 1.0; // Cosmic Singularity Engine
  return multiplier;
};

export const calculateArtifactProductionMultiplier = (state: GameState): number => {
  let multiplier = 1;
  if (state.ownedArtifacts.includes('artifact-5')) multiplier += 0.5; // Example artifact
  return multiplier;
};

export const calculateManagerBoostMultiplier = (state: GameState): number => {
  let multiplier = 1;
  if (state.ownedManagers.includes('manager-1')) multiplier += 0.1; // Example manager
  return multiplier;
};

export const calculateEssenceReward = (state: GameState): number => {
  const baseEssence = calculateClickMultiplier(state.ownedArtifacts); // Placeholder; should use gameLogic's version
  let multiplier = 1;
  if (state.boosts['boost-essence-boost']?.purchased) {
    multiplier += state.boosts['boost-essence-boost'].purchased * (INVENTORY_ITEMS.ESSENCE_BOOST.effect!.value - 1);
  }
  return Math.floor(baseEssence * multiplier);
};
