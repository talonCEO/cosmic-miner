
export interface Manager {
  id: string;
  name: string;
  description: string;
  bonus: string;
  requiredCoins: number;
  avatar: string;
}

export const managers: Manager[] = [
  {
    id: "manager-1",
    name: "Dr. Hydrogen",
    description: "Expert in lightweight element extraction",
    bonus: "Increases Hydrogen production by 50%",
    requiredCoins: 1000,
    avatar: "https://api.dicebear.com/7.x/bottts/svg?seed=hydrogen"
  },
  {
    id: "manager-2",
    name: "Carbon Collector",
    description: "Specializes in organic compound synthesis",
    bonus: "Automatically collects Carbon every 5 seconds",
    requiredCoins: 5000,
    avatar: "https://api.dicebear.com/7.x/bottts/svg?seed=carbon"
  },
  {
    id: "manager-3",
    name: "Oxygen Oracle",
    description: "Breathes life into your operations",
    bonus: "Doubles Oxygen yield when active",
    requiredCoins: 10000,
    avatar: "https://api.dicebear.com/7.x/bottts/svg?seed=oxygen"
  },
  {
    id: "manager-4",
    name: "Silicon Savant",
    description: "Tech wizard for electronic element mining",
    bonus: "Reduces Silicon cost by 25%",
    requiredCoins: 25000,
    avatar: "https://api.dicebear.com/7.x/bottts/svg?seed=silicon"
  },
  {
    id: "manager-5",
    name: "Iron Forger",
    description: "Master of metallurgy and ferrous elements",
    bonus: "Iron produces an additional 2% per level",
    requiredCoins: 50000,
    avatar: "https://api.dicebear.com/7.x/bottts/svg?seed=iron"
  },
  {
    id: "manager-6",
    name: "Gold Prospector",
    description: "Has a nose for precious metals",
    bonus: "10% chance to find bonus Gold with each tap",
    requiredCoins: 500000,
    avatar: "https://api.dicebear.com/7.x/bottts/svg?seed=gold"
  },
  {
    id: "manager-7",
    name: "Uranium Controller",
    description: "Handles radioactive elements with care",
    bonus: "Uranium passive income +100%",
    requiredCoins: 1000000,
    avatar: "https://api.dicebear.com/7.x/bottts/svg?seed=uranium"
  },
  {
    id: "manager-8",
    name: "Platinum Purifier",
    description: "Refines precious metals to perfect purity",
    bonus: "All precious metals give 30% more coins",
    requiredCoins: 10000000,
    avatar: "https://api.dicebear.com/7.x/bottts/svg?seed=platinum"
  },
  {
    id: "manager-9",
    name: "Exotic Matter Expert",
    description: "Specializes in theoretical elements",
    bonus: "Unlocks special research options",
    requiredCoins: 100000000,
    avatar: "https://api.dicebear.com/7.x/bottts/svg?seed=exotic"
  },
  {
    id: "manager-10",
    name: "Antimatter Alchemist",
    description: "Transmutes the impossible",
    bonus: "50% boost to all element production",
    requiredCoins: 500000000,
    avatar: "https://api.dicebear.com/7.x/bottts/svg?seed=antimatter"
  }
];
