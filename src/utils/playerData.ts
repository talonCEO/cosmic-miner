
/**
 * Player leveling and progression data
 */

// Level thresholds - amount of XP needed for each level (1-100)
// Using an exponential growth formula: baseXP * (level ^ scaleFactor)
export const calculateLevelThreshold = (level: number): number => {
  const baseXP = 100;
  const scaleFactor = 1.5;
  return Math.floor(baseXP * Math.pow(level, scaleFactor));
};

// Pre-calculated level thresholds for all 100 levels
export const levelThresholds: number[] = Array.from({ length: 101 }, (_, i) => {
  // Level 0 is 0 XP (never used, just for array indexing)
  if (i === 0) return 0;
  return calculateLevelThreshold(i);
});

// Calculate which level a player is based on their XP
export const calculatePlayerLevel = (xp: number): number => {
  let level = 1;
  
  // Find the highest level the player has enough XP for
  while (level < 100 && xp >= levelThresholds[level + 1]) {
    level++;
  }
  
  return level;
};

// Calculate XP needed for next level
export const calculateXPForNextLevel = (currentLevel: number): number => {
  if (currentLevel >= 100) return 0; // Max level
  return levelThresholds[currentLevel + 1];
};

// Calculate current progress towards next level (0-100%)
export const calculateLevelProgress = (xp: number): number => {
  const currentLevel = calculatePlayerLevel(xp);
  if (currentLevel >= 100) return 100; // Max level
  
  const currentLevelXP = levelThresholds[currentLevel];
  const nextLevelXP = levelThresholds[currentLevel + 1];
  const xpInCurrentLevel = xp - currentLevelXP;
  const xpNeededForNextLevel = nextLevelXP - currentLevelXP;
  
  return Math.min(100, Math.floor((xpInCurrentLevel / xpNeededForNextLevel) * 100));
};

// Player titles that unlock at different levels
export interface PlayerTitle {
  id: string;
  name: string;
  description: string;
  unlocksAtLevel: number;
  color?: string; // Optional color for the title text
}

export const playerTitles: PlayerTitle[] = [
  {
    id: "title-1",
    name: "Space Pilot",
    description: "A rookie explorer of the cosmos.",
    unlocksAtLevel: 1,
    color: "text-blue-400"
  },
  {
    id: "title-2",
    name: "Asteroid Miner",
    description: "Skilled at extracting resources from space rocks.",
    unlocksAtLevel: 5,
    color: "text-gray-300"
  },
  {
    id: "title-3",
    name: "Stellar Prospector",
    description: "An experienced harvester of stellar materials.",
    unlocksAtLevel: 10,
    color: "text-yellow-400"
  },
  {
    id: "title-4",
    name: "Cosmic Excavator",
    description: "Delves deep into the mysteries of space.",
    unlocksAtLevel: 20,
    color: "text-purple-400"
  },
  {
    id: "title-5",
    name: "Galactic Engineer",
    description: "Masters the mechanics of cosmic mining.",
    unlocksAtLevel: 30,
    color: "text-orange-400"
  },
  {
    id: "title-6",
    name: "Void Technician",
    description: "Manipulates the fabric of space for resources.",
    unlocksAtLevel: 40,
    color: "text-indigo-500"
  },
  {
    id: "title-7",
    name: "Nebula Commander",
    description: "Controls vast fleets of mining operations.",
    unlocksAtLevel: 50,
    color: "text-pink-500"
  },
  {
    id: "title-8",
    name: "Quantum Harvester",
    description: "Extracts resources from multiple dimensions.",
    unlocksAtLevel: 65,
    color: "text-green-400"
  },
  {
    id: "title-9",
    name: "Star Forger",
    description: "Creates new stellar bodies from harvested resources.",
    unlocksAtLevel: 80,
    color: "text-amber-500"
  },
  {
    id: "title-10",
    name: "Cosmic Architect",
    description: "Shapes the universe to their will.",
    unlocksAtLevel: 100,
    color: "text-gradient-to-r from-purple-500 to-pink-500"
  }
];

// Avatar borders that unlock at different levels
export interface AvatarBorder {
  id: string;
  name: string;
  description: string;
  unlocksAtLevel: number;
  borderClass: string; // CSS classes for the border styling
}

export const avatarBorders: AvatarBorder[] = [
  {
    id: "border-1",
    name: "Standard",
    description: "A basic border for new cosmic miners.",
    unlocksAtLevel: 1,
    borderClass: "border-2 border-slate-400"
  },
  {
    id: "border-2",
    name: "Bronze",
    description: "A bronze border for persistent miners.",
    unlocksAtLevel: 15,
    borderClass: "border-2 border-amber-600"
  },
  {
    id: "border-3",
    name: "Silver",
    description: "A silver border for accomplished miners.",
    unlocksAtLevel: 35,
    borderClass: "border-2 border-slate-300"
  },
  {
    id: "border-4",
    name: "Gold",
    description: "A gold border for elite miners.",
    unlocksAtLevel: 60,
    borderClass: "border-2 border-yellow-400"
  },
  {
    id: "border-5",
    name: "Cosmic",
    description: "A mystical border infused with cosmic energy.",
    unlocksAtLevel: 100,
    borderClass: "border-2 border-gradient-to-r from-purple-500 via-pink-500 to-red-500 animate-pulse"
  }
];

// Get the highest unlocked title for a given level
export const getHighestUnlockedTitle = (level: number): PlayerTitle => {
  return [...playerTitles]
    .filter(title => title.unlocksAtLevel <= level)
    .sort((a, b) => b.unlocksAtLevel - a.unlocksAtLevel)[0];
};

// Get the highest unlocked border for a given level
export const getHighestUnlockedBorder = (level: number): AvatarBorder => {
  return [...avatarBorders]
    .filter(border => border.unlocksAtLevel <= level)
    .sort((a, b) => b.unlocksAtLevel - a.unlocksAtLevel)[0];
};

// Get all unlocked titles for a given level
export const getUnlockedTitles = (level: number): PlayerTitle[] => {
  return playerTitles.filter(title => title.unlocksAtLevel <= level);
};

// Get all unlocked borders for a given level
export const getUnlockedBorders = (level: number): AvatarBorder[] => {
  return avatarBorders.filter(border => border.unlocksAtLevel <= level);
};
