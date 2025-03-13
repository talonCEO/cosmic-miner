
import React from 'react';
import { Coins, Gem, Sparkles, Brain, Clock, Zap, CircleDollarSign } from 'lucide-react';

export type MenuType = "none" | "main" | "achievements" | "prestige" | "shop" | "techTree" | "premium" | "profile" | "inventory" | "leaderboard";

export interface Ability {
  id: string;
  name: string;
  description: string;
  unlocked: boolean;
  cost: number;
  icon: React.ReactNode;
  requiredAbilities: string[];
  row: number;
  column: number;
  cooldown?: number;
  duration?: number;
  effect?: string;
}

export interface InventoryItem {
  id: string;
  name: string;
  description: string;
  type: 'resource' | 'boost' | 'reward' | 'gift' | 'consumable';
  rarity: 'common' | 'uncommon' | 'rare' | 'epic' | 'legendary';
  icon: React.ReactNode;
  quantity: number;
  effect?: {
    type: string;
    value: number;
    duration?: number;
  };
  usable: boolean;
  stackable: boolean;
  obtained: number; // timestamp
}

// Game boost items manifest - centralized list of all available boosts
export const INVENTORY_ITEMS = {
  // Resource items (non-usable)
  COINS: {
    id: 'resource-coins',
    name: 'Coins',
    description: 'The main currency used for upgrades',
    type: 'resource' as const,
    rarity: 'common' as const,
    icon: <Coins className="text-yellow-400" />,
    usable: false,
    stackable: true,
    obtained: Date.now()
  },
  GEMS: {
    id: 'resource-gems',
    name: 'Gems',
    description: 'Premium currency for special items',
    type: 'resource' as const,
    rarity: 'epic' as const,
    icon: <Gem className="text-purple-400" />,
    usable: false,
    stackable: true,
    obtained: Date.now()
  },
  ESSENCE: {
    id: 'resource-essence',
    name: 'Essence',
    description: 'Earned through prestige, used for permanent upgrades',
    type: 'resource' as const,
    rarity: 'legendary' as const,
    icon: <Sparkles className="text-amber-400" />,
    usable: false,
    stackable: true,
    obtained: Date.now()
  },
  SKILL_POINTS: {
    id: 'resource-skillpoints',
    name: 'Skill Points',
    description: 'Used to unlock abilities in the tech tree',
    type: 'resource' as const,
    rarity: 'rare' as const,
    icon: <Brain className="text-blue-400" />,
    usable: false,
    stackable: true,
    obtained: Date.now()
  },
  
  // Boost items (usable)
  DOUBLE_COINS: {
    id: 'boost-double-coins',
    name: 'Double Coins',
    description: 'Doubles all coin earnings for 30 minutes',
    type: 'boost' as const,
    rarity: 'uncommon' as const,
    icon: <CircleDollarSign className="text-green-400" />,
    effect: {
      type: 'coinMultiplier',
      value: 2,
      duration: 30 * 60 // 30 minutes in seconds
    },
    usable: true,
    stackable: true,
    obtained: Date.now()
  },
  TIME_WARP: {
    id: 'boost-time-warp',
    name: 'Time Warp',
    description: 'Instantly gain 2 hours worth of passive income',
    type: 'boost' as const,
    rarity: 'uncommon' as const,
    icon: <Clock className="text-blue-400" />,
    effect: {
      type: 'timeWarp',
      value: 2 * 60 * 60, // 2 hours in seconds
    },
    usable: true,
    stackable: true,
    obtained: Date.now()
  },
  AUTO_TAP: {
    id: 'boost-auto-tap',
    name: 'Auto Tap',
    description: 'Automatically taps 5 times per second for 10 minutes',
    type: 'boost' as const,
    rarity: 'uncommon' as const,
    icon: <Zap className="text-yellow-400" />,
    effect: {
      type: 'autoTap',
      value: 5, // taps per second
      duration: 10 * 60 // 10 minutes in seconds
    },
    usable: true,
    stackable: true,
    obtained: Date.now()
  }
};

/**
 * Helper function to create a new inventory item
 * 
 * Usage example:
 * const newItem = createInventoryItem(INVENTORY_ITEMS.DOUBLE_COINS, 3);
 * gameContext.addItem(newItem);
 * 
 * @param itemTemplate The template item from INVENTORY_ITEMS
 * @param quantity Number of items to create (defaults to 1)
 * @returns A new InventoryItem object ready to be added to player inventory
 */
export function createInventoryItem(
  itemTemplate: Omit<InventoryItem, 'quantity'>, 
  quantity: number = 1
): InventoryItem {
  return {
    ...itemTemplate,
    quantity,
    obtained: Date.now()
  };
}
