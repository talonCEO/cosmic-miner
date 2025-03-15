/**
 * Player Progression Data
 * 
 * This file contains all the information related to player progression:
 * - Level thresholds and rewards
 * - Titles and their unlock requirements
 * - Portrait borders/effects and their unlock requirements (commented out)
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
    // unlocksPortrait?: string; // References portrait.id (commented out)
  };
}

/**
 * Experience curve calculation
 * Using a standard RPG-style curve: baseExp * (level ^ scalingFactor)
 */
export const generateLevelData = (): LevelData[] => {
  const levels: LevelData[] = [];
  const baseExp = 150;      // Base experience for level 1
  const scalingFactor = 1.5; // How quickly the curve increases
  
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
    
    // Specific milestone rewards
    if (i === 10) level.rewards = { ...level.rewards, unlocksTitle: 'space_rookie' };
    if (i === 25) level.rewards = { ...level.rewards, unlocksTitle: 'cosmic_explorer' };
    if (i === 50) level.rewards = { ...level.rewards, unlocksTitle: 'galactic_pioneer' };
    if (i === 75) level.rewards = { ...level.rewards, unlocksTitle: 'stellar_commander' };
    if (i === 100) level.rewards = { ...level.rewards, unlocksTitle: 'celestial_sovereign' };
    
    // Portrait unlocks (commented out)
    // if (i === 20) level.rewards = { ...level.rewards, unlocksPortrait: 'nebula_glow' };
    // if (i === 40) level.rewards = { ...level.rewards, unlocksPortrait: 'cosmic_spark' };
    // if (i === 60) level.rewards = { ...level.rewards, unlocksPortrait: 'stellar_halo' };
    // if (i === 80) level.rewards = { ...level.rewards, unlocksPortrait: 'void_ripple' };
    // if (i === 100) level.rewards = { ...level.rewards, unlocksPortrait: 'celestial_radiance' };
    
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
// Portrait Borders/Effects (commented out)
// =========================================
/*
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
  borderClass?: string;           // Tailwind CSS classes
  glowClass?: string;             // Tailwind CSS glow effect
  animationClass?: string;        // Animation class
  gradientColors?: string[];      // Array of colors for gradient
  icon?: React.ReactNode;         // Optional icon component
  shaderKey?: string;             // Reference to a shader in the shaders.ts file
}

export const PORTRAITS: PortraitData[] = [
  {
    id: 'default',
    name: 'Standard Border',
    description: 'Basic border for all cosmic miners',
    rarity: 'common',
    unlockCriteria: 'Default starting border',
    unlockCondition: {
      type: 'starting'
    },
    borderClass: 'border-2 border-slate-400'
  },
  {
    id: 'nebula_glow',
    name: 'Nebula Glow',
    description: 'A mystical aura emanating from distant nebulae',
    rarity: 'uncommon',
    unlockCriteria: 'Reach Level 20',
    unlockCondition: {
      type: 'level',
      value: 20
    },
    borderClass: 'border-2',
    glowClass: 'shadow-lg shadow-purple-500/50',
    gradientColors: ['#8B5CF6', '#EC4899'],
    icon: <Star className="absolute -top-1 -right-1 h-4 w-4 text-purple-400" />
  },
  {
    id: 'cosmic_spark',
    name: 'Cosmic Spark',
    description: 'Surging energy from the heart of cosmic anomalies',
    rarity: 'rare',
    unlockCriteria: 'Reach Level 40',
    unlockCondition: {
      type: 'level',
      value: 40
    },
    borderClass: 'border-2',
    glowClass: 'shadow-lg shadow-blue-500/50',
    animationClass: 'animate-pulse',
    gradientColors: ['#3B82F6', '#06B6D4'],
    icon: <Zap className="absolute -top-1 -right-1 h-4 w-4 text-blue-400" />
  },
  {
    id: 'stellar_halo',
    name: 'Stellar Halo',
    description: 'Radiance of a thousand distant stars',
    rarity: 'epic',
    unlockCriteria: 'Reach Level 60',
    unlockCondition: {
      type: 'level',
      value: 60
    },
    borderClass: 'border-3',
    glowClass: 'shadow-xl shadow-amber-500/50',
    animationClass: 'animate-border-pulse',
    gradientColors: ['#F59E0B', '#EF4444'],
    icon: <Sparkles className="absolute -top-1 -right-1 h-4 w-4 text-amber-400" />
  },
  {
    id: 'void_ripple',
    name: 'Void Ripple',
    description: 'Mysterious energies from the edge of the universe',
    rarity: 'epic',
    unlockCriteria: 'Reach Level 80',
    unlockCondition: {
      type: 'level',
      value: 80
    },
    borderClass: 'border-3',
    glowClass: 'shadow-xl shadow-indigo-500/50',
    animationClass: 'animate-border-flow',
    gradientColors: ['#6366F1', '#A78BFA', '#EC4899'],
    icon: <ShieldCheck className="absolute -top-1 -right-1 h-4 w-4 text-indigo-400" />
  },
  {
    id: 'celestial_radiance',
    name: 'Celestial Radiance',
    description: 'The ultimate cosmic power, harnessed as a portrait border',
    rarity: 'legendary',
    unlockCriteria: 'Reach Level 100',
    unlockCondition: {
      type: 'level',
      value: 100
    },
    borderClass: 'border-4',
    glowClass: 'shadow-2xl shadow-yellow-500/50',
    animationClass: 'animate-cosmic-pulse',
    gradientColors: ['#F59E0B', '#EF4444', '#EC4899', '#8B5CF6', '#3B82F6'],
    icon: <Trophy className="absolute -top-1 -right-1 h-5 w-5 text-yellow-400" />,
    shaderKey: 'glowShader'
  }
];
*/

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
 * Get a portrait by its ID (commented out)
 * @param id Portrait ID
 * @returns Portrait data or undefined if not found
 */
/*
export const getPortraitById = (id: string): PortraitData | undefined => {
  return PORTRAITS.find(portrait => portrait.id === id);
};
*/

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
 * Check if a player has unlocked a specific portrait based on their profile (commented out)
 * @param portraitId Portrait ID to check
 * @param userLevel Current user level
 * @param userAchievements Array of achievement IDs the user has completed
 * @param prestigeCount Number of times the user has prestiged
 * @returns Boolean indicating if the portrait is unlocked
 */
/*
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
*/

/**
 * Get all titles unlocked by a player
 * @param userLevel Current user level
 * @param userAchievements Array of achievement IDs the user has completed
 * @param prestigeCount Number of times the user has prestiged
 * @returns Array of unlocked title data
 */
export const getUnlockedTitles = (
  userLevel: number, 
  userAchievements: string[] = [],
  prestigeCount: number = 0
): TitleData[] => {
  return TITLES.filter(title => 
    isTitleUnlocked(title.id, userLevel, userAchievements, prestigeCount)
  );
};

/**
 * Get all portraits unlocked by a player (commented out)
 * @param userLevel Current user level
 * @param userAchievements Array of achievement IDs the user has completed
 * @param prestigeCount Number of times the user has prestiged
 * @returns Array of unlocked portrait data
 */
/*
export const getUnlockedPortraits = (
  userLevel: number, 
  userAchievements: string[] = [],
  prestigeCount: number = 0
): PortraitData[] => {
  return PORTRAITS.filter(portrait => 
    isPortraitUnlocked(portrait.id, userLevel, userAchievements, prestigeCount)
  );
};
*/

// Add CSS classes for special border animations (commented out)
/*
export const portraitStyles = `
.animate-border-pulse {
  animation: border-pulse 2s ease-in-out infinite;
}

.animate-border-flow {
  animation: border-flow 3s linear infinite;
  background: linear-gradient(90deg, #6366F1, #A78BFA, #EC4899, #6366F1);
  background-size: 300% 100%;
}

.animate-cosmic-pulse {
  animation: cosmic-pulse 4s ease-in-out infinite;
  background: linear-gradient(90deg, #F59E0B, #EF4444, #EC4899, #8B5CF6, #3B82F6, #F59E0B);
  background-size: 600% 100%;
}

@keyframes border-pulse {
  0%, 100% {
    border-color: rgba(139, 92, 246, 0.8);
  }
  50% {
    border-color: rgba(236, 72, 153, 0.8);
  }
}

@keyframes border-flow {
  0% {
    background-position: 0% 0%;
  }
  100% {
    background-position: 100% 0%;
  }
}

@keyframes cosmic-pulse {
  0% {
    background-position: 0% 0%;
  }
  100% {
    background-position: 100% 0%;
  }
}

.text-gradient-cosmic {
  background: linear-gradient(90deg, #F59E0B, #EF4444, #EC4899, #8B5CF6, #3B82F6);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-size: 400% 100%;
  animation: cosmic-text-flow 4s linear infinite;
}

@keyframes cosmic-text-flow {
  0% {
    background-position: 0% 0%;
  }
  100% {
    background-position: 400% 0%;
  }
}
`;
*/
