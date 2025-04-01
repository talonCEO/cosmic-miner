/**
 * Player Progression Data
 */
import { ShieldCheck, Star, Zap, Sparkles, Trophy } from 'lucide-react';

export interface LevelData {
  level: number;
  expRequired: number;
  rewards?: {
    coins?: number;
    essence?: number;
    skillPoints?: number;
    gems?: number;
  };
}

export const generateLevelData = (): LevelData[] => {
  const levels: LevelData[] = [];
  let cumulativeXP = 0;

  // Growth factors for each 10-level block
  const growthFactors = [1.2, 1.5, 2.0, 2.5, 3.0, 3.5, 4.0, 4.5, 5.0, 5.5];
  const totalTarget = 1e18; // 1 quintillion
  const earlyTarget = 1e6; // 1 million for first 10 levels

  // Base XP for Levels 1–10
  const baseExp1to10 = 38523; // Calculated for 1M cumulative
  for (let i = 1; i <= 10; i++) {
    const expRequired = Math.round(baseExp1to10 * Math.pow(1.2, i - 1));
    levels.push({ level: i, expRequired });
    cumulativeXP += expRequired;
  }

  // Remaining XP after Level 10
  const remainingXP = totalTarget - cumulativeXP; // ~9.99999e17
  const last10Target = 0.9 * totalTarget; // 9e17 for Levels 91–100
  const upTo90Target = totalTarget - last10Target; // 1e17 for Levels 1–90
  const last20Target = 0.9 * upTo90Target; // 9e16 for Levels 81–90
  const upTo80Target = upTo90Target - last20Target; // 1e16 for Levels 1–80
  // Continue this pattern...

  // Calculate base XP for each block, chaining from the previous block
  let prevCumulative = cumulativeXP; // ~1M after Level 10
  for (let block = 1; block < 10; block++) {
    const startLevel = block * 10 + 1;
    const endLevel = (block + 1) * 10;
    const growthFactor = growthFactors[block];
    const blockTarget = block === 8 ? last20Target : (block === 7 ? upTo80Target * 0.9 : prevCumulative * 10); // Rough scaling
    const blockLevels = 10;
    const blockBaseExp = blockTarget / (Math.pow(growthFactor, blockLevels) - 1) * (growthFactor - 1);

    for (let i = startLevel; i <= endLevel; i++) {
      const expRequired = Math.round(blockBaseExp * Math.pow(growthFactor, i - startLevel));
      levels.push({ level: i, expRequired });
      cumulativeXP += expRequired;
    }
    prevCumulative = cumulativeXP;
  }

  // Levels 91–100: Final block to hit 9e17
  const lastBlockBaseExp = last10Target / (Math.pow(5.5, 10) - 1) * (5.5 - 1);
  for (let i = 91; i <= 100; i++) {
    const expRequired = Math.round(lastBlockBaseExp * Math.pow(5.5, i - 91));
    levels.push({ level: i, expRequired });
    cumulativeXP += expRequired;
  }

  // Adjust final block to exactly hit 1e18
  const adjustmentFactor = totalTarget / cumulativeXP;
  levels.forEach((level, index) => {
    levels[index].expRequired = Math.round(level.expRequired * adjustmentFactor);
  });

  return levels;
};

export const LEVELS: LevelData[] = generateLevelData();

// Rest of the file (TITLES, PORTRAITS, helper functions) remains unchanged
export interface TitleData {
  id: string;
  name: string;
  description: string;
  rarity: 'common' | 'uncommon' | 'rare' | 'epic' | 'legendary';
  unlockCriteria: string;
  unlockCondition: {
    type: 'level' | 'achievement' | 'purchase' | 'prestige' | 'collection' | 'starting';
    value?: number;
    achievementId?: string;
  };
  color?: string;
  special?: boolean;
}

