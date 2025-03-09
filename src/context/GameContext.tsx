import React, { createContext, useContext, useReducer, useEffect, ReactNode } from 'react';
import { upgradesList, UPGRADE_CATEGORIES } from '@/utils/upgradesData';
import { managers } from '@/utils/managersData';
import { artifacts } from '@/utils/artifactsData';
import { Shield, Zap, Brain, Star, TargetIcon, HandCoins, Trophy, CloudLightning, Gem, Gauge, Compass, Sparkles, Rocket, Flower, Flame } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import { calculateBulkPurchaseCost, calculateMaxAffordableQuantity, isGoodValue, calculateProductionMultiplier } from '@/utils/gameLogic';
import { adMobService } from '@/services/AdMobService';
import useGameMechanics, { createAchievements, checkUpgradeMilestone, calculateCostReduction, calculateClickMultiplier, calculateStartingCoins } from '@/hooks/useGameMechanics';

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
  | { type: 'UNLOCK_PERK'; perkId: string; parentId: string }
  | { type: 'HANDLE_CLICK'; };

// Updated upgrades with increased cost (50% more) and maxLevel
const updatedUpgradesList = upgradesList.map(upgrade => ({
  ...upgrade,
  maxLevel: 1000,
  cost: upgrade.baseCost * 1.5, // 50% increase in cost
  baseCost: upgrade.baseCost * 1.5, // 50% increase in base cost
  coinsPerSecondBonus: upgrade.coinsPerSecondBonus * 0.5 // 50% decrease to passive income
}));

