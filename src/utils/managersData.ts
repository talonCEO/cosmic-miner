
export interface Manager {
  id: string;
  name: string;
  description: string;
  bonus: string;
  requiredCoins: number;
  avatar: string;
  cost: number;
}

export const managers: Manager[] = [
  {
    id: "manager-default",
    name: "Steve",
    description: "The first employee you hired. He's not great, but he tries",
    bonus: "+10% can-do attitude (purely cosmetic)",
    requiredCoins: 0,
    avatar: "https://api.dicebear.com/7.x/bottts/svg?seed=steve",
    cost: 0
  },
  {
    id: "manager-1",
    name: "Dr. Hydrogen",
    description: "Expert in lightweight element extraction",
    bonus: "Increases Hydrogen production by 50%",
    requiredCoins: 1000,
    avatar: "https://api.dicebear.com/7.x/bottts/svg?seed=hydrogen",
    cost: 1
  },
  {
    id: "manager-2",
    name: "Carbon Collector",
    description: "Specializes in organic compound synthesis",
    bonus: "Increases Carbon production by 50%",
    requiredCoins: 5000,
    avatar: "https://api.dicebear.com/7.x/bottts/svg?seed=carbon",
    cost: 2
  },
  {
    id: "manager-3",
    name: "Oxygen Oracle",
    description: "Breathes life into your operations",
    bonus: "Increases Oxygen production by 50%",
    requiredCoins: 10000,
    avatar: "https://api.dicebear.com/7.x/bottts/svg?seed=oxygen",
    cost: 4
  },
  {
    id: "manager-4",
    name: "Silicon Savant",
    description: "Tech wizard for electronic element mining",
    bonus: "Increases Silicon production by 50%",
    requiredCoins: 25000,
    avatar: "https://api.dicebear.com/7.x/bottts/svg?seed=silicon",
    cost: 8
  },
  {
    id: "manager-5",
    name: "Iron Forger",
    description: "Master of metallurgy and ferrous elements",
    bonus: "Increases Iron production by 50%",
    requiredCoins: 50000,
    avatar: "https://api.dicebear.com/7.x/bottts/svg?seed=iron",
    cost: 16
  },
  {
    id: "manager-6",
    name: "Gold Prospector",
    description: "Has a nose for precious metals",
    bonus: "Increases Gold production by 50%",
    requiredCoins: 500000,
    avatar: "https://api.dicebear.com/7.x/bottts/svg?seed=gold",
    cost: 32
  },
  {
    id: "manager-7",
    name: "Uranium Controller",
    description: "Handles radioactive elements with care",
    bonus: "Increases Uranium production by 50%",
    requiredCoins: 1000000,
    avatar: "https://api.dicebear.com/7.x/bottts/svg?seed=uranium",
    cost: 64
  },
  {
    id: "manager-8",
    name: "Platinum Purifier",
    description: "Refines precious metals to perfect purity",
    bonus: "Increases Platinum production by 50%",
    requiredCoins: 10000000,
    avatar: "https://api.dicebear.com/7.x/bottts/svg?seed=platinum",
    cost: 128
  },
  {
    id: "manager-9",
    name: "Exotic Matter Expert",
    description: "Specializes in theoretical elements",
    bonus: "Increases Exotic Matter production by 50%",
    requiredCoins: 100000000,
    avatar: "https://api.dicebear.com/7.x/bottts/svg?seed=exotic",
    cost: 256
  },
  {
    id: "manager-10",
    name: "Antimatter Alchemist",
    description: "Transmutes the impossible",
    bonus: "Increases Antimatter production by 50%",
    requiredCoins: 500000000,
    avatar: "https://api.dicebear.com/7.x/bottts/svg?seed=antimatter",
    cost: 512
  }
];
