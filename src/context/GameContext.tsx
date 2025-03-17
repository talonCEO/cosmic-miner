import React, { createContext, useContext, useReducer, useEffect, useCallback } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { useMutation, useQuery } from '@tanstack/react-query';
import { useSearchParams } from 'react-router-dom';
import { toast } from "sonner";
import {
  writeBatch,
  doc,
  getDoc,
  setDoc,
  updateDoc,
  increment,
  arrayUnion,
  arrayRemove,
  Timestamp,
} from 'firebase/firestore';
import { db } from '@/firebase';
import { useAd } from '@/context/AdContext';
import { handleLevelUp } from '@/utils/levelUpHandler';
import { InventoryItem, INVENTORY_ITEMS } from '@/components/menu/types';
import { Ability } from '@/components/menu/types';
import { Perk } from '@/utils/types';
import { BoostEffect } from '@/types/boostTypes';

// Define the initial state
interface GameState {
  uid: string | null;
  initialized: boolean;
  coins: number;
  gems: number;
  essence: number;
  skillPoints: number;
  totalEarned: number;
  coinsPerClickBase: number;
  coinsPerClickMultiplier: number;
  coinsPerSecondBase: number;
  coinsPerSecondMultiplier: number;
  lastLogin: number;
  tapUpgradeCost: number;
  passiveUpgradeCost: number;
  critChance: number;
  critMultiplier: number;
  inventory: InventoryItem[];
  inventoryCapacity: number;
  achievements: { id: string; timestamp: number }[];
  activeBoosts: BoostEffect[];
  equippedAbilities: string[];
  unlockedAbilities: string[];
  unlockedPerks: string[];
  managerCount: number;
  artifactCount: number;
  totalTaps: number;
  totalPassive: number;
  prestigeCount: number;
  title: string;
  portrait: string;
  hasNoAds: boolean;
  autoBuyUnlocked: boolean;
  elementLevels: { [elementId: string]: number };
  elementUpgradeCosts: { [elementId: string]: number };
  settings: {
    musicEnabled: boolean;
    soundEnabled: boolean;
  };
  leaderboardName: string;
}

const initialState: GameState = {
  uid: null,
  initialized: false,
  coins: 0,
  gems: 50,
  essence: 0,
  skillPoints: 0,
  totalEarned: 0,
  coinsPerClickBase: 1,
  coinsPerClickMultiplier: 1,
  coinsPerSecondBase: 0,
  coinsPerSecondMultiplier: 1,
  lastLogin: Date.now(),
  tapUpgradeCost: 25,
  passiveUpgradeCost: 100,
  critChance: 0.1,
  critMultiplier: 2,
  inventory: [],
  inventoryCapacity: 25,
  achievements: [],
  activeBoosts: [],
  equippedAbilities: [],
  unlockedAbilities: [],
  unlockedPerks: [],
  managerCount: 0,
  artifactCount: 0,
  totalTaps: 0,
  totalPassive: 0,
  prestigeCount: 0,
  title: 'space_pilot',
  portrait: 'default',
  hasNoAds: false,
  autoBuyUnlocked: false,
  elementLevels: {
    'hydrogen': 0,
    'helium': 0,
    'lithium': 0,
    'beryllium': 0,
    'boron': 0,
    'carbon': 0,
    'nitrogen': 0,
    'oxygen': 0,
    'fluorine': 0,
    'neon': 0,
  },
  elementUpgradeCosts: {
    'hydrogen': 10,
    'helium': 25,
    'lithium': 50,
    'beryllium': 100,
    'boron': 250,
    'carbon': 500,
    'nitrogen': 1000,
    'oxygen': 2500,
    'fluorine': 5000,
    'neon': 10000,
  },
  settings: {
    musicEnabled: true,
    soundEnabled: true,
  },
  leaderboardName: '',
};

