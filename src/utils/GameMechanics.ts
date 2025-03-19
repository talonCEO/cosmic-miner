import { GameState } from '@/context/GameContext';
import { Artifact } from '@/utils/artifactsData';
import { Manager } from '@/utils/managersData';

// Function to calculate the tap value based on upgrades and artifacts
export const calculateTapValue = (state: GameState): number => {
  let tapValue = state.coinsPerClick;
  
  // Apply artifact bonuses
  state.ownedArtifacts.forEach(artifactId => {
    const artifact = state.artifacts.find(a => a.id === artifactId);
    if (artifact && artifact.effect && artifact.effect.type === "tap") {
      tapValue *= artifact.effect.value;
    }
  });
  
  // Apply unlocked perk bonuses
  state.artifacts.forEach(artifact => {
    if (artifact.perks) {
      artifact.perks.forEach(perk => {
        if (state.unlockedPerks.includes(perk.id) && perk.effect.type === "tap") {
          tapValue *= perk.effect.value;
        }
      });
    }
  });
  
  return tapValue;
};

// Function to calculate passive income based on upgrades, managers, and artifacts
export const calculatePassiveIncome = (state: GameState): number => {
  let passiveIncome = state.coinsPerSecond;
  
  // Apply artifact bonuses
  state.ownedArtifacts.forEach(artifactId => {
    const artifact = state.artifacts.find(a => a.id === artifactId);
    if (artifact && artifact.effect && artifact.effect.type === "production") {
      passiveIncome *= artifact.effect.value;
    }
  });
  
  // Apply unlocked perk bonuses
  state.artifacts.forEach(artifact => {
    if (artifact.perks) {
      artifact.perks.forEach(perk => {
        if (state.unlockedPerks.includes(perk.id) && perk.effect.type === "production") {
          passiveIncome *= perk.effect.value;
        }
      });
    }
  });
  
  return passiveIncome;
};

// Function to calculate auto-tap income
export const calculateAutoTapIncome = (state: GameState): number => {
  return state.coinsPerClick * 0.1; // 10% of tap value per tick
};

// Function to calculate essence reward based on total earned coins
export const calculateEssenceReward = (totalEarned: number, state: GameState): number => {
  // Simplified calculation: 1 essence per 1000 coins earned
  let essence = Math.floor(totalEarned / 1000000);
  
  // Apply artifact bonuses
  state.ownedArtifacts.forEach(artifactId => {
    const artifact = state.artifacts.find(a => a.id === artifactId);
    if (artifact && artifact.effect && artifact.effect.type === "essence") {
      essence *= artifact.effect.value;
    }
  });
  
  // Apply unlocked perk bonuses
  state.artifacts.forEach(artifact => {
    if (artifact.perks) {
      artifact.perks.forEach(perk => {
        if (state.unlockedPerks.includes(perk.id) && perk.effect.type === "essence") {
          essence *= perk.effect.value;
        }
      });
    }
  });
  
  return Math.max(0, essence);
};

// Function to calculate cost reduction based on artifacts
export const calculateCostReduction = (state: GameState): number => {
  let reduction = 1; // Default: no reduction (multiplier of 1)
  
  // Apply artifact bonuses
  state.ownedArtifacts.forEach(artifactId => {
    const artifact = state.artifacts.find(a => a.id === artifactId);
    if (artifact && artifact.effect && artifact.effect.type === "cost") {
      reduction *= artifact.effect.value;
    }
  });
  
  // Apply unlocked perk bonuses
  state.artifacts.forEach(artifact => {
    if (artifact.perks) {
      artifact.perks.forEach(perk => {
        if (state.unlockedPerks.includes(perk.id) && perk.effect.type === "cost") {
          reduction *= perk.effect.value;
        }
      });
    }
  });
  
  return Math.max(0.1, reduction);
};

// Function to calculate starting coins after prestige
export const calculateStartingCoins = (ownedArtifacts: string[]): number => {
  let coins = 0;
  
  if (ownedArtifacts.includes("artifact-5")) { // Crystalline Gem
    coins += 100000;
  }
  if (ownedArtifacts.includes("artifact-10")) { // Energy Core
    coins += 1000000;
  }
  
  return coins;
};

// Function to calculate element multiplier from managers
export const calculateManagerBoost = (elementId: string, ownedManagers: string[]): number => {
  let boost = 1; // Base multiplier (no boost)
  
  // Check if any owned managers boost this element
  managers.forEach(manager => {
    if (ownedManagers.includes(manager.id) && manager.boosts && manager.boosts.includes(elementId)) {
      // Each manager that boosts this element adds 50% to the multiplier
      boost += 0.5;
    }
  });
  
  return boost;
};

