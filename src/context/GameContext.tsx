
import React, { createContext, useContext, useReducer, useEffect } from 'react';
import { StorageService } from '@/services/StorageService';
import { Ability } from '@/utils/types';
import { formatNumber } from '@/utils/formatters';
import { managers } from '@/utils/managersData';
import { artifacts } from '@/utils/artifactsData';

// Define available upgrade types
export type UpgradeType = 'click' | 'production' | 'manager' | 'artifact';

// Upgrade interface
export interface Upgrade {
  id: string;
  name: string;
  description: string;
  type: UpgradeType;
  baseCost: number;
  currentLevel: number;
  maxLevel?: number;
  effect: {
    base: number;
    growth: number;
  };
  unlocked: boolean;
  element?: string;
  // Add missing properties referenced in other components
  level: number;
  cost: number;
  coinsPerClickBonus?: number;
  coinsPerSecondBonus?: number;
  multiplierBonus?: number;
  icon?: string;
  category?: string;
  unlocksAt?: {
    upgradeId: string;
    level: number;
  };
}

// Manager interface
export interface Manager {
  id: string;
  name: string;
  description: string;
  cost: number;
  unlocked: boolean;
  element?: string;
  bonus?: string;
  boosts?: string[];
  perks?: any[];
  avatar?: string;
}

// Artifact interface
export interface Artifact {
  id: string;
  name: string;
  description: string;
  cost: number;
  unlocked: boolean;
  effect: {
    type: 'click' | 'production' | 'all';
    multiplier: number;
  };
  rarity: 'common' | 'uncommon' | 'rare' | 'epic' | 'legendary';
}

// Achievement interface
export interface Achievement {
  id: string;
  name: string;
  description: string;
  unlocked: boolean;
  checkCondition?: (state: GameState) => boolean;
}

// Inventory item interface
export interface InventoryItem {
  id: string;
  name: string;
  description: string;
  quantity: number;
  type: string;
  rarity: 'common' | 'uncommon' | 'rare' | 'epic' | 'legendary';
  usable: boolean;
  stackable: boolean;
  icon: React.ReactNode;
  effect?: {
    type: string;
    value: number;
    duration?: number;
  };
}

// Perk interface
export interface Perk {
  id: string;
  name: string;
  description: string;
  cost: number;
  icon: string;
  unlocked: boolean;
  category?: string;
  effect: {
    type: string;
    value: number;
    elements?: string[];
  };
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
  prestigeCount: number;
  incomeMultiplier: number;
  skillPoints: number;
  abilities: Ability[];
  unlockedPerks: string[];
  exp: number;
  level: number;
  // Add missing properties referenced in components
  achievements: Achievement[];
  managers: Manager[];
  artifacts: Artifact[];
  inventory: InventoryItem[];
  inventoryCapacity: number;
}

// Action interface
type GameAction =
  | { type: 'CLICK' }
  | { type: 'ADD_COINS'; amount: number }
  | { type: 'PURCHASE_UPGRADE'; upgradeId: string }
  | { type: 'TOGGLE_AUTO_BUY' }
  | { type: 'TOGGLE_AUTO_TAP' }
  | { type: 'PRESTIGE' }
  | { type: 'PURCHASE_MANAGER'; managerId: string }
  | { type: 'PURCHASE_ARTIFACT'; artifactId: string }
  | { type: 'UNLOCK_ABILITY'; abilityId: string }
  | { type: 'UNLOCK_PERK'; perkId: string }
  | { type: 'SET_GAME_STATE'; state: Partial<GameState> }
  | { type: 'UPDATE_EXP'; exp: number }
  | { type: 'SET_INCOME_MULTIPLIER'; multiplier: number }
  | { type: 'ADD_ESSENCE'; amount: number }
  | { type: 'USE_ITEM'; itemId: string }
  | { type: 'ADD_ITEM'; item: InventoryItem };

