import { Perk } from './types';

// Static image imports for artifacts
import ArtifactDefault from '@/assets/images/icons/a1.png';
import Artifact1 from '@/assets/images/artifacts/art10.png';
import Artifact2 from '@/assets/images/artifacts/art9.png';
import Artifact3 from '@/assets/images/artifacts/art8.png';
import Artifact4 from '@/assets/images/artifacts/art7.png';
import Artifact5 from '@/assets/images/artifacts/art6.png';
import Artifact6 from '@/assets/images/artifacts/art5.png';
import Artifact7 from '@/assets/images/artifacts/art4.png';
import Artifact8 from '@/assets/images/artifacts/art3.png';
import Artifact9 from '@/assets/images/artifacts/art2.png';
import Artifact10 from '@/assets/images/artifacts/art1.png';

/**
 * Artifact Interface
 * 
 * Defines the structure for artifact objects that can be acquired to provide
 * special bonuses and effects.
 */
export interface Artifact {
  id: string;              // Unique identifier
  name: string;            // Display name
  description: string;     // Describes what the artifact is
  bonus: string;           // Description of the artifact's passive bonus
  avatar: string;          // Path to avatar image (static import)
  cost: number;            // Essence cost to acquire
  effect?: {               // Gameplay effect (automatically applied when owned)
    type: string;          // Type of effect (production, tap, essence, cost, startingCoins)
    value: number;         // Magnitude of effect
  };
  perks?: Perk[];         // Unlockable perks using skill points
}

/**
 * Artifacts Data
 * 
 * Each artifact:
 * 1. Has a unique ID and appearance
 * 2. Provides passive bonuses to game mechanics
 * 3. Can have up to 3 unlockable perks (costing 3, 6, and 12 skill points)
 * 4. Affects game mechanics through different effects:
 *    - production: Increases element production rate
 *    - tap: Increases value of manual taps
 *    - essence: Increases essence gained from prestige
 *    - cost: Reduces upgrade costs
 *    - startingCoins: Provides starting coins after prestige
 */
