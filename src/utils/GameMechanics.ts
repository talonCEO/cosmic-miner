import { GameState, Ability } from '@/context/GameContext';
import { BoostEffect } from '@/components/menu/types';
import { calculateEssenceIncomeBoost } from '@/utils/gameLogic';
import { InventoryItem, INVENTORY_ITEMS, createInventoryItem } from '@/components/menu/types';
import { calculateLevelUpRewards as calcRewards } from './levelUpRewards'; // Adjust path as needed

const enhanceGameMechanics = (state: GameState): GameState => {
  let enhancedState = { ...state };
  enhancedState.ownedArtifacts = enhancedState.ownedArtifacts || [];
  enhancedState.abilities = enhancedState.abilities || [];
  enhancedState.managers = enhancedState.managers || [];
  enhancedState.artifacts = enhancedState.artifacts || [];
  enhancedState.activeBoosts = enhancedState.activeBoosts || [];

  enhancedState.coinsPerClick = calculateBaseTapValue(enhancedState);
  enhancedState.coinsPerSecond = calculateBasePassiveIncome(enhancedState);

  enhancedState = applyActiveBoosts(enhancedState);
  return enhancedState;
};

const BOOST_IDS = {
  DOUBLE_COINS: 'boost-double-coins',
  TIME_WARP: 'boost-time-warp',
  TIME_WARP_12: 'boost-time-warp-12',
  TIME_WARP_24: 'boost-time-warp-24',
  AUTO_TAP: 'boost-auto-tap',
  TAP_BOOST: 'boost-tap-boost',
  CHEAP_UPGRADES: 'boost-cheap-upgrades',
  ESSENCE_BOOST: 'boost-essence-boost',
  PERMA_TAP: 'boost-perma-tap',
  PERMA_PASSIVE: 'boost-perma-passive',
  CRITICAL_CHANCE: 'boost-critical-chance',
  RANDOM_BOOST: 'boost-random',
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
        updatedState.coinsPerClick *= 2;
        updatedState.coinsPerSecond *= 2;
        break;
      case BOOST_IDS.AUTO_TAP:
        updatedState.autoTapTapsPerSecond = 10;
        break;
      case BOOST_IDS.CHEAP_UPGRADES:
        updatedState.costReductionMultiplier = 0.85;
        break;
      case BOOST_IDS.ESSENCE_BOOST:
        updatedState.essenceMultiplier = 1.5;
        break;
      case BOOST_IDS.PERMA_TAP:
        updatedState.coinsPerClickBase = (updatedState.coinsPerClickBase || updatedState.coinsPerClick) + boost.quantity * 10;
        break;
      case BOOST_IDS.PERMA_PASSIVE:
        updatedState.coinsPerSecondBase = (updatedState.coinsPerSecondBase || updatedState.coinsPerSecond) + boost.quantity * 50;
        break;
    }
  });

  return updatedState;
};

export const calculateExperienceGain = (state: GameState, coinsEarned: number): number => {
  const baseExp = coinsEarned / 50;
  const levelPenalty = 1 / (1 + (state.playerData?.level || 1) * 0.03);
  const prestigeBonus = 1 + (state.prestigeCount || 0) * 0.15;
  return Math.max(1, Math.floor(baseExp * levelPenalty * prestigeBonus));
};

export const calculateEssenceBoost = (state: GameState): number => {
  let multiplier = 1;
  const ownedArtifacts = state.ownedArtifacts || [];
  const essenceArtifacts = ["artifact-3", "artifact-8"];
  essenceArtifacts.forEach(id => {
    if (ownedArtifacts.includes(id)) {
      const artifact = (state.artifacts || []).find(a => a.id === id);
      if (artifact?.effect) {
        multiplier += artifact.effect.value;
      }
    }
  });
  return multiplier * (state.essenceMultiplier || 1);
};

