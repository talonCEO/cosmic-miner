import { GameState, Ability } from '@/context/GameContext';
import { calculateClickMultiplier as utilsCalculateClickMultiplier } from '@/hooks/useGameMechanics';
import { BoostEffect } from '@/components/menu/types';

const enhanceGameMechanics = (state: GameState): GameState => {
  let enhancedState = { ...state };
  enhancedState.coinsPerClick = calculateBaseTapValue(enhancedState);
  enhancedState.coinsPerSecond = calculateBasePassiveIncome(enhancedState);
  enhancedState = applyActiveBoosts(enhancedState);
  return enhancedState;
};

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

const getRemaining = (boost: BoostEffect): number => {
  if (!boost.duration || !boost.activatedAt) return Infinity;
  const now = Date.now() / 1000;
  const elapsed = now - boost.activatedAt;
  return Math.max(0, boost.duration - elapsed);
};

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
        const income = updatedState.coinsPerSecond * 2 * 60 * 60;
        updatedState.coins += income * boost.quantity;
        updatedState.totalEarned += income * boost.quantity;
        updatedState.activeBoosts = updatedState.activeBoosts.filter(b => b.id !== BOOST_IDS.TIME_WARP);
        break;
      case BOOST_IDS.AUTO_TAP:
        updatedState.autoTapTapsPerSecond = (updatedState.autoTapTapsPerSecond || 0) + (5 * boost.quantity);
        break;
      case BOOST_IDS.TAP_BOOST:
        break;
      case BOOST_IDS.CHEAP_UPGRADES:
        updatedState.costReductionMultiplier = 0.9;
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

/** Calculate percentage boost based on level thresholds */
const getLevelBoostMultiplier = (level: number): number => {
  if (level >= 1000) return 10.0; // +1000%
  if (level >= 750) return 7.0;   // +700%
  if (level >= 500) return 5.0;   // +500%
  if (level >= 300) return 3.5;   // +350%
  if (level >= 200) return 2.5;   // +250%
  if (level >= 100) return 1.5;   // +150%
  if (level >= 50) return 1.0;    // +100%
  if (level >= 25) return 0.5;    // +50%
  if (level >= 10) return 0.25;   // +25%
  if (level >= 5) return 0.1;     // +10%
  return 0;                       // No boost below level 5
};

export const calculateTapValue = (state: GameState): number => {
  const enhancedState = enhanceGameMechanics(state);
  let tapValue = Math.max(0, enhancedState.coinsPerClick + (state.permaTapBoosts || 0));
  if (state.tapBoostActive && (state.tapBoostTapsRemaining || 0) > 0) {
    tapValue *= 5;
  }
  return tapValue;
};

const calculateBaseTapValue = (state: GameState): number => {
  const tapPowerUpgrade = state.upgrades.find(u => u.id === 'tap-power-1');
  const tapBoostMultiplier = tapPowerUpgrade ? 1 + (tapPowerUpgrade.level * tapPowerUpgrade.coinsPerClickBonus) : 1;
  const clickMultiplier = calculateClickMultiplier(state.ownedArtifacts);
  const baseClickValue = state.coinsPerClickBase || state.coinsPerClick;
  const coinsPerSecondBonus = state.coinsPerSecond * 0.05;
  const abilityTapMultiplier = calculateAbilityTapMultiplier(state.abilities);
  return (baseClickValue + coinsPerSecondBonus) * clickMultiplier * tapBoostMultiplier * abilityTapMultiplier;
};

export const calculatePassiveIncome = (state: GameState, tickInterval: number = 100): number => {
  const enhancedState = enhanceGameMechanics(state);
  return enhancedState.coinsPerSecond * (tickInterval / 1000);
};

