// src/utils/levelUpRewards.ts
import { InventoryItem, INVENTORY_ITEMS, createInventoryItem } from '@/components/menu/types';

export interface LevelUpReward {
  gems: number;
  essence: number;
  inventoryItems: InventoryItem[];
}

const BOOST_ITEMS = [
  INVENTORY_ITEMS.ESSENCE_BOOST,
  INVENTORY_ITEMS.CHEAP_UPGRADES,
  INVENTORY_ITEMS.TAP_BOOST,
  INVENTORY_ITEMS.AUTO_TAP,
  INVENTORY_ITEMS.RANDOM_BOOST,
  INVENTORY_ITEMS.CRITICAL_CHANCE,
  INVENTORY_ITEMS.TIME_WARP_24,
  INVENTORY_ITEMS.DOUBLE_COINS,
];

// Predefined rewards for every 5 levels from 5 to 100
const LEVEL_REWARDS: Record<number, LevelUpReward> = {
  5: { gems: 25, essence: 10, inventoryItems: [createInventoryItem(BOOST_ITEMS[0], 1)] }, // Essence Boost
  10: { gems: 35, essence: 20, inventoryItems: [createInventoryItem(BOOST_ITEMS[1], 1)] }, // Cheap Upgrades
  15: { gems: 50, essence: 30, inventoryItems: [createInventoryItem(BOOST_ITEMS[2], 1), createInventoryItem(BOOST_ITEMS[3], 1)] }, // Tap Boost + Auto Tap
  20: { gems: 65, essence: 40, inventoryItems: [createInventoryItem(BOOST_ITEMS[4], 1)] }, // Random Boost
  25: { gems: 80, essence: 50, inventoryItems: [createInventoryItem(BOOST_ITEMS[5], 1), createInventoryItem(BOOST_ITEMS[0], 1)] }, // Critical Chance + Essence Boost
  30: { gems: 95, essence: 60, inventoryItems: [createInventoryItem(BOOST_ITEMS[6], 1)] }, // Time Warp 24
  35: { gems: 110, essence: 70, inventoryItems: [createInventoryItem(BOOST_ITEMS[7], 1), createInventoryItem(BOOST_ITEMS[1], 1)] }, // Double Coins + Cheap Upgrades
  40: { gems: 125, essence: 80, inventoryItems: [createInventoryItem(BOOST_ITEMS[2], 1)] }, // Tap Boost
  45: { gems: 140, essence: 90, inventoryItems: [createInventoryItem(BOOST_ITEMS[3], 1), createInventoryItem(BOOST_ITEMS[4], 1)] }, // Auto Tap + Random Boost
  50: { gems: 155, essence: 100, inventoryItems: [createInventoryItem(BOOST_ITEMS[5], 1), createInventoryItem(BOOST_ITEMS[6], 1)] }, // Critical Chance + Time Warp 24
  55: { gems: 170, essence: 120, inventoryItems: [createInventoryItem(BOOST_ITEMS[0], 1)] }, // Essence Boost
  60: { gems: 185, essence: 140, inventoryItems: [createInventoryItem(BOOST_ITEMS[7], 1), createInventoryItem(BOOST_ITEMS[2], 1)] }, // Double Coins + Tap Boost
  65: { gems: 200, essence: 160, inventoryItems: [createInventoryItem(BOOST_ITEMS[1], 1), createInventoryItem(BOOST_ITEMS[3], 1)] }, // Cheap Upgrades + Auto Tap
  70: { gems: 215, essence: 180, inventoryItems: [createInventoryItem(BOOST_ITEMS[4], 1)] }, // Random Boost
  75: { gems: 230, essence: 200, inventoryItems: [createInventoryItem(BOOST_ITEMS[5], 1), createInventoryItem(BOOST_ITEMS[6], 1)] }, // Critical Chance + Time Warp 24
  80: { gems: 245, essence: 220, inventoryItems: [createInventoryItem(BOOST_ITEMS[0], 1), createInventoryItem(BOOST_ITEMS[7], 1)] }, // Essence Boost + Double Coins
  85: { gems: 260, essence: 240, inventoryItems: [createInventoryItem(BOOST_ITEMS[2], 1), createInventoryItem(BOOST_ITEMS[1], 1)] }, // Tap Boost + Cheap Upgrades
  90: { gems: 275, essence: 260, inventoryItems: [createInventoryItem(BOOST_ITEMS[3], 1), createInventoryItem(BOOST_ITEMS[4], 1)] }, // Auto Tap + Random Boost
  95: { gems: 290, essence: 280, inventoryItems: [createInventoryItem(BOOST_ITEMS[5], 1), createInventoryItem(BOOST_ITEMS[6], 1)] }, // Critical Chance + Time Warp 24
  100: { gems: 300, essence: 300, inventoryItems: [createInventoryItem(BOOST_ITEMS[7], 2), createInventoryItem(BOOST_ITEMS[0], 1), createInventoryItem(BOOST_ITEMS[2], 1)] }, // Double Coins x2 + Essence Boost + Tap Boost
};

export const calculateLevelUpRewards = (level: number): LevelUpReward | null => {
  // Only award every 5 levels
  if (level % 5 !== 0 || level < 5 || level > 100) return null;

  // Return predefined rewards
  return LEVEL_REWARDS[level];
};