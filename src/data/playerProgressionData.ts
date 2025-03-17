/**
 * Player Progression Data
 * 
 * This file contains all the information related to player progression:
 * - Level thresholds and rewards
 * - Titles and their unlock requirements
 * - Portraits and their unlock requirements
 */

import { ShieldCheck, Star, Zap, Sparkles, Trophy } from 'lucide-react';

// =========================================
// Level Data (1-100)
// =========================================

export interface LevelData {
  level: number;
  expRequired: number;     // Experience required to reach this level
  rewards?: {              // Optional rewards given when reaching this level
    coins?: number;
    essence?: number;
    skillPoints?: number;
    gems?: number;
    unlocksTitle?: string; // References title.id
    unlocksPortrait?: string; // References portrait.id
  };
}

/**
 * Experience curve calculation
 * Using a steeper RPG-style curve: baseExp * (level ^ scalingFactor)
 * Increased scalingFactor from 1.5 to 2.0 for exponential difficulty
 */
export const generateLevelData = (): LevelData[] => {
  const levels: LevelData[] = [];
  const baseExp = 150;      // Base experience for level 1
  const scalingFactor = 2.0; // Increased from 1.5 to 2.0 for steeper exponential growth
  
  for (let i = 1; i <= 100; i++) {
    const level: LevelData = {
      level: i,
      expRequired: Math.round(baseExp * Math.pow(i, scalingFactor))
    };
    
    // Add special rewards at milestone levels
    if (i % 5 === 0) { // Every 5 levels
      level.rewards = { skillPoints: 1 };
      
      // Add more rewards at bigger milestones
      if (i % 10 === 0) { // Every 10 levels
        level.rewards.essence = i * 2;
      }
      
      if (i % 25 === 0) { // Every 25 levels
        level.rewards.gems = 50;
      }
    }
    
    // Specific milestone rewards for titles
    if (i === 10) level.rewards = { ...level.rewards, unlocksTitle: 'space_rookie' };
    if (i === 25) level.rewards = { ...level.rewards, unlocksTitle: 'cosmic_explorer' };
    if (i === 50) level.rewards = { ...level.rewards, unlocksTitle: 'galactic_pioneer' };
    if (i === 75) level.rewards = { ...level.rewards, unlocksTitle: 'stellar_commander' };
    if (i === 100) level.rewards = { ...level.rewards, unlocksTitle: 'celestial_sovereign' };
    
    // Portrait unlocks
    if (i === 15) level.rewards = { ...level.rewards, unlocksPortrait: 'nebula_voyager' };
    if (i === 30) level.rewards = { ...level.rewards, unlocksPortrait: 'stellar_seeker' };
    if (i === 60) level.rewards = { ...level.rewards, unlocksPortrait: 'galactic_guardian' };
    if (i === 90) level.rewards = { ...level.rewards, unlocksPortrait: 'cosmic_overlord' };
    
    levels.push(level);
  }
  
  return levels;
};

export const LEVELS: LevelData[] = generateLevelData();

// =========================================
// Player Titles
// =========================================

export interface TitleData {
  id: string;
  name: string;
  description: string;
  rarity: 'common' | 'uncommon' | 'rare' | 'epic' | 'legendary';
  unlockCriteria: string;  // Human-readable unlock description
  unlockCondition: {
    type: 'level' | 'achievement' | 'purchase' | 'prestige' | 'collection' | 'starting';
    value?: number;        // Specific value needed (level number, count, etc)
    achievementId?: string; // If unlocked by specific achievement
  };
  color?: string;          // Optional CSS color class for the title
  special?: boolean;       // Whether this is a special/limited title
}

