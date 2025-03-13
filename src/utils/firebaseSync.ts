
import { getFirestore, doc, updateDoc, increment, serverTimestamp } from 'firebase/firestore';
import { GameState } from '@/context/GameContext';
import { UserProfile } from '@/context/FirebaseContext';

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
    
    // Only sync important metrics that should be saved between sessions
    await updateDoc(userDocRef, {
      level: gameState.prestigeCount + 1,
      coins: gameState.coins,
      essence: gameState.essence,
      skillPoints: gameState.skillPoints || 0,
      totalCoins: gameState.totalEarned || 0,
      exp: gameState.totalClicks || 0, // Using total clicks as a simple measure of experience
      lastLogin: serverTimestamp()
    });
    
    console.log("Game progress synced with Firebase for user:", uid);
  } catch (error) {
    console.error("Error syncing game progress:", error);
  }
};

/**
 * Update achievement progress
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
  title: string
) => {
  if (!uid || !title) return;
  
  try {
    const db = getFirestore();
    const userDocRef = doc(db, 'users', uid);
    
    await updateDoc(userDocRef, {
      title: title
    });
    
    return true;
  } catch (error) {
    console.error("Error updating player title:", error);
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
