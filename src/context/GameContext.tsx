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
import { Ability, Perk } from '@/utils/types';

import AsteroidDrillIcon from '@/assets/images/abilities/aa1.png';
import QuantumVibrationIcon from '@/assets/images/abilities/aa2.png';
import NeuralMiningIcon from '@/assets/images/abilities/aa3.png';
import GravitonShieldIcon from '@/assets/images/abilities/aa5.png';
import LaserExtractionIcon from '@/assets/images/abilities/aa4.png';
import DarkMatterIcon from '@/assets/images/abilities/aa6.png';
import GalacticScannerIcon from '@/assets/images/abilities/aa7.png';
import PlasmaExcavatorIcon from '@/assets/images/abilities/aa8.png';
import NanoBotSwarmIcon from '@/assets/images/abilities/aa9.png';
import InterstellarNavIcon from '@/assets/images/abilities/aa10.png';
import SupernovaCoreIcon from '@/assets/images/abilities/aa11.png';
import QuantumTunnelIcon from '@/assets/images/abilities/aa12.png';
import CosmicSingularityIcon from '@/assets/images/abilities/aa13.png';

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

export interface World {
  id: number;
  name: string;
  description: string;
  unlocked: boolean;
  multiplier: number;
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
  currentWorld: number;
  worlds: World[];
}

// World names and descriptions
export const WORLDS: World[] = [
  {
    id: 1,
    name: "Asteroid Belt",
    description: "Your first mining operation in the asteroid belt of the solar system.",
    unlocked: true,
    multiplier: 1.0
  },
  {
    id: 2,
    name: "Lunar Surface",
    description: "The moon's dusty surface holds valuable resources beneath its craters.",
    unlocked: false,
    multiplier: 1.5
  },
  {
    id: 3,
    name: "Mars Mines",
    description: "The red planet's rich iron deposits are perfect for your expanding operation.",
    unlocked: false,
    multiplier: 2.0
  },
  {
    id: 4,
    name: "Europa Ice Fields",
    description: "Jupiter's icy moon contains rare elements frozen in its subsurface ocean.",
    unlocked: false,
    multiplier: 2.5
  },
  {
    id: 5,
    name: "Saturn's Rings",
    description: "The stunning rings contain countless valuable mineral fragments.",
    unlocked: false,
    multiplier: 3.0
  },
  {
    id: 6,
    name: "Titan Methane Lakes",
    description: "Saturn's largest moon has lakes of liquid methane rich with exotic compounds.",
    unlocked: false,
    multiplier: 3.5
  },
  {
    id: 7,
    name: "Uranus Gas Clouds",
    description: "The upper atmosphere of this ice giant contains valuable noble gases.",
    unlocked: false,
    multiplier: 4.0
  },
  {
    id: 8,
    name: "Neptune's Core",
    description: "Deep pressure mining operations extract super-dense materials from the planet's core.",
    unlocked: false,
    multiplier: 4.5
  },
  {
    id: 9,
    name: "Kuiper Belt",
    description: "The distant ring of icy bodies beyond Neptune contains pristine cosmic materials.",
    unlocked: false,
    multiplier: 5.0
  },
  {
    id: 10,
    name: "Oort Cloud",
    description: "The very edge of the solar system, where comets form and hold the rarest elements in existence.",
    unlocked: false,
    multiplier: 5.5
  }
];

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
  | { type: 'UPDATE_NAME_CHANGE_COUNT'; count: number }
  | { type: 'APPLY_TIME_WARP'; amount: number }
  | { type: 'CHECK_WORLD_UNLOCK' }
  | { type: 'CHANGE_WORLD'; worldId: number };

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

const UPGRADE_COST_GROWTH = 1.08;

