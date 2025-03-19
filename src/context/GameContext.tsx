import React, { createContext, useContext, useReducer, useEffect, ReactNode } from 'react';
import { upgradesList, UPGRADE_CATEGORIES } from '@/utils/upgradesData';
import { managers } from '@/utils/managersData';
import { artifacts } from '@/utils/artifactsData';
import { formatNumber } from '@/utils/gameLogic';
import { adMobService } from '@/services/AdMobService';
import useGameMechanics from '@/hooks/useGameMechanics';
import * as GameMechanics from '@/utils/GameMechanics';
import { createAchievements } from '@/utils/achievementsCreator';
import { StorageService } from '@/services/StorageService';
import { InventoryItem, INVENTORY_ITEMS, createInventoryItem, BoostEffect, isBoostItem } from '@/components/menu/types';
import { Scan, Zap, Brain, Shield, ArrowRight, Bot, Binary, Cpu, Globe, Atom, PanelRight, BarChart3, Rocket } from 'lucide-react';

export interface Achievement {
  id: string;
  name: string;
  description: string;
  unlocked: boolean;
  checkCondition: (state: GameState) => boolean;
  rewards?: {
    type: 'gems' | 'boost' | 'title' | 'portrait' | 'inventory_item';
    value: number | string;
    image: string;
  };
}

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
  boosts: Record<string, {
    active: boolean;
    remainingTime?: number;
    remainingUses?: number;
    purchased: number;
    activatedAt?: number;
  }>;
  hasNoAds: boolean;
  username: string;
  title: string;
  userId: string;
  portrait: string;
  nameChangeCount: number;
}

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
  | { type: 'HANDLE_CLICK' }
  | { type: 'RESTORE_STATE_PROPERTY'; property: keyof GameState; value: any }
  | { type: 'RESTORE_UPGRADES'; upgrades: Upgrade[] }
  | { type: 'RESTORE_ABILITIES'; abilities: Ability[] }
  | { type: 'RESTORE_ACHIEVEMENTS'; achievements: Achievement[] }
  | { type: 'USE_ITEM'; itemId: string; quantity: number }
  | { type: 'ADD_ITEM'; item: InventoryItem }
  | { type: 'REMOVE_ITEM'; itemId: string; quantity?: number }
  | { type: 'SET_MENU_TYPE'; menuType: string }
  | { type: 'ADD_GEMS'; amount: number }
  | { type: 'ACTIVATE_BOOST'; boostId: string; quantity: number }
  | { type: 'UPDATE_USERNAME'; username: string }
  | { type: 'UPDATE_TITLE'; title: string }
  | { type: 'UPDATE_PORTRAIT'; portrait: string }
  | { type: 'UPDATE_NAME_CHANGE_COUNT'; count: number };

const updatedUpgradesList = upgradesList.map(upgrade => ({
  ...upgrade,
  maxLevel: 1000,
  cost: upgrade.baseCost * 1.5,
  baseCost: upgrade.baseCost * 1.5,
  coinsPerSecondBonus: upgrade.coinsPerSecondBonus * 0.5
}));