export const calculateTapValue = (state: GameState): number => {
  const enhancedState = enhanceGameMechanics(state);
  let tapValue = Math.max(0, enhancedState.coinsPerClick + (state.permaTapBoosts || 0));
  const globalMultiplier = calculateGlobalMultiplier(state);
  tapValue *= globalMultiplier;
  const critBoost = (state.activeBoosts || []).find(b => b.id === BOOST_IDS.CRITICAL_CHANCE && getRemaining(b) > 0);
  let critChance = (state.abilities || []).find(a => a.id === "ability-5" && a.unlocked) ? 0.15 : 0.10;
  if (critBoost) critChance = 1.0;
  if (Math.random() < critChance) tapValue *= 5;

  const tapBoost = (state.activeBoosts || []).find(b => b.id === BOOST_IDS.TAP_BOOST && getRemaining(b) > 0);
  if (tapBoost && (state.tapBoostTapsRemaining || 0) > 0) tapValue *= 5;

  return Math.min(tapValue, Number.MAX_SAFE_INTEGER / 10);
};

const calculateBaseTapValue = (state: GameState): number => {
  const tapPowerUpgrade = (state.upgrades || []).find(u => u.id === 'tap-power-1');
  const tapBoostMultiplier = tapPowerUpgrade ? 1 + (tapPowerUpgrade.level * 0.10) : 1;
  const clickMultiplier = calculateClickMultiplier(state);
  const baseClickValue = state.coinsPerClickBase || 1;
  const coinsPerSecondBonus = state.coinsPerSecond * 0.10;
  const abilityTapMultiplier = calculateAbilityTapMultiplier(state.abilities || []);
  return (baseClickValue + coinsPerSecondBonus) * clickMultiplier * tapBoostMultiplier * abilityTapMultiplier;
};

export const calculateLevelUpRewards = (level: number): { gems: number; essence: number; inventoryItems: InventoryItem[] } => {
  const rewards = calcRewards(level);
  return rewards || { gems: 0, essence: 0, inventoryItems: [] };
};

export const getLevelBoostMultiplier = (level: number): number => {
  const thresholds = [
    { level: 500, boost: 10.0 },
    { level: 400, boost: 7.5 },
    { level: 300, boost: 5.0 },
    { level: 200, boost: 3.0 },
    { level: 100, boost: 1.5 },
    { level: 50, boost: 0.75 },
    { level: 25, boost: 0.25 },
  ];
  for (const threshold of thresholds) {
    if (level >= threshold.level) return threshold.boost;
  }
  return 0;
};

const calculateBasePassiveIncome = (state: GameState): number => {
  let totalBasePassive = (state.coinsPerSecondBase || 0);
  const managerBoosts = calculateManagerBoostMultiplier(state);
  const currentWorld = state.worlds.find(w => w.id === state.currentWorld);

  (state.upgrades || []).forEach(upgrade => {
    if (upgrade.category === 'element' && upgrade.coinsPerSecondBonus > 0) {
      const baseIncome = upgrade.coinsPerSecondBonus * upgrade.level;
      const levelBoostMultiplier = getLevelBoostMultiplier(upgrade.level);
      const managerBoost = managerBoosts[upgrade.id] || 1;
      
      let worldElementBoost = 1;
      if (currentWorld?.boosts?.elementBoosts && currentWorld.boosts.elementBoosts[upgrade.id]) {
        worldElementBoost = currentWorld.boosts.elementBoosts[upgrade.id];
      }
      
      totalBasePassive += baseIncome * (1 + levelBoostMultiplier) * managerBoost * worldElementBoost;
    }
  });

  const totalLevels = (state.upgrades || []).reduce((sum, u) => sum + u.level, 0);
  const globalScaling = 1 + totalLevels / 500;
  const passiveIncomeMultiplier = calculateAbilityPassiveMultiplier(state.abilities || []);
  const artifactProductionMultiplier = calculateArtifactProductionMultiplier(state);
  return totalBasePassive * globalScaling * passiveIncomeMultiplier * artifactProductionMultiplier;
};

export const calculateTotalCoinsPerSecond = (state: GameState): number => {
  const enhancedState = enhanceGameMechanics(state);
  let passiveIncome = Math.max(0, enhancedState.coinsPerSecond + (state.permaPassiveBoosts || 0));
  const globalMultiplier = calculateGlobalMultiplier(state);
  passiveIncome *= globalMultiplier;
  return passiveIncome;
};

