
import React from 'react';

export type MenuType = "none" | "main" | "achievements" | "shop" | "prestige" | "techTree" | "premium" | "profile" | "inventory" | "leaderboard" | "worlds";

export interface InventoryItem {
  id: string;
  name: string;
  description: string;
  quantity: number;
  stackable: boolean;
  rarity: 'common' | 'uncommon' | 'rare' | 'epic' | 'legendary';
  icon: string;
  category: 'boost' | 'resource' | 'tool' | 'special';
  usable: boolean;
  effect?: {
    type: string;
    duration?: number;
    value: number;
  };
}

export interface BoostEffect {
  id: string;
  name: string;
  description: string;
  quantity: number;
  value: number;
  duration?: number;
  activatedAt?: number;
  remainingTime?: number;
  icon: string;
}

export const createInventoryItem = (template: ItemTemplate, quantity: number): InventoryItem => {
  return {
    ...template,
    quantity,
  };
};

interface ItemTemplate extends Omit<InventoryItem, 'quantity'> {}

export const INVENTORY_ITEMS = {
  DOUBLE_COINS: {
    id: 'boost-double-coins',
    name: 'Double Coins',
    description: 'Doubles all coin earnings for 2 minutes',
    stackable: true,
    rarity: 'uncommon' as const,
    icon: '/src/assets/images/icons/boost1.png',
    category: 'boost' as const,
    usable: true,
    effect: {
      type: 'multiplier',
      duration: 120, // 2 minutes in seconds
      value: 2
    }
  },
  AUTO_TAP: {
    id: 'boost-auto-tap',
    name: 'Auto Tap Boost',
    description: 'Increases auto-tap income by 10x for 5 minutes',
    stackable: true,
    rarity: 'uncommon' as const,
    icon: '/src/assets/images/icons/boost2.png',
    category: 'boost' as const,
    usable: true,
    effect: {
      type: 'autoTap',
      duration: 300, // 5 minutes in seconds
      value: 10
    }
  },
  TAP_BOOST: {
    id: 'boost-tap-boost',
    name: 'Super Tap',
    description: 'Your next 20 taps earn 5x more coins',
    stackable: true,
    rarity: 'rare' as const,
    icon: '/src/assets/images/icons/boost3.png',
    category: 'boost' as const,
    usable: true,
    effect: {
      type: 'coinsPerClick',
      duration: 20, // 20 taps
      value: 5
    }
  },
  ESSENCE_BOOST: {
    id: 'boost-essence-boost',
    name: 'Essence Multiplier',
    description: 'Increases essence earned from prestige by 25%',
    stackable: false,
    rarity: 'epic' as const,
    icon: '/src/assets/images/icons/boost4.png',
    category: 'boost' as const,
    usable: false,
    effect: {
      type: 'essenceBoost',
      value: 1.25
    }
  },
  PERMA_TAP: {
    id: 'boost-perma-tap',
    name: 'Permanent Tap Boost',
    description: 'Permanently increases tap value by 10',
    stackable: false,
    rarity: 'legendary' as const,
    icon: '/src/assets/images/icons/boost5.png',
    category: 'boost' as const,
    usable: false,
    effect: {
      type: 'permanentTap',
      value: 10
    }
  },
  PERMA_PASSIVE: {
    id: 'boost-perma-passive',
    name: 'Permanent Passive Boost',
    description: 'Permanently increases passive income by 5',
    stackable: false,
    rarity: 'legendary' as const,
    icon: '/src/assets/images/icons/boost6.png',
    category: 'boost' as const,
    usable: false,
    effect: {
      type: 'permanentPassive',
      value: 5
    }
  },
  NO_ADS: {
    id: 'boost-no-ads',
    name: 'Ad Free',
    description: 'Permanently removes all ads',
    stackable: false,
    rarity: 'epic' as const,
    icon: '/src/assets/images/icons/boost7.png',
    category: 'special' as const,
    usable: false,
    effect: {
      type: 'noAds',
      value: 1
    }
  },
  CHEAP_UPGRADES: {
    id: 'boost-cheap-upgrades',
    name: 'Discount Upgrades',
    description: 'Reduces upgrade costs by 30% for 10 minutes',
    stackable: true,
    rarity: 'rare' as const,
    icon: '/src/assets/images/icons/boost8.png',
    category: 'boost' as const,
    usable: true,
    effect: {
      type: 'costReduction',
      duration: 600, // 10 minutes in seconds
      value: 0.7 // 30% reduction
    }
  },
  INVENTORY_EXPANSION: {
    id: 'boost-inventory-expansion',
    name: 'Inventory Expansion',
    description: 'Increases inventory space by 5 slots',
    stackable: false,
    rarity: 'uncommon' as const,
    icon: '/src/assets/images/icons/boost9.png',
    category: 'special' as const,
    usable: false,
    effect: {
      type: 'inventoryExpansion',
      value: 5
    }
  }
};
