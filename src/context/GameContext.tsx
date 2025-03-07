<lov-code>
import React, { createContext, useContext, useReducer, useEffect, ReactNode } from 'react';
import { upgradesList } from '@/utils/upgradesData';
import { managers } from '@/utils/managersData';
import { artifacts } from '@/utils/artifactsData';
import { Shield, Zap, Brain, Star, TargetIcon, HandCoins, Trophy, CloudLightning, Gem, Gauge, Compass, Sparkles, Rocket } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import { calculateBulkPurchaseCost, calculateMaxAffordableQuantity } from '@/utils/gameLogic';

// Achievement interface
export interface Achievement {
  id: string;
  name: string;
  description: string;
  unlocked: boolean;
  checkCondition: (state: GameState) => boolean;
}

// Ability interface
export interface Ability {
  id: string;
  name: string;
  description: string;
  cost: number;
  icon: React.ReactNode;
  unlocked: boolean;
  requiredAbilities: string[];
  row: number;
  column: number;
}

// Game state interface
export interface GameState {
  coins: number;
  coinsPerClick: number;
  coinsPerSecond: number;
  upgrades: Upgrade[];
  totalClicks: number;
  totalEarned: number;
  autoBuy: boolean;
  autoTap: boolean;
  essence: number;
  ownedManagers: string[];
  ownedArtifacts: string[];
  achievements: Achievement[];
  achievementsChecked: Record<string, boolean>;
  managers: typeof managers;
  artifacts: typeof artifacts;
  prestigeCount: number;
  incomeMultiplier: number;
  skillPoints: number;
  abilities: Ability[];
  unlockedPerks: string[];
}

// Upgrade interface
export interface Upgrade {
  id: string;
  name: string;
  description: string;
  cost: number;
  baseCost: number;
  level: number;
  maxLevel: number;
  coinsPerClickBonus: number;
  coinsPerSecondBonus: number;
  multiplierBonus: number;
  icon: string;
  unlocked: boolean;
  unlocksAt?: {
    upgradeId: string;
    level: number;
  };
  category: string;
}

// Action types
type GameAction =
  | { type: 'CLICK' }
  | { type: 'ADD_COINS'; amount: number }
  | { type: 'ADD_ESSENCE'; amount: number }
  | { type: 'BUY_UPGRADE'; upgradeId: string; quantity?: number }
  | { type: 'TOGGLE_AUTO_BUY' }
  | { type: 'TOGGLE_AUTO_TAP' }
  | { type: 'SET_INCOME_MULTIPLIER'; multiplier: number }
  | { type: 'TICK' }
  | { type: 'PRESTIGE' }
  | { type: 'BUY_MANAGER'; managerId: string }
  | { type: 'BUY_ARTIFACT'; artifactId: string }
  | { type: 'UNLOCK_ACHIEVEMENT'; achievementId: string }
  | { type: 'CHECK_ACHIEVEMENTS' }
  | { type: 'UNLOCK_ABILITY'; abilityId: string }
  | { type: 'ADD_SKILL_POINTS'; amount: number }
  | { type: 'SHOW_SKILL_POINT_NOTIFICATION'; reason: string }
  | { type: 'UNLOCK_PERK'; perkId: string; parentId: string };

// Create achievements based on upgrades and other collectibles
const createAchievements = (): Achievement[] => {
  // Upgrade level achievements
  const upgradeAchievements: Achievement[] = upgradesList.map(upgrade => ({
    id: `${upgrade.id}-mastery`,
    name: `${upgrade.name} Mastery`,
    description: `Reach level 1000 with ${upgrade.name}`,
    unlocked: false,
    checkCondition: (state: GameState) => {
      const currentUpgrade = state.upgrades.find(u => u.id === upgrade.id);
      return currentUpgrade ? currentUpgrade.level >= 1000 : false;
    }
  }));

  // Manager achievements
  const managerAchievements: Achievement[] = managers
    .filter(manager => manager.id !== "manager-default")
    .map(manager => ({
      id: `manager-achievement-${manager.id}`,
      name: `Hired: ${manager.name}`,
      description: `Hired manager ${manager.name}`,
      unlocked: false,
      checkCondition: (state: GameState) => state.ownedManagers.includes(manager.id)
    }));

  // Artifact achievements
  const artifactAchievements: Achievement[] = artifacts
    .filter(artifact => artifact.id !== "artifact-default")
    .map(artifact => ({
      id: `artifact-achievement-${artifact.id}`,
      name: `Discovered: ${artifact.name}`,
      description: `Found the ${artifact.name} artifact`,
      unlocked: false,
      checkCondition: (state: GameState) => state.ownedArtifacts.includes(artifact.id)
    }));
  
  // Combine all achievement types
  return [...upgradeAchievements, ...managerAchievements, ...artifactAchievements];
};

