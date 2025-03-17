
import React, { createContext, useState, useContext, useEffect, useCallback } from 'react';
import { useToast } from '@/hooks/use-toast';
import { useAdContext } from './AdContext';

// Define types for the game state
export interface Achievement {
  id: string;
  name: string;
  description: string;
  unlocked: boolean;
  checkCondition: (state: GameState) => boolean;
}

export interface Upgrade {
  id: string;
  name: string;
  description: string;
  baseCost: number;
  costMultiplier: number;
  level: number;
  cost: number;
  maxLevel: number;
  baseValue: number;
  growthRate: number;
  category: string;
  unlocked: boolean;
  icon?: string;
  coinsPerClickBonus?: number;
  coinsPerSecondBonus?: number;
  multiplierBonus?: number;
  unlocksAt?: { upgradeId: string; level: number };
}

export interface Ability {
  id: string;
  name: string;
  description: string;
  unlocked: boolean;
  cost: number;
  icon: React.ReactNode;
  requiredAbilities: string[];
  row: number;
  column: number;
  cooldown?: number;
  duration?: number;
  effect?: string;
}

export interface BoostEffect {
  id: string;
  type: string;
  value: number;
  duration?: number;
  activatedAt?: number;
  remainingTime?: number;
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
  prestigeCount: number;
  incomeMultiplier: number;
  tapPowerMultiplier: number;
  skillPoints: number;
  nameChangeCount?: number;
  gems: number;
  abilities: Ability[];
  unlockedPerks: string[];
  achievements: Achievement[];
  title: string;
  portrait: string;
  boosts: Record<string, { purchased: number }>;
  inventoryCapacity: number;
  hasNoAds: boolean;
  managers: any[];
  artifacts: any[];
  inventory: any[];
  activeBoosts: BoostEffect[];
  username?: string;
  userId?: string;
}

export interface GameContextType {
  coins: number;
  gems: number;
  addCoins: (amount: number) => void;
  removeCoins: (amount: number) => void;
  totalPassiveIncome: number;
  setTotalPassiveIncome: (income: number) => void;
  clickPower: number;
  setClickPower: (power: number) => void;
  prestigeLevel: number;
  setPrestigeLevel: (level: number) => void;
  prestigeMultiplier: number;
  setPrestigeMultiplier: (multiplier: number) => void;
  formatNumber: (number: number) => string;
  totalCoinsEarned: number;
  setTotalCoinsEarned: (coins: number) => void;
  totalTaps: number;
  setTotalTaps: (taps: number) => void;
  incomeMultiplier: number;
  setIncomeMultiplier: (multiplier: number) => void;
  tapPowerMultiplier: number;
  setTapPowerMultiplier: (multiplier: number) => void;
  addGems: (amount: number) => void;
  calculateClickPower: () => number;
  totalIncomePerSecond: number;
}

// Create both the traditional context and a hook-based context
const GameContext = createContext<GameContextType | undefined>(undefined);

// For components that need to access or update the full game state
export interface UseGameReturnType {
  state: GameState;
  dispatch: React.Dispatch<any>;
  addCoins: (amount: number) => void;
  removeCoins: (amount: number) => void;
  addGems: (amount: number) => void;
  addEssence: (amount: number) => void;
  prestige: () => void;
  calculatePotentialEssenceReward: () => number;
  buyManager: (managerId: string) => void;
  buyArtifact: (artifactId: string) => void;
  unlockPerk: (perkId: string, parentId: string) => void;
  toggleAutoTap: () => void;
  setIncomeMultiplier: (multiplier: number) => void;
  updatePortrait: (portraitId: string) => void;
  updateTitle: (titleId: string) => void;
  calculateTotalIncomePerSecond: () => number;
  formatNumber: (number: number) => string;
  addItem: (item: any) => void;
  useItem: (itemId: string) => void;
  buyUpgrade: (upgradeId: string, quantity: number) => void;
  toggleAutoBuy: () => void;
  calculateMaxPurchaseAmount: (upgradeId: string) => number;
  activateBoost: (boostId: string, duration?: number, value?: number, immediateValue?: number) => void;
  updateUsername: (name: string) => void;
  handleClick: (value: number) => void;
  unlockAbility: (abilityId: string) => void;
}

const GameStateContext = createContext<UseGameReturnType | undefined>(undefined);

