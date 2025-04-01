import { Preferences } from '@capacitor/preferences';
import { GameState } from '@/context/GameContext';
import * as GameMechanics from '@/utils/GameMechanics';

const GAME_STATE_KEY = 'cosmic_miner_game_state';

/**
 * Service for handling persistent storage operations using Capacitor's Preferences API
 */
export const StorageService = {
  /**
   * Save the entire game state to persistent storage
   * @param gameState The current game state to save
   */
  saveGameState: async (gameState: GameState): Promise<void> => {
    try {
      // Transform state to exclude React elements from inventory and activeBoosts
      const stateToSave: GameState = {
        ...gameState,
        lastSavedAt: new Date().toISOString(),
        inventory: gameState.inventory.map(item => ({
          ...item,
          icon: undefined // Remove icon before saving
        })),
        activeBoosts: gameState.activeBoosts.map(boost => ({
          ...boost,
          icon: undefined // Remove icon before saving
        }))
      };
  
      await Preferences.set({
        key: GAME_STATE_KEY,
        value: JSON.stringify(stateToSave),
      });
  
      console.log('Game state saved successfully');
    } catch (error) {
      console.error('Error saving game state:', error);
    }
  },
  
  loadGameState: async (initialState: GameState): Promise<GameState> => {
    try {
      const { value } = await Preferences.get({ key: GAME_STATE_KEY });
  
      if (!value) {
        console.log('No saved game state found');
        return initialState;
      }
  
      const savedState: GameState & { lastSavedAt?: string } = JSON.parse(value);
      const lastSaved = savedState.lastSavedAt ? new Date(savedState.lastSavedAt).getTime() : Date.now();
      const now = Date.now();
      const offlineMillis = Math.min(now - lastSaved, 2 * 60 * 60 * 1000); // Cap at 2 hours
      const offlineSeconds = Math.floor(offlineMillis / 1000);
  
      // Reconstruct state with initial static data and restore icons
      const restoredState: GameState = {
        ...initialState,
        ...savedState,
        upgrades: initialState.upgrades.map((upgrade) => {
          const savedUpgrade = savedState.upgrades.find((u) => u.id === upgrade.id);
          return savedUpgrade ? { ...upgrade, ...savedUpgrade } : upgrade;
        }),
        abilities: initialState.abilities.map((ability) => {
          const savedAbility = savedState.abilities.find((a) => a.id === ability.id);
          return savedAbility ? { ...ability, ...savedAbility } : ability;
        }),
        achievements: initialState.achievements.map((achievement) => {
          const savedAchievement = savedState.achievements.find((a) => a.id === achievement.id);
          return savedAchievement ? { ...achievement, ...savedAchievement } : achievement;
        }),
        inventory: savedState.inventory.map(item => ({
          ...item,
          icon: INVENTORY_ITEMS[item.id as keyof typeof INVENTORY_ITEMS]?.icon || initialState.inventory.find(i => i.id === item.id)?.icon
        })),
        activeBoosts: savedState.activeBoosts.map(boost => ({
          ...boost,
          icon: INVENTORY_ITEMS[boost.id as keyof typeof INVENTORY_ITEMS]?.icon || initialState.activeBoosts.find(b => b.id === boost.id)?.icon
        })),
        managers: initialState.managers,
        artifacts: initialState.artifacts,
      };
  
      // Calculate offline progress
      if (offlineSeconds > 0 && restoredState.coinsPerSecond > 0) {
        const offlineCoins = GameMechanics.calculateTotalCoinsPerSecond(restoredState) * offlineSeconds;
        restoredState.coins = Math.max(0, restoredState.coins + offlineCoins);
        restoredState.totalEarned += offlineCoins;
  
        // Update boost timers
        restoredState.activeBoosts = restoredState.activeBoosts.map((boost) => {
          if (boost.duration && boost.activatedAt) {
            const elapsed = offlineSeconds - (now / 1000 - boost.activatedAt);
            const remaining = boost.duration - elapsed;
            return { ...boost, remainingTime: Math.max(0, remaining) };
          }
          return boost;
        }).filter((boost) => !boost.duration || (boost.remainingTime && boost.remainingTime > 0) || boost.id === 'boost-tap-boost');
  
        // Adjust tap boost state
        if (restoredState.tapBoostActive && restoredState.tapBoostTapsRemaining === 0) {
          restoredState.tapBoostActive = false;
          restoredState.activeBoosts = restoredState.activeBoosts.filter((b) => b.id !== 'boost-tap-boost');
        }
  
        // Adjust auto-tap state
        if (restoredState.autoTapActive && !restoredState.activeBoosts.some((b) => b.id === 'boost-auto-tap' && b.remainingTime > 0)) {
          restoredState.autoTapActive = false;
        }
      }
  
      console.log(`Game state loaded with ${offlineSeconds}s of offline progress`);
      return restoredState;
    } catch (error) {
      console.error('Error loading game state:', error);
      return initialState; // Fallback to initial state on error
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
  },
};