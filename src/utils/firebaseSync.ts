
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
    
    // Prepare data to update
    const dataToUpdate = {
      level: currentLevel.level,
      exp: exp,
      coins: gameState.coins || 0,
      essence: gameState.essence || 0,
      skillPoints: gameState.skillPoints || 0,
      totalCoins: gameState.totalEarned || 0,
      lastSync: serverTimestamp(),
      lastLogin: serverTimestamp()
    };
    
    // Log what we're syncing to Firebase
    console.log("Syncing game progress to Firebase:", {
      uid,
      ...dataToUpdate,
      timestamp: new Date().toISOString()
    });
    
    // Update the document in Firebase
    await updateDoc(userDocRef, dataToUpdate);
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
    
    console.log("Syncing achievements to Firebase:", {
      uid,
      achievements: achievementIds,
      timestamp: new Date().toISOString()
    });
    
    await updateDoc(userDocRef, {
      achievements: achievementIds,
      lastSync: serverTimestamp()
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
    
    console.log("Updating player title in Firebase:", {
      uid,
      titleId,
      timestamp: new Date().toISOString()
    });
    
    await updateDoc(userDocRef, {
      title: titleId,
      lastSync: serverTimestamp()
    });
    
    return true;
  } catch (error) {
    console.error("Error updating player title:", error);
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
    
    console.log("Unlocking player title in Firebase:", {
      uid,
      titleId,
      timestamp: new Date().toISOString()
    });
    
    await updateDoc(userDocRef, {
      unlockedTitles: [...currentTitles, titleId],
      lastSync: serverTimestamp()
    });
    
    return true;
  } catch (error) {
    console.error("Error unlocking player title:", error);
    return false;
  }
};

/**
 * Update player's gem count
 */
export const updatePlayerGems = async (
  uid: string,
  gemAmount: number
) => {
  if (!uid) return;
  
  try {
    const db = getFirestore();
    const userDocRef = doc(db, 'users', uid);
    
    console.log("Updating player gems in Firebase:", {
      uid,
      gemAmount,
      timestamp: new Date().toISOString()
    });
    
    await updateDoc(userDocRef, {
      gems: gemAmount,
      lastSync: serverTimestamp()
    });
    
    return true;
  } catch (error) {
    console.error("Error updating player gems:", error);
    return false;
  }
};
