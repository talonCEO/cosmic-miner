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
    unlocksTitle?: string;
    unlocksPortrait?: string;
  };
}

export const generateLevelData = (): LevelData[] => {
  const levels: LevelData[] = [];
  const baseExp = 150;
  const scalingFactor = 2.0;
  
  for (let i = 1; i <= 100; i++) {
    const level: LevelData = {
      level: i,
      expRequired: Math.round(baseExp * Math.pow(i, scalingFactor))
    };
    
    if (i % 5 === 0) {
      level.rewards = { skillPoints: 1 };
      if (i % 10 === 0) level.rewards.essence = i * 2;
      if (i % 25 === 0) level.rewards.gems = 50;
    }
    
    // Updated title unlocks
    if (i === 10) level.rewards = { ...level.rewards, unlocksTitle: 'space_rookie' };
    if (i === 25) level.rewards = { ...level.rewards, unlocksTitle: 'cosmic_explorer' };
    if (i === 40) level.rewards = { ...level.rewards, unlocksTitle: 'quantum_miner' };
    if (i === 50) level.rewards = { ...level.rewards, unlocksTitle: 'galactic_pioneer' };
    if (i === 75) level.rewards = { ...level.rewards, unlocksTitle: 'stellar_commander' };
    if (i === 100) level.rewards = { ...level.rewards, unlocksTitle: 'celestial_sovereign' };
    
    // Updated portrait unlocks
    if (i === 15) level.rewards = { ...level.rewards, unlocksPortrait: 'nebula_voyager' };
    if (i === 20) level.rewards = { ...level.rewards, unlocksPortrait: 'astral_navigator' };
    if (i === 30) level.rewards = { ...level.rewards, unlocksPortrait: 'stellar_seeker' };
    if (i === 45) level.rewards = { ...level.rewards, unlocksPortrait: 'eclipse_warden' };
    if (i === 60) level.rewards = { ...level.rewards, unlocksPortrait: 'galactic_guardian' };
    if (i === 80) level.rewards = { ...level.rewards, unlocksPortrait: 'singularity_lord' };
    if (i === 90) level.rewards = { ...level.rewards, unlocksPortrait: 'cosmic_overlord' };
    
    levels.push(level);
  }
  
  return levels;
};

export const LEVELS: LevelData[] = generateLevelData();

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
  { id: 'space_pilot', name: 'Space Pilot', description: 'Default title for all new cosmic miners', rarity: 'common', unlockCriteria: 'Default starting title', unlockCondition: { type: 'starting' } },
  { id: 'space_rookie', name: 'Space Rookie', description: 'Achieved a basic understanding of cosmic mining', rarity: 'common', unlockCriteria: 'Reach Level 10', unlockCondition: { type: 'level', value: 10 } },
  { id: 'cosmic_explorer', name: 'Cosmic Explorer', description: 'Ventured deeper into the cosmic realms', rarity: 'uncommon', unlockCriteria: 'Reach Level 25', unlockCondition: { type: 'level', value: 25 }, color: 'text-blue-400' },
  { id: 'asteroid_hunter', name: 'Asteroid Hunter', description: 'Master of finding valuable cosmic rocks', rarity: 'uncommon', unlockCriteria: 'Mine 1,000,000 coins total', unlockCondition: { type: 'achievement', achievementId: 'earn_million' }, color: 'text-amber-400' },
  { id: 'quantum_miner', name: 'Quantum Miner', description: 'Harnessed quantum forces for mining efficiency', rarity: 'rare', unlockCriteria: 'Reach Level 40', unlockCondition: { type: 'level', value: 40 }, color: 'text-teal-400' },
  { id: 'galactic_pioneer', name: 'Galactic Pioneer', description: 'Charted unknown territories of the cosmic mine', rarity: 'rare', unlockCriteria: 'Reach Level 50', unlockCondition: { type: 'level', value: 50 }, color: 'text-purple-400' },
  { id: 'essence_collector', name: 'Essence Collector', description: 'Amassed significant cosmic essence', rarity: 'rare', unlockCriteria: 'Collect 100 Essence total', unlockCondition: { type: 'achievement', achievementId: 'collect_essence_100' }, color: 'text-indigo-500' },
  { id: 'stellar_commander', name: 'Stellar Commander', description: 'Commands respect throughout the galaxy', rarity: 'epic', unlockCriteria: 'Reach Level 75', unlockCondition: { type: 'level', value: 75 }, color: 'text-emerald-400' },
  { id: 'nebula_master', name: 'Nebula Master', description: 'Mastered the art of harnessing nebula energy', rarity: 'epic', unlockCriteria: 'Prestige 10 times', unlockCondition: { type: 'prestige', value: 10 }, color: 'text-pink-500' },
  { id: 'celestial_sovereign', name: 'Celestial Sovereign', description: 'Rules over the cosmic mining operation with unmatched expertise', rarity: 'legendary', unlockCriteria: 'Reach Level 100', unlockCondition: { type: 'level', value: 100 }, color: 'text-yellow-400' },
  { id: 'void_emperor', name: 'Void Emperor', description: 'Conquered the infinite void through relentless prestige', rarity: 'legendary', unlockCriteria: 'Prestige 25 times', unlockCondition: { type: 'prestige', value: 25 }, color: 'text-gray-300' },
  { id: 'cosmic_deity', name: 'Cosmic Deity', description: 'Transcended mortal limitations in cosmic mining', rarity: 'legendary', unlockCriteria: 'Complete all achievements', unlockCondition: { type: 'collection', value: 100 }, color: 'text-gradient-cosmic', special: true }
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
  { id: 'default', name: 'Default', description: 'The standard portrait for all cosmic miners starting their journey.', rarity: 'common', unlockCriteria: 'Default starting portrait', unlockCondition: { type: 'starting' }, pngPath: 'default.png' },
  { id: 'nebula_voyager', name: 'Nebula Voyager', description: 'A portrait glowing with the hues of distant nebulae.', rarity: 'uncommon', unlockCriteria: 'Reach Level 15', unlockCondition: { type: 'level', value: 15 }, pngPath: '2.png' },
  { id: 'astral_navigator', name: 'Astral Navigator', description: 'A starry-eyed explorer charting the cosmic expanse.', rarity: 'uncommon', unlockCriteria: 'Reach Level 20', unlockCondition: { type: 'level', value: 20 }, pngPath: '6.png' },
  { id: 'stellar_seeker', name: 'Stellar Seeker', description: 'A radiant portrait for those who pursue the stars relentlessly.', rarity: 'rare', unlockCriteria: 'Reach Level 30', unlockCondition: { type: 'level', value: 30 }, pngPath: '3.png' },
  { id: 'eclipse_warden', name: 'Eclipse Warden', description: 'A shadowed figure guarding the cosmic balance.', rarity: 'rare', unlockCriteria: 'Reach Level 45', unlockCondition: { type: 'level', value: 45 }, pngPath: '7.png' },
  { id: 'galactic_guardian', name: 'Galactic Guardian', description: 'A majestic portrait awarded for protecting the galaxy’s riches.', rarity: 'epic', unlockCriteria: 'Reach Level 60', unlockCondition: { type: 'level', value: 60 }, pngPath: '4.png' },
  { id: 'singularity_lord', name: 'Singularity Lord', description: 'A powerful visage born from the heart of a black hole.', rarity: 'epic', unlockCriteria: 'Reach Level 80', unlockCondition: { type: 'level', value: 80 }, pngPath: '8.png' },
  { id: 'cosmic_overlord', name: 'Cosmic Overlord', description: 'A supreme portrait for the ultimate ruler of the cosmic mining empire.', rarity: 'legendary', unlockCriteria: 'Complete the "Master Miner" achievement', unlockCondition: { type: 'achievement', achievementId: 'master_miner' }, pngPath: '5.png' }
];

