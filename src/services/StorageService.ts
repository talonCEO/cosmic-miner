
import { Preferences } from '@capacitor/preferences';
import { GameState } from '@/context/GameContext';

const GAME_STATE_KEY = 'cosmic_miner_game_state';

/**
 * Service for handling persistent storage operations using Capacitor's Preferences API
 */
export const StorageService = {
  /**
   * Save the game state to persistent storage
   * @param gameState The current game state to save
   */
  saveGameState: async (gameState: GameState): Promise<void> => {
    try {
      // Create a simplified version of the state to avoid circular references
      const stateToSave = {
        coins: gameState.coins,
        coinsPerClick: gameState.coinsPerClick,
        coinsPerSecond: gameState.coinsPerSecond,
        upgrades: gameState.upgrades,
        totalClicks: gameState.totalClicks,
        totalEarned: gameState.totalEarned,
        autoBuy: gameState.autoBuy,
        autoTap: gameState.autoTap,
        essence: gameState.essence,
        ownedManagers: gameState.ownedManagers,
        ownedArtifacts: gameState.ownedArtifacts,
        prestigeCount: gameState.prestigeCount,
        incomeMultiplier: gameState.incomeMultiplier,
        skillPoints: gameState.skillPoints,
        abilities: gameState.abilities.map(ability => ({
          id: ability.id,
          unlocked: ability.unlocked
        })),
        unlockedPerks: gameState.unlockedPerks,
        inventory: gameState.inventory,
        inventoryCapacity: gameState.inventoryCapacity,
        gems: gameState.gems,
        boosts: gameState.boosts,
        hasNoAds: gameState.hasNoAds,
        username: gameState.username,
        title: gameState.title,
        userId: gameState.userId,
        portrait: gameState.portrait,
        nameChangeCount: gameState.nameChangeCount,
        // Save the last timestamp when the game was saved
        lastSavedAt: new Date().toISOString(),
      };
      
      await Preferences.set({
        key: GAME_STATE_KEY,
        value: JSON.stringify(stateToSave)
      });
      
      console.log('Game state saved successfully');
    } catch (error) {
      console.error('Error saving game state:', error);
    }
  },
  
  /**
   * Load the game state from persistent storage
   * @returns The saved game state or null if no state was found
   */
  loadGameState: async (): Promise<Partial<GameState> | null> => {
    try {
      const { value } = await Preferences.get({ key: GAME_STATE_KEY });
      
      if (!value) {
        console.log('No saved game state found');
        return null;
      }
      
      const savedState = JSON.parse(value);
      console.log('Game state loaded successfully');
      return savedState;
    } catch (error) {
      console.error('Error loading game state:', error);
      return null;
    }
  },
  
  /**
   * Clear the saved game state from persistent storage
   */
  clearGameState: async (): Promise<void> => {
    try {
      await Preferences.remove({ key: GAME_STATE_KEY });
      console.log('Game state cleared successfully');
    } catch (error) {
      console.error('Error clearing game state:', error);
    }
  }
};
