
// Player portrait options
export const PORTRAITS = [
  { id: 'default', name: 'Default Portrait', pngPath: '/placeholder.svg', unlockLevel: 1 },
  { id: 'portrait-1', name: 'Space Explorer', pngPath: '/placeholder.svg', unlockLevel: 5 },
  { id: 'portrait-2', name: 'Galaxy Hunter', pngPath: '/placeholder.svg', unlockLevel: 10 },
  { id: 'portrait-3', name: 'Cosmic Pioneer', pngPath: '/placeholder.svg', unlockLevel: 15 },
  { id: 'portrait-4', name: 'Nebula Voyager', pngPath: '/placeholder.svg', unlockLevel: 20 },
  { id: 'portrait-5', name: 'Stellar Navigator', pngPath: '/placeholder.svg', unlockAchievement: 'prestige-1' },
  { id: 'portrait-6', name: 'Void Walker', pngPath: '/placeholder.svg', unlockAchievement: 'prestige-2' },
];

// Player title options
export const TITLES = [
  { id: 'novice', name: 'Novice Miner', unlockLevel: 1 },
  { id: 'asteroid-collector', name: 'Asteroid Collector', unlockLevel: 5 },
  { id: 'space-explorer', name: 'Space Explorer', unlockLevel: 10 },
  { id: 'cosmic-prospector', name: 'Cosmic Prospector', unlockLevel: 15 },
  { id: 'stellar-excavator', name: 'Stellar Excavator', unlockLevel: 20 },
  { id: 'galactic-harvester', name: 'Galactic Harvester', unlockAchievement: 'income-2' },
  { id: 'nebula-baron', name: 'Nebula Baron', unlockAchievement: 'prestige-1' },
  { id: 'void-emperor', name: 'Void Emperor', unlockAchievement: 'prestige-3' },
];

// Experience levels
export const LEVELS = [
  { level: 1, expRequired: 0, rewards: { skillPoints: 1 } },
  { level: 2, expRequired: 100, rewards: { skillPoints: 1 } },
  { level: 3, expRequired: 300, rewards: { skillPoints: 1 } },
  { level: 4, expRequired: 600, rewards: { skillPoints: 1 } },
  { level: 5, expRequired: 1000, rewards: { skillPoints: 2, essence: 5 } },
  { level: 6, expRequired: 2000, rewards: { skillPoints: 1 } },
  { level: 7, expRequired: 4000, rewards: { skillPoints: 1 } },
  { level: 8, expRequired: 8000, rewards: { skillPoints: 1 } },
  { level: 9, expRequired: 16000, rewards: { skillPoints: 1 } },
  { level: 10, expRequired: 32000, rewards: { skillPoints: 2, essence: 10 } },
  // Add more levels as needed
];

// Helper functions
export function getPortraitById(id: string) {
  return PORTRAITS.find(portrait => portrait.id === id);
}

export function getTitleById(id: string) {
  return TITLES.find(title => title.id === id);
}

export function getUnlockedPortraits(playerLevel: number, unlockedAchievements: string[]) {
  return PORTRAITS.filter(portrait => 
    (portrait.unlockLevel && portrait.unlockLevel <= playerLevel) || 
    (portrait.unlockAchievement && unlockedAchievements.includes(portrait.unlockAchievement))
  );
}

export function getUnlockedTitles(playerLevel: number, unlockedAchievements: string[]) {
  return TITLES.filter(title => 
    (title.unlockLevel && title.unlockLevel <= playerLevel) || 
    (title.unlockAchievement && unlockedAchievements.includes(title.unlockAchievement))
  );
}

export function getLevelFromExp(exp: number) {
  let currentLevel = LEVELS[0];
  let nextLevel = LEVELS[1] || null;
  
  for (let i = 1; i < LEVELS.length; i++) {
    if (exp < LEVELS[i].expRequired) {
      currentLevel = LEVELS[i-1];
      nextLevel = LEVELS[i];
      break;
    }
    
    if (i === LEVELS.length - 1) {
      currentLevel = LEVELS[i];
      nextLevel = null;
    }
  }
  
  const progress = nextLevel 
    ? ((exp - currentLevel.expRequired) / (nextLevel.expRequired - currentLevel.expRequired)) * 100
    : 100;
  
  return {
    currentLevel,
    nextLevel,
    progress
  };
}