export const artifacts: Artifact[] = [
  {
    id: "artifact-default",
    name: "Ordinary Rock",
    description: "Just a regular rock you found on your first day",
    bonus: "Provides absolutely no benefit whatsoever",
    avatar: ArtifactDefault,  // Static import (a1.png)
    cost: 0
  },
  {
    id: "artifact-1",
    name: "Quantum Computer",
    description: "Advanced computational device using quantum mechanics",
    bonus: "Increases all production by 10%",
    avatar: Artifact1,  // Static import (a2.png)
    cost: 1,
    effect: {
      type: "production",
      value: 0.1
    },
    perks: [
      {
        id: "artifact-1-perk-1",
        name: "Quantum Acceleration",
        description: "Upgraded processing algorithms increase production by 20%",
        cost: 3,
        icon: "🔄",
        unlocked: false,
        effect: { type: "production", value: 0.2 }
      },
      {
        id: "artifact-1-perk-2",
        name: "Parallel Computing",
        description: "Computing in multiple dimensions increases production by 30%",
        cost: 6,
        icon: "⚡",
        unlocked: false,
        effect: { type: "production", value: 0.3 }
      },
      {
        id: "artifact-1-perk-3",
        name: "Quantum Supremacy",
        description: "Achieves computational feats impossible with classic computers, increasing production by 40%",
        cost: 12,
        icon: "🌟",
        unlocked: false,
        effect: { type: "production", value: 0.4 }
      }
    ]
  },
  {
    id: "artifact-2",
    name: "Space Rocket",
    description: "Propulsion system for interstellar mining",
    bonus: "1.5x tap multiplier",
    avatar: Artifact2,  // Static import (a3.png)
    cost: 2,
    effect: {
      type: "tap",
      value: 1.5
    },
    perks: [
      {
        id: "artifact-2-perk-1",
        name: "Reinforced Thrusters",
        description: "Enhanced propulsion system increases tap multiplier to 2x",
        cost: 3,
        icon: "🚀",
        unlocked: false,
        effect: { type: "tap", value: 2.0 }
      },
      {
        id: "artifact-2-perk-2",
        name: "Quantum Fuel Mixture",
        description: "Revolutionary fuel composition increases tap multiplier to 2.5x",
        cost: 6,
        icon: "⛽",
        unlocked: false,
        effect: { type: "tap", value: 2.5 }
      },
      {
        id: "artifact-2-perk-3",
        name: "Warp Drive",
        description: "Bend spacetime to reach minerals faster with a 3x tap multiplier",
        cost: 12,
        icon: "🌌",
        unlocked: false,
        effect: { type: "tap", value: 3.0 }
      }
    ]
  },
  {
    id: "artifact-3",
    name: "Element Scanner",
    description: "High precision detection of rare elements",
    bonus: "125% more essence from prestiging",
    avatar: Artifact3,  // Static import (a4.png)
    cost: 4,
    effect: {
      type: "essence",
      value: 1.25
    },
    perks: [
      {
        id: "artifact-3-perk-1",
        name: "Enhanced Sensors",
        description: "Improved detection range increases essence gain to 150%",
        cost: 3,
        icon: "📡",
        unlocked: false,
        effect: { type: "essence", value: 1.5 }
      },
      {
        id: "artifact-3-perk-2",
        name: "Quantum Resonance",
        description: "Detect essence through quantum fields, increasing gain to 175%",
        cost: 6,
        icon: "🔍",
        unlocked: false,
        effect: { type: "essence", value: 1.75 }
      },
      {
        id: "artifact-3-perk-3",
        name: "Hyperdimensional Analysis",
        description: "Scan across dimensions for a 200% essence gain",
        cost: 12,
        icon: "🔬",
        unlocked: false,
        effect: { type: "essence", value: 2.0 }
      }
    ]
  },
  {
    id: "artifact-4",
    name: "Telescope Array",
    description: "Network of deep space observation instruments",
    bonus: "Reduces upgrade costs by 10%",
    avatar: Artifact4,  // Static import (a5.png)
    cost: 8,
    effect: {
      type: "cost",
      value: 0.1
    },
    perks: [
      {
        id: "artifact-4-perk-1",
        name: "Wider Aperture",
        description: "Expanded observation capability reduces upgrade costs by 15%",
        cost: 3,
        icon: "👁️",
        unlocked: false,
        effect: { type: "cost", value: 0.15 }
      },
      {
        id: "artifact-4-perk-2",
        name: "Gravitational Lensing",
        description: "Use gravity to enhance observations, reducing upgrade costs by 20%",
        cost: 6,
        icon: "🔭",
        unlocked: false,
        effect: { type: "cost", value: 0.2 }
      },
      {
        id: "artifact-4-perk-3",
        name: "Quantum Entanglement Viewer",
        description: "Instantly observe distant phenomena, reducing upgrade costs by 25%",
        cost: 12,
        icon: "🌠",
        unlocked: false,
        effect: { type: "cost", value: 0.25 }
      }
    ]
  },
  {
    id: "artifact-5",
    name: "Crystalline Gem",
    description: "Focus crystal that amplifies mining energy",
    bonus: "Start with 100,000 coins after each prestige",
    avatar: Artifact5,  // Static import (a6.png)
    cost: 16,
    effect: {
      type: "startingCoins",
      value: 100000
    },
    perks: [
      {
        id: "artifact-5-perk-1",
        name: "Empowered Crystal",
        description: "Enhanced energy focus provides 250,000 starting coins after prestige",
        cost: 3,
        icon: "💎",
        unlocked: false,
        effect: { type: "startingCoins", value: 250000 }
      },
      {
        id: "artifact-5-perk-2",
        name: "Resonant Lattice",
        description: "Crystal structure resonates with cosmic energy for 500,000 starting coins",
        cost: 6,
        icon: "✨",
        unlocked: false,
        effect: { type: "startingCoins", value: 500000 }
      },
      {
        id: "artifact-5-perk-3",
        name: "Infinite Refraction",
        description: "Light passes through the crystal infinitely, providing 1,000,000 starting coins",
        cost: 12,
        icon: "🌈",
        unlocked: false,
        effect: { type: "startingCoins", value: 1000000 }
      }
    ]
  },
  {
    id: "artifact-6",
    name: "Neutron Wand",
    description: "Channels cosmic energy into a powerful beam",
    bonus: "Increases all production by 25%",
    avatar: Artifact6,  // Static import (a7.png)
    cost: 32,
    effect: {
      type: "production",
      value: 0.25
    },
    perks: [
      {
        id: "artifact-6-perk-1",
        name: "Focused Beam",
        description: "Concentrated energy increases all production by 35%",
        cost: 3,
        icon: "🔦",
        unlocked: false,
        effect: { type: "production", value: 0.35 }
      },
      {
        id: "artifact-6-perk-2",
        name: "Particle Acceleration",
        description: "Accelerated particles boost all production by 45%",
        cost: 6,
        icon: "⚛️",
        unlocked: false,
        effect: { type: "production", value: 0.45 }
      },
      {
        id: "artifact-6-perk-3",
        name: "Cosmic Ray Channeling",
        description: "Harness the power of cosmic rays for 60% increased production",
        cost: 12,
        icon: "☄️",
        unlocked: false,
        effect: { type: "production", value: 0.6 }
      }
    ]
  },
  {
    id: "artifact-7",
    name: "Molecular Flask",
    description: "Contains rare element transmutation formulae",
    bonus: "2.5x tap multiplier",
    avatar: Artifact7,  // Static import (a8.png)
    cost: 64,
    effect: {
      type: "tap",
      value: 2.5
    },
    perks: [
      {
        id: "artifact-7-perk-1",
        name: "Catalytic Reaction",
        description: "Chemical catalysts increase tap multiplier to 3x",
        cost: 3,
        icon: "🧪",
        unlocked: false,
        effect: { type: "tap", value: 3.0 }
      },
      {
        id: "artifact-7-perk-2",
        name: "Quantum Chemistry",
        description: "Manipulate molecules at quantum level for 3.5x tap multiplier",
        cost: 6,
        icon: "🔬",
        unlocked: false,
        effect: { type: "tap", value: 3.5 }
      },
      {
        id: "artifact-7-perk-3",
        name: "Philosopher's Solution",
        description: "The legendary formula perfected, providing 4x tap multiplier",
        cost: 12,
        icon: "⚗️",
        unlocked: false,
        effect: { type: "tap", value: 4.0 }
      }
    ]
  },
  {
    id: "artifact-8",
    name: "Quantum Microscope",
    description: "Views matter at the subatomic level",
    bonus: "225% more essence from prestiging",
    avatar: Artifact8,  // Static import (a9.png)
    cost: 128,
    effect: {
      type: "essence",
      value: 2.25
    },
    perks: [
      {
        id: "artifact-8-perk-1",
        name: "Subatomic Resolution",
        description: "See deeper into the essence of matter for 250% more essence",
        cost: 3,
        icon: "🔍",
        unlocked: false,
        effect: { type: "essence", value: 2.5 }
      },
      {
        id: "artifact-8-perk-2",
        name: "Quantum Probability Lens",
        description: "Observe all possible material states for 275% more essence",
        cost: 6,
        icon: "🔎",
        unlocked: false,
        effect: { type: "essence", value: 2.75 }
      },
      {
        id: "artifact-8-perk-3",
        name: "Higgs Field Visualizer",
        description: "Directly observe the field that gives matter mass, for 300% more essence",
        cost: 12,
        icon: "📊",
        unlocked: false,
        effect: { type: "essence", value: 3.0 }
      }
    ]
  },
  {
    id: "artifact-9",
    name: "Satellite Network",
    description: "Orbital array of mining assistance devices",
    bonus: "Reduces upgrade costs by 25%",
    avatar: Artifact9,  // Static import (a10.png)
    cost: 256,
    effect: {
      type: "cost",
      value: 0.25
    },
    perks: [
      {
        id: "artifact-9-perk-1",
        name: "Extended Coverage",
        description: "Additional satellites reduce upgrade costs by 30%",
        cost: 3,
        icon: "🛰️",
        unlocked: false,
        effect: { type: "cost", value: 0.3 }
      },
      {
        id: "artifact-9-perk-2",
        name: "Real-time Analysis",
        description: "Instant data processing reduces upgrade costs by 35%",
        cost: 6,
        icon: "📡",
        unlocked: false,
        effect: { type: "cost", value: 0.35 }
      },
      {
        id: "artifact-9-perk-3",
        name: "Autonomous Mining Fleet",
        description: "AI-controlled orbital mining reduces upgrade costs by 40%",
        cost: 12,
        icon: "🤖",
        unlocked: false,
        effect: { type: "cost", value: 0.4 }
      }
    ]
  },
  {
    id: "artifact-10",
    name: "Energy Core",
    description: "The heart of an extinct alien civilization",
    bonus: "Start with 1,000,000 coins after each prestige",
    avatar: Artifact10,  // Static import (a11.png)
    cost: 512,
    effect: {
      type: "startingCoins",
      value: 1000000
    },
    perks: [
      {
        id: "artifact-10-perk-1",
        name: "Power Regulation",
        description: "Better energy control provides 2,500,000 starting coins",
        cost: 3,
        icon: "⚡",
        unlocked: false,
        effect: { type: "startingCoins", value: 2500000 }
      },
      {
        id: "artifact-10-perk-2",
        name: "Core Overcharge",
        description: "Push the core beyond safe limits for 5,000,000 starting coins",
        cost: 6,
        icon: "🔋",
        unlocked: false,
        effect: { type: "startingCoins", value: 5000000 }
      },
      {
        id: "artifact-10-perk-3",
        name: "Ancient Knowledge Integration",
        description: "Unlock the aliens' financial wisdom for 10,000,000 starting coins",
        cost: 12,
        icon: "👽",
        unlocked: false,
        effect: { type: "startingCoins", value: 10000000 }
      }
    ]
  }
];
