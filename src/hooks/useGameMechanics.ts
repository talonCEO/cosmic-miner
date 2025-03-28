
import { useState } from 'react';
import { calculateEssenceReward, isGoodValue } from '@/utils/gameLogic';
import { artifacts } from '@/utils/artifactsData';
import { managers } from '@/utils/managersData';
import { upgradesList } from '@/utils/upgradesData';

// Helper function to calculate cost reduction from artifacts
export const calculateCostReduction = (ownedArtifacts: string[]): number => {
  let reduction = 1; // Default: no reduction (multiplier of 1)
  
  if (ownedArtifacts.includes("artifact-4")) { // Telescope Array
    reduction -= 0.1; // 10% reduction
  }
  if (ownedArtifacts.includes("artifact-9")) { // Satellite Network
    reduction -= 0.25; // 25% reduction
  }
  
  return Math.max(0.5, reduction);
};

// Helper function to calculate click multiplier from artifacts
export const calculateClickMultiplier = (ownedArtifacts: string[]): number => {
  let multiplier = 1;
  
  if (ownedArtifacts.includes("artifact-2")) { // Space Rocket
    multiplier += 0.5; // 1.5x multiplier
  }
  if (ownedArtifacts.includes("artifact-7")) { // Molecular Flask
    multiplier += 1.5; // Additional 2.5x multiplier
  }
  
  return multiplier;
};

// Helper function to calculate starting coins after prestige
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

// Helper function to calculate element multiplier from managers
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

export default function useGameMechanics() {
  // Calculate potential essence reward for prestige
  const calculatePotentialEssenceReward = (totalEarned: number, ownedArtifacts: string[]): number => {
    return calculateEssenceReward(totalEarned, ownedArtifacts);
  };
  
  return {
    calculatePotentialEssenceReward,
    calculateCostReduction,
    calculateClickMultiplier,
    calculateStartingCoins,
    calculateManagerBoost,
    checkUpgradeMilestone,
    createAchievements
  };
}
