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
  coinsPerSecondBonus: upgrade.coinsPerSecondBonus * 0.5,
}));

const initialAbilities: Ability[] = [
  {
    id: 'efficient-drilling',
    name: 'Efficient Drilling',
    description: 'Increases coins per click by 10%',
    cost: 1,
    icon: <img src={AsteroidDrillIcon} alt="Efficient Drilling" className="w-6 h-6" />,
    unlocked: false,
    requiredAbilities: [],
    row: 1,
    column: 1,
  },
  {
    id: 'quantum-vibration',
    name: 'Quantum Vibration',
    description: 'Increases passive income by 15%',
    cost: 2,
    icon: <img src={QuantumVibrationIcon} alt="Quantum Vibration" className="w-6 h-6" />,
    unlocked: false,
    requiredAbilities: ['efficient-drilling'],
    row: 2,
    column: 1,
  },
  {
    id: 'neural-mining',
    name: 'Neural Mining',
    description: 'Reduces upgrade costs by 5%',
    cost: 3,
    icon: <img src={NeuralMiningIcon} alt="Neural Mining" className="w-6 h-6" />,
    unlocked: false,
    requiredAbilities: ['quantum-vibration'],
    row: 3,
    column: 1,
  },
  {
    id: 'graviton-shield',
    name: 'Graviton Shield',
    description: 'Increases all income by 10%',
    cost: 4,
    icon: <img src={GravitonShieldIcon} alt="Graviton Shield" className="w-6 h-6" />,
    unlocked: false,
    requiredAbilities: ['neural-mining'],
    row: 4,
    column: 1,
  },
  {
    id: 'laser-extraction',
    name: 'Laser Extraction',
    description: 'Boosts auto-tap efficiency by 20%',
    cost: 2,
    icon: <img src={LaserExtractionIcon} alt="Laser Extraction" className="w-6 h-6" />,
    unlocked: false,
    requiredAbilities: ['efficient-drilling'],
    row: 2,
    column: 2,
  },
  {
    id: 'dark-matter-core',
    name: 'Dark Matter Core',
    description: 'Increases essence gain by 10%',
    cost: 3,
    icon: <img src={DarkMatterIcon} alt="Dark Matter Core" className="w-6 h-6" />,
    unlocked: false,
    requiredAbilities: ['laser-extraction'],
    row: 3,
    column: 2,
  },
  {
    id: 'galactic-scanner',
    name: 'Galactic Scanner',
    description: 'Unlocks a new upgrade tier',
    cost: 5,
    icon: <img src={GalacticScannerIcon} alt="Galactic Scanner" className="w-6 h-6" />,
    unlocked: false,
    requiredAbilities: ['dark-matter-core'],
    row: 4,
    column: 2,
  },
  {
    id: 'plasma-excavator',
    name: 'Plasma Excavator',
    description: 'Increases coins per click by 15%',
    cost: 2,
    icon: <img src={PlasmaExcavatorIcon} alt="Plasma Excavator" className="w-6 h-6" />,
    unlocked: false,
    requiredAbilities: ['efficient-drilling'],
    row: 2,
    column: 3,
  },
  {
    id: 'nano-bot-swarm',
    name: 'Nano-Bot Swarm',
    description: 'Increases passive income by 20%',
    cost: 3,
    icon: <img src={NanoBotSwarmIcon} alt="Nano-Bot Swarm" className="w-6 h-6" />,
    unlocked: false,
    requiredAbilities: ['plasma-excavator'],
    row: 3,
    column: 3,
  },
  {
    id: 'interstellar-nav',
    name: 'Interstellar Navigation',
    description: 'Reduces upgrade costs by 10%',
    cost: 4,
    icon: <img src={InterstellarNavIcon} alt="Interstellar Navigation" className="w-6 h-6" />,
    unlocked: false,
    requiredAbilities: ['nano-bot-swarm'],
    row: 4,
    column: 3,
  },
  {
    id: 'supernova-core',
    name: 'Supernova Core',
    description: 'Increases all income by 15%',
    cost: 5,
    icon: <img src={SupernovaCoreIcon} alt="Supernova Core" className="w-6 h-6" />,
    unlocked: false,
    requiredAbilities: ['interstellar-nav'],
    row: 5,
    column: 3,
  },
  {
    id: 'quantum-tunnel',
    name: 'Quantum Tunnel',
    description: 'Boosts prestige rewards by 20%',
    cost: 6,
    icon: <img src={QuantumTunnelIcon} alt="Quantum Tunnel" className="w-6 h-6" />,
    unlocked: false,
    requiredAbilities: ['supernova-core'],
    row: 6,
    column: 3,
  },
  {
    id: 'cosmic-singularity',
    name: 'Cosmic Singularity',
    description: 'Unlocks a secret game mechanic',
    cost: 10,
    icon: <img src={CosmicSingularityIcon} alt="Cosmic Singularity" className="w-6 h-6" />,
    unlocked: false,
    requiredAbilities: ['quantum-tunnel'],
    row: 7,
    column: 3,
  },
];

