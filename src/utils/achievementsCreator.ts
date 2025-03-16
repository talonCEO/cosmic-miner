
import { Achievement, GameStateType as GameState } from '@/utils/GameTypes';

/**
 * Create all game achievements
 */
export const createAchievements = (): Achievement[] => {
  return [
    // Clicking achievements
    {
      id: 'clicks-1',
      name: 'Mining Apprentice',
      description: 'Tap 100 times',
      unlocked: false,
      checkCondition: (state: GameState) => state.totalClicks >= 100
    },
    {
      id: 'clicks-2',
      name: 'Mining Enthusiast',
      description: 'Tap 1,000 times',
      unlocked: false,
      checkCondition: (state: GameState) => state.totalClicks >= 1000
    },
    {
      id: 'clicks-3',
      name: 'Mining Expert',
      description: 'Tap 10,000 times',
      unlocked: false,
      checkCondition: (state: GameState) => state.totalClicks >= 10000
    },
    {
      id: 'clicks-4',
      name: 'Mining Master',
      description: 'Tap 100,000 times',
      unlocked: false,
      checkCondition: (state: GameState) => state.totalClicks >= 100000
    },
    {
      id: 'clicks-5',
      name: 'Mining Legend',
      description: 'Tap 1,000,000 times',
      unlocked: false,
      checkCondition: (state: GameState) => state.totalClicks >= 1000000
    },
    
    // Income achievements
    {
      id: 'income-1',
      name: 'First Profit',
      description: 'Earn 1,000 coins',
      unlocked: false,
      checkCondition: (state: GameState) => state.totalEarned >= 1000
    },
    {
      id: 'income-2',
      name: 'Rising Business',
      description: 'Earn 1,000,000 coins',
      unlocked: false,
      checkCondition: (state: GameState) => state.totalEarned >= 1000000
    },
    {
      id: 'income-3',
      name: 'Mining Corporation',
      description: 'Earn 1,000,000,000 coins',
      unlocked: false,
      checkCondition: (state: GameState) => state.totalEarned >= 1000000000
    },
    {
      id: 'income-4',
      name: 'Galactic Enterprise',
      description: 'Earn 1,000,000,000,000 coins',
      unlocked: false,
      checkCondition: (state: GameState) => state.totalEarned >= 1000000000000
    },
    {
      id: 'income-5',
      name: 'Universal Conglomerate',
      description: 'Earn 1,000,000,000,000,000 coins',
      unlocked: false,
      checkCondition: (state: GameState) => state.totalEarned >= 1000000000000000
    },
    
    // Upgrade achievements
    {
      id: 'upgrades-1',
      name: 'Building Elements',
      description: 'Purchase 10 element upgrades',
      unlocked: false,
      checkCondition: (state: GameState) => {
        const upgradeCount = state.upgrades
          .filter(u => u.category === 'element' && u.level > 0)
          .length;
        return upgradeCount >= 10;
      }
    },
    {
      id: 'upgrades-2',
      name: 'Elemental Explorer',
      description: 'Purchase 25 element upgrades',
      unlocked: false,
      checkCondition: (state: GameState) => {
        const upgradeCount = state.upgrades
          .filter(u => u.category === 'element' && u.level > 0)
          .length;
        return upgradeCount >= 25;
      }
    },
    {
      id: 'upgrades-3',
      name: 'Elemental Mastery',
      description: 'Purchase all element upgrades',
      unlocked: false,
      checkCondition: (state: GameState) => {
        const elementsWithLevels = state.upgrades
          .filter(u => u.category === 'element' && u.level > 0)
          .length;
        const totalElements = state.upgrades
          .filter(u => u.category === 'element')
          .length;
        return elementsWithLevels === totalElements && totalElements > 0;
      }
    },
    {
      id: 'level-1',
      name: 'Enhancement Beginner',
      description: 'Get any upgrade to level 50',
      unlocked: false,
      checkCondition: (state: GameState) => {
        return state.upgrades.some(u => u.level >= 50);
      }
    },
    {
      id: 'level-2',
      name: 'Enhancement Pro',
      description: 'Get any upgrade to level 100',
      unlocked: false,
      checkCondition: (state: GameState) => {
        return state.upgrades.some(u => u.level >= 100);
      }
    },
    {
      id: 'level-3',
      name: 'Enhancement Master',
      description: 'Get any upgrade to level 500',
      unlocked: false,
      checkCondition: (state: GameState) => {
        return state.upgrades.some(u => u.level >= 500);
      }
    },
    
    // Prestige achievements
    {
      id: 'prestige-1',
      name: 'Fresh Start',
      description: 'Prestige for the first time',
      unlocked: false,
      checkCondition: (state: GameState) => state.prestigeCount >= 1
    },
    {
      id: 'prestige-2',
      name: 'Cycle of Rebirth',
      description: 'Prestige 5 times',
      unlocked: false,
      checkCondition: (state: GameState) => state.prestigeCount >= 5
    },
    {
      id: 'prestige-3',
      name: 'Perpetual Renewal',
      description: 'Prestige 10 times',
      unlocked: false,
      checkCondition: (state: GameState) => state.prestigeCount >= 10
    },
    {
      id: 'prestige-4',
      name: 'Master of Reincarnation',
      description: 'Prestige 25 times',
      unlocked: false,
      checkCondition: (state: GameState) => state.prestigeCount >= 25
    },
    
    // Special achievements
    {
      id: 'passive-1',
      name: 'Automation Beginner',
      description: 'Reach 1,000 coins per second',
      unlocked: false,
      checkCondition: (state: GameState) => state.coinsPerSecond >= 1000
    },
    {
      id: 'passive-2',
      name: 'Automation Expert',
      description: 'Reach 1,000,000 coins per second',
      unlocked: false,
      checkCondition: (state: GameState) => state.coinsPerSecond >= 1000000
    },
    {
      id: 'passive-3',
      name: 'Automation Master',
      description: 'Reach 1,000,000,000 coins per second',
      unlocked: false,
      checkCondition: (state: GameState) => state.coinsPerSecond >= 1000000000
    },
    {
      id: 'collection-1',
      name: 'Artifact Collector',
      description: 'Own 5 artifacts',
      unlocked: false,
      checkCondition: (state: GameState) => state.ownedArtifacts.length >= 5
    },
    {
      id: 'collection-2',
      name: 'Rare Collector',
      description: 'Own all artifacts',
      unlocked: false,
      checkCondition: (state: GameState) => {
        const allArtifactsCount = state.artifacts.length;
        return state.ownedArtifacts.length >= allArtifactsCount;
      }
    },
    {
      id: 'abilities-1',
      name: 'Tech Pioneer',
      description: 'Unlock 5 abilities',
      unlocked: false,
      checkCondition: (state: GameState) => {
        return state.abilities.filter(a => a.unlocked).length >= 5;
      }
    },
    {
      id: 'abilities-2',
      name: 'Tech Visionary',
      description: 'Unlock all abilities',
      unlocked: false,
      checkCondition: (state: GameState) => {
        const unlockedAbilities = state.abilities.filter(a => a.unlocked).length;
        return unlockedAbilities === state.abilities.length && unlockedAbilities > 0;
      }
    }
  ];
};