export const TITLES: TitleData[] = [
  { id: 'space_pilot', name: 'Space Pilot', description: 'Embarked on the cosmic mining journey as a fresh recruit', rarity: 'common', unlockCriteria: 'Default starting title', unlockCondition: { type: 'starting' } },
  { id: 'space_rookie', name: 'Skipper', description: 'Prestige for the first time,', rarity: 'common', unlockCriteria: 'Earn silver medals in all 9 worlds', unlockCondition: { type: 'achievement', achievementId: 'multiworld-4' }, color: 'text-green-400' },
  { id: 'cosmic_explorer', name: 'Maelstrom', description: 'Conquered Aqua Nebula by maxing out all upgrades in its swirling depths', rarity: 'uncommon', unlockCriteria: 'Max all upgrades in Aqua Nebula', unlockCondition: { type: 'achievement', achievementId: 'world8-2' }, color: 'text-blue-400' },
  { id: 'asteroid_hunter', name: 'Cosmic Miner', description: 'Honed mining skills by pushing 5 upgrades to level 1000', rarity: 'uncommon', unlockCriteria: 'Get 5 upgrades to level 1000', unlockCondition: { type: 'achievement', achievementId: 'upgrades-4' }, color: 'text-amber-400' },
  { id: 'quantum_miner', name: 'Prodigy', description: 'Amassed a fortune of 1 quintillion coins through relentless asteroid crushing', rarity: 'rare', unlockCriteria: 'Earn 1 quintillion coins (1e18)', unlockCondition: { type: 'achievement', achievementId: 'income-6' }, color: 'text-teal-400' },
  { id: 'galactic_pioneer', name: 'Quantum Dredger', description: 'Dominated Quantum Drift by maxing all upgrades in its uncharted expanse', rarity: 'rare', unlockCriteria: 'Max all upgrades in Quantum Drift', unlockCondition: { type: 'achievement', achievementId: 'world7-2' }, color: 'text-purple-400' },
  { id: 'essence_collector', name: 'Starcarver', description: 'Carved a steady flow of 1 trillion coins per second from the cosmos', rarity: 'rare', unlockCriteria: 'Reach 1 trillion coins per second (1e12)', unlockCondition: { type: 'achievement', achievementId: 'passive-4' }, color: 'text-indigo-500' },
  { id: 'stellar_commander', name: 'Celestial Locksmith', description: 'Unlocked the full arsenal of abilities, mastering every cosmic tool', rarity: 'epic', unlockCriteria: 'Unlock all abilities', unlockCondition: { type: 'achievement', achievementId: 'abilities-2' }, color: 'text-emerald-400' },
  { id: 'nebula_master', name: 'Infinite Tribute', description: 'Paid tribute to the stars with 25 prestiges, harnessing infinite potential', rarity: 'epic', unlockCriteria: 'Prestige 25 times', unlockCondition: { type: 'achievement', achievementId: 'prestige-4' }, color: 'text-pink-500' },
  { id: 'celestial_sovereign', name: 'Essence Paragon', description: 'Reigned supreme by collecting 1,000,000 essence from the cosmic depths', rarity: 'legendary', unlockCriteria: 'Collect 1,000,000 essence', unlockCondition: { type: 'achievement', achievementId: 'essence-2' }, color: 'text-yellow-400' },
  { id: 'void_emperor', name: 'Reincarnated', description: 'Awakened ultimate power by prestiging 50 times in the void', rarity: 'legendary', unlockCriteria: 'Prestige 50 times', unlockCondition: { type: 'achievement', achievementId: 'prestige-5' }, color: 'text-gray-300' },
  { id: 'cosmic_deity', name: 'Supreme Leader', description: 'Ascended to supremacy by unlocking 90% of all cosmic achievements', rarity: 'legendary', unlockCriteria: 'Unlock 90% of all achievements', unlockCondition: { type: 'achievement', achievementId: 'mastery-2' }, color: 'text-gradient-cosmic', special: true },
  { id: 'gem_supporter', name: 'Cosmic Sugar Daddy', description: 'Boosted the mining crew by tossing some shiny gems our way', rarity: 'rare', unlockCriteria: 'Purchase gems', unlockCondition: { type: 'support', supportId: 'gem-purchase' }, color: 'text-orange-400' },
];