const initialState: GameState = {
  coins: 10000000000000000,
  coinsPerClick: 1,
  coinsPerSecond: 0,
  upgrades: upgradesList.map(upgrade => ({
    ...upgrade
  })),
  totalClicks: 0,
  totalEarned: 0,
  autoBuy: false,
  autoTap: false,
  essence: 10000000000,
  ownedManagers: ["manager-default"],
  ownedArtifacts: ["artifact-default"],
  achievements: createAchievements(),
  achievementsChecked: {},
  managers: managers,
  artifacts: artifacts,
  prestigeCount: 0,
  incomeMultiplier: 1.0,
  skillPoints: 100000000,
  abilities: initialAbilities,
  unlockedPerks: [],
  inventory: [],
  inventoryCapacity: 25,
  gems: 1000000000000,
  boosts: {},
  hasNoAds: false,
  username: "Default1976",
  title: "space_pilot",
  userId: Math.floor(10000000 + Math.random() * 90000000).toString(),
  portrait: "default",
  nameChangeCount: 0,
  activeBoosts: [],
  currentWorld: 1,
  worlds: WORLDS
};

// Function to check if enough upgrades have been unlocked to progress to next world
const checkWorldUnlock = (state: GameState): boolean => {
  // Only check unlocking the next world if not all worlds are unlocked yet
  const currentWorldIndex = state.currentWorld - 1;
  if (currentWorldIndex >= state.worlds.length - 1) return false;
  
  // Check if the next world is already unlocked
  if (state.worlds[currentWorldIndex + 1].unlocked) return false;
  
  // Calculate how many element upgrades are unlocked in the current world
  const totalUpgrades = state.upgrades.filter(u => u.category === UPGRADE_CATEGORIES.TAP).length;
  const unlockedUpgrades = state.upgrades.filter(u => 
    u.category === UPGRADE_CATEGORIES.TAP && u.level > 0
  ).length;
  
  // Need to unlock 75% of upgrades to unlock the next world
  const unlockThreshold = Math.ceil(totalUpgrades * 0.75);
  return unlockedUpgrades >= unlockThreshold;
};

// Function to reset upgrades when changing worlds
const resetUpgradesForNewWorld = (state: GameState): GameState => {
  const resetUpgrades = state.upgrades.map(upgrade => ({
    ...upgrade,
    level: 0,
    cost: upgrade.baseCost
  }));
  
  return {
    ...state,
    upgrades: resetUpgrades,
    coinsPerClick: 1,
    coinsPerSecond: 0
  };
};

const gameReducer = (state: GameState, action: GameAction): GameState => {
  switch (action.type) {
    case 'CLICK': {
      let totalClickAmount = GameMechanics.calculateTapValue(state);
      
      // Apply world multiplier to click amount
      const worldMultiplier = state.worlds[state.currentWorld - 1].multiplier;
      totalClickAmount *= worldMultiplier;
      
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
        // Apply world multiplier to passive income
        const worldMultiplier = state.worlds[state.currentWorld - 1].multiplier;
        const passiveAmount = GameMechanics.calculatePassiveIncome(state) * calculateBaseCoinsPerSecond(state) / state.coinsPerSecond * worldMultiplier;
        
        newState = {
          ...newState,
          coins: Math.max(0, newState.coins + passiveAmount),
          totalEarned: newState.totalEarned + passiveAmount
        };
      }

      // Check if the next world should be unlocked
      if (newState.upgrades.some(upgrade => upgrade.level > 0)) {
        const shouldUnlockNextWorld = checkWorldUnlock(newState);
        if (shouldUnlockNextWorld) {
          const currentWorldIndex = newState.currentWorld;
          if (currentWorldIndex < newState.worlds.length) {
            const newWorlds = [...newState.worlds];
            newWorlds[currentWorldIndex] = {
              ...newWorlds[currentWorldIndex],
              unlocked: true
            };
            newState = {
              ...newState,
              worlds: newWorlds
            };
          }
        }
      }

      // Continue with the rest of the TICK logic
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
        activeBoosts: [],
        currentWorld: 1,
        worlds: WORLDS
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
    case
