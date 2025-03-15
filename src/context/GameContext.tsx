import React, { createContext, useContext, useReducer, useEffect, ReactNode } from 'react';
import { upgradesList, UPGRADE_CATEGORIES } from '@/utils/upgradesData';
import { managers } from '@/utils/managersData';
import { artifacts } from '@/utils/artifactsData';
import { Shield, Zap, Brain, Star, TargetIcon, HandCoins, Trophy, CloudLightning, Gem, Gauge, Compass, Sparkles, Rocket, Flower, Flame } from 'lucide-react';
import { formatNumber } from '@/utils/gameLogic';
import { adMobService } from '@/services/AdMobService';
import useGameMechanics from '@/hooks/useGameMechanics';
import * as GameMechanics from '@/utils/GameMechanics';
import { createAchievements } from '@/utils/achievementsCreator';
import { StorageService } from '@/services/StorageService';
import { InventoryItem, INVENTORY_ITEMS, createInventoryItem } from '@/components/menu/types';

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
  inventory: InventoryItem[];
  inventoryCapacity: number;
  gems: number;
  boosts: Record<string, { // Added for boost tracking
    active: boolean;
    remainingTime?: number; // Seconds left for temporary boosts
    remainingUses?: number; // Uses left (e.g., taps)
    purchased: number; // Total purchased for permanent boosts
  }>;
  hasNoAds: boolean; // Added for No Ads boost
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
  | { type: 'HANDLE_CLICK'; }
  | { type: 'RESTORE_STATE_PROPERTY'; property: keyof GameState; value: any }
  | { type: 'RESTORE_UPGRADES'; upgrades: Upgrade[] }
  | { type: 'RESTORE_ABILITIES'; abilities: Ability[] }
  | { type: 'RESTORE_ACHIEVEMENTS'; achievements: Achievement[] }
  | { type: 'USE_ITEM'; itemId: string }
  | { type: 'ADD_ITEM'; item: InventoryItem }
  | { type: 'REMOVE_ITEM'; itemId: string; quantity?: number }
  | { type: 'SET_MENU_TYPE'; menuType: string }
  | { type: 'ADD_GEMS'; amount: number }
  | { type: 'ACTIVATE_BOOST'; boostId: string }; // Added for boost activation

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
  unlockedPerks: [],
  inventory: [],
  inventoryCapacity: 100,
  gems: 0,
  boosts: {}, // Added
  hasNoAds: false, // Added
};

