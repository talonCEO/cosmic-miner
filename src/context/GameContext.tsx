
import React, { createContext, useContext, useState, useEffect } from "react";
import { StorageService } from "../services/StorageService";
import { calculateLevelInfo } from "../utils/levelUpHandler";

// Export the GameState interface
export interface GameState {
  resources: number;
  clickValue: number;
  clickCount: number;
  autoClickValue: number;
  upgradesPurchased: number;
  playTime: number;
  lastSaveTime: number;
  playerLevel: number;
  playerExperience: number;
  playerNextLevelExperience: number;
  totalClicks?: number;
  totalEarned?: number;
  prestigeCount?: number;
  essence?: number;
  gems?: number;
  coins?: number;
  skillPoints?: number;
  inventory?: any[];
  inventoryCapacity?: number;
  upgrades?: any[];
  achievements?: any[];
  managers?: any[];
  artifacts?: any[];
  ownedManagers?: string[];
  ownedArtifacts?: string[];
  autoBuy?: boolean;
  incomeMultiplier?: number;
  autoTap?: boolean;
  unlockedPerks?: string[];
  coinsPerSecond?: number;
  [key: string]: any; // Allow for flexible state updates
}

// Export these types for other files to use
export interface Achievement {
  id: string;
  name: string;
  description: string;
  unlocked: boolean;
  condition: (state: GameState) => boolean;
}

export interface Upgrade {
  id: string;
  name: string;
  description: string;
  category: string;
  baseCost: number;
  cost: number;
  level: number;
  maxLevel: number;
  unlocked: boolean;
  coinsPerSecondBonus: number;
  coinsPerClickBonus: number;
  icon: string;
}

export interface Ability {
  id: string;
  name: string;
  description: string;
  unlocked: boolean;
  cost: number;
  icon: React.ReactNode;
  requiredAbilities?: string[];
  row?: number;
  column?: number;
}

// Default initial game state
const initialGameState: GameState = {
  resources: 0,
  clickValue: 1,
  clickCount: 0,
  autoClickValue: 0,
  upgradesPurchased: 0,
  playTime: 0,
  lastSaveTime: Date.now(),
  playerLevel: 1,
  playerExperience: 0,
  playerNextLevelExperience: 100,
  coins: 0,
  gems: 500, // Start with some gems
  essence: 0,
  skillPoints: 0,
  inventory: [],
  inventoryCapacity: 100,
  prestigeCount: 0,
  totalClicks: 0,
  totalEarned: 0,
  upgrades: [],
  achievements: [],
  managers: [],
  artifacts: [],
  ownedManagers: [],
  ownedArtifacts: [],
  unlockedPerks: [],
  autoBuy: false,
  autoTap: false,
  incomeMultiplier: 1.0,
  coinsPerSecond: 0,
};

// Define the game context type
interface GameContextType {
  state: GameState;
  updateGameState: (updates: Partial<GameState>) => void;
  addResources: (amount: number) => void;
  addExperience: (amount: number) => void;
  resetGame: () => void;
  prestige?: () => void;
  calculatePotentialEssenceReward?: () => number;
  buyManager?: (managerId: string) => void;
  buyArtifact?: (artifactId: string) => void;
  unlockPerk?: (perkId: string, parentId: string) => void;
  buyUpgrade?: (upgradeId: string, quantity?: number) => void;
  toggleAutoBuy?: () => void;
  calculateMaxPurchaseAmount?: (upgradeId: string) => number;
  useItem?: (itemId: string) => void;
  addItem?: (item: any) => void;
  toggleAutoTap?: () => void;
  setIncomeMultiplier?: (multiplier: number) => void;
  addCoins?: (amount: number) => void;
  addGems?: (amount: number) => void;
  addEssence?: (amount: number) => void;
  dispatch?: any;
  handleClick?: () => void;
}

// Create the context with default values
const GameContext = createContext<GameContextType>({
  state: initialGameState,
  updateGameState: () => {},
  addResources: () => {},
  addExperience: () => {},
  resetGame: () => {},
});

// Export the custom hook to use the game context
export const useGame = () => useContext(GameContext);