const calculateBasePassiveIncome = (state: GameState): number => {
  if (state.coinsPerSecond <= 0) return 0;
  
  let totalPassiveIncome = 0;
  state.upgrades.forEach(upgrade => {
    if (upgrade.category === 'element' && upgrade.coinsPerSecondBonus > 0) {
      const boostMultiplier = 1 + getLevelBoostMultiplier(upgrade.level);
      totalPassiveIncome += upgrade.coinsPerSecondBonus * upgrade.level * boostMultiplier;
    }
  });
  
  const passiveIncomeMultiplier = calculateAbilityPassiveMultiplier(state.abilities);
  const artifactProductionMultiplier = calculateArtifactProductionMultiplier(state);
  const managerBoostMultiplier = calculateManagerBoostMultiplier(state);
  return totalPassiveIncome * passiveIncomeMultiplier * artifactProductionMultiplier * managerBoostMultiplier;
};

export const calculateTotalCoinsPerSecond = (state: GameState): number => {
  const enhancedState = enhanceGameMechanics(state);
  return Math.max(0, enhancedState.coinsPerSecond + (state.permaPassiveBoosts || 0));
};

// [Remaining functions unchanged: calculateArtifactProductionMultiplier, calculateManagerBoostMultiplier, etc.]
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
  if (state.tapBoostActive && (state.tapBoostTapsRemaining || 0) > 0) {
    baseTapValue *= 5;
  }
  const baseAutoTapTapsPerSecond = state.autoTap ? 1 : 0;
  const boostAutoTapTapsPerSecond = enhancedState.autoTapTapsPerSecond || 0;
  if (boostAutoTapTapsPerSecond > 0) {
    const boostIncomePerSecond = baseTapValue * 5;
    return boostIncomePerSecond * (tickInterval / 1000);
  }
  const totalTapsPerSecond = baseAutoTapTapsPerSecond;
  return baseTapValue * totalTapsPerSecond * (tickInterval / 1000) * 0.4;
};

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

export const calculateBulkPurchaseCost = (baseCost: number, currentLevel: number, quantity: number, growthRate: number = 1.08): number => {
  const a = baseCost * Math.pow(growthRate, currentLevel);
  return Math.floor(a * (1 - Math.pow(growthRate, quantity)) / (1 - growthRate));
};

export const calculateMaxAffordableQuantity = (coins: number, baseCost: number, currentLevel: number, growthRate: number = 1.08): number => {
  const a = baseCost * Math.pow(growthRate, currentLevel);
  const term = (coins * (1 - growthRate)) / a;
  const rightSide = 1 - term;
  if (rightSide <= 0) return 1000;
  return Math.floor(Math.log(rightSide) / Math.log(growthRate));
};

export const calculateClickMultiplier = (ownedArtifacts: string[] = []): number => {
  let multiplier = 1;
  if (ownedArtifacts.includes("artifact-2")) multiplier += 0.5;
  if (ownedArtifacts.includes("artifact-7")) multiplier += 1.5;
  return multiplier;
};

export const calculateAbilityTapMultiplier = (abilities: Ability[]): number => {
  let multiplier = 1;
  if (abilities.find(a => a.id === "ability-2" && a.unlocked)) multiplier += 0.5;
  if (abilities.find(a => a.id === "ability-8" && a.unlocked)) multiplier += 0.85;
  if (abilities.find(a => a.id === "ability-11" && a.unlocked)) multiplier += 1.2;
  return multiplier;
};

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
  const tempEssenceBoostStacks = state.tempEssenceBoostStacks || 0;
  const tempEssenceMultiplier = Math.pow(1.25, tempEssenceBoostStacks);
  return Math.floor(essence * multiplier * (enhancedState.essenceMultiplier || 1) * tempEssenceMultiplier);
};

export const checkUpgradeMilestone = (oldLevel: number, newLevel: number): boolean => {
  const oldMilestone = Math.floor(oldLevel / 100);
  const newMilestone = Math.floor(newLevel / 100);
  return newMilestone > oldMilestone;
};

export const calculateStartingCoins = (ownedArtifacts: string[]): number => {
  let startingCoins = 0;
  if (ownedArtifacts.includes("artifact-4")) startingCoins += 1000;
  if (ownedArtifacts.includes("artifact-9")) startingCoins += 10000;
  return startingCoins;
};

export const isGoodValue = (cost: number, coinsPerSecondBonus: number): boolean => {
  if (coinsPerSecondBonus <= 0) return false;
  const paybackPeriod = cost / coinsPerSecondBonus;
  return paybackPeriod < 100;
};
