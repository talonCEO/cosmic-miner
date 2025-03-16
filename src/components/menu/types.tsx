// src/types/index.ts
import React from 'react';
import { Coins, Gem, Sparkles, Brain, Clock, Zap, CircleDollarSign, DollarSign, Percent, Star, Rocket, VideoOff, PackagePlus, Box } from 'lucide-react';

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

  // Original boost items (usable)
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
    obtained: Date.now(),
    cost: 100, // Suggested gem cost
    maxPurchases: Infinity // Add maxPurchases
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
    obtained: Date.now(),
    cost: 50, // Suggested gem cost
    maxPurchases: Infinity // Add maxPurchases
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
    obtained: Date.now(),
    cost: 100, // Suggested gem cost
    maxPurchases: Infinity // Add maxPurchases
  },

  // New boosts as requested
  TAP_BOOST: {
    id: 'boost-tap-boost',
    name: 'Tap Boost',
    description: 'Increases tap power by 5x for 100 taps',
    type: 'boost' as const,
    rarity: 'rare' as const,
    icon: <Zap className="text-purple-400" />,
    effect: {
      type: 'coinsPerClick',
      value: 5,
      duration: 100 // 100 taps
    },
    usable: true,
    stackable: true,
    obtained: Date.now(),
    cost: 75, // Suggested gem cost
    maxPurchases: Infinity // Add maxPurchases
  },
  CHEAP_UPGRADES: {
    id: 'boost-cheap-upgrades',
    name: 'Cheap Upgrades',
    description: 'Reduces upgrade costs by 10% for 10 minutes',
    type: 'boost' as const,
    rarity: 'rare' as const,
    icon: <Percent className="text-green-400" />,
    effect: {
      type: 'upgradeCostReduction',
      value: 0.9, // Multiplier (10% reduction)
      duration: 10 * 60 // 10 minutes
    },
    usable: true,
    stackable: true,
    obtained: Date.now(),
    cost: 50, // Suggested gem cost
    maxPurchases: Infinity // Add maxPurchases
  },
  ESSENCE_BOOST: {
    id: 'boost-essence-boost',
    name: 'Essence Boost',
    description: 'Increases potential essence reward this prestige by 25%',
    type: 'boost' as const,
    rarity: 'epic' as const,
    icon: <Sparkles className="text-amber-400" />,
    effect: {
      type: 'essenceMultiplier',
      value: 1.25 // 25% increase
    },
    usable: true,
    stackable: true,
    obtained: Date.now(),
    cost: 100, // Suggested gem cost
    maxPurchases: Infinity // Add maxPurchases
  },
  PERMA_TAP: {
    id: 'boost-perma-tap',
    name: 'Permanent Tap Boost',
    description: 'Permanently increases base tap power by +1',
    type: 'boost' as const,
    rarity: 'legendary' as const,
    icon: <DollarSign className="text-red-400" />,
    effect: {
      type: 'coinsPerClickBase',
      value: 1
    },
    usable: true,
    stackable: true,
    obtained: Date.now(),
    cost: 150, // Suggested gem cost
    maxPurchases: Infinity // Add maxPurchases
  },
  PERMA_PASSIVE: {
    id: 'boost-perma-passive',
    name: 'Permanent Passive Boost',
    description: 'Permanently increases base passive income by +1',
    type: 'boost' as const,
    rarity: 'legendary' as const,
    icon: <Star className="text-yellow-400" />,
    effect: {
      type: 'coinsPerSecondBase',
      value: 1
    },
    usable: true,
    stackable: true,
    obtained: Date.now(),
    cost: 200, // Suggested gem cost
    maxPurchases: Infinity // Add maxPurchases
  },
  NO_ADS: {
    id: 'boost-no-ads',
    name: 'No Ads',
    description: 'Permanently removes ads from the game',
    type: 'boost' as const,
    rarity: 'legendary' as const,
    icon: <VideoOff className="text-gray-400" />,
    effect: {
      type: 'noAds',
      value: 1
    },
    usable: true,
    stackable: false, // Only one purchase needed
    obtained: Date.now(),
    cost: 1000, // High cost for one-time purchase
    maxPurchases: 1 // Limit to one
  },
  AUTO_BUY: {
    id: 'boost-auto-buy',
    name: 'Auto Buy',
    description: 'Unlocks the auto-buy feature permanently',
    type: 'boost' as const,
    rarity: 'epic' as const,
    icon: <PackagePlus className="text-blue-400" />,
    effect: {
      type: 'unlockAutoBuy',
      value: 1
    },
    usable: true,
    stackable: false, // Only one purchase needed
    obtained: Date.now(),
    cost: 800, // High cost for one-time purchase
    maxPurchases: 1 // Limit to one
  },
  INVENTORY_EXPANSION: {
    id: 'boost-inventory-expansion',
    name: 'Inventory Expansion',
    description: 'Increases inventory capacity by 5 slots',
    type: 'boost' as const,
    rarity: 'rare' as const,
    icon: <Box className="text-cyan-400" />,
    effect: {
      type: 'inventoryCapacity',
      value: 5
    },
    usable: true,
    stackable: true,
    obtained: Date.now(),
    cost: 500, // Moderate cost per expansion
    maxPurchases: 5 // Limit to 5 expansions
  }
};

/**
 * Helper function to create a new inventory item
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
