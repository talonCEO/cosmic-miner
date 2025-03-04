
import React, { createContext, useContext, useReducer, useEffect, ReactNode } from 'react';

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
  icon: string;
  unlocked: boolean;
}

// Action types
type GameAction =
  | { type: 'CLICK' }
  | { type: 'ADD_COINS'; amount: number }
  | { type: 'BUY_UPGRADE'; upgradeId: string }
  | { type: 'TICK' };

// Initial upgrades
const initialUpgrades: Upgrade[] = [
  {
    id: 'click-power',
    name: 'Tap Power',
    description: 'Increase coins per tap',
    cost: 10,
    baseCost: 10,
    level: 0,
    maxLevel: 50,
    coinsPerClickBonus: 1,
    coinsPerSecondBonus: 0,
    icon: 'finger-tap',
    unlocked: true
  },
  {
    id: 'auto-clicker',
    name: 'Auto Tapper',
    description: 'Automatically generate coins',
    cost: 25,
    baseCost: 25,
    level: 0,
    maxLevel: 50,
    coinsPerClickBonus: 0,
    coinsPerSecondBonus: 0.5,
    icon: 'timer',
    unlocked: true
  },
  {
    id: 'efficiency',
    name: 'Efficiency',
    description: 'Boost all coin generation',
    cost: 100,
    baseCost: 100,
    level: 0,
    maxLevel: 20,
    coinsPerClickBonus: 2,
    coinsPerSecondBonus: 1,
    icon: 'zap',
    unlocked: false
  },
  {
    id: 'multiplier',
    name: 'Multiplier',
    description: 'Multiply all coin generation',
    cost: 500,
    baseCost: 500,
    level: 0,
    maxLevel: 10,
    coinsPerClickBonus: 5,
    coinsPerSecondBonus: 2,
    icon: 'percent',
    unlocked: false
  }
];

// Initial game state
const initialState: GameState = {
  coins: 0,
  coinsPerClick: 1,
  coinsPerSecond: 0,
  upgrades: initialUpgrades,
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
      
      // Calculate new stats
      const newCoinsPerClick = state.coinsPerClick + upgrade.coinsPerClickBonus;
      const newCoinsPerSecond = state.coinsPerSecond + upgrade.coinsPerSecondBonus;
      
      // Update the upgrade
      const updatedUpgrade = {
        ...upgrade,
        level: upgrade.level + 1,
        cost: Math.floor(upgrade.baseCost * Math.pow(1.15, upgrade.level + 1))
      };
      
      // Create a new upgrades array
      const newUpgrades = [...state.upgrades];
      newUpgrades[upgradeIndex] = updatedUpgrade;
      
      // Unlock next upgrade if needed
      if (upgrade.id === 'click-power' && upgrade.level === 4 && !state.upgrades.find(u => u.id === 'efficiency')?.unlocked) {
        const efficiencyIndex = newUpgrades.findIndex(u => u.id === 'efficiency');
        if (efficiencyIndex !== -1) {
          newUpgrades[efficiencyIndex] = { ...newUpgrades[efficiencyIndex], unlocked: true };
        }
      }
      
      if (upgrade.id === 'auto-clicker' && upgrade.level === 9 && !state.upgrades.find(u => u.id === 'multiplier')?.unlocked) {
        const multiplierIndex = newUpgrades.findIndex(u => u.id === 'multiplier');
        if (multiplierIndex !== -1) {
          newUpgrades[multiplierIndex] = { ...newUpgrades[multiplierIndex], unlocked: true };
        }
      }
      
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
