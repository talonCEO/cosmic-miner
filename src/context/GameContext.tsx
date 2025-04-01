import React, { createContext, useContext, useReducer, useEffect, useState, ReactNode } from 'react';
import { managers } from '@/utils/managersData';
import { artifacts } from '@/utils/artifactsData';
import { calculateEssenceIncomeBoost, formatNumber } from '@/utils/gameLogic';
import { adMobService } from '@/services/AdMobService';
import * as GameMechanics from '@/utils/GameMechanics';
import { createAchievements } from '@/utils/achievementsCreator';
import { StorageService } from '@/services/StorageService';
import { InventoryItem, INVENTORY_ITEMS, createInventoryItem, BoostEffect } from '@/components/menu/types';
import { PushNotifications } from '@capacitor/push-notifications';
import OfflineProgressPopup from '@/components/OfflineProgressPopup';
import { upgradesList } from '@/utils/upgradesData';
import { UPGRADE_CATEGORIES } from '@/utils/upgradesData';
import { InAppPurchaseService } from '@/services/InAppPurchaseService';
import { getLevelFromExp } from '@/data/playerProgressionData';
import LevelUpPopup from '@/components/LevelUpPopup';

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

// Updated world imports (removed world3Sprite and world5Sprite)
import world1Sprite from '@/assets/world1.png';
import world2Sprite from '@/assets/world2.png';
import world4Sprite from '@/assets/world4.png';
import world6Sprite from '@/assets/world6.png';
import world7Sprite from '@/assets/world7.png';
import world8Sprite from '@/assets/world8.png';
import world9Sprite from '@/assets/world9.png';

// Updated WORLDS array with enhanced descriptions
const WORLDS = [
  {
    id: 1,
    name: "Terra Minor",
    sprite: world1Sprite,
    description: "A rugged cradle of stone and dust, where the galaxy’s humble origins whisper through wind-swept quarries.",
    boosts: {},
    difficulty: 1.0
  },
  {
    id: 2,
    name: "Stellar Forge",
    sprite: world2Sprite,
    description: "A molten crucible orbiting a dying star, where rivers of iron and nickel flow like cosmic veins, forged in celestial fires.",
    boosts: {
      coinsPerSecond: 1.15,
      elementBoosts: { "element-7": 10, "element-15": 10 } // Iron (Fe), Nickel (Ni)
    },
    difficulty: 3.0,
    locked: true
  },
  {
    id: 3,
    name: "Verdant Orbit",
    sprite: world4Sprite,
    description: "A vibrant emerald sphere adrift in the void, its dense jungles exhale oxygen and cradle carbon in a symphony of life.",
    boosts: {
      essenceGain: 1.1,
      elementBoosts: { "element-2": 10, "element-3": 10 } // Carbon (C), Oxygen (O)
    },
    difficulty: 9.0,
    locked: true
  },
  {
    id: 4,
    name: "Ethereal Void",
    sprite: world6Sprite,
    description: "A shimmering expanse of boundless energy, where hydrogen ignites in ethereal wisps and uranium pulses with primal power.",
    boosts: {
      coinsPerSecond: 1.3,
      elementBoosts: { "element-1": 10, "element-20": 10 } // Hydrogen (H), Uranium (U)
    },
    difficulty: 27.0,
    locked: true
  },
  {
    id: 5,
    name: "Quantum Drift",
    sprite: world7Sprite,
    description: "A fractured realm of flickering realities, where silicon lattices hum with data and gold glimmers in quantum veins.",
    boosts: {
      critChance: 1.3,
      elementBoosts: { "element-5": 10, "element-32": 10 } // Silicon (Si), Gold (Au)
    },
    difficulty: 81.0,
    locked: true
  },
  {
    id: 6,
    name: "Aqua Nebula",
    sprite: world8Sprite,
    description: "A cerulean jewel veiled in misty clouds, its oceans teem with oxygen and hide uranium in abyssal depths.",
    boosts: {
      essenceGain: 1.2,
      elementBoosts: { "element-3": 10, "element-20": 10 } // Oxygen (O), Uranium (U)
    },
    difficulty: 243.0,
    locked: true
  },
  {
    id: 7,
    name: "Cosmic Apex",
    sprite: world9Sprite,
    description: "A pinnacle of creation’s edge, where platinum shines like stardust and exotic matter warps the fabric of reality.",
    boosts: {
      allIncome: 1.5,
      elementBoosts: { "element-33": 10, "element-50": 10 } // Platinum (Pt), Exotic Matter (XM)
    },
    difficulty: 729.0,
    locked: true
  },
];

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
  icon: string; // Changed from React.ReactNode to string
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
  shownMilestones: number[];
  upgrades: Upgrade[];
  totalClicks: number;
  totalEarned: number;
  tempEssenceBoostStacks: number;  // Tracks temporary essence boost stacks from inventory items
  totalEssence: number;            // Total essence earned across prestiges
  essenceIncomeBoost: number;      // The calculated boost percentage from totalEssence
  autoBuy: boolean;
  autoTap: boolean;
  autoTapActive: boolean;
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
  offlineEarningsCap?: number; // Add this
  boosts: Record<string, {
    active: boolean;
    remainingTime?: number;
    remainingUses?: number;
    purchased: number;
  }>;
  playerData: {
    level: number;
    experience: number;
    maxExp: number;
    name: string;
    title: string;
    portrait: string;
    coins: number;
    gems: number;
    essence: number;
    nameChangeCount: number;
    unlockedTitles: string[];
    unlockedPortraits: string[];
  };
  hasNoAds: boolean;
  username: string;
  title: string;
  userId: string;
  portrait: string;
  nameChangeCount: number;
  activeBoosts: BoostEffect[];
  permaTapBoosts: number;
  permaPassiveBoosts: number;
  tapBoostTapsRemaining?: number;
  tapBoostActive?: boolean; // Added to track tap boost activation
  lastSavedAt?: string; // Add this line after tapBoostActive
  currentWorld: number;
  worlds: Array<{
    id: number;
    name: string;
    sprite: string;
    description: string;
    boosts: Record<string, number>;
    difficulty: number;
    locked: boolean;
    upgradeProgress: number;
    medals: {
      bronze: boolean;
      silver: boolean;
      gold: boolean;
    };
  }>;
  globalMultiplier: number;
}

