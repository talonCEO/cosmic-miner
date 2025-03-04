import React, { createContext, useContext, useReducer, useEffect, ReactNode } from 'react';
import { upgradesList } from '@/utils/upgradesData';
import { managers } from '@/utils/managersData';
import { artifacts } from '@/utils/artifactsData';

// Achievement interface
export interface Achievement {
  id: string;
  name: string;
  description: string;
  unlocked: boolean;
  checkCondition: (state: GameState) => boolean;
}

// Game state interface
export interface GameState {
  coins: number;
  coinsPerClick: number;
  coinsPerSecond: number;
  upgrades: Upgrade[];
  totalClicks: number;
  totalEarned: number;
  autoBuy: boolean;
  essence: number;
  ownedManagers: string[];
  ownedArtifacts: string[];
  achievements: Achievement[];
  achievementsChecked: Record<string, boolean>;
  managers: typeof managers;
  artifacts: typeof artifacts;
}

// Upgrade interface
export interface Upgrade {
  id: string;
  name: string;
  description: string;
  cost: number;
  baseCost: number;
  level: number;
  maxLevel: number;
  coinsPerClickBonus: number;
  coinsPerSecondBonus: number;
  multiplierBonus: number;
  icon: string;
  unlocked: boolean;
  unlocksAt?: {
    upgradeId: string;
    level: number;
  };
  category: string;
}

// Action types
type GameAction =
  | { type: 'CLICK' }
  | { type: 'ADD_COINS'; amount: number }
  | { type: 'BUY_UPGRADE'; upgradeId: string; quantity?: number }
  | { type: 'TOGGLE_AUTO_BUY' }
  | { type: 'TICK' }
  | { type: 'PRESTIGE' }
  | { type: 'BUY_MANAGER'; managerId: string }
  | { type: 'BUY_ARTIFACT'; artifactId: string }
  | { type: 'UNLOCK_ACHIEVEMENT'; achievementId: string }
  | { type: 'CHECK_ACHIEVEMENTS' };

// Create achievements based on upgrades
const createAchievements = (): Achievement[] => {
  const achievementsList: Achievement[] = upgradesList.map(upgrade => ({
    id: `${upgrade.id}-mastery`,
    name: `${upgrade.name} Mastery`,
    description: `Reach level 1000 with ${upgrade.name}`,
    unlocked: false,
    checkCondition: (state: GameState) => {
      const currentUpgrade = state.upgrades.find(u => u.id === upgrade.id);
      return currentUpgrade ? currentUpgrade.level >= 1000 : false;
    }
  }));

  return achievementsList;
};

// Updated upgrades with increased maxLevel
const updatedUpgradesList = upgradesList.map(upgrade => ({
  ...upgrade,
  maxLevel: 1000, // Update max level to 1000
  coinsPerSecondBonus: upgrade.coinsPerSecondBonus * 10 // Multiply passive income by 10
}));

// Initial game state
const initialState: GameState = {
  coins: 0,
  coinsPerClick: 1,
  coinsPerSecond: 0,
  upgrades: updatedUpgradesList,
  totalClicks: 0,
  totalEarned: 0,
  autoBuy: false,
  essence: 0,
  ownedManagers: [],
  ownedArtifacts: [],
  achievements: createAchievements(),
  achievementsChecked: {},
  managers: managers,
  artifacts: artifacts
};

// Helper function to calculate the total cost of buying multiple upgrades
const calculateBulkCost = (baseCost: number, currentLevel: number, quantity: number): number => {
  let totalCost = 0;
  for (let i = 0; i < quantity; i++) {
    totalCost += Math.floor(baseCost * Math.pow(1.15, currentLevel + i));
  }
  return totalCost;
};

// Helper function to calculate potential essence reward
const calculateEssenceReward = (totalEarned: number): number => {
  return Math.floor(totalEarned / 100000);
};

