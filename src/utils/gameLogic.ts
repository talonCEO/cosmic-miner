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
 */
export const calculateEssenceReward = (totalCoins: number, ownedArtifacts: string[] = []): number => {
  if (totalCoins < 1000000) return 0; // Minimum 1M coins to get any essence
  
  let baseEssence = Math.floor(Math.log10(totalCoins) * 2 - 10);
  
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
 * Calculate cost for the next level of an upgrade
 */
export const calculateUpgradeCost = (baseCost: number, level: number, growthRate: number = 1.15): number => {
  return Math.floor(baseCost * Math.pow(growthRate, level));
};

/**
 * Calculate bulk purchase cost for multiple levels of an upgrade
 */
export const calculateBulkPurchaseCost = (baseCost: number, currentLevel: number, quantity: number, growthRate: number = 1.15): number => {
  const a = baseCost * Math.pow(growthRate, currentLevel);
  return Math.floor(a * (1 - Math.pow(growthRate, quantity)) / (1 - growthRate));
};

/**
 * Calculate maximum affordable quantity of an upgrade
 */
export const calculateMaxAffordableQuantity = (coins: number, baseCost: number, currentLevel: number, growthRate: number = 1.15): number => {
  const a = baseCost * Math.pow(growthRate, currentLevel);
  const term = (coins * (1 - growthRate)) / a;
  const rightSide = 1 - term;
  
  if (rightSide <= 0) {
    return 1000; // Arbitrary high limit
  }
  
  return Math.floor(Math.log(rightSide) / Math.log(growthRate));
};

/**
 * Evaluate if an upgrade is a good value
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
