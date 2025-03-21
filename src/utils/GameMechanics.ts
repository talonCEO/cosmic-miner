import { GameState, Ability } from '@/context/GameContext';

export const calculateTapValue = (state: GameState): number => {
  const tapPowerUpgrade = state.upgrades.find(u => u.id === 'tap-power-1');
  const tapBoostMultiplier = tapPowerUpgrade ? 1 + (tapPowerUpgrade.level * tapPowerUpgrade.coinsPerClickBonus) : 1;
  const clickMultiplier = calculateClickMultiplier(state.ownedArtifacts);
  const baseClickValue = state.coinsPerClick;
  const coinsPerSecondBonus = state.coinsPerSecond * 0.05;
  const abilityTapMultiplier = calculateAbilityTapMultiplier(state.abilities);
  return (baseClickValue + coinsPerSecondBonus) * clickMultiplier * tapBoostMultiplier * abilityTapMultiplier;
};

export const calculatePassiveIncome = (state: GameState, tickInterval: number = 100): number => {
  if (state.coinsPerSecond <= 0) return 0;
  const passiveIncomeMultiplier = calculateAbilityPassiveMultiplier(state.abilities);
  const artifactProductionMultiplier = calculateArtifactProductionMultiplier(state);
  const managerBoostMultiplier = calculateManagerBoostMultiplier(state);
  return (state.coinsPerSecond / (1000 / tickInterval)) * passiveIncomeMultiplier * artifactProductionMultiplier * managerBoostMultiplier;
};

export const calculateTotalCoinsPerSecond = (state: GameState): number => {
  if (state.coinsPerSecond <= 0) return 0;
  const passiveIncomeMultiplier = calculateAbilityPassiveMultiplier(state.abilities);
  const artifactProductionMultiplier = calculateArtifactProductionMultiplier(state);
  const managerBoostMultiplier = calculateManagerBoostMultiplier(state);
  return state.coinsPerSecond * passiveIncomeMultiplier * artifactProductionMultiplier * managerBoostMultiplier;
};

