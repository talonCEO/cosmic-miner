
/**
 * Format a number to a readable string with K, M, B, T suffixes
 */
export const formatNumber = (num: number): string => {
  if (num < 1000) return num.toFixed(num === Math.floor(num) ? 0 : 1);
  
  const suffixes = ['', 'K', 'M', 'B', 'T', 'Qa', 'Qi', 'Sx', 'Sp', 'Oc', 'No', 'Dc'];
  const exponent = Math.floor(Math.log10(num) / 3);
  const suffix = suffixes[exponent] || '';
  
  return (num / Math.pow(1000, exponent)).toFixed(1) + suffix;
};

/**
 * Calculate time to save for an upgrade
 */
export const calculateTimeToSave = (cost: number, coins: number, coinsPerSecond: number): string => {
  if (coins >= cost) return 'Ready to buy';
  if (coinsPerSecond <= 0) return 'N/A';
  
  const secondsNeeded = (cost - coins) / coinsPerSecond;
  
  if (secondsNeeded < 60) return `${Math.ceil(secondsNeeded)}s`;
  if (secondsNeeded < 3600) return `${Math.ceil(secondsNeeded / 60)}m`;
  return `${Math.ceil(secondsNeeded / 3600)}h`;
};

/**
 * Calculate percentage progress to next upgrade
 */
export const calculateUpgradeProgress = (cost: number, coins: number): number => {
  if (coins >= cost) return 100;
  return (coins / cost) * 100;
};

/**
 * Create click effect element position
 */
export const getRandomPosition = (centerX: number, centerY: number, radius: number): { x: number, y: number } => {
  const angle = Math.random() * Math.PI * 2;
  const distance = Math.random() * radius;
  
  return {
    x: centerX + distance * Math.cos(angle),
    y: centerY + distance * Math.sin(angle)
  };
};

/**
 * Calculate essence reward with progressive scaling
 * As total coins earned increases, essence becomes more expensive to obtain
 */
export const calculateEssenceReward = (totalCoins: number): number => {
  let totalEssence = 0;
  let remainingCoins = totalCoins;
  let currentCostPerEssence = 100000;
  let currentBracket = 0;
  
  while (remainingCoins >= currentCostPerEssence) {
    const essenceInBracket = Math.min(10, Math.floor(remainingCoins / currentCostPerEssence));
    
    if (essenceInBracket <= 0) break;
    
    totalEssence += essenceInBracket;
    remainingCoins -= essenceInBracket * currentCostPerEssence;
    
    currentBracket++;
    currentCostPerEssence = 100000 * Math.pow(2, currentBracket);
  }
  
  return Math.floor(totalEssence);
};

/**
 * Check if player should earn a skill point from upgrade level
 */
export const shouldEarnSkillPointFromUpgrade = (previousLevel: number, newLevel: number): boolean => {
  // Check if we've crossed a 100-level threshold (100, 200, 300, etc.)
  const previousThreshold = Math.floor(previousLevel / 100);
  const newThreshold = Math.floor(newLevel / 100);
  
  return newThreshold > previousThreshold;
};

/**
 * Get the milestone levels for skill point rewards
 */
export const getUpgradeMilestones = (): number[] => {
  return [100, 200, 300, 400, 500, 600, 700, 800, 900, 1000];
};