type GameAction =
  | { type: 'CLICK' }
  | { type: 'ADD_EXPERIENCE'; amount: number }
  | { type: 'SHOW_MILESTONE_POPUP'; level: number; rewards: any }
  | { type: 'ADD_SHOWN_MILESTONE'; level: number }
  | { type: 'UPDATE_PLAYER_NAME'; name: string }
  | { type: 'BUY_ESSENCE_BOOST'; quantity: number }
  | { type: 'ADD_COINS'; amount: number }
  | { type: 'ADD_ESSENCE'; amount: number }
  | { type: 'TRAVEL_TO_WORLD'; worldId: number }
  | { type: 'UPDATE_UPGRADE_PROGRESS' }
  | { type: 'BUY_UPGRADE'; upgradeId: string; quantity?: number }
  | { type: 'TOGGLE_AUTO_BUY' }
  | { type: 'TOGGLE_AUTO_TAP' }
  | { type: 'SET_INCOME_MULTIPLIER'; multiplier: number }
  | { type: 'TICK' }
  | { type: 'PRESTIGE' }
  | { type: 'PURCHASE_GEMS'; productId: string; amount: number }
  | { type: 'BUY_MANAGER'; managerId: string }
  | { type: 'BUY_ARTIFACT'; artifactId: string }
  | { type: 'UNLOCK_ACHIEVEMENT'; achievementId: string }
  | { type: 'CHECK_ACHIEVEMENTS' }
  | { type: 'UNLOCK_ABILITY'; abilityId: string }
  | { type: 'ADD_SKILL_POINTS'; amount: number }
  | { type: 'SHOW_SKILL_POINT_NOTIFICATION'; reason: string }
  | { type: 'UNLOCK_PERK'; perkId: string; parentId: string }
  | { type: 'HANDLE_CLICK' }
  | { type: 'RESTORE_STATE'; state: GameState }
  | { type: 'USE_ITEM'; itemId: string; quantity?: number }
  | { type: 'ADD_ITEM'; item: InventoryItem }
  | { type: 'REMOVE_ITEM'; itemId: string; quantity?: number }
  | { type: 'SET_MENU_TYPE'; menuType: string }
  | { type: 'ADD_GEMS'; amount: number }
  | { type: 'ACTIVATE_BOOST'; boostId: string; quantity?: number; duration?: number; value?: number; valueOverride?: number } // Updated this line
  | { type: 'UPDATE_BOOST_TIMERS' }
  | { type: 'UPDATE_USERNAME'; username: string }
  | { type: 'UNLOCK_TITLE'; titleId: string }
  | { type: 'UNLOCK_PORTRAIT'; portraitId: string }
  | { type: 'UPDATE_TITLE'; title: string }
  | { type: 'UPDATE_PORTRAIT'; portrait: string }
  | { type: 'UPDATE_NAME_CHANGE_COUNT'; count: number }
  | { type: 'APPLY_TIME_WARP'; amount: number }
  | { type: 'RESTORE_STATE_PROPERTY'; property: keyof GameState; value: any } // Add this
  | { type: 'RESTORE_UPGRADES'; upgrades: Upgrade[] } // Add this
  | { type: 'RESTORE_ABILITIES'; abilities: Ability[] } // Add this
  | { type: 'RESTORE_ACHIEVEMENTS'; achievements: Achievement[] }; // Add this

const updatedUpgradesList = upgradesList;

const initialAbilities: Ability[] = [
  {
    id: "ability-1",
    name: "Plasma Blade Slicer",
    description: "A glowing sword fueled by cosmic plasma. Slices through asteroids like butter. Space butter, that is.",
    cost: 0,
    icon: AsteroidDrillIcon, // Use the imported string path
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
    icon: QuantumVibrationIcon,
    unlocked: false,
    requiredAbilities: ["ability-1"],
    row: 2,
    column: 1
  },
  {
    id: "ability-3",
    name: "Neural Mining Matrix",
    description: "Your mining crew channels cosmic teamwork energy. They’re basically space cheerleaders, boosting all income by 40% and reducing upgrade costs by 5%.",
    cost: 3,
    icon: NeuralMiningIcon,
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
    icon: GravitonShieldIcon,
    unlocked: false,
    requiredAbilities: ["ability-1"],
    row: 2,
    column: 3
  },
  {
    id: "ability-5",
    name: "Electro-Magnetic Harvester",
    description: "A magnet that zaps resources right to you. Its basically a cosmic vacuum, increasing critical strike chance from 5% to 10%.",
    cost: 5,
    icon: LaserExtractionIcon,
    unlocked: false,
    requiredAbilities: ["ability-2"],
    row: 3,
    column: 1
  },
  {
    id: "ability-6",
    name: "Vitality Core Surge",
    description: "Infuses your mining gear with cosmic life force. Your taps hit harder, increasing income by 30%. Even asteroids feel the love!",
    cost: 5,
    icon: DarkMatterIcon,
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
    icon: GalacticScannerIcon,
    unlocked: false,
    requiredAbilities: ["ability-4"],
    row: 3,
    column: 3
  },
  {
    id: "ability-8",
    name: "Singularity Discharge Excavator",
    description: "A shield powered by a mini black hole, boosting your cosmic gains. Boosts tap value by 85% and passive income by 55%.",
    cost: 8,
    icon: PlasmaExcavatorIcon,
    unlocked: false,
    requiredAbilities: ["ability-5"],
    row: 4,
    column: 1
  },
  {
    id: "ability-9",
    name: "Aegis Prosperity Matrix",
    description: "A shield that optimizes your mining ops for max profit. Reduces upgrade costs by 30% and increases passive income by 65%.",
    cost: 8,
    icon: NanoBotSwarmIcon,
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
    icon: InterstellarNavIcon,
    unlocked: false,
    requiredAbilities: ["ability-7"],
    row: 4,
    column: 3
  },
  {
    id: "ability-11",
    name: "Magneto-Flux Attractor",
    description: "A cosmic magnet that pulls resources with electrified force. Boosts tap value by 120% and all income by 80%.",
    cost: 12,
    icon: SupernovaCoreIcon,
    unlocked: false,
    requiredAbilities: ["ability-8"],
    row: 5,
    column: 1
  },
  {
    id: "ability-12",
    name: "Thunderstrike Tap Capacitor",
    description: "Charges your taps with cosmic lightning. Doubles passive income and reduces all upgrades cost by 25%—shocking asteroids has never been so profitable!",
    cost: 12,
    icon: QuantumTunnelIcon,
    unlocked: false,
    requiredAbilities: ["ability-9"],
    row: 5,
    column: 2
  },
  {
    id: "ability-13",
    name: "Meteor Impact Drill",
    description: "Slams asteroids with a fiery cosmic force. Increases essence gain by 35% and all income by 100%—its like dropping meteors on your enemies, but profitable!",
    cost: 12,
    icon: CosmicSingularityIcon,
    unlocked: false,
    requiredAbilities: ["ability-10"],
    row: 5,
    column: 3
  }
];

