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
    description: "Expert in lightweight element extraction, boosting Hydrogen and Titanium production",
    bonus: "Increases Hydrogen and Titanium production by 50%",
    requiredCoins: 1000,
    avatar: HydrogenAvatar,
    cost: 1,
    boosts: ["element-1", "element-11"], // Hydrogen (1), Titanium (11)
    perks: [
      {
        id: "manager-1-perk-1",
        name: "Isotope Separation",
        description: "Advanced isotope handling increases Hydrogen and Titanium production by 75%",
        cost: 3,
        icon: "🧪",
        unlocked: false,
        effect: { type: "elementBoost", value: 1.0, elements: ["element-1", "element-11"] }
      },
      {
        id: "manager-1-perk-2",
        name: "Molecular Fusion",
        description: "Experimental fusion techniques increase Hydrogen and Titanium production by 100%",
        cost: 6,
        icon: "⚛️",
        unlocked: false,
        effect: { type: "elementBoost", value: 1.5, elements: ["element-1", "element-11"] }
      },
      {
        id: "manager-1-perk-3",
        name: "Zero-Point Extraction",
        description: "Quantum vacuum manipulation boosts Hydrogen and Titanium production by 150%",
        cost: 12,
        icon: "🌌",
        unlocked: false,
        effect: { type: "elementBoost", value: 2.0, elements: ["element-1", "element-11"] }
      }
    ]
  },
  {
    id: "manager-2",
    name: "Carbon Collector",
    description: "Specializes in organic and metallic synthesis, boosting Carbon and Chromium production",
    bonus: "Increases Carbon and Chromium production by 50%",
    requiredCoins: 5000,
    avatar: CarbonAvatar,
    cost: 2,
    boosts: ["element-2", "element-12"], // Carbon (2), Chromium (12)
    perks: [
      {
        id: "manager-2-perk-1",
        name: "Organic Catalyst",
        description: "Organic reactions accelerated, increasing Carbon and Chromium production by 75%",
        cost: 3,
        icon: "🌱",
        unlocked: false,
        effect: { type: "elementBoost", value: 1.0, elements: ["element-2", "element-12"] }
      },
      {
        id: "manager-2-perk-2",
        name: "Synthetic Biology",
        description: "Engineered microorganisms increase Carbon and Chromium production by 100%",
        cost: 6,
        icon: "🧬",
        unlocked: false,
        effect: { type: "elementBoost", value: 1.5, elements: ["element-2", "element-12"] }
      },
      {
        id: "manager-2-perk-3",
        name: "Carbon Nanotechnology",
        description: "Nanotube extraction system boosts Carbon and Chromium production by 150%",
        cost: 12,
        icon: "🔬",
        unlocked: false,
        effect: { type: "elementBoost", value: 2.0, elements: ["element-2", "element-12"] }
      }
    ]
  },
  {
    id: "manager-3",
    name: "Oxygen Oracle",
    description: "Master of atmospheric and precious elements, boosting Oxygen and Silver production",
    bonus: "Increases Oxygen and Silver production by 50%",
    requiredCoins: 10000,
    avatar: OxygenAvatar,
    cost: 4,
    boosts: ["element-3", "element-17"], // Oxygen (3), Silver (17)
    perks: [
      {
        id: "manager-3-perk-1",
        name: "Pressurized Processing",
        description: "High-pressure techniques increase Oxygen and Silver production by 75%",
        cost: 3,
        icon: "💨",
        unlocked: false,
        effect: { type: "elementBoost", value: 1.0, elements: ["element-3", "element-17"] }
      },
      {
        id: "manager-3-perk-2",
        name: "Oxidation Catalyst",
        description: "Advanced oxidation processes increase Oxygen and Silver production by 100%",
        cost: 6,
        icon: "🔥",
        unlocked: false,
        effect: { type: "elementBoost", value: 1.5, elements: ["element-3", "element-17"] }
      },
      {
        id: "manager-3-perk-3",
        name: "Molecular Sieve Technology",
        description: "Precision separation technique boosts Oxygen and Silver production by 150%",
        cost: 12,
        icon: "⚗️",
        unlocked: false,
        effect: { type: "elementBoost", value: 2.0, elements: ["element-3", "element-17"] }
      }
    ]
  },
  {
    id: "manager-4",
    name: "Silicon Savant",
    description: "Tech wizard enhancing Silicon and Nickel production",
    bonus: "Increases Silicon and Nickel production by 50%",
    requiredCoins: 25000,
    avatar: SiliconAvatar,
    cost: 8,
    boosts: ["element-5", "element-15"], // Silicon (5), Nickel (15)
    perks: [
      {
        id: "manager-4-perk-1",
        name: "Semiconductor Enhancement",
        description: "Improved conductivity increases Silicon and Nickel production by 75%",
        cost: 3,
        icon: "💻",
        unlocked: false,
        effect: { type: "elementBoost", value: 1.0, elements: ["element-5", "element-15"] }
      },
      {
        id: "manager-4-perk-2",
        name: "Quantum Computing",
        description: "Quantum algorithms optimize Silicon and Nickel production by 100%",
        cost: 6,
        icon: "🔌",
        unlocked: false,
        effect: { type: "elementBoost", value: 1.5, elements: ["element-5", "element-15"] }
      },
      {
        id: "manager-4-perk-3",
        name: "Neural Network Mining",
        description: "AI-driven extraction technology boosts Silicon and Nickel production by 150%",
        cost: 12,
        icon: "🤖",
        unlocked: false,
        effect: { type: "elementBoost", value: 2.0, elements: ["element-5", "element-15"] }
      }
    ]
  },
  {
    id: "manager-5",
    name: "Iron Forger",
    description: "Master of metallurgy, enhancing Iron and Tellurium production",
    bonus: "Increases Iron and Tellurium production by 50%",
    requiredCoins: 50000,
    avatar: IronAvatar,
    cost: 16,
    boosts: ["element-7", "element-26"], // Iron (7), Tellurium (26)
    perks: [
      {
        id: "manager-5-perk-1",
        name: "Alloy Integration",
        description: "Metal alloy technology increases Iron and Tellurium production by 75%",
        cost: 3,
        icon: "⚒️",
        unlocked: false,
        effect: { type: "elementBoost", value: 1.0, elements: ["element-7", "element-26"] }
      },
      {
        id: "manager-5-perk-2",
        name: "Blast Furnace",
        description: "High-temperature processing increases Iron and Tellurium production by 100%",
        cost: 6,
        icon: "🔨",
        unlocked: false,
        effect: { type: "elementBoost", value: 1.5, elements: ["element-7", "element-26"] }
      },
      {
        id: "manager-5-perk-3",
        name: "Molecular Restructuring",
        description: "Atomic manipulation boosts Iron and Tellurium production by 150%",
        cost: 12,
        icon: "⚙️",
        unlocked: false,
        effect: { type: "elementBoost", value: 2.0, elements: ["element-7", "element-26"] }
      }
    ]
  },
  {
    id: "manager-6",
    name: "Gold Prospector",
    description: "Expert in precious metals, boosting Gold and Rhenium production",
    bonus: "Increases Gold and Rhenium production by 50%",
    requiredCoins: 500000,
    avatar: GoldAvatar,
    cost: 32,
    boosts: ["element-32", "element-34"], // Gold (32), Rhenium (34)
    perks: [
      {
        id: "manager-6-perk-1",
        name: "Precious Metal Sensing",
        description: "Enhanced detection increases Gold and Rhenium production by 75%",
        cost: 3,
        icon: "💰",
        unlocked: false,
        effect: { type: "elementBoost", value: 1.0, elements: ["element-32", "element-34"] }
      },
      {
        id: "manager-6-perk-2",
        name: "Electrolytic Refinement",
        description: "Advanced purification increases Gold and Rhenium production by 100%",
        cost: 6,
        icon: "⚡",
        unlocked: false,
        effect: { type: "elementBoost", value: 1.5, elements: ["element-32", "element-34"] }
      },
      {
        id: "manager-6-perk-3",
        name: "Asteroid Core Drilling",
        description: "Deep extraction technology boosts Gold and Rhenium production by 150%",
        cost: 12,
        icon: "🛠️",
        unlocked: false,
        effect: { type: "elementBoost", value: 2.0, elements: ["element-32", "element-34"] }
      }
    ]
  },
  {
    id: "manager-7",
    name: "Uranium Controller",
    description: "Handles radioactive elements, boosting Uranium and Lead production",
    bonus: "Increases Uranium and Lead production by 50%",
    requiredCoins: 1000000,
    avatar: UraniumAvatar,
    cost: 64,
    boosts: ["element-20", "element-19"], // Uranium (20), Lead (19)
    perks: [
      {
        id: "manager-7-perk-1",
        name: "Radiation Shielding",
        description: "Improved safety increases Uranium and Lead production by 75%",
        cost: 3,
        icon: "☢️",
        unlocked: false,
        effect: { type: "elementBoost", value: 1.0, elements: ["element-20", "element-19"] }
      },
      {
        id: "manager-7-perk-2",
        name: "Isotope Enrichment",
        description: "Specialized processing increases Uranium and Lead production by 100%",
        cost: 6,
        icon: "🧬",
        unlocked: false,
        effect: { type: "elementBoost", value: 1.5, elements: ["element-20", "element-19"] }
      },
      {
        id: "manager-7-perk-3",
        name: "Nuclear Extraction",
        description: "Controlled fission reactor boosts Uranium and Lead production by 150%",
        cost: 12,
        icon: "💥",
        unlocked: false,
        effect: { type: "elementBoost", value: 2.0, elements: ["element-20", "element-19"] }
      }
    ]
  },
  {
    id: "manager-8",
    name: "Platinum Purifier",
    description: "Refines precious metals, boosting Platinum and Dysprosium production",
    bonus: "Increases Platinum and Dysprosium production by 50%",
    requiredCoins: 10000000,
    avatar: PlatinumAvatar,
    cost: 128,
    boosts: ["element-33", "element-40"], // Platinum (33), Dysprosium (40)
    perks: [
      {
        id: "manager-8-perk-1",
        name: "Multi-Stage Filtration",
        description: "Enhanced purification increases Platinum and Dysprosium production by 75%",
        cost: 3,
        icon: "🧪",
        unlocked: false,
        effect: { type: "elementBoost", value: 1.0, elements: ["element-33", "element-40"] }
      },
      {
        id: "manager-8-perk-2",
        name: "Catalytic Conversion",
        description: "Chemical catalysts increase Platinum and Dysprosium production by 100%",
        cost: 6,
        icon: "⚗️",
        unlocked: false,
        effect: { type: "elementBoost", value: 1.5, elements: ["element-33", "element-40"] }
      },
      {
        id: "manager-8-perk-3",
        name: "Molecular Reconstruction",
        description: "Atom-by-atom refinement boosts Platinum and Dysprosium production by 150%",
        cost: 12,
        icon: "✨",
        unlocked: false,
        effect: { type: "elementBoost", value: 2.0, elements: ["element-33", "element-40"] }
      }
    ]
  },
  {
    id: "manager-9",
    name: "Exotic Matter Expert",
    description: "Specializes in theoretical elements, boosting Exotic Matter and Iridium production",
    bonus: "Increases Exotic Matter and Iridium production by 50%",
    requiredCoins: 100000000,
    avatar: ExoticAvatar,
    cost: 256,
    boosts: ["element-50", "element-31"], // Exotic Matter (50), Iridium (31)
    perks: [
      {
        id: "manager-9-perk-1",
        name: "Dark Matter Infusion",
        description: "Experimental physics increases Exotic Matter and Iridium production by 75%",
        cost: 3,
        icon: "🌑",
        unlocked: false,
        effect: { type: "elementBoost", value: 1.0, elements: ["element-50", "element-31"] }
      },
      {
        id: "manager-9-perk-2",
        name: "Quantum State Shifting",
        description: "Manipulating quantum states increases Exotic Matter and Iridium production by 100%",
        cost: 6,
        icon: "🔮",
        unlocked: false,
        effect: { type: "elementBoost", value: 1.5, elements: ["element-50", "element-31"] }
      },
      {
        id: "manager-9-perk-3",
        name: "Interdimensional Mining",
        description: "Extract resources from parallel dimensions, boosting Exotic Matter and Iridium production by 150%",
        cost: 12,
        icon: "🌌",
        unlocked: false,
        effect: { type: "elementBoost", value: 2.0, elements: ["element-50", "element-31"] }
      }
    ]
  },
  {
    id: "manager-10",
    name: "Antimatter Alchemist",
    description: "Transmutes rare elements, boosting Antimatter and Promethium production",
    bonus: "Increases Antimatter and Promethium production by 50%",
    requiredCoins: 500000000,
    avatar: AntimatterAvatar,
    cost: 512,
    boosts: ["element-49", "element-41"], // Antimatter (49), Promethium (41)
    perks: [
      {
        id: "manager-10-perk-1",
        name: "Particle Annihilation",
        description: "Controlled antimatter reactions increase Antimatter and Promethium production by 75%",
        cost: 3,
        icon: "💫",
        unlocked: false,
        effect: { type: "elementBoost", value: 1.0, elements: ["element-49", "element-41"] }
      },
      {
        id: "manager-10-perk-2",
        name: "Matter Conversion",
        description: "Transform common elements into rare ones, increasing Antimatter and Promethium production by 100%",
        cost: 6,
        icon: "🔄",
        unlocked: false,
        effect: { type: "elementBoost", value: 1.5, elements: ["element-49", "element-41"] }
      },
      {
        id: "manager-10-perk-3",
        name: "Singularity Harvesting",
        description: "Extract elements from the edge of black holes, boosting Antimatter and Promethium production by 150%",
        cost: 12,
        icon: "🕳️",
        unlocked: false,
        effect: { type: "elementBoost", value: 2.0, elements: ["element-49", "element-48"] }
      }
    ]
  }
];
