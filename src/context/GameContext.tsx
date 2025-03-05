
import React, { createContext, useContext, useReducer, useEffect, ReactNode } from 'react';
import { upgradesList } from '@/utils/upgradesData';
import { managers } from '@/utils/managersData';
import { artifacts } from '@/utils/artifactsData';
import { Shield, Zap, Brain, Star, TargetIcon, HandCoins, Trophy, CloudLightning, Gem } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';

// Achievement interface
export interface Achievement {
  id: string;
  name: string;
  description: string;
  unlocked: boolean;
  checkCondition: (state: GameState) => boolean;
}

// Ability interface
export interface Ability {
  id: string;
  name: string;
  description: string;
  cost: number;
  icon: React.ReactNode;
  unlocked: boolean;
  requiredAbilities: string[];
  row: number;
  column: number;
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
  autoTap: boolean;
  essence: number;
  ownedManagers: string[];
  ownedArtifacts: string[];
  achievements: Achievement[];
  achievementsChecked: Record<string, boolean>;
  managers: typeof managers;
  artifacts: typeof artifacts;
  prestigeCount: number;
  incomeMultiplier: number;
  skillPoints: number;
  abilities: Ability[];
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
  | { type: 'ADD_ESSENCE'; amount: number }
  | { type: 'BUY_UPGRADE'; upgradeId: string; quantity?: number }
  | { type: 'TOGGLE_AUTO_BUY' }
  | { type: 'TOGGLE_AUTO_TAP' }
  | { type: 'SET_INCOME_MULTIPLIER'; multiplier: number }
  | { type: 'TICK' }
  | { type: 'PRESTIGE' }
  | { type: 'BUY_MANAGER'; managerId: string }
  | { type: 'BUY_ARTIFACT'; artifactId: string }
  | { type: 'UNLOCK_ACHIEVEMENT'; achievementId: string }
  | { type: 'CHECK_ACHIEVEMENTS' }
  | { type: 'UNLOCK_ABILITY'; abilityId: string }
  | { type: 'ADD_SKILL_POINTS'; amount: number }
  | { type: 'SHOW_SKILL_POINT_NOTIFICATION'; reason: string };

// Create achievements based on upgrades and other collectibles
const createAchievements = (): Achievement[] => {
  // Upgrade level achievements
  const upgradeAchievements: Achievement[] = upgradesList.map(upgrade => ({
    id: `${upgrade.id}-mastery`,
    name: `${upgrade.name} Mastery`,
    description: `Reach level 1000 with ${upgrade.name}`,
    unlocked: false,
    checkCondition: (state: GameState) => {
      const currentUpgrade = state.upgrades.find(u => u.id === upgrade.id);
      return currentUpgrade ? currentUpgrade.level >= 1000 : false;
    }
  }));

  // Manager achievements
  const managerAchievements: Achievement[] = managers
    .filter(manager => manager.id !== "manager-default")
    .map(manager => ({
      id: `manager-achievement-${manager.id}`,
      name: `Hired: ${manager.name}`,
      description: `Hired manager ${manager.name}`,
      unlocked: false,
      checkCondition: (state: GameState) => state.ownedManagers.includes(manager.id)
    }));

  // Artifact achievements
  const artifactAchievements: Achievement[] = artifacts
    .filter(artifact => artifact.id !== "artifact-default")
    .map(artifact => ({
      id: `artifact-achievement-${artifact.id}`,
      name: `Discovered: ${artifact.name}`,
      description: `Found the ${artifact.name} artifact`,
      unlocked: false,
      checkCondition: (state: GameState) => state.ownedArtifacts.includes(artifact.id)
    }));
  
  // Combine all achievement types
  return [...upgradeAchievements, ...managerAchievements, ...artifactAchievements];
};

// Updated upgrades with increased cost (50% more) and maxLevel
const updatedUpgradesList = upgradesList.map(upgrade => ({
  ...upgrade,
  maxLevel: 1000,
  cost: upgrade.baseCost * 1.5, // 50% increase in cost
  baseCost: upgrade.baseCost * 1.5, // 50% increase in base cost
  coinsPerSecondBonus: upgrade.coinsPerSecondBonus * 0.5 // 50% decrease to passive income
}));

// Initial abilities for the tech tree - redesigned with new tiers
const initialAbilities: Ability[] = [
  // Tier 1 (row 1) - Center ability (unlocked by default)
  {
    id: "ability-1",
    name: "Cosmic Awakening",
    description: "Your first connection to the cosmic energy, unlocking your potential for growth.",
    cost: 0,
    icon: <Star className="text-yellow-300" size={24} />,
    unlocked: true,
    requiredAbilities: [],
    row: 1,
    column: 2
  },
  
  // Tier 2 (row 2) - Three abilities requiring Tier 1
  {
    id: "ability-2",
    name: "Energy Conversion",
    description: "Convert cosmic energy directly into mining power, increasing tap value by 50%.",
    cost: 3,
    icon: <Zap className="text-blue-300" size={24} />,
    unlocked: false,
    requiredAbilities: ["ability-1"],
    row: 2,
    column: 1
  },
  {
    id: "ability-3",
    name: "Neural Enhancement",
    description: "Improve your mental capabilities, increasing all production by 25%.",
    cost: 3,
    icon: <Brain className="text-purple-300" size={24} />,
    unlocked: false,
    requiredAbilities: ["ability-1"],
    row: 2,
    column: 2
  },
  {
    id: "ability-4",
    name: "Protective Field",
    description: "Generate a protective field that reduces upgrade costs by 10%.",
    cost: 3,
    icon: <Shield className="text-green-300" size={24} />,
    unlocked: false,
    requiredAbilities: ["ability-1"],
    row: 2,
    column: 3
  },
  
  // Tier 3 (row 3) - Three abilities requiring Tier 2
  {
    id: "ability-5",
    name: "Precision Strike",
    description: "Your taps have a 10% chance to hit for 5x normal damage.",
    cost: 5,
    icon: <TargetIcon className="text-red-300" size={24} />,
    unlocked: false,
    requiredAbilities: ["ability-2"],
    row: 3,
    column: 1
  },
  {
    id: "ability-6",
    name: "Wealth Magnetism",
    description: "Attract cosmic wealth, increasing all coin gains by 30%.",
    cost: 5,
    icon: <HandCoins className="text-amber-300" size={24} />,
    unlocked: false,
    requiredAbilities: ["ability-3"],
    row: 3,
    column: 2
  },
  {
    id: "ability-7",
    name: "Achievement Hunter",
    description: "Gain 1 skill point for each achievement you complete.",
    cost: 5,
    icon: <Trophy className="text-yellow-300" size={24} />,
    unlocked: false,
    requiredAbilities: ["ability-4"],
    row: 3,
    column: 3
  }
];

// Initial game state
const initialState: GameState = {
  coins: 0,
  coinsPerClick: 1,
  coinsPerSecond: 0,
  upgrades: updatedUpgradesList,
  totalClicks: 0,
  totalEarned: 0,
  autoBuy: false,
  autoTap: false,
  essence: 0,
  ownedManagers: ["manager-default"],
  ownedArtifacts: ["artifact-default"],
  achievements: createAchievements(),
  achievementsChecked: {},
  managers: managers,
  artifacts: artifacts,
  prestigeCount: 0,
  incomeMultiplier: 1.0,
  skillPoints: 0,
  abilities: initialAbilities
};

// Helper function to calculate the total cost of buying multiple upgrades
const calculateBulkCost = (baseCost: number, currentLevel: number, quantity: number): number => {
  let totalCost = 0;
  for (let i = 0; i < quantity; i++) {
    totalCost += Math.floor(baseCost * Math.pow(1.07, currentLevel + i));
  }
  return totalCost;
};

// Helper function to calculate potential essence reward with progressive scaling
const calculateEssenceReward = (totalEarned: number, ownedArtifacts: string[]): number => {
  let baseEssenceMultiplier = 1;
  
  if (ownedArtifacts.includes("artifact-3")) { // Element Scanner
    baseEssenceMultiplier += 1.25;
  }
  if (ownedArtifacts.includes("artifact-8")) { // Quantum Microscope
    baseEssenceMultiplier += 2.25;
  }
  
  let totalEssence = 0;
  let remainingCoins = totalEarned;
  let currentCostPerEssence = 100000;
  let currentBracket = 0;
  
  while (remainingCoins >= currentCostPerEssence) {
    const essenceInBracket = Math.min(10, Math.floor(remainingCoins / currentCostPerEssence));
    
    if (essenceInBracket <= 0) break;
    
    totalEssence += essenceInBracket;
    remainingCoins -= essenceInBracket * currentCostPerEssence;
    
    currentBracket++;
    currentCostPerEssence = 100000 * Math.pow(2, currentBracket);
  }
  
  return Math.floor(totalEssence * baseEssenceMultiplier);
};

// Helper function to calculate upgrade cost reduction from artifacts
const calculateCostReduction = (ownedArtifacts: string[]): number => {
  let reduction = 1; // Default: no reduction (multiplier of 1)
  
  if (ownedArtifacts.includes("artifact-4")) { // Telescope Array
    reduction -= 0.1; // 10% reduction
  }
  if (ownedArtifacts.includes("artifact-9")) { // Satellite Network
    reduction -= 0.25; // 25% reduction
  }
  
  return Math.max(0.5, reduction);
};

// Helper function to calculate click multiplier from artifacts
const calculateClickMultiplier = (ownedArtifacts: string[]): number => {
  let multiplier = 1;
  
  if (ownedArtifacts.includes("artifact-2")) { // Space Rocket
    multiplier += 0.5; // 1.5x multiplier
  }
  if (ownedArtifacts.includes("artifact-7")) { // Molecular Flask
    multiplier += 1.5; // Additional 2.5x multiplier
  }
  
  return multiplier;
};

// Helper function to calculate starting coins after prestige
const calculateStartingCoins = (ownedArtifacts: string[]): number => {
  let coins = 0;
  
  if (ownedArtifacts.includes("artifact-5")) { // Crystalline Gem
    coins += 100000;
  }
  if (ownedArtifacts.includes("artifact-10")) { // Energy Core
    coins += 1000000;
  }
  
  return coins;
};

// Calculate maximum affordable purchases for an upgrade
const getMaxPurchaseAmount = (state: GameState, upgradeId: string): number => {
  const upgrade = state.upgrades.find(u => u.id === upgradeId);
  if (!upgrade || upgrade.level >= upgrade.maxLevel) return 0;
  
  const costReduction = calculateCostReduction(state.ownedArtifacts);
  let remainingCoins = state.coins;
  let purchaseCount = 0;
  let currentLevel = upgrade.level;
  
  while (remainingCoins > 0 && currentLevel < upgrade.maxLevel) {
    const nextUpgradeCost = Math.floor(upgrade.baseCost * Math.pow(1.07, currentLevel) * costReduction);
    
    if (remainingCoins >= nextUpgradeCost) {
      remainingCoins -= nextUpgradeCost;
      purchaseCount++;
      currentLevel++;
    } else {
      break;
    }
  }
  
  return purchaseCount;
};

// Check if an upgrade has reached a milestone level that awards a skill point
const checkUpgradeMilestone = (oldLevel: number, newLevel: number): boolean => {
  const oldMilestone = Math.floor(oldLevel / 100);
  const newMilestone = Math.floor(newLevel / 100);
  return newMilestone > oldMilestone;
};

// Game reducer
const gameReducer = (state: GameState, action: GameAction): GameState => {
  switch (action.type) {
    case 'CLICK': {
      const clickMultiplier = calculateClickMultiplier(state.ownedArtifacts);
      
      // Base click value is 2.5x higher and includes 30% of coins per second
      const baseClickValue = state.coinsPerClick * 2.5; 
      const coinsPerSecondBonus = state.coinsPerSecond * 0.3;
      const totalClickAmount = (baseClickValue + coinsPerSecondBonus) * (state.incomeMultiplier || 1) * clickMultiplier;
      
      return {
        ...state,
        coins: state.coins + totalClickAmount,
        totalClicks: state.totalClicks + 1,
        totalEarned: state.totalEarned + totalClickAmount
      };
    }
    case 'ADD_COINS':
      return {
        ...state,
        coins: state.coins + action.amount,
        totalEarned: state.totalEarned + action.amount
      };
    case 'ADD_ESSENCE':
      return {
        ...state,
        essence: state.essence + action.amount
      };
    case 'BUY_UPGRADE': {
      const upgradeIndex = state.upgrades.findIndex(u => u.id === action.upgradeId);
      
      if (upgradeIndex === -1) return state;
      
      const upgrade = state.upgrades[upgradeIndex];
      const costReduction = calculateCostReduction(state.ownedArtifacts);
      const quantity = action.quantity || 1;
      
      if (upgrade.level >= upgrade.maxLevel) return state;
      
      const maxPossibleQuantity = Math.min(
        quantity, 
        upgrade.maxLevel - upgrade.level
      );
      
      const totalCost = Math.floor(calculateBulkCost(upgrade.baseCost, upgrade.level, maxPossibleQuantity) * costReduction);
      
      if (state.coins < totalCost) return state;
      
      const oldLevel = upgrade.level;
      const newLevel = upgrade.level + maxPossibleQuantity;
      
      // Check if the upgrade has crossed a 100-level milestone
      const shouldAwardSkillPoint = checkUpgradeMilestone(oldLevel, newLevel);
      
      const newCoinsPerClick = state.coinsPerClick + (upgrade.coinsPerClickBonus * maxPossibleQuantity);
      const newCoinsPerSecond = state.coinsPerSecond + (upgrade.coinsPerSecondBonus * 4 * maxPossibleQuantity); // 4x passive income boost
      
      const updatedUpgrade = {
        ...upgrade,
        level: newLevel,
        cost: Math.floor(upgrade.baseCost * Math.pow(1.07, newLevel) * costReduction)
      };
      
      const newUpgrades = [...state.upgrades];
      newUpgrades[upgradeIndex] = updatedUpgrade;
      
      state.upgrades.forEach((u, index) => {
        if (!u.unlocked && u.unlocksAt && 
            u.unlocksAt.upgradeId === upgrade.id && 
            updatedUpgrade.level >= u.unlocksAt.level) {
          newUpgrades[index] = { ...newUpgrades[index], unlocked: true };
        }
      });
      
      const newState = {
        ...state,
        coins: state.coins - totalCost,
        coinsPerClick: newCoinsPerClick,
        coinsPerSecond: newCoinsPerSecond,
        upgrades: newUpgrades
      };
      
      // Award skill point if milestone reached
      if (shouldAwardSkillPoint) {
        return {
          ...newState,
          skillPoints: newState.skillPoints + 1
        };
      }
      
      return newState;
    }
    case 'TOGGLE_AUTO_BUY':
      return {
        ...state,
        autoBuy: !state.autoBuy
      };
    case 'TOGGLE_AUTO_TAP':
      return {
        ...state,
        autoTap: !state.autoTap
      };
    case 'SET_INCOME_MULTIPLIER':
      return {
        ...state,
        incomeMultiplier: action.multiplier
      };
    case 'TICK': {
      let newState = { ...state };
      
      // Process passive income (adjusted by multiplier and increased by 4x)
      if (state.coinsPerSecond > 0) {
        const passiveAmount = (state.coinsPerSecond / 10) * (state.incomeMultiplier || 1) * 2; // 4x increase (0.5 * 4 = 2)
        newState = {
          ...newState,
          coins: newState.coins + passiveAmount,
          totalEarned: newState.totalEarned + passiveAmount
        };
      }
      
      // Process auto tap if enabled
      if (newState.autoTap) {
        const clickMultiplier = calculateClickMultiplier(state.ownedArtifacts);
        // Auto tap income
        const baseClickValue = newState.coinsPerClick * 2.5;
        const coinsPerSecondBonus = newState.coinsPerSecond * 0.3;
        const autoTapAmount = (baseClickValue + coinsPerSecondBonus) * (newState.incomeMultiplier || 1) * clickMultiplier;
        
        newState = {
          ...newState,
          coins: newState.coins + autoTapAmount,
          totalEarned: newState.totalEarned + autoTapAmount,
          totalClicks: newState.totalClicks + 1
        };
      }
      
      // Process auto buy with new cost reduction from artifacts
      if (newState.autoBuy) {
        const costReduction = calculateCostReduction(state.ownedArtifacts);
        const affordableUpgrades = newState.upgrades
          .filter(u => u.unlocked && u.level < u.maxLevel && 
                   newState.coins >= (u.cost * costReduction))
          .sort((a, b) => (a.cost * costReduction) - (b.cost * costReduction));
        
        if (affordableUpgrades.length > 0) {
          const cheapestUpgrade = affordableUpgrades[0];
          
          const upgradeIndex = newState.upgrades.findIndex(u => u.id === cheapestUpgrade.id);
          
          const oldLevel = cheapestUpgrade.level;
          const newLevel = cheapestUpgrade.level + 1;
          
          // Check if the upgrade has crossed a 100-level milestone
          const shouldAwardSkillPoint = checkUpgradeMilestone(oldLevel, newLevel);
          
          const newCoinsPerClick = newState.coinsPerClick + cheapestUpgrade.coinsPerClickBonus;
          const newCoinsPerSecond = newState.coinsPerSecond + (cheapestUpgrade.coinsPerSecondBonus * 4); // 4x passive income boost
          
          const updatedUpgrade = {
            ...cheapestUpgrade,
            level: newLevel,
            cost: Math.floor(cheapestUpgrade.baseCost * Math.pow(1.07, newLevel) * costReduction)
          };
          
          const newUpgrades = [...newState.upgrades];
          newUpgrades[upgradeIndex] = updatedUpgrade;
          
          newState.upgrades.forEach((u, index) => {
            if (!u.unlocked && u.unlocksAt && 
                u.unlocksAt.upgradeId === cheapestUpgrade.id && 
                updatedUpgrade.level >= u.unlocksAt.level) {
              newUpgrades[index] = { ...newUpgrades[index], unlocked: true };
            }
          });
          
          newState = {
            ...newState,
            coins: newState.coins - (cheapestUpgrade.cost * costReduction),
            coinsPerClick: newCoinsPerClick,
            coinsPerSecond: newCoinsPerSecond,
            upgrades: newUpgrades
          };
          
          // Award skill point if milestone reached
          if (shouldAwardSkillPoint) {
            newState = {
              ...newState,
              skillPoints: newState.skillPoints + 1
            };
          }
        }
      }
      
      return newState;
    }
    case 'PRESTIGE': {
      const essenceReward = calculateEssenceReward(state.totalEarned, state.ownedArtifacts);
      const startingCoins = calculateStartingCoins(state.ownedArtifacts);
      
      return {
        ...initialState,
        coins: startingCoins,
        essence: state.essence + essenceReward,
        ownedManagers: state.ownedManagers,
        ownedArtifacts: state.ownedArtifacts,
        achievements: state.achievements,
        achievementsChecked: state.achievementsChecked,
        managers: state.managers,
        artifacts: state.artifacts,
        prestigeCount: state.prestigeCount + 1,
        skillPoints: state.skillPoints // Retain skill points after prestige
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
        },
        skillPoints: state.skillPoints + 1 // Award a skill point for each achievement
      };
    }
    case 'CHECK_ACHIEVEMENTS': {
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
        achievementsChecked: newAchievementsChecked,
        skillPoints: state.skillPoints + unlockableAchievements.length // Award skill points for each new achievement
      };
    }
    case 'UNLOCK_ABILITY': {
      const abilityIndex = state.abilities.findIndex(a => a.id === action.abilityId);
      
      if (abilityIndex === -1) return state;
      
      const ability = state.abilities[abilityIndex];
      
      // Check if ability is already unlocked
      if (ability.unlocked) return state;
      
      // Check if user has enough skill points
      if (state.skillPoints < ability.cost) return state;
      
      // Check if all required abilities are unlocked
      const requiredAbilitiesUnlocked = ability.requiredAbilities.every(requiredId => {
        const requiredAbility = state.abilities.find(a => a.id === requiredId);
        return requiredAbility && requiredAbility.unlocked;
      });
      
      if (!requiredAbilitiesUnlocked) return state;
      
      // Unlock the ability and deduct skill points
      const newAbilities = [...state.abilities];
      newAbilities[abilityIndex] = { ...newAbilities[abilityIndex], unlocked: true };
      
      return {
        ...state,
        skillPoints: state.skillPoints - ability.cost,
        abilities: newAbilities
      };
    }
    case 'ADD_SKILL_POINTS': {
      return {
        ...state,
        skillPoints: state.skillPoints + action.amount
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
  toggleAutoTap: () => void;
  setIncomeMultiplier: (multiplier: number) => void;
  prestige: () => void;
  calculateEssenceReward: (totalEarned: number) => number;
  buyManager: (managerId: string) => void;
  buyArtifact: (artifactId: string) => void;
  checkAchievements: () => void;
  unlockAchievement: (achievementId: string) => void;
  addCoins: (amount: number) => void;
  addEssence: (amount: number) => void;
  calculateMaxPurchaseAmount: (upgradeId: string) => number;
  unlockAbility: (abilityId: string) => void;
  addSkillPoints: (amount: number) => void;
};

const GameContext = createContext<GameContextType | undefined>(undefined);

// Create the Skill Point notification component
const SkillPointNotification: React.FC<{ message: string }> = ({ message }) => {
  return (
    <div className="fixed top-16 left-1/2 transform -translate-x-1/2 z-50 animate-bounce">
      <div className="bg-indigo-900/80 border border-blue-400 shadow-lg px-4 py-2 rounded-lg flex items-center gap-2">
        <div className="animate-pulse">
          <Gem className="text-blue-400" size={20} />
        </div>
        <span className="text-blue-200 font-medium">{message}</span>
      </div>
    </div>
  );
};

// Create provider component
export const GameProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [state, dispatch] = useReducer(gameReducer, initialState);
  const [skillPointNotification, setSkillPointNotification] = React.useState<string | null>(null);
  const { toast } = useToast();

  // Handle click action
  const handleClick = () => {
    dispatch({ type: 'CLICK' });
  };

  // Buy upgrade
  const buyUpgrade = (upgradeId: string, quantity: number = 1) => {
    const upgrade = state.upgrades.find(u => u.id === upgradeId);
    if (!upgrade) return;
    
    const oldLevel = upgrade.level;
    
    dispatch({ type: 'BUY_UPGRADE', upgradeId, quantity });
    
    // Check post-update to see if we crossed a milestone
    setTimeout(() => {
      const updatedUpgrade = state.upgrades.find(u => u.id === upgradeId);
      if (updatedUpgrade && checkUpgradeMilestone(oldLevel, updatedUpgrade.level)) {
        showSkillPointNotification(`${updatedUpgrade.name} Level ${Math.floor(updatedUpgrade.level/100)*100} Reached!`);
      }
    }, 100);
  };

  // Toggle auto-buy
  const toggleAutoBuy = () => {
    dispatch({ type: 'TOGGLE_AUTO_BUY' });
  };
  
  // Toggle auto-tap
  const toggleAutoTap = () => {
    dispatch({ type: 'TOGGLE_AUTO_TAP' });
  };
  
  // Set income multiplier
  const setIncomeMultiplier = (multiplier: number) => {
    dispatch({ type: 'SET_INCOME_MULTIPLIER', multiplier });
  };
  
  // Admin: Add coins
  const addCoins = (amount: number) => {
    dispatch({ type: 'ADD_COINS', amount });
  };
  
  // Admin: Add essence
  const addEssence = (amount: number) => {
    dispatch({ type: 'ADD_ESSENCE', amount });
  };
  
  // Prestige function
  const prestige = () => {
    dispatch({ type: 'PRESTIGE' });
  };
  
  // Show skill point notification
  const showSkillPointNotification = (reason: string) => {
    setSkillPointNotification(`+1 Skill Point: ${reason}`);
    
    // Hide after 3 seconds
    setTimeout(() => {
      setSkillPointNotification(null);
    }, 3000);
  };
  
  // Buy manager
  const buyManager = (managerId: string) => {
    dispatch({ type: 'BUY_MANAGER', managerId });
    
    // Check for the corresponding achievement
    setTimeout(() => {
      const manager = managers.find(m => m.id === managerId);
      if (manager && state.ownedManagers.includes(managerId)) {
        const achievementId = `manager-achievement-${managerId}`;
        const achievement = state.achievements.find(a => a.id === achievementId);
        
        if (achievement && !achievement.unlocked) {
          dispatch({ type: 'UNLOCK_ACHIEVEMENT', achievementId });
          showSkillPointNotification(`Hired ${manager.name}`);
        }
      }
    }, 100);
  };
  
  // Buy artifact
  const buyArtifact = (artifactId: string) => {
    dispatch({ type: 'BUY_ARTIFACT', artifactId });
    
    // Check for the corresponding achievement
    setTimeout(() => {
      const artifact = artifacts.find(a => a.id === artifactId);
      if (artifact && state.ownedArtifacts.includes(artifactId)) {
        const achievementId = `artifact-achievement-${artifactId}`;
        const achievement = state.achievements.find(a => a.id === achievementId);
        
        if (achievement && !achievement.unlocked) {
          dispatch({ type: 'UNLOCK_ACHIEVEMENT', achievementId });
          showSkillPointNotification(`Discovered ${artifact.name}`);
        }
      }
    }, 100);
  };
  
  // Check achievements
  const checkAchievements = () => {
    const prevAchievementCount = state.achievements.filter(a => a.unlocked).length;
    
    dispatch({ type: 'CHECK_ACHIEVEMENTS' });
    
    // Check if new achievements were unlocked
    setTimeout(() => {
      const newAchievementCount = state.achievements.filter(a => a.unlocked).length;
      if (newAchievementCount > prevAchievementCount) {
        const newAchievements = state.achievements.filter(a => a.unlocked).slice(prevAchievementCount);
        if (newAchievements.length > 0) {
          showSkillPointNotification(`New Achievement${newAchievements.length > 1 ? 's' : ''}`);
        }
      }
    }, 100);
  };
  
  // Unlock specific achievement
  const unlockAchievement = (achievementId: string) => {
    dispatch({ type: 'UNLOCK_ACHIEVEMENT', achievementId });
    
    // Show notification
    setTimeout(() => {
      const achievement = state.achievements.find(a => a.id === achievementId);
      if (achievement && achievement.unlocked) {
        showSkillPointNotification(`Achievement: ${achievement.name}`);
      }
    }, 100);
  };
  
  // Calculate maximum affordable purchases
  const calculateMaxPurchaseAmount = (upgradeId: string): number => {
    return getMaxPurchaseAmount(state, upgradeId);
  };

  // Unlock ability
  const unlockAbility = (abilityId: string) => {
    dispatch({ type: 'UNLOCK_ABILITY', abilityId });
  };
  
  // Add skill points
  const addSkillPoints = (amount: number) => {
    dispatch({ type: 'ADD_SKILL_POINTS', amount });
  };

  // Set up the automatic tick for passive income and achievement checking
  useEffect(() => {
    const interval = setInterval(() => {
      dispatch({ type: 'TICK' });
      
      if (Math.random() < 0.1) {
        checkAchievements();
      }
    }, 100);

    return () => clearInterval(interval);
  }, []);
  
  const previousAchievementsRef = React.useRef<Achievement[]>(state.achievements);
  
  useEffect(() => {
    const prevUnlocked = previousAchievementsRef.current.filter(a => a.unlocked).length;
    const currentUnlocked = state.achievements.filter(a => a.unlocked).length;
    
    if (currentUnlocked > prevUnlocked) {
      const newlyUnlocked = state.achievements.filter(a => {
        const prev = previousAchievementsRef.current.find(p => p.id === a.id);
        return a.unlocked && prev && !prev.unlocked;
      });
      
      newlyUnlocked.forEach(achievement => {
        toast({
          title: "Achievement Unlocked!",
          description: `${achievement.name}: ${achievement.description}`,
          variant: "default",
        });
        
        // Also show the skill point notification
        showSkillPointNotification(`Achievement: ${achievement.name}`);
      });
    }
    
    previousAchievementsRef.current = state.achievements;
  }, [state.achievements, toast]);

  return (
    <GameContext.Provider value={{ 
      state, 
      handleClick, 
      buyUpgrade, 
      toggleAutoBuy,
      toggleAutoTap,
      setIncomeMultiplier,
      prestige,
      calculateEssenceReward: (totalEarned: number) => calculateEssenceReward(totalEarned, state.ownedArtifacts),
      buyManager,
      buyArtifact,
      checkAchievements,
      unlockAchievement,
      addCoins,
      addEssence,
      calculateMaxPurchaseAmount,
      unlockAbility,
      addSkillPoints
    }}>
      {skillPointNotification && <SkillPointNotification message={skillPointNotification} />}
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
