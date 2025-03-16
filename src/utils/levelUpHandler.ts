
/**
 * Handles player leveling logic.
 * Base formula: nextLevelExperience = 100 * (level ^ 1.5)
 */

// Calculate experience needed for a specific level
export const calculateExpForLevel = (level: number): number => {
  return Math.floor(100 * Math.pow(level, 1.5));
};

// Calculate level information based on current experience and level
export const calculateLevelInfo = (
  currentExperience: number,
  currentLevel: number
) => {
  let experience = currentExperience;
  let level = currentLevel;
  let expForNextLevel = calculateExpForLevel(level);
  
  // Check if player should level up
  while (experience >= expForNextLevel) {
    // Level up
    experience -= expForNextLevel;
    level += 1;
    
    // Calculate new threshold
    expForNextLevel = calculateExpForLevel(level);
  }
  
  return {
    level,
    experience,
    nextLevelExp: expForNextLevel
  };
};

// Award experience to player
export const awardExperience = (
  currentLevel: number,
  currentExperience: number,
  expToAdd: number
) => {
  const updatedExp = currentExperience + expToAdd;
  return calculateLevelInfo(updatedExp, currentLevel);
};

// Check if player leveled up
export const checkLevelUp = (
  prevLevel: number,
  newLevel: number
): boolean => {
  return newLevel > prevLevel;
};
