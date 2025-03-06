
import { Shield, Zap, Brain, Star, TargetIcon, HandCoins, Trophy, CloudLightning, Gem, Gauge, Compass, Sparkles, Rocket, Flame, Heart, Diamond, Eye } from 'lucide-react';
import { ManagerAbility } from './types';

export interface Manager {
  id: string;
  name: string;
  description: string;
  bonus: string;
  requiredCoins: number;
  avatar: string;
  cost: number;
  boosts?: string[]; // Array of element IDs that this manager boosts
  abilities?: ManagerAbility[];
}

// Define abilities for each manager
const createManagerAbilities = (): ManagerAbility[] => {
  const managerIds = [
    "manager-default", "manager-1", "manager-2", "manager-3", "manager-4", "manager-5",
    "manager-6", "manager-7", "manager-8", "manager-9", "manager-10"
  ];
  
  const abilities: ManagerAbility[] = [];
  
  // Add 3 abilities for each manager
  managerIds.forEach(managerId => {
    const baseId = managerId.replace("manager-", "");
    
    // Tier 1 Ability - 3 skill points
    abilities.push({
      id: `manager-ability-${baseId}-1`,
      managerId: managerId,
      name: getManagerAbilityName(managerId, 1),
      description: getManagerAbilityDescription(managerId, 1),
      cost: 3,
      icon: getManagerAbilityIcon(managerId, 1),
      unlocked: false
    });
    
    // Tier 2 Ability - 6 skill points
    abilities.push({
      id: `manager-ability-${baseId}-2`,
      managerId: managerId,
      name: getManagerAbilityName(managerId, 2),
      description: getManagerAbilityDescription(managerId, 2),
      cost: 6,
      icon: getManagerAbilityIcon(managerId, 2),
      unlocked: false
    });
    
    // Tier 3 Ability - 12 skill points
    abilities.push({
      id: `manager-ability-${baseId}-3`,
      managerId: managerId,
      name: getManagerAbilityName(managerId, 3),
      description: getManagerAbilityDescription(managerId, 3),
      cost: 12,
      icon: getManagerAbilityIcon(managerId, 3),
      unlocked: false
    });
  });
  
  return abilities;
};

// Helper functions to generate ability details based on manager ID and tier
function getManagerAbilityName(managerId: string, tier: number): string {
  const managerNames: Record<string, string[]> = {
    "manager-default": ["Assistant Training", "Team Motivation", "Leadership Excellence"],
    "manager-1": ["Hydrogen Mastery", "Elemental Fusion", "Quantum Extraction"],
    "manager-2": ["Carbon Efficiency", "Molecular Bonds", "Synthetic Creation"],
    "manager-3": ["Oxygen Circulation", "Air Purification", "Life Support"],
    "manager-4": ["Silicon Upgrade", "Circuit Enhancement", "Chip Optimization"],
    "manager-5": ["Iron Strength", "Metal Alloys", "Forge Mastery"],
    "manager-6": ["Gold Rush", "Precious Extraction", "Midas Touch"],
    "manager-7": ["Radiation Control", "Nuclear Efficiency", "Isotope Mastery"],
    "manager-8": ["Platinum Refinement", "Pure Filtration", "Noble Metals"],
    "manager-9": ["Exotic Research", "Theory Application", "Dimensional Shift"],
    "manager-10": ["Matter Reversal", "Energy Conversion", "Universe Mastery"]
  };
  
  return managerNames[managerId]?.[tier-1] || `Ability ${tier}`;
}

