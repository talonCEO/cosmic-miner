
import { getFirestore, doc, updateDoc, increment, serverTimestamp } from 'firebase/firestore';
import { GameState } from '@/context/GameContext';
import { UserProfile } from '@/context/FirebaseContext';
import { getLevelFromExp } from '@/data/playerProgressionData';

/**
 * Sync important game metrics with the Firebase database
 */
export const syncGameProgress = async (
  uid: string, 
  gameState: GameState
) => {
  if (!uid) return;
  
  try {
    const db = getFirestore();
    const userDocRef = doc(db, 'users', uid);
    
    // Calculate level from total coins earned (used as experience)
    const exp = gameState.totalEarned || 0;
    const { currentLevel } = getLevelFromExp(exp);
    
    // Only sync important metrics that should be saved between sessions
    await updateDoc(userDocRef, {
      level: currentLevel.level,
      exp: exp,
      coins: gameState.coins,
      gems: gameState.gems || 0, // Add gems to the sync
      essence: gameState.essence,
      skillPoints: gameState.skillPoints || 0,
      totalCoins: gameState.totalEarned || 0,
      lastLogin: serverTimestamp()
    });
    
    console.log("Game progress synced with Firebase for user:", uid);
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
    const db = getFirestore();
    const userDocRef = doc(db, 'users', uid);
    
    await updateDoc(userDocRef, {
      achievements: achievementIds
    });
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
    const db = getFirestore();
    const userDocRef = doc(db, 'users', uid);
    
    await updateDoc(userDocRef, {
      title: titleId
    });
    
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
    const db = getFirestore();
    const userDocRef = doc(db, 'users', uid);
    
    await updateDoc(userDocRef, {
      portrait: portraitId
    });
    
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
    const db = getFirestore();
    const userDocRef = doc(db, 'users', uid);
    
    // Don't add duplicates
    if (currentTitles.includes(titleId)) return true;
    
    await updateDoc(userDocRef, {
      unlockedTitles: [...currentTitles, titleId]
    });
    
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
    const db = getFirestore();
    const userDocRef = doc(db, 'users', uid);
    
    // Don't add duplicates
    if (currentPortraits.includes(portraitId)) return true;
    
    await updateDoc(userDocRef, {
      unlockedPortraits: [...currentPortraits, portraitId]
    });
    
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
    const db = getFirestore();
    const userDocRef = doc(db, 'users', uid);
    
    // This is a simplified version - in a real app, 
    // you would need to handle friend requests and confirmations
    await updateDoc(userDocRef, {
      friends: increment(1) // Array union would be better but this is a simplified example
    });
    
    return true;
  } catch (error) {
    console.error("Error adding friend:", error);
    return false;
  }
};

/**
 * Sync user level up with Firebase
 */
export const syncLevelUp = async (
  uid: string,
  newLevel: number,
  newExp: number,
  rewards: any
) => {
  if (!uid) return;
  
  try {
    const db = getFirestore();
    const userDocRef = doc(db, 'users', uid);
    
    const updateData: any = {
      level: newLevel,
      exp: newExp
    };
    
    // Add any rewards to the update
    if (rewards.skillPoints) {
      updateData.skillPoints = increment(rewards.skillPoints);
    }
    
    if (rewards.essence) {
      updateData.essence = increment(rewards.essence);
    }
    
    if (rewards.gems) {
      updateData.gems = increment(rewards.gems);
    }
    
    await updateDoc(userDocRef, updateData);
    
    return true;
  } catch (error) {
    console.error("Error syncing level up:", error);
    return false;
  }
};