// Updated upgrades with increased cost (50% more) and maxLevel
const updatedUpgradesList = upgradesList.map(upgrade => ({
  ...upgrade,
  maxLevel: 1000,
  cost: upgrade.baseCost * 1.5, // 50% increase in cost
  baseCost: upgrade.baseCost * 1.5, // 50% increase in base cost
  coinsPerSecondBonus: upgrade.coinsPerSecondBonus * 0.5 // 50% decrease to passive income
}));

// Initial abilities for the tech tree - redesigned with new tiers
const initialAbilities: Ability[] = [
  // Tier 1 (row 1) - Center ability (unlocked by default)
  {
    id: "ability-1",
    name: "Cosmic Awakening",
    description: "Your first connection to the cosmic energy, increasing tap value by 10% and passive income by 5%.",
    cost: 0,
    icon: <Star className="text-yellow-300" size={24} />,
    unlocked: true,
    requiredAbilities: [],
    row: 1,
    column: 2
  },
  
  // Tier 2 (row 2) - Three abilities requiring Tier 1
  {
    id: "ability-2",
    name: "Energy Conversion",
    description: "Convert cosmic energy into mining power, boosting tap value by 50% and critical hit chance by 5%.",
    cost: 3,
    icon: <Zap className="text-blue-300" size={24} />,
    unlocked: false,
    requiredAbilities: ["ability-1"],
    row: 2,
    column: 1
  },
  {
    id: "ability-3",
    name: "Neural Enhancement",
    description: "Improve mental capabilities, increasing all production by 35% and reducing upgrade costs by 5%.",
    cost: 3,
    icon: <Brain className="text-purple-300" size={24} />,
    unlocked: false,
    requiredAbilities: ["ability-1"],
    row: 2,
    column: 2
  },
  {
    id: "ability-4",
    name: "Protective Field",
    description: "Generate a protective field reducing upgrade costs by 15% and increasing passive income by 20%.",
    cost: 3,
    icon: <Shield className="text-green-300" size={24} />,
    unlocked: false,
    requiredAbilities: ["ability-1"],
    row: 2,
    column: 3
  },
  
  // Tier 3 (row 3) - Three abilities requiring Tier 2
  {
    id: "ability-5",
    name: "Precision Strike",
    description: "Your taps have a 15% chance to hit for 5x normal damage and increase passive income by 10%.",
    cost: 5,
    icon: <TargetIcon className="text-red-300" size={24} />,
    unlocked: false,
    requiredAbilities: ["ability-2"],
    row: 3,
    column: 1
  },
  {
    id: "ability-6",
    name: "Wealth Magnetism",
    description: "Attract cosmic wealth, increasing all coin gains by 40% and passive income by 25%.",
    cost: 5,
    icon: <HandCoins className="text-amber-300" size={24} />,
    unlocked: false,
    requiredAbilities: ["ability-3"],
    row: 3,
    column: 2
  },
  {
    id: "ability-7",
    name: "Achievement Hunter",
    description: "Gain 2 skill points for each achievement and increase global income multiplier by 15%.",
    cost: 5,
    icon: <Trophy className="text-yellow-300" size={24} />,
    unlocked: false,
    requiredAbilities: ["ability-4"],
    row: 3,
    column: 3
  },
  
  // Tier 4 (row 4) - Three abilities requiring Tier 3
  {
    id: "ability-8",
    name: "Lightning Strikes",
    description: "Harness cosmic lightning, boosting tap value by 80% and passive income by 50%.",
    cost: 8,
    icon: <CloudLightning className="text-blue-300" size={24} />,
    unlocked: false,
    requiredAbilities: ["ability-5"],
    row: 4,
    column: 1
  },
  {
    id: "ability-9",
    name: "Stellar Efficiency",
    description: "Optimize resource usage, reducing all upgrade costs by 25% and boosting passive income by 60%.",
    cost: 8,
    icon: <Gauge className="text-green-300" size={24} />,
    unlocked: false,
    requiredAbilities: ["ability-6"],
    row: 4,
    column: 2
  },
  {
    id: "ability-10",
    name: "Cosmic Navigator",
    description: "Map the galaxy, increasing global income multiplier by 50% and critical hit chance by 15%.",
    cost: 8,
    icon: <Compass className="text-purple-300" size={24} />,
    unlocked: false,
    requiredAbilities: ["ability-7"],
    row: 4,
    column: 3
  },
  
  // Tier 5 (row 5) - Three abilities requiring Tier 4
  {
    id: "ability-11",
    name: "Supernova Burst",
    description: "Channel explosive cosmic energy, boosting tap value by 120% and all coin gains by 75%.",
    cost: 12,
    icon: <Sparkles className="text-yellow-300" size={24} />,
    unlocked: false,
    requiredAbilities: ["ability-8"],
    row: 5,
    column: 1
  },
  {
    id: "ability-12",
    name: "Quantum Mastery",
    description: "Master quantum mechanics, reducing all upgrade costs by 40% and doubling passive income.",
    cost: 12,
    icon: <Rocket className="text-blue-300" size={24} />,
    unlocked: false,
    requiredAbilities: ["ability-9"],
    row: 5,
    column: 2
  },
  {
    id: "ability-13",
    name: "Cosmic Dominion",
    description: "Achieve dominion over cosmic forces, increasing global income multiplier by 100% and all production by 80%.",
    cost: 12,
    icon: <Gem className="text-purple-300" size={24} />,
    unlocked: false,
    requiredAbilities: ["ability-10"],
    row: 5,
    column: 3
  }
];