export interface PortraitData {
  id: string;
  name: string;
  description: string;
  rarity: 'common' | 'uncommon' | 'rare' | 'epic' | 'legendary';
  unlockCriteria: string;
  unlockCondition: {
    type: 'level' | 'achievement' | 'purchase' | 'prestige' | 'collection' | 'starting';
    value?: number;
    achievementId?: string;
  };
  pngPath: string;
}

export const PORTRAITS: PortraitData[] = [
  // Season 1 (Standard)
  { id: 'default', name: 'Default', description: 'The standard portrait for all cosmic miners starting their journey.', rarity: 'common', unlockCriteria: 'Default starting portrait', unlockCondition: { type: 'starting' }, pngPath: 'default.png' },
  { id: 'nebula_voyager', name: 'Nebula Voyager', description: 'A portrait glowing with the hues of distant nebulae.', rarity: 'uncommon', unlockCriteria: 'Complete the "Getting Started" achievement', unlockCondition: { type: 'achievement', achievementId: 'new' }, pngPath: '2.png' }, // Updated to achievement-based
  { id: 'astral_navigator', name: 'Astral Navigator', description: 'A starry-eyed explorer charting the cosmic expanse.', rarity: 'uncommon', unlockCriteria: 'Tap 10,000 times', unlockCondition: { type: 'achievement', achievementId: 'clicks-3' }, pngPath: '3.png' },
  { id: 'stellar_seeker', name: 'Stellar Seeker', description: 'A radiant portrait for those who pursue the stars relentlessly.', rarity: 'rare', unlockCriteria: 'Tap 1,000,000 times', unlockCondition: { type: 'achievement', achievementId: 'clicks-5' }, pngPath: '4.png' },
  { id: 'eclipse_warden', name: 'Eclipse Warden', description: 'A shadowed figure guarding the cosmic balance.', rarity: 'rare', unlockCriteria: 'Earn 1 trillion coins (1e12)', unlockCondition: { type: 'achievement', achievementId: 'income-4' }, pngPath: '5.png' },
  { id: 'galactic_guardian', name: 'Galactic Guardian', description: 'A majestic portrait awarded for protecting the galaxy’s riches.', rarity: 'epic', unlockCriteria: 'Max all upgrades in Glacial Expanse', unlockCondition: { type: 'achievement', achievementId: 'world5-2' }, pngPath: 'normalMax.png' },
  { id: 'singularity_lord', name: 'Singularity Lord', description: 'A powerful visage born from the heart of a black hole.', rarity: 'epic', unlockCriteria: 'Max all upgrades in Cosmic Apex', unlockCondition: { type: 'achievement', achievementId: 'world9-2' }, pngPath: 'specialMax.png' },
  { id: 'cosmic_overlord', name: 'Cosmic Overlord', description: 'A supreme portrait for the ultimate ruler of the cosmic mining empire.', rarity: 'legendary', unlockCriteria: 'Earn gold medals in all 9 worlds', unlockCondition: { type: 'achievement', achievementId: 'multiworld-5' }, pngPath: 'uniqueNormal.png' },
  { id: 'love', name: 'Stellar Supporter', description: 'A shimmering, heart-infused portrait radiating cosmic gratitude for supporting the game.', rarity: 'legendary', unlockCriteria: 'Collect 10,000 gems', unlockCondition: { type: 'achievement', achievementId: 'gems-2' }, pngPath: 'love.png' },
  // Season 2 (Update)
  { id: 'star', name: 'Shining Star', description: 'A radiant figure illuminating the cosmos.', rarity: 'legendary', unlockCriteria: 'Purchase with real money', unlockCondition: { type: 'purchase' }, pngPath: 'love.png' },
  { id: 'moon', name: 'Lunar Moon', description: 'A serene presence reflecting cosmic light.', rarity: 'legendary', unlockCriteria: 'Purchase with real money', unlockCondition: { type: 'purchase' }, pngPath: 'love.png' },
  { id: 'earth', name: 'Stable Earth', description: 'A grounded force in the vast galaxy.', rarity: 'legendary', unlockCriteria: 'Purchase with real money', unlockCondition: { type: 'purchase' }, pngPath: 'love.png' },
];

