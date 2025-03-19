import React, { createContext, useContext, useReducer, useEffect, ReactNode } from 'react';
import { upgradesList, UPGRADE_CATEGORIES } from '@/utils/upgradesData';
import { managers } from '@/utils/managersData';
import { artifacts } from '@/utils/artifactsData';
import { formatNumber, calculateEssenceReward, calculateUpgradeCost, calculateBulkPurchaseCost, calculateMaxAffordableQuantity, calculateProductionMultiplier } from '@/utils/gameLogic';
import { adMobService } from '@/services/AdMobService';
import * as GameMechanics from '@/utils/GameMechanics';
import { createAchievements } from '@/utils/achievementsCreator';
import { StorageService } from '@/services/StorageService';
import { InventoryItem, INVENTORY_ITEMS, createInventoryItem } from '@/components/menu/types';

// Import icons
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
  // Add other abilities as needed
];

const UPGRADE_COST_GROWTH = 1.15;

const initialState: GameState = {
  coins: 0,
  coinsPerClick: 1,
  coinsPerSecond: 0,
  upgrades: updatedUpgradesList,
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
        totalClickAmount *= INVENTORY_ITEMS.TAP_BOOST.effect!.value;
        const newBoosts = { ...state.boosts };
        newBoosts["boost-tap-boost"].remainingUses = (newBoosts["boost-tap-boost"].remainingUses || 0) - 1;
        if (newBoosts["boost-tap-boost"].remainingUses <= 0) {
          newBoosts["boost-tap-boost"].active = false;
        }
        return {
          ...state,
          coins: Math.max(0, state.coins + totalClickAmount),
          totalClicks: state.totalClicks + 1,
          totalEarned: state.totalEarned + totalClickAmount,
          boosts: newBoosts
        };
      }
      const incomeMultiplier = calculateIncomeMultiplier(state);
      totalClickAmount *= incomeMultiplier / state.incomeMultiplier;
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
      
      const maxPossibleQuantity = Math.min(quantity, upgrade.maxLevel - upgrade.level);
      const totalCost = Math.floor(calculateBulkPurchaseCost(
        upgrade.baseCost, upgrade.level, maxPossibleQuantity, UPGRADE_COST_GROWTH
      ) * costReduction);
      
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
        cost: Math.floor(calculateUpgradeCost(upgrade.baseCost, newLevel) * costReduction)
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
      Object.keys(newBoosts).forEach(boostId => {
        if (newBoosts[boostId].remainingTime && newBoosts[boostId].activatedAt) {
          const now = Date.now() / 1000;
          const elapsed = now - newBoosts[boostId].activatedAt!;
          newBoosts[boostId].remainingTime = (INVENTORY_ITEMS[boostId as keyof typeof INVENTORY_ITEMS].effect!.duration || 0) - elapsed;
          if (newBoosts[boostId].remainingTime <= 0) {
            newBoosts[boostId].active = false;
            delete newBoosts[boostId].remainingTime;
            delete newBoosts[boostId].activatedAt;
          }
        }
      });

      let newState = { ...state, boosts: newBoosts };
      const incomeMultiplier = calculateIncomeMultiplier(newState);

      if (newState.coinsPerSecond > 0) {
        const passiveAmount = GameMechanics.calculatePassiveIncome(newState, 100) * 
          (incomeMultiplier / newState.incomeMultiplier);
        newState = {
          ...newState,
          coins: Math.max(0, newState.coins + passiveAmount),
          totalEarned: newState.totalEarned + passiveAmount
        };
      }

      if (newState.boosts["boost-auto-tap"]?.active) {
        const tapValue = GameMechanics.calculateTapValue(newState) * 
          (incomeMultiplier / newState.incomeMultiplier);
        const tapRate = INVENTORY_ITEMS.AUTO_TAP.effect!.value * 0.1; // 5 taps/sec over 0.1s tick
        const autoTapAmount = tapValue * tapRate;
        newState = {
          ...newState,
          coins: Math.max(0, newState.coins + autoTapAmount),
          totalEarned: newState.totalEarned + autoTapAmount,
          totalClicks: newState.totalClicks + Math.floor(tapRate)
        };
      }

      if (newState.autoTap) {
        const autoTapBase = GameMechanics.calculateAutoTapIncome(newState, 100) * 
          (incomeMultiplier / newState.incomeMultiplier);
        newState = {
          ...newState,
          coins: Math.max(0, newState.coins + autoTapBase),
          totalEarned: newState.totalEarned + autoTapBase,
          totalClicks: newState.totalClicks + 1
        };
      }

      if (newState.autoBuy) {
        const costReduction = GameMechanics.calculateCostReduction(newState);
        const affordableUpgrades = newState.upgrades
          .filter(u => u.unlocked && u.level < u.maxLevel && newState.coins >= (u.cost * costReduction))
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
      const essenceMultiplier = state.boosts["boost-essence-boost"]?.purchased ? 
        INVENTORY_ITEMS.ESSENCE_BOOST.effect!.value * state.boosts["boost-essence-boost"].purchased : 1;
      const essenceReward = calculateEssenceReward(state.totalEarned, state.ownedArtifacts) * essenceMultiplier;
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
        nameChangeCount: state.nameChangeCount
      };
    }
    case 'ACTIVATE_BOOST': {
      const item = INVENTORY_ITEMS[action.boostId as keyof typeof INVENTORY_ITEMS];
      if (!item || !item.effect) return state;

      const currentBoost = state.boosts[action.boostId] || { active: false, purchased: 0 };
      const isPermanent = !item.effect.duration;
      const now = Date.now() / 1000;

      if (action.boostId === 'boost-time-warp') {
        const passiveIncome = GameMechanics.calculatePassiveIncome(state, 1000) * item.effect.value * action.quantity;
        return {
          ...state,
          coins: state.coins + passiveIncome,
          totalEarned: state.totalEarned + passiveIncome,
          boosts: {
            ...state.boosts,
            [action.boostId]: {
              ...currentBoost,
              purchased: currentBoost.purchased + action.quantity
            }
          }
        };
      }

      if (isPermanent) {
        return {
          ...state,
          boosts: {
            ...state.boosts,
            [action.boostId]: {
              ...currentBoost,
              active: true,
              purchased: currentBoost.purchased + action.quantity
            }
          }
        };
      }

      const remainingTime = currentBoost.active && currentBoost.remainingTime ? currentBoost.remainingTime : 0;
      const newDuration = remainingTime + (item.effect.duration! * action.quantity);
      return {
        ...state,
        boosts: {
          ...state.boosts,
          [action.boostId]: {
            ...currentBoost,
            active: true,
            remainingTime: newDuration,
            remainingUses: action.boostId === 'boost-tap-boost' ? (currentBoost.remainingUses || 0) + (item.effect.duration! * action.quantity) : undefined,
            purchased: currentBoost.purchased + action.quantity,
            activatedAt: currentBoost.active && currentBoost.activatedAt ? currentBoost.activatedAt : now
          }
        }
      };
    }
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

      return {
        ...state,
        inventory: updatedInventory,
        boosts: activateBoostLogic(state.boosts, action.itemId, quantity)
      };
    }
    case 'BUY_MANAGER': {
      if (state.ownedManagers.includes(action.managerId)) return state;
      const manager = state.managers.find(m => m.id === action.managerId);
      if (!manager || state.coins < manager.cost) return state;
      return {
        ...state,
        coins: state.coins - manager.cost,
        ownedManagers: [...state.ownedManagers, action.managerId]
      };
    }
    case 'BUY_ARTIFACT': {
      if (state.ownedArtifacts.includes(action.artifactId)) return state;
      const artifact = state.artifacts.find(a => a.id === action.artifactId);
      if (!artifact || state.essence < artifact.cost) return state;
      return {
        ...state,
        essence: state.essence - artifact.cost,
        ownedArtifacts: [...state.ownedArtifacts, action.artifactId]
      };
    }
    case 'UNLOCK_ACHIEVEMENT': {
      const achievement = state.achievements.find(a => a.id === action.achievementId);
      if (!achievement || achievement.unlocked) return state;
      return {
        ...state,
        achievements: state.achievements.map(a =>
          a.id === action.achievementId ? { ...a, unlocked: true } : a
        )
      };
    }
    case 'CHECK_ACHIEVEMENTS': {
      const newAchievements = state.achievements.map(a => {
        if (!a.unlocked && a.checkCondition(state)) {
          return { ...a, unlocked: true };
        }
        return a;
      });
      return { ...state, achievements: newAchievements };
    }
    case 'UNLOCK_ABILITY': {
      const ability = state.abilities.find(a => a.id === action.abilityId);
      if (!ability || ability.unlocked || state.skillPoints < ability.cost) return state;
      return {
        ...state,
        skillPoints: state.skillPoints - ability.cost,
        abilities: state.abilities.map(a =>
          a.id === action.abilityId ? { ...a, unlocked: true } : a
        )
      };
    }
    case 'ADD_SKILL_POINTS':
      return { ...state, skillPoints: state.skillPoints + action.amount };
    case 'UNLOCK_PERK':
      return {
        ...state,
        unlockedPerks: [...state.unlockedPerks, action.perkId]
      };
    case 'ADD_ITEM':
      return {
        ...state,
        inventory: [...state.inventory, action.item].slice(0, state.inventoryCapacity)
      };
    case 'REMOVE_ITEM': {
      const itemIndex = state.inventory.findIndex(i => i.id === action.itemId);
      if (itemIndex === -1) return state;
      const quantity = action.quantity || 1;
      const updatedInventory = [...state.inventory];
      if (updatedInventory[itemIndex].quantity <= quantity) {
        updatedInventory.splice(itemIndex, 1);
      } else {
        updatedInventory[itemIndex].quantity -= quantity;
      }
      return { ...state, inventory: updatedInventory };
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

const activateBoostLogic = (boosts: GameState['boosts'], boostId: string, quantity: number) => {
  const item = INVENTORY_ITEMS[boostId as keyof typeof INVENTORY_ITEMS];
  if (!item || !item.effect) return boosts;

  const currentBoost = boosts[boostId] || { active: false, purchased: 0 };
  const isPermanent = !item.effect.duration;
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
  const newDuration = remainingTime + (item.effect.duration! * quantity);
  return {
    ...boosts,
    [boostId]: {
      ...currentBoost,
      active: true,
      remainingTime: newDuration,
      remainingUses: boostId === 'boost-tap-boost' ? (currentBoost.remainingUses || 0) + (item.effect.duration! * quantity) : undefined,
      purchased: currentBoost.purchased + quantity,
      activatedAt: currentBoost.active && currentBoost.activatedAt ? currentBoost.activatedAt : now
    }
  };
};

const calculateIncomeMultiplier = (state: GameState) => {
  let multiplier = state.incomeMultiplier;
  const bonuses = [];
  if (state.boosts["boost-double-coins"]?.active) {
    bonuses.push(INVENTORY_ITEMS.DOUBLE_COINS.effect!.value - 1); // 2x becomes +1
  }
  return calculateProductionMultiplier(multiplier, bonuses);
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

  const calculateMaxPurchaseAmount = (upgradeId: string): number => {
    const upgrade = state.upgrades.find(u => u.id === upgradeId);
    if (!upgrade || upgrade.level >= upgrade.maxLevel) return 0;
    const costReduction = GameMechanics.calculateCostReduction(state);
    return calculateMaxAffordableQuantity(state.coins, upgrade.baseCost * costReduction, upgrade.level, UPGRADE_COST_GROWTH);
  };
  
  const calculatePotentialEssenceReward = (): number => {
    const essenceMultiplier = state.boosts["boost-essence-boost"]?.purchased ? 
      INVENTORY_ITEMS.ESSENCE_BOOST.effect!.value * state.boosts["boost-essence-boost"].purchased : 1;
    return calculateEssenceReward(state.totalEarned, state.ownedArtifacts) * essenceMultiplier;
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