// Game reducer with updated mechanics
const gameReducer = (state: GameState, action: GameAction): GameState => {
  switch (action.type) {
    case 'CLICK': {
      // Use GameMechanics to calculate tap value
      let totalClickAmount = GameMechanics.calculateTapValue(state);
      if (state.boosts["boost-tap-boost"]?.active && state.boosts["boost-tap-boost"].remainingUses) {
        totalClickAmount *= INVENTORY_ITEMS.TAP_BOOST.effect!.value; // 5x tap power
        state.boosts["boost-tap-boost"].remainingUses -= 1;
        if (state.boosts["boost-tap-boost"].remainingUses <= 0) {
          state.boosts["boost-tap-boost"].active = false;
        }
      }
      
      return {
        ...state,
        coins: Math.max(0, state.coins + totalClickAmount),
        totalClicks: state.totalClicks + 1,
        totalEarned: state.totalEarned + totalClickAmount
      };
    }
    case 'ADD_COINS':
      return {
        ...state,
        coins: Math.max(0, state.coins + action.amount),
        totalEarned: state.totalEarned + action.amount
      };
    case 'ADD_GEMS':
      return {
        ...state,
        gems: state.gems + action.amount
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
      
      const costReduction = GameMechanics.calculateCostReduction(state);
      
      const quantity = action.quantity || 1;
      
      if (upgrade.level >= upgrade.maxLevel) return state;
      
      const maxPossibleQuantity = Math.min(
        quantity, 
        upgrade.maxLevel - upgrade.level
      );
      
      let totalCost = Math.floor(GameMechanics.calculateBulkPurchaseCost(
        upgrade.baseCost, 
        upgrade.level, 
        maxPossibleQuantity, 
        UPGRADE_COST_GROWTH
      ) * costReduction);
      if (state.boosts["boost-cheap-upgrades"]?.active) {
        totalCost *= INVENTORY_ITEMS.CHEAP_UPGRADES.effect!.value; // 0.9 = 10% reduction
      }
      
      if (state.coins < totalCost) return state;
      
      const oldLevel = upgrade.level;
      const newLevel = upgrade.level + maxPossibleQuantity;
      
      const shouldAwardSkillPoint = GameMechanics.checkUpgradeMilestone(oldLevel, newLevel);
      
      let newCoinsPerClick = state.coinsPerClick;
      let newCoinsPerSecond = state.coinsPerSecond;
      
      if (upgrade.category === UPGRADE_CATEGORIES.TAP) {
        // Handled by GameMechanics.calculateTapValue
      } else {
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
  const newBoosts = { ...state.boosts };
  Object.keys(newBoosts).forEach(boostId => {
    if (newBoosts[boostId].remainingTime) {
      newBoosts[boostId].remainingTime -= 0.1; // 100ms tick
      if (newBoosts[boostId].remainingTime <= 0) {
        newBoosts[boostId].active = false;
      }
    }
  });

  let newState = { ...state, boosts: newBoosts };

  if (state.coinsPerSecond > 0) {
    const passiveAmount = GameMechanics.calculatePassiveIncome(state) * calculateBaseCoinsPerSecond(state) / state.coinsPerSecond;
    newState = {
      ...newState,
      coins: Math.max(0, newState.coins + passiveAmount),
      totalEarned: newState.totalEarned + passiveAmount
    };
  }

  if (newState.autoTap) {
    const autoTapBase = GameMechanics.calculateAutoTapIncome(state);
    const autoTapBoost = newBoosts["boost-auto-tap"]?.active 
      ? calculateBaseCoinsPerClick(state) * INVENTORY_ITEMS.AUTO_TAP.effect!.value * 0.1 // 5 taps/sec
      : 0;
    const autoTapAmount = autoTapBase + autoTapBoost;

    newState = {
      ...newState,
      coins: Math.max(0, newState.coins + autoTapAmount),
      totalEarned: newState.totalEarned + autoTapAmount,
      totalClicks: newState.totalClicks + 1
    };
  }

  if (newState.autoBuy) {
    const costReduction = GameMechanics.calculateCostReduction(state);
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

      const shouldAwardSkillPoint = GameMechanics.checkUpgradeMilestone(oldLevel, newLevel);

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
      const essenceReward = GameMechanics.calculateEssenceReward(state.totalEarned, state) *
        (state.boosts["boost-essence-boost"]?.purchased ? INVENTORY_ITEMS.ESSENCE_BOOST.effect!.value : 1); // 25% boost
      const startingCoins = GameMechanics.calculateStartingCoins(state.ownedArtifacts);
      
      const newBoosts = {};
      ["boost-perma-tap", "boost-perma-passive", "boost-no-ads", "boost-auto-buy", "boost-inventory-expansion"].forEach(boostId => {
        if (state.boosts[boostId]?.purchased) {
          newBoosts[boostId] = { ...state.boosts[boostId], active: false }; // Preserve permanent boosts
        }
      });

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
        skillPoints: state.skillPoints,
        abilities: state.abilities,
        unlockedPerks: state.unlockedPerks,
        gems: state.gems,
        boosts: newBoosts, // Added
        hasNoAds: state.hasNoAds || state.boosts["boost-no-ads"]?.purchased > 0, // Added
        inventoryCapacity: initialState.inventoryCapacity + (state.boosts["boost-inventory-expansion"]?.purchased || 0) * INVENTORY_ITEMS.INVENTORY_EXPANSION.effect!.value, // Added
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
        skillPoints: state.skillPoints + 1
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
        skillPoints: state.skillPoints + unlockableAchievements.length
      };
    }
    case 'UNLOCK_ABILITY': {
      const abilityIndex = state.abilities.findIndex(a => a.id === action.abilityId);
      
      if (abilityIndex === -1) return state;
      
      const ability = state.abilities[abilityIndex];
      
      if (ability.unlocked) return state;
      
      if (state.skillPoints < ability.cost) return state;
      
      const requiredAbilitiesUnlocked = ability.requiredAbilities.every(requiredId => {
        const requiredAbility = state.abilities.find(a => a.id === requiredId);
        return requiredAbility && requiredAbility.unlocked;
      });
      
      if (!requiredAbilitiesUnlocked) return state;
      
      const newAbilities = [...state.abilities];
      newAbilities[abilityIndex] = { ...newAbilities[abilityIndex], unlocked: true };
      
      return {
        ...state,
        skillPoints: state.skillPoints - ability.cost,
        abilities: newAbilities
      };
    }
    case 'UNLOCK_PERK': {
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
      
      const updatedCollections = {
        managers: [...state.managers],
        artifacts: [...state.artifacts]
      };
      
      const parentIndex = updatedCollections[parentCollection].findIndex(item => item.id === action.parentId);
      if (parentIndex === -1) return state;
      
      const updatedParent = {...updatedCollections[parentCollection][parentIndex]};
      if (!updatedParent.perks) return state;
      
      const perkIndex = updatedParent.perks.findIndex(p => p.id === action.perkId);
      if (perkIndex === -1) return state;
      
      let perksToUnlock = [action.perkId];
      let unlockedPerksCost = perk.cost;
      const selectedPerkCost = perk.cost;
      
      updatedParent.perks.forEach(p => {
        if (p.cost < selectedPerkCost && !p.unlocked && !state.unlockedPerks.includes(p.id)) {
          perksToUnlock.push(p.id);
        }
      });
      
      updatedParent.perks = updatedParent.perks.map(p => {
        if (perksToUnlock.includes(p.id)) {
          return { ...p, unlocked: true };
        }
        return p;
      });
      
      updatedCollections[parentCollection][parentIndex] = updatedParent;
      
      return {
        ...state,
        skillPoints: state.skillPoints - perk.cost,
        unlockedPerks: [...state.unlockedPerks, ...perksToUnlock],
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
      const totalClickAmount = GameMechanics.calculateTapValue(state);
      
      return {
        ...state,
        coins: Math.max(0, state.coins + totalClickAmount),
        totalClicks: state.totalClicks + 1,
        totalEarned: state.totalEarned + totalClickAmount
      };
    }
    case 'RESTORE_STATE_PROPERTY': {
      return {
        ...state,
        [action.property]: action.value
      };
    }
    case 'RESTORE_UPGRADES': {
      return {
        ...state,
        upgrades: action.upgrades
      };
    }
    case 'RESTORE_ABILITIES': {
      return {
        ...state,
        abilities: action.abilities
      };
    }
    case 'RESTORE_ACHIEVEMENTS': {
      return {
        ...state,
        achievements: action.achievements
      };
    }
    case 'USE_ITEM': {
      const itemIndex = state.inventory.findIndex(item => item.id === action.itemId);
      if (itemIndex === -1) return state;
      
      const item = state.inventory[itemIndex];
      if (!item.usable) return state;
      
      let updatedState = { ...state };
      let newCoins = state.coins;
      
      if (item.effect) {
        switch (item.effect.type) {
          case 'coins':
            updatedState.coins += item.effect.value;
            updatedState.totalEarned += item.effect.value;
            break;
          case 'essence':
            updatedState.essence += item.effect.value;
            break;
          case 'coinMultiplier':
            const reward = updatedState.coinsPerSecond * item.effect.value * (item.effect.duration || 60);
            updatedState.coins += reward;
            updatedState.totalEarned += reward;
            console.log(`Applied coinMultiplier boost: ${reward} coins`);
            break;
          case 'timeWarp':
            const timeReward = updatedState.coinsPerSecond * item.effect.value;
            newCoins += timeReward;
            updatedState.totalEarned += timeReward;
            console.log(`Applied timeWarp boost: ${timeReward} coins`);
            break;
          case 'autoTap':
            const tapValue = GameMechanics.calculateTapValue(state);
            const tapRate = item.effect.value || 1;
            const duration = item.effect.duration || 60;
            const tapReward = tapValue * tapRate * duration;
            newCoins += tapReward;
            updatedState.totalEarned += tapReward;
            updatedState.totalClicks += tapRate * duration;
            console.log(`Applied autoTap boost: ${tapReward} coins from ${tapRate * duration} taps`);
            break;
          case 'noAds':
            updatedState.hasNoAds = true;
            break;
          case 'unlockAutoBuy':
            updatedState.autoBuy = true;
            break;
          case 'inventoryCapacity':
            updatedState.inventoryCapacity += item.effect.value;
            break;
        }
      }
      
      const updatedInventory = [...state.inventory];
      if (item.quantity > 1) {
        updatedInventory[itemIndex] = {
          ...item,
          quantity: item.quantity - 1
        };
      } else {
        updatedInventory.splice(itemIndex, 1);
      }
      
      return {
        ...updatedState,
        coins: newCoins,
        inventory: updatedInventory,
        boosts: {
          ...state.boosts,
          [action.itemId]: {
            active: !!item.effect?.duration,
            remainingTime: item.effect?.duration,
            remainingUses: item.effect?.type === "coinsPerClick" ? item.effect?.duration : undefined,
            purchased: (state.boosts[action.itemId]?.purchased || 0) + 1,
          },
        },
      };
    }
    case 'ADD_ITEM': {
      const currentItems = state.inventory.reduce(
        (total, item) => total + (item.stackable ? 1 : item.quantity), 
        0
      );
      
      if (currentItems >= state.inventoryCapacity && !action.item.stackable) {
        return state;
      }
      
      if (action.item.stackable) {
        const existingItemIndex = state.inventory.findIndex(
          item => item.id === action.item.id
        );
        
        if (existingItemIndex !== -1) {
          const updatedInventory = [...state.inventory];
          updatedInventory[existingItemIndex] = {
            ...updatedInventory[existingItemIndex],
            quantity: updatedInventory[existingItemIndex].quantity + action.item.quantity
          };
          
          return {
            ...state,
            inventory: updatedInventory
          };
        }
      }
      
      return {
        ...state,
        inventory: [...state.inventory, action.item]
      };
    }
    case 'REMOVE_ITEM': {
      const itemIndex = state.inventory.findIndex(item => item.id === action.itemId);
      if (itemIndex === -1) return state;
      
      const item = state.inventory[itemIndex];
      const quantity = action.quantity || 1;
      
      if (item.quantity <= quantity) {
        return {
          ...state,
          inventory: state.inventory.filter(item => item.id !== action.itemId)
        };
      } else {
        const updatedInventory = [...state.inventory];
        updatedInventory[itemIndex] = {
          ...item,
          quantity: item.quantity - quantity
        };
        
        return {
          ...state,
          inventory: updatedInventory
        };
      }
    }
    case 'SET_MENU_TYPE': {
      return state;
    }
    case 'ACTIVATE_BOOST': {
      const boost = Object.values(INVENTORY_ITEMS).find(b => b.id === action.boostId);
      if (!boost || !boost.usable) return state;
      return {
        ...state,
        boosts: {
          ...state.boosts,
          [action.boostId]: {
            active: !!boost.effect?.duration,
            remainingTime: boost.effect?.duration,
            remainingUses: boost.effect?.type === "coinsPerClick" ? boost.effect?.duration : undefined,
            purchased: (state.boosts[action.boostId]?.purchased || 0) + 1,
          },
        },
      };
    }
    default:
      return state;
  }
};

// Helper functions for boost effects
const calculateIncomeMultiplier = (state: GameState) => {
  let multiplier = state.incomeMultiplier;
  if (state.boosts["boost-double-coins"]?.active) {
    multiplier *= INVENTORY_ITEMS.DOUBLE_COINS.effect!.value;
  }
  return multiplier;
};

const calculateBaseCoinsPerClick = (state: GameState) => {
  let base = state.coinsPerClick;
  if (state.boosts["boost-perma-tap"]?.purchased) {
    base += state.boosts["boost-perma-tap"].purchased * INVENTORY_ITEMS.PERMA_TAP.effect!.value; // +1 per use
  }
  return base;
};

const calculateBaseCoinsPerSecond = (state: GameState) => {
  let base = state.coinsPerSecond;
  if (state.boosts["boost-perma-passive"]?.purchased) {
    base += state.boosts["boost-perma-passive"].purchased * INVENTORY_ITEMS.PERMA_PASSIVE.effect!.value; // +1 per use
  }
  return base;
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
  useItem: (itemId: string) => void;
  addItem: (item: InventoryItem) => void;
  removeItem: (itemId: string, quantity?: number) => void;
  addGems: (amount: number) => void;
  activateBoost: (boostId: string) => void; // Added
}

const GameContext = createContext<GameContextType | undefined>(undefined);

export const gameContextHolder: { current: GameContextType | null } = { current: null };

export const GameProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [state, dispatch] = useReducer(gameReducer, initialState);
  
  useEffect(() => {
    const loadSavedGameState = async () => {
      try {
        const savedState = await StorageService.loadGameState();
        
        if (savedState) {
          const restoredAbilities = initialState.abilities.map(ability => {
            const savedAbility = savedState.abilities?.find(a => a.id === ability.id);
            if (savedAbility) {
              return {
                ...ability,
                unlocked: savedAbility.unlocked
              };
            }
            return ability;
          });
          
          const restoredUpgrades = initialState.upgrades.map(upgrade => {
            const savedUpgrade = savedState.upgrades?.find(u => u.id === upgrade.id);
            if (savedUpgrade) {
              return {
                ...savedUpgrade,
                icon: upgrade.icon,
                description: upgrade.description
              };
            }
            return upgrade;
          });
          
          const restoredState: GameState = {
            ...initialState,
            ...savedState,
            abilities: restoredAbilities,
            upgrades: restoredUpgrades,
            achievements: initialState.achievements.map(achievement => {
              const savedAchievement = savedState.achievements?.find(a => a.id === achievement.id);
              return {
                ...achievement,
                unlocked: savedAchievement?.unlocked || false
              };
            }),
            managers: initialState.managers,
            artifacts: initialState.artifacts,
            boosts: savedState.boosts || {}, // Added
            hasNoAds: savedState.hasNoAds || false, // Added
          };
          
          for (const key in restoredState) {
            if (key !== 'abilities' && key !== 'upgrades' && key !== 'achievements') {
              dispatch({ 
                type: 'RESTORE_STATE_PROPERTY', 
                property: key as keyof GameState, 
                value: restoredState[key as keyof GameState] 
              });
            }
          }
          
          dispatch({ type: 'RESTORE_UPGRADES', upgrades: restoredState.upgrades });
          dispatch({ type: 'RESTORE_ABILITIES', abilities: restoredState.abilities });
          dispatch({ type: 'RESTORE_ACHIEVEMENTS', achievements: restoredState.achievements });
          
          console.log('Game state restored from storage');
        }
      } catch (error) {
        console.error('Error loading saved game state:', error);
      }
    };
    
    loadSavedGameState();
    
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
  
  useEffect(() => {
    const saveInterval = setInterval(() => {
      StorageService.saveGameState(state);
    }, 30000);
    
    return () => {
      clearInterval(saveInterval);
      StorageService.saveGameState(state);
    };
  }, [state]);
  
  useEffect(() => {
    const tickInterval = setInterval(() => {
      dispatch({ type: 'TICK' });
    }, 100);
    
    return () => clearInterval(tickInterval);
  }, []);
  
  useEffect(() => {
    const achievementInterval = setInterval(() => {
      dispatch({ type: 'CHECK_ACHIEVEMENTS' });
    }, 5000);
    
    return () => clearInterval(achievementInterval);
  }, []);
  
  const calculateMaxPurchaseAmount = (upgradeId: string): number => {
    const upgrade = state.upgrades.find(u => u.id === upgradeId);
    if (!upgrade || upgrade.level >= upgrade.maxLevel) return 0;
    
    const costReduction = GameMechanics.calculateCostReduction(state);
    
    return GameMechanics.calculateMaxAffordableQuantity(
      state.coins,
      upgrade.baseCost * costReduction,
      upgrade.level,
      UPGRADE_COST_GROWTH
    );
  };
  
  const calculatePotentialEssenceReward = (): number => {
    return GameMechanics.calculateEssenceReward(state.totalEarned, state);
  };
  
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
  const useItem = (itemId: string) => dispatch({ type: 'USE_ITEM', itemId });
  const addItem = (item: InventoryItem) => dispatch({ type: 'ADD_ITEM', item });
  const removeItem = (itemId: string, quantity?: number) => dispatch({ type: 'REMOVE_ITEM', itemId, quantity });
  const addGems = (amount: number) => dispatch({ type: 'ADD_GEMS', amount });
  const activateBoost = (boostId: string) => dispatch({ type: 'ACTIVATE_BOOST', boostId }); // Added
  
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
    handleClick,
    useItem,
    addItem,
    removeItem,
    addGems,
    activateBoost // Added
  };
  
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
