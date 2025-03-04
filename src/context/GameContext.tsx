
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
  | { type: 'BUY_UPGRADE'; upgradeId: string }
  | { type: 'TICK' };

// Initial game state
const initialState: GameState = {
  coins: 0,
  coinsPerClick: 1,
  coinsPerSecond: 0,
  upgrades: upgradesList,
  totalClicks: 0,
  totalEarned: 0
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
      
      if (state.coins < upgrade.cost || upgrade.level >= upgrade.maxLevel) return state;
      
      // Calculate new stats with multiplier effects
      let clickMultiplier = 1;
      let secondMultiplier = 1;
      
      // Apply multiplier from this upgrade
      if (upgrade.multiplierBonus > 0) {
        clickMultiplier += upgrade.multiplierBonus;
        secondMultiplier += upgrade.multiplierBonus;
      }
      
      const newCoinsPerClick = state.coinsPerClick + (upgrade.coinsPerClickBonus * clickMultiplier);
      const newCoinsPerSecond = state.coinsPerSecond + (upgrade.coinsPerSecondBonus * secondMultiplier);
      
      // Update the upgrade
      const updatedUpgrade = {
        ...upgrade,
        level: upgrade.level + 1,
        cost: Math.floor(upgrade.baseCost * Math.pow(1.15, upgrade.level + 1))
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
        coins: state.coins - upgrade.cost,
        coinsPerClick: newCoinsPerClick,
        coinsPerSecond: newCoinsPerSecond,
        upgrades: newUpgrades
      };
    }
    case 'TICK':
      if (state.coinsPerSecond > 0) {
        return {
          ...state,
          coins: state.coins + state.coinsPerSecond / 10, // Divide by 10 because we tick 10 times per second
          totalEarned: state.totalEarned + state.coinsPerSecond / 10
        };
      }
      return state;
    default:
      return state;
  }
};

// Create the context
type GameContextType = {
  state: GameState;
  handleClick: () => void;
  buyUpgrade: (upgradeId: string) => void;
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
  const buyUpgrade = (upgradeId: string) => {
    dispatch({ type: 'BUY_UPGRADE', upgradeId });
  };

  // Set up the automatic tick for passive income
  useEffect(() => {
    const interval = setInterval(() => {
      dispatch({ type: 'TICK' });
    }, 100); // 10 ticks per second for smooth animation

    return () => clearInterval(interval);
  }, []);

  return (
    <GameContext.Provider value={{ state, handleClick, buyUpgrade }}>
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