export const calculateArtifactProductionMultiplier = (state: GameState): number => {
  let multiplier = 1;
  if (state.ownedArtifacts.includes('artifact-1')) {
    const artifact = state.artifacts.find(a => a.id === 'artifact-1');
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
  if (state.ownedArtifacts.includes('artifact-6')) {
    const artifact = state.artifacts.find(a => a.id === 'artifact-6');
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

export const calculateManagerBoostMultiplier = (state: GameState): number => {
  let totalMultiplier = 1;
  state.managers.forEach(manager => {
    if (state.ownedManagers.includes(manager.id) && manager.boosts) {
      let managerBoostValue = 0.5;
      if (manager.perks) {
        const unlockedPerks = manager.perks.filter(perk => perk.unlocked || state.unlockedPerks.includes(perk.id));
        const boostPerks = unlockedPerks.filter(perk => perk.effect && perk.effect.type === 'elementBoost');
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

export const calculateAutoTapIncome = (state: GameState, tickInterval: number = 100): number => {
  if (!state.autoTap) return 0;
  const tapPowerUpgrade = state.upgrades.find(u => u.id === 'tap-power-1');
  const tapBoostMultiplier = tapPowerUpgrade ? 1 + (tapPowerUpgrade.level * tapPowerUpgrade.coinsPerClickBonus) : 1;
  const clickMultiplier = calculateClickMultiplier(state.ownedArtifacts);
  const baseClickValue = state.coinsPerClick * 0.35;
  const coinsPerSecondBonus = state.coinsPerSecond * 0.05;
  return (baseClickValue + coinsPerSecondBonus) * state.incomeMultiplier * clickMultiplier * 0.4 * tapBoostMultiplier * (tickInterval / 1000);
};

export const calculateUpgradeCost = (state: GameState, upgradeId: string, quantity: number = 1): number => {
  const upgrade = state.upgrades.find(u => u.id === upgradeId);
  if (!upgrade) return Infinity;
  const costReduction = calculateCostReduction(state);
  return Math.floor(calculateBulkPurchaseCost(upgrade.baseCost, upgrade.level, quantity, 1.15) * costReduction);
};

export const calculateCostReduction = (state: GameState): number => {
  let costReduction = 1.0;
  if (state.ownedArtifacts.includes('artifact-1')) costReduction -= 0.05;
  if (state.ownedArtifacts.includes('artifact-6')) costReduction -= 0.1;
  if (state.abilities.find(a => a.id === 'ability-3' && a.unlocked)) costReduction -= 0.05;
  if (state.abilities.find(a => a.id === 'ability-4' && a.unlocked)) costReduction -= 0.15;
  if (state.abilities.find(a => a.id === 'ability-9' && a.unlocked)) costReduction -= 0.30;
  if (state.abilities.find(a => a.id === 'ability-12' && a.unlocked)) costReduction -= 0.45;
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

export const calculateBulkPurchaseCost = (baseCost: number, currentLevel: number, quantity: number, growthRate: number = 1.15): number => {
  const a = baseCost * Math.pow(growthRate, currentLevel);
  return Math.floor(a * (1 - Math.pow(growthRate, quantity)) / (1 - growthRate));
};

export const calculateMaxAffordableQuantity = (coins: number, baseCost: number, currentLevel: number, growthRate: number = 1.15): number => {
  const a = baseCost * Math.pow(growthRate, currentLevel);
  const term = (coins * (1 - growthRate)) / a;
  const rightSide = 1 - term;
  if (rightSide <= 0) return 1000;
  return Math.floor(Math.log(rightSide) / Math.log(growthRate));
};

export const calculateClickMultiplier = (ownedArtifacts: string[] = []): number => {
  let multiplier = 1;
  if (ownedArtifacts.includes('artifact-2')) multiplier += 0.5;
  if (ownedArtifacts.includes('artifact-7')) multiplier += 1.5;
  return multiplier;
};

export const calculateAbilityTapMultiplier = (abilities: Ability[]): number => {
  let multiplier = 1;
  if (abilities.find(a => a.id === 'ability-2' && a.unlocked)) multiplier += 0.5;
  if (abilities.find(a => a.id === 'ability-8' && a.unlocked)) multiplier += 0.85;
  if (abilities.find(a => a.id === 'ability-11' && a.unlocked)) multiplier += 1.2;
  return multiplier;
};

export const calculateAbilityPassiveMultiplier = (abilities: Ability[]): number => {
  let multiplier = 1;
  if (abilities.find(a => a.id === 'ability-2' && a.unlocked)) multiplier += 0.25;
  if (abilities.find(a => a.id === 'ability-4' && a.unlocked)) multiplier += 0.2;
  if (abilities.find(a => a.id === 'ability-6' && a.unlocked)) multiplier += 0.3;
  if (abilities.find(a => a.id === 'ability-8' && a.unlocked)) multiplier += 0.55;
  if (abilities.find(a => a.id === 'ability-9' && a.unlocked)) multiplier += 0.65;
  if (abilities.find(a => a.id === 'ability-12' && a.unlocked)) multiplier += 1.0;
  return multiplier;
};

export const calculateGlobalIncomeMultiplier = (state: GameState): number => {
  let multiplier = 1;
  if (state.abilities.find(a => a.id === 'ability-3' && a.unlocked)) multiplier += 0.4;
  if (state.abilities.find(a => a.id === 'ability-6' && a.unlocked)) multiplier += 0.45;
  if (state.abilities.find(a => a.id === 'ability-10' && a.unlocked)) multiplier += 0.55;
  if (state.abilities.find(a => a.id === 'ability-11' && a.unlocked)) multiplier += 0.8;
  if (state.abilities.find(a => a.id === 'ability-13' && a.unlocked)) multiplier += 1.0;
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
  if (state.ownedArtifacts.includes('artifact-3')) multiplier += 0.25;
  if (state.ownedArtifacts.includes('artifact-8')) multiplier += 0.5;
  if (state.abilities.find(a => a.id === 'ability-7' && a.unlocked)) multiplier += 0.15;
  if (state.abilities.find(a => a.id === 'ability-10' && a.unlocked)) multiplier += 0.2;
  if (state.abilities.find(a => a.id === 'ability-13' && a.unlocked)) multiplier += 0.35;
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

export const checkUpgradeMilestone = (oldLevel: number, newLevel: number): boolean => {
  const oldMilestone = Math.floor(oldLevel / 100);
  const newMilestone = Math.floor(newLevel / 100);
  return newMilestone > oldMilestone;
};

export const calculateStartingCoins = (ownedArtifacts: string[]): number => {
  let startingCoins = 0;
  if (ownedArtifacts.includes('artifact-4')) startingCoins += 1000;
  if (ownedArtifacts.includes('artifact-9')) startingCoins += 10000;
  return startingCoins;
};

export const isGoodValue = (cost: number, coinsPerSecondBonus: number): boolean => {
  if (coinsPerSecondBonus <= 0) return false;
  const paybackPeriod = cost / coinsPerSecondBonus;
  return paybackPeriod < 100;
};