// Game reducer
const gameReducer = (state: GameState, action: GameAction): GameState => {
  switch (action.type) {
    case 'CLICK':
      return {
        ...state,
        coins: state.coins + state.coinsPerClick,
        totalClicks: state.totalClicks + 1,
        totalEarned: state.totalEarned + state.coinsPerClick
      };
    case 'ADD_COINS':
      return {
        ...state,
        coins: state.coins + action.amount,
        totalEarned: state.totalEarned + action.amount
      };
    case 'BUY_UPGRADE': {
      const upgradeIndex = state.upgrades.findIndex(u => u.id === action.upgradeId);
      
      if (upgradeIndex === -1) return state;
      
      const upgrade = state.upgrades[upgradeIndex];
      const quantity = action.quantity || 1;
      
      if (upgrade.level >= upgrade.maxLevel) return state;
      
      // Calculate how many levels we can buy (up to requested quantity)
      const maxPossibleQuantity = Math.min(
        quantity, 
        upgrade.maxLevel - upgrade.level
      );
      
      // Calculate total cost for bulk purchase
      const totalCost = calculateBulkCost(upgrade.baseCost, upgrade.level, maxPossibleQuantity);
      
      // Check if player can afford it
      if (state.coins < totalCost) return state;
      
      // Calculate new stats with all purchased levels
      const newCoinsPerClick = state.coinsPerClick + (upgrade.coinsPerClickBonus * maxPossibleQuantity);
      const newCoinsPerSecond = state.coinsPerSecond + (upgrade.coinsPerSecondBonus * maxPossibleQuantity);
      
      // Update the upgrade
      const updatedUpgrade = {
        ...upgrade,
        level: upgrade.level + maxPossibleQuantity,
        cost: Math.floor(upgrade.baseCost * Math.pow(1.15, upgrade.level + maxPossibleQuantity))
      };
      
      // Create a new upgrades array
      const newUpgrades = [...state.upgrades];
      newUpgrades[upgradeIndex] = updatedUpgrade;
      
      // Check for unlocks based on this upgrade purchase
      state.upgrades.forEach((u, index) => {
        if (!u.unlocked && u.unlocksAt && 
            u.unlocksAt.upgradeId === upgrade.id && 
            updatedUpgrade.level >= u.unlocksAt.level) {
          newUpgrades[index] = { ...newUpgrades[index], unlocked: true };
        }
      });
      
      return {
        ...state,
        coins: state.coins - totalCost,
        coinsPerClick: newCoinsPerClick,
        coinsPerSecond: newCoinsPerSecond,
        upgrades: newUpgrades
      };
    }
    case 'TOGGLE_AUTO_BUY':
      return {
        ...state,
        autoBuy: !state.autoBuy
      };
    case 'TICK': {
      let newState = { ...state };
      
      if (state.coinsPerSecond > 0) {
        newState = {
          ...newState,
          coins: newState.coins + state.coinsPerSecond / 10,
          totalEarned: newState.totalEarned + state.coinsPerSecond / 10
        };
      }
      
      // Auto-buy logic
      if (newState.autoBuy) {
        // Find the cheapest affordable and unlocked upgrade
        const affordableUpgrades = newState.upgrades
          .filter(u => u.unlocked && u.level < u.maxLevel && newState.coins >= u.cost)
          .sort((a, b) => a.cost - b.cost);
        
        if (affordableUpgrades.length > 0) {
          const cheapestUpgrade = affordableUpgrades[0];
          
          // Execute the purchase
          const upgradeIndex = newState.upgrades.findIndex(u => u.id === cheapestUpgrade.id);
          
          // Calculate new stats
          const newCoinsPerClick = newState.coinsPerClick + cheapestUpgrade.coinsPerClickBonus;
          const newCoinsPerSecond = newState.coinsPerSecond + cheapestUpgrade.coinsPerSecondBonus;
          
          // Update the upgrade
          const updatedUpgrade = {
            ...cheapestUpgrade,
            level: cheapestUpgrade.level + 1,
            cost: Math.floor(cheapestUpgrade.baseCost * Math.pow(1.15, cheapestUpgrade.level + 1))
          };
          
          // Create a new upgrades array
          const newUpgrades = [...newState.upgrades];
          newUpgrades[upgradeIndex] = updatedUpgrade;
          
          // Check for unlocks based on this upgrade purchase
          newState.upgrades.forEach((u, index) => {
            if (!u.unlocked && u.unlocksAt && 
                u.unlocksAt.upgradeId === cheapestUpgrade.id && 
                updatedUpgrade.level >= u.unlocksAt.level) {
              newUpgrades[index] = { ...newUpgrades[index], unlocked: true };
            }
          });
          
          newState = {
            ...newState,
            coins: newState.coins - cheapestUpgrade.cost,
            coinsPerClick: newCoinsPerClick,
            coinsPerSecond: newCoinsPerSecond,
            upgrades: newUpgrades
          };
        }
      }
      
      return newState;
    }
    case 'PRESTIGE': {
      const essenceReward = calculateEssenceReward(state.totalEarned);
      
      // Reset progress but keep essence, managers, artifacts, and achievements
      return {
        ...initialState,
        essence: state.essence + essenceReward,
        ownedManagers: state.ownedManagers,
        ownedArtifacts: state.ownedArtifacts,
        achievements: state.achievements,
        achievementsChecked: state.achievementsChecked,
        managers: state.managers,
        artifacts: state.artifacts
      };
    }
    case 'BUY_MANAGER': {
      const manager = managers.find(m => m.id === action.managerId);
      
      if (!manager || state.ownedManagers.includes(action.managerId) || state.essence < manager.cost) {
        return state;
      }
      
      return {
        ...state,
        essence: state.essence - manager.cost,
        ownedManagers: [...state.ownedManagers, action.managerId]
      };
    }
    case 'BUY_ARTIFACT': {
      const artifact = artifacts.find(a => a.id === action.artifactId);
      
      if (!artifact || state.ownedArtifacts.includes(action.artifactId) || state.essence < artifact.cost) {
        return state;
      }
      
      return {
        ...state,
        essence: state.essence - artifact.cost,
        ownedArtifacts: [...state.ownedArtifacts, action.artifactId]
      };
    }
    case 'UNLOCK_ACHIEVEMENT': {
      const achievementIndex = state.achievements.findIndex(a => a.id === action.achievementId);
      
      if (achievementIndex === -1 || state.achievements[achievementIndex].unlocked) {
        return state;
      }
      
      const newAchievements = [...state.achievements];
      newAchievements[achievementIndex] = {
        ...newAchievements[achievementIndex],
        unlocked: true
      };
      
      return {
        ...state,
        achievements: newAchievements,
        achievementsChecked: {
          ...state.achievementsChecked,
          [action.achievementId]: true
        }
      };
    }
    case 'CHECK_ACHIEVEMENTS': {
      // Check each achievement that hasn't been unlocked yet
      const unlockableAchievements = state.achievements
        .filter(a => !a.unlocked && !state.achievementsChecked[a.id])
        .filter(a => a.checkCondition(state));
      
      if (unlockableAchievements.length === 0) {
        return state;
      }
      
      const newAchievements = [...state.achievements];
      const newAchievementsChecked = { ...state.achievementsChecked };
      
      unlockableAchievements.forEach(achievement => {
        const index = newAchievements.findIndex(a => a.id === achievement.id);
        newAchievements[index] = { ...newAchievements[index], unlocked: true };
        newAchievementsChecked[achievement.id] = true;
      });
      
      return {
        ...state,
        achievements: newAchievements,
        achievementsChecked: newAchievementsChecked
      };
    }
    default:
      return state;
  }
};