const UPGRADE_COST_GROWTH = 1.05;

const initialState: GameState = {
  coins: 9999999999999,
  coinsPerClick: 1,
  coinsPerSecond: 0,
  shownMilestones: [],
  upgrades: upgradesList.map(upgrade => ({
    ...upgrade
  })),
  totalClicks: 0,
  totalEarned: 0,
  tempEssenceBoostStacks: 0,
  totalEssence: 0,
  essenceIncomeBoost: 0,
  autoBuy: false,
  autoTap: false,
  autoTapActive: false,
  essence: 0,
  offlineEarningsCap: 2 * 60 * 60, // 2 hours default
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
  unlockedPerks: [],
  inventory: [],
  inventoryCapacity: 25,
  gems: 0,
  boosts: {},
  playerData: {
    level: 1,
    experience: 0,
    maxExp: 100,  // Initial value, will be recalculated
    name: "Player834654",
    title: "space_pilot",
    portrait: "default",
    unlockedTitles: ['space_pilot'], // Default title
    unlockedPortraits: ['default'],  // Default portrait
    coins: 0,
    gems: 0,
    essence: 0,
    nameChangeCount: 0
  },
  hasNoAds: false,
  username: "Player834654",
  userId: Math.floor(10000000 + Math.random() * 90000000).toString(),
  nameChangeCount: 0,
  activeBoosts: [],
  permaTapBoosts: 0,
  permaPassiveBoosts: 0,
  tapBoostTapsRemaining: 0,
  tapBoostActive: false,
  lastSavedAt: new Date().toISOString(), // Add this line
  currentWorld: 1,
  worlds: WORLDS.map(world => ({
    ...world,
    upgradeProgress: world.id === 1 ? 0 : 0,
    medals: { bronze: false, silver: false, gold: false },
  })),
  globalMultiplier: 1.0,
};