const initialAbilities: Ability[] = [
  {
    id: "ability-1",
    name: "Asteroid Drill",
    description: "Just a rusty old drill that somehow still works. The user manual was written in crayon.",
    cost: 0,
    icon: <Rocket className="w-[60px] h-[60px]" />,
    unlocked: true,
    requiredAbilities: [],
    row: 1,
    column: 2
  },
  {
    id: "ability-2",
    name: "Quantum Vibration Enhancer",
    description: "Uses quantum vibration technology to increase mining efficiency. Tap power increased by 50% and passive income by 25%.",
    cost: 3,
    icon: <Zap className="w-[60px] h-[60px]" />,
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
    icon: <Brain className="w-[60px] h-[60px]" />,
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
    icon: <Shield className="w-[60px] h-[60px]" />,
    unlocked: false,
    requiredAbilities: ["ability-1"],
    row: 2,
    column: 3
  },
  {
    id: "ability-5",
    name: "Laser-Guided Extraction System",
    description: "Precision mining laser technology. 15% chance of critical strike for 5x normal mining yield per tap.",
    cost: 5,
    icon: <ArrowRight className="w-[60px] h-[60px]" />,
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
    icon: <Atom className="w-[60px] h-[60px]" />,
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
    icon: <Scan className="w-[60px] h-[60px]" />,
    unlocked: false,
    requiredAbilities: ["ability-4"],
    row: 3,
    column: 3
  },
  {
    id: "ability-8",
    name: "Plasma Discharge Excavator",
    description: "Uses controlled plasma bursts to break down asteroids. Boosts tap value by 85% and passive income by 55%.",
    cost: 8,
    icon: <Zap className="w-[60px] h-[60px] text-purple-500" />,
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
    icon: <Bot className="w-[60px] h-[60px]" />,
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
    icon: <Globe className="w-[60px] h-[60px]" />,
    unlocked: false,
    requiredAbilities: ["ability-7"],
    row: 4,
    column: 3
  },
  {
    id: "ability-11",
    name: "Supernova Core Extractor",
    description: "Harvests energy from the remnants of exploded stars. Boosts tap value by 120% and all income by 80%.",
    cost: 12,
    icon: <Cpu className="w-[60px] h-[60px]" />,
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
    icon: <PanelRight className="w-[60px] h-[60px]" />,
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
    icon: <BarChart3 className="w-[60px] h-[60px]" />,
    unlocked: false,
    requiredAbilities: ["ability-10"],
    row: 5,
    column: 3
  }
];

const UPGRADE_COST_GROWTH = 1.15;

const initialState: GameState = {
  coins: 0,
  coinsPerClick: 1,
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
  boosts: {},
  hasNoAds: false,
  username: "Cosmic Explorer",
  title: "space_pilot",
  userId: Math.floor(10000000 + Math.random() * 90000000).toString(),
  portrait: "default",
  nameChangeCount: 0
};

