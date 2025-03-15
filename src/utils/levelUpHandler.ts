
import { toast } from "sonner";
import { getLevelFromExp, LEVELS } from "@/data/playerProgressionData";
import { unlockPlayerTitle } from "@/utils/firebaseSync";

/**
 * Check if player leveled up and handle rewards
 * 
 * @param uid User ID
 * @param oldExp Previous experience points
 * @param newExp New experience points
 * @param unlockedTitles Array of already unlocked titles
 */
export const handleLevelUp = async (
  uid: string,
  oldExp: number,
  newExp: number,
  unlockedTitles: string[] = []
): Promise<{
  newLevel: number,
  rewards: {
    skillPoints?: number,
    essence?: number,
    gems?: number,
    unlockedTitle?: string
  }
}> => {
  // Get old and new level data
  const oldLevelData = getLevelFromExp(oldExp);
  const newLevelData = getLevelFromExp(newExp);
  
  // If no level change, return early
  if (oldLevelData.currentLevel.level === newLevelData.currentLevel.level) {
    return { 
      newLevel: newLevelData.currentLevel.level,
      rewards: {}
    };
  }
  
  // Player leveled up! Handle all levels that were passed
  const rewards = {
    skillPoints: 0,
    essence: 0,
    gems: 0,
    unlockedTitle: undefined as string | undefined
  };
  
  // Calculate the total rewards for all levels gained
  for (let level = oldLevelData.currentLevel.level + 1; level <= newLevelData.currentLevel.level; level++) {
    const levelData = LEVELS[level - 1]; // Array is 0-indexed, levels start at 1
    
    if (levelData.rewards) {
      // Add numerical rewards
      if (levelData.rewards.skillPoints) rewards.skillPoints += levelData.rewards.skillPoints;
      if (levelData.rewards.essence) rewards.essence += levelData.rewards.essence;
      if (levelData.rewards.gems) rewards.gems += levelData.rewards.gems;
      
      // Handle title unlocks
      if (levelData.rewards.unlocksTitle && !unlockedTitles.includes(levelData.rewards.unlocksTitle)) {
        await unlockPlayerTitle(uid, levelData.rewards.unlocksTitle, unlockedTitles);
        rewards.unlockedTitle = levelData.rewards.unlocksTitle;
        unlockedTitles.push(levelData.rewards.unlocksTitle);
      }
    }
    
    // Show toast for each level up
    toast.success(`Level Up! You reached level ${level}`, {
      description: "Your cosmic mining skills have improved!"
    });
  }
  
  // Show reward notifications
  if (rewards.skillPoints) {
    toast.success(`Reward: ${rewards.skillPoints} Skill Points`, {
      description: "Use them in the Tech Tree to unlock new abilities!"
    });
  }
  
  if (rewards.essence) {
    toast.success(`Reward: ${rewards.essence} Essence`, {
      description: "Use it to purchase powerful upgrades!"
    });
  }
  
  if (rewards.gems) {
    toast.success(`Reward: ${rewards.gems} Gems`, {
      description: "Premium currency for special items!"
    });
  }
  
  if (rewards.unlockedTitle) {
    toast.success(`New Title Unlocked!`, {
      description: `You can now use the "${rewards.unlockedTitle}" title.`
    });
  }
  
  return {
    newLevel: newLevelData.currentLevel.level,
    rewards
  };
};
