
import { GameState } from "@/context/GameContext";

export const StorageService = {
  // Save game state to local storage
  saveGameState: async (gameState: GameState): Promise<void> => {
    try {
      localStorage.setItem("gameState", JSON.stringify(gameState));
    } catch (error) {
      console.error("Error saving game state:", error);
    }
  },

  // Load game state from local storage
  loadGameState: async (): Promise<any> => {
    try {
      const savedState = localStorage.getItem("gameState");
      return savedState ? JSON.parse(savedState) : null;
    } catch (error) {
      console.error("Error loading game state:", error);
      return null;
    }
  },

  // Clear game state from local storage
  clearGameState: async (): Promise<void> => {
    try {
      localStorage.removeItem("gameState");
    } catch (error) {
      console.error("Error clearing game state:", error);
    }
  },

  // Backward compatibility methods for older code
  saveData: async (key: string, data: any): Promise<void> => {
    try {
      localStorage.setItem(key, JSON.stringify(data));
    } catch (error) {
      console.error(`Error saving data for key ${key}:`, error);
    }
  },

  getData: async (key: string): Promise<any> => {
    try {
      const savedData = localStorage.getItem(key);
      return savedData ? JSON.parse(savedData) : null;
    } catch (error) {
      console.error(`Error getting data for key ${key}:`, error);
      return null;
    }
  },
  
  removeData: async (key: string): Promise<void> => {
    try {
      localStorage.removeItem(key);
    } catch (error) {
      console.error(`Error removing data for key ${key}:`, error);
    }
  }
};