// Create the context
type GameContextType = {
  state: GameState;
  handleClick: () => void;
  buyUpgrade: (upgradeId: string, quantity?: number) => void;
  toggleAutoBuy: () => void;
  prestige: () => void;
  calculateEssenceReward: (totalEarned: number) => number;
  buyManager: (managerId: string) => void;
  buyArtifact: (artifactId: string) => void;
  checkAchievements: () => void;
  unlockAchievement: (achievementId: string) => void;
};

const GameContext = createContext<GameContextType | undefined>(undefined);

// Create provider component
export const GameProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [state, dispatch] = useReducer(gameReducer, initialState);

  // Handle click action
  const handleClick = () => {
    dispatch({ type: 'CLICK' });
  };

  // Buy upgrade
  const buyUpgrade = (upgradeId: string, quantity: number = 1) => {
    dispatch({ type: 'BUY_UPGRADE', upgradeId, quantity });
  };

  // Toggle auto-buy
  const toggleAutoBuy = () => {
    dispatch({ type: 'TOGGLE_AUTO_BUY' });
  };
  
  // Prestige function
  const prestige = () => {
    dispatch({ type: 'PRESTIGE' });
  };
  
  // Buy manager
  const buyManager = (managerId: string) => {
    dispatch({ type: 'BUY_MANAGER', managerId });
  };
  
  // Buy artifact
  const buyArtifact = (artifactId: string) => {
    dispatch({ type: 'BUY_ARTIFACT', artifactId });
  };
  
  // Check achievements
  const checkAchievements = () => {
    dispatch({ type: 'CHECK_ACHIEVEMENTS' });
  };
  
  // Unlock specific achievement
  const unlockAchievement = (achievementId: string) => {
    dispatch({ type: 'UNLOCK_ACHIEVEMENT', achievementId });
  };

  // Set up the automatic tick for passive income and achievement checking
  useEffect(() => {
    const interval = setInterval(() => {
      dispatch({ type: 'TICK' });
      
      // Check achievements every second (every 10 ticks)
      if (Math.random() < 0.1) {
        checkAchievements();
      }
    }, 100); // 10 ticks per second for smooth animation

    return () => clearInterval(interval);
  }, []);
  
  // Check for newly unlocked achievements and show notification
  const previousAchievementsRef = React.useRef<Achievement[]>(state.achievements);
  
  useEffect(() => {
    const prevUnlocked = previousAchievementsRef.current.filter(a => a.unlocked).length;
    const currentUnlocked = state.achievements.filter(a => a.unlocked).length;
    
    // If we've unlocked new achievements
    if (currentUnlocked > prevUnlocked) {
      // Find newly unlocked achievements
      const newlyUnlocked = state.achievements.filter(a => {
        const prev = previousAchievementsRef.current.find(p => p.id === a.id);
        return a.unlocked && prev && !prev.unlocked;
      });
      
      // Show notifications for each
      newlyUnlocked.forEach(achievement => {
        // Use browser notification API
        if ("Notification" in window && Notification.permission === "granted") {
          new Notification("Achievement Unlocked!", {
            body: `${achievement.name}: ${achievement.description}`,
            icon: "/favicon.ico"
          });
        }
      });
    }
    
    previousAchievementsRef.current = state.achievements;
  }, [state.achievements]);

  return (
    <GameContext.Provider value={{ 
      state, 
      handleClick, 
      buyUpgrade, 
      toggleAutoBuy, 
      prestige,
      calculateEssenceReward,
      buyManager,
      buyArtifact,
      checkAchievements,
      unlockAchievement
    }}>
      {children}
    </GameContext.Provider>
  );
};

// Create custom hook to use the game context
export const useGame = (): GameContextType => {
  const context = useContext(GameContext);
  if (context === undefined) {
    throw new Error('useGame must be used within a GameProvider');
  }
  return context;
};
