
import { GameState } from '@/context/GameContext';
import { UserProfile } from '@/context/FirebaseContext';
import { getLevelFromExp } from '@/data/playerProgressionData';

/**
 * Sync important game metrics with localStorage
 */
export const syncGameProgress = async (
  uid: string, 
  gameState: GameState
) => {
  if (!uid) return;
  
  try {
    // Get current profile from localStorage
    const profileData = localStorage.getItem('userProfile');
    if (!profileData) return;
    
    const profile = JSON.parse(profileData) as UserProfile;
    
    // Calculate level from total coins earned (used as experience)
    const exp = gameState.totalEarned || 0;
    const { currentLevel } = getLevelFromExp(exp);
    
    // Update profile with game state
    const updatedProfile = {
      ...profile,
      level: currentLevel.level,
      exp: exp,
      coins: gameState.coins,
      essence: gameState.essence,
      skillPoints: gameState.skillPoints || 0,
      totalCoins: gameState.totalEarned || 0,
      lastLogin: new Date().toISOString()
    };
    
    // Save updated profile
    localStorage.setItem('userProfile', JSON.stringify(updatedProfile));
    
    console.log("Game progress synced with localStorage for user:", uid);
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
    const profileData = localStorage.getItem('userProfile');
    if (!profileData) return;
    
    const profile = JSON.parse(profileData) as UserProfile;
    
    const updatedProfile = {
      ...profile,
      achievements: achievementIds
    };
    
    localStorage.setItem('userProfile', JSON.stringify(updatedProfile));
  } catch (error) {
    console.error("Error syncing achievements:", error);
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
    const profileData = localStorage.getItem('userProfile');
    if (!profileData) return false;
    
    const profile = JSON.parse(profileData) as UserProfile;
    
    const updatedProfile = {
      ...profile,
      title: titleId
    };
    
    localStorage.setItem('userProfile', JSON.stringify(updatedProfile));
    
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
    const profileData = localStorage.getItem('userProfile');
    if (!profileData) return false;
    
    const profile = JSON.parse(profileData) as UserProfile;
    
    const updatedProfile = {
      ...profile,
      portrait: portraitId
    };
    
    localStorage.setItem('userProfile', JSON.stringify(updatedProfile));
    
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
    const profileData = localStorage.getItem('userProfile');
    if (!profileData) return false;
    
    const profile = JSON.parse(profileData) as UserProfile;
    
    // Don't add duplicates
    if (currentTitles.includes(titleId)) return true;
    
    const updatedProfile = {
      ...profile,
      unlockedTitles: [...currentTitles, titleId]
    };
    
    localStorage.setItem('userProfile', JSON.stringify(updatedProfile));
    
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
    const profileData = localStorage.getItem('userProfile');
    if (!profileData) return false;
    
    const profile = JSON.parse(profileData) as UserProfile;
    
    // Don't add duplicates
    if (currentPortraits.includes(portraitId)) return true;
    
    const updatedProfile = {
      ...profile,
      unlockedPortraits: [...currentPortraits, portraitId]
    };
    
    localStorage.setItem('userProfile', JSON.stringify(updatedProfile));
    
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
    const profileData = localStorage.getItem('userProfile');
    if (!profileData) return false;
    
    const profile = JSON.parse(profileData) as UserProfile;
    
    // This is a simplified version
    const updatedProfile = {
      ...profile,
      friends: [...profile.friends, friendId]
    };
    
    localStorage.setItem('userProfile', JSON.stringify(updatedProfile));
    
    return true;
  } catch (error) {
    console.error("Error adding friend:", error);
    return false;
  }
};
