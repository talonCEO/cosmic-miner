import { GameState } from '@/context/GameContext';

export interface LevelRewards {
  skillPoints: number;
  essence?: number;
  gems?: number;
  unlocksTitle?: string;
  unlocksPortrait?: string;
}

export const LEVEL_REWARDS: Record<number, LevelRewards> = {
  // Starting levels
  1: { skillPoints: 1 },
  2: { skillPoints: 1 },
  3: { skillPoints: 1 },
  4: { skillPoints: 1 },
  5: { skillPoints: 2, gems: 10, unlocksTitle: 'novice_miner' },

  // Early levels
  6: { skillPoints: 1 },
  7: { skillPoints: 1 },
  8: { skillPoints: 1 },
  9: { skillPoints: 1 },
  10: { skillPoints: 2, essence: 1, unlocksPortrait: 'miner_1' },

  // Mid levels
  11: { skillPoints: 1 },
  12: { skillPoints: 1 },
  13: { skillPoints: 1 },
  14: { skillPoints: 1 },
  15: { skillPoints: 2, gems: 20, unlocksTitle: 'asteroid_explorer' },

  // Higher levels
  16: { skillPoints: 1 },
  17: { skillPoints: 1 },
  18: { skillPoints: 1 },
  19: { skillPoints: 1 },
  20: { skillPoints: 3, essence: 2, unlocksPortrait: 'explorer_1' },

  // Advanced levels
  21: { skillPoints: 2 },
  22: { skillPoints: 2 },
  23: { skillPoints: 2 },
  24: { skillPoints: 2 },
  25: { skillPoints: 4, gems: 30, unlocksTitle: 'galactic_pioneer' },

   // Even higher levels
  26: { skillPoints: 2 },
  27: { skillPoints: 2 },
  28: { skillPoints: 2 },
  29: { skillPoints: 2 },
  30: { skillPoints: 5, essence: 3, unlocksPortrait: 'pioneer_1' },

  // Very high levels
  31: { skillPoints: 3 },
  32: { skillPoints: 3 },
  33: { skillPoints: 3 },
  34: { skillPoints: 3 },
  35: { skillPoints: 6, gems: 40, unlocksTitle: 'cosmic_voyager' },

  // Extremely high levels
  36: { skillPoints: 3 },
  37: { skillPoints: 3 },
  38: { skillPoints: 3 },
  39: { skillPoints: 3 },
  40: { skillPoints: 7, essence: 4, unlocksPortrait: 'voyager_1' },

  // Near maximum levels
  41: { skillPoints: 4 },
  42: { skillPoints: 4 },
  43: { skillPoints: 4 },
  44: { skillPoints: 4 },
  45: { skillPoints: 8, gems: 50, unlocksTitle: 'interstellar_tycoon' },

  // Maximum levels
  46: { skillPoints: 4 },
  47: { skillPoints: 4 },
  48: { skillPoints: 4 },
  49: { skillPoints: 4 },
  50: { skillPoints: 10, essence: 5, unlocksPortrait: 'tycoon_1' },
};

export const handleLevelUp = (level: number, state: GameState, dispatch: React.Dispatch<any>) => {
  const rewards = LEVEL_REWARDS[level];

  if (rewards) {
    // Award skill points
    dispatch({ type: 'ADD_SKILL_POINTS', amount: rewards.skillPoints });

    // Award essence if available
    if (rewards.essence) {
      dispatch({ type: 'ADD_ESSENCE', amount: rewards.essence });
    }

    // Award gems if available
    if (rewards.gems) {
      dispatch({ type: 'ADD_GEMS', amount: rewards.gems });
    }

    // Unlock title if available
    if (rewards.unlocksTitle) {
      dispatch({ type: 'RESTORE_STATE_PROPERTY', property: 'title', value: rewards.unlocksTitle });
    }

    // Unlock portrait if available
    if (rewards.unlocksPortrait) {
      dispatch({ type: 'RESTORE_STATE_PROPERTY', property: 'portrait', value: rewards.unlocksPortrait });
    }
  }
};