// Context value interface
interface GameContextValue {
  state: GameState;
  dispatch: React.Dispatch<GameAction>;
  incrementCoins: () => void;
  canAffordUpgrade: (upgradeId: string) => boolean;
  canAffordManager: (managerId: string) => boolean;
  canAffordArtifact: (artifactId: string) => boolean;
  upgradeCost: (upgradeId: string) => number;
  nextLevelExp: (level: number) => number;
  expToNextLevel: (currentExp: number, currentLevel: number) => number;
  expProgress: (currentExp: number, currentLevel: number) => number;
  // Add missing methods referenced in components
  click: () => void;
  toggleAutoTap: () => void;
  toggleAutoBuy: () => void;
  setIncomeMultiplier: (multiplier: number) => void;
  addCoins: (amount: number) => void;
  addEssence: (amount: number) => void;
  prestige: () => void;
  buyManager: (managerId: string) => void;
  buyArtifact: (artifactId: string) => void;
  unlockPerk: (perkId: string, parentId: string) => void;
  unlockAbility: (abilityId: string) => void;
  buyUpgrade: (upgradeId: string) => void;
  calculatePotentialEssenceReward: () => number;
  calculateMaxPurchaseAmount: (upgradeId: string) => number;
  useItem: (itemId: string) => void;
  addItem: (item: InventoryItem) => void;
}

// Initial state
const initialState: GameState = {
  coins: 0,
  coinsPerClick: 1,
  coinsPerSecond: 0,
  upgrades: [
    {
      id: 'upgrade-click-1',
      name: 'Improved Drill',
      description: 'Increase the base mining power of your clicks',
      type: 'click',
      baseCost: 10,
      currentLevel: 0,
      effect: {
        base: 1,
        growth: 0.5,
      },
      unlocked: true,
      level: 0,
      cost: 10,
    },
    {
      id: 'upgrade-production-1',
      name: 'Basic Extractor',
      description: 'Mines elements automatically',
      type: 'production',
      baseCost: 50,
      currentLevel: 0,
      effect: {
        base: 1,
        growth: 0.8,
      },
      unlocked: true,
      level: 0,
      cost: 50,
    },
  ],
  totalClicks: 0,
  totalEarned: 0,
  autoBuy: false,
  autoTap: false,
  essence: 0,
  ownedManagers: [],
  ownedArtifacts: [],
  prestigeCount: 0,
  incomeMultiplier: 1,
  skillPoints: 0,
  abilities: [],
  unlockedPerks: [],
  exp: 0,
  level: 1,
  // Initialize new properties
  achievements: [],
  managers: [],
  artifacts: [],
  inventory: [],
  inventoryCapacity: 100,
};

const calculateLevelFromExp = (exp: number): number => {
  // Level thresholds defined in firebaseSync.ts
  const levelThresholds = [
    0, 100, 250, 500, 1000, 2000, 3500, 5500, 8000, 11000, 15000, // Levels 1-11
    20000, 26000, 33000, 41000, 50000, 60000, 71000, 83000, 96000, 110000, // Levels 12-21
    125000, 141000, 158000, 176000, 195000, 215000, 236000, 258000, 281000, 305000, // Levels 22-31
    // ... and so on up to level 100
  ];

  let level = 1;
  for (let i = 1; i < levelThresholds.length; i++) {
    if (exp >= levelThresholds[i]) {
      level = i + 1;
    } else {
      break;
    }
  }
  return level;
};

// Context creation
const GameContext = createContext<GameContextValue | undefined>(undefined);

