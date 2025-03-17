import React, { createContext, useContext, useReducer, useEffect, ReactNode } from 'react';
import StorageService from '@/services/storageService';
import { INVENTORY_ITEMS } from '@/data/inventoryItems';
import { managers } from '@/data/managers';
import { artifacts } from '@/data/artifacts';
import { upgradesList, type Upgrade } from '@/data/upgrades';
import { initialAbilities, type Ability } from '@/data/abilities';
import { createAchievements, type Achievement } from '@/data/achievements';
import { calculateMaxPurchaseAmountUtil } from '@/utils/gameLogic';

export interface InventoryItem {
  id: string;
  name: string;
  description: string;
  quantity: number;
  usable?: boolean;
  effect?: {
    type: string;
    value: number;
    duration?: number;
  };
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
  boosts: Record<string, { active: boolean; remainingTime?: number; remainingUses?: number; purchased: number }>;
  hasNoAds: boolean;
  // Added profile fields
  username: string;
  title?: string;
  userId?: string;
}

type GameAction =
  | { type: 'CLICK' }
  | { type: 'ADD_COINS'; amount: number }
  | { type: 'ADD_ESSENCE'; amount: number }
  | { type: 'BUY_UPGRADE'; upgradeId: string; amount: number }
  | { type: 'TOGGLE_AUTO_BUY' }
  | { type: 'TOGGLE_AUTO_TAP' }
  | { type: 'SET_INCOME_MULTIPLIER'; multiplier: number }
  | { type: 'PRESTIGE' }
  | { type: 'BUY_MANAGER'; managerId: string }
  | { type: 'BUY_ARTIFACT'; artifactId: string }
  | { type: 'UNLOCK_ABILITY'; abilityId: string }
  | { type: 'UNLOCK_PERK'; perkId: string }
  | { type: 'CHECK_ACHIEVEMENTS' }
  | { type: 'TICK' }
  | { type: 'USE_ITEM'; itemId: string }
  | { type: 'ADD_ITEM'; item: InventoryItem }
  | { type: 'REMOVE_ITEM'; itemId: string }
  | { type: 'ADD_GEMS'; amount: number }
  | { type: 'ACTIVATE_BOOST'; boostId: string }
  | { type: 'RESTORE_STATE_PROPERTY'; property: keyof GameState; value: any }
  | { type: 'UPDATE_USERNAME'; username: string }; // Added for profile

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
  boosts: {},
  hasNoAds: false,
  // Added profile fields
  username: "Cosmic Explorer",
  title: "space_pilot",
  userId: Math.floor(10000000 + Math.random() * 90000000).toString(),
};