export const TITLES: TitleData[] = [
  {
    id: 'space_pilot',
    name: 'Space Pilot',
    description: 'Default title for all new cosmic miners',
    rarity: 'common',
    unlockCriteria: 'Default starting title for all players',
    unlockCondition: {
      type: 'starting'
    }
  },
  {
    id: 'space_rookie',
    name: 'Space Rookie',
    description: 'Achieved a basic understanding of cosmic mining',
    rarity: 'common',
    unlockCriteria: 'Reach Level 10',
    unlockCondition: {
      type: 'level',
      value: 10
    }
  },
  {
    id: 'cosmic_explorer',
    name: 'Cosmic Explorer',
    description: 'Ventured deeper into the cosmic realms',
    rarity: 'uncommon',
    unlockCriteria: 'Reach Level 25',
    unlockCondition: {
      type: 'level',
      value: 25
    },
    color: 'text-blue-400'
  },
  {
    id: 'asteroid_hunter',
    name: 'Asteroid Hunter',
    description: 'Master of finding valuable cosmic rocks',
    rarity: 'uncommon',
    unlockCriteria: 'Mine 1,000,000 coins total',
    unlockCondition: {
      type: 'achievement',
      achievementId: 'earn_million'
    },
    color: 'text-amber-400'
  },
  {
    id: 'galactic_pioneer',
    name: 'Galactic Pioneer',
    description: 'Charted unknown territories of the cosmic mine',
    rarity: 'rare',
    unlockCriteria: 'Reach Level 50',
    unlockCondition: {
      type: 'level',
      value: 50
    },
    color: 'text-purple-400'
  },
  {
    id: 'essence_collector',
    name: 'Essence Collector',
    description: 'Amassed significant cosmic essence',
    rarity: 'rare',
    unlockCriteria: 'Collect 100 Essence total',
    unlockCondition: {
      type: 'achievement',
      achievementId: 'collect_essence_100'
    },
    color: 'text-indigo-500'
  },
  {
    id: 'stellar_commander',
    name: 'Stellar Commander',
    description: 'Commands respect throughout the galaxy',
    rarity: 'epic',
    unlockCriteria: 'Reach Level 75',
    unlockCondition: {
      type: 'level',
      value: 75
    },
    color: 'text-emerald-400'
  },
  {
    id: 'nebula_master',
    name: 'Nebula Master',
    description: 'Mastered the art of harnessing nebula energy',
    rarity: 'epic',
    unlockCriteria: 'Prestige 10 times',
    unlockCondition: {
      type: 'prestige',
      value: 10
    },
    color: 'text-pink-500'
  },
  {
    id: 'celestial_sovereign',
    name: 'Celestial Sovereign',
    description: 'Rules over the cosmic mining operation with unmatched expertise',
    rarity: 'legendary',
    unlockCriteria: 'Reach Level 100',
    unlockCondition: {
      type: 'level',
      value: 100
    },
    color: 'text-yellow-400'
  },
  {
    id: 'cosmic_deity',
    name: 'Cosmic Deity',
    description: 'Transcended mortal limitations in cosmic mining',
    rarity: 'legendary',
    unlockCriteria: 'Complete all achievements',
    unlockCondition: {
      type: 'collection',
      value: 100 // Assuming 100% achievement completion
    },
    color: 'text-gradient-cosmic',
    special: true
  }
];

// =========================================
// Player Portraits
// =========================================

export interface PortraitData {
  id: string;
  name: string;
  description: string;
  rarity: 'common' | 'uncommon' | 'rare' | 'epic' | 'legendary';
  unlockCriteria: string;  // Human-readable unlock description
  unlockCondition: {
    type: 'level' | 'achievement' | 'purchase' | 'prestige' | 'collection' | 'starting';
    value?: number;        // Specific value needed (level number, count, etc)
    achievementId?: string; // If unlocked by specific achievement
  };
  pngPath: string;         // Path to the PNG file for rendering
}

export const PORTRAITS: PortraitData[] = [
  {
    id: 'default',
    name: 'Default',
    description: 'The standard portrait for all cosmic miners starting their journey.',
    rarity: 'common',
    unlockCriteria: 'Default starting portrait for all players',
    unlockCondition: {
      type: 'starting'
    },
    pngPath: 'default.png'
  },
  {
    id: 'nebula_voyager',
    name: 'Nebula Voyager',
    description: 'A portrait glowing with the hues of distant nebulae, earned through exploration.',
    rarity: 'uncommon',
    unlockCriteria: 'Reach Level 15',
    unlockCondition: {
      type: 'level',
      value: 15
    },
    pngPath: 'default.png'
  },
  {
    id: 'stellar_seeker',
    name: 'Stellar Seeker',
    description: 'A radiant portrait for those who pursue the stars relentlessly.',
    rarity: 'rare',
    unlockCriteria: 'Reach Level 30',
    unlockCondition: {
      type: 'level',
      value: 30
    },
    pngPath: 'default.png'
  },
  {
    id: 'galactic_guardian',
    name: 'Galactic Guardian',
    description: 'A majestic portrait awarded for protecting the galaxy’s riches.',
    rarity: 'epic',
    unlockCriteria: 'Reach Level 60',
    unlockCondition: {
      type: 'level',
      value: 60
    },
    pngPath: 'default.png'
  },
  {
    id: 'cosmic_overlord',
    name: 'Cosmic Overlord',
    description: 'A supreme portrait for the ultimate ruler of the cosmic mining empire.',
    rarity: 'legendary',
    unlockCriteria: 'Complete the "Master Miner" achievement',
    unlockCondition: {
      type: 'achievement',
      achievementId: 'master_miner' // Assumes an achievement exists with this ID
    },
    pngPath: 'default.png'
  }
];