const gameReducer = (state: GameState, action: GameAction): GameState => {
  switch (action.type) {
    case 'CLICK': {
      let totalClickAmount = GameMechanics.calculateTapValue(state);
      if (state.boosts["boost-tap-boost"]?.active && state.boosts["boost-tap-boost"].remainingUses) {
        const tapBoost = INVENTORY_ITEMS.TAP_BOOST;
        if (isBoostItem(tapBoost)) {
          totalClickAmount *= tapBoost.effect.value;
        }
        state.boosts["boost-tap-boost"].remainingUses -= 1;
        if (state.boosts["boost-tap-boost"].remainingUses <= 0) {
          state.boosts["boost-tap-boost"].active = false;
        }
      }
      const incomeMultiplier = calculateIncomeMultiplier(state);
      totalClickAmount *= incomeMultiplier / state.incomeMultiplier; // Apply global multiplier
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
      const cheapUpgrades = INVENTORY_ITEMS.CHEAP_UPGRADES;
      const cheapUpgradesMultiplier = state.boosts["boost-cheap-upgrades"]?.active && isBoostItem(cheapUpgrades) ? 
        cheapUpgrades.effect.value : 1;
      const totalCostReduction = costReduction * cheapUpgradesMultiplier;
      
      const quantity = action.quantity || 1;
      if (upgrade.level >= upgrade.maxLevel) return state;
      
      const maxPossibleQuantity = Math.min(quantity, upgrade.maxLevel - upgrade.level);
      const totalCost = Math.floor(GameMechanics.calculateBulkPurchaseCost(
        upgrade.baseCost, upgrade.level, maxPossibleQuantity, UPGRADE_COST_GROWTH
      ) * totalCostReduction);
      
      if (state.coins < totalCost) return state;
      
      const oldLevel = upgrade.level;
      const newLevel = upgrade.level + maxPossibleQuantity;
      const shouldAwardSkillPoint = GameMechanics.checkUpgradeMilestone(oldLevel, newLevel);
      
      let newCoinsPerClick = state.coinsPerClick;
      let newCoinsPerSecond = state.coinsPerSecond;
      if (upgrade.category !== UPGRADE_CATEGORIES.TAP) {
        newCoinsPerClick += upgrade.coinsPerClickBonus * maxPossibleQuantity;
        newCoinsPerSecond += upgrade.coinsPerSecondBonus * maxPossibleQuantity;
      }
      
      const updatedUpgrade = {
        ...upgrade,
        level: newLevel,
        cost: Math.floor(upgrade.baseCost * Math.pow(UPGRADE_COST_GROWTH, newLevel) * totalCostReduction)
      };
      
      const newUpgrades = [...state.upgrades];
      newUpgrades[upgradeIndex] = updatedUpgrade;
      
      state.upgrades.forEach((u, index) => {
        if (!u.unlocked && u.unlocksAt && u.unlocksAt.upgradeId === upgrade.id && updatedUpgrade.level >= u.unlocksAt.level) {
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
      
      return shouldAwardSkillPoint ? { ...newState, skillPoints: newState.skillPoints + 1 } : newState;
    }
    case 'TOGGLE_AUTO_BUY':
      return { ...state, autoBuy: !state.autoBuy };
    case 'TOGGLE_AUTO_TAP':
      return { ...state, autoTap: !state.autoTap };
    case 'SET_INCOME_MULTIPLIER':
      return { ...state, incomeMultiplier: action.multiplier };
    case 'TICK': {
      const newBoosts = { ...state.boosts };
      const now = Date.now() / 1000;
      
      Object.keys(newBoosts).forEach(boostId => {
        const boost = newBoosts[boostId];
        
        if (!boost.active) return;
        
        if (boost.remainingTime !== undefined) {
          boost.remainingTime! -= 0.1; // 100ms tick
          
          if (boost.remainingTime <= 0) {
            boost.active = false;
            boost.remainingTime = 0;
          }
        }
      });

      let newState = { ...state, boosts: newBoosts };
      
      if (newState.coinsPerSecond > 0) {
        const passiveAmount = GameMechanics.calculatePassiveIncome(newState);
        newState = {
          ...newState,
          coins: Math.max(0, newState.coins + passiveAmount),
          totalEarned: newState.totalEarned + passiveAmount
        };
      }

      if (newState.boosts["boost-auto-tap"]?.active) {
        const tapValue = GameMechanics.calculateTapValue(newState);
        const autoTap = INVENTORY_ITEMS.AUTO_TAP;
        const tapRate = isBoostItem(autoTap) ? autoTap.effect.value * 0.1 : 0.5; // 5 taps/sec over 0.1s tick
        const autoTapAmount = tapValue * tapRate;
        newState = {
          ...newState,
          coins: Math.max(0, newState.coins + autoTapAmount),
          totalEarned: newState.totalEarned + autoTapAmount,
          totalClicks: newState.totalClicks + Math.floor(tapRate)
        };
      }

      if (newState.autoTap) {
        const autoTapAmount = GameMechanics.calculateAutoTapIncome(newState);
        newState = {
          ...newState,
          coins: Math.max(0, newState.coins + autoTapAmount),
          totalEarned: newState.totalEarned + autoTapAmount,
          totalClicks: newState.totalClicks + 1
        };
      }

      if (newState.autoBuy) {
        const costReduction = GameMechanics.calculateCostReduction(state);
        const cheapUpgrades = INVENTORY_ITEMS.CHEAP_UPGRADES;
        const cheapUpgradesMultiplier = newBoosts["boost-cheap-upgrades"]?.active && isBoostItem(cheapUpgrades) ? 
          cheapUpgrades.effect.value : 1;
        const totalCostReduction = costReduction * cheapUpgradesMultiplier;
        
        const affordableUpgrades = newState.upgrades
          .filter(u => u.unlocked && u.level < u.maxLevel && newState.coins >= (u.cost * totalCostReduction))
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
            cost: Math.floor(bestUpgrade.baseCost * Math.pow(UPGRADE_COST_GROWTH, newLevel) * totalCostReduction)
          };

          const newUpgrades = [...newState.upgrades];
          newUpgrades[upgradeIndex] = updatedUpgrade;

          newState.upgrades.forEach((u, index) => {
            if (!u.unlocked && u.unlocksAt && u.unlocksAt.upgradeId === bestUpgrade.id && updatedUpgrade.level >= u.unlocksAt.level) {
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

          if (shouldAwardSkillPoint) {
            newState = { ...newState, skillPoints: newState.skillPoints + 1 };
          }
        }
      }

      return newState;
    }
    case 'PRESTIGE': {
      const essenceBoost = INVENTORY_ITEMS.ESSENCE_BOOST;
      const essenceMultiplier = state.boosts["boost-essence-boost"]?.purchased && isBoostItem(essenceBoost) ? 
        Math.pow(essenceBoost.effect.value, state.boosts["boost-essence-boost"].purchased) : 1;
      const essenceReward = GameMechanics.calculateEssenceReward(state.totalEarned, state) * essenceMultiplier;
      const startingCoins = GameMechanics.calculateStartingCoins(state.ownedArtifacts);
      
      const newBoosts = {};
      [
        "boost-perma-tap", 
        "boost-perma-passive", 
        "boost-no-ads", 
        "boost-auto-buy", 
        "boost-inventory-expansion",
        "boost-essence-boost"
      ].forEach(boostId => {
        if (state.boosts[boostId]?.purchased) {
          newBoosts[boostId] = { ...state.boosts[boostId], active: false };
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
        boosts: newBoosts,
        hasNoAds: state.hasNoAds || state.boosts["boost-no-ads"]?.purchased > 0,
        inventoryCapacity: initialState.inventoryCapacity + (state.boosts["boost-inventory-expansion"]?.purchased || 0) * 
          (isBoostItem(INVENTORY_ITEMS.INVENTORY_EXPANSION) ? INVENTORY_ITEMS.INVENTORY_EXPANSION.effect.value : 5),
        username: state.username,
        title: state.title,
        userId: state.userId,
        portrait: state.portrait,
        nameChangeCount: state.nameChangeCount
      };
    }
    case 'BUY_MANAGER': {
      const manager = managers.find(m => m.id === action.managerId);
      if (!manager || state.ownedManagers.includes(action.managerId) || state.essence < manager.cost) return state;
      return {
        ...state,
        essence: state.essence - manager.cost,
        ownedManagers: [...state.ownedManagers, action.managerId]
      };
    }
    case 'BUY_ARTIFACT': {
      const artifact = artifacts.find(a => a.id === action.artifactId);
      if (!artifact || state.ownedArtifacts.includes(action.artifactId) || state.essence < artifact.cost) return state;
      return {
        ...state,
        essence: state.essence - artifact.cost,
        ownedArtifacts: [...state.ownedArtifacts, action.artifactId]
      };
    }
    case 'UNLOCK_ACHIEVEMENT': {
      const achievementIndex = state.achievements.findIndex(a => a.id === action.achievementId);
      if (achievementIndex === -1 || state.achievements[achievementIndex].unlocked) return state;

      const newAchievements = [...state.achievements];
      newAchievements[achievementIndex] = { ...newAchievements[achievementIndex], unlocked: true };

      let newState = {
        ...state,
        achievements: newAchievements,
        achievementsChecked: { ...state.achievementsChecked, [action.achievementId]: true },
        skillPoints: state.skillPoints + 1
      };

      const reward = newAchievements[achievementIndex].rewards;
      if (reward) {
        switch (reward.type) {
          case 'gems':
            newState.gems += reward.value as number;
            break;
          case 'boost':
            newState.boosts['boost-generic'] = { active: true, remainingTime: reward.value as number, purchased: (state.boosts['boost-generic']?.purchased || 0) + 1 };
            break;
          case 'title':
            newState.title = reward.value as string;
            break;
          case 'portrait':
            newState.portrait = reward.value as string;
            break;
          case 'inventory_item':
            newState.inventory = [...newState.inventory, createInventoryItem(INVENTORY_ITEMS[reward.value as keyof typeof INVENTORY_ITEMS] as unknown as Omit<InventoryItem, "quantity">, 1)];
            break;
        }
      }
      return newState;
    }
    case 'CHECK_ACHIEVEMENTS': {
      const unlockableAchievements = state.achievements
        .filter(a => !a.unlocked && !state.achievementsChecked[a.id])
        .filter(a => a.checkCondition(state));
      if (unlockableAchievements.length === 0) return state;

      const newAchievements = [...state.achievements];
      const newAchievementsChecked = { ...state.achievementsChecked };
      let newState = { ...state, achievements: newAchievements, achievementsChecked: newAchievementsChecked };

      unlockableAchievements.forEach(achievement => {
        const index = newAchievements.findIndex(a => a.id === achievement.id);
        newAchievements[index] = { ...newAchievements[index], unlocked: true };
        newAchievementsChecked[achievement.id] = true;

        const reward = achievement.rewards;
        if (reward) {
          switch (reward.type) {
            case 'gems':
              newState.gems += reward.value as number;
              break;
            case 'boost':
              newState.boosts['boost-generic'] = { active: true, remainingTime: reward.value as number, purchased: (newState.boosts['boost-generic']?.purchased || 0) + 1 };
              break;
            case 'title':
              newState.title = reward.value as string;
              break;
            case 'portrait':
              newState.portrait = reward.value as string;
              break;
            case 'inventory_item':
              newState.inventory = [...newState.inventory, createInventoryItem(INVENTORY_ITEMS[reward.value as keyof typeof INVENTORY_ITEMS] as unknown as Omit<InventoryItem, "quantity">, 1)];
              break;
          }
        }
      });

      newState.skillPoints += unlockableAchievements.length;
      return newState;
    }
    case 'UNLOCK_ABILITY': {
      const abilityIndex = state.abilities.findIndex(a => a.id === action.abilityId);
      if (abilityIndex === -1 || state.abilities[abilityIndex].unlocked || state.skillPoints < state.abilities[abilityIndex].cost) return state;
      
      const ability = state.abilities[abilityIndex];
      const requiredAbilitiesUnlocked = ability.requiredAbilities.every(id => state.abilities.find(a => a.id === id)?.unlocked);
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
      const parent = state.managers.find(m => m.id === action.parentId) || state.artifacts.find(a => a.id === action.parentId);
      if (!parent || !parent.perks) return state;
      
      const perk = parent.perks.find(p => p.id === action.perkId);
      if (!perk || perk.unlocked || state.skillPoints < perk.cost) return state;
      
      const updatedCollections = {
        managers: [...state.managers],
        artifacts: [...state.artifacts]
      };
      const parentCollection = parent.cost ? 'artifacts' : 'managers';
      const parentIndex = updatedCollections[parentCollection].findIndex(item => item.id === action.parentId);
      const updatedParent = { ...updatedCollections[parentCollection][parentIndex] };
      updatedParent.perks = updatedParent.perks.map(p => p.id === action.perkId ? { ...p, unlocked: true } : p);
      updatedCollections[parentCollection][parentIndex] = updatedParent;
      
      return {
        ...state,
        skillPoints: state.skillPoints - perk.cost,
        unlockedPerks: [...state.unlockedPerks, action.perkId],
        [parentCollection]: updatedCollections[parentCollection]
      };
    }
    case 'ADD_SKILL_POINTS':
      return { ...state, skillPoints: state.skillPoints + action.amount };
    case 'HANDLE_CLICK':
      const totalClickAmount = GameMechanics.calculateTapValue(state) * calculateIncomeMultiplier(state) / state.incomeMultiplier;
      return {
        ...state,
        coins: Math.max(0, state.coins + totalClickAmount),
        totalClicks: state.totalClicks + 1,
        totalEarned: state.totalEarned + totalClickAmount
      };
    case 'RESTORE_STATE_PROPERTY':
      return { ...state, [action.property]: action.value };
    case 'RESTORE_UPGRADES':
      return { ...state, upgrades: action.upgrades };
    case 'RESTORE_ABILITIES':
      return { ...state, abilities: action.abilities };
    case 'RESTORE_ACHIEVEMENTS':
      return { ...state, achievements: action.achievements };
    case 'USE_ITEM': {
      const itemIndex = state.inventory.findIndex(item => item.id === action.itemId);
      if (itemIndex === -1 || !state.inventory[itemIndex].usable) return state;
      
      const item = state.inventory[itemIndex];
      const quantity = action.quantity;
      if (item.quantity < quantity) return state;

      const updatedInventory = [...state.inventory];
      if (item.quantity === quantity) {
        updatedInventory.splice(itemIndex, 1);
      } else {
        updatedInventory[itemIndex] = { ...item, quantity: item.quantity - quantity };
      }

      if (item.id === 'boost-time-warp' && isBoostItem(item)) {
        const passiveIncome = GameMechanics.calculatePassiveIncome({ ...state, coinsPerSecond: GameMechanics.calculateBaseCoinsPerSecond(state) });
        const timeWarpValue = item.effect.value || 120 * 60; // Default to 120 minutes (7200 seconds)
        const reward = passiveIncome * (timeWarpValue / 100) * quantity; // Scale based on tick interval (100ms)
        
        return {
          ...state,
          inventory: updatedInventory,
          coins: state.coins + reward,
          totalEarned: state.totalEarned + reward,
          boosts: activateBoostLogic(state.boosts, action.itemId, quantity)
        };
      }

      return {
        ...state,
        inventory: updatedInventory,
        boosts: activateBoostLogic(state.boosts, action.itemId, quantity)
      };
    }
    case 'ADD_ITEM': {
      const currentItems = state.inventory.reduce((total, item) => total + (item.stackable ? 1 : item.quantity), 0);
      if (currentItems >= state.inventoryCapacity && !action.item.stackable) return state;
      
      if (action.item.stackable) {
        const existingItemIndex = state.inventory.findIndex(item => item.id === action.item.id);
        if (existingItemIndex !== -1) {
          const updatedInventory = [...state.inventory];
          updatedInventory[existingItemIndex] = {
            ...updatedInventory[existingItemIndex],
            quantity: updatedInventory[existingItemIndex].quantity + action.item.quantity
          };
          return { ...state, inventory: updatedInventory };
        }
      }
      return { ...state, inventory: [...state.inventory, action.item] };
    }
    case 'REMOVE_ITEM': {
      const itemIndex = state.inventory.findIndex(item => item.id === action.itemId);
      if (itemIndex === -1) return state;
      
      const item = state.inventory[itemIndex];
      const quantity = action.quantity || 1;
      if (item.quantity <= quantity) {
        return { ...state, inventory: state.inventory.filter(item => item.id !== action.itemId) };
      } else {
        const updatedInventory = [...state.inventory];
        updatedInventory[itemIndex] = { ...item, quantity: item.quantity - quantity };
        return { ...state, inventory: updatedInventory };
      }
    }
    case 'SET_MENU_TYPE':
      return state;
    case 'ACTIVATE_BOOST':
      return {
        ...state,
        boosts: activateBoostLogic(state.boosts, action.boostId, action.quantity)
      };
    case 'UPDATE_USERNAME':
      return { ...state, username: action.username };
    case 'UPDATE_TITLE':
      return { ...state, title: action.title };
    case 'UPDATE_PORTRAIT':
      return { ...state, portrait: action.portrait };
    case 'UPDATE_NAME_CHANGE_COUNT':
      return { ...state, nameChangeCount: action.count };
    default:
      return state;
  }
};

const activateBoostLogic = (boosts: GameState['boosts'], boostId: string, quantity: number) => {
  const item = INVENTORY_ITEMS[boostId as keyof typeof INVENTORY_ITEMS];
  if (!item || !isBoostItem(item)) return boosts;

  const effect = item.effect;
  const currentBoost = boosts[boostId] || { active: false, purchased: 0 };
  const isPermanent = !effect.duration;
  const now = Date.now() / 1000;

  if (boostId === 'boost-time-warp') {
    return {
      ...boosts,
      [boostId]: {
        ...currentBoost,
        purchased: currentBoost.purchased + quantity
      }
    };
  }

  if (isPermanent) {
    return {
      ...boosts,
      [boostId]: {
        ...currentBoost,
        active: true,
        purchased: currentBoost.purchased + quantity
      }
    };
  }

  const remainingTime = currentBoost.active && currentBoost.remainingTime ? currentBoost.remainingTime : 0;
  
  if (boostId === 'boost-tap-boost') {
    const remainingUses = currentBoost.active && currentBoost.remainingUses ? currentBoost.remainingUses : 0;
    const newUses = remainingUses + (effect.duration! * quantity);
    
    return {
      ...boosts,
      [boostId]: {
        ...currentBoost,
        active: true,
        remainingUses: newUses,
        purchased: currentBoost.purchased + quantity,
        activatedAt: currentBoost.active && currentBoost.activatedAt ? currentBoost.activatedAt : now
      }
    };
  } else {
    const newDuration = remainingTime + (effect.duration! * quantity);
    
    return {
      ...boosts,
      [boostId]: {
        ...currentBoost,
        active: true,
        remainingTime: newDuration,
        purchased: currentBoost.purchased + quantity,
        activatedAt: currentBoost.active && currentBoost.activatedAt ? currentBoost.activatedAt : now
      }
    };
  }
};

const calculateIncomeMultiplier = (state: GameState) => {
  let multiplier = state.incomeMultiplier;
  if (state.boosts["boost-double-coins"]?.active) {
    const doubleCoins = INVENTORY_ITEMS.DOUBLE_COINS;
    if (isBoostItem(doubleCoins)) {
      multiplier *= doubleCoins.effect.value;
    }
  }
  return multiplier;
};

const calculateBaseCoinsPerClick = (state: GameState) => {
  let base = state.coinsPerClick;
  if (state.boosts["boost-perma-tap"]?.purchased) {
    const permaTap = INVENTORY_ITEMS.PERMA_TAP;
    if (isBoostItem(permaTap)) {
      base += state.boosts["boost-perma-tap"].purchased * permaTap.effect.value;
    }
  }
  return base;
};

const calculateBaseCoinsPerSecond = (state: GameState) => {
  let base = state.coinsPerSecond;
  if (state.boosts["boost-perma-passive"]?.purchased) {
    const permaPassive = INVENTORY_ITEMS.PERMA_PASSIVE;
    if (isBoostItem(permaPassive)) {
      base += state.boosts["boost-perma-passive"].purchased * permaPassive.effect.value;
    }
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
  useItem: (itemId: string, quantity: number) => void;
  addItem: (item: InventoryItem) => void;
  removeItem: (itemId: string, quantity?: number) => void;
  addGems: (amount: number) => void;
  activateBoost: (boostId: string, quantity: number) => void;
  updateUsername: (username: string) => void;
  updateTitle: (title: string) => void;
  updatePortrait: (portrait: string) => void;
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
          const restoredAbilities = initialState.abilities.map(ability => ({
            ...ability,
            unlocked: savedState.abilities?.find(a => a.id === ability.id)?.unlocked || ability.unlocked
          }));
          const restoredUpgrades = initialState.upgrades.map(upgrade => ({
            ...upgrade,
            ...savedState.upgrades?.find(u => u.id === upgrade.id),
            icon: upgrade.icon,
            description: upgrade.description
          }));
          const restoredState: GameState = {
            ...initialState,
            ...savedState,
            abilities: restoredAbilities,
            upgrades: restoredUpgrades,
            achievements: initialState.achievements.map(achievement => ({
              ...achievement,
              unlocked: savedState.achievements?.find(a => a.id === achievement.id)?.unlocked || false
            })),
            managers: initialState.managers,
            artifacts: initialState.artifacts,
            boosts: savedState.boosts || {},
            hasNoAds: savedState.hasNoAds || false,
            username: savedState.username || initialState.username,
            title: savedState.title || initialState.title,
            userId: savedState.userId || initialState.userId,
            portrait: savedState.portrait || initialState.portrait,
            nameChangeCount: savedState.nameChangeCount || 0
          };
          
          for (const key in restoredState) {
            if (key !== 'abilities' && key !== 'upgrades' && key !== 'achievements') {
              dispatch({ type: 'RESTORE_STATE_PROPERTY', property: key as keyof GameState, value: restoredState[key as keyof GameState] });
            }
          }
          dispatch({ type: 'RESTORE_UPGRADES', upgrades: restoredState.upgrades });
          dispatch({ type: 'RESTORE_ABILITIES', abilities: restoredState.abilities });
          dispatch({ type: 'RESTORE_ACHIEVEMENTS', achievements: restoredState.achievements });
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
    const saveInterval = setInterval(() => StorageService.saveGameState(state), 30000);
    return () => {
      clearInterval(saveInterval);
      StorageService.saveGameState(state);
    };
  }, [state]);
  
  useEffect(() => {
    const tickInterval = setInterval(() => dispatch({ type: 'TICK' }), 100);
    return () => clearInterval(tickInterval);
  }, []);
  
  useEffect(() => {
    const achievementInterval = setInterval(() => dispatch({ type: 'CHECK_ACHIEVEMENTS' }), 5000);
    return () => clearInterval(achievementInterval);
  }, []);
  
  const calculateMaxPurchaseAmount = (upgradeId: string): number => {
    const upgrade = state.upgrades.find(u => u.id === upgradeId);
    if (!upgrade || upgrade.level >= upgrade.maxLevel) return 0;
    
    const costReduction = GameMechanics.calculateCostReduction(state);
    const cheapUpgrades = INVENTORY_ITEMS.CHEAP_UPGRADES;
    const cheapUpgradesMultiplier = state.boosts["boost-cheap-upgrades"]?.active && isBoostItem(cheapUpgrades) ? 
      cheapUpgrades.effect.value : 1;
    const totalCostReduction = costReduction * cheapUpgradesMultiplier;
    
    return GameMechanics.calculateMaxAffordableQuantity(state.coins, upgrade.baseCost * totalCostReduction, upgrade.level, UPGRADE_COST_GROWTH);
  };
  
  const calculatePotentialEssenceReward = (): number => {
    const essenceBoost = INVENTORY_ITEMS.ESSENCE_BOOST;
    const essenceMultiplier = state.boosts["boost-essence-boost"]?.purchased && isBoostItem(essenceBoost) ? 
      Math.pow(essenceBoost.effect.value, state.boosts["boost-essence-boost"].purchased) : 1;
    return GameMechanics.calculateEssenceReward(state.totalEarned, state) * essenceMultiplier;
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
  const useItem = (itemId: string, quantity: number) => dispatch({ type: 'USE_ITEM', itemId, quantity });
  const addItem = (item: InventoryItem) => dispatch({ type: 'ADD_ITEM', item });
  const removeItem = (itemId: string, quantity?: number) => dispatch({ type: 'REMOVE_ITEM', itemId, quantity });
  const addGems = (amount: number) => dispatch({ type: 'ADD_GEMS', amount });
  const activateBoost = (boostId: string, quantity: number) => dispatch({ type: 'ACTIVATE_BOOST', boostId, quantity });
  const updateUsername = (username: string) => dispatch({ type: 'UPDATE_USERNAME', username });
  const updateTitle = (title: string) => dispatch({ type: 'UPDATE_TITLE', title });
  const updatePortrait = (portrait: string) => dispatch({ type: 'UPDATE_PORTRAIT', portrait });

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
    activateBoost,
    updateUsername,
    updateTitle,
    updatePortrait
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
