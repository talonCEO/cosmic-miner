import { Perk } from './types';

// Static image imports (replace these with your actual image paths)
import SteveAvatar from '@/assets/images/managers/22.png';
import HydrogenAvatar from '@/assets/images/managers/11.png';
import CarbonAvatar from '@/assets/images/managers/33.png';
import OxygenAvatar from '@/assets/images/managers/44.png';
import SiliconAvatar from '@/assets/images/managers/55.png';
import IronAvatar from '@/assets/images/managers/6.png';
import GoldAvatar from '@/assets/images/managers/7.png';
import UraniumAvatar from '@/assets/images/managers/8.png';
import PlatinumAvatar from '@/assets/images/managers/9.png';
import ExoticAvatar from '@/assets/images/managers/111.png';
import AntimatterAvatar from '@/assets/images/managers/222.png';

/**
 * Manager Interface
 */
export interface Manager {
  id: string;
  name: string;
  description: string;
  bonus: string;
  requiredCoins: number;
  avatar: string;
  cost: number;
  boosts?: string[];
  perks?: Perk[];
}

/**
 * Managers Data
 */
export const managers: Manager[] = [
  {
    id: "manager-default",
    name: "Steve",
    description: "The first employee you hired. He's not great, but he tries",
    bonus: "+10% can-do attitude (purely cosmetic)",
    requiredCoins: 0,
    avatar: SteveAvatar,
    cost: 0
  },
  {
    id: "manager-1",
    name: "Dr. Hydrogen",
    description: "Expert in lightweight element extraction",
    bonus: "Increases Hydrogen and Nitrogen production by 50%",
    requiredCoins: 1000,
    avatar: HydrogenAvatar,
    cost: 1,
    boosts: ["element-1", "element-4"], // Hydrogen (named), Nitrogen (complementary atmospheric element)
    perks: [
      {
        id: "manager-1-perk-1",
        name: "Isotope Separation",
        description: "Advanced isotope handling increases Hydrogen and Nitrogen production by 75%",
        cost: 3,
        icon: "🧪",
        unlocked: false,
        effect: { type: "elementBoost", value: 1.0, elements: ["element-1", "element-4"] }
      },
      {
        id: "manager-1-perk-2",
        name: "Molecular Fusion",
        description: "Experimental fusion techniques increase Hydrogen and Nitrogen production by 100%",
        cost: 6,
        icon: "⚛️",
        unlocked: false,
        effect: { type: "elementBoost", value: 1.5, elements: ["element-1", "element-4"] }
      },
      {
        id: "manager-1-perk-3",
        name: "Zero-Point Extraction",
        description: "Quantum vacuum manipulation boosts Hydrogen and Nitrogen production by 150%",
        cost: 12,
        icon: "🌌",
        unlocked: false,
        effect: { type: "elementBoost", value: 2.0, elements: ["element-1", "element-4"] }
      }
    ]
  },
  {
    id: "manager-2",
    name: "Carbon Collector",
    description: "Specializes in organic compound synthesis",
    bonus: "Increases Carbon and Oxygen production by 50%",
    requiredCoins: 5000,
    avatar: CarbonAvatar,
    cost: 2,
    boosts: ["element-2", "element-3"], // Carbon (named), Oxygen (organic chemistry pair)
    perks: [
      {
        id: "manager-2-perk-1",
        name: "Organic Catalyst",
        description: "Organic reactions accelerated, increasing Carbon and Oxygen production by 75%",
        cost: 3,
        icon: "🌱",
        unlocked: false,
        effect: { type: "elementBoost", value: 1.0, elements: ["element-2", "element-3"] }
      },
      {
        id: "manager-2-perk-2",
        name: "Synthetic Biology",
        description: "Engineered microorganisms increase Carbon and Oxygen production by 100%",
        cost: 6,
        icon: "🧬",
        unlocked: false,
        effect: { type: "elementBoost", value: 1.5, elements: ["element-2", "element-3"] }
      },
      {
        id: "manager-2-perk-3",
        name: "Carbon Nanotechnology",
        description: "Nanotube extraction system boosts Carbon and Oxygen production by 150%",
        cost: 12,
        icon: "🔬",
        unlocked: false,
        effect: { type: "elementBoost", value: 2.0, elements: ["element-2", "element-3"] }
      }
    ]
  },
  {
    id: "manager-3",
    name: "Oxygen Oracle",
    description: "Breathes life into your operations",
    bonus: "Increases Oxygen and Silicon production by 50%",
    requiredCoins: 10000,
    avatar: OxygenAvatar,
    cost: 4,
    boosts: ["element-3", "element-5"], // Oxygen (named), Silicon (common in oxides like SiO₂)
    perks: [
      {
        id: "manager-3-perk-1",
        name: "Pressurized Processing",
        description: "High-pressure techniques increase Oxygen and Silicon production by 75%",
        cost: 3,
        icon: "💨",
        unlocked: false,
        effect: { type: "elementBoost", value: 1.0, elements: ["element-3", "element-5"] }
      },
      {
        id: "manager-3-perk-2",
        name: "Oxidation Catalyst",
        description: "Advanced oxidation processes increase Oxygen and Silicon production by 100%",
        cost: 6,
        icon: "🔥",
        unlocked: false,
        effect: { type: "elementBoost", value: 1.5, elements: ["element-3", "element-5"] }
      },
      {
        id: "manager-3-perk-3",
        name: "Molecular Sieve Technology",
        description: "Precision separation technique boosts Oxygen and Silicon production by 150%",
        cost: 12,
        icon: "⚗️",
        unlocked: false,
        effect: { type: "elementBoost", value: 2.0, elements: ["element-3", "element-5"] }
      }
    ]
  },
  {
    id: "manager-4",
    name: "Silicon Savant",
    description: "Tech wizard for electronic element mining",
    bonus: "Increases Silicon and Germanium production by 50%",
    requiredCoins: 25000,
    avatar: SiliconAvatar,
    cost: 8,
    boosts: ["element-5", "element-23"], // Silicon (named), Germanium (fellow semiconductor)
    perks: [
      {
        id: "manager-4-perk-1",
        name: "Semiconductor Enhancement",
        description: "Improved conductivity increases Silicon and Germanium production by 75%",
        cost: 3,
        icon: "💻",
        unlocked: false,
        effect: { type: "elementBoost", value: 1.0, elements: ["element-5", "element-23"] }
      },
      {
        id: "manager-4-perk-2",
        name: "Quantum Computing",
        description: "Quantum algorithms optimize Silicon and Germanium production by 100%",
        cost: 6,
        icon: "🔌",
        unlocked: false,
        effect: { type: "elementBoost", value: 1.5, elements: ["element-5", "element-23"] }
      },
      {
        id: "manager-4-perk-3",
        name: "Neural Network Mining",
        description: "AI-driven extraction technology boosts Silicon and Germanium production by 150%",
        cost: 12,
        icon: "🤖",
        unlocked: false,
        effect: { type: "elementBoost", value: 2.0, elements: ["element-5", "element-23"] }
      }
    ]
  },
  {
    id: "manager-5",
    name: "Iron Forger",
    description: "Master of metallurgy and ferrous elements",
    bonus: "Increases Iron and Cobalt production by 50%",
    requiredCoins: 50000,
    avatar: IronAvatar,
    cost: 16,
    boosts: ["element-7", "element-14"], // Iron (named), Cobalt (common in steel alloys)
    perks: [
      {
        id: "manager-5-perk-1",
        name: "Alloy Integration",
        description: "Metal alloy technology increases Iron and Cobalt production by 75%",
        cost: 3,
        icon: "⚒️",
        unlocked: false,
        effect: { type: "elementBoost", value: 1.0, elements: ["element-7", "element-14"] }
      },
      {
        id: "manager-5-perk-2",
        name: "Blast Furnace",
        description: "High-temperature processing increases Iron and Cobalt production by 100%",
        cost: 6,
        icon: "🔨",
        unlocked: false,
        effect: { type: "elementBoost", value: 1.5, elements: ["element-7", "element-14"] }
      },
      {
        id: "manager-5-perk-3",
        name: "Molecular Restructuring",
        description: "Atomic manipulation boosts Iron and Cobalt production by 150%",
        cost: 12,
        icon: "⚙️",
        unlocked: false,
        effect: { type: "elementBoost", value: 2.0, elements: ["element-7", "element-14"] }
      }
    ]
  },
  {
    id: "manager-6",
    name: "Gold Prospector",
    description: "Has a nose for precious metals",
    bonus: "Increases Gold and Silver production by 50%",
    requiredCoins: 500000,
    avatar: GoldAvatar,
    cost: 32,
    boosts: ["element-32", "element-17"], // Gold (named), Silver (precious metal pair)
    perks: [
      {
        id: "manager-6-perk-1",
        name: "Precious Metal Sensing",
        description: "Enhanced detection increases Gold and Silver production by 75%",
        cost: 3,
        icon: "💰",
        unlocked: false,
        effect: { type: "elementBoost", value: 1.0, elements: ["element-32", "element-17"] }
      },
      {
        id: "manager-6-perk-2",
        name: "Electrolytic Refinement",
        description: "Advanced purification increases Gold and Silver production by 100%",
        cost: 6,
        icon: "⚡",
        unlocked: false,
        effect: { type: "elementBoost", value: 1.5, elements: ["element-32", "element-17"] }
      },
      {
        id: "manager-6-perk-3",
        name: "Asteroid Core Drilling",
        description: "Deep extraction technology boosts Gold and Silver production by 150%",
        cost: 12,
        icon: "🛠️",
        unlocked: false,
        effect: { type: "elementBoost", value: 2.0, elements: ["element-32", "element-17"] }
      }
    ]
  },
  {
    id: "manager-7",
    name: "Uranium Controller",
    description: "Handles radioactive elements with care",
    bonus: "Increases Uranium and Promethium production by 50%",
    requiredCoins: 1000000,
    avatar: UraniumAvatar,
    cost: 64,
    boosts: ["element-20", "element-41"], // Uranium (named), Promethium (radioactive complement)
    perks: [
      {
        id: "manager-7-perk-1",
        name: "Radiation Shielding",
        description: "Improved safety increases Uranium and Promethium production by 75%",
        cost: 3,
        icon: "☢️",
        unlocked: false,
        effect: { type: "elementBoost", value: 1.0, elements: ["element-20", "element-41"] }
      },
      {
        id: "manager-7-perk-2",
        name: "Isotope Enrichment",
        description: "Specialized processing increases Uranium and Promethium production by 100%",
        cost: 6,
        icon: "🧬",
        unlocked: false,
        effect: { type: "elementBoost", value: 1.5, elements: ["element-20", "element-41"] }
      },
      {
        id: "manager-7-perk-3",
        name: "Nuclear Extraction",
        description: "Controlled fission reactor boosts Uranium and Promethium production by 150%",
        cost: 12,
        icon: "💥",
        unlocked: false,
        effect: { type: "elementBoost", value: 2.0, elements: ["element-20", "element-41"] }
      }
    ]
  },
  {
    id: "manager-8",
    name: "Platinum Purifier",
    description: "Refines precious metals to perfect purity",
    bonus: "Increases Platinum and Palladium production by 50%",
    requiredCoins: 10000000,
    avatar: PlatinumAvatar,
    cost: 128,
    boosts: ["element-33", "element-30"], // Platinum (named), Palladium (catalytic metal pair)
    perks: [
      {
        id: "manager-8-perk-1",
        name: "Multi-Stage Filtration",
        description: "Enhanced purification increases Platinum and Palladium production by 75%",
        cost: 3,
        icon: "🧪",
        unlocked: false,
        effect: { type: "elementBoost", value: 1.0, elements: ["element-33", "element-30"] }
      },
      {
        id: "manager-8-perk-2",
        name: "Catalytic Conversion",
        description: "Chemical catalysts increase Platinum and Palladium production by 100%",
        cost: 6,
        icon: "⚗️",
        unlocked: false,
        effect: { type: "elementBoost", value: 1.5, elements: ["element-33", "element-30"] }
      },
      {
        id: "manager-8-perk-3",
        name: "Molecular Reconstruction",
        description: "Atom-by-atom refinement boosts Platinum and Palladium production by 150%",
        cost: 12,
        icon: "✨",
        unlocked: false,
        effect: { type: "elementBoost", value: 2.0, elements: ["element-33", "element-30"] }
      }
    ]
  },
  {
    id: "manager-9",
    name: "Exotic Matter Expert",
    description: "Specializes in theoretical elements",
    bonus: "Increases Exotic Matter and Antimatter production by 50%",
    requiredCoins: 100000000,
    avatar: ExoticAvatar,
    cost: 256,
    boosts: ["element-50", "element-49"], // Exotic Matter (named), Antimatter (thematic pair)
    perks: [
      {
        id: "manager-9-perk-1",
        name: "Dark Matter Infusion",
        description: "Experimental physics increases Exotic Matter and Antimatter production by 75%",
        cost: 3,
        icon: "🌑",
        unlocked: false,
        effect: { type: "elementBoost", value: 1.0, elements: ["element-50", "element-49"] }
      },
      {
        id: "manager-9-perk-2",
        name: "Quantum State Shifting",
        description: "Manipulating quantum states increases Exotic Matter and Antimatter production by 100%",
        cost: 6,
        icon: "🔮",
        unlocked: false,
        effect: { type: "elementBoost", value: 1.5, elements: ["element-50", "element-49"] }
      },
      {
        id: "manager-9-perk-3",
        name: "Interdimensional Mining",
        description: "Extract resources from parallel dimensions, boosting Exotic Matter and Antimatter production by 150%",
        cost: 12,
        icon: "🌌",
        unlocked: false,
        effect: { type: "elementBoost", value: 2.0, elements: ["element-50", "element-49"] }
      }
    ]
  },
  {
    id: "manager-10",
    name: "Antimatter Alchemist",
    description: "Transmutes the impossible",
    bonus: "Increases Antimatter and Californium production by 50%",
    requiredCoins: 500000000,
    avatar: AntimatterAvatar,
    cost: 512,
    boosts: ["element-49", "element-48"], // Antimatter (named), Californium (synthetic exotic pair)
    perks: [
      {
        id: "manager-10-perk-1",
        name: "Particle Annihilation",
        description: "Controlled antimatter reactions increase Antimatter and Californium production by 75%",
        cost: 3,
        icon: "💫",
        unlocked: false,
        effect: { type: "elementBoost", value: 1.0, elements: ["element-49", "element-48"] }
      },
      {
        id: "manager-10-perk-2",
        name: "Matter Conversion",
        description: "Transform common elements into rare ones, increasing Antimatter and Californium production by 100%",
        cost: 6,
        icon: "🔄",
        unlocked: false,
        effect: { type: "elementBoost", value: 1.5, elements: ["element-49", "element-48"] }
      },
      {
        id: "manager-10-perk-3",
        name: "Singularity Harvesting",
        description: "Extract elements from the edge of black holes, boosting Antimatter and Californium production by 150%",
        cost: 12,
        icon: "🕳️",
        unlocked: false,
        effect: { type: "elementBoost", value: 2.0, elements: ["element-49", "element-48"] }
      }
    ]
  }
];