// Initial abilities for the tech tree - redesigned with new space-mining theme
const initialAbilities: Ability[] = [
  // Tier 1 (row 1) - Center ability (unlocked by default)
  {
    id: "ability-1",
    name: "Asteroid Drill",
    description: "Just a rusty old drill that somehow still works. The user manual was written in crayon.",
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
    name: "Quantum Vibration Enhancer",
    description: "Uses quantum vibration technology to increase mining efficiency. Tap power increased by 50% and passive income by 25%.",
    cost: 3,
    icon: <Zap className="text-blue-300" size={24} />,
    unlocked: false,
    requiredAbilities: ["ability-1"],
    row: 2,
    column: 1
  },
  {
    id: "ability-3",
    name: "Neural Mining Matrix",
    description: "Connects your brain directly to mining operations. Increases all income by 40% and reduces upgrade costs by 5%.",
    cost: 3,
    icon: <Brain className="text-purple-300" size={24} />,
    unlocked: false,
    requiredAbilities: ["ability-1"],
    row: 2,
    column: 2
  },
  {
    id: "ability-4",
    name: "Graviton Shield Generator",
    description: "Creates a force field that optimizes mining operations. Reduces upgrade costs by 15% and increases passive income by 20%.",
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
    name: "Laser-Guided Extraction System",
    description: "Precision mining laser technology. 15% chance of critical strike for 5x normal mining yield per tap.",
    cost: 5,
    icon: <TargetIcon className="text-red-300" size={24} />,
    unlocked: false,
    requiredAbilities: ["ability-2"],
    row: 3,
    column: 1
  },
  {
    id: "ability-6",
    name: "Dark Matter Attractor",
    description: "Harnesses the power of dark matter to attract valuable elements. Increases all income by 45% and passive income by 30%.",
    cost: 5,
    icon: <HandCoins className="text-amber-300" size={24} />,
    unlocked: false,
    requiredAbilities: ["ability-3"],
    row: 3,
    column: 2
  },
  {
    id: "ability-7",
    name: "Galactic Achievement Scanner",
    description: "Scans the galaxy for achievement opportunities. Gain 2 extra skill points per achievement and 15% more essence.",
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
    name: "Plasma Discharge Excavator",
    description: "Uses controlled plasma bursts to break down asteroids. Boosts tap value by 85% and passive income by 55%.",
    cost: 8,
    icon: <CloudLightning className="text-blue-300" size={24} />,
    unlocked: false,
    requiredAbilities: ["ability-5"],
    row: 4,
    column: 1
  },
  {
    id: "ability-9",
    name: "Nano-Bot Mining Swarm",
    description: "Deploys microscopic robots that optimize resource extraction. Reduces upgrade costs by 30% and increases passive income by 65%.",
    cost: 8,
    icon: <Gauge className="text-green-300" size={24} />,
    unlocked: false,
    requiredAbilities: ["ability-6"],
    row: 4,
    column: 2
  },
  {
    id: "ability-10",
    name: "Interstellar Navigation AI",
    description: "Advanced AI system that identifies the richest asteroid fields. Increases global income by 55% and essence rewards by 20%.",
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
    name: "Supernova Core Extractor",
    description: "Harvests energy from the remnants of exploded stars. Boosts tap value by 120% and all income by 80%.",
    cost: 12,
    icon: <Sparkles className="text-yellow-300" size={24} />,
    unlocked: false,
    requiredAbilities: ["ability-8"],
    row: 5,
    column: 1
  },
  {
    id: "ability-12",
    name: "Quantum Tunneling Drill",
    description: "Creates wormholes directly to valuable resources. Reduces all upgrade costs by 45% and doubles passive income.",
    cost: 12,
    icon: <Rocket className="text-blue-300" size={24} />,
    unlocked: false,
    requiredAbilities: ["ability-9"],
    row: 5,
    column: 2
  },
  {
    id: "ability-13",
    name: "Cosmic Singularity Engine",
    description: "Harnesses the power of a controlled black hole. Increases essence gain by 35% and all income by 100%.",
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

// Updated initial values with starting coins at 0 and coinsPerClick at 1
const initialState: GameState = {
  coins: 0, // Changed to 0 as requested
  coinsPerClick: 1, // Changed to 1 as requested
  coinsPerSecond: 0,
  upgrades: upgradesList.map(upgrade => ({
    ...upgrade
  })),
  totalClicks: 0,
  totalEarned: 0,
  autoBuy: false,
  autoTap: false,
  essence: 10000,
  ownedManagers: ["manager-default"],
  ownedArtifacts: ["artifact-default"],
  achievements: createAchievements(),
  achievementsChecked: {},
  managers: managers,
  artifacts: artifacts,
  prestigeCount: 0,
  incomeMultiplier: 10.0,
  skillPoints: 10000,
  abilities: initialAbilities,
  unlockedPerks: []
};

// Game reducer with updated mechanics
const gameReducer = (state: GameState, action: GameAction): GameState => {
  switch (action.type) {
    case 'CLICK': {
      // Get tap multiplier from tap power upgrade
      const tapPowerUpgrade = state.upgrades.find(u => u.id === 'tap-power-1');
      const tapBoostMultiplier = tapPowerUpgrade ? 1 + (tapPowerUpgrade.level * tapPowerUpgrade.coinsPerClickBonus) : 1;
      
      // Base click value is now 100% of coinsPerClick (not 35%)
      const clickMultiplier = calculateClickMultiplier(state.ownedArtifacts);
      
      // Base click value now includes only 5% of coins per second (reduced synergy)
      const baseClickValue = state.coinsPerClick; // Now using full coinsPerClick
      const coinsPerSecondBonus = state.coinsPerSecond * 0.05; // Kept this the same
      
      // Apply ability boosts to tap value
      let abilityTapMultiplier = 1;
      if (state.abilities.find(a => a.id === "ability-2" && a.unlocked)) {
        abilityTapMultiplier += 0.5; // Quantum Vibration Enhancer: +50% tap power
      }
      if (state.abilities.find(a => a.id === "ability-8" && a.unlocked)) {
        abilityTapMultiplier += 0.85; // Plasma Discharge Excavator: +85% tap value
      }
      if (state.abilities.find(a => a.id === "ability-11" && a.unlocked)) {
        abilityTapMultiplier += 1.2; // Supernova Core Extractor: +120% tap value
      }
      
      // Removed critical multiplier
      
      const totalClickAmount = (baseClickValue + coinsPerSecondBonus) * 
                               state.incomeMultiplier * 
                               clickMultiplier * 
                               tapBoostMultiplier * 
                               abilityTapMultiplier;
      
      return {
        ...state,
        coins: Math.max(0, state.coins + totalClickAmount), // Ensure coins never go below 0
        totalClicks: state.totalClicks + 1,
        totalEarned: state.totalEarned + totalClickAmount
      };
    }
    case 'ADD_COINS':
      return {
        ...state,
        coins: Math.max(0, state.coins + action.amount), // Ensure coins never go below 0
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
      let costReduction = calculateCostReduction(state.ownedArtifacts);
      
      // Apply ability cost reduction effects
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
      
      // Ensure cost reduction doesn't go below 50%
      costReduction = Math.max(0.5, costReduction);
      
      const quantity = action.quantity || 1;
      
      if (upgrade.level >= upgrade.maxLevel) return state;
      
      const maxPossibleQuantity = Math.min(
        quantity, 
        upgrade.maxLevel - upgrade.level
      );
      
      // Use the bulk cost calculation function
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
      
      // Handle different upgrade types
      let newCoinsPerClick = state.coinsPerClick;
      let newCoinsPerSecond = state.coinsPerSecond;
      
      if (upgrade.category === UPGRADE_CATEGORIES.TAP) {
        // For tap upgrades, we don't add directly to coinsPerClick
        // Instead, we just update the level and the multiplier effect is applied during click
      } else {
        // For normal upgrades, apply the bonuses directly
        newCoinsPerClick += upgrade.coinsPerClickBonus * maxPossibleQuantity;
        newCoinsPerSecond += upgrade.coinsPerSecondBonus * maxPossibleQuantity;
      }
      
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
        // Apply ability boosts to passive income
        let passiveIncomeMultiplier = 1;
        if (state.abilities.find(a => a.id === "ability-2" && a.unlocked)) {
          passiveIncomeMultiplier += 0.25; // Quantum Vibration Enhancer: +25% passive income
        }
        if (state.abilities.find(a => a.id === "ability-4" && a.unlocked)) {
          passiveIncomeMultiplier += 0.2; // Graviton Shield Generator: +20% passive income
        }
        if (state.abilities.find(a => a.id === "ability-6" && a.unlocked)) {
          passiveIncomeMultiplier += 0.3; // Dark Matter Attractor: +30% passive income
        }
        if (state.abilities.find(a => a.id === "ability-8" && a.unlocked)) {
          passiveIncomeMultiplier += 0.55; // Plasma Discharge Excavator: +55% passive income
        }
        if (state.abilities.find(a => a.id === "ability-9" && a.unlocked)) {
          passiveIncomeMultiplier += 0.65; // Nano-Bot Mining Swarm: +65% passive income
        }
        if (state.abilities.find(a => a.id === "ability-12" && a.unlocked)) {
          passiveIncomeMultiplier += 1.0; // Quantum Tunneling Drill: doubles passive income
        }
        
        // Passive income is now stronger relative to clicking
        const passiveAmount = (state.coinsPerSecond / 10) * state.incomeMultiplier * passiveIncomeMultiplier;
        newState = {
          ...newState,
          coins: Math.max(0, newState.coins + passiveAmount), // Ensure coins never go below 0
          totalEarned: newState.totalEarned + passiveAmount
        };
      }
      
      // Process auto tap if enabled
      if (newState.autoTap) {
        // Get tap multiplier from tap power upgrade
        const tapPowerUpgrade = state.upgrades.find(u => u.id === 'tap-power-1');
        const tapBoostMultiplier = tapPowerUpgrade ? 1 + (tapPowerUpgrade.level * tapPowerUpgrade.coinsPerClickBonus) : 1;
        
        const clickMultiplier = calculateClickMultiplier(state.ownedArtifacts);
        // Auto tap is 40% as effective as manual clicks (reduced from 50%)
        const baseClickValue = newState.coinsPerClick * 0.35; // Same reduction as manual clicks
        const coinsPerSecondBonus = newState.coinsPerSecond * 0.05; // Same reduction as manual clicks
        const autoTapAmount = (baseClickValue + coinsPerSecondBonus) * newState.incomeMultiplier * clickMultiplier * 0.4 * tapBoostMultiplier;
        
        newState = {
          ...newState,
          coins: Math.max(0, newState.coins + autoTapAmount), // Ensure coins never go below 0
          totalEarned: newState.totalEarned + autoTapAmount,
          totalClicks: newState.totalClicks + 1
        };
      }
      
      // Process auto buy
      if (newState.autoBuy) {
        let costReduction = calculateCostReduction(state.ownedArtifacts);
        
        // Apply ability cost reduction effects
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
        
        // Ensure cost reduction doesn't go below 50%
        costReduction = Math.max(0.5, costReduction);
        
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
            coins: state.coins - bestUpgrade.cost,
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
      
      // Apply ability bonuses for essence rewards
      if (state.abilities.find(a => a.id === "ability-7" && a.unlocked)) {
        essenceReward = Math.floor(essenceReward * 1.15); // Galactic Achievement Scanner: +15% essence
      }
      if (state.abilities.find(a => a.id === "ability-10" && a.unlocked)) {
        essenceReward = Math.floor(essenceReward * 1.2); // Interstellar Navigation AI: +20% essence rewards
      }
      if (state.abilities.find(a => a.id === "ability-13" && a.unlocked)) {
        essenceReward = Math.floor(essenceReward * 1.35); // Cosmic Singularity Engine: +35% essence gain
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
        skillPoints: state.skillPoints, // Retain skill points after prestige
        abilities: state.abilities // Retain abilities after prestige
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
    case 'HANDLE_CLICK': {
      // Get tap multiplier from tap power upgrade
      const tapPowerUpgrade = state.upgrades.find(u => u.id === 'tap-power-1');
      const tapBoostMultiplier = tapPowerUpgrade ? 1 + (tapPowerUpgrade.level * tapPowerUpgrade.coinsPerClickBonus) : 1;
      
      // Base click value is now 100% (not 35%)
      const clickMultiplier = calculateClickMultiplier(state.ownedArtifacts);
      
      // Base click value now includes only 5% of coins per second
      const baseClickValue = state.coinsPerClick; // Now using full coinsPerClick
      const coinsPerSecondBonus = state.coinsPerSecond * 0.05; // Kept this the same
      
      // Apply ability boosts to tap value
      let abilityTapMultiplier = 1;
      if (state.abilities.find(a => a.id === "ability-2" && a.unlocked)) {
        abilityTapMultiplier += 0.5; // Quantum Vibration Enhancer: +50% tap power
      }
      if (state.abilities.find(a => a.id === "ability-8" && a.unlocked)) {
        abilityTapMultiplier += 0.85; // Plasma Discharge Excavator: +85% tap value
      }
      if (state.abilities.find(a => a.id === "ability-11" && a.unlocked)) {
        abilityTapMultiplier += 1.2; // Supernova Core Extractor: +120% tap value
      }
      
      // Removed critical hit logic
      
      const totalClickAmount = (baseClickValue + coinsPerSecondBonus) * 
                              state.incomeMultiplier * 
                              clickMultiplier * 
                              tapBoostMultiplier *
                              abilityTapMultiplier;
      
      return {
        ...state,
        coins: Math.max(0, state.coins + totalClickAmount), // Ensure coins never go below 0
        totalClicks: state.totalClicks + 1,
        totalEarned: state.totalEarned + totalClickAmount
      };
    }
    default:
      return state;
  }
};

interface GameContextType {
  state: GameState;
  dispatch: React.Dispatch<GameAction>;
  click: () => void;
  addCoins: (amount: number) => void;
  addEssence: (amount: number) => void;
  buyUpgrade: (upgradeId: string, quantity?: number) => void;
  toggleAutoBuy: () => void;
  toggleAutoTap: () => void;
  setIncomeMultiplier: (multiplier: number) => void;
  prestige: () => void;
  buyManager: (managerId: string) => void;
  buyArtifact: (artifactId: string) => void;
  unlockAbility: (abilityId: string) => void;
  unlockPerk: (perkId: string, parentId: string) => void;
  checkAchievements: () => void;
  calculateMaxPurchaseAmount: (upgradeId: string) => number;
  calculatePotentialEssenceReward: () => number;
  handleClick: () => void;
}

const GameContext = createContext<GameContextType | undefined>(undefined);

export const gameContextHolder: { current: GameContextType | null } = { current: null };

export const GameProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [state, dispatch] = useReducer(gameReducer, initialState);
  const { toast } = useToast();
  const gameMechanics = useGameMechanics();
  
  // Load AdMob on initial render
  useEffect(() => {
    const initAds = async () => {
      try {
        await adMobService.initialize();
        await adMobService.loadInterstitialAd();
      } catch (error) {
        console.error("Failed to initialize ads:", error);
      }
    };
    
    initAds();
  }, []);
  
  // Game tick effect for passive income and auto features
  useEffect(() => {
    const tickInterval = setInterval(() => {
      dispatch({ type: 'TICK' });
    }, 100); // 10 ticks per second for smoother gameplay
    
    return () => clearInterval(tickInterval);
  }, []);
  
  // Check for achievements periodically
  useEffect(() => {
    const achievementInterval = setInterval(() => {
      dispatch({ type: 'CHECK_ACHIEVEMENTS' });
    }, 5000); // Check every 5 seconds
    
    return () => clearInterval(achievementInterval);
  }, []);
  
  // Calculate maximum affordable purchase amount
  const calculateMaxPurchaseAmount = (upgradeId: string): number => {
    const upgrade = state.upgrades.find(u => u.id === upgradeId);
    if (!upgrade || upgrade.level >= upgrade.maxLevel) return 0;
    
    const costReduction = calculateCostReduction(state.ownedArtifacts);
    
    // Use our utility function
    return calculateMaxAffordableQuantity(
      state.coins,
      upgrade.baseCost * costReduction,
      upgrade.level,
      UPGRADE_COST_GROWTH
    );
  };
  
  // Calculate potential essence reward for prestige
  const calculatePotentialEssenceReward = (): number => {
    let essenceReward = gameMechanics.calculatePotentialEssenceReward(state.totalEarned, state.ownedArtifacts);
    
    // Apply ability bonuses for essence rewards
    if (state.abilities.find(a => a.id === "ability-7" && a.unlocked)) {
      essenceReward = Math.floor(essenceReward * 1.15); // Galactic Achievement Scanner: +15% essence
    }
    if (state.abilities.find(a => a.id === "ability-10" && a.unlocked)) {
      essenceReward = Math.floor(essenceReward * 1.2); // Interstellar Navigation AI: +20% essence rewards
    }
    if (state.abilities.find(a => a.id === "ability-13" && a.unlocked)) {
      essenceReward = Math.floor(essenceReward * 1.35); // Cosmic Singularity Engine: +35% essence gain
    }
    
    return essenceReward;
  };
  
  // Game actions
  const click = () => dispatch({ type: 'CLICK' });
  const addCoins = (amount: number) => dispatch({ type: 'ADD_COINS', amount });
  const addEssence = (amount: number) => dispatch({ type: 'ADD_ESSENCE', amount });
  const buyUpgrade = (upgradeId: string, quantity = 1) => dispatch({ type: 'BUY_UPGRADE', upgradeId, quantity });
  const toggleAutoBuy = () => dispatch({ type: 'TOGGLE_AUTO_BUY' });
  const toggleAutoTap = () => dispatch({ type: 'TOGGLE_AUTO_TAP' });
  const setIncomeMultiplier = (multiplier: number) => dispatch({ type: 'SET_INCOME_MULTIPLIER', multiplier });
  const prestige = () => dispatch({ type: 'PRESTIGE' });
  const buyManager = (managerId: string) => dispatch({ type: 'BUY_MANAGER', managerId });
  const buyArtifact = (artifactId: string) => dispatch({ type: 'BUY_ARTIFACT', artifactId });
  const unlockAbility = (abilityId: string) => dispatch({ type: 'UNLOCK_ABILITY', abilityId });
  const unlockPerk = (perkId: string, parentId: string) => dispatch({ type: 'UNLOCK_PERK', perkId, parentId });
  const checkAchievements = () => dispatch({ type: 'CHECK_ACHIEVEMENTS' });
  const handleClick = () => dispatch({ type: 'HANDLE_CLICK' });
  
  const contextValue = {
    state,
    dispatch,
    click,
    addCoins,
    addEssence,
    buyUpgrade,
    toggleAutoBuy,
    toggleAutoTap,
    setIncomeMultiplier,
    prestige,
    buyManager,
    buyArtifact,
    unlockAbility,
    unlockPerk,
    checkAchievements,
    calculateMaxPurchaseAmount,
    calculatePotentialEssenceReward,
    handleClick
  };
  
  // Store the context in the global holder for access without hooks
  gameContextHolder.current = contextValue;
  
  return (
    <GameContext.Provider value={contextValue}>
      {children}
    </GameContext.Provider>
  );
};

export const useGame = () => {
  const context = useContext(GameContext);
  if (context === undefined) {
    throw new Error('useGame must be used within a GameProvider');
  }
  return context;
};
