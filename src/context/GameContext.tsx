
import React, { createContext, useContext, useReducer, useEffect, useCallback } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { 
  GameStateType, 
  GameActionType, 
  InventoryItem, 
  mockTechTree, 
  mockManagers, 
  mockArtifacts, 
  mockAchievements, 
  mockLevelUpRewards,
  Ability
} from '@/utils/GameTypes';

// Define a mock reducer
const gameReducer = (state: GameStateType, action: GameActionType): GameStateType => {
  switch (action.type) {
    case 'LOAD_GAME':
      return { ...action.payload };
    case 'SET_COINS':
      return { ...state, coins: action.payload };
    case 'ADD_COINS':
      return { ...state, coins: state.coins + action.payload };
    // Add other cases as needed
    default:
      return state;
  }
};

// Initial game state
const initialGameState: GameStateType = {
  coins: 0,
  gems: 0,
  essence: 0,
  level: 1,
  xp: 0,
  xpCap: 100,
  prestigeCount: 0,
  abilities: [],
  techTree: [],
  managers: [],
  artifacts: [],
  achievements: [],
  ownedManagers: [],
  ownedArtifacts: [],
  inventory: [],
  skillPoints: 0,
  unlockedPerks: [],
  totalClicks: 0,
  totalEarned: 0,
  coinsPerClick: 1,
  coinsPerSecond: 0,
  upgrades: [],
  autoBuy: false,
  autoTap: false,
  incomeMultiplier: 1,
  inventoryCapacity: 50
};

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
  // Additional methods needed by components
  unlockPerk: (perkId: string, parentId: string) => void;
  toggleAutoTap: () => void;
  setIncomeMultiplier: (multiplier: number) => void;
  buyUpgrade: (upgradeId: string) => void;
  toggleAutoBuy: () => void;
  calculateMaxPurchaseAmount: (cost: number) => number;
  click: () => void;
  handleClick: () => void;
}

// Create the GameContext with initial values
const GameContext = createContext<GameContextType>({
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
  unlockPerk: () => {},
  toggleAutoTap: () => {},
  setIncomeMultiplier: () => {},
  buyUpgrade: () => {},
  toggleAutoBuy: () => {},
  calculateMaxPurchaseAmount: () => 0,
  click: () => {},
  handleClick: () => {}
});

// GameProvider component
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
      // Initialize with default values
      dispatch({ type: 'SET_COINS', payload: 0 });
      // Add other initializations as needed
    }
  }, []);

  useEffect(() => {
    // Save game state to localStorage whenever it changes
    localStorage.setItem('gameState', JSON.stringify(state));
  }, [state]);

  // Define callback methods
  const addCoins = useCallback((amount: number) => {
    dispatch({ type: 'ADD_COINS', payload: amount });
  }, []);

  const addGems = useCallback((amount: number) => {
    dispatch({ type: 'ADD_GEMS', payload: amount });
  }, []);

  const addEssence = useCallback((amount: number) => {
    dispatch({ type: 'ADD_ESSENCE', payload: amount });
  }, []);

  const calculatePotentialEssenceReward = useCallback(() => {
    // Placeholder formula
    return Math.floor(state.coins / 1000);
  }, [state.coins]);

  const prestige = useCallback(() => {
    // Reset relevant game state properties upon prestige
    dispatch({ type: 'SET_COINS', payload: 0 });
    dispatch({ type: 'SET_LEVEL', payload: 1 });
    dispatch({ type: 'SET_XP', payload: 0 });
    dispatch({ type: 'SET_XP_CAP', payload: 100 });
    dispatch({ type: 'SET_PRESTIGE_COUNT', payload: state.prestigeCount + 1 });
    dispatch({ type: 'ADD_ESSENCE', payload: calculatePotentialEssenceReward() });
    // Add other resets as needed
  }, [state.prestigeCount, calculatePotentialEssenceReward]);

  const levelUp = useCallback(() => {
    const levelUpReward = mockLevelUpRewards[state.level];
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
    }
    dispatch({ type: 'LEVEL_UP' });
  }, [state.level, addCoins, addEssence, addGems]);

  const unlockAbility = useCallback((abilityId: string) => {
    dispatch({ type: 'UNLOCK_ABILITY', payload: abilityId });
  }, []);

  const buyManager = useCallback((managerId: string) => {
    dispatch({ type: 'BUY_MANAGER', payload: managerId });
  }, []);

  const buyArtifact = useCallback((artifactId: string) => {
    dispatch({ type: 'BUY_ARTIFACT', payload: artifactId });
  }, []);

  const addItem = useCallback((item: InventoryItem) => {
    dispatch({ type: 'ADD_INVENTORY_ITEM', payload: item });
  }, []);

  const useItem = useCallback((itemId: string) => {
    const item = state.inventory?.find(item => item.id === itemId);
    if (!item) return;

    if (item.usable) {
      // Apply the item's effect if it exists
      if (item.effect) {
        // Check necessary to prevent TypeScript errors
        if ('type' in item.effect) {
          switch (item.effect.type) {
            case 'coinMultiplier':
              // Handle coin multiplier effect
              break;
            // ... handle other effect types
          }
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
  }, [state.inventory]);

  // Additional methods needed by components
  const unlockPerk = useCallback((perkId: string, parentId: string) => {
    // Placeholder implementation
    console.log(`Unlocking perk ${perkId} for ${parentId}`);
  }, []);

  const toggleAutoTap = useCallback(() => {
    // Placeholder implementation
    console.log('Toggling auto tap');
  }, []);

  const setIncomeMultiplier = useCallback((multiplier: number) => {
    // Placeholder implementation
    console.log(`Setting income multiplier to ${multiplier}`);
  }, []);

  const buyUpgrade = useCallback((upgradeId: string) => {
    // Placeholder implementation
    console.log(`Buying upgrade ${upgradeId}`);
  }, []);

  const toggleAutoBuy = useCallback(() => {
    // Placeholder implementation
    console.log('Toggling auto buy');
  }, []);

  const calculateMaxPurchaseAmount = useCallback((cost: number) => {
    // Placeholder implementation
    return Math.floor(state.coins / cost);
  }, [state.coins]);

  const click = useCallback(() => {
    // Placeholder implementation
    console.log('Clicked');
  }, []);

  const handleClick = useCallback(() => {
    // Placeholder implementation
    console.log('Handled click');
  }, []);

  // Create context value
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
    unlockPerk,
    toggleAutoTap,
    setIncomeMultiplier,
    buyUpgrade,
    toggleAutoBuy,
    calculateMaxPurchaseAmount,
    click,
    handleClick
  };

  return (
    <GameContext.Provider value={value}>
      {children}
    </GameContext.Provider>
  );
};

// Custom hook to use the GameContext
export const useGame = () => {
  const context = useContext(GameContext);
  if (!context) {
    throw new Error('useGame must be used within a GameProvider');
  }
  return context;
};

// Re-export types for backwards compatibility
export type { GameStateType, GameActionType, Ability, InventoryItem };
export { initialGameState, gameReducer };
