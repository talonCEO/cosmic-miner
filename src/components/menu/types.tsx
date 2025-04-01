import React from 'react';
import { Coins, Gem, Sparkles, Brain, Clock, Zap, CircleDollarSign, DollarSign, Percent, Star, Rocket, VideoOff, PackagePlus, Box } from 'lucide-react';

// Static PNG imports for inventory items (replace with your actual image paths)
import CoinsImage from '@/assets/images/icons/coins.png';
import GemsImage from '@/assets/images/icons/gems.png';
import EssenceImage from '@/assets/images/icons/essence.png';
import SkillPointsImage from '@/assets/images/icons/points.png';
import DoubleCoinsImage from '@/assets/images/icons/boost3.png';
import TimeWarpImage from '@/assets/images/icons/boost2.png';
import AutoTapImage from '@/assets/images/icons/boost1.png';
import TapBoostImage from '@/assets/images/icons/boost1.png';
import CheapUpgradesImage from '@/assets/images/icons/boost4.png';
import EssenceBoostImage from '@/assets/images/icons/boost5.png';
import PermaTapImage from '@/assets/images/icons/boost7.png';
import PermaPassiveImage from '@/assets/images/icons/boost6.png';
import NoAdsImage from '@/assets/images/icons/boost8.png';
import AutoBuyImage from '@/assets/images/icons/boost9.png';
import InventoryExpansionImage from '@/assets/images/icons/quantum-vibration.png';
import CritChanceImage from '@/assets/images/icons/boost1.png';
import RandomBoostImage from '@/assets/images/icons/boost1.png';
// Reusing TimeWarpImage as a placeholder for the new boost; replace with a unique image if available
import ExtendedOfflineImage from '@/assets/images/icons/boost2.png';

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
  icon: React.ReactNode;
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
    icon: <img src={CoinsImage} alt="Coins" className="w-8 h-8" />,
    usable: false,
    stackable: true,
    obtained: Date.now(),
    quantity: 0,
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
    quantity: 0,
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
    quantity: 0,
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
    quantity: 0,
  },
  DOUBLE_COINS: {
    id: 'boost-double-coins',
    name: 'Double Coins',
    description: 'Doubles coin earnings for 30min',
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
    cost: 50,
    quantity: 0,
    maxPurchases: Infinity
  },
  TIME_WARP: {
    id: 'boost-time-warp',
    name: 'Time Warp (4h)',
    description: 'Gain 4hr of passive income',
    type: 'boost' as const,
    rarity: 'uncommon' as const,
    icon: <img src={TimeWarpImage} alt="Time Warp" className="w-8 h-8" />,
    effect: {
      type: 'timeWarp',
      value: 4 * 60 * 60,
    },
    usable: true,
    stackable: true,
    obtained: Date.now(),
    cost: 50,
    quantity: 0,
    maxPurchases: Infinity
  },
  TIME_WARP_12: {
    id: 'boost-time-warp-12',
    name: 'Time Warp (12h)',
    description: 'Gain 12hr of passive income',
    type: 'boost' as const,
    rarity: 'rare' as const,
    icon: <img src={TimeWarpImage} alt="Time Warp 12h" className="w-8 h-8" />,
    effect: {
      type: 'timeWarp',
      value: 12 * 60 * 60,
    },
    usable: true,
    stackable: true,
    obtained: Date.now(),
    cost: 125,
    quantity: 0,
    maxPurchases: Infinity
  },
  TIME_WARP_24: {
    id: 'boost-time-warp-24',
    name: 'Time Warp (24h)',
    description: 'Gain 24hr of passive income',
    type: 'boost' as const,
    rarity: 'epic' as const,
    icon: <img src={TimeWarpImage} alt="Time Warp 24h" className="w-8 h-8" />,
    effect: {
      type: 'timeWarp',
      value: 24 * 60 * 60,
    },
    usable: true,
    stackable: true,
    obtained: Date.now(),
    cost: 200,
    quantity: 0,
    maxPurchases: Infinity
  },
  CRITICAL_CHANCE: {
    id: 'boost-critical-chance',
    name: 'Critical Strike Boost',
    description: '100% critical strike chance for 2min',
    type: 'boost' as const,
    rarity: 'rare' as const,
    icon: <img src={CritChanceImage} alt="Critical Chance" className="w-8 h-8" />,
    effect: {
      type: 'criticalChance',
      value: 1.0,
      duration: 2 * 60,
    },
    usable: true,
    stackable: true,
    obtained: Date.now(),
    cost: 100,
    quantity: 0,
    maxPurchases: Infinity
  },
  RANDOM_BOOST: {
    id: 'boost-random',
    name: 'Mystery Boost',
    description: 'Random boost: Auto Tap, Cheap Upgrades, Tap Boost, Critical Chance, Time Warp, Essence Boost, Perma Tap, or Perma Passive',
    type: 'boost' as const,
    rarity: 'epic' as const,
    icon: <img src={RandomBoostImage} alt="Random Boost" className="w-8 h-8" />,
    effect: {
      type: 'randomBoost',
      value: 1,
    },
    usable: true,
    stackable: true,
    obtained: Date.now(),
    cost: 50,
    quantity: 0,
    maxPurchases: Infinity
  },
  AUTO_TAP: {
    id: 'boost-auto-tap',
    name: 'Auto Tap',
    description: 'Automatically taps for 5min',
    type: 'boost' as const,
    rarity: 'uncommon' as const,
    icon: <img src={AutoTapImage} alt="Auto Tap" className="w-8 h-8" />,
    effect: {
      type: 'autoTap',
      value: 5,
      duration: 5 * 60
    },
    usable: true,
    stackable: true,
    obtained: Date.now(),
    cost: 100,
    quantity: 0,
    maxPurchases: Infinity
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
    cost: 50,
    quantity: 0,
    maxPurchases: Infinity
  },
  CHEAP_UPGRADES: {
    id: 'boost-cheap-upgrades',
    name: 'Cheap Upgrades',
    description: 'Reduces upgrade costs by 10% for 10min',
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
    quantity: 0,
    maxPurchases: Infinity
  },
  ESSENCE_BOOST: {
    id: 'boost-essence-boost',
    name: 'Essence Boost',
    description: 'Increases essence reward this prestige by 25%',
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
    cost: 50,
    quantity: 0,
    maxPurchases: Infinity
  },
  PERMA_TAP: {
    id: 'boost-perma-tap',
    name: 'Permanent Tap Boost',
    description: 'Permanently increases tap power by 1% per stack',
    type: 'boost' as const,
    rarity: 'uncommon' as const,
    icon: <img src={PermaTapImage} alt="Permanent Tap Boost" className="w-8 h-8" />,
    effect: {
      type: 'coinsPerClickMultiplier', // Changed from 'coinsPerClickBase'
      value: 0.01 // 1% per stack
    },
    usable: true,
    stackable: true,
    obtained: Date.now(),
    cost: 150,
    quantity: 0,
    maxPurchases: Infinity
  },
  PERMA_PASSIVE: {
    id: 'boost-perma-passive',
    name: 'Permanent Passive Boost',
    description: 'Permanently increases passive income by 1% per stack',
    type: 'boost' as const,
    rarity: 'uncommon' as const,
    icon: <img src={PermaPassiveImage} alt="Permanent Passive Boost" className="w-8 h-8" />,
    effect: {
      type: 'coinsPerSecondMultiplier', // Changed from 'coinsPerSecondBase'
      value: 0.01 // 1% per stack
    },
    usable: true,
    stackable: true,
    obtained: Date.now(),
    cost: 200,
    quantity: 0,
    maxPurchases: Infinity
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
    quantity: 0,
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
    quantity: 0,
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
    quantity: 0,
    maxPurchases: 5
  },
  EXTENDED_OFFLINE: {
    id: 'boost-extended-offline',
    name: 'Offline Earnings',
    description: 'Extends offline passive income duration to 24 hours.',
    type: 'boost' as const,
    rarity: 'legendary' as const,
    icon: <img src={ExtendedOfflineImage} alt="Extended Offline Earnings" className="w-8 h-8" />,
    effect: {
      type: 'offlineEarningsDuration',
      value: 24 * 60 * 60 // 24 hours in seconds
    },
    usable: true,
    stackable: false,
    obtained: Date.now(),
    cost: 1000,
    quantity: 0,
    maxPurchases: 1
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