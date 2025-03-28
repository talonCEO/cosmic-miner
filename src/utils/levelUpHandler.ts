
import { toast } from "sonner";
import { getLevelFromExp, LEVELS } from "@/data/playerProgressionData";
import { unlockPlayerTitle, unlockPlayerPortrait } from "@/utils/localStorageSync";

interface LevelUpRewards {
  skillPoints?: number;
  essence?: number;
  gems?: number;
  unlockedTitle?: string;
  unlockedPortrait?: string;
}

/**
 * Check if player leveled up and handle rewards
 * 
 * @param uid User ID
 * @param oldExp Previous experience points
 * @param newExp New experience points
 * @param unlockedTitles Array of already unlocked titles
 * @param unlockedPortraits Array of already unlocked portraits
 */
export const handleLevelUp = async (
  uid: string,
  oldExp: number,
  newExp: number,
  unlockedTitles: string[] = [],
  unlockedPortraits: string[] = []
): Promise<{
  newLevel: number,
  rewards: LevelUpRewards
}> => {
  const oldLevelData = getLevelFromExp(oldExp);
  const newLevelData = getLevelFromExp(newExp);
  
  if (oldLevelData.currentLevel.level === newLevelData.currentLevel.level) {
    return { 
      newLevel: newLevelData.currentLevel.level,
      rewards: {}
    };
  }
  
  const rewards: LevelUpRewards = {
    skillPoints: 0,
    essence: 0,
    gems: 0,
    unlockedTitle: undefined,
    unlockedPortrait: undefined
  };
  
  for (let level = oldLevelData.currentLevel.level + 1; level <= newLevelData.currentLevel.level; level++) {
    const levelData = LEVELS[level - 1];
    
    if (levelData.rewards) {
      if (levelData.rewards.skillPoints) rewards.skillPoints! += levelData.rewards.skillPoints;
      if (levelData.rewards.essence) rewards.essence! += levelData.rewards.essence;
      if (levelData.rewards.gems) rewards.gems! += levelData.rewards.gems;
      
      if (levelData.rewards.unlocksTitle && !unlockedTitles.includes(levelData.rewards.unlocksTitle)) {
        await unlockPlayerTitle(uid, levelData.rewards.unlocksTitle, unlockedTitles);
        rewards.unlockedTitle = levelData.rewards.unlocksTitle;
        unlockedTitles.push(levelData.rewards.unlocksTitle);
      }
      
      if (levelData.rewards.unlocksPortrait && !unlockedPortraits.includes(levelData.rewards.unlocksPortrait)) {
        await unlockPlayerPortrait(uid, levelData.rewards.unlocksPortrait, unlockedPortraits);
        rewards.unlockedPortrait = levelData.rewards.unlocksPortrait;
        unlockedPortraits.push(levelData.rewards.unlocksPortrait);
      }
    }
    
    toast.success(`Level Up! You reached level ${level}`, {
      description: "Your cosmic mining skills have improved!"
    });
  }
  
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
  
  if (rewards.unlockedPortrait) {
    toast.success(`New Avatar Border Unlocked!`, {
      description: `You can now use the "${rewards.unlockedPortrait}" border.`
    });
  }
  
  return {
    newLevel: newLevelData.currentLevel.level,
    rewards
  };
};