const UPGRADE_COST_GROWTH = 1.15;

const initialState: GameState = {
  coins: 0,
  coinsPerClick: 1,
  coinsPerSecond: 0,
  upgrades: upgradesList.map(upgrade => ({ ...upgrade })),
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
  hasNoAds: false,
  username: "Cosmic Explorer",
  title: "space_pilot",
  userId: Math.floor(10000000 + Math.random() * 90000000).toString(),
  portrait: "default",
  nameChangeCount: 0,
  activeBoosts: [],
};

const gameReducer = (state: GameState, action: GameAction): GameState => {
  switch (action.type) {
    case 'CLICK': {
      let totalClickAmount = GameMechanics.calculateTapValue(state);
      const tapBoost = state.activeBoosts.find(b => b.id === 'boost-tap-boost' && (b.remainingTime || 0) > 0);
      if (tapBoost) {
        totalClickAmount *= INVENTORY_ITEMS.TAP_BOOST.effect!.value;
        tapBoost.remainingTime = (tapBoost.remainingTime || 0) - 1;
      }
      return {
        ...state,
        coins: Math.max(0, state.coins + totalClickAmount),
        totalClicks: state.totalClicks + 1,
        totalEarned: state.totalEarned + totalClickAmount,
        activeBoosts: tapBoost
          ? state.activeBoosts.map(b => (b.id === 'boost-tap-boost' ? { ...b, remainingTime: b.remainingTime } : b))
          : state.activeBoosts,
      };
    }
    case 'ADD_COINS':
      return { ...state, coins: Math.max(0, state.coins + action.amount), totalEarned: state.totalEarned + action.amount };
    case 'ADD_GEMS':
      return { ...state, gems: state.gems + action.amount };
    case 'ADD_ESSENCE':
      return { ...state, essence: state.essence + action.amount };
    case 'BUY_UPGRADE': {
      const upgradeIndex = state.upgrades.findIndex(u => u.id === action.upgradeId);
      if (upgradeIndex === -1) return state;

      const upgrade = state.upgrades[upgradeIndex];
      const costReduction = GameMechanics.calculateCostReduction(state);
      const quantity = action.quantity || 1;
      if (upgrade.level >= upgrade.maxLevel) return state;

      const maxPossibleQuantity = Math.min(quantity, upgrade.maxLevel - upgrade.level);
      let totalCost = Math.floor(GameMechanics.calculateBulkPurchaseCost(
        upgrade.baseCost,
        upgrade.level,
        maxPossibleQuantity,
        UPGRADE_COST_GROWTH
      ) * costReduction);
      const cheapUpgradesBoost = state.activeBoosts.find(b => b.id === 'boost-cheap-upgrades' && (b.remainingTime || 0) > 0);
      if (cheapUpgradesBoost) {
        totalCost *= INVENTORY_ITEMS.CHEAP_UPGRADES.effect!.value;
      }

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
        cost: Math.floor(upgrade.baseCost * Math.pow(UPGRADE_COST_GROWTH, newLevel) * costReduction),
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
        upgrades: newUpgrades,
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
      let newState = { ...state };

      if (state.coinsPerSecond > 0) {
        const passiveAmount = GameMechanics.calculatePassiveIncome(state) * calculateBaseCoinsPerSecond(state) / state.coinsPerSecond;
        newState = {
          ...newState,
          coins: Math.max(0, newState.coins + passiveAmount),
          totalEarned: newState.totalEarned + passiveAmount,
        };
      }

      if (newState.autoTap) {
        const autoTapBase = GameMechanics.calculateAutoTapIncome(state);
        const autoTapBoost = state.activeBoosts.find(b => b.id === 'boost-auto-tap' && (b.remainingTime || 0) > 0)
          ? calculateBaseCoinsPerClick(state) * INVENTORY_ITEMS.AUTO_TAP.effect!.value * 0.1
          : 0;
        const autoTapAmount = autoTapBase + autoTapBoost;
        newState = {
          ...newState,
          coins: Math.max(0, newState.coins + autoTapAmount),
          totalEarned: newState.totalEarned + autoTapAmount,
          totalClicks: newState.totalClicks + 1,
        };
      }

      if (newState.autoBuy) {
        const costReduction = GameMechanics.calculateCostReduction(state);
        const affordableUpgrades = newState.upgrades
          .filter(u => u.unlocked && u.level < u.maxLevel && newState.coins >= (u.cost * costReduction))
          .map(u => ({ upgrade: u, roi: u.coinsPerSecondBonus > 0 ? (u.cost / u.coinsPerSecondBonus) : Infinity }))
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
            cost: Math.floor(bestUpgrade.baseCost * Math.pow(UPGRADE_COST_GROWTH, newLevel) * costReduction),
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
            upgrades: newUpgrades,
          };
          if (shouldAwardSkillPoint) {
            newState = { ...newState, skillPoints: newState.skillPoints + 1 };
          }
        }
      }
      return newState;
    }
    case 'PRESTIGE': {
      const essenceReward = GameMechanics.calculateEssenceReward(state.totalEarned, state) * calculatePotentialEssenceMultiplier(state);
      const startingCoins = GameMechanics.calculateStartingCoins(state.ownedArtifacts);

      const persistentBoosts = state.activeBoosts.filter(b => 
        ['boost-perma-tap', 'boost-perma-passive', 'boost-no-ads', 'boost-auto-buy', 'boost-inventory-expansion'].includes(b.id)
      );

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
        hasNoAds: state.hasNoAds || persistentBoosts.some(b => b.id === 'boost-no-ads'),
        inventoryCapacity: initialState.inventoryCapacity + 
          (persistentBoosts.find(b => b.id === 'boost-inventory-expansion')?.quantity || 0) * INVENTORY_ITEMS.INVENTORY_EXPANSION.effect!.value,
        username: state.username,
        title: state.title,
        userId: state.userId,
        portrait: state.portrait,
        nameChangeCount: state.nameChangeCount,
        activeBoosts: persistentBoosts,
      };
    }
    case 'BUY_MANAGER': {
      const manager = state.managers.find(m => m.id === action.managerId);
      if (!manager || state.ownedManagers.includes(action.managerId) || state.essence < manager.cost) return state;

      return {
        ...state,
        essence: state.essence - manager.cost,
        ownedManagers: [...state.ownedManagers, action.managerId],
      };
    }
    case 'BUY_ARTIFACT': {
      const artifact = state.artifacts.find(a => a.id === action.artifactId);
      if (!artifact || state.ownedArtifacts.includes(action.artifactId) || state.essence < artifact.cost) return state;

      return {
        ...state,
        essence: state.essence - artifact.cost,
        ownedArtifacts: [...state.ownedArtifacts, action.artifactId],
      };
    }
    case 'UNLOCK_ACHIEVEMENT': {
      const achievementIndex = state.achievements.findIndex(a => a.id === action.achievementId);
      if (achievementIndex === -1 || state.achievements[achievementIndex].unlocked) return state;

      const updatedAchievements = [...state.achievements];
      updatedAchievements[achievementIndex] = { ...updatedAchievements[achievementIndex], unlocked: true };

      let newState = { ...state, achievements: updatedAchievements };
      const rewards = updatedAchievements[achievementIndex].rewards;

      if (rewards) {
        switch (rewards.type) {
          case 'gems':
            newState = { ...newState, gems: newState.gems + (rewards.value as number) };
            break;
          case 'boost':
            newState = {
              ...newState,
              activeBoosts: [
                ...newState.activeBoosts,
                {
                  id: `boost-${action.achievementId}`,
                  name: `Boost from ${updatedAchievements[achievementIndex].name}`,
                  description: 'Achievement reward boost',
                  quantity: 1,
                  value: rewards.value as number,
                  duration: undefined,
                  activatedAt: undefined,
                  remainingTime: undefined,
                  icon: <img src={rewards.image} alt="Boost Icon" className="w-6 h-6" />,
                },
              ],
            };
            break;
          case 'title':
            newState = { ...newState, title: rewards.value as string };
            break;
          case 'portrait':
            newState = { ...newState, portrait: rewards.value as string };
            break;
          case 'inventory_item':
            const item = createInventoryItem(rewards.value as string);
            newState = { ...newState, inventory: [...newState.inventory, item] };
            break;
        }
      }
      return newState;
    }
    case 'CHECK_ACHIEVEMENTS': {
      let newState = { ...state };
      state.achievements.forEach(achievement => {
        if (!achievement.unlocked && !state.achievementsChecked[achievement.id] && achievement.checkCondition(state)) {
          newState = gameReducer(newState, { type: 'UNLOCK_ACHIEVEMENT', achievementId: achievement.id });
          newState.achievementsChecked[achievement.id] = true;
        }
      });
      return newState;
    }
    case 'UNLOCK_ABILITY': {
      const abilityIndex = state.abilities.findIndex(a => a.id === action.abilityId);
      if (abilityIndex === -1 || state.abilities[abilityIndex].unlocked || state.skillPoints < state.abilities[abilityIndex].cost) return state;

      const ability = state.abilities[abilityIndex];
      const hasRequiredAbilities = ability.requiredAbilities.every(reqId =>
        state.abilities.some(a => a.id === reqId && a.unlocked)
      );
      if (!hasRequiredAbilities) return state;

      const newAbilities = [...state.abilities];
      newAbilities[abilityIndex] = { ...ability, unlocked: true };
      return {
        ...state,
        abilities: newAbilities,
        skillPoints: state.skillPoints - ability.cost,
      };
    }
    case 'ADD_SKILL_POINTS':
      return { ...state, skillPoints: state.skillPoints + action.amount };
    case 'SHOW_SKILL_POINT_NOTIFICATION':
      return state; // Placeholder for UI notification logic
    case 'UNLOCK_PERK': {
      if (state.unlockedPerks.includes(action.perkId)) return state;
      return { ...state, unlockedPerks: [...state.unlockedPerks, action.perkId] };
    }
    case 'HANDLE_CLICK':
      return gameReducer(state, { type: 'CLICK' });
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
      const updatedInventory = [...state.inventory];
      const quantity = action.quantity || 1;

      if (item.quantity <= quantity) {
        updatedInventory.splice(itemIndex, 1);
      } else {
        updatedInventory[itemIndex] = { ...item, quantity: item.quantity - quantity };
      }

      const now = Math.floor(Date.now() / 1000);
      let newActiveBoosts = [...state.activeBoosts];
      const existingBoostIndex = newActiveBoosts.findIndex(boost => boost.id === item.id);

      if (item.effect) {
        if (existingBoostIndex >= 0) {
          const existingBoost = newActiveBoosts[existingBoostIndex];
          const newDuration = existingBoost.duration && item.effect.duration
            ? (existingBoost.remainingTime || 0) + (item.effect.duration * quantity)
            : item.effect.duration;
          const newValue = item.effect.duration
            ? item.effect.value
            : existingBoost.value + (item.effect.value * quantity);

          newActiveBoosts[existingBoostIndex] = {
            ...existingBoost,
            quantity: existingBoost.quantity + quantity,
            value: newValue,
            duration: newDuration,
            activatedAt: now,
            remainingTime: newDuration,
          };
        } else {
          newActiveBoosts.push({
            id: item.id,
            name: item.name,
            description: item.description,
            quantity,
            value: item.effect.value * quantity,
            duration: item.effect.duration,
            activatedAt: now,
            remainingTime: item.effect.duration,
            icon: item.icon,
          });
        }
      }

      return { ...state, inventory: updatedInventory, activeBoosts: newActiveBoosts };
    }
    case 'ADD_ITEM': {
      const existingItemIndex = state.inventory.findIndex(i => i.id === action.item.id);
      let newInventory = [...state.inventory];
      if (existingItemIndex >= 0) {
        newInventory[existingItemIndex] = {
          ...newInventory[existingItemIndex],
          quantity: newInventory[existingItemIndex].quantity + action.item.quantity,
        };
      } else if (state.inventory.length < state.inventoryCapacity) {
        newInventory.push(action.item);
      } else {
        return state; // Inventory full
      }
      return { ...state, inventory: newInventory };
    }
    case 'REMOVE_ITEM': {
      const itemIndex = state.inventory.findIndex(i => i.id === action.itemId);
      if (itemIndex === -1) return state;

      const quantity = action.quantity || 1;
      const updatedInventory = [...state.inventory];
      if (updatedInventory[itemIndex].quantity <= quantity) {
        updatedInventory.splice(itemIndex, 1);
      } else {
        updatedInventory[itemIndex] = {
          ...updatedInventory[itemIndex],
          quantity: updatedInventory[itemIndex].quantity - quantity,
        };
      }
      return { ...state, inventory: updatedInventory };
    }
    case 'SET_MENU_TYPE':
      return state; // Placeholder for menu type logic
    case 'ACTIVATE_BOOST': {
      const boostItem = Object.values(INVENTORY_ITEMS).find(item => item.id === action.boostId);
      if (!boostItem || !boostItem.effect) return state;

      const now = Math.floor(Date.now() / 1000);
      const existingBoostIndex = state.activeBoosts.findIndex(b => b.id === action.boostId);

      let newActiveBoosts = [...state.activeBoosts];
      if (existingBoostIndex >= 0) {
        const existingBoost = newActiveBoosts[existingBoostIndex];
        const newDuration = existingBoost.duration
          ? (existingBoost.remainingTime || 0) + (action.duration || boostItem.effect.duration || 0)
          : undefined;
        const newValue = action.valueOverride || existingBoost.value + (action.value || boostItem.effect.value);

        newActiveBoosts[existingBoostIndex] = {
          ...existingBoost,
          quantity: existingBoost.quantity + 1,
          value: newValue,
          duration: newDuration,
          activatedAt: now,
          remainingTime: newDuration,
        };
      } else {
        newActiveBoosts.push({
          id: boostItem.id,
          name: boostItem.name,
          description: boostItem.description,
          quantity: 1,
          value: action.value || boostItem.effect.value,
          duration: action.duration || boostItem.effect.duration,
          activatedAt: now,
          remainingTime: action.duration || boostItem.effect.duration,
          icon: boostItem.icon,
        });
      }
      return { ...state, activeBoosts: newActiveBoosts };
    }
    case 'UPDATE_BOOST_TIMERS': {
      const now = Math.floor(Date.now() / 1000);
      const updatedBoosts = state.activeBoosts.map(boost => {
        if (boost.duration && boost.activatedAt) {
          const elapsed = now - boost.activatedAt;
          const remaining = boost.duration - elapsed;
          return { ...boost, remainingTime: Math.max(0, remaining) };
        }
        return boost;
      });
      return { ...state, activeBoosts: updatedBoosts.filter(b => !b.duration || (b.remainingTime || 0) > 0) };
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

const calculateIncomeMultiplier = (state: GameState): number => {
  let multiplier = state.incomeMultiplier;
  const doubleCoinsBoost = state.activeBoosts.find(b => b.id === 'boost-double-coins' && (b.remainingTime || 0) > 0);
  if (doubleCoinsBoost) multiplier *= INVENTORY_ITEMS.DOUBLE_COINS.effect!.value;
  return multiplier;
};

const calculateBaseCoinsPerClick = (state: GameState): number => {
  let base = state.coinsPerClick;
  const permaTapBoost = state.activeBoosts.find(b => b.id === 'boost-perma-tap');
  if (permaTapBoost) base += permaTapBoost.quantity * INVENTORY_ITEMS.PERMA_TAP.effect!.value;
  return base;
};

const calculateBaseCoinsPerSecond = (state: GameState): number => {
  let base = state.coinsPerSecond;
  const permaPassiveBoost = state.activeBoosts.find(b => b.id === 'boost-perma-passive');
  if (permaPassiveBoost) base += permaPassiveBoost.quantity * INVENTORY_ITEMS.PERMA_PASSIVE.effect!.value;
  return base;
};

const calculatePotentialEssenceMultiplier = (state: GameState): number => {
  const essenceBoost = state.activeBoosts.find(b => b.id === 'boost-essence-boost');
  return essenceBoost ? Math.pow(INVENTORY_ITEMS.ESSENCE_BOOST.effect!.value, essenceBoost.quantity) : 1;
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

// Error Boundary Component
interface ErrorBoundaryState {
  hasError: boolean;
}

class ErrorBoundary extends React.Component<{ children: ReactNode }, ErrorBoundaryState> {
  state: ErrorBoundaryState = { hasError: false };

  static getDerivedStateFromError(): ErrorBoundaryState {
    return { hasError: true };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('Error caught by ErrorBoundary:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return <div className="text-white p-4">Something went wrong. Please reload the game.</div>;
    }
    return this.props.children;
  }
}

export const GameProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [state, dispatch] = useReducer(gameReducer, initialState);

  useEffect(() => {
    const loadSavedGameState = async () => {
      try {
        const savedState = await StorageService.loadGameState();
        if (savedState) {
          const restoredAbilities = initialState.abilities.map(ability => ({
            ...ability,
            unlocked: savedState.abilities?.find(a => a.id === ability.id)?.unlocked || ability.unlocked,
          }));
          const restoredUpgrades = initialState.upgrades.map(upgrade => ({
            ...upgrade,
            ...savedState.upgrades?.find(u => u.id === upgrade.id),
          }));
          const restoredState: GameState = {
            ...initialState,
            ...savedState,
            abilities: restoredAbilities,
            upgrades: restoredUpgrades,
            achievements: initialState.achievements.map(achievement => ({
              ...achievement,
              unlocked: savedState.achievements?.find(a => a.id === achievement.id)?.unlocked || false,
            })),
            managers: initialState.managers,
            artifacts: initialState.artifacts,
            activeBoosts: savedState.activeBoosts || [],
          };

          for (const key in restoredState) {
            if (!['abilities', 'upgrades', 'achievements'].includes(key)) {
              dispatch({ type: 'RESTORE_STATE_PROPERTY', property: key as keyof GameState, value: restoredState[key as keyof GameState] });
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
    const saveInterval = setInterval(() => StorageService.saveGameState(state), 30000);
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
    return GameMechanics.calculateMaxAffordableQuantity(state.coins, upgrade.baseCost * costReduction, upgrade.level, UPGRADE_COST_GROWTH);
  };

  const calculatePotentialEssenceReward = (): number => {
    return GameMechanics.calculateEssenceReward(state.totalEarned, state) * calculatePotentialEssenceMultiplier(state);
  };

  const contextValue: GameContextType = {
    state,
    dispatch,
    click: () => dispatch({ type: 'CLICK' }),
    addCoins: (amount) => dispatch({ type: 'ADD_COINS', amount }),
    addEssence: (amount) => dispatch({ type: 'ADD_ESSENCE', amount }),
    buyUpgrade: (upgradeId, quantity = 1) => dispatch({ type: 'BUY_UPGRADE', upgradeId, quantity }),
    toggleAutoBuy: () => dispatch({ type: 'TOGGLE_AUTO_BUY' }),
    toggleAutoTap: () => dispatch({ type: 'TOGGLE_AUTO_TAP' }),
    setIncomeMultiplier: (multiplier) => dispatch({ type: 'SET_INCOME_MULTIPLIER', multiplier }),
    prestige: () => dispatch({ type: 'PRESTIGE' }),
    buyManager: (managerId) => dispatch({ type: 'BUY_MANAGER', managerId }),
    buyArtifact: (artifactId) => dispatch({ type: 'BUY_ARTIFACT', artifactId }),
    unlockAbility: (abilityId) => dispatch({ type: 'UNLOCK_ABILITY', abilityId }),
    unlockPerk: (perkId, parentId) => dispatch({ type: 'UNLOCK_PERK', perkId, parentId }),
    checkAchievements: () => dispatch({ type: 'CHECK_ACHIEVEMENTS' }),
    calculateMaxPurchaseAmount,
    calculatePotentialEssenceReward,
    handleClick: () => dispatch({ type: 'HANDLE_CLICK' }),
    useItem: (itemId, quantity = 1) => dispatch({ type: 'USE_ITEM', itemId, quantity }),
    addItem: (item) => dispatch({ type: 'ADD_ITEM', item }),
    removeItem: (itemId, quantity) => dispatch({ type: 'REMOVE_ITEM', itemId, quantity }),
    addGems: (amount) => dispatch({ type: 'ADD_GEMS', amount }),
    activateBoost: (boostId) => dispatch({ type: 'ACTIVATE_BOOST', boostId }),
    updateUsername: (username) => dispatch({ type: 'UPDATE_USERNAME', username }),
    updateTitle: (title) => dispatch({ type: 'UPDATE_TITLE', title }),
    updatePortrait: (portrait) => dispatch({ type: 'UPDATE_PORTRAIT', portrait }),
    updateBoostTimers: () => dispatch({ type: 'UPDATE_BOOST_TIMERS' }),
  };

  gameContextHolder.current = contextValue;

  return (
    <GameContext.Provider value={contextValue}>
      <ErrorBoundary>{children}</ErrorBoundary>
    </GameContext.Provider>
  );
};

export const useGame = () => {
  const context = useContext(GameContext);
  if (!context) throw new Error('useGame must be used within a GameProvider');
  return context;
};
