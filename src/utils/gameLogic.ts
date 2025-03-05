
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
 * Calculate essence reward with logarithmic scaling
 * As total coins earned increases, the rate of essence gain slows down
 */
export const calculateEssenceReward = (totalCoins: number): number => {
  // Base calculation: 1 essence per 100,000 coins
  const baseEssence = totalCoins / 100000;
  
  // Apply logarithmic scaling to slow down essence gain as total coins increases
  // Formula: baseEssence / (1 + ln(totalCoins / 1000000 + 1))
  // This makes essence gain slower as totalCoins increases
  const scalingFactor = 1 + Math.log(totalCoins / 1000000 + 1);
  
  // Calculate essence with scaling applied
  const scaledEssence = baseEssence / scalingFactor;
  
  // Ensure a minimum amount of essence (prevent it from getting too small)
  return Math.max(Math.floor(scaledEssence), 0);
};