export const GameProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [coins, setCoins] = useState(0);
  const [gems, setGems] = useState(0);
  const [totalPassiveIncome, setTotalPassiveIncome] = useState(1);
  const [clickPower, setClickPower] = useState(1);
  const [prestigeLevel, setPrestigeLevel] = useState(0);
  const [prestigeMultiplier, setPrestigeMultiplier] = useState(1);
  const [totalCoinsEarned, setTotalCoinsEarned] = useState(0);
  const [totalTaps, setTotalTaps] = useState(0);
  const [incomeMultiplier, setIncomeMultiplier] = useState(1);
  const [tapPowerMultiplier, setTapPowerMultiplier] = useState(1);
  const [totalIncomePerSecond, setTotalIncomePerSecond] = useState(1);
  const { toast } = useToast();
  const { isBoostActive } = useAdContext();

  // Mock full game state for the useGame hook
  const gameState: GameState = {
    coins,
    gems,
    coinsPerClick: clickPower,
    coinsPerSecond: totalPassiveIncome,
    upgrades: [],
    totalClicks: totalTaps,
    totalEarned: totalCoinsEarned,
    autoBuy: false,
    autoTap: false,
    essence: 0,
    ownedManagers: [],
    ownedArtifacts: [],
    prestigeCount: prestigeLevel,
    incomeMultiplier,
    tapPowerMultiplier,
    skillPoints: 0,
    abilities: [],
    unlockedPerks: [],
    achievements: [],
    title: 'novice',
    portrait: 'default',
    boosts: {},
    inventoryCapacity: 20,
    hasNoAds: false,
    managers: [],
    artifacts: [],
    inventory: [],
    activeBoosts: [],
    username: 'Player',
    userId: '12345678',
  };

  // Calculate the actual click power based on all multipliers
  const calculateClickPower = () => {
    const baseClickPower = clickPower * prestigeMultiplier;
    return baseClickPower * tapPowerMultiplier;
  };

  // Calculate total income per second with all multipliers applied
  const calculateTotalIncomePerSecond = () => {
    return totalPassiveIncome * incomeMultiplier * prestigeMultiplier;
  };

  useEffect(() => {
    if (isBoostActive) {
      toast({
        title: "Boost Active",
        description: "Your income boost is active!",
      });
    }
  }, [isBoostActive, toast]);

  useEffect(() => {
    setTotalIncomePerSecond(calculateTotalIncomePerSecond());
  }, [totalPassiveIncome, incomeMultiplier, prestigeMultiplier]);

  const addCoins = (amount: number) => {
    setCoins((prevCoins) => prevCoins + amount);
    setTotalCoinsEarned((prevTotal) => prevTotal + amount);
  };

  const removeCoins = (amount: number) => {
    setCoins((prevCoins) => {
      const newCoins = prevCoins - amount;
      return newCoins < 0 ? 0 : newCoins;
    });
  };

  const addGems = (amount: number) => {
    setGems(prevGems => prevGems + amount);
  };

  const formatNumber = (number: number) => {
    const formatter = Intl.NumberFormat(undefined, {
      notation: "compact",
      compactDisplay: "short",
    });
    return formatter.format(number);
  };

  // Mock functions for the useGame hook
  const mockDispatch = () => {};
  const mockAddEssence = () => {};
  const mockPrestige = () => {};
  const mockCalculatePotentialEssenceReward = () => 0;
  const mockBuyManager = () => {};
  const mockBuyArtifact = () => {};
  const mockUnlockPerk = () => {};
  const mockToggleAutoTap = () => {};
  const mockUpdatePortrait = () => {};
  const mockUpdateTitle = () => {};
  const mockAddItem = () => {};
  const mockUseItem = () => {};
  const mockBuyUpgrade = () => {};
  const mockToggleAutoBuy = () => {};
  const mockCalculateMaxPurchaseAmount = () => 0;
  const mockActivateBoost = () => {};
  const mockUpdateUsername = () => {};
  const mockHandleClick = () => {};
  const mockUnlockAbility = () => {};

  // Provide classic context values
  const contextValue: GameContextType = {
    coins,
    gems,
    addCoins,
    removeCoins,
    totalPassiveIncome,
    setTotalPassiveIncome,
    clickPower,
    setClickPower,
    prestigeLevel,
    setPrestigeLevel,
    prestigeMultiplier,
    setPrestigeMultiplier,
    formatNumber,
    totalCoinsEarned,
    setTotalCoinsEarned,
    totalTaps,
    setTotalTaps,
    incomeMultiplier,
    setIncomeMultiplier,
    tapPowerMultiplier,
    setTapPowerMultiplier,
    addGems,
    calculateClickPower,
    totalIncomePerSecond,
  };

  // Provide hook-based context values
  const hookContextValue: UseGameReturnType = {
    state: gameState,
    dispatch: mockDispatch,
    addCoins,
    removeCoins,
    addGems,
    addEssence: mockAddEssence,
    prestige: mockPrestige,
    calculatePotentialEssenceReward: mockCalculatePotentialEssenceReward,
    buyManager: mockBuyManager,
    buyArtifact: mockBuyArtifact,
    unlockPerk: mockUnlockPerk,
    toggleAutoTap: mockToggleAutoTap,
    setIncomeMultiplier,
    updatePortrait: mockUpdatePortrait,
    updateTitle: mockUpdateTitle,
    calculateTotalIncomePerSecond,
    formatNumber,
    addItem: mockAddItem,
    useItem: mockUseItem,
    buyUpgrade: mockBuyUpgrade,
    toggleAutoBuy: mockToggleAutoBuy,
    calculateMaxPurchaseAmount: mockCalculateMaxPurchaseAmount,
    activateBoost: mockActivateBoost,
    updateUsername: mockUpdateUsername,
    handleClick: mockHandleClick,
    unlockAbility: mockUnlockAbility,
  };

  return (
    <GameContext.Provider value={contextValue}>
      <GameStateContext.Provider value={hookContextValue}>
        {children}
      </GameStateContext.Provider>
    </GameContext.Provider>
  );
};

// Export the classic hook
export const useGameContext = () => {
  const context = useContext(GameContext);
  if (!context) {
    throw new Error('useGameContext must be used within a GameProvider');
  }
  return context;
};

// Export the new hook that provides the full state
export const useGame = () => {
  const context = useContext(GameStateContext);
  if (!context) {
    throw new Error('useGame must be used within a GameProvider');
  }
  return context;
};
