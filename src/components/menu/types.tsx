import React from "react";

export interface InventoryItemEffect {
  type: "coins" | "essence" | "coinMultiplier" | "timeWarp" | "autoTap" | "noAds" | "unlockAutoBuy" | "inventoryCapacity" | "coinsPerClick";
  value: number;
  duration?: number;
}

export interface InventoryItem {
  id: string;
  name: string;
  description: string;
  icon: React.ReactNode;
  rarity: "white" | "green" | "blue" | "purple" | "orange";
  stackable: boolean;
  usable: boolean;
  quantity: number;
  effect?: InventoryItemEffect;
}

export const createInventoryItem = (item: InventoryItem, quantity: number): InventoryItem => ({
  ...item,
  quantity,
});

export const INVENTORY_ITEMS = {
  COIN_POUCH: {
    id: "coin-pouch",
    name: "Coin Pouch",
    description: "A small pouch of coins. Grants 1,000 coins.",
    icon: <img src="/icons/coin-pouch.png" alt="Coin Pouch" className="w-8 h-8" />,
    rarity: "white",
    stackable: true,
    usable: true,
    quantity: 1,
    effect: { type: "coins", value: 1000 },
  },
  ESSENCE_CRYSTAL: {
    id: "essence-crystal",
    name: "Essence Crystal",
    description: "A glowing crystal filled with cosmic essence. Grants 500 essence.",
    icon: <img src="/icons/essence-crystal.png" alt="Essence Crystal" className="w-8 h-8" />,
    rarity: "blue",
    stackable: true,
    usable: true,
    quantity: 1,
    effect: { type: "essence", value: 500 },
  },
  DOUBLE_COINS: {
    id: "boost-double-coins",
    name: "Double Coins Boost",
    description: "Doubles your coin income for 60 seconds.",
    icon: <img src="/icons/double-coins.png" alt="Double Coins" className="w-8 h-8" />,
    rarity: "green", // Changed to green
    stackable: true,
    usable: true,
    quantity: 1,
    effect: { type: "coinMultiplier", value: 2, duration: 60 },
  },
  TIME_WARP: {
    id: "boost-time-warp",
    name: "Time Warp",
    description: "Grants 2 hours worth of passive income instantly.",
    icon: <img src="/icons/time-warp.png" alt="Time Warp" className="w-8 h-8" />,
    rarity: "green", // Changed to green
    stackable: true,
    usable: true,
    quantity: 1,
    effect: { type: "timeWarp", value: 7200 },
  },
  AUTO_TAP: {
    id: "boost-auto-tap",
    name: "Auto-Tap Boost",
    description: "Automatically taps for you at 5x speed for 30 seconds.",
    icon: <img src="/icons/auto-tap.png" alt="Auto Tap" className="w-8 h-8" />,
    rarity: "green", // Changed to green
    stackable: true,
    usable: true,
    quantity: 1,
    effect: { type: "autoTap", value: 5, duration: 30 },
  },
  NO_ADS: {
    id: "boost-no-ads",
    name: "Ad-Free Pass",
    description: "Removes all ads permanently.",
    icon: <img src="/icons/no-ads.png" alt="No Ads" className="w-8 h-8" />,
    rarity: "orange",
    stackable: false,
    usable: true,
    quantity: 1,
    effect: { type: "noAds", value: 1 },
  },
  AUTO_BUY: {
    id: "boost-auto-buy",
    name: "Auto-Buy Unlock",
    description: "Unlocks the auto-buy feature permanently.",
    icon: <img src="/icons/auto-buy.png" alt="Auto Buy" className="w-8 h-8" />,
    rarity: "purple",
    stackable: false,
    usable: true,
    quantity: 1,
    effect: { type: "unlockAutoBuy", value: 1 },
  },
  INVENTORY_EXPANSION: {
    id: "boost-inventory-expansion",
    name: "Inventory Expansion",
    description: "Increases inventory capacity by 50 slots.",
    icon: <img src="/icons/inventory-expansion.png" alt="Inventory Expansion" className="w-8 h-8" />,
    rarity: "blue",
    stackable: true,
    usable: true,
    quantity: 1,
    effect: { type: "inventoryCapacity", value: 50 },
  },
  TAP_BOOST: {
    id: "boost-tap-boost",
    name: "Tap Boost",
    description: "Increases tap value by 5x for the next 50 taps.",
    icon: <img src="/icons/tap-boost.png" alt="Tap Boost" className="w-8 h-8" />,
    rarity: "green", // Changed to green
    stackable: true,
    usable: true,
    quantity: 1,
    effect: { type: "coinsPerClick", value: 5, duration: 50 },
  },
  ESSENCE_BOOST: {
    id: "boost-essence-boost",
    name: "Essence Boost",
    description: "Increases essence earned from prestige by 50%.",
    icon: <img src="/icons/essence-boost.png" alt="Essence Boost" className="w-8 h-8" />,
    rarity: "purple",
    stackable: true,
    usable: true,
    quantity: 1,
    effect: { type: "essence", value: 1.5 },
  },
  PERMA_TAP: {
    id: "boost-perma-tap",
    name: "Permanent Tap Boost",
    description: "Permanently increases tap value by 10.",
    icon: <img src="/icons/perma-tap.png" alt="Perma Tap" className="w-8 h-8" />,
    rarity: "orange",
    stackable: true,
    usable: true,
    quantity: 1,
    effect: { type: "coinsPerClick", value: 10 },
  },
  PERMA_PASSIVE: {
    id: "boost-perma-passive",
    name: "Permanent Passive Boost",
    description: "Permanently increases passive income by 100.",
    icon: <img src="/icons/perma-passive.png" alt="Perma Passive" className="w-8 h-8" />,
    rarity: "orange",
    stackable: true,
    usable: true,
    quantity: 1,
    effect: { type: "coins", value: 100 },
  },
  CHEAP_UPGRADES: {
    id: "boost-cheap-upgrades",
    name: "Cheap Upgrades",
    description: "Reduces upgrade costs by 20% for 60 seconds.",
    icon: <img src="/icons/cheap-upgrades.png" alt="Cheap Upgrades" className="w-8 h-8" />,
    rarity: "green", // Changed to green
    stackable: true,
    usable: true,
    quantity: 1,
    effect: { type: "coinMultiplier", value: 0.8, duration: 60 },
  },
};