// Fixed growth rate for upgrade costs
const UPGRADE_COST_GROWTH = 1.15; // 15% increase per level

// Updated initial values
const initialState: GameState = {
  coins: 50, // Start with enough for first upgrade
  coinsPerClick: 1,
  coinsPerSecond: 0,
  upgrades: upgradesList.map(upgrade => ({
    ...upgrade
  })),
  totalClicks: 0,
  totalEarned: 0,
  autoBuy: false,
  autoTap: false,
  essence: 0,
  ownedManagers: ["manager-default"],
  ownedArtifacts: ["artifact-default"],
  achievements: createAchievements(),
  achievementsChecked: {},
  managers: managers,
  artifacts: artifacts,
  prestigeCount: 0,
  incomeMultiplier: 1.0,
  skillPoints: 0,
  abilities: initialAbilities,
  unlockedPerks: []
};

// Helper function to calculate the total cost of buying multiple upgrades
const calculateBulkCost = (baseCost: number, currentLevel: number, quantity: number): number => {
  let totalCost = 0;
  for (let i = 0; i < quantity; i++) {
    totalCost += Math.floor(baseCost * Math.pow(1.07, currentLevel + i));
  }
  return totalCost;
};

// Helper function to calculate potential essence reward with progressive scaling
const calculateEssenceReward = (totalEarned: number, ownedArtifacts: string[]): number => {
  let baseEssenceMultiplier = 1;
  
  if (ownedArtifacts.includes("artifact-3")) { // Element Scanner
    baseEssenceMultiplier += 1.25;
  }
  if (ownedArtifacts.includes("artifact-8")) { // Quantum Microscope
    baseEssenceMultiplier += 2.25;
  }
  
  let totalEssence = 0;
  let remainingCoins = totalEarned;
  let currentCostPerEssence = 100000;
  let currentBracket = 0;
  
  while (remainingCoins >= currentCostPerEssence) {
    const essenceInBracket = Math.min(10, Math.floor(remainingCoins / currentCostPerEssence));
    
    if (essenceInBracket <= 0) break;
    
    totalEssence += essenceInBracket;
    remainingCoins -= essenceInBracket * currentCostPerEssence;
    
    currentBracket++;
    currentCostPerEssence = 100000 * Math.pow(2, currentBracket);
  }
  
  return Math.floor(totalEssence * baseEssenceMultiplier);
};

