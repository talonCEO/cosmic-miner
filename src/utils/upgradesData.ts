import { Upgrade } from './types';

const calculateUpgradeCost = (basePrice: number, level: number): number => {
  if (level < 25) {
    return Math.floor(basePrice * Math.pow(1.07, level));
  } else if (level < 100) {
    return Math.floor(basePrice * Math.pow(1.06, level));
  } else if (level < 500) {
    return Math.floor(basePrice * Math.pow(1.05, level));
  } else {
    return Math.floor(basePrice * Math.pow(1.04, level));
  }
};

const calculateIncomePerSecond = (baseIncome: number, level: number): number => {
  if (level < 50) {
    return baseIncome * level;
  } else if (level < 200) {
    return baseIncome * level * 1.2;
  } else if (level < 500) {
    return baseIncome * level * 1.5;
  } else {
    return baseIncome * level * 2;
  }
};

export const UPGRADE_CATEGORIES = {
  TAP: 'tap',
  PRODUCTION: 'production',
} as const;

export const upgradesList: Upgrade[] = [
  {
    id: '1', // Changed to string to match GameContext
    name: 'Asteroid Drill',
    description: 'Basic mining equipment for space minerals',
    baseCost: 15,
    cost: 15,
    level: 0,
    maxLevel: 1000,
    coinsPerClickBonus: 0,
    coinsPerSecondBonus: 0.2,
    multiplierBonus: 0,
    icon: '/src/assets/images/icons/asteroid-drill.png',
    unlocked: true,
    category: UPGRADE_CATEGORIES.PRODUCTION,
  },
  {
    id: '2',
    name: 'Laser Extraction',
    description: 'Uses laser tech to extract minerals efficiently',
    baseCost: 100,
    cost: 100,
    level: 0,
    maxLevel: 1000,
    coinsPerClickBonus: 0,
    coinsPerSecondBonus: 1,
    multiplierBonus: 0,
    icon: '/src/assets/images/icons/laser-extraction.png',
    unlocked: true,
    category: UPGRADE_CATEGORIES.PRODUCTION,
  },
  {
    id: '3',
    name: 'Plasma Excavator',
    description: 'Uses plasma technology to excavate cosmic materials',
    baseCost: 1100,
    cost: 1100,
    level: 0,
    maxLevel: 1000,
    coinsPerClickBonus: 0,
    coinsPerSecondBonus: 8,
    multiplierBonus: 0,
    icon: '/src/assets/images/icons/plasma-excavator.png',
    unlocked: true,
    category: UPGRADE_CATEGORIES.PRODUCTION,
  },
  {
    id: '4',
    name: 'Nano-Bot Swarm',
    description: 'Microscopic bots that mine collectively',
    baseCost: 12000,
    cost: 12000,
    level: 0,
    maxLevel: 1000,
    coinsPerClickBonus: 0,
    coinsPerSecondBonus: 47,
    multiplierBonus: 0,
    icon: '/src/assets/images/icons/nano-bot-swarm.png',
    unlocked: true,
    category: UPGRADE_CATEGORIES.PRODUCTION,
  },
  {
    id: '5',
    name: 'Quantum Vibration',
    description: 'Utilizes quantum physics to extract cosmic elements',
    baseCost: 130000,
    cost: 130000,
    level: 0,
    maxLevel: 1000,
    coinsPerClickBonus: 0,
    coinsPerSecondBonus: 260,
    multiplierBonus: 0,
    icon: '/src/assets/images/icons/quantum-vibration.png',
    unlocked: true,
    category: UPGRADE_CATEGORIES.PRODUCTION,
  },
  {
    id: '6',
    name: 'Galactic Scanner',
    description: 'Scans the galaxy for valuable cosmic resources',
    baseCost: 1400000,
    cost: 1400000,
    level: 0,
    maxLevel: 1000,
    coinsPerClickBonus: 0,
    coinsPerSecondBonus: 1400,
    multiplierBonus: 0,
    icon: '/src/assets/images/icons/galactic-scanner.png',
    unlocked: true,
    category: UPGRADE_CATEGORIES.PRODUCTION,
  },
  {
    id: '7',
    name: 'Interstellar Navigation',
    description: 'Navigate through interstellar space for rare minerals',
    baseCost: 20000000,
    cost: 20000000,
    level: 0,
    maxLevel: 1000,
    coinsPerClickBonus: 0,
    coinsPerSecondBonus: 7800,
    multiplierBonus: 0,
    icon: '/src/assets/images/icons/interstellar-nav.png',
    unlocked: true,
    category: UPGRADE_CATEGORIES.PRODUCTION,
  },
  {
    id: '8',
    name: 'Graviton Shield',
    description: 'Shields to mine in extreme gravitational environments',
    baseCost: 330000000,
    cost: 330000000,
    level: 0,
    maxLevel: 1000,
    coinsPerClickBonus: 0,
    coinsPerSecondBonus: 44000,
    multiplierBonus: 0,
    icon: '/src/assets/images/icons/graviton-shield.png',
    unlocked: true,
    category: UPGRADE_CATEGORIES.PRODUCTION,
  },
  {
    id: '9',
    name: 'Neural Mining AI',
    description: 'AI that optimizes the mining process',
    baseCost: 5100000000,
    cost: 5100000000,
    level: 0,
    maxLevel: 1000,
    coinsPerClickBonus: 0,
    coinsPerSecondBonus: 260000,
    multiplierBonus: 0,
    icon: '/src/assets/images/icons/neural-mining.png',
    unlocked: true,
    category: UPGRADE_CATEGORIES.PRODUCTION,
  },
  {
    id: '10',
    name: 'Quantum Tunneling',
    description: 'Creates quantum tunnels to access deep space minerals',
    baseCost: 75000000000,
    cost: 75000000000,
    level: 0,
    maxLevel: 1000,
    coinsPerClickBonus: 0,
    coinsPerSecondBonus: 1600000,
    multiplierBonus: 0,
    icon: '/src/assets/images/icons/quantum-tunnel.png',
    unlocked: true,
    category: UPGRADE_CATEGORIES.PRODUCTION,
  },
  {
    id: '11',
    name: 'Supernova Core',
    description: 'Harnesses the power of supernovas for cosmic mining',
    baseCost: 1000000000000,
    cost: 1000000000000,
    level: 0,
    maxLevel: 1000,
    coinsPerClickBonus: 0,
    coinsPerSecondBonus: 10000000,
    multiplierBonus: 0,
    icon: '/src/assets/images/icons/supernova-core.png',
    unlocked: true,
    category: UPGRADE_CATEGORIES.PRODUCTION,
  },
  {
    id: '12',
    name: 'Cosmic Singularity',
    description: 'Utilizes cosmic singularities for ultimate mining power',
    baseCost: 14000000000000,
    cost: 14000000000000,
    level: 0,
    maxLevel: 1000,
    coinsPerClickBonus: 0,
    coinsPerSecondBonus: 65000000,
    multiplierBonus: 0,
    icon: '/src/assets/images/icons/cosmic-singularity.png',
    unlocked: true,
    category: UPGRADE_CATEGORIES.PRODUCTION,
  },
];

// For compatibility with your original export
export const createUpgradesData = (): Upgrade[] => upgradesList;