// Function to determine if an upgrade is a good value based on its cost and CPS bonus
export const isGoodValue = (upgradeCost: number, upgradeCPSBonus: number): boolean => {
  // Example: If the cost per CPS is less than 1000, it's a good value
  return upgradeCPSBonus > 0 && upgradeCost / upgradeCPSBonus < 1000;
};

// Function to calculate the cost of purchasing multiple levels of an upgrade
export const calculateBulkPurchaseCost = (baseCost: number, currentLevel: number, quantity: number, costGrowth: number): number => {
  let totalCost = 0;
  for (let i = 0; i < quantity; i++) {
    totalCost += baseCost * Math.pow(costGrowth, currentLevel + i);
  }
  return totalCost;
};

// Function to calculate the maximum affordable quantity of an upgrade
export const calculateMaxAffordableQuantity = (coins: number, upgradeCost: number, currentLevel: number, costGrowth: number): number => {
  let quantity = 0;
  let totalCost = 0;
  while (coins >= totalCost) {
    const nextLevelCost = upgradeCost * Math.pow(costGrowth, currentLevel + quantity);
    if (coins >= totalCost + nextLevelCost) {
      totalCost += nextLevelCost;
      quantity++;
    } else {
      break;
    }
  }
  return quantity;
};

// Function to calculate artifact production multiplier
export const calculateArtifactProductionMultiplier = (state: GameState): number => {
  let multiplier = 1;
  
  // Apply artifact bonuses
  state.ownedArtifacts.forEach(artifactId => {
    const artifact = state.artifacts.find(a => a.id === artifactId);
    if (artifact && artifact.effect && artifact.effect.type === "allProduction") {
      multiplier *= artifact.effect.value;
    }
  });
  
  // Apply unlocked perk bonuses
  state.artifacts.forEach(artifact => {
    if (artifact.perks) {
      artifact.perks.forEach(perk => {
        if (state.unlockedPerks.includes(perk.id) && perk.effect.type === "allProduction") {
          multiplier *= perk.effect.value;
        }
      });
    }
  });
  
  return multiplier;
};

// Check if an upgrade has reached a milestone level that awards a skill point
export const checkUpgradeMilestone = (oldLevel: number, newLevel: number): boolean => {
  const oldMilestone = Math.floor(oldLevel / 100);
  const newMilestone = Math.floor(newLevel / 100);
  return newMilestone > oldMilestone;
};

// Create achievements based on upgrades and other collectibles
export const createAchievements = () => {
  // Upgrade level achievements
  const upgradeAchievements = upgradesList.map(upgrade => ({
    id: `${upgrade.id}-mastery`,
    name: `${upgrade.name} Mastery`,
    description: `Reach level 1000 with ${upgrade.name}`,
    unlocked: false,
    checkCondition: (state: any) => {
      const currentUpgrade = state.upgrades.find((u: any) => u.id === upgrade.id);
      return currentUpgrade ? currentUpgrade.level >= 1000 : false;
    }
  }));

  // Manager achievements
  const managerAchievements = managers
    .filter(manager => manager.id !== "manager-default")
    .map(manager => ({
      id: `manager-achievement-${manager.id}`,
      name: `Hired: ${manager.name}`,
      description: `Hired manager ${manager.name}`,
      unlocked: false,
      checkCondition: (state: any) => state.ownedManagers.includes(manager.id)
    }));

  // Artifact achievements
  const artifactAchievements = artifacts
    .filter(artifact => artifact.id !== "artifact-default")
    .map(artifact => ({
      id: `artifact-achievement-${artifact.id}`,
      name: `Discovered: ${artifact.name}`,
      description: `Found the ${artifact.name} artifact`,
      unlocked: false,
      checkCondition: (state: any) => state.ownedArtifacts.includes(artifact.id)
    }));
  
  // Combine all achievement types
  return [...upgradeAchievements, ...managerAchievements, ...artifactAchievements];
};

export const calculateBaseCoinsPerClick = (state: GameState) => {
  let base = state.coinsPerClick;
  if (state.boosts["boost-perma-tap"]?.purchased) {
    base += state.boosts["boost-perma-tap"].purchased * 1; //INVENTORY_ITEMS.PERMA_TAP.effect!.value;
  }
  return base;
};

export const calculateBaseCoinsPerSecond = (state: GameState) => {
  let base = state.coinsPerSecond;
  if (state.boosts["boost-perma-passive"]?.purchased) {
    base += state.boosts["boost-perma-passive"].purchased * 1; //INVENTORY_ITEMS.PERMA_PASSIVE.effect!.value;
  }
  return base;
};
