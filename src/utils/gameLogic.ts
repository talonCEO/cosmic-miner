/**
 * Format a number to a readable string with K, M, B, T suffixes
 */
export const formatNumber = (num: number): string => {
  if (!Number.isFinite(num)) return "∞";
  if (num === 0) return "0";
  if (num < 0) return "-" + formatNumber(-num);
  if (num < 1000) return num.toFixed(num === Math.floor(num) ? 0 : 1);

  const suffixes = [
    '', 'K', 'M', 'B', 'T', 'Qa', 'Qi', 'Sx', 'Sp', 'Oc', 'No', 'Dc',
    'UDc', 'DDc', 'TDc', 'QaDc', 'QiDc', 'SxDc', 'SpDc', 'OcDc', 'NoDc',
    'Vg', 'UVg', 'DVg', 'TVg', 'QaVg', 'QiVg', 'SxVg', 'SpVg', 'OcVg', 'NoVg',
    'Tg', 'UTg', 'DTg', 'TTg', 'QaTg', 'QiTg', 'SxTg', 'SpTg', 'OcTg', 'NoTg',
    'Qd', 'UQd', 'DQd', 'TQd', 'QaQd', 'QiQd', 'SxQd', 'SpQd', 'OcQd', 'NoQd',
    'Qn', 'UQn', 'DQn', 'TQn', 'QaQn', 'QiQn', 'SxQn', 'SpQn', 'OcQn', 'NoQn',
    'Sx', 'USx', 'DSx', 'TSx', 'QaSx', 'QiSx', 'SxSx', 'SpSx', 'OcSx', 'NoSx',
    'St', 'USt', 'DSt', 'TSt', 'QaSt', 'QiSt', 'SxSt', 'SpSt', 'OcSt', 'NoSt',
    'Og', 'UOg', 'DOg', 'TOg', 'QaOg', 'QiOg', 'SxOg', 'SpOg', 'OcOg', 'NoOg',
    'Nn', 'UNn', 'DNn', 'TNn', 'QaNn', 'QiNn', 'SxNn', 'SpNn', 'OcNn', 'NoNn',
    'C',
  ];

  const exponent = Math.min(Math.floor(Math.log10(Math.abs(num)) / 3), suffixes.length - 1);
  const suffix = suffixes[exponent];
  const scaled = num / Math.pow(1000, exponent);

  if (scaled >= 1000) {
    return Math.round(scaled).toString() + suffix;
  } else if (scaled >= 100) {
    return scaled.toFixed(0) + suffix;
  } else if (scaled >= 10) {
    return scaled.toFixed(1) + suffix;
  } else {
    return scaled.toFixed(2) + suffix;
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
 * Calculate cost for the next level of an upgrade with late-game reduction
 */
export const calculateUpgradeCost = (baseCost: number, level: number, growthRate: number = 1.05, difficulty: number = 1.0): number => {
  let adjustedGrowthRate = growthRate;
  if (level > 50) {
    adjustedGrowthRate = 1 + (growthRate - 1) * (1 - Math.min(0.5, Math.log10(level - 400) / 3));
  }
  return Math.floor(baseCost * Math.pow(adjustedGrowthRate, level) * difficulty);
};

/**
 * Calculate bulk purchase cost for multiple levels of an upgrade
 */
export const calculateBulkPurchaseCost = (baseCost: number, currentLevel: number, quantity: number, growthRate: number = 1.05): number => {
  let totalCost = 0;
  for (let i = 0; i < quantity; i++) {
    totalCost += calculateUpgradeCost(baseCost, currentLevel + i, growthRate);
  }
  return Math.floor(totalCost);
};

/**
 * Calculate maximum affordable quantity of an upgrade
 */
export const calculateMaxAffordableQuantity = (coins: number, baseCost: number, currentLevel: number, growthRate: number = 1.05): number => {
  let quantity = 0;
  let remainingCoins = coins;
  while (remainingCoins >= calculateUpgradeCost(baseCost, currentLevel + quantity, growthRate)) {
    remainingCoins -= calculateUpgradeCost(baseCost, currentLevel + quantity, growthRate);
    quantity++;
    if (quantity >= 100 - currentLevel) break;
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
  
  if (ownedArtifacts.includes("artifact-2")) {
    multiplier += 0.5;
  }
  if (ownedArtifacts.includes("artifact-7")) {
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

/**
 * Calculate essence income boost based on total essence with tiered scaling
 */
export const calculateEssenceIncomeBoost = (totalEssence: number): number => {
  let boost = 0;
  if (totalEssence <= 100) {
    boost = totalEssence * 0.05;
  } else if (totalEssence <= 500) {
    boost = (100 * 0.05) + ((totalEssence - 100) * 0.03);
  } else {
    boost = (100 * 0.05) + (400 * 0.03) + ((totalEssence - 500) * 0.015);
  }
  return 1 + boost;
};