export const calculateManagerBoostMultiplier = (state: GameState): Record<string, number> => {
  const elementBoosts: Record<string, number> = {};
  (state.managers || []).forEach(manager => {
    if ((state.ownedManagers || []).includes(manager.id) && manager.boosts) {
      let managerBoostValue = 0.5;
      if (manager.perks) {
        const boostPerks = manager.perks.filter(perk =>
          (perk.unlocked || (state.unlockedPerks || []).includes(perk.id)) &&
          perk.effect?.type === "elementBoost"
        );
        if (boostPerks.length > 0) {
          const highestPerk = boostPerks.sort((a, b) => (b.effect?.value || 0) - (a.effect?.value || 0))[0];
          managerBoostValue += highestPerk.effect?.value || 0;
        }
      }
      manager.boosts.forEach(elementId => {
        elementBoosts[elementId] = (elementBoosts[elementId] || 1) * (1 + managerBoostValue);
      });
    }
  });
  return elementBoosts;
};

export const calculateArtifactProductionMultiplier = (state: GameState): number => {
  let multiplier = 1;
  const artifactIds = ["artifact-1", "artifact-6"];
  const ownedArtifacts = state.ownedArtifacts || [];

  artifactIds.forEach(id => {
    if (ownedArtifacts.includes(id)) {
      const artifact = (state.artifacts || []).find(a => a.id === id);
      if (artifact?.effect) {
        multiplier += artifact.effect.value;
        if (artifact.perks) {
          const unlockedPerks = artifact.perks.filter(perk =>
            perk.unlocked || (state.unlockedPerks || []).includes(perk.id)
          );
          if (unlockedPerks.length > 0) {
            const highestPerk = unlockedPerks.sort((a, b) => (b.effect?.value || 0) - (a.effect?.value || 0))[0];
            multiplier = multiplier - artifact.effect.value + (highestPerk.effect?.value || 0);
          }
        }
      }
    }
  });

  return multiplier;
};

