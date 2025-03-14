
import { getFirestore, doc, updateDoc, increment, serverTimestamp } from 'firebase/firestore';
import { GameState } from '@/context/GameContext';
import { UserProfile } from '@/context/FirebaseContext';

// Level thresholds data - this could be moved to a separate file if needed
export const levelThresholds = Array(100).fill(0).map((_, index) => {
  const level = index + 1;
  // Base experience needed for level 2
  const baseExp = 1000;
  
  // Experience growth formula - quadratic growth
  return Math.floor(baseExp * Math.pow(level, 1.5));
});

// Calculate level from experience
export const calculateLevelFromExp = (exp: number): number => {
  // Start from level 1
  let level = 1;
  
  // Find the highest level the player has enough exp for
  while (level < 100 && exp >= levelThresholds[level - 1]) {
    level++;
  }
  
  return level;
};

// Player titles data
export const playerTitles = [
  { id: "title_1", name: "Space Pilot", minLevel: 1 },
  { id: "title_2", name: "Asteroid Miner", minLevel: 10 },
  { id: "title_3", name: "Star Explorer", minLevel: 20 },
  { id: "title_4", name: "Galactic Pioneer", minLevel: 30 },
  { id: "title_5", name: "Nebula Navigator", minLevel: 40 },
  { id: "title_6", name: "Cosmic Voyager", minLevel: 50 },
  { id: "title_7", name: "Celestial Commander", minLevel: 60 },
  { id: "title_8", name: "Solar Sovereign", minLevel: 70 },
  { id: "title_9", name: "Interstellar Emperor", minLevel: 85 },
  { id: "title_10", name: "Galactic Overlord", minLevel: 100 }
];

// Avatar border styles
export const avatarBorders = [
  { id: "border_default", name: "Standard", minLevel: 1 },
  { id: "border_bronze", name: "Bronze", minLevel: 20 },
  { id: "border_silver", name: "Silver", minLevel: 40 },
  { id: "border_gold", name: "Gold", minLevel: 70 },
  { id: "border_diamond", name: "Diamond", minLevel: 100 }
];

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
    
    // Calculate exp from total coins earned
    const exp = gameState.totalEarned;
    
    // Calculate level based on exp
    const level = calculateLevelFromExp(exp);
    
    // Only sync important metrics that should be saved between sessions
    await updateDoc(userDocRef, {
      level: level,
      coins: gameState.coins,
      essence: gameState.essence,
      skillPoints: gameState.skillPoints || 0,
      totalCoins: gameState.totalEarned || 0,
      exp: exp, // Using total coins earned as experience
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
 * Update player avatar border
 */
export const updatePlayerBorder = async (
  uid: string,
  border: string
) => {
  if (!uid || !border) return;
  
  try {
    const db = getFirestore();
    const userDocRef = doc(db, 'users', uid);
    
    await updateDoc(userDocRef, {
      border: border
    });
    
    return true;
  } catch (error) {
    console.error("Error updating player border:", error);
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