// Helper function to calculate upgrade cost reduction from artifacts
const calculateCostReduction = (ownedArtifacts: string[]): number => {
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
const calculateClickMultiplier = (ownedArtifacts: string[]): number => {
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
const calculateStartingCoins = (ownedArtifacts: string[]): number => {
  let coins = 0;
  
  if (ownedArtifacts.includes("artifact-5")) { // Crystalline Gem
    coins += 100000;
  }
  if (ownedArtifacts.includes("artifact-10")) { // Energy Core
    coins += 1000000;
  }
  
  return coins;
};

// Calculate maximum affordable purchases for an upgrade
const getMaxPurchaseAmount = (state: GameState, upgradeId: string): number => {
  const upgrade = state.upgrades.find(u => u.id === upgradeId);
  if (!upgrade || upgrade.level >= upgrade.maxLevel) return 0;
  
  const costReduction = calculateCostReduction(state.ownedArtifacts);
  let remainingCoins = state.coins;
  let purchaseCount = 0;
  let currentLevel = upgrade.level;
  
  while (remainingCoins > 0 && currentLevel < upgrade.maxLevel) {
    const nextUpgradeCost = Math.floor(upgrade.baseCost * Math.pow(1.07, currentLevel) * costReduction);
    
    if (remainingCoins >= nextUpgradeCost) {
      remainingCoins -= nextUpgradeCost;
      purchaseCount++;
      currentLevel++;
    } else {
      break;
    }
  }
  
  return purchaseCount;
};

// Check if an upgrade has reached a milestone level that awards a skill point
const checkUpgradeMilestone = (oldLevel: number, newLevel: number): boolean => {
  const oldMilestone = Math.floor(oldLevel / 100);
  const newMilestone = Math.floor(newLevel / 100);
  return newMilestone > oldMilestone;
};

// Game reducer with updated mechanics
const gameReducer = (state: GameState, action: GameAction): GameState => {
  switch (action.type) {
    case 'CLICK': {
      // Calculate base click value
      const clickMultiplier = calculateClickMultiplier(state.ownedArtifacts);
      
      // Base click value also includes 10% of coins per second (synergy)
      const baseClickValue = state.coinsPerClick;
      const coinsPerSecondBonus = state.coinsPerSecond * 0.1;
      const totalClickAmount = (baseClickValue + coinsPerSecondBonus) * state.incomeMultiplier * clickMultiplier;
      
      return {
        ...state,
        coins: state.coins + totalClickAmount,
        totalClicks: state.totalClicks + 1,
        totalEarned: state.totalEarned + totalClickAmount
      };
    }
    case 'ADD_COINS':
      return {
        ...state,
        coins: state.coins + action.amount,
        totalEarned: state.totalEarned + action.amount
      };
    case 'ADD_ESSENCE':
      return {
        ...state,
        essence: state.essence + action.amount
      };
    case 'BUY_UPGRADE': {
      const upgradeIndex = state.upgrades.findIndex(u => u.id === action.upgradeId);
      
      if (upgradeIndex === -1) return state;
      
      const upgrade = state.upgrades[upgradeIndex];
      const costReduction = calculateCostReduction(state.ownedArtifacts);
      const quantity = action.quantity || 1;
      
      if (upgrade.level >= upgrade.maxLevel) return state;
      
      const maxPossibleQuantity = Math.min(
        quantity, 
        upgrade.maxLevel - upgrade.level
      );
      
      // Use the new bulk cost calculation function
      const totalCost = Math.floor(calculateBulkPurchaseCost(
        upgrade.baseCost, 
        upgrade.level, 
        maxPossibleQuantity, 
        UPGRADE_COST_GROWTH
      ) * costReduction);
      
      if (state.coins < totalCost) return state;
      
      const oldLevel = upgrade.level;
      const newLevel = upgrade.level + maxPossibleQuantity;
      
      // Check if the upgrade has crossed a 100-level milestone
      const shouldAwardSkillPoint = checkUpgradeMilestone(oldLevel, newLevel);
      
      // Updated calculation of bonuses - more impactful
      const newCoinsPerClick = state.coinsPerClick + (upgrade.coinsPerClickBonus * maxPossibleQuantity);
      const newCoinsPerSecond = state.coinsPerSecond + (upgrade.coinsPerSecondBonus * maxPossibleQuantity);
      
      const updatedUpgrade = {
        ...upgrade,
        level: newLevel,
        cost: Math.floor(upgrade.baseCost * Math.pow(UPGRADE_COST_GROWTH, newLevel) * costReduction)
      };
      
      const newUpgrades = [...state.upgrades];
      newUpgrades[upgradeIndex] = updatedUpgrade;
      
      // Check for unlocking new upgrades
      state.upgrades.forEach((u, index) => {
        if (!u.unlocked && u.unlocksAt && 
            u.unlocksAt.upgradeId === upgrade.id && 
            updatedUpgrade.level >= u.unlocksAt.level) {
          newUpgrades[index] = { ...newUpgrades[index], unlocked: true };
        }
      });
      
      const newState = {
        ...state,
        coins: state.coins - totalCost,
        coinsPerClick: newCoinsPerClick,
        coinsPerSecond: newCoinsPerSecond,
        upgrades: newUpgrades
      };
      
      // Award skill point if milestone reached
      if (shouldAwardSkillPoint) {
        return {
          ...newState,
          skillPoints: newState.skillPoints + 1
        };
      }
      
      return newState;
    }
    case 'TOGGLE_AUTO_BUY':
      return {
        ...state,
        autoBuy: !state.autoBuy
      };
    case 'TOGGLE_AUTO_TAP':
      return {
        ...state,
        autoTap: !state.autoTap
      };
    case 'SET_INCOME_MULTIPLIER':
      return {
        ...state,
        incomeMultiplier: action.multiplier
      };
    case 'TICK': {
      let newState = { ...state };
      
      // Process passive income with smoother curve
      if (state.coinsPerSecond > 0) {
        const passiveAmount = (state.coinsPerSecond / 10) * state.incomeMultiplier;
        newState = {
          ...newState,
          coins: newState.coins + passiveAmount,
          totalEarned: newState.totalEarned + passiveAmount
        };
      }
      
      // Process auto tap if enabled
      if (newState.autoTap) {
        const clickMultiplier = calculateClickMultiplier(state.ownedArtifacts);
        // Auto tap is 50% as effective as manual clicks
        const baseClickValue = newState.coinsPerClick;
        const coinsPerSecondBonus = newState.coinsPerSecond * 0.1;
        const autoTapAmount = (baseClickValue + coinsPerSecondBonus) * newState.incomeMultiplier * clickMultiplier * 0.5;
        
        newState = {
          ...newState,
          coins: newState.coins + autoTapAmount,
          totalEarned: newState.totalEarned + autoTapAmount,
          totalClicks: newState.totalClicks + 1
        };
      }
      
      // Process auto buy
      if (newState.autoBuy) {
        const costReduction = calculateCostReduction(state.ownedArtifacts);
        
        // Find upgrades with best ROI (Return on Investment)
        const affordableUpgrades = newState.upgrades
          .filter(u => u.unlocked && u.level < u.maxLevel && 
                   newState.coins >= (u.cost * costReduction))
          .map(u => ({
            upgrade: u,
            roi: u.coinsPerSecondBonus > 0 ? (u.cost / u.coinsPerSecondBonus) : Infinity
          }))
          .sort((a, b) => a.roi - b.roi);
        
        if (affordableUpgrades.length > 0) {
          const bestUpgrade = affordableUpgrades[0].upgrade;
          
          const upgradeIndex = newState.upgrades.findIndex(u => u.id === bestUpgrade.id);
          
          const oldLevel = bestUpgrade.level;
          const newLevel = bestUpgrade.level + 1;
          
          // Check if the upgrade has crossed a 100-level milestone
          const shouldAwardSkillPoint = checkUpgradeMilestone(oldLevel, newLevel);
          
          const newCoinsPerClick = newState.coinsPerClick + bestUpgrade.coinsPerClickBonus;
          const newCoinsPerSecond = newState.coinsPerSecond + bestUpgrade.coinsPerSecondBonus;
          
          const updatedUpgrade = {
            ...bestUpgrade,
            level: newLevel,
            cost: Math.floor(bestUpgrade.baseCost * Math.pow(UPGRADE_COST_GROWTH, newLevel) * costReduction)
          };
          
          const newUpgrades = [...newState.upgrades];
          newUpgrades[upgradeIndex] = updatedUpgrade;
          
          newState.upgrades.forEach((u, index) => {
            if (!u.unlocked && u.unlocksAt && 
                u.unlocksAt.upgradeId === bestUpgrade.id && 
                updatedUpgrade.level >= u.unlocksAt.level) {
              newUpgrades[index] = { ...newUpgrades[index], unlocked: true };
            }
          });
          
          newState = {
            ...newState,
            coins: newState.coins - bestUpgrade.cost,
            coinsPerClick: newCoinsPerClick,
            coinsPerSecond: newCoinsPerSecond,
            upgrades: newUpgrades
          };
          
          // Award skill point if milestone reached
          if (shouldAwardSkillPoint) {
            newState = {
              ...newState,
              skillPoints: newState.skillPoints + 1
            };
          }
        }
      }
      
      return newState;
    }
    case 'PRESTIGE': {
      // Calculate essence reward with improved formula
      let essenceReward = Math.floor(Math.log10(state.totalEarned) * 2 - 10);
      
      // Apply artifact bonuses
      if (state.ownedArtifacts.includes("artifact-3")) { // Element Scanner
        essenceReward = Math.floor(essenceReward * 1.25);
      }
      if (state.ownedArtifacts.includes("artifact-8")) { // Quantum Microscope
        essenceReward = Math.floor(essenceReward * 1.5);
      }
      
      // Ensure at least some reward if they've made significant progress
      if (state.totalEarned > 1000000 && essenceReward <= 0) {
        essenceReward = 1;
      }
      
      const startingCoins = calculateStartingCoins(state.ownedArtifacts);
      
      return {
        ...initialState,
        coins: startingCoins,
        essence: state.essence + essenceReward,
        ownedManagers: state.ownedManagers,
        ownedArtifacts: state.ownedArtifacts,
        achievements: state.achievements,
        achievementsChecked: state.achievementsChecked,
        managers: state.managers,
        artifacts: state.artifacts,
        prestigeCount: state.prestigeCount + 1,
        skillPoints: state.skillPoints // Retain skill points after prestige
      };
    }
    case 'BUY_MANAGER': {
      const manager = managers.find(m => m.id === action.managerId);
      
      if (!manager || state.ownedManagers.includes(action.managerId) || state.essence < manager.cost) {
        return state;
      }
      
      return {
        ...state,
        essence: state.essence - manager.cost,
        ownedManagers: [...state.ownedManagers, action.managerId]
      };
    }
    case 'BUY_ARTIFACT': {
      const artifact = artifacts.find(a => a.id === action.artifactId);
      
      if (!artifact || state.ownedArtifacts.includes(action.artifactId) || state.essence < artifact.cost) {
        return state;
      }
      
      return {
        ...state,
        essence: state.essence - artifact.cost,
        ownedArtifacts: [...state.ownedArtifacts, action.artifactId]
      };
    }
    case 'UNLOCK_ACHIEVEMENT': {
      const achievementIndex = state.achievements.findIndex(a => a.id === action.achievementId);
      
      if (achievementIndex === -1 || state.achievements[achievementIndex].unlocked) {
        return state;
      }
      
      const newAchievements = [...state.achievements];
      newAchievements[achievementIndex] = {
        ...newAchievements[achievementIndex],
        unlocked: true
      };
      
      return {
        ...state,
        achievements: newAchievements,
        achievementsChecked: {
          ...state.achievementsChecked,
          [action.achievementId]: true
        },
        skillPoints: state.skillPoints + 1 // Award a skill point for each achievement
      };
    }
    case 'CHECK_ACHIEVEMENTS': {
      const unlockableAchievements = state.achievements
        .filter(a => !a.unlocked && !state.achievementsChecked[a.id])
        .filter(a => a.checkCondition(state));
      
      if (unlockableAchievements.length === 0) {
        return state;
      }
      
      const newAchievements = [...state.achievements];
      const newAchievementsChecked = { ...state.achievementsChecked };
      
      unlockableAchievements.forEach(achievement => {
        const index = newAchievements.findIndex(a => a.id === achievement.id);
        newAchievements[index] = { ...newAchievements[index], unlocked: true };
        newAchievementsChecked[achievement.id] = true;
      });
      
      return {
        ...state,
        achievements: newAchievements,
        achievementsChecked: newAchievementsChecked,
        skillPoints: state.skillPoints + unlockableAchievements.length // Award skill points for each new achievement
      };
    }
    case 'UNLOCK_ABILITY': {
      const abilityIndex = state.abilities.findIndex(a => a.id === action.abilityId);
      
      if (abilityIndex === -1) return state;
      
      const ability = state.abilities[abilityIndex];
      
      // Check if ability is already unlocked
      if (ability.unlocked) return state;
      
      // Check if user has enough skill points
      if (state.skillPoints < ability.cost) return state;
      
      // Check if all required abilities are unlocked
      const requiredAbilitiesUnlocked = ability.requiredAbilities.every(requiredId => {
        const requiredAbility = state.abilities.find(a => a.id === requiredId);
        return requiredAbility && requiredAbility.unlocked;
      });
      
      if (!requiredAbilitiesUnlocked) return state;
      
      // Unlock the ability and deduct skill points
      const newAbilities = [...state.abilities];
      newAbilities[abilityIndex] = { ...newAbilities[abilityIndex], unlocked: true };
      
      return {
        ...state,
        skillPoints: state.skillPoints - ability.cost,
        abilities: newAbilities
      };
    }
    case 'UNLOCK_PERK': {
      // Find the parent (manager or artifact) and the perk
      let parent;
      let parentCollection;
      
      const manager = state.managers.find(m => m.id === action.parentId);
      if (manager && manager.perks) {
        parent = manager;
        parentCollection = 'managers';
      } else {
        const artifact = state.artifacts.find(a => a.id === action.parentId);
        if (artifact && artifact.perks) {
          parent = artifact;
          parentCollection = 'artifacts';
        }
      }
      
      if (!parent || !parent.perks) return state;
      
      const perk = parent.perks.find(p => p.id === action.perkId);
      if (!perk || perk.unlocked || state.skillPoints < perk.cost) return state;
      
      // Create updated collections
      const updatedCollections = {
        managers: [...state.managers],
        artifacts: [...state.artifacts]
      };
      
      // Find and update the specific perk
      const parentIndex = updatedCollections[parentCollection].findIndex(item => item.id === action.parentId);
      if (parentIndex === -1) return state;
      
      const updatedParent = {...updatedCollections[parentCollection][parentIndex]};
      if (!updatedParent.perks) return state;
      
      const perkIndex = updatedParent.perks.findIndex(p => p.id === action.perkId);
      if (perkIndex === -1) return state;
      
      // Update the perk to be unlocked
      updatedParent.perks = [...updatedParent.perks];
      updatedParent.perks[perkIndex] = {
        ...updatedParent.perks[perkIndex],
        unlocked: true
      };
      
      // Update the parent in the collection
      updatedCollections[parentCollection][parentIndex] = updatedParent;
      
      return {
        ...state,
        skillPoints: state.skillPoints - perk.cost,
        unlockedPerks: [...state.unlockedPerks, action.perkId],
        [parentCollection]: updatedCollections[parentCollection]
      };
    }
    case 'ADD_SKILL_POINTS': {
      return {
        ...state,
        skillPoints: state.skillPoints + action.amount
      };
    }
    default:
      return state;
  }
};

// Helper function to calculate maximum affordable purchases
const getMaxPurchaseAmount = (state: GameState, upgradeId: string): number => {
  const upgrade = state.upgrades.find(u => u.id === upgradeId);
  if (!upgrade || upgrade.level >= upgrade.maxLevel) return 0;
  
  const costReduction = calculateCostReduction(state.ownedArtifacts);
  
  // Use the new utility function from gameLogic.ts
  const maxPurchases = calculateMaxAffordableQuantity(
    state.coins,
    upgrade.baseCost * costReduction,
    upgrade.level,
    UPGRADE_COST_GROWTH
  );
  
  // Make sure we
