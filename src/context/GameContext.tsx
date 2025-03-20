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
import { InventoryItem, INVENTORY_ITEMS, createInventoryItem, BoostEffect } from '@/components/menu/types';
import AsteroidDrillIcon from '@/assets/images/icons/asteroid-drill.png';
import QuantumVibrationIcon from '@/assets/images/icons/quantum-vibration.png';
import NeuralMiningIcon from '@/assets/images/icons/neural-mining.png';
import GravitonShieldIcon from '@/assets/images/icons/graviton-shield.png';
import LaserExtractionIcon from '@/assets/images/icons/laser-extraction.png';
import DarkMatterIcon from '@/assets/images/icons/dark-matter.png';
import GalacticScannerIcon from '@/assets/images/icons/galactic-scanner.png';
import PlasmaExcavatorIcon from '@/assets/images/icons/plasma-excavator.png';
import NanoBotSwarmIcon from '@/assets/images/icons/nano-bot-swarm.png';
import InterstellarNavIcon from '@/assets/images/icons/interstellar-nav.png';
import SupernovaCoreIcon from '@/assets/images/icons/supernova-core.png';
import QuantumTunnelIcon from '@/assets/images/icons/quantum-tunnel.png';
import CosmicSingularityIcon from '@/assets/images/icons/cosmic-singularity.png';

export interface Achievement {
  id: string;
  name: string;
  description: string;
  unlocked: boolean;
  checkCondition: (state: GameState) => boolean;
  rewards?: {
    type: 'gems' | 'boost' | 'title' | 'portrait' | 'inventory_item';
    value: number | string; // Number for gems, string for boost/title/portrait ID
    image: string; // Path to reward image
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
  }>;
  hasNoAds: boolean;
  username: string;
  title: string;
  userId: string;
  portrait: string;
  nameChangeCount: number;
  activeBoosts: BoostEffect[];
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
  | { type: 'USE_ITEM'; itemId: string; quantity?: number }
  | { type: 'ADD_ITEM'; item: InventoryItem }
  | { type: 'REMOVE_ITEM'; itemId: string; quantity?: number }
  | { type: 'SET_MENU_TYPE'; menuType: string }
  | { type: 'ADD_GEMS'; amount: number }
  | { type: 'ACTIVATE_BOOST'; boostId: string; duration?: number; value?: number; valueOverride?: number }
  | { type: 'UPDATE_BOOST_TIMERS' }
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
    icon: <img src={AsteroidDrillIcon} alt="Asteroid Drill" className="w-[60px] h-[60px]" />,
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
    icon: <img src={QuantumVibrationIcon} alt="Quantum Vibration Enhancer" className="w-[60px] h-[60px]" />,
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
    icon: <img src={NeuralMiningIcon} alt="Neural Mining Matrix" className="w-[60px] h-[60px]" />,
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
    icon: <img src={GravitonShieldIcon} alt="Graviton Shield Generator" className="w-[60px] h-[60px]" />,
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
    icon: <img src={LaserExtractionIcon} alt="Laser-Guided Extraction System" className="w-[60px] h-[60px]" />,
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
    icon: <img src={DarkMatterIcon} alt="Dark Matter Attractor" className="w-[60px] h-[60px]" />,
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
    icon: <img src={GalacticScannerIcon} alt="Galactic Achievement Scanner" className="w-[60px] h-[60px]" />,
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
    icon: <img src={PlasmaExcavatorIcon} alt="Plasma Discharge Excavator" className="w-[60px] h-[60px]" />,
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
    icon: <img src={NanoBotSwarmIcon} alt="Nano-Bot Mining Swarm" className="w-[60px] h-[60px]" />,
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
    icon: <img src={InterstellarNavIcon} alt="Interstellar Navigation AI" className="w-[60px] h-[60px]" />,
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
    icon: <img src={SupernovaCoreIcon} alt="Supernova Core Extractor" className="w-[60px] h-[60px]" />,
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
    icon: <img src={QuantumTunnelIcon} alt="Quantum Tunneling Drill" className="w-[60px] h-[60px]" />,
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
    icon: <img src={CosmicSingularityIcon} alt="Cosmic Singularity Engine" className="w-[60px] h-[60px]" />,
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
  nameChangeCount: 0,
  activeBoosts: []
};

