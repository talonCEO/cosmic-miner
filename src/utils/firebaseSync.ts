
import { getFirestore, doc, updateDoc, increment, serverTimestamp } from 'firebase/firestore';
import { GameState } from '@/context/GameContext';
import { UserProfile } from '@/context/FirebaseContext';
import { getLevelFromExp } from '@/data/playerProgressionData';
import { StorageService } from '@/services/StorageService';

/**
 * Sync important game metrics with local storage instead of Firebase
 */
export const syncGameProgress = async (
  uid: string, 
  gameState: GameState
) => {
  if (!uid) return;
  
  try {
    // Calculate level from total coins earned (used as experience)
    const exp = gameState.totalEarned || 0;
    const { currentLevel } = getLevelFromExp(exp);
    
    // Create local player profile to save
    const localProfile = {
      userId: uid,
      username: localStorage.getItem('player_username') || "Cosmic Explorer",
      level: currentLevel.level,
      exp: exp,
      coins: gameState.coins,
      essence: gameState.essence,
      skillPoints: gameState.skillPoints || 0,
      totalCoins: gameState.totalEarned || 0,
      title: localStorage.getItem('player_title') || "space_pilot",
      lastLogin: new Date().toISOString(),
      unlockedTitles: JSON.parse(localStorage.getItem('player_unlockedTitles') || '["space_pilot"]'),
      unlockedPortraits: JSON.parse(localStorage.getItem('player_unlockedPortraits') || '["default"]'),
      achievements: JSON.parse(localStorage.getItem('player_achievements') || '[]')
    };
    
    // Save to local storage
    localStorage.setItem('player_profile', JSON.stringify(localProfile));
    localStorage.setItem('player_level', currentLevel.level.toString());
    localStorage.setItem('player_exp', exp.toString());
    
    console.log("Game progress synced with local storage for user:", uid);
  } catch (error) {
    console.error("Error syncing game progress:", error);
  }
};

/**
 * Update achievement progress and check for title/portrait unlocks
 */
export const syncAchievements = async (
  uid: string,
  achievementIds: string[]
) => {
  if (!uid || !achievementIds.length) return;
  
  try {
    localStorage.setItem('player_achievements', JSON.stringify(achievementIds));
    return true;
  } catch (error) {
    console.error("Error syncing achievements:", error);
    return false;
  }
};

/**
 * Update player title
 */
export const updatePlayerTitle = async (
  uid: string,
  titleId: string
) => {
  if (!uid || !titleId) return;
  
  try {
    localStorage.setItem('player_title', titleId);
    return true;
  } catch (error) {
    console.error("Error updating player title:", error);
    return false;
  }
};

/**
 * Update player portrait/border
 */
export const updatePlayerPortrait = async (
  uid: string,
  portraitId: string
) => {
  if (!uid || !portraitId) return;
  
  try {
    localStorage.setItem('player_portrait', portraitId);
    return true;
  } catch (error) {
    console.error("Error updating player portrait:", error);
    return false;
  }
};

/**
 * Unlock a new title for the user
 */
export const unlockPlayerTitle = async (
  uid: string,
  titleId: string,
  currentTitles: string[]
) => {
  if (!uid || !titleId) return;
  
  try {
    // Don't add duplicates
    if (currentTitles.includes(titleId)) return true;
    
    const updatedTitles = [...currentTitles, titleId];
    localStorage.setItem('player_unlockedTitles', JSON.stringify(updatedTitles));
    
    return true;
  } catch (error) {
    console.error("Error unlocking player title:", error);
    return false;
  }
};

/**
 * Unlock a new portrait for the user
 */
export const unlockPlayerPortrait = async (
  uid: string,
  portraitId: string,
  currentPortraits: string[]
) => {
  if (!uid || !portraitId) return;
  
  try {
    // Don't add duplicates
    if (currentPortraits.includes(portraitId)) return true;
    
    const updatedPortraits = [...currentPortraits, portraitId];
    localStorage.setItem('player_unlockedPortraits', JSON.stringify(updatedPortraits));
    
    return true;
  } catch (error) {
    console.error("Error unlocking player portrait:", error);
    return false;
  }
};

/**
 * Add a friend to the user's friend list
 */
export const addFriend = async (
  uid: string,
  friendId: string
) => {
  if (!uid || !friendId) return;
  
  try {
    const currentFriends = JSON.parse(localStorage.getItem('player_friends') || '[]');
    if (!currentFriends.includes(friendId)) {
      const updatedFriends = [...currentFriends, friendId];
      localStorage.setItem('player_friends', JSON.stringify(updatedFriends));
    }
    
    return true;
  } catch (error) {
    console.error("Error adding friend:", error);
    return false;
  }
};
