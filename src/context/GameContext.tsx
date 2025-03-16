
import React, { createContext, useContext, useState, useEffect } from "react";
import { StorageService } from "../services/StorageService";
import { useFirebase } from "./FirebaseContext";
import { calculateLevelInfo } from "../utils/levelUpHandler";

// Define the initial game state type
interface GameState {
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
  [key: string]: any; // Allow for flexible state updates
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
};

// Define the game context type
interface GameContextType {
  gameState: GameState;
  updateGameState: (updates: Partial<GameState>) => void;
  addResources: (amount: number) => void;
  addExperience: (amount: number) => void;
  resetGame: () => void;
}

// Create the context with default values
const GameContext = createContext<GameContextType>({
  gameState: initialGameState,
  updateGameState: () => {},
  addResources: () => {},
  addExperience: () => {},
  resetGame: () => {},
});

// Custom hook to use the game context
export const useGameContext = () => useContext(GameContext);

// Provider component for game state
export const GameProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [gameState, setGameState] = useState<GameState>(initialGameState);
  const [initialized, setInitialized] = useState(false);
  const { syncPlayerData } = useFirebase();

  // Initialize game state from storage when component mounts
  useEffect(() => {
    const initializeGameState = async () => {
      try {
        // Load game state from storage
        const savedState = await StorageService.getData("gameState");
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
          await StorageService.saveData("gameState", updatedGameState);
          console.log("Game state saved successfully");
          
          // Try to sync with Firebase but don't block on failure
          syncPlayerData({
            username: 'Cosmic Miner', // Default username
            level: updatedGameState.playerLevel,
            experience: updatedGameState.playerExperience,
            stats: {
              totalClicks: updatedGameState.clickCount,
              totalResources: updatedGameState.resources,
              totalUpgrades: updatedGameState.upgradesPurchased,
              totalPlayTime: updatedGameState.playTime,
            }
          }).catch(error => {
            console.log("Firebase sync failed, continuing with local storage");
          });
          
          setGameState(updatedGameState);
        } catch (error) {
          console.error("Error saving game state:", error);
        }
      }, 1000); // Save every second

      return () => clearInterval(saveInterval);
    }
  }, [gameState, initialized, syncPlayerData]);

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
    await StorageService.saveData("gameState", initialGameState);
  };

  return (
    <GameContext.Provider
      value={{ gameState, updateGameState, addResources, addExperience, resetGame }}
    >
      {children}
    </GameContext.Provider>
  );
};