const gameReducer = (state: GameState, action: GameAction): GameState => {
  switch (action.type) {
    case 'CLICK':
      return {
        ...state,
        coins: state.coins + state.coinsPerClick,
        totalClicks: state.totalClicks + 1,
        totalEarned: state.totalEarned + state.coinsPerClick,
      };
    case 'ADD_COINS':
      return {
        ...state,
        coins: state.coins + action.amount,
        totalEarned: state.totalEarned + action.amount,
      };
    case 'ADD_ESSENCE':
      return { ...state, essence: state.essence + action.amount };
    case 'BUY_UPGRADE': {
      const upgrade = state.upgrades.find(u => u.id === action.upgradeId);
      if (!upgrade || upgrade.level >= upgrade.maxLevel) return state;

      const cost = upgrade.baseCost * Math.pow(1.15, upgrade.level) * action.amount;
      if (state.coins < cost) return state;

      const newUpgrades = state.upgrades.map(u =>
        u.id === action.upgradeId
          ? { ...u, level: u.level + action.amount }
          : u
      );

      let newCoinsPerClick = state.coinsPerClick;
      let newCoinsPerSecond = state.coinsPerSecond;
      newUpgrades.forEach(u => {
        if (u.type === 'click') {
          newCoinsPerClick = 1 + newUpgrades.reduce((sum, up) => sum + (up.type === 'click' ? up.level * up.value : 0), 0);
        } else if (u.type === 'auto') {
          newCoinsPerSecond = newUpgrades.reduce((sum, up) => sum + (up.type === 'auto' ? up.level * up.value : 0), 0);
        }
      });

      return {
        ...state,
        coins: state.coins - cost,
        upgrades: newUpgrades,
        coinsPerClick: newCoinsPerClick,
        coinsPerSecond: newCoinsPerSecond,
      };
    }
    case 'TOGGLE_AUTO_BUY':
      return { ...state, autoBuy: !state.autoBuy };
    case 'TOGGLE_AUTO_TAP':
      return { ...state, autoTap: !state.autoTap };
    case 'SET_INCOME_MULTIPLIER':
      return { ...state, incomeMultiplier: action.multiplier };
    case 'PRESTIGE':
      return {
        ...initialState,
        essence: state.essence + Math.floor(state.coins / 1000),
        prestigeCount: state.prestigeCount + 1,
        username: state.username, // Preserve profile fields
        title: state.title,
        userId: state.userId,
      };
    case 'BUY_MANAGER':
      if (state.ownedManagers.includes(action.managerId) || state.essence < managers[action.managerId].cost) return state;
      return {
        ...state,
        essence: state.essence - managers[action.managerId].cost,
        ownedManagers: [...state.ownedManagers, action.managerId],
      };
    case 'BUY_ARTIFACT':
      if (state.ownedArtifacts.includes(action.artifactId) || state.essence < artifacts[action.artifactId].cost) return state;
      return {
        ...state,
        essence: state.essence - artifacts[action.artifactId].cost,
        ownedArtifacts: [...state.ownedArtifacts, action.artifactId],
      };
    case 'UNLOCK_ABILITY':
      if (state.abilities.find(a => a.id === action.abilityId)?.unlocked) return state;
      return {
        ...state,
        abilities: state.abilities.map(a =>
          a.id === action.abilityId ? { ...a, unlocked: true } : a
        ),
      };
    case 'UNLOCK_PERK':
      if (state.unlockedPerks.includes(action.perkId)) return state;
      return {
        ...state,
        unlockedPerks: [...state.unlockedPerks, action.perkId],
      };
    case 'CHECK_ACHIEVEMENTS':
      const updatedAchievements = state.achievements.map(ach => {
        if (!state.achievementsChecked[ach.id] && ach.condition(state)) {
          return { ...ach, completed: true };
        }
        return ach;
      });
      const newChecked = updatedAchievements.reduce((acc, ach) => {
        if (ach.completed) acc[ach.id] = true;
        return acc;
      }, { ...state.achievementsChecked });
      return {
        ...state,
        achievements: updatedAchievements,
        achievementsChecked: newChecked,
      };
    case 'TICK': {
      let newState = { ...state };
      if (state.autoTap) {
        newState.coins += state.coinsPerClick;
        newState.totalClicks += 1;
        newState.totalEarned += state.coinsPerClick;
      }
      newState.coins += state.coinsPerSecond * 0.1;
      newState.totalEarned += state.coinsPerSecond * 0.1;

      if (newState.autoBuy) {
        const affordableUpgrades = newState.upgrades
          .filter(u => u.level < u.maxLevel)
          .map(u => ({
            ...u,
            cost: u.baseCost * Math.pow(1.15, u.level),
            valuePerCost: u.value / (u.baseCost * Math.pow(1.15, u.level)),
          }))
          .sort((a, b) => b.valuePerCost - a.valuePerCost);

        for (const upgrade of affordableUpgrades) {
          if (newState.coins >= upgrade.cost) {
            newState.coins -= upgrade.cost;
            newState.upgrades = newState.upgrades.map(u =>
              u.id === upgrade.id ? { ...u, level: u.level + 1 } : u
            );
            if (upgrade.type === 'click') {
              newState.coinsPerClick += upgrade.value;
            } else if (upgrade.type === 'auto') {
              newState.coinsPerSecond += upgrade.value;
            }
            break;
          }
        }
      }

      const newBoosts = { ...state.boosts };
      Object.keys(newBoosts).forEach(boostId => {
        const boost = newBoosts[boostId];
        if (boost.active && boost.remainingTime !== undefined) {
          boost.remainingTime -= 0.1;
          if (boost.remainingTime <= 0) {
            boost.active = false;
          }
        }
      });

      return { ...newState, boosts: newBoosts };
    }
    case 'USE_ITEM': {
      const item = state.inventory.find(i => i.id === action.itemId);
      if (!item || !item.usable || item.quantity <= 0) return state;
      return {
        ...state,
        inventory: state.inventory.map(i =>
          i.id === action.itemId ? { ...i, quantity: i.quantity - 1 } : i
        ),
      };
    }
    case 'ADD_ITEM':
      const existingItem = state.inventory.find(i => i.id === action.item.id);
      if (state.inventory.length >= state.inventoryCapacity && !existingItem) return state;
      if (existingItem) {
        return {
          ...state,
          inventory: state.inventory.map(i =>
            i.id === action.item.id ? { ...i, quantity: i.quantity + action.item.quantity } : i
          ),
        };
      }
      return {
        ...state,
        inventory: [...state.inventory, action.item],
      };
    case 'REMOVE_ITEM':
      return {
        ...state,
        inventory: state.inventory.filter(i => i.id !== action.itemId),
      };
    case 'ADD_GEMS':
      return { ...state, gems: state.gems + action.amount };
    case 'ACTIVATE_BOOST': {
      const boost = Object.values(INVENTORY_ITEMS).find(b => b.id === action.boostId);
      if (!boost || !boost.usable) return state;
      return {
        ...state,
        boosts: {
          ...state.boosts,
          [action.boostId]: {
            active: !!boost.effect?.duration,
            remainingTime: boost.effect?.duration,
            remainingUses: boost.effect?.type === "coinsPerClick" ? boost.effect?.duration : undefined,
            purchased: (state.boosts[action.boostId]?.purchased || 0) + 1,
          },
        },
      };
    }
    case 'RESTORE_STATE_PROPERTY':
      return { ...state, [action.property]: action.value };
    case 'UPDATE_USERNAME': // Added for profile
      return { ...state, username: action.username };
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
  buyUpgrade: (upgradeId: string, amount: number) => void;
  toggleAutoBuy: () => void;
  toggleAutoTap: () => void;
  setIncomeMultiplier: (multiplier: number) => void;
  prestige: () => void;
  buyManager: (managerId: string) => void;
  buyArtifact: (artifactId: string) => void;
  unlockAbility: (abilityId: string) => void;
  unlockPerk: (perkId: string) => void;
  checkAchievements: () => void;
  calculateMaxPurchaseAmount: (upgradeId: string) => number;
  calculatePotentialEssenceReward: () => number;
  handleClick: () => void;
  useItem: (itemId: string) => void;
  addItem: (item: InventoryItem) => void;
  removeItem: (itemId: string) => void;
  addGems: (amount: number) => void;
  activateBoost: (boostId: string) => void;
  updateUsername: (username: string) => void; // Added for profile
}

const GameContext = createContext<GameContextType | undefined>(undefined);

export const GameProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [state, dispatch] = useReducer(gameReducer, initialState);

  useEffect(() => {
    const loadSavedGameState = async () => {
      const savedState = await StorageService.loadGameState();
      if (savedState) {
        const restoredState: GameState = {
          ...initialState,
          ...savedState,
          upgrades: savedState.upgrades.map((u: Upgrade) => ({
            ...upgradesList.find(up => up.id === u.id)!,
            level: u.level,
          })),
          abilities: savedState.abilities.map((a: Ability) => ({
            ...initialAbilities.find(ab => ab.id === a.id)!,
            unlocked: a.unlocked,
          })),
          achievements: savedState.achievements.map((a: Achievement) => ({
            ...createAchievements().find(ach => ach.id === a.id)!,
            completed: a.completed,
          })),
        };
        for (const key in restoredState) {
          if (key !== 'abilities' && key !== 'upgrades' && key !== 'achievements') {
            dispatch({
              type: 'RESTORE_STATE_PROPERTY',
              property: key as keyof GameState,
              value: restoredState[key as keyof GameState],
            });
          }
        }
        restoredState.upgrades.forEach(upgrade => {
          dispatch({ type: 'BUY_UPGRADE', upgradeId: upgrade.id, amount: upgrade.level });
        });
      }
    };
    loadSavedGameState();
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      dispatch({ type: 'TICK' });
    }, 100);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    StorageService.saveGameState(state);
  }, [state]);

  const click = () => dispatch({ type: 'CLICK' });
  const addCoins = (amount: number) => dispatch({ type: 'ADD_COINS', amount });
  const addEssence = (amount: number) => dispatch({ type: 'ADD_ESSENCE', amount });
  const buyUpgrade = (upgradeId: string, amount: number) =>
    dispatch({ type: 'BUY_UPGRADE', upgradeId, amount });
  const toggleAutoBuy = () => dispatch({ type: 'TOGGLE_AUTO_BUY' });
  const toggleAutoTap = () => dispatch({ type: 'TOGGLE_AUTO_TAP' });
  const setIncomeMultiplier = (multiplier: number) =>
    dispatch({ type: 'SET_INCOME_MULTIPLIER', multiplier });
  const prestige = () => dispatch({ type: 'PRESTIGE' });
  const buyManager = (managerId: string) => dispatch({ type: 'BUY_MANAGER', managerId });
  const buyArtifact = (artifactId: string) => dispatch({ type: 'BUY_ARTIFACT', artifactId });
  const unlockAbility = (abilityId: string) => dispatch({ type: 'UNLOCK_ABILITY', abilityId });
  const unlockPerk = (perkId: string) => dispatch({ type: 'UNLOCK_PERK', perkId });
  const checkAchievements = () => dispatch({ type: 'CHECK_ACHIEVEMENTS' });
  const calculateMaxPurchaseAmount = (upgradeId: string) =>
    calculateMaxPurchaseAmountUtil(state.coins, state.upgrades.find(u => u.id === upgradeId));
  const calculatePotentialEssenceReward = () => Math.floor(state.coins / 1000);
  const handleClick = () => {
    click();
    checkAchievements();
  };
  const useItem = (itemId: string) => dispatch({ type: 'USE_ITEM', itemId });
  const addItem = (item: InventoryItem) => dispatch({ type: 'ADD_ITEM', item });
  const removeItem = (itemId: string) => dispatch({ type: 'REMOVE_ITEM', itemId });
  const addGems = (amount: number) => dispatch({ type: 'ADD_GEMS', amount });
  const activateBoost = (boostId: string) => dispatch({ type: 'ACTIVATE_BOOST', boostId });
  const updateUsername = (username: string) => dispatch({ type: 'UPDATE_USERNAME', username }); // Added for profile

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
    addGems,
    activateBoost,
    updateUsername,
  };

  return <GameContext.Provider value={contextValue}>{children}</GameContext.Provider>;
};

export const useGame = () => {
  const context = useContext(GameContext);
  if (!context) throw new Error('useGame must be used within a GameProvider');
  return context;
};
