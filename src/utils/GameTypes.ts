
import { ReactNode } from 'react';

// Define the GameState type
export type GameStateType = {
  coins: number;
  gems: number;
  essence: number;
  level: number;
  xp: number;
  xpCap: number;
  prestigeCount: number;
  abilities: Ability[];
  techTree: any;
  managers: any;
  artifacts: any;
  achievements: any;
  ownedManagers: string[];
  ownedArtifacts: string[];
  inventory: InventoryItem[];
  boosts?: {
    [boostId: string]: {
      purchased: number;
    };
  };
  // Additional properties needed by components
  skillPoints: number;
  unlockedPerks: string[];
  totalClicks: number;
  totalEarned: number;
  coinsPerClick: number;
  coinsPerSecond: number;
  upgrades: any[];
  autoBuy: boolean;
  autoTap: boolean;
  incomeMultiplier: number;
  inventoryCapacity: number;
};

// Define the GameAction type
export type GameActionType =
  | { type: 'LOAD_GAME', payload: GameStateType }
  | { type: 'SET_COINS', payload: number }
  | { type: 'ADD_COINS', payload: number }
  | { type: 'SET_GEMS', payload: number }
  | { type: 'ADD_GEMS', payload: number }
  | { type: 'SET_ESSENCE', payload: number }
  | { type: 'ADD_ESSENCE', payload: number }
  | { type: 'SET_LEVEL', payload: number }
  | { type: 'LEVEL_UP' }
  | { type: 'SET_XP', payload: number }
  | { type: 'ADD_XP', payload: number }
  | { type: 'SET_XP_CAP', payload: number }
  | { type: 'SET_PRESTIGE_COUNT', payload: number }
  | { type: 'UNLOCK_ABILITY', payload: string }
  | { type: 'SET_TECH_TREE', payload: any }
  | { type: 'SET_MANAGERS', payload: any }
  | { type: 'BUY_MANAGER', payload: string }
  | { type: 'RESET_MANAGERS' }
  | { type: 'SET_ARTIFACTS', payload: any }
  | { type: 'BUY_ARTIFACT', payload: string }
  | { type: 'RESET_ARTIFACTS' }
  | { type: 'SET_ACHIEVEMENTS', payload: any }
  | { type: 'ADD_INVENTORY_ITEM', payload: InventoryItem }
  | { type: 'UPDATE_INVENTORY_ITEM', payload: InventoryItem }
  | { type: 'REMOVE_INVENTORY_ITEM', payload: string }
  | { type: 'SET_INVENTORY', payload: InventoryItem[] };

// Perk Interface - Unlockable bonuses for managers and artifacts
export interface Perk {
  id: string;                  // Unique identifier
  name: string;                // Display name
  description: string;         // Describes what the perk does
  cost: number;                // Skill points required
  icon: string;                // Visual representation (emoji)
  unlocked: boolean;           // Whether user has unlocked it
  category?: string;           // Category for the perk (for icon mapping)
  effect: {
    // Effect type determines which game mechanic is affected:
    // - "tap": Increases tap value
    // - "production": Increases production of specific elements
    // - "allProduction": Increases all production
    // - "passive": Increases passive income
    // - "cost": Reduces upgrade costs
    // - "essence": Increases essence from prestige
    // - "startingCoins": Provides starting coins after prestige
    // - "critChance": Increases critical hit chance
    // - "critMultiplier": Increases critical hit multiplier
    // - "elementBoost": Increases production of specific elements
    type: string;
    
    // Value represents the magnitude of the effect:
    // - For percentage increases (production, passive, etc): 0.05 = 5%
    // - For multipliers (tap, etc): 1.5 = 1.5x
    // - For flat values (startingCoins): direct amount
    value: number;
    
    // Optional list of element IDs that are affected by this perk
    elements?: string[];
  };
}

// Ability Interface - For TechTree component
export interface Ability {
  id: string;
  name: string;
  description: string;
  icon: ReactNode;
  unlocked: boolean;
  cost: number;
  requiredAbilities: string[];
  row: number;
  column?: number;
  cooldown?: number;
  duration?: number;
  effect?: string;
}

// Define the InventoryItem interface
export interface InventoryItem {
  id: string;
  name: string;
  description: string;
  type: 'resource' | 'boost' | 'reward' | 'gift' | 'consumable';
  rarity: 'common' | 'uncommon' | 'rare' | 'epic' | 'legendary';
  icon: ReactNode;
  quantity: number;
  effect?: {
    type: string;
    value: number;
    duration?: number;
  };
  usable: boolean;
  stackable: boolean;
  obtained: number; // timestamp
  cost?: number;
  maxPurchases?: number;
}

// Define the mock data for the tech tree, managers, artifacts, etc.
export const mockTechTree = [];
export const mockManagers = [];
export const mockArtifacts = [];
export const mockAchievements = [];
export const mockLevelUpRewards = {
  1: { coins: 100 },
  2: { coins: 200, essence: 10 },
  3: { coins: 300, gems: 5 },
  4: { coins: 400, essence: 20 },
  5: { coins: 500, gems: 10, essence: 30 },
};

// Define the BoostItemType for premium store
export interface BoostItemType {
  id: string;
  name: string;
  description: string;
  effect: string;
  cost: number;
  icon: ReactNode | null;
  purchasable: boolean;
  purchased: number;
  isPermanent?: boolean;
  maxPurchases: number;
  refreshTime?: number;
}

// Define the LevelReward interface
export interface LevelReward {
  coins?: number;
  essence?: number;
  skillPoints?: number;
  gems?: number;
  unlocksTitle?: string;
  unlocksPortrait?: string;
}

// Define Achievement interface
export interface Achievement {
  id: string;
  name: string;
  description: string;
  unlocked: boolean;
  progress?: number;
  maxProgress?: number;
  rewards?: {
    coins?: number;
    gems?: number;
    essence?: number;
    skillPoints?: number;
  };
}

// Define Upgrade interface
export interface Upgrade {
  id: string;
  name: string;
  description: string;
  baseCost: number;
  level: number;
  maxLevel?: number;
  effect: {
    type: string;
    value: number;
  };
}

// Export game state alias for backward compatibility
export type GameState = GameStateType;
