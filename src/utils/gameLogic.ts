
/**
 * Format a number to a readable string with K, M, B, T suffixes
 */
export const formatNumber = (num: number): string => {
  if (num === 0) return "0";
  if (num < 1000) return num.toFixed(num === Math.floor(num) ? 0 : 1);
  
  const suffixes = ['', 'K', 'M', 'B', 'T', 'Qa', 'Qi', 'Sx', 'Sp', 'Oc', 'No', 'Dc', 
                    'UDc', 'DDc', 'TDc', 'QaDc', 'QiDc', 'SxDc', 'SpDc', 'OcDc', 'NoDc', 'Vg'];
  const exponent = Math.min(Math.floor(Math.log10(num) / 3), suffixes.length - 1);
  const suffix = suffixes[exponent];
  
  // Format with appropriate precision
  const scaled = num / Math.pow(1000, exponent);
  if (scaled < 10) {
    return scaled.toFixed(2) + suffix;
  } else if (scaled < 100) {
    return scaled.toFixed(1) + suffix;
  } else {
    return scaled.toFixed(0) + suffix;
  }
};

/**
 * Calculate time to save for an upgrade
 */
export const calculateTimeToSave = (cost: number, coins: number, coinsPerSecond: number): string => {
  if (coins >= cost) return 'Ready to buy';
  if (coinsPerSecond <= 0) return 'N/A';
  
  const secondsNeeded = (cost - coins) / coinsPerSecond;
  
  if (secondsNeeded < 60) {
    return `${Math.ceil(secondsNeeded)}s`;
  }
  if (secondsNeeded < 3600) {
    const minutes = Math.ceil(secondsNeeded / 60);
    return `${minutes}m`;
  }
  if (secondsNeeded < 86400) {
    const hours = Math.ceil(secondsNeeded / 3600);
    return `${hours}h`;
  }
  const days = Math.ceil(secondsNeeded / 86400);
  return `${days}d`;
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
 * Calculate essence reward with logarithmic scaling and progressive costs
 * As brackets of essence are earned, the cost for the next brackets increases exponentially
 */
export const calculateEssenceReward = (totalCoins: number): number => {
  if (totalCoins < 1000000) return 0; // Minimum 1M coins to get any essence
  
  // Logarithmic scaling provides diminishing returns but always some progress
  return Math.floor(Math.log10(totalCoins) * 2 - 10);
};

/**
 * Calculate cost for the next level of an upgrade
 * Uses a compounding interest formula common in idle games
 */
export const calculateUpgradeCost = (baseCost: number, level: number, growthRate: number = 1.15): number => {
  return Math.floor(baseCost * Math.pow(growthRate, level));
};

/**
 * Calculate bulk purchase cost for multiple levels of an upgrade
 * Uses the sum of geometric series formula
 */
export const calculateBulkPurchaseCost = (baseCost: number, currentLevel: number, quantity: number, growthRate: number = 1.15): number => {
  // Sum of geometric series: a * (1 - r^n) / (1 - r)
  // Where a is the first term (baseCost * growthRate^currentLevel)
  const a = baseCost * Math.pow(growthRate, currentLevel);
  return Math.floor(a * (1 - Math.pow(growthRate, quantity)) / (1 - growthRate));
};

/**
 * Calculate maximum affordable quantity of an upgrade
 */
export const calculateMaxAffordableQuantity = (coins: number, baseCost: number, currentLevel: number, growthRate: number = 1.15): number => {
  // Solve for n in: coins = baseCost * growthRate^currentLevel * (1 - growthRate^n) / (1 - growthRate)
  // Simplified to: growthRate^n = 1 - (coins * (1 - growthRate)) / (baseCost * growthRate^currentLevel)
  
  const a = baseCost * Math.pow(growthRate, currentLevel);
  const rightSide = 1 - (coins * (1 - growthRate)) / a;
  
  // Handle edge cases
  if (rightSide <= 0) {
    // Player can afford a very large quantity
    return 1000; // Set an arbitrary high limit to prevent performance issues
  }
  
  // Calculate the quantity: n = log(rightSide) / log(growthRate)
  return Math.floor(Math.log(rightSide) / Math.log(growthRate));
};