const gameReducer = (state: GameState, action: GameAction): GameState => {
  switch (action.type) {
    case 'CLICK': {
      const totalClickAmount = GameMechanics.calculateTapValue(state);
      const expGain = GameMechanics.calculateExperienceGain(state, totalClickAmount);
      let newTapBoostTapsRemaining = state.tapBoostTapsRemaining || 0;
      let newTapBoostActive = state.tapBoostActive || false;

      if (newTapBoostTapsRemaining > 0) {
        newTapBoostTapsRemaining -= 1;

        if (newTapBoostTapsRemaining <= 0) {
          newTapBoostActive = false;
          return {
            ...state,
            coins: Math.min(Number.MAX_SAFE_INTEGER, state.coins + totalClickAmount),
            totalClicks: state.totalClicks + 1,
            totalEarned: Math.min(Number.MAX_SAFE_INTEGER, state.totalEarned + totalClickAmount),
            tapBoostTapsRemaining: 0,
            tapBoostActive: false,
            activeBoosts: state.activeBoosts.filter(b => b.id !== 'boost-tap-boost'),
            playerData: {
              ...state.playerData,
              experience: state.playerData.experience + expGain,
              level: getLevelFromExp(state.playerData.experience + expGain).currentLevel.level,
              maxExp: getLevelFromExp(state.playerData.experience + expGain).nextLevel?.expRequired || state.playerData.maxExp,
              coins: Math.min(Number.MAX_SAFE_INTEGER, state.playerData.coins + totalClickAmount),
            },
          };
        }
      }

      return {
        ...state,
        coins: Math.min(Number.MAX_SAFE_INTEGER, state.coins + totalClickAmount),
        totalClicks: state.totalClicks + 1,
        totalEarned: Math.min(Number.MAX_SAFE_INTEGER, state.totalEarned + totalClickAmount),
        tapBoostTapsRemaining: newTapBoostTapsRemaining,
        tapBoostActive: newTapBoostActive,
        playerData: {
          ...state.playerData,
          experience: state.playerData.experience + expGain,
          level: getLevelFromExp(state.playerData.experience + expGain).currentLevel.level,
          maxExp: getLevelFromExp(state.playerData.experience + expGain).nextLevel?.expRequired || state.playerData.maxExp,
          coins: Math.min(Number.MAX_SAFE_INTEGER, state.playerData.coins + totalClickAmount),
        },
      };
    }
    case 'RESTORE_STATE': {
      return { ...state, ...action.state };
    }
    case 'ADD_COINS': {
      const expGain = GameMechanics.calculateExperienceGain(state, action.amount);
      return {
        ...state,
        coins: Math.max(0, state.coins + action.amount),
        totalEarned: Math.min(Number.MAX_SAFE_INTEGER, state.totalEarned + action.amount),
        playerData: {
          ...state.playerData,
          coins: Math.max(0, state.playerData.coins + action.amount),
          experience: state.playerData.experience + expGain,
          level: getLevelFromExp(state.playerData.experience + expGain).currentLevel.level,
          maxExp: getLevelFromExp(state.playerData.experience + expGain).nextLevel?.expRequired || state.playerData.maxExp,
        },
      };
    }
    case 'ADD_GEMS':
      return {
        ...state,
        gems: state.gems + action.amount,
        playerData: {
          ...state.playerData,
          gems: state.playerData.gems + action.amount
        }
      };
      case 'ADD_ESSENCE':
        return {
          ...state,
          essence: state.essence + action.amount,
          totalEssence: state.totalEssence + action.amount,
          essenceIncomeBoost: calculateEssenceIncomeBoost(state.totalEssence + action.amount),
          playerData: {
            ...state.playerData,
            essence: state.playerData.essence + action.amount
          }
        };
        case 'ADD_EXPERIENCE': {
          const newExp = state.playerData.experience + action.amount;
          const levelData = getLevelFromExp(newExp);
          const newLevel = levelData.currentLevel.level;
          return {
            ...state,
            playerData: {
              ...state.playerData,
              experience: newExp,
              level: newLevel,
              maxExp: levelData.nextLevel?.expRequired || state.playerData.maxExp
            }
          };
        }
        case 'ADD_SHOWN_MILESTONE': {
          if (state.shownMilestones.includes(action.level)) return state;
          const rewards = GameMechanics.calculateLevelUpRewards(action.level);
          return {
            ...state,
            shownMilestones: [...state.shownMilestones, action.level],
            gems: state.gems + (rewards?.gems || 0),
            essence: state.essence + (rewards?.essence || 0),
            inventory: rewards?.inventoryItems
              ? [...state.inventory, ...rewards.inventoryItems]
              : state.inventory,
            playerData: {
              ...state.playerData,
              gems: state.playerData.gems + (rewards?.gems || 0),
              essence: state.playerData.essence + (rewards?.essence || 0)
            }
          };
        }
      case 'UPDATE_PLAYER_NAME':
        return {
          ...state,
          playerData: {
            ...state.playerData,
            name: action.name
          }
      };
     case 'BUY_UPGRADE': {
      const upgradeIndex = state.upgrades.findIndex(u => u.id === action.upgradeId);
      if (upgradeIndex === -1) return state;

      const upgrade = state.upgrades[upgradeIndex];
      const quantity = action.quantity || 1;
      if (upgrade.level >= upgrade.maxLevel) return state;

      const maxPossibleQuantity = Math.min(quantity, upgrade.maxLevel - upgrade.level);
      const totalCost = GameMechanics.calculateUpgradeCost(state, upgrade.id, maxPossibleQuantity);

      if (state.coins < totalCost) return state;

      const oldLevel = upgrade.level;
      const newLevel = upgrade.level + maxPossibleQuantity;
      const shouldAwardSkillPoint = GameMechanics.checkUpgradeMilestone(oldLevel, newLevel);

      let newCoinsPerClick = state.coinsPerClick;
      let newCoinsPerSecond = GameMechanics.calculateTotalCoinsPerSecond({
        ...state,
        upgrades: state.upgrades.map((u, i) =>
          i === upgradeIndex ? { ...u, level: newLevel } : u
        )
      });

      if (upgrade.category === UPGRADE_CATEGORIES.TAP) {
        // Handled by GameMechanics.calculateTapValue
      } else {
        newCoinsPerClick += upgrade.coinsPerClickBonus * maxPossibleQuantity;
      }

      const updatedUpgrade = {
        ...upgrade,
        level: newLevel,
        cost: GameMechanics.calculateUpgradeCost(state, upgrade.id, 1) // Update cost for next level
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
    case 'BUY_ESSENCE_BOOST': {
      const costPerStack = 10; // Example cost in gems per stack, adjust as needed
      const totalCost = costPerStack * action.quantity;
      if (state.gems < totalCost) return state;
    
      const newItem = createInventoryItem(INVENTORY_ITEMS.ESSENCE_BOOST, action.quantity);
      return {
        ...state,
        gems: state.gems - totalCost,
        inventory: [...state.inventory, newItem]
      };
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
      case 'ADD_SHOWN_MILESTONE':
        return {
          ...state,
          shownMilestones: [...(state.shownMilestones || []), action.level]
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
        let totalPassiveAmount = 0;
      
        if (state.coinsPerSecond > 0) {
          let baseCPS = GameMechanics.calculateTotalCoinsPerSecond(state);
          const permaPassiveMultiplier = 1 + (state.permaPassiveBoosts || 0) * INVENTORY_ITEMS.PERMA_PASSIVE.effect!.value;
          const passiveAmount = (baseCPS * permaPassiveMultiplier) * 0.1; // Inline the multiplier
          totalPassiveAmount += passiveAmount;
          newState = {
            ...newState,
            coins: Math.max(0, newState.coins + passiveAmount),
            totalEarned: Math.min(Number.MAX_SAFE_INTEGER, newState.totalEarned + passiveAmount),
          };
        }

     if (newState.autoTapActive) {
        const autoTapAmount = GameMechanics.calculateAutoTapIncome(state);
        totalPassiveAmount += autoTapAmount;
        newState = {
          ...newState,
          coins: Math.max(0, newState.coins + autoTapAmount),
          totalEarned: Math.min(Number.MAX_SAFE_INTEGER, newState.totalEarned + autoTapAmount),
          totalClicks: newState.totalClicks + 1,
        };

        const autoTapBoost = newState.activeBoosts.find(b => b.id === 'boost-auto-tap');
        if (autoTapBoost && autoTapBoost.remainingTime && autoTapBoost.remainingTime <= 0) {
          newState.autoTapActive = false;
          newState.activeBoosts = newState.activeBoosts.filter(b => b.id !== 'boost-auto-tap');
        }
      }

      if (newState.autoTap && !newState.autoTapActive) {
        const autoTapBase = GameMechanics.calculateAutoTapIncome(state);
        totalPassiveAmount += autoTapBase;
        newState = {
          ...newState,
          coins: Math.max(0, newState.coins + autoTapBase),
          totalEarned: Math.min(Number.MAX_SAFE_INTEGER, newState.totalEarned + autoTapBase),
          totalClicks: newState.totalClicks + 1,
        };
      }

      if (newState.tapBoostTapsRemaining === 0 && newState.tapBoostActive) {
        newState = {
          ...newState,
          tapBoostActive: false,
          coinsPerClick: GameMechanics.calculateTapValue(newState),
          activeBoosts: newState.activeBoosts.filter(b => b.id !== 'boost-tap-boost'),
        };
      }

      // Add EXP for passive income
      if (totalPassiveAmount > 0) {
        const expGain = GameMechanics.calculateExperienceGain(state, totalPassiveAmount);
        newState = {
          ...newState,
          playerData: {
            ...newState.playerData,
            experience: newState.playerData.experience + expGain,
            level: getLevelFromExp(newState.playerData.experience + expGain).currentLevel.level,
            maxExp: getLevelFromExp(newState.playerData.experience + expGain).nextLevel?.expRequired || newState.playerData.maxExp,
            coins: Math.max(0, newState.playerData.coins + totalPassiveAmount),
          },
        };
      }

      // Auto-buy logic (unchanged, just ensuring newState is used)
      if (newState.autoBuy) {
        const affordableUpgrades = newState.upgrades
          .filter(u => u.unlocked && u.level < u.maxLevel && newState.coins >= GameMechanics.calculateUpgradeCost(newState, u.id, 1))
          .map(u => ({
            upgrade: u,
            roi: u.coinsPerSecondBonus > 0 ? (GameMechanics.calculateUpgradeCost(newState, u.id, 1) / u.coinsPerSecondBonus) : Infinity,
          }))
          .sort((a, b) => a.roi - b.roi);

        if (affordableUpgrades.length > 0) {
          const bestUpgrade = affordableUpgrades[0].upgrade;
          const upgradeIndex = newState.upgrades.findIndex(u => u.id === bestUpgrade.id);
          const oldLevel = bestUpgrade.level;
          const newLevel = bestUpgrade.level + 1;
          const shouldAwardSkillPoint = GameMechanics.checkUpgradeMilestone(oldLevel, newLevel);

          const newCoinsPerClick = newState.coinsPerClick + bestUpgrade.coinsPerClickBonus;
          const newCoinsPerSecond = GameMechanics.calculateTotalCoinsPerSecond({
            ...newState,
            upgrades: newState.upgrades.map((u, i) => (i === upgradeIndex ? { ...u, level: newLevel } : u)),
          });

          const updatedUpgrade = {
            ...bestUpgrade,
            level: newLevel,
            cost: GameMechanics.calculateUpgradeCost(newState, bestUpgrade.id, 1),
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
            coins: newState.coins - GameMechanics.calculateUpgradeCost(newState, bestUpgrade.id, 1),
            coinsPerClick: newCoinsPerClick,
            coinsPerSecond: newCoinsPerSecond,
            upgrades: newUpgrades,
          };

          if (shouldAwardSkillPoint) {
            newState = {
              ...newState,
              skillPoints: newState.skillPoints + 1,
            };
          }
        }
      }

      return newState;
    }

    case 'UPDATE_UPGRADE_PROGRESS': {
      const totalUpgrades = state.upgrades.length;
      const unlockedUpgrades = state.upgrades.filter(u => u.level > 0).length;
      const progress = (unlockedUpgrades / totalUpgrades) * 100;
      const newWorlds = state.worlds.map(w => {
        if (w.id === state.currentWorld) {
          const updatedMedals = {
            bronze: progress >= 50 && !w.medals.bronze,
            silver: progress >= 75 && !w.medals.silver,
            gold: progress === 100 && !w.medals.gold,
          };
          let newInventory = [...state.inventory];
          if (updatedMedals.bronze) {
            newInventory.push(createInventoryItem(INVENTORY_ITEMS.TIME_WARP, 1)); // Example reward
          }
          if (updatedMedals.silver) {
            newInventory.push(createInventoryItem(INVENTORY_ITEMS.ESSENCE_BOOST, 1)); // Example reward
          }
          if (updatedMedals.gold) {
            newInventory.push(createInventoryItem(INVENTORY_ITEMS.PERMA_TAP, 1)); // Example reward
          }
          return {
            ...w,
            upgradeProgress: progress,
            medals: {
              bronze: progress >= 50,
              silver: progress >= 75,
              gold: progress === 100,
            },
          };
        }
        if (w.id === state.currentWorld + 1 && progress >= 75 && w.locked) {
          return { ...w, locked: false };
        }
        return w;
      });
      return { ...state, worlds: newWorlds, inventory: newWorlds.some(w => w.id === state.currentWorld && (w.medals.bronze || w.medals.silver || w.medals.gold)) ? [...state.inventory] : state.inventory };
    }

    case 'TRAVEL_TO_WORLD': {
      const targetWorldIndex = state.worlds.findIndex(w => w.id === action.worldId);
      if (targetWorldIndex === -1 || state.worlds[targetWorldIndex].locked) return state;
      const prevWorld = state.worlds.find(w => w.id === state.currentWorld)!;
      const globalMultiplier = prevWorld.upgradeProgress >= 100 ? 1.5 * action.worldId : 1 + action.worldId * 0.2;

      const newWorlds = [...state.worlds];
      const nextWorldIndex = targetWorldIndex + 1;
      if (nextWorldIndex < newWorlds.length && prevWorld.upgradeProgress >= 50) { // Reduced from 75
        newWorlds[nextWorldIndex] = { ...newWorlds[nextWorldIndex], locked: false };
      }

      return {
        ...initialState,
        currentWorld: action.worldId,
        worlds: newWorlds,
        globalMultiplier,
        totalEssence: state.totalEssence,
        essence: state.essence,
        prestigeCount: state.prestigeCount,
        gems: state.gems,
        permaTapBoosts: state.permaTapBoosts,
        permaPassiveBoosts: state.permaPassiveBoosts,
      };
    }
    

case 'PRESTIGE': {
  const essenceReward = GameMechanics.calculateEssenceReward(state.totalEarned, state) *
    (state.boosts["boost-essence-boost"]?.purchased ? INVENTORY_ITEMS.ESSENCE_BOOST.effect!.value : 1);
  const newTotalEssence = (state.totalEssence || 0) + essenceReward;
  const newEssenceBoost = calculateEssenceIncomeBoost(newTotalEssence, state);
  const startingCoins = GameMechanics.calculateStartingCoins(state); // Use artifact-based starting coins

  const newBoosts = {};
  ["boost-perma-tap", "boost-perma-passive", "boost-no-ads", "boost-auto-buy", "boost-inventory-expansion", "boost-extended-offline"].forEach(boostId => {
    if (state.boosts[boostId]?.purchased) {
      newBoosts[boostId] = { ...state.boosts[boostId], active: false };
    }
  });

  return {
    ...initialState,
    coins: startingCoins, // Set coins to artifact-based value
    offlineEarningsCap: state.boosts["boost-extended-offline"]?.purchased > 0 ? 24 * 60 * 60 : 2 * 60 * 60,
    essence: state.essence + essenceReward,
    totalEssence: newTotalEssence,
    essenceIncomeBoost: newEssenceBoost,
    ownedManagers: state.ownedManagers,
    ownedArtifacts: state.ownedArtifacts,
    achievements: state.achievements,
    achievementsChecked: state.achievementsChecked,
    managers: state.managers,
    artifacts: state.artifacts,
    prestigeCount: state.prestigeCount + 1,
    incomeMultiplier: 1 + (state.prestigeCount + 1) * 0.25,
    skillPoints: state.skillPoints,
    abilities: state.abilities,
    unlockedPerks: state.unlockedPerks,
    gems: state.gems,
    boosts: newBoosts,
    hasNoAds: state.hasNoAds || state.boosts["boost-no-ads"]?.purchased > 0,
    inventoryCapacity: initialState.inventoryCapacity + (state.boosts["boost-inventory-expansion"]?.purchased || 0) * INVENTORY_ITEMS.INVENTORY_EXPANSION.effect!.value,
    username: state.username,
    userId: state.userId,
    nameChangeCount: state.nameChangeCount,
    activeBoosts: [],
    tempEssenceBoostStacks: 0,
    permaTapBoosts: state.permaTapBoosts,
    permaPassiveBoosts: state.permaPassiveBoosts,
    tapBoostTapsRemaining: 0,
    tapBoostActive: false,
    autoTapActive: false,
    playerData: { ...state.playerData }, // Preserve all player data
    currentWorld: state.currentWorld, // Preserve current world
    worlds: state.worlds, // Preserve world progress
    globalMultiplier: state.globalMultiplier, // Preserve global multiplier
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
    case 'UNLOCK_TITLE':
      if (state.playerData.unlockedTitles.includes(action.titleId)) return state;
      return {
        ...state,
        playerData: {
          ...state.playerData,
          unlockedTitles: [...state.playerData.unlockedTitles, action.titleId]
        }
      };
    case 'UNLOCK_PORTRAIT':
      if (state.playerData.unlockedPortraits.includes(action.portraitId)) return state;
      return {
        ...state,
        playerData: {
          ...state.playerData,
          unlockedPortraits: [...state.playerData.unlockedPortraits, action.portraitId]
        }
      };
    case 'UNLOCK_ACHIEVEMENT': {
      const achievementIndex = state.achievements.findIndex(a => a.id === action.achievementId);
      if (achievementIndex === -1 || state.achievements[achievementIndex].unlocked) return state;

      const newAchievements = [...state.achievements];
      newAchievements[achievementIndex] = { ...newAchievements[achievementIndex], unlocked: true };

      const skillPointsToAdd = state.abilities.find(a => a.id === "ability-7" && a.unlocked) ? 3 : 1;

      let newState = {
        ...state,
        achievements: newAchievements,
        achievementsChecked: { ...state.achievementsChecked, [action.achievementId]: true },
        skillPoints: state.skillPoints + skillPointsToAdd
      };

      const reward = newAchievements[achievementIndex].rewards;
      if (reward) {
    console.log(`Unlocking achievement ${action.achievementId} with reward:`, reward);
    switch (reward.type) {
      case 'gems':
        newState.gems += reward.value as number;
        newState.playerData.gems = newState.gems; // Sync with playerData
        break;
        case 'title':
          newState.playerData.title = reward.value as string;
          break;
        case 'portrait':
          newState.playerData.portrait = reward.value as string;
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
          console.log(`Checking achievement ${achievement.id} with reward:`, reward);
          switch (reward.type) {
            case 'gems':
              newState.gems += reward.value as number;
              newState.playerData.gems = newState.gems;
              break;
            case 'boost':
              newState.boosts['boost-generic'] = { 
                active: true, 
                remainingTime: reward.value as number, 
                purchased: (newState.boosts['boost-generic']?.purchased || 0) + 1 
              };
              break;
            case 'title':
              if (!newState.playerData.unlockedTitles.includes(reward.value as string)) {
                newState.playerData.unlockedTitles = [
                  ...newState.playerData.unlockedTitles,
                  reward.value as string
                ];
              }
              break;
            case 'portrait':
              if (!newState.playerData.unlockedPortraits.includes(reward.value as string)) {
                newState.playerData.unlockedPortraits = [
                  ...newState.playerData.unlockedPortraits,
                  reward.value as string
                ];
              }
              break;
            case 'inventory_item':
              newState.inventory = [
                ...newState.inventory, 
                createInventoryItem(INVENTORY_ITEMS[reward.value as keyof typeof INVENTORY_ITEMS], 1)
              ];
              break;
          }
        }
      });

      const skillPointsToAdd = state.abilities.find(a => a.id === "ability-7" && a.unlocked) ? 3 : 1;
      newState.skillPoints += unlockableAchievements.length * skillPointsToAdd;
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
    case 'SHOW_SKILL_POINT_NOTIFICATION': {
      return state;
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
      if (itemIndex === -1 || !state.inventory[itemIndex].usable || !state.inventory[itemIndex].effect) return state;
    
      const item = state.inventory[itemIndex];
      const quantity = action.quantity || 1;
      if (item.quantity < quantity) return state;
    
      const updatedInventory = [...state.inventory];
      if (item.quantity === quantity) {
        updatedInventory.splice(itemIndex, 1);
      } else {
        updatedInventory[itemIndex] = { ...item, quantity: item.quantity - quantity };
      }
    
      const now = Math.floor(Date.now() / 1000);
      let newActiveBoosts = [...state.activeBoosts];
      const existingBoostIndex = newActiveBoosts.findIndex(boost => boost.id === item.id);
      const originalItem = INVENTORY_ITEMS[item.id as keyof typeof INVENTORY_ITEMS];
      const icon = originalItem ? originalItem.icon : item.icon;
    
      if (existingBoostIndex >= 0) {
        const existingBoost = newActiveBoosts[existingBoostIndex];
        const additionalDuration = (item.effect.duration || 0) * quantity;
        const newRemainingTime = (existingBoost.remainingTime || 0) + additionalDuration;
        newActiveBoosts[existingBoostIndex] = {
          ...existingBoost,
          quantity: existingBoost.quantity + quantity,
          duration: (existingBoost.duration || 0) + additionalDuration,
          remainingTime: newRemainingTime,
          activatedAt: now,
        };
      } else {
        const totalDuration = (item.effect.duration || 0) * quantity;
        newActiveBoosts.push({
          id: item.id,
          name: item.name,
          description: item.description,
          quantity,
          value: item.effect.value,
          duration: totalDuration,
          activatedAt: now,
          remainingTime: totalDuration,
          icon,
        });
      }
    
        // Handle specific boost effects
    switch (item.id) {
      case 'boost-essence-boost':
        return {
          ...state,
          inventory: updatedInventory,
          activeBoosts: newActiveBoosts,
          tempEssenceBoostStacks: (state.tempEssenceBoostStacks || 0) + quantity,
        };
      case 'boost-tap-boost':
        const tapsPerStack = 100;
        return {
          ...state,
          inventory: updatedInventory,
          activeBoosts: newActiveBoosts,
          tapBoostTapsRemaining: (state.tapBoostTapsRemaining || 0) + (tapsPerStack * quantity),
          tapBoostActive: true,
        };
      case 'boost-auto-tap':
        return {
          ...state,
          inventory: updatedInventory,
          activeBoosts: newActiveBoosts,
          autoTapActive: true,
        };
        case 'boost-perma-tap':
          return {
            ...state,
            inventory: updatedInventory,
            activeBoosts: newActiveBoosts.filter(b => b.id !== 'boost-perma-tap'),
            permaTapBoosts: (state.permaTapBoosts || 0) + quantity, // Still tracks stacks
          };
        case 'boost-perma-passive':
          return {
            ...state,
            inventory: updatedInventory,
            activeBoosts: newActiveBoosts.filter(b => b.id !== 'boost-perma-passive'),
            permaPassiveBoosts: (state.permaPassiveBoosts || 0) + quantity, // Still tracks stacks
          };
      case 'boost-time-warp':
      case 'boost-time-warp-12':
      case 'boost-time-warp-24':
        const passiveIncome = GameMechanics.calculateTotalCoinsPerSecond(state);
        const timeWarpSeconds = item.effect.value;
        const warpAmount = passiveIncome * timeWarpSeconds * quantity;
        return {
          ...state,
          inventory: updatedInventory,
          activeBoosts: newActiveBoosts.filter(b => b.id !== item.id),
          coins: Math.min(Number.MAX_SAFE_INTEGER, state.coins + warpAmount),
          totalEarned: Math.min(Number.MAX_SAFE_INTEGER, state.totalEarned + warpAmount),
        };
      case 'boost-critical-chance':
        return {
          ...state,
          inventory: updatedInventory,
          activeBoosts: newActiveBoosts,
        };
        case 'boost-no-ads':
          return {
            ...state,
            inventory: updatedInventory,
            activeBoosts: newActiveBoosts.filter(b => b.id !== 'boost-no-ads'), // Remove from active boosts
            hasNoAds: true,
          };
        case 'boost-extended-offline':
            return {
              ...state,
              inventory: updatedInventory,
              activeBoosts: newActiveBoosts.filter(b => b.id !== 'boost-extended-offline'),
              offlineEarningsCap: 24 * 60 * 60, // 24 hours
            };
      case 'boost-random':
        const randomRewards = [
          INVENTORY_ITEMS.TIME_WARP,
          INVENTORY_ITEMS.TIME_WARP_12,
          INVENTORY_ITEMS.TIME_WARP_24,
          INVENTORY_ITEMS.CHEAP_UPGRADES,
          INVENTORY_ITEMS.TAP_BOOST,
          INVENTORY_ITEMS.AUTO_TAP,
          INVENTORY_ITEMS.CRITICAL_CHANCE,
          INVENTORY_ITEMS.ESSENCE_BOOST,
          INVENTORY_ITEMS.PERMA_TAP,
          INVENTORY_ITEMS.PERMA_PASSIVE,
        ];
        const randomItem = randomRewards[Math.floor(Math.random() * randomRewards.length)];
        const newRandomItem = createInventoryItem(randomItem, 1);
        return {
          ...state,
          inventory: [...updatedInventory, newRandomItem],
          activeBoosts: newActiveBoosts.filter(b => b.id !== 'boost-random'),
        };
      default:
        return {
          ...state,
          inventory: updatedInventory,
          activeBoosts: newActiveBoosts,
        };
      }
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
      const quantity = action.quantity || 1; // Use provided quantity or default to 1
      return {
        ...state,
        boosts: {
          ...state.boosts,
          [action.boostId]: {
            active: !!boost.effect?.duration,
            remainingTime: boost.effect?.duration,
            remainingUses: boost.effect?.type === "coinsPerClick" ? boost.effect?.duration : undefined,
            purchased: (state.boosts[action.boostId]?.purchased || 0) + quantity, // Increment by quantity
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
    
      const filteredBoosts = updatedBoosts.filter(boost => 
        !boost.duration || boost.remainingTime === undefined || boost.remainingTime > 0
      );
    
      let newState = {
        ...state,
        activeBoosts: filteredBoosts
      };
    
      // Clean up specific boost states when they expire
      if (!filteredBoosts.some(b => b.id === 'boost-tap-boost') && state.tapBoostActive) {
        newState.tapBoostActive = false;
        newState.tapBoostTapsRemaining = 0;
      }
      if (!filteredBoosts.some(b => b.id === 'boost-auto-tap') && state.autoTapActive) {
        newState.autoTapActive = false;
      }
    
      return newState;
    }

    case 'UPDATE_USERNAME':
      return { ...state, username: action.username };
      case 'UPDATE_TITLE': {
        return {
          ...state,
          playerData: { ...state.playerData, title: action.title }
        };
      }
      case 'UPDATE_PORTRAIT': {
        return {
          ...state,
          playerData: { ...state.playerData, portrait: action.portrait }
        };
      }
    case 'UPDATE_NAME_CHANGE_COUNT':
      return { ...state, nameChangeCount: action.count };
    case 'PURCHASE_GEMS':
      return {
        ...state,
        gems: state.gems + action.amount,
        playerData: {
          ...state.playerData,
          gems: state.playerData.gems + action.amount,
        },
      };
    case 'APPLY_TIME_WARP': {
      return {
        ...state,
        coins: Math.max(0, state.coins + action.amount),
        totalEarned: state.totalEarned + action.amount,
      };
    }
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
  travelToWorld: (worldId: number) => void;
  updateUpgradeProgress: () => void;
  dispatch: React.Dispatch<GameAction>;
  click: () => void;
  addCoins: (amount: number) => void;
  addEssence: (amount: number) => void;
  purchaseGems: (productId: string, amount: number) => Promise<void>;
  addExperience: (amount: number) => void;
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
  activateBoost: (boostId: string, quantity?: number) => void; // Changed this line
  updateUsername: (username: string) => void;
  updateTitle: (title: string) => void;
  updatePortrait: (portrait: string) => void;
  updateBoostTimers: () => void;
  applyTimeWarp: (amount: number) => void;
  
}

const GameContext = createContext<GameContextType | undefined>(undefined);

export const gameContextHolder: { current: GameContextType | null } = { current: null };

export const GameProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [state, dispatch] = useReducer(gameReducer, initialState);
  const [showOfflinePopup, setShowOfflinePopup] = useState(false);
  const [offlineCoins, setOfflineCoins] = useState(0);
  const [popupQueue, setPopupQueue] = useState<{ level: number; rewards: any }[]>([]); // Replace currentPopup
  const [prevLevel, setPrevLevel] = useState(state.playerData.level); // Add this
  const travelToWorld = (worldId: number) => dispatch({ type: 'TRAVEL_TO_WORLD', worldId });
  const updateUpgradeProgress = () => dispatch({ type: 'UPDATE_UPGRADE_PROGRESS' });

  // Define handlePopupClose here
  const handlePopupClose = () => {
    setPopupQueue((prev) => prev.slice(1)); // Remove the first popup from the queue
  };

  useEffect(() => {
    dispatch({ type: 'CHECK_ACHIEVEMENTS' });
  }, [state.level, state.totalClicks, state.totalEarned, state.prestigeCount]);

  useEffect(() => {
    const loadSavedGameState = async () => {
      try {
        const loadedState = await StorageService.loadGameState(initialState);
        dispatch({ type: 'RESTORE_STATE', state: loadedState });
        setPrevLevel(loadedState.playerData.level); // Set initial prevLevel
        const lastSaved = loadedState.lastSavedAt ? new Date(loadedState.lastSavedAt).getTime() : Date.now();
        const now = Date.now();
        const offlineMillis = Math.min(now - lastSaved, loadedState.offlineEarningsCap * 1000 || 2 * 60 * 60 * 1000);
        const offlineSeconds = Math.floor(offlineMillis / 1000);

        const offlineEarnings = GameMechanics.calculateTotalCoinsPerSecond(loadedState) * offlineSeconds;
        if (offlineMillis > 600000 && offlineEarnings > 0) {
          setOfflineCoins(offlineEarnings);
          setShowOfflinePopup(true);
        }
      } catch (error) {
        console.error('Error loading saved game state:', error);
      }
    };

    const requestPushPermissions = async () => {
      if (Capacitor.getPlatform() === 'ios' || Capacitor.getPlatform() === 'android') {
        try {
          const result = await PushNotifications.requestPermissions();
          if (result.receive === 'granted') {
            await PushNotifications.register();
          } else {
            console.log('Push notification permissions denied');
          }
        } catch (error) {
          console.error('Error requesting push permissions:', error);
        }
      }
    };

    // Initialize InAppPurchaseService on deviceready
    document.addEventListener('deviceready', () => {
      InAppPurchaseService.initialize();
    });

    loadSavedGameState();
    requestPushPermissions();

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

    const purchaseGems = async (productId: string, amount: number) => {
      try {
        await InAppPurchaseService.purchaseProduct(productId);
        dispatch({ type: 'PURCHASE_GEMS', productId, amount });
      } catch (error) {
        console.error('Purchase failed:', error);
        throw error;
      }
    };

    const [isPopupActive, setIsPopupActive] = useState(false);


    
    useEffect(() => {
      const currentLevel = state.playerData.level;
  if (currentLevel <= prevLevel) return;

  const newPopups: { level: number; rewards: any }[] = [];
  const newMilestones: number[] = [];

  for (let lvl = prevLevel + 1; lvl <= currentLevel; lvl++) {
    if (lvl % 5 === 0 && lvl >= 5 && lvl <= 100 && !state.shownMilestones.includes(lvl)) {
      const rewards = GameMechanics.calculateLevelUpRewards(lvl);
      if (rewards) {
        newPopups.push({ level: lvl, rewards });
        newMilestones.push(lvl);
      }
    }
  }

  if (newMilestones.length > 0) {
    newMilestones.forEach((level) => dispatch({ type: 'ADD_SHOWN_MILESTONE', level }));
    setPopupQueue((prev) => [...prev, ...newPopups]);
    setPrevLevel(currentLevel);
  }
}, [state.playerData.level, state.shownMilestones]);

const nextPopup = () => {
  setPopupQueue((prev) => prev.slice(1));
};

useEffect(() => {
    const saveInterval = setInterval(() => {
      StorageService.saveGameState(state);
    }, 30000);

    const scheduleOfflineNotification = async () => {
      if (Capacitor.getPlatform() === 'ios' || Capacitor.getPlatform() === 'android') { // Updated check
        try {
          await PushNotifications.cancel({ notifications: [{ id: 'offline-progress' }] });
          await PushNotifications.schedule({
            notifications: [
              {
                id: 'offline-progress',
                title: 'Stellar Alert',
                body: 'Galactic Reserves Maxed, Collect Now!',
                schedule: { at: new Date(Date.now() + 2 * 60 * 60 * 1000) },
              },
            ],
          });
          console.log('Scheduled offline progress notification');
        } catch (error) {
          console.error('Error scheduling offline notification:', error);
        }
      } else {
        console.log('Offline notifications not scheduled on web');
      }
    };

    return () => {
      clearInterval(saveInterval);
      StorageService.saveGameState(state);
      scheduleOfflineNotification();
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
  
    let remainingCoins = state.coins;
    let quantity = 0;
    let currentLevel = upgrade.level;
  
    while (currentLevel + quantity < upgrade.maxLevel) {
      // Simulate state with updated level
      const simulatedState = {
        ...state,
        upgrades: state.upgrades.map(u =>
          u.id === upgradeId ? { ...u, level: currentLevel + quantity } : u
        ),
      };
      const costForNext = GameMechanics.calculateUpgradeCost(simulatedState, upgradeId, 1);
      if (remainingCoins < costForNext) break;
      remainingCoins -= costForNext;
      quantity++;
    }
  
    return quantity;
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
  const updateUsername = (username: string) => dispatch({ type: 'UPDATE_USERNAME', username });
  const updateTitle = (title: string) => dispatch({ type: 'UPDATE_TITLE', title });
  const updatePortrait = (portrait: string) => dispatch({ type: 'UPDATE_PORTRAIT', portrait });
  const updateBoostTimers = () => dispatch({ type: 'UPDATE_BOOST_TIMERS' });
  const applyTimeWarp = (amount: number) => dispatch({ type: 'APPLY_TIME_WARP', amount });

const addExperience = (amount: number) => {
    dispatch({ type: 'ADD_EXPERIENCE', amount });
  };

  const activateBoost = (boostId: string, quantity: number = 1) => 
    dispatch({ type: 'ACTIVATE_BOOST', boostId, quantity }); // Added quantity parameter

  const contextValue: GameContextType = {
    state,
    dispatch,
    click,
    addCoins,
    addEssence,
    buyUpgrade,
    toggleAutoBuy,
    purchaseGems,
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
    addExperience,
    updateTitle,
    updatePortrait,
    updateBoostTimers,
    applyTimeWarp,
    travelToWorld,
    updateUpgradeProgress,
  };

  gameContextHolder.current = contextValue;

  return (
<GameContext.Provider value={contextValue}>
      {children}
      {popupQueue.length > 0 && (
  <LevelUpPopup
    key={popupQueue[0].level}
    level={popupQueue[0].level}
    rewards={popupQueue[0].rewards}
    onClose={nextPopup}
      />
    )}
      {showOfflinePopup && (
        <OfflineProgressPopup
          offlineCoins={offlineCoins}
          onClose={() => setShowOfflinePopup(false)}
        />
      )}
    </GameContext.Provider>
  );
};

export const useGame = () => {
  const context = useContext(GameContext);
  if (!context) {
    throw new Error('useGame must be used within a GameProvider');
  }
  return context;
};