// Define the action types
type GameAction =
  | { type: 'SET_UID'; uid: string | null }
  | { type: 'RESTORE_STATE'; state: GameState }
  | { type: 'RESTORE_STATE_PROPERTY'; property: keyof GameState; value: any }
  | { type: 'EARN_COINS'; amount: number }
  | { type: 'SPEND_COINS'; amount: number }
  | { type: 'ADD_GEMS'; amount: number }
  | { type: 'SET_LEADERBOARD_NAME'; name: string }
  | { type: 'INCREMENT_TAPS'; amount: number }
  | { type: 'INCREMENT_PASSIVE'; amount: number }
  | { type: 'RESET_GAME' }
  | { type: 'UPDATE_SETTING'; setting: keyof GameState['settings']; value: boolean }
  | { type: 'ACTIVATE_BOOST'; boostId: string; duration?: number; multiplier?: number; passiveBonus?: number }
  | { type: 'DEACTIVATE_BOOST'; boostId: string }
  | { type: 'ADD_INVENTORY_ITEM'; item: InventoryItem }
  | { type: 'USE_INVENTORY_ITEM'; itemId: string }
  | { type: 'REMOVE_INVENTORY_ITEM'; itemId: string; quantity: number }
  | { type: 'EQUIP_ABILITY'; abilityId: string }
  | { type: 'UNEQUIP_ABILITY'; abilityId: string }
  | { type: 'UNLOCK_ABILITY'; abilityId: string }
  | { type: 'UNLOCK_PERK'; perkId: string }
  | { type: 'ADD_ACHIEVEMENT'; achievementId: string }
  | { type: 'UPDATE_ELEMENT_LEVEL'; elementId: string }
  | { type: 'PRESTIGE' }
  | { type: 'UPDATE_PORTRAIT'; portrait: string }
  | { type: 'UPDATE_TITLE'; title: string };

// Create the context
const GameContext = createContext<{
  state: GameState;
  dispatch: React.Dispatch<GameAction>;
  earnCoins: (amount: number) => void;
  spendCoins: (amount: number) => void;
  addGems: (amount: number) => void;
  setLeaderboardName: (name: string) => void;
  incrementTaps: (amount: number) => void;
  incrementPassive: (amount: number) => void;
  resetGame: () => void;
  updateSetting: (setting: keyof GameState['settings'], value: boolean) => void;
  activateBoost: (boostId: string, duration?: number, multiplier?: number, passiveBonus?: number) => void;
  deactivateBoost: (boostId: string) => void;
  addItem: (item: InventoryItem) => void;
  useItem: (itemId: string) => void;
  removeItem: (itemId: string, quantity: number) => void;
  equipAbility: (abilityId: string) => void;
  unequipAbility: (abilityId: string) => void;
  unlockAbility: (abilityId: string) => void;
  unlockPerk: (perkId: string) => void;
  addAchievement: (achievementId: string) => void;
  updateElementLevel: (elementId: string) => void;
  prestige: () => void;
  updatePortrait: (portrait: string) => void;
  updateTitle: (title: string) => void;
} | undefined>(undefined);

