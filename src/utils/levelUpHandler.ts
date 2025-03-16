
/**
 * Calculate the experience required for a specific level
 * @param level The player's current level
 * @returns The experience needed to reach the next level
 */
export const calculateExperienceRequired = (level: number): number => {
  // Base experience required for level 1 to 2
  const baseExperience = 100;
  
  // Each level requires 15% more experience than the previous
  return Math.floor(baseExperience * Math.pow(1.15, level - 1));
};

/**
 * Calculate the player's level based on their total experience
 * @param experience The player's total accumulated experience
 * @returns The calculated level information
 */
export const calculateLevelInfo = (experience: number, currentLevel: number = 1): { 
  level: number; 
  experience: number; 
  nextLevelExp: number;
  progress: number;
} => {
  // Start at level 1 or the provided current level
  let level = currentLevel;
  let expForNextLevel = calculateExperienceRequired(level);
  
  // Loop until we find the correct level for this amount of experience
  while (experience >= expForNextLevel) {
    level++;
    expForNextLevel = calculateExperienceRequired(level);
  }
  
  // Calculate experience required for previous level
  const prevLevelExp = level > 1 ? calculateExperienceRequired(level - 1) : 0;
  
  // Calculate progress to next level (0-1)
  const expInCurrentLevel = experience - prevLevelExp;
  const expRequiredForCurrentLevel = expForNextLevel - prevLevelExp;
  const progress = expInCurrentLevel / expRequiredForCurrentLevel;
  
  return {
    level,
    experience,
    nextLevelExp: expForNextLevel,
    progress
  };
};
