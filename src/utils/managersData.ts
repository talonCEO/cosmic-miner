import { Perk } from './types';

// Static image imports (replace these with your actual image paths)
import SteveAvatar from '@/assets/images/icons/11.png';
import HydrogenAvatar from '@/assets/images/icons/11.png';
import CarbonAvatar from '@/assets/images/icons/11.png';
import OxygenAvatar from '@/assets/images/icons/11.png';
import SiliconAvatar from '@/assets/images/icons/11.png';
import IronAvatar from '@/assets/images/icons/11.png';
import GoldAvatar from '@/assets/images/icons/11.png';
import UraniumAvatar from '@/assets/images/icons/11.png';
import PlatinumAvatar from '@/assets/images/icons/11.png';
import ExoticAvatar from '@/assets/images/icons/11.png';
import AntimatterAvatar from '@/assets/images/icons/11.png';

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
  avatar: string;            // Path to avatar image (static import)
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
    avatar: SteveAvatar,  // Static import
    cost: 0
  },
  {
    id: "manager-1",
    name: "Dr. Hydrogen",
    description: "Expert in lightweight element extraction",
    bonus: "Increases Hydrogen and Carbon production by 50%",
    requiredCoins: 1000,
    avatar: HydrogenAvatar,  // Static import
    cost: 1,
    boosts: ["Hydrogen", "Exotic Matter"],
    perks: [
      {
        id: "manager-1-perk-1",
        name: "Isotope Separation",
        description: "Advanced isotope handling increases Hydrogen and Carbon production by 75%",
        cost: 3,
        icon: "🧪",
        unlocked: false,
        effect: { type: "elementBoost", value: 0.75, elements: ["element-1", "element-2"] }
      },
      {
        id: "manager-1-perk-2",
        name: "Molecular Fusion",
        description: "Experimental fusion techniques increase Hydrogen and Carbon production by 100%",
        cost: 6,
        icon: "⚛️",
        unlocked: false,
        effect: { type: "elementBoost", value: 1.0, elements: ["element-1", "element-2"] }
      },
      {
        id: "manager-1-perk-3",
        name: "Zero-Point Extraction",
        description: "Quantum vacuum manipulation boosts Hydrogen and Carbon production by 150%",
        cost: 12,
        icon: "🌌",
        unlocked: false,
        effect: { type: "elementBoost", value: 1.5, elements: ["element-1", "element-2"] }
      }
    ]
  },
  {
    id: "manager-2",
    name: "Carbon Collector",
    description: "Specializes in organic compound synthesis",
    bonus: "Increases Oxygen and Nitrogen production by 50%",
    requiredCoins: 5000,
    avatar: CarbonAvatar,  // Static import
    cost: 2,
    boosts: ["Carbon", "Nitrogen"],
    perks: [
      {
        id: "manager-2-perk-1",
        name: "Organic Catalyst",
        description: "Organic reactions accelerated, increasing Oxygen and Nitrogen production by 75%",
        cost: 3,
        icon: "🌱",
        unlocked: false,
        effect: { type: "elementBoost", value: 0.75, elements: ["element-3", "element-4"] }
      },
      {
        id: "manager-2-perk-2",
        name: "Synthetic Biology",
        description: "Engineered microorganisms increase Oxygen and Nitrogen production by 100%",
        cost: 6,
        icon: "🧬",
        unlocked: false,
        effect: { type: "elementBoost", value: 1.0, elements: ["element-3", "element-4"] }
      },
      {
        id: "manager-2-perk-3",
        name: "Carbon Nanotechnology",
        description: "Nanotube extraction system boosts Oxygen and Nitrogen production by 150%",
        cost: 12,
        icon: "🔬",
        unlocked: false,
        effect: { type: "elementBoost", value: 1.5, elements: ["element-3", "element-4"] }
      }
    ]
  },
  {
    id: "manager-3",
    name: "Oxygen Oracle",
    description: "Breathes life into your operations",
    bonus: "Increases Silicon and Aluminum production by 50%",
    requiredCoins: 10000,
    avatar: OxygenAvatar,  // Static import
    cost: 4,
    boosts: ["Oxygen", "Promethium"],
    perks: [
      {
        id: "manager-3-perk-1",
        name: "Pressurized Processing",
        description: "High-pressure techniques increase Silicon and Aluminum production by 75%",
        cost: 3,
        icon: "💨",
        unlocked: false,
        effect: { type: "elementBoost", value: 0.75, elements: ["element-5", "element-6"] }
      },
      {
        id: "manager-3-perk-2",
        name: "Oxidation Catalyst",
        description: "Advanced oxidation processes increase Silicon and Aluminum production by 100%",
        cost: 6,
        icon: "🔥",
        unlocked: false,
        effect: { type: "elementBoost", value: 1.0, elements: ["element-5", "element-6"] }
      },
      {
        id: "manager-3-perk-3",
        name: "Molecular Sieve Technology",
        description: "Precision separation technique boosts Silicon and Aluminum production by 150%",
        cost: 12,
        icon: "⚗️",
        unlocked: false,
        effect: { type: "elementBoost", value: 1.5, elements: ["element-5", "element-6"] }
      }
    ]
  },
  {
    id: "manager-4",
    name: "Silicon Savant",
    description: "Tech wizard for electronic element mining",
    bonus: "Increases Iron and Copper production by 50%",
    requiredCoins: 25000,
    avatar: SiliconAvatar,  // Static import
    cost: 8,
    boosts: ["Silicon", "Aluminum"],
    perks: [
      {
        id: "manager-4-perk-1",
        name: "Semiconductor Enhancement",
        description: "Improved conductivity increases Iron and Copper production by 75%",
        cost: 3,
        icon: "💻",
        unlocked: false,
        effect: { type: "elementBoost", value: 0.75, elements: ["element-7", "element-8"] }
      },
      {
        id: "manager-4-perk-2",
        name: "Quantum Computing",
        description: "Quantum algorithms optimize Iron and Copper production by 100%",
        cost: 6,
        icon: "🔌",
        unlocked: false,
        effect: { type: "elementBoost", value: 1.0, elements: ["element-7", "element-8"] }
      },
      {
        id: "manager-4-perk-3",
        name: "Neural Network Mining",
        description: "AI-driven extraction technology boosts Iron and Copper production by 150%",
        cost: 12,
        icon: "🤖",
        unlocked: false,
        effect: { type: "elementBoost", value: 1.5, elements: ["element-7", "element-8"] }
      }
    ]
  },
  {
    id: "manager-5",
    name: "Iron Forger",
    description: "Master of metallurgy and ferrous elements",
    bonus: "Increases Zinc and Tin production by 50%",
    requiredCoins: 50000,
    avatar: IronAvatar,  // Static import
    cost: 16,
    boosts: ["Iron", "Cobalt"],
    perks: [
      {
        id: "manager-5-perk-1",
        name: "Alloy Integration",
        description: "Metal alloy technology increases Zinc and Tin production by 75%",
        cost: 3,
        icon: "⚒️",
        unlocked: false,
        effect: { type: "elementBoost", value: 0.75, elements: ["element-9", "element-10"] }
      },
      {
        id: "manager-5-perk-2",
        name: "Blast Furnace",
        description: "High-temperature processing increases Zinc and Tin production by 100%",
        cost: 6,
        icon: "🔨",
        unlocked: false,
        effect: { type: "elementBoost", value: 1.0, elements: ["element-9", "element-10"] }
      },
      {
        id: "manager-5-perk-3",
        name: "Molecular Restructuring",
        description: "Atomic manipulation boosts Zinc and Tin production by 150%",
        cost: 12,
        icon: "⚙️",
        unlocked: false,
        effect: { type: "elementBoost", value: 1.5, elements: ["element-9", "element-10"] }
      }
    ]
  },
  {
    id: "manager-6",
    name: "Gold Prospector",
    description: "Has a nose for precious metals",
    bonus: "Increases Titanium and Chromium production by 50%",
    requiredCoins: 500000,
    avatar: GoldAvatar,  // Static import
    cost: 32,
    boosts: ["Gold", "Nickel"],
    perks: [
      {
        id: "manager-6-perk-1",
        name: "Precious Metal Sensing",
        description: "Enhanced detection increases Titanium and Chromium production by 75%",
        cost: 3,
        icon: "💰",
        unlocked: false,
        effect: { type: "elementBoost", value: 0.75, elements: ["element-11", "element-12"] }
      },
      {
        id: "manager-6-perk-2",
        name: "Electrolytic Refinement",
        description: "Advanced purification increases Titanium and Chromium production by 100%",
        cost: 6,
        icon: "⚡",
        unlocked: false,
        effect: { type: "elementBoost", value: 1.0, elements: ["element-11", "element-12"] }
      },
      {
        id: "manager-6-perk-3",
        name: "Asteroid Core Drilling",
        description: "Deep extraction technology boosts Titanium and Chromium production by 150%",
        cost: 12,
        icon: "🛠️",
        unlocked: false,
        effect: { type: "elementBoost", value: 1.5, elements: ["element-11", "element-12"] }
      }
    ]
  },
  {
    id: "manager-7",
    name: "Uranium Controller",
    description: "Handles radioactive elements with care",
    bonus: "Increases Manganese and Cobalt production by 50%",
    requiredCoins: 1000000,
    avatar: UraniumAvatar,  // Static import
    cost: 64,
    boosts: ["Uranium", "Lead"],
    perks: [
      {
        id: "manager-7-perk-1",
        name: "Radiation Shielding",
        description: "Improved safety increases Manganese and Cobalt production by 75%",
        cost: 3,
        icon: "☢️",
        unlocked: false,
        effect: { type: "elementBoost", value: 0.75, elements: ["element-13", "element-14"] }
      },
      {
        id: "manager-7-perk-2",
        name: "Isotope Enrichment",
        description: "Specialized processing increases Manganese and Cobalt production by 100%",
        cost: 6,
        icon: "🧬",
        unlocked: false,
        effect: { type: "elementBoost", value: 1.0, elements: ["element-13", "element-14"] }
      },
      {
        id: "manager-7-perk-3",
        name: "Nuclear Extraction",
        description: "Controlled fission reactor boosts Manganese and Cobalt production by 150%",
        cost: 12,
        icon: "💥",
        unlocked: false,
        effect: { type: "elementBoost", value: 1.5, elements: ["element-13", "element-14"] }
      }
    ]
  },
  {
    id: "manager-8",
    name: "Platinum Purifier",
    description: "Refines precious metals to perfect purity",
    bonus: "Increases Platinum and Molybdenum production by 50%",
    requiredCoins: 10000000,
    avatar: PlatinumAvatar,  // Static import
    cost: 128,
    boosts: ["Platinum", "Berkelium"],
    perks: [
      {
        id: "manager-8-perk-1",
        name: "Multi-Stage Filtration",
        description: "Enhanced purification increases Nickel and Molybdenum production by 75%",
        cost: 3,
        icon: "🧪",
        unlocked: false,
        effect: { type: "elementBoost", value: 0.75, elements: ["element-15", "element-16"] }
      },
      {
        id: "manager-8-perk-2",
        name: "Catalytic Conversion",
        description: "Chemical catalysts increase Nickel and Molybdenum production by 100%",
        cost: 6,
        icon: "⚗️",
        unlocked: false,
        effect: { type: "elementBoost", value: 1.0, elements: ["element-15", "element-16"] }
      },
      {
        id: "manager-8-perk-3",
        name: "Molecular Reconstruction",
        description: "Atom-by-atom refinement boosts Nickel and Molybdenum production by 150%",
        cost: 12,
        icon: "✨",
        unlocked: false,
        effect: { type: "elementBoost", value: 1.5, elements: ["element-15", "element-16"] }
      }
    ]
  },
  {
    id: "manager-9",
    name: "Exotic Matter Expert",
    description: "Specializes in theoretical elements",
    bonus: "Increases Silver and Tungsten production by 50%",
    requiredCoins: 100000000,
    avatar: ExoticAvatar,  // Static import
    cost: 256,
    boosts: ["Germanium", "Californium"],
    perks: [
      {
        id: "manager-9-perk-1",
        name: "Dark Matter Infusion",
        description: "Experimental physics increases Silver and Tungsten production by 75%",
        cost: 3,
        icon: "🌑",
        unlocked: false,
        effect: { type: "elementBoost", value: 0.75, elements: ["element-17", "element-18"] }
      },
      {
        id: "manager-9-perk-2",
        name: "Quantum State Shifting",
        description: "Manipulating quantum states increases Silver and Tungsten production by 100%",
        cost: 6,
        icon: "🔮",
        unlocked: false,
        effect: { type: "elementBoost", value: 1.0, elements: ["element-17", "element-18"] }
      },
      {
        id: "manager-9-perk-3",
        name: "Interdimensional Mining",
        description: "Extract resources from parallel dimensions, boosting Silver and Tungsten production by 150%",
        cost: 12,
        icon: "🌌",
        unlocked: false,
        effect: { type: "elementBoost", value: 1.5, elements: ["element-17", "element-18"] }
      }
    ]
  },
  {
    id: "manager-10",
    name: "Antimatter Alchemist",
    description: "Transmutes the impossible",
    bonus: "Increases Lead and Uranium production by 50%",
    requiredCoins: 500000000,
    avatar: AntimatterAvatar,  // Static import
    cost: 512,
    boosts: ["Antimatter", "Tungsten"],
    perks: [
      {
        id: "manager-10-perk-1",
        name: "Particle Annihilation",
        description: "Controlled antimatter reactions increase Lead and Uranium production by 75%",
        cost: 3,
        icon: "💫",
        unlocked: false,
        effect: { type: "elementBoost", value: 0.75, elements: ["element-19", "element-20"] }
      },
      {
        id: "manager-10-perk-2",
        name: "Matter Conversion",
        description: "Transform common elements into rare ones, increasing Lead and Uranium production by 100%",
        cost: 6,
        icon: "🔄",
        unlocked: false,
        effect: { type: "elementBoost", value: 1.0, elements: ["element-19", "element-20"] }
      },
      {
        id: "manager-10-perk-3",
        name: "Singularity Harvesting",
        description: "Extract elements from the edge of black holes, boosting Lead and Uranium production by 150%",
        cost: 12,
        icon: "🕳️",
        unlocked: false,
        effect: { type: "elementBoost", value: 1.5, elements: ["element-19", "element-20"] }
      }
    ]
  }
];
