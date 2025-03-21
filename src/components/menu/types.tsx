
import React from 'react';
import { Coins, Gem, Sparkles, Brain, Clock, Zap, CircleDollarSign, DollarSign, Percent, Star, Rocket, VideoOff, PackagePlus, Box } from 'lucide-react';

// Static PNG imports for inventory items (replace with your actual image paths)
import CoinsImage from '@/assets/images/icons/coins.png';
import GemsImage from '@/assets/images/icons/gems.png';
import EssenceImage from '@/assets/images/icons/essence.png';
import SkillPointsImage from '@/assets/images/icons/points.png';
import DoubleCoinsImage from '@/assets/images/icons/potion1.png';
import TimeWarpImage from '@/assets/images/icons/potion2.png';
import AutoTapImage from '@/assets/images/icons/potion2.png';
import TapBoostImage from '@/assets/images/icons/potion3.png';
import CheapUpgradesImage from '@/assets/images/icons/potion4.png';
import EssenceBoostImage from '@/assets/images/icons/potion5.png';
import PermaTapImage from '@/assets/images/icons/potion6.png';
import PermaPassiveImage from '@/assets/images/icons/potion7.png';
import NoAdsImage from '@/assets/images/icons/potion8.png';
import AutoBuyImage from '@/assets/images/icons/potion9.png'; // Reused as example
import InventoryExpansionImage from '@/assets/images/icons/potion10.png'; // Reused as example

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

// BoostEffect type to track used inventory items
export interface BoostEffect {
  id: string;
  name: string;
  description: string;
  quantity: number;
  value: number;
  duration?: number;
  activatedAt?: number;
  remainingTime?: number;
  icon: React.ReactNode;
}