function getManagerAbilityDescription(managerId: string, tier: number): string {
  const descriptions: Record<string, string[]> = {
    "manager-default": [
      "Improves all production by 5% through better team coordination",
      "Increases tap value by 10% through team motivation techniques",
      "Reduces all upgrade costs by 5% through efficient resource allocation"
    ],
    "manager-1": [
      "Increases Hydrogen production by an additional 25%",
      "Adjacent elements gain 10% production boost",
      "All tapping generates 15% more coins when Hydrogen is produced"
    ],
    "manager-2": [
      "Carbon-based elements gain 20% production speed",
      "Forms molecular bonds that boost passive income by 10%",
      "Creates synthetic compounds that reduce upgrade costs by 10%"
    ],
    "manager-3": [
      "Oxygen production efficiency increased by 25%",
      "Improves global production rate by 7% through better air quality",
      "Life support systems boost all production by 15% during offline time"
    ],
    "manager-4": [
      "Silicon processing speed increased by 30%",
      "Electronic components increase tap value by 15%",
      "Optimized circuitry reduces all upgrade costs by 12%"
    ],
    "manager-5": [
      "Iron production strength increased by 25%",
      "Metal alloys increase production of all metals by 10%",
      "Forge mastery increases tap value by 20% for all metal elements"
    ],
    "manager-6": [
      "Gold extraction rate increased by 35%",
      "Precious metal purification boosts value by 15%",
      "Midas touch gives 5% chance of double coins from any operation"
    ],
    "manager-7": [
      "Radiation controlled for 30% safer Uranium production",
      "Nuclear efficiency increases all energy production by 20%",
      "Isotope separation techniques boost rare element production by 25%"
    ],
    "manager-8": [
      "Platinum refinement efficiency increased by 40%",
      "Ultra-pure filtration increases all noble metal values by 20%",
      "Noble metal expertise gives 15% chance of free upgrades"
    ],
    "manager-9": [
      "Exotic matter research boosts production by 30%",
      "Theoretical applications reduce all costs by 15%",
      "Dimensional shifts occasionally produce bonus resources (25% chance)"
    ],
    "manager-10": [
      "Matter-antimatter conversions boost all production by 25%",
      "Energy transformation increases global multiplier by 10%",
      "Universal mastery gives 50% chance to not consume resources on upgrades"
    ]
  };
  
  return descriptions[managerId]?.[tier-1] || `Enhances manager abilities at tier ${tier}`;
}

function getManagerAbilityIcon(managerId: string, tier: number) {
  // Map of icons by tier (simplified for implementation)
  const tierIcons = [
    [<Shield size={16} className="text-blue-400" />, <Zap size={16} className="text-purple-400" />, <Brain size={16} className="text-green-400" />],
    [<Star size={16} className="text-yellow-400" />, <Gauge size={16} className="text-red-400" />, <TargetIcon size={16} className="text-indigo-400" />],
    [<HandCoins size={16} className="text-amber-400" />, <Trophy size={16} className="text-emerald-400" />, <CloudLightning size={16} className="text-cyan-400" />],
    [<Compass size={16} className="text-pink-400" />, <Sparkles size={16} className="text-orange-400" />, <Rocket size={16} className="text-teal-400" />],
    [<Flame size={16} className="text-red-400" />, <Heart size={16} className="text-pink-400" />, <Diamond size={16} className="text-blue-400" />],
    [<Eye size={16} className="text-purple-400" />, <Gem size={16} className="text-emerald-400" />, <Brain size={16} className="text-blue-400" />],
    [<Shield size={16} className="text-amber-400" />, <Zap size={16} className="text-yellow-400" />, <Star size={16} className="text-red-400" />],
    [<HandCoins size={16} className="text-teal-400" />, <Trophy size={16} className="text-indigo-400" />, <CloudLightning size={16} className="text-green-400" />],
    [<Compass size={16} className="text-orange-400" />, <Sparkles size={16} className="text-cyan-400" />, <Rocket size={16} className="text-purple-400" />],
    [<Flame size={16} className="text-emerald-400" />, <Heart size={16} className="text-blue-400" />, <Diamond size={16} className="text-amber-400" />]
  ];
  
  // Get manager index (default to 0)
  const managerIndex = parseInt(managerId.replace("manager-", "")) % 10;
  // Get tier index (1-based to 0-based)
  const tierIndex = tier - 1;
  
  // Get the icon or return a default
  return tierIcons[managerIndex]?.[tierIndex] || <Gem size={16} className="text-purple-400" />;
}

// Update the managers array with abilities
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
    bonus: "Increases Hydrogen and Carbon production by 50%",
    requiredCoins: 1000,
    avatar: "https://api.dicebear.com/7.x/bottts/svg?seed=hydrogen",
    cost: 1,
    boosts: ["element-1", "element-2"]
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

// Add manager abilities as a separate export
export const managerAbilities = createManagerAbilities();
