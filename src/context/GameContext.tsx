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
  gems: number; // Added global gems variable
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
  | { type: 'HANDLE_CLICK' }
  | { type: 'RESTORE_STATE_PROPERTY'; property: keyof GameState; value: any }
  | { type: 'RESTORE_UPGRADES'; upgrades: Upgrade[] }
  | { type: 'RESTORE_ABILITIES'; abilities: Ability[] }
  | { type: 'RESTORE_ACHIEVEMENTS'; achievements: Achievement[] }
  | { type: 'USE_ITEM'; itemId: string }
  | { type: 'ADD_ITEM'; item: InventoryItem }
  | { type: 'REMOVE_ITEM'; itemId: string; quantity?: number }
  | { type: 'SET_MENU_TYPE'; menuType: string }
  | { type: 'ADD_GEMS'; amount: number }; // New action for gems

// Updated upgrades with increased cost (50% more) and maxLevel
const updatedUpgradesList = upgradesList.map(upgrade => ({
  ...upgrade,
  maxLevel: 1000,
  cost: upgrade.baseCost * 1.5,
  baseCost: upgrade.baseCost * 1.5,
  coinsPerSecondBonus: upgrade.coinsPerSecondBonus * 0.5
}));

// Initial abilities (unchanged for brevity)
const initialAbilities: Ability[] = [/* ... your abilities ... */];

// Fixed growth rate for upgrade costs
const UPGRADE_COST_GROWTH = 1.15;

// Updated initial state with gems
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
  gems: 0, // Initialize gems to 0
};

// Game reducer with new ADD_GEMS action
const gameReducer = (state: GameState, action: GameAction): GameState => {
  switch (action.type) {
    case 'ADD_GEMS':
      return {
        ...state,
        gems: state.gems + action.amount
      };
    // ... (other cases remain unchanged, omitted for brevity)
    case 'CLICK': {
      const totalClickAmount = GameMechanics.calculateTapValue(state);
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
      const totalCost = Math.floor(GameMechanics.calculateBulkPurchaseCost(
        upgrade.baseCost, 
        upgrade.level, 
        maxPossibleQuantity, 
        UPGRADE_COST_GROWTH
      ) * costReduction);
      if (state.coins < totalCost) return state;
      const oldLevel = upgrade.level;
      const newLevel = upgrade.level + maxPossibleQuantity;
      const shouldAwardSkillPoint = GameMechanics.checkUpgradeMilestone(oldLevel, newLevel);
      let newCoinsPerClick = state.coinsPerClick;
      let newCoinsPerSecond = state.coinsPerSecond;
      if (upgrade.category === UPGRADE_CATEGORIES.TAP) {
        // Tap upgrades handled in calculateTapValue
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
    case 'PRESTIGE': {
      const essenceReward = GameMechanics.calculateEssenceReward(state.totalEarned, state);
      const startingCoins = GameMechanics.calculateStartingCoins(state.ownedArtifacts);
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
        gems: state.gems // Persist gems across prestige
      };
    }
    // ... (other cases unchanged)
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
  useItem: (itemId: string) => void;
  addItem: (item: InventoryItem) => void;
  removeItem: (itemId: string, quantity?: number) => void;
  addGems: (amount: number) => void; // New action for gems
}

const GameContext = createContext<GameContextType | undefined>(undefined);

export const gameContextHolder: { current: GameContextType | null } = { current: null };

export const GameProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [state, dispatch] = useReducer(gameReducer, initialState);

  // Load saved game state (updated to include gems)
  useEffect(() => {
    const loadSavedGameState = async () => {
      try {
        const savedState = await StorageService.loadGameState();
        if (savedState) {
          const restoredAbilities = initialState.abilities.map(ability => {
            const savedAbility = savedState.abilities?.find(a => a.id === ability.id);
            return savedAbility ? { ...ability, unlocked: savedAbility.unlocked } : ability;
          });
          const restoredUpgrades = initialState.upgrades.map(upgrade => {
            const savedUpgrade = savedState.upgrades?.find(u => u.id === upgrade.id);
            return savedUpgrade ? { ...savedUpgrade, icon: upgrade.icon, description: upgrade.description } : upgrade;
          });
          const restoredState: GameState = {
            ...initialState,
            ...savedState,
            abilities: restoredAbilities,
            upgrades: restoredUpgrades,
            achievements: initialState.achievements.map(achievement => {
              const savedAchievement = savedState.achievements?.find(a => a.id === achievement.id);
              return { ...achievement, unlocked: savedAchievement?.unlocked || false };
            }),
            managers: initialState.managers,
            artifacts: initialState.artifacts,
            gems: savedState.gems || 0 // Restore gems if saved
          };
          for (const key in restoredState) {
            if (key !== 'abilities' && key !== 'upgrades' && key !== 'achievements') {
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

  // Save game state periodically (includes gems)
  useEffect(() => {
    const saveInterval = setInterval(() => {
      StorageService.saveGameState(state);
    }, 30000);
    return () => {
      clearInterval(saveInterval);
      StorageService.saveGameState(state);
    };
  }, [state]);

  // Game tick effect (unchanged)
  useEffect(() => {
    const tickInterval = setInterval(() => {
      dispatch({ type: 'TICK' });
    }, 100);
    return () => clearInterval(tickInterval);
  }, []);

  // Check achievements (unchanged)
  useEffect(() => {
    const achievementInterval = setInterval(() => {
      dispatch({ type: 'CHECK_ACHIEVEMENTS' });
    }, 5000);
    return () => clearInterval(achievementInterval);
  }, []);

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
  const calculateMaxPurchaseAmount = (upgradeId: string) => {
    const upgrade = state.upgrades.find(u => u.id === upgradeId);
    if (!upgrade || upgrade.level >= upgrade.maxLevel) return 0;
    const costReduction = GameMechanics.calculateCostReduction(state);
    return GameMechanics.calculateMaxAffordableQuantity(state.coins, upgrade.baseCost * costReduction, upgrade.level, UPGRADE_COST_GROWTH);
  };
  const calculatePotentialEssenceReward = () => GameMechanics.calculateEssenceReward(state.totalEarned, state);
  const handleClick = () => dispatch({ type: 'HANDLE_CLICK' });
  const useItem = (itemId: string) => dispatch({ type: 'USE_ITEM', itemId });
  const addItem = (item: InventoryItem) => dispatch({ type: 'ADD_ITEM', item });
  const removeItem = (itemId: string, quantity?: number) => dispatch({ type: 'REMOVE_ITEM', itemId, quantity });
  const addGems = (amount: number) => dispatch({ type: 'ADD_GEMS', amount }); // New action

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
    addGems
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