// Create the reducer function
const gameReducer = (state: GameState, action: GameAction): GameState => {
  switch (action.type) {
    case 'SET_UID':
      return { ...state, uid: action.uid };
    case 'RESTORE_STATE':
      return { ...state, ...action.state, initialized: true };
    case 'RESTORE_STATE_PROPERTY':
      return { ...state, [action.property]: action.value };
    case 'EARN_COINS':
      return { ...state, coins: state.coins + action.amount, totalEarned: state.totalEarned + action.amount };
    case 'SPEND_COINS':
      return { ...state, coins: state.coins - action.amount };
    case 'ADD_GEMS':
      return { ...state, gems: state.gems + action.amount };
    case 'SET_LEADERBOARD_NAME':
      return { ...state, leaderboardName: action.name };
    case 'INCREMENT_TAPS':
      return { ...state, totalTaps: state.totalTaps + action.amount };
    case 'INCREMENT_PASSIVE':
      return { ...state, totalPassive: state.totalPassive + action.amount };
    case 'RESET_GAME':
      return { ...initialState, uid: state.uid, settings: state.settings, leaderboardName: state.leaderboardName, hasNoAds: state.hasNoAds, gems: state.gems };
    case 'UPDATE_SETTING':
      return { ...state, settings: { ...state.settings, [action.setting]: action.value } };
    case 'ACTIVATE_BOOST': {
      const boost = state.activeBoosts.find(b => b.id === action.boostId);
      const now = Date.now() / 1000; // seconds
      
      if (boost) {
        // If the boost exists, update its properties
        return {
          ...state,
          activeBoosts: state.activeBoosts.map(b =>
            b.id === action.boostId
              ? {
                ...b,
                duration: action.duration !== undefined ? action.duration : b.duration,
                multiplier: action.multiplier !== undefined ? action.multiplier : b.multiplier,
                passiveBonus: action.passiveBonus !== undefined ? action.passiveBonus : b.passiveBonus,
                activatedAt: now,
                remainingTime: action.duration,
              }
              : b
          ),
          boosts: {
            ...state.boosts,
            [action.boostId]: {
              ...(state.boosts[action.boostId] || { purchased: 0 }),
              purchased: (state.boosts[action.boostId]?.purchased || 0) + 1,
            },
          },
        };
      } else {
        // If the boost doesn't exist, create a new one
        const newBoost: BoostEffect = {
          id: action.boostId,
          duration: action.duration,
          multiplier: action.multiplier,
          passiveBonus: action.passiveBonus,
          activatedAt: now,
          remainingTime: action.duration,
        };
        return {
          ...state,
          activeBoosts: [...state.activeBoosts, newBoost],
          boosts: {
            ...state.boosts,
            [action.boostId]: {
              ...(state.boosts[action.boostId] || { purchased: 0 }),
              purchased: (state.boosts[action.boostId]?.purchased || 0) + 1,
            },
          },
        };
      }
    }
    case 'DEACTIVATE_BOOST':
      return {
        ...state,
        activeBoosts: state.activeBoosts.filter(boost => boost.id !== action.boostId),
      };
    case 'ADD_INVENTORY_ITEM':
      return {
        ...state,
        inventory: [...state.inventory, action.item],
      };
    case 'USE_INVENTORY_ITEM': {
      const item = state.inventory.find(item => item.id === action.itemId);
      if (!item) return state;
    
      // If the item is stackable, decrease quantity. Otherwise, remove it.
      const updatedInventory = item.stackable
        ? state.inventory.map(invItem =>
            invItem.id === action.itemId ? { ...invItem, quantity: invItem.quantity - 1 } : invItem
          ).filter(invItem => invItem.quantity > 0) // Remove if quantity is 0
        : state.inventory.filter(invItem => invItem.id !== action.itemId);
    
      return {
        ...state,
        inventory: updatedInventory,
      };
    }
    case 'REMOVE_INVENTORY_ITEM': {
      const itemToRemove = state.inventory.find(item => item.id === action.itemId);
      if (!itemToRemove) return state;
    
      let updatedInventory = [...state.inventory];
    
      if (itemToRemove.stackable) {
        // If the item is stackable, reduce the quantity or remove the item
        updatedInventory = updatedInventory.map(item => {
          if (item.id === action.itemId) {
            const newQuantity = item.quantity - action.quantity;
            return newQuantity > 0 ? { ...item, quantity: newQuantity } : null;
          }
          return item;
        }).filter(Boolean) as InventoryItem[]; // Remove null items after quantity reduction
      } else {
        // If the item is not stackable, remove all instances of it
        updatedInventory = updatedInventory.filter(item => item.id !== action.itemId);
      }
    
      return {
        ...state,
        inventory: updatedInventory,
      };
    }
    case 'EQUIP_ABILITY':
      return {
        ...state,
        equippedAbilities: [...state.equippedAbilities, action.abilityId],
      };
    case 'UNEQUIP_ABILITY':
      return {
        ...state,
        equippedAbilities: state.equippedAbilities.filter(id => id !== action.abilityId),
      };
    case 'UNLOCK_ABILITY':
      return {
        ...state,
        unlockedAbilities: [...state.unlockedAbilities, action.abilityId],
      };
    case 'UNLOCK_PERK':
      return {
        ...state,
        unlockedPerks: [...state.unlockedPerks, action.perkId],
      };
    case 'ADD_ACHIEVEMENT':
      return {
        ...state,
        achievements: [...state.achievements, { id: action.achievementId, timestamp: Date.now() }],
      };
    case 'UPDATE_ELEMENT_LEVEL':
      return {
        ...state,
        elementLevels: {
          ...state.elementLevels,
          [action.elementId]: (state.elementLevels[action.elementId] || 0) + 1,
        },
      };
    case 'PRESTIGE':
      return {
        ...initialState,
        uid: state.uid,
        gems: state.gems,
        prestigeCount: state.prestigeCount + 1,
        settings: state.settings,
        leaderboardName: state.leaderboardName,
        hasNoAds: state.hasNoAds,
      };
    case 'UPDATE_PORTRAIT':
      return {
        ...state,
        portrait: action.portrait,
      };
    case 'UPDATE_TITLE':
      return {
        ...state,
        title: action.title,
      };
    default:
      return state;
  }
};

// Create the provider component
interface GameProviderProps {
  children: React.ReactNode;
}

