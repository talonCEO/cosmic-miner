import React from 'react';

// Static PNG imports for inventory items (replace with your actual image paths)
import CoinsImage from '@/assets/images/icons/gems.png';
import GemsImage from '@/assets/images/icons/gems.png';
import EssenceImage from '@/assets/images/icons/gems.png';
import SkillPointsImage from '@/assets/images/icons/gems.png';
import DoubleCoinsImage from '@/assets/images/icons/gems.png';
import TimeWarpImage from '@/assets/images/icons/gems.png';
import AutoTapImage from '@/assets/images/icons/gems.png';
import TapBoostImage from '@/assets/images/icons/gems.png';
import CheapUpgradesImage from '@/assets/images/icons/gems.png';
import EssenceBoostImage from '@/assets/images/icons/gems.png';
import PermaTapImage from '@/assets/images/icons/gems.png';
import PermaPassiveImage from '@/assets/images/icons/gems.png';
import NoAdsImage from '@/assets/images/icons/gems.png';
import AutoBuyImage from '@/assets/images/icons/gems.png'; // Reused as example
import InventoryExpansionImage from '@/assets/images/icons/gems.png'; // Reused as example

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
  icon: string; // Changed from React.ReactNode to string for PNG path
  quantity: number;
  effect?: {
    type: string;
    value: number;
    duration?: number;
  };
  usable: boolean;
  stackable: boolean;
  obtained: number;
  cost?: number;
  maxPurchases?: number;
}

export const INVENTORY_ITEMS = {
  COINS: {
    id: 'resource-coins',
    name: 'Coins',
    description: 'The main currency used for upgrades',
    type: 'resource' as const,
    rarity: 'common' as const,
    icon: CoinsImage, // Now a static PNG import
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
    icon: GemsImage,
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
    icon: EssenceImage,
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
    icon: SkillPointsImage,
    usable: false,
    stackable: true,
    obtained: Date.now()
  },
  DOUBLE_COINS: {
    id: 'boost-double-coins',
    name: 'Double Coins',
    description: 'Doubles all coin earnings for 30 minutes',
    type: 'boost' as const,
    rarity: 'uncommon' as const,
    icon: DoubleCoinsImage,
    effect: {
      type: 'coinMultiplier',
      value: 2,
      duration: 30 * 60
    },
    usable: true,
    stackable: true,
    obtained: Date.now(),
    cost: 100
  },
  TIME_WARP: {
    id: 'boost-time-warp',
    name: 'Time Warp',
    description: 'Instantly gain 2 hours worth of passive income',
    type: 'boost' as const,
    rarity: 'uncommon' as const,
    icon: TimeWarpImage,
    effect: {
      type: 'timeWarp',
      value: 2 * 60 * 60,
    },
    usable: true,
    stackable: true,
    obtained: Date.now(),
    cost: 50
  },
  AUTO_TAP: {
    id: 'boost-auto-tap',
    name: 'Auto Tap',
    description: 'Automatically taps 5 times per second for 10 minutes',
    type: 'boost' as const,
    rarity: 'uncommon' as const,
    icon: AutoTapImage,
    effect: {
      type: 'autoTap',
      value: 5,
      duration: 10 * 60
    },
    usable: true,
    stackable: true,
    obtained: Date.now(),
    cost: 100
  },
  TAP_BOOST: {
    id: 'boost-tap-boost',
    name: 'Tap Boost',
    description: 'Increases tap power by 5x for 100 taps',
    type: 'boost' as const,
    rarity: 'uncommon' as const,
    icon: TapBoostImage,
    effect: {
      type: 'coinsPerClick',
      value: 5,
      duration: 100
    },
    usable: true,
    stackable: true,
    obtained: Date.now(),
    cost: 75
  },
  CHEAP_UPGRADES: {
    id: 'boost-cheap-upgrades',
    name: 'Cheap Upgrades',
    description: 'Reduces upgrade costs by 10% for 10 minutes',
    type: 'boost' as const,
    rarity: 'uncommon' as const,
    icon: CheapUpgradesImage,
    effect: {
      type: 'upgradeCostReduction',
      value: 0.9,
      duration: 10 * 60
    },
    usable: true,
    stackable: true,
    obtained: Date.now(),
    cost: 50
  },
  ESSENCE_BOOST: {
    id: 'boost-essence-boost',
    name: 'Essence Boost',
    description: 'Increases potential essence reward this prestige by 25%',
    type: 'boost' as const,
    rarity: 'uncommon' as const,
    icon: EssenceBoostImage,
    effect: {
      type: 'essenceMultiplier',
      value: 1.25
    },
    usable: true,
    stackable: true,
    obtained: Date.now(),
    cost: 100
  },
  PERMA_TAP: {
    id: 'boost-perma-tap',
    name: 'Permanent Tap Boost',
    description: 'Permanently increases base tap power by +1',
    type: 'boost' as const,
    rarity: 'uncommon' as const,
    icon: PermaTapImage,
    effect: {
      type: 'coinsPerClickBase',
      value: 1
    },
    usable: true,
    stackable: true,
    obtained: Date.now(),
    cost: 150,
    maxPurchases: 10
  },
  PERMA_PASSIVE: {
    id: 'boost-perma-passive',
    name: 'Permanent Passive Boost',
    description: 'Permanently increases base passive income by +1',
    type: 'boost' as const,
    rarity: 'uncommon' as const,
    icon: PermaPassiveImage,
    effect: {
      type: 'coinsPerSecondBase',
      value: 1
    },
    usable: true,
    stackable: true,
    obtained: Date.now(),
    cost: 200,
    maxPurchases: 10
  },
  NO_ADS: {
    id: 'boost-no-ads',
    name: 'No Ads',
    description: 'Permanently removes ads from the game',
    type: 'boost' as const,
    rarity: 'legendary' as const,
    icon: NoAdsImage,
    effect: {
      type: 'noAds',
      value: 1
    },
    usable: true,
    stackable: false,
    obtained: Date.now(),
    cost: 1000,
    maxPurchases: 1
  },
  AUTO_BUY: {
    id: 'boost-auto-buy',
    name: 'Auto Buy',
    description: 'Unlocks the auto-buy feature permanently',
    type: 'boost' as const,
    rarity: 'epic' as const,
    icon: AutoBuyImage,
    effect: {
      type: 'unlockAutoBuy',
      value: 1
    },
    usable: true,
    stackable: false,
    obtained: Date.now(),
    cost: 800,
    maxPurchases: 1
  },
  INVENTORY_EXPANSION: {
    id: 'boost-inventory-expansion',
    name: 'Inventory Expansion',
    description: 'Increases inventory capacity by 5 slots',
    type: 'boost' as const,
    rarity: 'rare' as const,
    icon: InventoryExpansionImage,
    effect: {
      type: 'inventoryCapacity',
      value: 5
    },
    usable: true,
    stackable: true,
    obtained: Date.now(),
    cost: 500,
    maxPurchases: 5
  }
};

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