export interface InventoryItem {
  id: string;
  name: string;
  description: string;
  type: 'resource' | 'boost' | 'reward' | 'gift' | 'consumable';
  rarity: 'common' | 'uncommon' | 'rare' | 'epic' | 'legendary';
  icon: React.ReactNode; // Remains React.ReactNode
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

// Type guard to check if an item is a boost with cost
export function isBoostWithCost(item: InventoryItem): item is InventoryItem & { cost: number } {
  return item.type === 'boost' && item.cost !== undefined;
}

export const INVENTORY_ITEMS = {
  COINS: {
    id: 'resource-coins',
    name: 'Coins',
    description: 'The main currency used for upgrades',
    type: 'resource' as const,
    rarity: 'common' as const,
    icon: <img src={CoinsImage} alt="Coins" className="w-8 h-8" />, // PNG wrapped in <img>
    usable: false,
    stackable: true,
    obtained: Date.now(),
    quantity: 0, // Adding quantity to fix type error
  },
  GEMS: {
    id: 'resource-gems',
    name: 'Gems',
    description: 'Premium currency for special items',
    type: 'resource' as const,
    rarity: 'epic' as const,
    icon: <img src={GemsImage} alt="Gems" className="w-8 h-8" />,
    usable: false,
    stackable: true,
    obtained: Date.now(),
    quantity: 0, // Adding quantity to fix type error
  },
  ESSENCE: {
    id: 'resource-essence',
    name: 'Essence',
    description: 'Earned through prestige, used for permanent upgrades',
    type: 'resource' as const,
    rarity: 'legendary' as const,
    icon: <img src={EssenceImage} alt="Essence" className="w-8 h-8" />,
    usable: false,
    stackable: true,
    obtained: Date.now(),
    quantity: 0, // Adding quantity to fix type error
  },
  SKILL_POINTS: {
    id: 'resource-skillpoints',
    name: 'Skill Points',
    description: 'Used to unlock abilities in the tech tree',
    type: 'resource' as const,
    rarity: 'rare' as const,
    icon: <img src={SkillPointsImage} alt="Skill Points" className="w-8 h-8" />,
    usable: false,
    stackable: true,
    obtained: Date.now(),
    quantity: 0, // Adding quantity to fix type error
  },
  DOUBLE_COINS: {
    id: 'boost-double-coins',
    name: 'Double Coins',
    description: 'Doubles all coin earnings for 30 minutes',
    type: 'boost' as const,
    rarity: 'uncommon' as const,
    icon: <img src={DoubleCoinsImage} alt="Double Coins" className="w-8 h-8" />,
    effect: {
      type: 'coinMultiplier',
      value: 2,
      duration: 30 * 60
    },
    usable: true,
    stackable: true,
    obtained: Date.now(),
    cost: 100,
    quantity: 0, // Adding quantity to fix type error
    maxPurchases: Infinity // Adding maxPurchases to fix type error
  },
  TIME_WARP: {
    id: 'boost-time-warp',
    name: 'Time Warp',
    description: 'Instantly gain 2 hours worth of passive income',
    type: 'boost' as const,
    rarity: 'uncommon' as const,
    icon: <img src={TimeWarpImage} alt="Time Warp" className="w-8 h-8" />,
    effect: {
      type: 'timeWarp',
      value: 2 * 60 * 60,
    },
    usable: true,
    stackable: true,
    obtained: Date.now(),
    cost: 50,
    quantity: 0, // Adding quantity to fix type error
    maxPurchases: Infinity // Adding maxPurchases to fix type error
  },
  AUTO_TAP: {
    id: 'boost-auto-tap',
    name: 'Auto Tap',
    description: 'Automatically taps 5 times per second for 10 minutes',
    type: 'boost' as const,
    rarity: 'uncommon' as const,
    icon: <img src={AutoTapImage} alt="Auto Tap" className="w-8 h-8" />,
    effect: {
      type: 'autoTap',
      value: 5,
      duration: 10 * 60
    },
    usable: true,
    stackable: true,
    obtained: Date.now(),
    cost: 100,
    quantity: 0, // Adding quantity to fix type error
    maxPurchases: Infinity // Adding maxPurchases to fix type error
  },
  TAP_BOOST: {
    id: 'boost-tap-boost',
    name: 'Tap Boost',
    description: 'Increases tap power by 5x for 100 taps',
    type: 'boost' as const,
    rarity: 'uncommon' as const,
    icon: <img src={TapBoostImage} alt="Tap Boost" className="w-8 h-8" />,
    effect: {
      type: 'coinsPerClick',
      value: 5,
      duration: 100
    },
    usable: true,
    stackable: true,
    obtained: Date.now(),
    cost: 75,
    quantity: 0, // Adding quantity to fix type error
    maxPurchases: Infinity // Adding maxPurchases to fix type error
  },
  CHEAP_UPGRADES: {
    id: 'boost-cheap-upgrades',
    name: 'Cheap Upgrades',
    description: 'Reduces upgrade costs by 10% for 10 minutes',
    type: 'boost' as const,
    rarity: 'uncommon' as const,
    icon: <img src={CheapUpgradesImage} alt="Cheap Upgrades" className="w-8 h-8" />,
    effect: {
      type: 'upgradeCostReduction',
      value: 0.9,
      duration: 10 * 60
    },
    usable: true,
    stackable: true,
    obtained: Date.now(),
    cost: 50,
    quantity: 0, // Adding quantity to fix type error
    maxPurchases: Infinity // Adding maxPurchases to fix type error
  },
  ESSENCE_BOOST: {
    id: 'boost-essence-boost',
    name: 'Essence Boost',
    description: 'Increases potential essence reward this prestige by 25%',
    type: 'boost' as const,
    rarity: 'uncommon' as const,
    icon: <img src={EssenceBoostImage} alt="Essence Boost" className="w-8 h-8" />,
    effect: {
      type: 'essenceMultiplier',
      value: 1.25
    },
    usable: true,
    stackable: true,
    obtained: Date.now(),
    cost: 100,
    quantity: 0, // Adding quantity to fix type error
    maxPurchases: Infinity // Adding maxPurchases to fix type error
  },
  PERMA_TAP: {
    id: 'boost-perma-tap',
    name: 'Permanent Tap Boost',
    description: 'Permanently increases base tap power by +1',
    type: 'boost' as const,
    rarity: 'uncommon' as const,
    icon: <img src={PermaTapImage} alt="Permanent Tap Boost" className="w-8 h-8" />,
    effect: {
      type: 'coinsPerClickBase',
      value: 1
    },
    usable: true,
    stackable: true,
    obtained: Date.now(),
    cost: 150,
    quantity: 0, // Adding quantity to fix type error
    maxPurchases: 10
  },
  PERMA_PASSIVE: {
    id: 'boost-perma-passive',
    name: 'Permanent Passive Boost',
    description: 'Permanently increases base passive income by +1',
    type: 'boost' as const,
    rarity: 'uncommon' as const,
    icon: <img src={PermaPassiveImage} alt="Permanent Passive Boost" className="w-8 h-8" />,
    effect: {
      type: 'coinsPerSecondBase',
      value: 1
    },
    usable: true,
    stackable: true,
    obtained: Date.now(),
    cost: 200,
    quantity: 0, // Adding quantity to fix type error
    maxPurchases: 10
  },
  NO_ADS: {
    id: 'boost-no-ads',
    name: 'No Ads',
    description: 'Permanently removes ads from the game',
    type: 'boost' as const,
    rarity: 'legendary' as const,
    icon: <img src={NoAdsImage} alt="No Ads" className="w-8 h-8" />,
    effect: {
      type: 'noAds',
      value: 1
    },
    usable: true,
    stackable: false,
    obtained: Date.now(),
    cost: 1000,
    quantity: 0, // Adding quantity to fix type error
    maxPurchases: 1
  },
  AUTO_BUY: {
    id: 'boost-auto-buy',
    name: 'Auto Buy',
    description: 'Unlocks the auto-buy feature permanently',
    type: 'boost' as const,
    rarity: 'epic' as const,
    icon: <img src={AutoBuyImage} alt="Auto Buy" className="w-8 h-8" />,
    effect: {
      type: 'unlockAutoBuy',
      value: 1
    },
    usable: true,
    stackable: false,
    obtained: Date.now(),
    cost: 800,
    quantity: 0, // Adding quantity to fix type error
    maxPurchases: 1
  },
  INVENTORY_EXPANSION: {
    id: 'boost-inventory-expansion',
    name: 'Inventory Expansion',
    description: 'Increases inventory capacity by 5 slots',
    type: 'boost' as const,
    rarity: 'rare' as const,
    icon: <img src={InventoryExpansionImage} alt="Inventory Expansion" className="w-8 h-8" />,
    effect: {
      type: 'inventoryCapacity',
      value: 5
    },
    usable: true,
    stackable: true,
    obtained: Date.now(),
    cost: 500,
    quantity: 0, // Adding quantity to fix type error
    maxPurchases: 5
  }
};

export function createInventoryItem(
  itemTemplate: Partial<InventoryItem> & { id: string, name: string, description: string, type: 'resource' | 'boost' | 'reward' | 'gift' | 'consumable', rarity: 'common' | 'uncommon' | 'rare' | 'epic' | 'legendary', icon: React.ReactNode, usable: boolean, stackable: boolean },
  quantity: number = 1
): InventoryItem {
  return {
    ...itemTemplate,
    quantity,
    obtained: Date.now()
  } as InventoryItem;
}
