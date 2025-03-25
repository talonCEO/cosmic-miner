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
 * Includes +10% global multiplier per essence earned
 */
export const calculateEssenceReward = (totalCoins: number, ownedArtifacts: string[] = []): number => {
  if (totalCoins < 100000) return 0; // Adjusted from 1M to 100k as per previous suggestion
  
  // Basic logarithmic scaling
  let baseEssence = Math.floor(Math.log10(totalCoins) * 3 - 8); // Adjusted from *2 - 10
  
  // Apply artifact bonuses
  let multiplier = 1;
  if (ownedArtifacts?.includes("artifact-3")) { // Element Scanner
    multiplier += 0.25;
  }
  if (ownedArtifacts?.includes("artifact-8")) { // Quantum Microscope
    multiplier += 1.25;
  }
  
  return Math.max(0, Math.floor(baseEssence * multiplier));
};

/**
 * Calculate global production multiplier based on total essence earned
 * +10% per essence point
 */
export const calculateEssenceMultiplier = (totalEssence: number): number => {
  return Math.pow(1.10, totalEssence); // +10% per essence
};

/**
 * Calculate cost for the next level of an upgrade with late-game reduction
 */
export const calculateUpgradeCost = (baseCost: number, level: number, growthRate: number = 1.15): number => {
  let adjustedGrowthRate = growthRate;
  if (level > 500) {
    // Reduce growth rate logarithmically after level 500, capping reduction at 50%
    adjustedGrowthRate = 1 + (growthRate - 1) * (1 - Math.min(0.5, Math.log10(level - 400) / 3));
  }
  return Math.floor(baseCost * Math.pow(adjustedGrowthRate, level));
};

/**
 * Calculate bulk purchase cost for multiple levels of an upgrade
 */
export const calculateBulkPurchaseCost = (baseCost: number, currentLevel: number, quantity: number, growthRate: number = 1.15): number => {
  let totalCost = 0;
  for (let i = 0; i < quantity; i++) {
    totalCost += calculateUpgradeCost(baseCost, currentLevel + i, growthRate);
  }
  return Math.floor(totalCost); // Simplified for accuracy with new cost scaling
};

/**
 * Calculate maximum affordable quantity of an upgrade
 */
export const calculateMaxAffordableQuantity = (coins: number, baseCost: number, currentLevel: number, growthRate: number = 1.15): number => {
  let quantity = 0;
  let remainingCoins = coins;
  while (remainingCoins >= calculateUpgradeCost(baseCost, currentLevel + quantity, growthRate)) {
    remainingCoins -= calculateUpgradeCost(baseCost, currentLevel + quantity, growthRate);
    quantity++;
    if (quantity >= 1000 - currentLevel) break; // Respect maxLevel
  }
  return quantity;
};

/**
 * Evaluate if an upgrade is a good value (worth buying)
 */
export const isGoodValue = (cost: number, coinsPerSecondBonus: number): boolean => {
  if (coinsPerSecondBonus <= 0) return false;
  const paybackPeriod = cost / coinsPerSecondBonus;
  return paybackPeriod < 100;
};

/**
 * Calculate click multiplier from artifacts
 */
export const calculateClickMultiplier = (ownedArtifacts: string[] = []): number => {
  let multiplier = 1;
  
  if (ownedArtifacts.includes("artifact-2")) { // Space Rocket
    multiplier += 0.5;
  }
  if (ownedArtifacts.includes("artifact-7")) { // Molecular Flask
    multiplier += 1.5;
  }
  
  return multiplier;
};

/**
 * Calculate total production bonus from abilities and perks
 */
export const calculateProductionMultiplier = (baseMultiplier: number, bonuses: number[]): number => {
  return bonuses.reduce((total, bonus) => total * (1 + bonus), baseMultiplier);
};