// Provider component for game state
export const GameProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [gameState, setGameState] = useState<GameState>(initialGameState);
  const [initialized, setInitialized] = useState(false);

  // Initialize game state from storage when component mounts
  useEffect(() => {
    const initializeGameState = async () => {
      try {
        // Load game state from storage
        const savedState = await StorageService.loadGameState();
        if (savedState) {
          console.log("Loaded game state from storage");
          
          // Ensure level info is correctly calculated
          const { level, experience, nextLevelExp } = calculateLevelInfo(
            savedState.playerExperience || 0,
            savedState.playerLevel || 1
          );
          
          // Update with calculated level info
          setGameState({
            ...initialGameState,
            ...savedState,
            playerLevel: level,
            playerExperience: experience,
            playerNextLevelExperience: nextLevelExp,
            lastSaveTime: Date.now(),
          });
        }
      } catch (error) {
        console.error("Error loading game state:", error);
      } finally {
        setInitialized(true);
      }
    };

    initializeGameState();
  }, []);

  // Save game state to storage whenever it changes
  useEffect(() => {
    if (initialized) {
      const saveInterval = setInterval(async () => {
        const now = Date.now();
        const playTimeIncrement = Math.floor((now - gameState.lastSaveTime) / 1000);
        
        const updatedGameState = {
          ...gameState,
          playTime: gameState.playTime + playTimeIncrement,
          lastSaveTime: now,
        };
        
        try {
          await StorageService.saveGameState(updatedGameState);
          console.log("Game state saved successfully");
          
          setGameState(updatedGameState);
        } catch (error) {
          console.error("Error saving game state:", error);
        }
      }, 1000); // Save every second

      return () => clearInterval(saveInterval);
    }
  }, [gameState, initialized]);

  // Update game state with partial updates
  const updateGameState = (updates: Partial<GameState>) => {
    setGameState((prevState) => ({ ...prevState, ...updates }));
  };

  // Add resources to the game state
  const addResources = (amount: number) => {
    setGameState((prevState) => ({
      ...prevState,
      resources: prevState.resources + amount,
    }));
  };

  // Add experience and handle level ups
  const addExperience = (amount: number) => {
    setGameState((prevState) => {
      const { playerLevel, playerExperience } = prevState;
      const { level, experience, nextLevelExp } = calculateLevelInfo(
        playerExperience + amount,
        playerLevel
      );
      
      return {
        ...prevState,
        playerLevel: level,
        playerExperience: experience,
        playerNextLevelExperience: nextLevelExp,
      };
    });
  };

  // Reset the game state to initial values
  const resetGame = async () => {
    setGameState(initialGameState);
    await StorageService.saveGameState(initialGameState);
  };

  // Mock implementations for other methods
  const calculatePotentialEssenceReward = () => {
    return gameState.coins ? Math.floor(Math.sqrt(gameState.coins / 1000)) : 0;
  };

  const prestige = () => {
    const essenceReward = calculatePotentialEssenceReward();
    updateGameState({
      essence: (gameState.essence || 0) + essenceReward,
      coins: 0,
      prestigeCount: (gameState.prestigeCount || 0) + 1
    });
  };

  const buyManager = (managerId: string) => {
    console.log(`Buying manager: ${managerId}`);
    updateGameState({
      ownedManagers: [...(gameState.ownedManagers || []), managerId]
    });
  };

  const buyArtifact = (artifactId: string) => {
    console.log(`Buying artifact: ${artifactId}`);
    updateGameState({
      ownedArtifacts: [...(gameState.ownedArtifacts || []), artifactId]
    });
  };

  const unlockPerk = (perkId: string, parentId: string) => {
    console.log(`Unlocking perk: ${perkId} for parent: ${parentId}`);
    updateGameState({
      unlockedPerks: [...(gameState.unlockedPerks || []), perkId]
    });
  };

  const buyUpgrade = (upgradeId: string, quantity = 1) => {
    console.log(`Buying upgrade: ${upgradeId}, quantity: ${quantity}`);
  };

  const toggleAutoBuy = () => {
    updateGameState({ autoBuy: !(gameState.autoBuy || false) });
  };

  const calculateMaxPurchaseAmount = (upgradeId: string) => {
    return 1; // Mock implementation
  };

  const toggleAutoTap = () => {
    updateGameState({ autoTap: !(gameState.autoTap || false) });
  };

  const setIncomeMultiplier = (multiplier: number) => {
    updateGameState({ incomeMultiplier: multiplier });
  };

  const addCoins = (amount: number) => {
    updateGameState({ coins: (gameState.coins || 0) + amount });
  };

  const addGems = (amount: number) => {
    updateGameState({ gems: (gameState.gems || 0) + amount });
  };

  const addEssence = (amount: number) => {
    updateGameState({ essence: (gameState.essence || 0) + amount });
  };

  const useItem = (itemId: string) => {
    console.log(`Using item: ${itemId}`);
  };

  const addItem = (item: any) => {
    updateGameState({
      inventory: [...(gameState.inventory || []), item]
    });
  };

  const handleClick = () => {
    addCoins(gameState.clickValue || 1);
    updateGameState({ totalClicks: (gameState.totalClicks || 0) + 1 });
  };

  return (
    <GameContext.Provider
      value={{ 
        state: gameState, 
        updateGameState, 
        addResources, 
        addExperience, 
        resetGame,
        prestige,
        calculatePotentialEssenceReward,
        buyManager,
        buyArtifact,
        unlockPerk,
        buyUpgrade,
        toggleAutoBuy,
        calculateMaxPurchaseAmount,
        useItem,
        addItem,
        toggleAutoTap,
        setIncomeMultiplier,
        addCoins,
        addGems,
        addEssence,
        handleClick
      }}
    >
      {children}
    </GameContext.Provider>
  );
};
