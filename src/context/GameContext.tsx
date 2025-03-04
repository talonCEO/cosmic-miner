
import React, { createContext, useContext, useReducer, useEffect, ReactNode } from 'react';
import { upgradesList } from '@/utils/upgradesData';

// Game state interface
interface GameState {
  coins: number;
  coinsPerClick: number;
  coinsPerSecond: number;
  upgrades: Upgrade[];
  totalClicks: number;
  totalEarned: number;
  autoBuy: boolean;
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
  | { type: 'BUY_UPGRADE'; upgradeId: string; quantity?: number }
  | { type: 'TOGGLE_AUTO_BUY' }
  | { type: 'TICK' };

// Initial game state
const initialState: GameState = {
  coins: 0,
  coinsPerClick: 1,
  coinsPerSecond: 0,
  upgrades: upgradesList,
  totalClicks: 0,
  totalEarned: 0,
  autoBuy: false
};

// Helper function to calculate the total cost of buying multiple upgrades
const calculateBulkCost = (baseCost: number, currentLevel: number, quantity: number): number => {
  let totalCost = 0;
  for (let i = 0; i < quantity; i++) {
    totalCost += Math.floor(baseCost * Math.pow(1.15, currentLevel + i));
  }
  return totalCost;
};

// Game reducer
const gameReducer = (state: GameState, action: GameAction): GameState => {
  switch (action.type) {
    case 'CLICK':
      return {
        ...state,
        coins: state.coins + state.coinsPerClick,
        totalClicks: state.totalClicks + 1,
        totalEarned: state.totalEarned + state.coinsPerClick
      };
    case 'ADD_COINS':
      return {
        ...state,
        coins: state.coins + action.amount,
        totalEarned: state.totalEarned + action.amount
      };
    case 'BUY_UPGRADE': {
      const upgradeIndex = state.upgrades.findIndex(u => u.id === action.upgradeId);
      
      if (upgradeIndex === -1) return state;
      
      const upgrade = state.upgrades[upgradeIndex];
      const quantity = action.quantity || 1;
      
      if (upgrade.level >= upgrade.maxLevel) return state;
      
      // Calculate how many levels we can buy (up to requested quantity)
      const maxPossibleQuantity = Math.min(
        quantity, 
        upgrade.maxLevel - upgrade.level
      );
      
      // Calculate total cost for bulk purchase
      const totalCost = calculateBulkCost(upgrade.baseCost, upgrade.level, maxPossibleQuantity);
      
      // Check if player can afford it
      if (state.coins < totalCost) return state;
      
      // Calculate new stats with all purchased levels
      const newCoinsPerClick = state.coinsPerClick + (upgrade.coinsPerClickBonus * maxPossibleQuantity);
      const newCoinsPerSecond = state.coinsPerSecond + (upgrade.coinsPerSecondBonus * maxPossibleQuantity);
      
      // Update the upgrade
      const updatedUpgrade = {
        ...upgrade,
        level: upgrade.level + maxPossibleQuantity,
        cost: Math.floor(upgrade.baseCost * Math.pow(1.15, upgrade.level + maxPossibleQuantity))
      };
      
      // Create a new upgrades array
      const newUpgrades = [...state.upgrades];
      newUpgrades[upgradeIndex] = updatedUpgrade;
      
      // Check for unlocks based on this upgrade purchase
      state.upgrades.forEach((u, index) => {
        if (!u.unlocked && u.unlocksAt && 
            u.unlocksAt.upgradeId === upgrade.id && 
            updatedUpgrade.level >= u.unlocksAt.level) {
          newUpgrades[index] = { ...newUpgrades[index], unlocked: true };
        }
      });
      
      return {
        ...state,
        coins: state.coins - totalCost,
        coinsPerClick: newCoinsPerClick,
        coinsPerSecond: newCoinsPerSecond,
        upgrades: newUpgrades
      };
    }
    case 'TOGGLE_AUTO_BUY':
      return {
        ...state,
        autoBuy: !state.autoBuy
      };
    case 'TICK': {
      let newState = { ...state };
      
      if (state.coinsPerSecond > 0) {
        newState = {
          ...newState,
          coins: newState.coins + state.coinsPerSecond / 10, // Divide by 10 because we tick 10 times per second
          totalEarned: newState.totalEarned + state.coinsPerSecond / 10
        };
      }
      
      // Auto-buy logic
      if (newState.autoBuy) {
        // Find the cheapest affordable and unlocked upgrade
        const affordableUpgrades = newState.upgrades
          .filter(u => u.unlocked && u.level < u.maxLevel && newState.coins >= u.cost)
          .sort((a, b) => a.cost - b.cost);
        
        if (affordableUpgrades.length > 0) {
          const cheapestUpgrade = affordableUpgrades[0];
          
          // Execute the purchase
          const upgradeIndex = newState.upgrades.findIndex(u => u.id === cheapestUpgrade.id);
          
          // Calculate new stats
          const newCoinsPerClick = newState.coinsPerClick + cheapestUpgrade.coinsPerClickBonus;
          const newCoinsPerSecond = newState.coinsPerSecond + cheapestUpgrade.coinsPerSecondBonus;
          
          // Update the upgrade
          const updatedUpgrade = {
            ...cheapestUpgrade,
            level: cheapestUpgrade.level + 1,
            cost: Math.floor(cheapestUpgrade.baseCost * Math.pow(1.15, cheapestUpgrade.level + 1))
          };
          
          // Create a new upgrades array
          const newUpgrades = [...newState.upgrades];
          newUpgrades[upgradeIndex] = updatedUpgrade;
          
          // Check for unlocks based on this upgrade purchase
          newState.upgrades.forEach((u, index) => {
            if (!u.unlocked && u.unlocksAt && 
                u.unlocksAt.upgradeId === cheapestUpgrade.id && 
                updatedUpgrade.level >= u.unlocksAt.level) {
              newUpgrades[index] = { ...newUpgrades[index], unlocked: true };
            }
          });
          
          newState = {
            ...newState,
            coins: newState.coins - cheapestUpgrade.cost,
            coinsPerClick: newCoinsPerClick,
            coinsPerSecond: newCoinsPerSecond,
            upgrades: newUpgrades
          };
        }
      }
      
      return newState;
    }
    default:
      return state;
  }
};

// Create the context
type GameContextType = {
  state: GameState;
  handleClick: () => void;
  buyUpgrade: (upgradeId: string, quantity?: number) => void;
  toggleAutoBuy: () => void;
};

const GameContext = createContext<GameContextType | undefined>(undefined);

// Create provider component
export const GameProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [state, dispatch] = useReducer(gameReducer, initialState);

  // Handle click action
  const handleClick = () => {
    dispatch({ type: 'CLICK' });
  };

  // Buy upgrade
  const buyUpgrade = (upgradeId: string, quantity: number = 1) => {
    dispatch({ type: 'BUY_UPGRADE', upgradeId, quantity });
  };

  // Toggle auto-buy
  const toggleAutoBuy = () => {
    dispatch({ type: 'TOGGLE_AUTO_BUY' });
  };

  // Set up the automatic tick for passive income
  useEffect(() => {
    const interval = setInterval(() => {
      dispatch({ type: 'TICK' });
    }, 100); // 10 ticks per second for smooth animation

    return () => clearInterval(interval);
  }, []);

  return (
    <GameContext.Provider value={{ state, handleClick, buyUpgrade, toggleAutoBuy }}>
      {children}
    </GameContext.Provider>
  );
};

// Create custom hook to use the game context
export const useGame = (): GameContextType => {
  const context = useContext(GameContext);
  if (context === undefined) {
    throw new Error('useGame must be used within a GameProvider');
  }
  return context;
};