// Helper Functions (unchanged)
export const getLevelFromExp = (exp: number): { currentLevel: LevelData, nextLevel: LevelData | null, progress: number } => {
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

export const getTitleById = (id: string): TitleData | undefined => TITLES.find(title => title.id === id);
export const getPortraitById = (id: string): PortraitData | undefined => PORTRAITS.find(portrait => portrait.id === id);

export const isTitleUnlocked = (titleId: string, userLevel: number, userAchievements: string[] = [], prestigeCount: number = 0): boolean => {
  const title = getTitleById(titleId);
  if (!title) return false;
  switch (title.unlockCondition.type) {
    case 'starting': return true;
    case 'level': return userLevel >= (title.unlockCondition.value || 0);
    case 'achievement': return userAchievements.includes(title.unlockCondition.achievementId || '');
    case 'prestige': return prestigeCount >= (title.unlockCondition.value || 0);
    case 'collection': return false; // Placeholder
    default: return false;
  }
};

export const isPortraitUnlocked = (portraitId: string, userLevel: number, userAchievements: string[] = [], prestigeCount: number = 0): boolean => {
  const portrait = getPortraitById(portraitId);
  if (!portrait) return false;
  switch (portrait.unlockCondition.type) {
    case 'starting': return true;
    case 'level': return userLevel >= (portrait.unlockCondition.value || 0);
    case 'achievement': return userAchievements.includes(portrait.unlockCondition.achievementId || '');
    case 'prestige': return prestigeCount >= (portrait.unlockCondition.value || 0);
    case 'collection': return false; // Placeholder
    default: return false;
  }
};

export const getUnlockedTitles = (userLevel: number, userAchievements: string[] = [], prestigeCount: number = 0, unlockAll: boolean = false): TitleData[] => {
  if (unlockAll) return TITLES;
  return TITLES.filter(title => isTitleUnlocked(title.id, userLevel, userAchievements, prestigeCount));
};

export const getUnlockedPortraits = (userLevel: number, userAchievements: string[] = [], prestigeCount: number = 0, unlockAll: boolean = false): PortraitData[] => {
  if (unlockAll) return PORTRAITS;
  return PORTRAITS.filter(portrait => isPortraitUnlocked(portrait.id, userLevel, userAchievements, prestigeCount));
};