export const calculateAutoTapIncome = (state: GameState, tickInterval: number = 100): number => {
  const enhancedState = enhanceGameMechanics(state);

  if (!state.autoTap && !enhancedState.autoTapTapsPerSecond) return 0;

  const tapPowerUpgrade = (state.upgrades || []).find(u => u.id === 'tap-power-1');
  const tapBoostMultiplier = tapPowerUpgrade ? 1 + (tapPowerUpgrade.level * tapPowerUpgrade.coinsPerClickBonus) : 1;
  const clickMultiplier = calculateClickMultiplier(state);
  const baseClickValue = enhancedState.coinsPerClickBase || enhancedState.coinsPerClick || 1;
  const coinsPerSecondBonus = enhancedState.coinsPerSecond * 0.05;
  const abilityTapMultiplier = calculateAbilityTapMultiplier(state.abilities || []);
  let baseTapValue = (baseClickValue + coinsPerSecondBonus) * clickMultiplier * tapBoostMultiplier * abilityTapMultiplier;

  const tapBoost = (state.activeBoosts || []).find(b => b.id === BOOST_IDS.TAP_BOOST && getRemaining(b) > 0);
  if (tapBoost && (state.tapBoostTapsRemaining || 0) > 0) {
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
  const upgrade = (enhancedState.upgrades || []).find(u => u.id === upgradeId);
  if (!upgrade) return Infinity;

  const costReduction = calculateCostReduction(enhancedState);
  const currentWorld = state.worlds.find(w => w.id === state.currentWorld);
  const difficultyMultiplier = currentWorld?.difficulty || 1.0;

  let totalCost = 0;

  for (let i = 0; i < quantity; i++) {
    const currentLevel = upgrade.level + i;
    let growthRate = 1.07;
    if (currentLevel > 50) growthRate = 1.05;
    if (currentLevel > 200) growthRate = 1.03;
    totalCost += Math.floor(upgrade.baseCost * Math.pow(growthRate, currentLevel) * difficultyMultiplier);
  }

  totalCost *= costReduction;

  const hasCheapUpgrades = (enhancedState.activeBoosts || []).some(b => b.id === BOOST_IDS.CHEAP_UPGRADES && getRemaining(b) > 0);
  if (hasCheapUpgrades) {
    totalCost *= 0.9;
  }

  return Math.floor(totalCost);
};

export const calculateCostReduction = (state: GameState): number => {
  let costReduction = 1.0;
  const ownedArtifacts = state.ownedArtifacts || [];

  const costReductionArtifacts = ["artifact-4", "artifact-9"];
  costReductionArtifacts.forEach(id => {
    if (ownedArtifacts.includes(id)) {
      const artifact = (state.artifacts || []).find(a => a.id === id);
      if (artifact?.effect) {
        costReduction -= artifact.effect.value;
        if (artifact.perks) {
          const unlockedPerks = artifact.perks.filter(perk => perk.unlocked || (state.unlockedPerks || []).includes(perk.id));
          if (unlockedPerks.length > 0) {
            const highestPerk = unlockedPerks.sort((a, b) => (b.effect?.value || 0) - (a.effect?.value || 0))[0];
            costReduction = costReduction + artifact.effect.value - (highestPerk.effect?.value || 0);
          }
        }
      }
    }
  });

  const abilityCostReductions = [
    { id: "ability-3", value: 0.05 },
    { id: "ability-4", value: 0.15 },
    { id: "ability-9", value: 0.30 },
    { id: "ability-12", value: 0.45 },
  ];
  abilityCostReductions.forEach(({ id, value }) => {
    if ((state.abilities || []).find(a => a.id === id && a.unlocked)) costReduction -= value;
  });

  (state.managers || []).forEach(manager => {
    if ((state.ownedManagers || []).includes(manager.id) && manager.perks) {
      manager.perks.forEach(perk => {
        if (perk.unlocked && perk.effect?.type === 'cost-reduction') costReduction -= perk.effect.value;
      });
    }
  });

  return Math.max(0.5, costReduction);
};

export const calculateBulkPurchaseCost = (baseCost: number, currentLevel: number, quantity: number, growthRate: number = 1.05): number => {
  const a = baseCost * Math.pow(growthRate, currentLevel);
  return Math.floor(a * (1 - Math.pow(growthRate, quantity)) / (1 - growthRate));
};

export const calculateMaxAffordableQuantity = (coins: number, baseCost: number, currentLevel: number, growthRate: number = 1.05): number => {
  const a = baseCost * Math.pow(growthRate, currentLevel);
  const term = (coins * (1 - growthRate)) / a;
  const rightSide = 1 - term;
  if (rightSide <= 0) return 1000;
  return Math.floor(Math.log(rightSide) / Math.log(growthRate));
};

export const calculateClickMultiplier = (state: GameState | string[]): number => {
  let multiplier = 1;
  const clickArtifacts = ["artifact-2", "artifact-7"];
  const ownedArtifacts = Array.isArray(state) ? state : (state.ownedArtifacts || []);

  clickArtifacts.forEach(id => {
    if (ownedArtifacts.includes(id)) {
      const artifact = Array.isArray(state) ? null : (state.artifacts || []).find(a => a.id === id);
      if (artifact?.effect) {
        multiplier += artifact.effect.value - 1;
        if (artifact.perks) {
          const unlockedPerks = artifact.perks.filter(perk => perk.unlocked || (state.unlockedPerks || []).includes(perk.id));
          if (unlockedPerks.length > 0) {
            const highestPerk = unlockedPerks.sort((a, b) => (b.effect?.value || 0) - (a.effect?.value || 0))[0];
            multiplier = multiplier - (artifact.effect.value - 1) + (highestPerk.effect?.value - 1 || 0);
          }
        }
      } else {
        multiplier += 0.5;
      }
    }
  });
  return multiplier;
};

export const calculateAbilityTapMultiplier = (abilities: Ability[]): number => {
  let multiplier = 1;
  const abilityBonuses = [
    { id: "ability-2", value: 0.5 },
    { id: "ability-8", value: 0.85 },
    { id: "ability-11", value: 1.2 },
  ];
  abilityBonuses.forEach(({ id, value }) => {
    if ((abilities || []).find(a => a.id === id && a.unlocked)) multiplier += value;
  });
  return multiplier;
};

export const calculateAbilityPassiveMultiplier = (abilities: Ability[]): number => {
  let multiplier = 1;
  const abilityBonuses = [
    { id: "ability-2", value: 0.25 },
    { id: "ability-4", value: 0.2 },
    { id: "ability-6", value: 0.3 },
    { id: "ability-8", value: 0.55 },
    { id: "ability-9", value: 0.65 },
    { id: "ability-12", value: 1.0 },
  ];
  abilityBonuses.forEach(({ id, value }) => {
    if ((abilities || []).find(a => a.id === id && a.unlocked)) multiplier += value;
  });
  return multiplier;
};

export const calculateGlobalIncomeMultiplier = (state: GameState): number => {
  let multiplier = 1;
  const abilityBonuses = [
    { id: "ability-3", value: 0.4 },
    { id: "ability-6", value: 0.45 },
    { id: "ability-10", value: 0.55 },
    { id: "ability-11", value: 0.8 },
    { id: "ability-13", value: 1.0 },
  ];
  abilityBonuses.forEach(({ id, value }) => {
    if ((state.abilities || []).find(a => a.id === id && a.unlocked)) multiplier += value;
  });

  (state.managers || []).forEach(manager => {
    if ((state.ownedManagers || []).includes(manager.id) && manager.perks) {
      manager.perks.forEach(perk => {
        if (perk.unlocked && perk.effect?.type === 'income-multiplier') multiplier += perk.effect.value;
      });
    }
  });

  return multiplier;
};

export const calculateBaseTapValueWithoutCrit = (state: GameState): number => {
  const enhancedState = enhanceGameMechanics(state);
  let tapValue = Math.max(0, enhancedState.coinsPerClick + (state.permaTapBoosts || 0));
  const globalMultiplier = calculateGlobalMultiplier(state);
  tapValue *= globalMultiplier;

  const tapBoost = (state.activeBoosts || []).find(b => b.id === BOOST_IDS.TAP_BOOST && getRemaining(b) > 0);
  if (tapBoost && (state.tapBoostTapsRemaining || 0) > 0) tapValue *= 5;

  return Math.min(tapValue, Number.MAX_SAFE_INTEGER / 10);
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
  const ownedArtifacts = state.ownedArtifacts || [];
  const essenceArtifacts = ["artifact-3", "artifact-8"];
  essenceArtifacts.forEach(id => {
    if (ownedArtifacts.includes(id)) {
      const artifact = (state.artifacts || []).find(a => a.id === id);
      if (artifact?.effect) {
        multiplier += artifact.effect.value;
        if (artifact.perks) {
          const unlockedPerks = artifact.perks.filter(perk => perk.unlocked || (state.unlockedPerks || []).includes(perk.id));
          if (unlockedPerks.length > 0) {
            const highestPerk = unlockedPerks.sort((a, b) => (b.effect?.value || 0) - (a.effect?.value || 0))[0];
            multiplier = multiplier - artifact.effect.value + (highestPerk.effect?.value || 0);
          }
        }
      }
    }
  });

  const abilityBonuses = [
    { id: "ability-7", value: 0.15 },
    { id: "ability-10", value: 0.2 },
    { id: "ability-13", value: 0.35 },
  ];
  abilityBonuses.forEach(({ id, value }) => {
    if ((state.abilities || []).find(a => a.id === id && a.unlocked)) multiplier += value;
  });

  (state.managers || []).forEach(manager => {
    if ((state.ownedManagers || []).includes(manager.id) && manager.perks) {
      manager.perks.forEach(perk => {
        if (perk.unlocked && perk.effect?.type === 'essence-bonus') multiplier += perk.effect.value;
      });
    }
  });

  (state.artifacts || []).forEach(artifact => {
    if (ownedArtifacts.includes(artifact.id) && artifact.perks) {
      artifact.perks.forEach(perk => {
        if (perk.unlocked && perk.effect?.type === 'essence-bonus') multiplier += perk.effect.value;
      });
    }
  });

  const tempEssenceBoostStacks = state.tempEssenceBoostStacks || 0;
  const tempEssenceMultiplier = Math.pow(1.25, tempEssenceBoostStacks);

  return Math.floor(essence * multiplier * (state.essenceMultiplier || 1) * tempEssenceMultiplier);
};

export const checkUpgradeMilestone = (oldLevel: number, newLevel: number): boolean => {
  const oldMilestone = Math.floor(oldLevel / 100);
  const newMilestone = Math.floor(newLevel / 100);
  return newMilestone > oldMilestone;
};

export function calculateGlobalMultiplier(state: GameState): number {
  let multiplier = 1;

  if (state.prestigeCount > 0) {
    multiplier *= 1 + state.prestigeCount * 0.1;
  }

  if (state.totalEssence > 0) {
    multiplier *= calculateEssenceIncomeBoost(state.totalEssence);
  }

  const currentWorld = state.worlds.find(w => w.id === state.currentWorld);
  if (currentWorld?.boosts?.allIncome) {
    multiplier *= currentWorld.boosts.allIncome;
  }

  return multiplier;
}

export const calculateStartingCoins = (ownedArtifacts: string[] | GameState): number => {
  let startingCoins = 0;
  const startingCoinArtifacts = ["artifact-5", "artifact-10"];
  const artifactsArray = Array.isArray(ownedArtifacts) ? ownedArtifacts : (ownedArtifacts.ownedArtifacts || []);
  const artifactsData = Array.isArray(ownedArtifacts) ? [] : (ownedArtifacts.artifacts || []);

  startingCoinArtifacts.forEach(id => {
    if (artifactsArray.includes(id)) {
      const artifact = artifactsData.find(a => a.id === id);
      if (artifact?.effect) {
        startingCoins += artifact.effect.value;
        if (artifact.perks) {
          const unlockedPerks = artifact.perks.filter(perk => perk.unlocked || ((ownedArtifacts as GameState).unlockedPerks || []).includes(perk.id));
          if (unlockedPerks.length > 0) {
            const highestPerk = unlockedPerks.sort((a, b) => (b.effect?.value || 0) - (a.effect?.value || 0))[0];
            startingCoins = startingCoins - artifact.effect.value + (highestPerk.effect?.value || 0);
          }
        }
      }
    }
  });
  return startingCoins;
};

// Add handleLevelUp here
interface LevelUpRewards {
  skillPoints?: number;
  essence?: number;
  gems?: number;
  unlockedTitle?: string;
  unlockedPortrait?: string;
  inventoryItems?: InventoryItem[];
}

export const handleLevelUp = async (
  uid: string,
  oldExp: number,
  newExp: number,
  unlockedTitles: string[] = [],
  unlockedPortraits: string[] = []
): Promise<{
  newLevel: number,
  rewards: LevelUpRewards
}> => {
  const oldLevelData = getLevelFromExp(oldExp);
  const newLevelData = getLevelFromExp(newExp);
  const newLevel = newLevelData.currentLevel.level;

  if (oldLevelData.currentLevel.level === newLevel) {
    return { 
      newLevel,
      rewards: {}
    };
  }

  const rewards: LevelUpRewards = {};
  
  for (let level = oldLevelData.currentLevel.level + 1; level <= newLevel; level++) {
    toast.success(`Level Up! You reached level ${level}`, {
      description: "Your cosmic mining skills have improved!"
    });

    const levelRewards = calculateLevelUpRewards(level);
    if (levelRewards) {
      rewards.gems = (rewards.gems || 0) + levelRewards.gems;
      rewards.essence = (rewards.essence || 0) + levelRewards.essence;
      rewards.inventoryItems = rewards.inventoryItems
        ? [...rewards.inventoryItems, ...levelRewards.inventoryItems]
        : levelRewards.inventoryItems;
    }
  }

  return {
    newLevel,
    rewards
  };
};

const isGoodValue = (cost: number, coinsPerSecondBonus: number): boolean => {
  if (coinsPerSecondBonus <= 0) return false;
  const paybackPeriod = cost / coinsPerSecondBonus;
  return paybackPeriod < 100;
};

export {
  enhanceGameMechanics,
  calculateBaseTapValue,
  applyActiveBoosts,
  isGoodValue,
  getRemaining
};