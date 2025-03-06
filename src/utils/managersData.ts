
import { Perk } from './types';

/**
 * Manager Interface
 * 
 * Defines the structure for manager objects that can be hired to boost production
 * and provide special abilities.
 */
export interface Manager {
  id: string;                // Unique identifier
  name: string;              // Display name
  description: string;       // Describes manager role
  bonus: string;             // Description of the manager's passive bonus
  requiredCoins: number;     // Coins needed to unlock (visibility threshold)
  avatar: string;            // URL to avatar image
  cost: number;              // Essence cost to hire
  boosts?: string[];         // IDs of elements this manager boosts
  perks?: Perk[];           // Unlockable perks using skill points
}

/**
 * Managers Data
 * 
 * Each manager:
 * 1. Has a unique ID and persona
 * 2. Provides passive bonuses to specific elements
 * 3. Can have up to 3 unlockable perks (costing 3, 6, and 12 skill points)
 * 4. Affects game mechanics through different effects:
 *    - production: Increases element production rate
 *    - passive: Increases passive income
 *    - allProduction: Increases all production
 *    - cost: Reduces upgrade costs
 */
export const managers: Manager[] = [
  {
    id: "manager-default",
    name: "Steve",
    description: "The first employee you hired. He's not great, but he tries",
    bonus: "+10% can-do attitude (purely cosmetic)",
    requiredCoins: 0,
    avatar: "https://api.dicebear.com/7.x/bottts/svg?seed=steve",
    cost: 0,
    perks: [
      {
        id: "manager-default-perk-1",
        name: "Enthusiasm",
        description: "Steve works with more enthusiasm, increasing production by 5%",
        cost: 3,
        icon: "💪",
        unlocked: false,
        effect: { type: "production", value: 0.05 }
      },
      {
        id: "manager-default-perk-2",
        name: "Coffee Break",
        description: "Coffee breaks boost efficiency, increasing passive income by 10%",
        cost: 6,
        icon: "☕",
        unlocked: false,
        effect: { type: "passive", value: 0.1 }
      },
      {
        id: "manager-default-perk-3", 
        name: "Overtime Work",
        description: "Steve works overtime, increasing all production by 15%",
        cost: 12,
        icon: "🕒",
        unlocked: false,
        effect: { type: "allProduction", value: 0.15 }
      }
    ]
  },
  {
    id: "manager-1",
    name: "Dr. Hydrogen",
    description: "Expert in lightweight element extraction",
    bonus: "Increases Hydrogen and Carbon production by 50%",
    requiredCoins: 1000,
    avatar: "https://api.dicebear.com/7.x/bottts/svg?seed=hydrogen",
    cost: 1,
    perks: [
  {
    "id": "manager-default-perk-1",
    "name": "Turbo Focus",
    "description": "A surge of concentration amplifies production by 5%.",
    "cost": 3,
    "icon": "🚀",
    "unlocked": false,
    "effect": { "type": "production", "value": 0.05 }
  },
  {
    "id": "manager-default-perk-2",
    "name": "Quantum Brew",
    "description": "A hyper-caffeinated formula enhances efficiency, increasing passive income by 10%.",
    "cost": 6,
    "icon": "⚡☕",
    "unlocked": false,
    "effect": { "type": "passive", "value": 0.1 }
  },
  {
    "id": "manager-default-perk-3",
    "name": "Hyper Shift",
    "description": "Time bends to allow extra work, increasing all production by 15%.",
    "cost": 12,
    "icon": "⏳⚙️",
    "unlocked": false,
    "effect": { "type": "allProduction", "value": 0.15 }
  }
]
  },
  {
    id: "manager-2",
    name: "Carbon Collector",
    description: "Specializes in organic compound synthesis",
    bonus: "Increases Oxygen and Nitrogen production by 50%",
    requiredCoins: 5000,
    avatar: "https://api.dicebear.com/7.x/bottts/svg?seed=carbon",
    cost: 2,
    boosts: ["element-3", "element-4"]
  },
  {
    id: "manager-3",
    name: "Oxygen Oracle",
    description: "Breathes life into your operations",
    bonus: "Increases Silicon and Aluminum production by 50%",
    requiredCoins: 10000,
    avatar: "https://api.dicebear.com/7.x/bottts/svg?seed=oxygen",
    cost: 4,
    boosts: ["element-5", "element-6"]
  },
  {
    id: "manager-4",
    name: "Silicon Savant",
    description: "Tech wizard for electronic element mining",
    bonus: "Increases Iron and Copper production by 50%",
    requiredCoins: 25000,
    avatar: "https://api.dicebear.com/7.x/bottts/svg?seed=silicon",
    cost: 8,
    boosts: ["element-7", "element-8"]
  },
  {
    id: "manager-5",
    name: "Iron Forger",
    description: "Master of metallurgy and ferrous elements",
    bonus: "Increases Zinc and Tin production by 50%",
    requiredCoins: 50000,
    avatar: "https://api.dicebear.com/7.x/bottts/svg?seed=iron",
    cost: 16,
    boosts: ["element-9", "element-10"]
  },
  {
    id: "manager-6",
    name: "Gold Prospector",
    description: "Has a nose for precious metals",
    bonus: "Increases Titanium and Chromium production by 50%",
    requiredCoins: 500000,
    avatar: "https://api.dicebear.com/7.x/bottts/svg?seed=gold",
    cost: 32,
    boosts: ["element-11", "element-12"]
  },
  {
    id: "manager-7",
    name: "Uranium Controller",
    description: "Handles radioactive elements with care",
    bonus: "Increases Manganese and Cobalt production by 50%",
    requiredCoins: 1000000,
    avatar: "https://api.dicebear.com/7.x/bottts/svg?seed=uranium",
    cost: 64,
    boosts: ["element-13", "element-14"]
  },
  {
    id: "manager-8",
    name: "Platinum Purifier",
    description: "Refines precious metals to perfect purity",
    bonus: "Increases Nickel and Molybdenum production by 50%",
    requiredCoins: 10000000,
    avatar: "https://api.dicebear.com/7.x/bottts/svg?seed=platinum",
    cost: 128,
    boosts: ["element-15", "element-16"]
  },
  {
    id: "manager-9",
    name: "Exotic Matter Expert",
    description: "Specializes in theoretical elements",
    bonus: "Increases Silver and Tungsten production by 50%",
    requiredCoins: 100000000,
    avatar: "https://api.dicebear.com/7.x/bottts/svg?seed=exotic",
    cost: 256,
    boosts: ["element-17", "element-18"]
  },
  {
    id: "manager-10",
    name: "Antimatter Alchemist",
    description: "Transmutes the impossible",
    bonus: "Increases Lead and Uranium production by 50%",
    requiredCoins: 500000000,
    avatar: "https://api.dicebear.com/7.x/bottts/svg?seed=antimatter",
    cost: 512,
    boosts: ["element-19", "element-20"]
  }
];