// Helper Functions (unchanged)
export const getLevelFromExp = (exp: number): { currentLevel: LevelData; nextLevel: LevelData | null; progress: number } => {
  let currentLevel = LEVELS[0];
  let nextLevel: LevelData | null = LEVELS[1];

  for (let i = 0; i < LEVELS.length; i++) {
    if (exp >= LEVELS[i].expRequired) {
      currentLevel = LEVELS[i];
      nextLevel = i < LEVELS.length - 1 ? LEVELS[i + 1] : null;
    } else {
      break;
    }
  }

  let progress = 0;
  if (nextLevel) {
    const currentLevelExp = currentLevel.expRequired;
    const nextLevelExp = nextLevel.expRequired;
    const expRange = nextLevelExp - currentLevelExp;
    const playerProgress = exp - currentLevelExp;
    progress = Math.min(Math.max(playerProgress / expRange, 0), 1) * 100;
  } else {
    progress = 100;
  }

  return { currentLevel, nextLevel, progress };
};

export const getTitleById = (id: string): TitleData | undefined => TITLES.find((title) => title.id === id);
export const getPortraitById = (id: string): PortraitData | undefined => PORTRAITS.find((portrait) => portrait.id === id);

export const isTitleUnlocked = (
  titleId: string,
  userLevel: number,
  userAchievements: string[] = [],
  prestigeCount: number = 0
): boolean => {
  const title = getTitleById(titleId);
  if (!title) return false;
  switch (title.unlockCondition.type) {
    case 'starting':
      return true;
    case 'level':
      return userLevel >= (title.unlockCondition.value || 0);
    case 'achievement':
      return userAchievements.includes(title.unlockCondition.achievementId || '');
    case 'prestige':
      return prestigeCount >= (title.unlockCondition.value || 0);
    case 'collection':
      return false; // Placeholder
    default:
      return false;
  }
};

export const isPortraitUnlocked = (
  portraitId: string,
  userLevel: number,
  userAchievements: string[] = [],
  prestigeCount: number = 0
): boolean => {
  const portrait = getPortraitById(portraitId);
  if (!portrait) return false;
  switch (portrait.unlockCondition.type) {
    case 'starting':
      return true;
    case 'level':
      return userLevel >= (portrait.unlockCondition.value || 0);
    case 'achievement':
      return userAchievements.includes(portrait.unlockCondition.achievementId || '');
    case 'prestige':
      return prestigeCount >= (portrait.unlockCondition.value || 0);
    case 'purchase':
      return false; // Handled elsewhere (e.g., purchase logic in GameContext)
    case 'collection':
      return false; // Placeholder
    default:
      return false;
  }
};

export const getUnlockedTitles = (
  userLevel: number,
  userAchievements: string[] = [],
  prestigeCount: number = 0,
  unlockAll: boolean = false
): TitleData[] => {
  if (unlockAll) return TITLES;
  return TITLES.filter((title) => isTitleUnlocked(title.id, userLevel, userAchievements, prestigeCount));
};

export const getUnlockedPortraits = (
  userLevel: number,
  userAchievements: string[] = [],
  prestigeCount: number = 0,
  unlockAll: boolean = false
): PortraitData[] => {
  if (unlockAll) return PORTRAITS;
  return PORTRAITS.filter((portrait) => isPortraitUnlocked(portrait.id, userLevel, userAchievements, prestigeCount));
};