export const GameProvider: React.FC<GameProviderProps> = ({ children }) => {
  const [state, dispatch] = useReducer(gameReducer, initialState);
  const [searchParams] = useSearchParams();
  const { removeAds } = useAd();

  // Actions
  const earnCoins = useCallback((amount: number) => {
    dispatch({ type: 'EARN_COINS', amount });
  }, [dispatch]);

  const spendCoins = useCallback((amount: number) => {
    dispatch({ type: 'SPEND_COINS', amount });
  }, [dispatch]);

  const addGems = useCallback((amount: number) => {
    dispatch({ type: 'ADD_GEMS', amount });
  }, [dispatch]);

  const setLeaderboardName = useCallback((name: string) => {
    dispatch({ type: 'SET_LEADERBOARD_NAME', name });
  }, [dispatch]);

  const incrementTaps = useCallback((amount: number) => {
    dispatch({ type: 'INCREMENT_TAPS', amount });
  }, [dispatch]);

  const incrementPassive = useCallback((amount: number) => {
    dispatch({ type: 'INCREMENT_PASSIVE', amount });
  }, [dispatch]);

  const resetGame = useCallback(() => {
    dispatch({ type: 'RESET_GAME' });
  }, [dispatch]);

  const updateSetting = useCallback((setting: keyof GameState['settings'], value: boolean) => {
    dispatch({ type: 'UPDATE_SETTING', setting, value });
  }, [dispatch]);

  const activateBoost = useCallback((boostId: string, duration?: number, multiplier?: number, passiveBonus?: number) => {
    dispatch({ type: 'ACTIVATE_BOOST', boostId, duration, multiplier, passiveBonus });
  }, [dispatch]);

  const deactivateBoost = useCallback((boostId: string) => {
    dispatch({ type: 'DEACTIVATE_BOOST', boostId });
  }, [dispatch]);

  const addItem = useCallback((item: InventoryItem) => {
    dispatch({ type: 'ADD_INVENTORY_ITEM', item });
  }, [dispatch]);

  // Find the useItem function and update it with proper type guards

  // Inside the useItem function in GameContext.tsx
  const useItem = useCallback((itemId: string) => {
    const item = state.inventory.find(item => item.id === itemId);
    if (!item) return;

    // Add a type guard for items with effect property
    const hasEffect = (item: InventoryItem): item is InventoryItem & { effect: { type: string, value: number, duration?: number } } => {
      return 'effect' in item && typeof item.effect === 'object' && item.effect !== null;
    };

    // Only access effect properties if they exist
    if (hasEffect(item)) {
      // Now TypeScript knows item.effect exists and has the correct shape
      switch (item.effect.type) {
        case 'coinMultiplier':
          activateBoost(item.id, item.effect.duration, item.effect.value);
          break;
        case 'timeWarp':
          activateBoost(item.id, undefined, undefined, item.effect.value);
          break;
          // Add more cases as needed
      }
    }

    // Remove one from quantity or remove entirely if quantity reaches 0
    dispatch({
      type: 'USE_INVENTORY_ITEM',
      itemId
    });
  }, [dispatch, state.inventory, activateBoost]);

  const removeItem = useCallback((itemId: string, quantity: number) => {
    dispatch({ type: 'REMOVE_INVENTORY_ITEM', itemId, quantity });
  }, [dispatch]);

  const equipAbility = useCallback((abilityId: string) => {
    dispatch({ type: 'EQUIP_ABILITY', abilityId });
  }, [dispatch]);

  const unequipAbility = useCallback((abilityId: string) => {
    dispatch({ type: 'UNEQUIP_ABILITY', abilityId });
  }, [dispatch]);

  const unlockAbility = useCallback((abilityId: string) => {
    dispatch({ type: 'UNLOCK_ABILITY', abilityId });
  }, [dispatch]);

  const unlockPerk = useCallback((perkId: string) => {
    dispatch({ type: 'UNLOCK_PERK', perkId });
  }, [dispatch]);

  const addAchievement = useCallback((achievementId: string) => {
    dispatch({ type: 'ADD_ACHIEVEMENT', achievementId });
  }, [dispatch]);

  const updateElementLevel = useCallback((elementId: string) => {
    dispatch({ type: 'UPDATE_ELEMENT_LEVEL', elementId });
  }, [dispatch]);

  const updatePortrait = useCallback((portrait: string) => {
    dispatch({ type: 'UPDATE_PORTRAIT', portrait });
  }, [dispatch]);

  const updateTitle = useCallback((title: string) => {
    dispatch({ type: 'UPDATE_TITLE', title });
  }, [dispatch]);

  const prestige = useCallback(() => {
    dispatch({ type: 'PRESTIGE' });
  }, [dispatch]);

  // Firebase sync functions
  const {
    isLoading,
    mutate: saveGame,
  } = useMutation(async (gameState: GameState) => {
    if (!gameState.uid) {
      console.warn('Attempted to save game without a user ID.');
      return;
    }

    const userDocRef = doc(db, 'users', gameState.uid);
    await setDoc(userDocRef, {
      ...gameState,
      lastLogin: Timestamp.now(),
    });
  });

  const {
    isLoading: loadingInitialData,
    refetch: loadGame,
  } = useQuery(['loadGame', state.uid], async () => {
    if (!state.uid) {
      return;
    }

    const userDocRef = doc(db, 'users', state.uid);
    const docSnap = await getDoc(userDocRef);

    if (docSnap.exists()) {
      const savedData = docSnap.data() as GameState;
      
      // Convert lastLogin to a number (timestamp in milliseconds)
      const lastLoginTimestamp = savedData.lastLogin instanceof Timestamp ? savedData.lastLogin.toMillis() : Date.now();
      
      // Ensure elementLevels and elementUpgradeCosts are initialized
      const elementLevels = savedData.elementLevels || initialState.elementLevels;
      const elementUpgradeCosts = savedData.elementUpgradeCosts || initialState.elementUpgradeCosts;

      const restoredState: GameState = {
        ...initialState,
        ...savedData,
        lastLogin: lastLoginTimestamp,
        elementLevels,
        elementUpgradeCosts,
      };
      
      dispatch({ type: 'RESTORE_STATE', state: restoredState });
      return restoredState;
    } else {
      console.log("No such document!");
      return null;
    }
  }, {
    enabled: !!state.uid,
    onSuccess: (data) => {
      if (data) {
        console.log('Game loaded successfully');
      }
    },
    onError: (error) => {
      console.error('Failed to load game', error);
    },
  });

  // Function to claim ad rewards
  const claimAdReward = useCallback(async (rewardType: string, rewardAmount: number) => {
    if (!state.uid) {
      console.warn('No user ID found, cannot claim ad reward.');
      return;
    }

    const userDocRef = doc(db, 'users', state.uid);
    try {
      await updateDoc(userDocRef, {
        gems: increment(rewardAmount),
      });

      dispatch({ type: 'ADD_GEMS', amount: rewardAmount });
      toast.success(`Ad Reward Claimed!`, {
        description: `You have received ${rewardAmount} gems!`
      });
    } catch (error) {
      console.error("Error claiming ad reward:", error);
      toast.error("Failed to claim ad reward. Please try again.");
    }
  }, [dispatch, state.uid]);

  // Function to handle auto-claim gems from URL parameters
  useEffect(() => {
    const claimGemsFromParams = async () => {
      const gemsParam = searchParams.get('gems');
      if (gemsParam && state.uid) {
        const gemsAmount = parseInt(gemsParam, 10);
        if (!isNaN(gemsAmount) && gemsAmount > 0) {
          try {
            await claimAdReward('gems', gemsAmount);
            // Remove the 'gems' parameter from the URL
            searchParams.delete('gems');
            const newUrl = `${window.location.pathname}${searchParams.toString() ? '?' + searchParams.toString() : ''}`;
            window.history.replaceState({}, document.title, newUrl);
          } catch (error) {
            console.error("Error claiming gems from URL:", error);
          }
        }
      }
    };

    claimGemsFromParams();
  }, [searchParams, state.uid, claimAdReward]);

  // Save the game to localStorage on every state change (except for uid)
  useEffect(() => {
    if (state.uid && state.initialized) {
      saveGame(state);
    }
  }, [state, saveGame]);

  const contextValue = {
    state,
    dispatch,
    earnCoins,
    spendCoins,
    addGems,
    setLeaderboardName,
    incrementTaps,
    incrementPassive,
    resetGame,
    updateSetting,
    activateBoost,
    deactivateBoost,
    addItem,
    useItem,
    removeItem,
    equipAbility,
    unequipAbility,
    unlockAbility,
    unlockPerk,
    addAchievement,
    updateElementLevel,
    prestige,
    updatePortrait,
    updateTitle,
  };

  return (
    <GameContext.Provider value={contextValue}>
      {children}
    </GameContext.Provider>
  );
};

// Create the custom hook
const useGameContext = () => {
  const context = useContext(GameContext);
  if (context === undefined) {
    throw new Error('useGameContext must be used within a GameProvider');
  }
  return context;
};

export const useGame = () => {
  return useGameContext();
};