// =========================================
// Helper Functions
// =========================================

/**
 * Helper function to get level data based on experience points
 * @param exp Current experience points
 * @returns Current level data and progress to next level
 */
export const getLevelFromExp = (exp: number): { 
  currentLevel: LevelData, 
  nextLevel: LevelData | null,
  progress: number 
} => {
  // Find the highest level the player has achieved
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
  
  // Calculate progress to next level
  let progress = 0;
  if (nextLevel) {
    const currentLevelExp = currentLevel.expRequired;
    const nextLevelExp = nextLevel.expRequired;
    const expRange = nextLevelExp - currentLevelExp;
    const playerProgress = exp - currentLevelExp;
    progress = Math.min(Math.max(playerProgress / expRange, 0), 1) * 100;
  } else {
    // Max level reached
    progress = 100;
  }
  
  return { currentLevel, nextLevel, progress };
};

/**
 * Get a title by its ID
 * @param id Title ID
 * @returns Title data or undefined if not found
 */
export const getTitleById = (id: string): TitleData | undefined => {
  return TITLES.find(title => title.id === id);
};

/**
 * Get a portrait by its ID
 * @param id Portrait ID
 * @returns Portrait data or undefined if not found
 */
export const getPortraitById = (id: string): PortraitData | undefined => {
  return PORTRAITS.find(portrait => portrait.id === id);
};

/**
 * Check if a player has unlocked a specific title based on their profile
 * @param titleId Title ID to check
 * @param userLevel Current user level
 * @param userAchievements Array of achievement IDs the user has completed
 * @param prestigeCount Number of times the user has prestiged
 * @returns Boolean indicating if the title is unlocked
 */
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
      // For 100% achievement completion
      // This would need to be compared against the total number of achievements
      return false; // Implement based on actual achievement system
    default:
      return false;
  }
};

/**
 * Check if a player has unlocked a specific portrait based on their profile
 * @param portraitId Portrait ID to check
 * @param userLevel Current user level
 * @param userAchievements Array of achievement IDs the user has completed
 * @param prestigeCount Number of times the user has prestiged
 * @returns Boolean indicating if the portrait is unlocked
 */
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
    case 'collection':
      return false; // Implement based on actual collection system
    default:
      return false;
  }
};

/**
 * Get all titles unlocked by a player (or all titles if unlockAll is true)
 * @param userLevel Current user level
 * @param userAchievements Array of achievement IDs the user has completed
 * @param prestigeCount Number of times the user has prestiged
 * @param unlockAll Optional flag to unlock all titles regardless of conditions
 * @returns Array of unlocked title data
 */
export const getUnlockedTitles = (
  userLevel: number, 
  userAchievements: string[] = [],
  prestigeCount: number = 0,
  unlockAll: boolean = false // New parameter
): TitleData[] => {
  if (unlockAll) {
    return TITLES; // Return all titles if unlockAll is true
  }
  return TITLES.filter(title => 
    isTitleUnlocked(title.id, userLevel, userAchievements, prestigeCount)
  );
};

/**
 * Get all portraits unlocked by a player (or all portraits if unlockAll is true)
 * @param userLevel Current user level
 * @param userAchievements Array of achievement IDs the user has completed
 * @param prestigeCount Number of times the user has prestiged
 * @param unlockAll Optional flag to unlock all portraits regardless of conditions
 * @returns Array of unlocked portrait data
 */
export const getUnlockedPortraits = (
  userLevel: number, 
  userAchievements: string[] = [],
  prestigeCount: number = 0,
  unlockAll: boolean = false // New parameter
): PortraitData[] => {
  if (unlockAll) {
    return PORTRAITS; // Return all portraits if unlockAll is true
  }
  return PORTRAITS.filter(portrait => 
    isPortraitUnlocked(portrait.id, userLevel, userAchievements, prestigeCount)
  );
};