// Reducer function
function gameReducer(state: GameState, action: GameAction): GameState {
  switch (action.type) {
    case 'CLICK': {
      const newCoins = state.coins + state.coinsPerClick;
      const newTotalEarned = state.totalEarned + state.coinsPerClick;
      const newExp = state.exp + state.coinsPerClick;
      const newLevel = calculateLevelFromExp(newExp);
      
      return {
        ...state,
        coins: newCoins,
        totalClicks: state.totalClicks + 1,
        totalEarned: newTotalEarned,
        exp: newExp,
        level: newLevel
      };
    }
    
    case 'ADD_COINS': {
      const newCoins = state.coins + action.amount;
      const newTotalEarned = state.totalEarned + action.amount;
      const newExp = state.exp + action.amount;
      const newLevel = calculateLevelFromExp(newExp);
      
      return {
        ...state,
        coins: newCoins,
        totalEarned: newTotalEarned,
        exp: newExp,
        level: newLevel
      };
    }
    
    case 'UPDATE_EXP': {
      const newExp = action.exp;
      const newLevel = calculateLevelFromExp(newExp);
      
      return {
        ...state,
        exp: newExp,
        level: newLevel
      };
    }
    case 'PURCHASE_UPGRADE': {
      const upgradeId = action.upgradeId;
      const upgrade = state.upgrades.find(u => u.id === upgradeId);
      if (!upgrade) return state;

      const cost = Math.floor(upgrade.baseCost * Math.pow(1.15, upgrade.currentLevel));
      if (state.coins < cost) return state;

      const updatedUpgrades = state.upgrades.map(u =>
        u.id === upgradeId ? { 
          ...u, 
          currentLevel: u.currentLevel + 1,
          level: u.currentLevel + 1,  // Update level field as well
          cost: Math.floor(u.baseCost * Math.pow(1.15, u.currentLevel + 1)) // Update cost field
        } : u
      );

      // Calculate new coinsPerClick and coinsPerSecond
      let newCoinsPerClick = state.coinsPerClick;
      let newCoinsPerSecond = state.coinsPerSecond;

      if (upgrade.type === 'click') {
        newCoinsPerClick = initialState.upgrades.find(u => u.id === upgradeId)!.effect.base + (upgrade.effect.base + upgrade.effect.growth * upgrade.currentLevel);
      } else if (upgrade.type === 'production') {
        newCoinsPerSecond = initialState.upgrades.find(u => u.id === upgradeId)!.effect.base + (upgrade.effect.base + upgrade.effect.growth * upgrade.currentLevel);
      }

      return {
        ...state,
        coins: state.coins - cost,
        upgrades: updatedUpgrades,
        coinsPerClick: newCoinsPerClick,
        coinsPerSecond: newCoinsPerSecond,
      };
    }
    case 'TOGGLE_AUTO_BUY':
      return {
        ...state,
        autoBuy: !state.autoBuy,
      };
    case 'TOGGLE_AUTO_TAP':
      return {
        ...state,
        autoTap: !state.autoTap,
      };
    case 'PRESTIGE':
      return {
        ...initialState,
        essence: state.essence + 10,
        prestigeCount: state.prestigeCount + 1,
      };
    case 'PURCHASE_MANAGER': {
      const managerId = action.managerId;
      const manager = state.managers.find(m => m.id === managerId);
      if (!manager) return state;
    
      if (state.coins < manager.cost) return state;
    
      return {
        ...state,
        coins: state.coins - manager.cost,
        ownedManagers: [...state.ownedManagers, manager.id],
      };
    }
    case 'PURCHASE_ARTIFACT': {
      const artifactId = action.artifactId;
      const artifact = state.artifacts.find(a => a.id === artifactId);
      if (!artifact) return state;
    
      if (state.coins < artifact.cost) return state;
    
      return {
        ...state,
        coins: state.coins - artifact.cost,
        ownedArtifacts: [...state.ownedArtifacts, artifact.id],
      };
    }
    case 'UNLOCK_ABILITY': {
      const abilityId = action.abilityId;
      const updatedAbilities = state.abilities.map(ability =>
        ability.id === abilityId ? { ...ability, unlocked: true } : ability
      );
    
      return {
        ...state,
        abilities: updatedAbilities,
      };
    }
    case 'UNLOCK_PERK': {
      const perkId = action.perkId;
      return {
        ...state,
        unlockedPerks: [...state.unlockedPerks, perkId],
      };
    }
    
    case 'SET_GAME_STATE':
      return {
        ...state,
        ...action.state
      };
      
    case 'SET_INCOME_MULTIPLIER':
      return {
        ...state,
        incomeMultiplier: action.multiplier
      };
    
    case 'ADD_ESSENCE':
      return {
        ...state,
        essence: state.essence + action.amount
      };
    
    case 'USE_ITEM': {
      const itemId = action.itemId;
      const updatedInventory = state.inventory.map(item => 
        item.id === itemId 
          ? { ...item, quantity: item.quantity - 1 } 
          : item
      ).filter(item => item.quantity > 0);
      
      return {
        ...state,
        inventory: updatedInventory
      };
    }
    
    case 'ADD_ITEM': {
      const existingItemIndex = state.inventory.findIndex(item => 
        item.id === action.item.id && item.stackable
      );
      
      if (existingItemIndex >= 0) {
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
      
      return {
        ...state,
        inventory: [...state.inventory, action.item]
      };
    }
      
    default:
      return state;
  }
}

// Provider component
export const GameProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [state, dispatch] = useReducer(gameReducer, initialState);
  
  // Load saved game state
  useEffect(() => {
    async function loadGame() {
      const savedState = await StorageService.loadGameState();
      if (savedState) {
        dispatch({ type: 'SET_GAME_STATE', state: savedState });
      }
    }
    loadGame();
  }, []);
  
  // Auto-save game state
  useEffect(() => {
    const saveInterval = setInterval(() => {
      StorageService.saveGameState(state);
    }, 30000); // Save every 30 seconds
    
    // Save on unmount
    return () => {
      clearInterval(saveInterval);
      StorageService.saveGameState(state);
    };
  }, [state]);
  
  // Passive income calculation
  useEffect(() => {
    const tickInterval = setInterval(() => {
      if (state.coinsPerSecond > 0) {
        // Add one tick of passive income (1/10th of coinsPerSecond)
        dispatch({ type: 'ADD_COINS', amount: state.coinsPerSecond / 10 });
      }
    }, 100); // 10 ticks per second
    
    return () => clearInterval(tickInterval);
  }, [state.coinsPerSecond]);
  
  // Utility functions
  const incrementCoins = () => {
    dispatch({ type: 'CLICK' });
  };
  
  const click = () => {
    dispatch({ type: 'CLICK' });
  };
  
  const toggleAutoTap = () => {
    dispatch({ type: 'TOGGLE_AUTO_TAP' });
  };
  
  const toggleAutoBuy = () => {
    dispatch({ type: 'TOGGLE_AUTO_BUY' });
  };
  
  const setIncomeMultiplier = (multiplier: number) => {
    dispatch({ type: 'SET_INCOME_MULTIPLIER', multiplier });
  };
  
  const addCoins = (amount: number) => {
    dispatch({ type: 'ADD_COINS', amount });
  };
  
  const addEssence = (amount: number) => {
    dispatch({ type: 'ADD_ESSENCE', amount });
  };
  
  const prestige = () => {
    dispatch({ type: 'PRESTIGE' });
  };
  
  const buyManager = (managerId: string) => {
    dispatch({ type: 'PURCHASE_MANAGER', managerId });
  };
  
  const buyArtifact = (artifactId: string) => {
    dispatch({ type: 'PURCHASE_ARTIFACT', artifactId });
  };
  
  const unlockPerk = (perkId: string, parentId: string) => {
    dispatch({ type: 'UNLOCK_PERK', perkId });
  };
  
  const unlockAbility = (abilityId: string) => {
    dispatch({ type: 'UNLOCK_ABILITY', abilityId });
  };
  
  const buyUpgrade = (upgradeId: string) => {
    dispatch({ type: 'PURCHASE_UPGRADE', upgradeId });
  };
  
  const calculatePotentialEssenceReward = () => {
    // Simple calculation for now
    return Math.floor(state.totalEarned / 1000000);
  };
  
  const calculateMaxPurchaseAmount = (upgradeId: string) => {
    // Simple calculation for now
    return 1;
  };
  
  const useItem = (itemId: string) => {
    dispatch({ type: 'USE_ITEM', itemId });
  };
  
  const addItem = (item: InventoryItem) => {
    dispatch({ type: 'ADD_ITEM', item });
  };
  
  const canAffordUpgrade = (upgradeId: string) => {
    const upgrade = state.upgrades.find(u => u.id === upgradeId);
    if (!upgrade) return false;
    
    const cost = calculateUpgradeCost(upgrade);
    return state.coins >= cost;
  };
  
  const canAffordManager = (managerId: string) => {
    const manager = state.managers.find(m => m.id === managerId);
    if (!manager) return false;
    
    return state.coins >= manager.cost;
  };
  
  const canAffordArtifact = (artifactId: string) => {
    const artifact = state.artifacts.find(a => a.id === artifactId);
    if (!artifact) return false;
    
    return state.coins >= artifact.cost;
  };
  
  const calculateUpgradeCost = (upgrade: Upgrade): number => {
    return Math.floor(upgrade.baseCost * Math.pow(1.15, upgrade.currentLevel));
  };
  
  const upgradeCost = (upgradeId: string): number => {
    const upgrade = state.upgrades.find(u => u.id === upgradeId);
    if (!upgrade) return 0;
    
    return calculateUpgradeCost(upgrade);
  };
  
  const nextLevelExpThreshold = (level: number): number => {
    // Return the EXP needed for the next level
    const levelThresholds = [
      0, 100, 250, 500, 1000, 2000, 3500, 5500, 8000, 11000, 15000, // Levels 1-11
      20000, 26000, 33000, 41000, 50000, 60000, 71000, 83000, 96000, 110000, // Levels 12-21
      // ...and so on up to level 100
    ];
    
    if (level >= levelThresholds.length) {
      return Infinity; // Max level reached
    }
    
    return levelThresholds[level];
  };
  
  const nextLevelExp = nextLevelExpThreshold;
  
  const expToNextLevel = (currentExp: number, currentLevel: number): number => {
    const nextLevelExpThreshold = nextLevelExp(currentLevel);
    return nextLevelExpThreshold - currentExp;
  };
  
  const expProgress = (currentExp: number, currentLevel: number): number => {
    const currentLevelExp = nextLevelExp(currentLevel - 1);
    const nextLevelExpThreshold = nextLevelExp(currentLevel);
    
    if (nextLevelExpThreshold === Infinity) return 100; // Max level
    
    const expInCurrentLevel = currentExp - currentLevelExp;
    const expRequiredForNextLevel = nextLevelExpThreshold - currentLevelExp;
    
    return (expInCurrentLevel / expRequiredForNextLevel) * 100;
  };
  
  return (
    <GameContext.Provider
      value={{
        state,
        dispatch,
        incrementCoins,
        canAffordUpgrade,
        canAffordManager,
        canAffordArtifact,
        upgradeCost,
        nextLevelExp,
        expToNextLevel,
        expProgress,
        click,
        toggleAutoTap,
        toggleAutoBuy,
        setIncomeMultiplier,
        addCoins,
        addEssence,
        prestige,
        buyManager,
        buyArtifact,
        unlockPerk,
        unlockAbility,
        buyUpgrade,
        calculatePotentialEssenceReward,
        calculateMaxPurchaseAmount,
        useItem,
        addItem
      }}
    >
      {children}
    </GameContext.Provider>
  );
};

// Custom hook to use the game context
export const useGame = (): GameContextValue => {
  const context = useContext(GameContext);
  if (context === undefined) {
    throw new Error('useGame must be used within a GameProvider');
  }
  return context;
};
