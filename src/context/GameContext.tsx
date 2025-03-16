import React, { createContext, useContext, useReducer, useEffect, useCallback } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { initialGameState, gameReducer } from './GameReducer';
import { Ability, InventoryItem } from '@/components/menu/types';
import { initialTechTree } from '@/data/tech-tree';
import { initialManagers } from '@/data/managers';
import { initialArtifacts } from '@/data/artifacts';
import { initialAchievements } from '@/data/achievements';
import { levelUpRewards } from '@/data/levelUpRewards';

// Define the GameContext type
interface GameContextType {
  state: GameStateType;
  dispatch: React.Dispatch<GameActionType>;
  addCoins: (amount: number) => void;
  addGems: (amount: number) => void;
  addEssence: (amount: number) => void;
  prestige: () => void;
  levelUp: () => void;
  calculatePotentialEssenceReward: () => number;
  unlockAbility: (abilityId: string) => void;
  buyManager: (managerId: string) => void;
  buyArtifact: (artifactId: string) => void;
  addItem: (item: InventoryItem) => void;
  useItem: (itemId: string) => void;
}

// Define the initial context value
const initialContext: GameContextType = {
  state: initialGameState,
  dispatch: () => {},
  addCoins: () => {},
  addGems: () => {},
  addEssence: () => {},
  prestige: () => {},
  levelUp: () => {},
  calculatePotentialEssenceReward: () => 0,
  unlockAbility: () => {},
  buyManager: () => {},
  buyArtifact: () => {},
  addItem: () => {},
  useItem: () => {},
};

// Create the GameContext
const GameContext = createContext<GameContextType>(initialContext);

// Create a GameProvider component
interface GameProviderProps {
  children: React.ReactNode;
}

export const GameProvider: React.FC<GameProviderProps> = ({ children }) => {
  const [state, dispatch] = useReducer(gameReducer, initialGameState);

  useEffect(() => {
    // Load game state from localStorage on component mount
    const storedState = localStorage.getItem('gameState');
    if (storedState) {
      dispatch({ type: 'LOAD_GAME', payload: JSON.parse(storedState) });
    } else {
      // Initialize the game state with initial values
      dispatch({ type: 'SET_COINS', payload: 0 });
      dispatch({ type: 'SET_GEMS', payload: 0 });
      dispatch({ type: 'SET_ESSENCE', payload: 0 });
      dispatch({ type: 'SET_LEVEL', payload: 1 });
      dispatch({ type: 'SET_XP', payload: 0 });
      dispatch({ type: 'SET_XP_CAP', payload: 100 });
      dispatch({ type: 'SET_PRESTIGE_COUNT', payload: 0 });
      dispatch({ type: 'SET_TECH_TREE', payload: initialTechTree });
      dispatch({ type: 'SET_MANAGERS', payload: initialManagers });
      dispatch({ type: 'SET_ARTIFACTS', payload: initialArtifacts });
      dispatch({ type: 'SET_ACHIEVEMENTS', payload: initialAchievements });
      dispatch({ type: 'SET_INVENTORY', payload: [] });
    }
  }, []);

  useEffect(() => {
    // Save game state to localStorage whenever it changes
    localStorage.setItem('gameState', JSON.stringify(state));
  }, [state]);

  const addCoins = useCallback((amount: number) => {
    dispatch({ type: 'ADD_COINS', payload: amount });
  }, [dispatch]);

  const addGems = useCallback((amount: number) => {
    dispatch({ type: 'ADD_GEMS', payload: amount });
  }, [dispatch]);

  const addEssence = useCallback((amount: number) => {
    dispatch({ type: 'ADD_ESSENCE', payload: amount });
  }, [dispatch]);

  const prestige = useCallback(() => {
    // Reset relevant game state properties upon prestige
    dispatch({ type: 'SET_COINS', payload: 0 });
    dispatch({ type: 'SET_LEVEL', payload: 1 });
    dispatch({ type: 'SET_XP', payload: 0 });
		dispatch({ type: 'SET_XP_CAP', payload: 100 });
    dispatch({ type: 'SET_PRESTIGE_COUNT', payload: state.prestigeCount + 1 });
    dispatch({ type: 'ADD_ESSENCE', payload: calculatePotentialEssenceReward() });
    dispatch({ type: 'RESET_MANAGERS' });
    dispatch({ type: 'RESET_ARTIFACTS' });
  }, [dispatch, state.prestigeCount, calculatePotentialEssenceReward]);

  const levelUp = useCallback(() => {
    const levelUpReward = levelUpRewards[state.level];
    if (levelUpReward) {
      if (levelUpReward.coins) {
        addCoins(levelUpReward.coins);
      }
      if (levelUpReward.essence) {
        addEssence(levelUpReward.essence);
      }
      if (levelUpReward.gems) {
        addGems(levelUpReward.gems);
      }
      dispatch({ type: 'LEVEL_UP' });
    } else {
      // Handle case where there is no level up reward defined
      dispatch({ type: 'LEVEL_UP' });
    }
  }, [state.level, dispatch, addCoins, addEssence, addGems]);

  const calculatePotentialEssenceReward = useCallback(() => {
    // Placeholder formula for calculating essence reward
    // In a real game, this would be based on more complex factors
    return Math.floor(state.coins / 1000);
  }, [state.coins]);

  const unlockAbility = useCallback((abilityId: string) => {
    dispatch({ type: 'UNLOCK_ABILITY', payload: abilityId });
  }, [dispatch]);

  const buyManager = useCallback((managerId: string) => {
    dispatch({ type: 'BUY_MANAGER', payload: managerId });
  }, [dispatch]);

  const buyArtifact = useCallback((artifactId: string) => {
    dispatch({ type: 'BUY_ARTIFACT', payload: artifactId });
  }, [dispatch]);

  const addItem = useCallback((item: InventoryItem) => {
    dispatch({ type: 'ADD_INVENTORY_ITEM', payload: item });
  }, [dispatch]);

  // Update the useItem function to check if effect exists
  const useItem = (itemId: string) => {
    const item = state.inventory?.find(item => item.id === itemId);
    if (!item) return;

    if (item.usable) {
      // Apply the item's effect if it exists
      if (item.effect) {
        switch (item.effect.type) {
          case 'coinMultiplier':
            // Handle coin multiplier effect
            if (item.effect.duration) {
              // Apply temporary effect
            }
            break;
          // ... handle other effect types
        }
      }

      // For consumable items, reduce quantity
      if (item.quantity > 1) {
        // Update the item's quantity
        dispatch({
          type: 'UPDATE_INVENTORY_ITEM',
          payload: {
            ...item,
            quantity: item.quantity - 1
          }
        });
      } else {
        // Remove the item if it's the last one
        dispatch({
          type: 'REMOVE_INVENTORY_ITEM',
          payload: item.id
        });
      }
    }
  };

  const value: GameContextType = {
    state,
    dispatch,
    addCoins,
    addGems,
    addEssence,
    prestige,
    levelUp,
    calculatePotentialEssenceReward,
    unlockAbility,
    buyManager,
    buyArtifact,
    addItem,
    useItem,
  };

  return (
    <GameContext.Provider value={value}>
      {children}
    </GameContext.Provider>
  );
};