const gameReducer = (state: GameState, action: GameAction): GameState => {
  switch (action.type) {
    case 'CLICK': {
      let totalClickAmount = GameMechanics.calculateTapValue(state);
      if (state.boosts["boost-tap-boost"]?.active && state.boosts["boost-tap-boost"].remainingUses) {
        totalClickAmount *= INVENTORY_ITEMS.TAP_BOOST.effect!.value;
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
        totalCost *= INVENTORY_ITEMS.CHEAP_UPGRADES.effect!.value;
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
          newBoosts[boostId].remainingTime -= 0.1;
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
          ? calculateBaseCoinsPerClick(state) * INVENTORY_ITEMS.AUTO_TAP.effect!.value * 0.1
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
        (state.boosts["boost-essence-boost"]?.purchased ? INVENTORY_ITEMS.ESSENCE_BOOST.effect!.value : 1);
      const startingCoins = GameMechanics.calculateStartingCoins(state.ownedArtifacts);
      
      const newBoosts = {};
      ["boost-perma-tap", "boost-perma-passive", "boost-no-ads", "boost-auto-buy", "boost-inventory-expansion"].forEach(boostId => {
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
        inventoryCapacity: initialState.inventoryCapacity + (state.boosts["boost-inventory-expansion"]?.purchased || 0) * INVENTORY_ITEMS.INVENTORY_EXPANSION.effect!.value,
        username: state.username,
        title: state.title,
        userId: state.userId,
        portrait: state.portrait,
        nameChangeCount: state.nameChangeCount,
        activeBoosts: []
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
            newState.inventory = [...newState.inventory, createInventoryItem(INVENTORY_ITEMS[reward.value as keyof typeof INVENTORY_ITEMS], 1)];
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
              newState.inventory = [...newState.inventory, createInventoryItem(INVENTORY_ITEMS[reward.value as keyof typeof INVENTORY_ITEMS], 1)];
              break;
          }
        }
      });

      newState.skillPoints += unlockableAchievements.length;
      return newState;
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

  const updatedInventory = [...state.inventory];
  const quantity = action.quantity || 1;
  
  if (item.quantity <= quantity) {
    updatedInventory.splice(itemIndex, 1);
  } else {
    updatedInventory[itemIndex] = {
      ...item,
      quantity: item.quantity - quantity
    };
  }

  const trackedBoostIds = [
    'boost-double-coins', 'boost-time-warp', 'boost-auto-tap',
    'boost-tap-boost', 'boost-cheap-upgrades', 'boost-essence-boost', 
    'boost-perma-tap', 'boost-perma-passive'
  ];
  
  if (trackedBoostIds.includes(item.id) && item.effect) {
    const existingBoostIndex = state.activeBoosts.findIndex(boost => boost.id === item.id);
    const now = Math.floor(Date.now() / 1000);
    
    let newActiveBoosts = [...state.activeBoosts];
    
    if (existingBoostIndex >= 0) {
      const existingBoost = newActiveBoosts[existingBoostIndex];
      const effectDuration = item.effect.duration || 0; // Safe access since we checked item.effect exists
      
      newActiveBoosts[existingBoostIndex] = {
        ...existingBoost,
        quantity: existingBoost.quantity + quantity,
        activatedAt: now,
        remainingTime: effectDuration > 0 ? 
          (existingBoost.remainingTime || 0) + effectDuration : undefined,
      };
    } else {
      const newBoost: BoostEffect = {
        id: item.id,
        name: item.name,
        description: item.description,
        quantity: quantity,
        value: item.effect.value, // Safe access
        duration: item.effect.duration, // Safe access
        activatedAt: now,
        remainingTime: item.effect.duration, // Safe access
        icon: item.icon
      };
      newActiveBoosts.push(newBoost);
    }
    
    return {
      ...state,
      inventory: updatedInventory,
      activeBoosts: newActiveBoosts
    };
  }
        
  return {
    ...state,
    inventory: updatedInventory
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
    case 'UPDATE_BOOST_TIMERS': {
      const now = Math.floor(Date.now() / 1000);
      
      const updatedBoosts = state.activeBoosts.map(boost => {
        if (boost.duration && boost.activatedAt && boost.remainingTime) {
          const elapsed = now - boost.activatedAt;
          const remaining = boost.duration - elapsed;
          
          return {
            ...boost,
            remainingTime: Math.max(0, remaining)
          };
        }
        return boost;
      });
      
      // Filter out expired boosts
      const filteredBoosts = updatedBoosts.filter(
        boost => !boost.duration || !boost.remainingTime || boost.remainingTime > 0
      );
      
      return {
        ...state,
        activeBoosts: filteredBoosts
      };
    }
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
    base += state.boosts["boost-perma-tap"].purchased * INVENTORY_ITEMS.PERMA_TAP.effect!.value;
  }
  return base;
};

const calculateBaseCoinsPerSecond = (state: GameState) => {
  let base = state.coinsPerSecond;
  if (state.boosts["boost-perma-passive"]?.purchased) {
    base += state.boosts["boost-perma-passive"].purchased * INVENTORY_ITEMS.PERMA_PASSIVE.effect!.value;
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
  useItem: (itemId: string, quantity?: number) => void;
  addItem: (item: InventoryItem) => void;
  removeItem: (itemId: string, quantity?: number) => void;
  addGems: (amount: number) => void;
  activateBoost: (boostId: string) => void;
  updateUsername: (username: string) => void;
  updateTitle: (title: string) => void;
  updatePortrait: (portrait: string) => void;
  updateBoostTimers: () => void;
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
  
  useEffect(() => {
    const boostTimerInterval = setInterval(() => {
      dispatch({ type: 'UPDATE_BOOST_TIMERS' });
    }, 1000);
    
    return () => clearInterval(boostTimerInterval);
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
  const useItem = (itemId: string, quantity = 1) => dispatch({ type: 'USE_ITEM', itemId, quantity });
  const addItem = (item: InventoryItem) => dispatch({ type: 'ADD_ITEM', item });
  const removeItem = (itemId: string, quantity?: number) => dispatch({ type: 'REMOVE_ITEM', itemId, quantity });
  const addGems = (amount: number) => dispatch({ type: 'ADD_GEMS', amount });
  const activateBoost = (boostId: string) => dispatch({ type: 'ACTIVATE_BOOST', boostId });
  const updateUsername = (username: string) => dispatch({ type: 'UPDATE_USERNAME', username });
  const updateTitle = (title: string) => dispatch({ type: 'UPDATE_TITLE', title });
  const updatePortrait = (portrait: string) => dispatch({ type: 'UPDATE_PORTRAIT', portrait });
  const updateBoostTimers = () => dispatch({ type: 'UPDATE_BOOST_TIMERS' });

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
    updatePortrait,
    updateBoostTimers
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