// Create a custom hook to use the GameContext
export const useGame = () => {
  const context = useContext(GameContext);
  if (!context) {
    throw new Error('useGame must be used within a GameProvider');
  }
  return context;
};

// Define the GameState type
export type GameStateType = {
  coins: number;
  gems: number;
  essence: number;
  level: number;
  xp: number;
  xpCap: number;
  prestigeCount: number;
  abilities: Ability[];
  techTree: any;
  managers: any;
  artifacts: any;
  achievements: any;
  ownedManagers: string[];
  ownedArtifacts: string[];
  inventory: InventoryItem[];
  boosts?: {
    [boostId: string]: {
      purchased: number;
    };
  };
};

// Define the GameAction type
export type GameActionType =
  | { type: 'LOAD_GAME', payload: GameStateType }
  | { type: 'SET_COINS', payload: number }
  | { type: 'ADD_COINS', payload: number }
  | { type: 'SET_GEMS', payload: number }
  | { type: 'ADD_GEMS', payload: number }
  | { type: 'SET_ESSENCE', payload: number }
  | { type: 'ADD_ESSENCE', payload: number }
  | { type: 'SET_LEVEL', payload: number }
  | { type: 'LEVEL_UP' }
  | { type: 'SET_XP', payload: number }
  | { type: 'ADD_XP', payload: number }
	| { type: 'SET_XP_CAP', payload: number }
  | { type: 'SET_PRESTIGE_COUNT', payload: number }
  | { type: 'UNLOCK_ABILITY', payload: string }
  | { type: 'SET_TECH_TREE', payload: any }
  | { type: 'SET_MANAGERS', payload: any }
  | { type: 'BUY_MANAGER', payload: string }
  | { type: 'RESET_MANAGERS' }
  | { type: 'SET_ARTIFACTS', payload: any }
  | { type: 'BUY_ARTIFACT', payload: string }
  | { type: 'RESET_ARTIFACTS' }
  | { type: 'SET_ACHIEVEMENTS', payload: any }
  | { type: 'ADD_INVENTORY_ITEM', payload: InventoryItem }
  | { type: 'UPDATE_INVENTORY_ITEM', payload: InventoryItem }
  | { type: 'REMOVE_INVENTORY_ITEM', payload: string }
  | { type: 'SET_INVENTORY', payload: InventoryItem[] };
