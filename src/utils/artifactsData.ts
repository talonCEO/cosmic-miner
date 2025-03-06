
import { Shield, Zap, Brain, Star, TargetIcon, HandCoins, Trophy, CloudLightning, Gem, Sparkles, Rocket, Gauge, Compass, Flower, Flame, Diamond, Eye, Heart } from 'lucide-react';
import { ArtifactAbility } from './types';

export interface Artifact {
  id: string;
  name: string;
  description: string;
  bonus: string;
  avatar: string;
  cost: number;
  effect?: {
    type: string;
    value: number;
  }
  abilities?: ArtifactAbility[];
}

// Define abilities for each artifact
const createArtifactAbilities = (): ArtifactAbility[] => {
  const artifactIds = [
    "artifact-default", "artifact-1", "artifact-2", "artifact-3", "artifact-4", "artifact-5",
    "artifact-6", "artifact-7", "artifact-8", "artifact-9", "artifact-10"
  ];
  
  const abilities: ArtifactAbility[] = [];
  
  // Add 3 abilities for each artifact
  artifactIds.forEach(artifactId => {
    const baseId = artifactId.replace("artifact-", "");
    
    // Tier 1 Ability - 3 skill points
    abilities.push({
      id: `artifact-ability-${baseId}-1`,
      artifactId: artifactId,
      name: getArtifactAbilityName(artifactId, 1),
      description: getArtifactAbilityDescription(artifactId, 1),
      cost: 3,
      icon: getArtifactAbilityIcon(artifactId, 1),
      unlocked: false
    });
    
    // Tier 2 Ability - 6 skill points
    abilities.push({
      id: `artifact-ability-${baseId}-2`,
      artifactId: artifactId,
      name: getArtifactAbilityName(artifactId, 2),
      description: getArtifactAbilityDescription(artifactId, 2),
      cost: 6,
      icon: getArtifactAbilityIcon(artifactId, 2),
      unlocked: false
    });
    
    // Tier 3 Ability - 12 skill points
    abilities.push({
      id: `artifact-ability-${baseId}-3`,
      artifactId: artifactId,
      name: getArtifactAbilityName(artifactId, 3),
      description: getArtifactAbilityDescription(artifactId, 3),
      cost: 12,
      icon: getArtifactAbilityIcon(artifactId, 3),
      unlocked: false
    });
  });
  
  return abilities;
};

// Helper functions to generate ability details based on artifact ID and tier
function getArtifactAbilityName(artifactId: string, tier: number): string {
  const artifactNames: Record<string, string[]> = {
    "artifact-default": ["Rock Throwing", "Paperweight", "Decorative Display"],
    "artifact-1": ["Processing Speed", "Quantum Entanglement", "Parallel Computing"],
    "artifact-2": ["Fuel Efficiency", "Engine Overclocking", "Space Exploration"],
    "artifact-3": ["Scanning Range", "Element Detection", "Rare Material Finder"],
    "artifact-4": ["Star Mapping", "Deep Space Imaging", "Celestial Navigation"],
    "artifact-5": ["Energy Focusing", "Light Amplification", "Prismatic Splitting"],
    "artifact-6": ["Energy Channeling", "Cosmic Absorption", "Neutron Manipulation"],
    "artifact-7": ["Molecular Stability", "Chemical Reactions", "Alchemical Transmutation"],
    "artifact-8": ["Quantum Resolution", "Nanoscale Viewing", "Atomic Manipulation"],
    "artifact-9": ["Global Coverage", "Signal Boosting", "Data Network"],
    "artifact-10": ["Power Regulation", "Energy Conversion", "Infinite Power"]
  };
  
  return artifactNames[artifactId]?.[tier-1] || `Ability ${tier}`;
}

function getArtifactAbilityDescription(artifactId: string, tier: number): string {
  const descriptions: Record<string, string[]> = {
    "artifact-default": [
      "Increases click value by 1% because you're throwing a rock at the elements",
      "Weighs down your cosmic papers, increasing offline gains by 2%",
      "Looks nice on your shelf, boosting your confidence and production by 3%"
    ],
    "artifact-1": [
      "Optimizes calculations for 10% faster resource processing",
      "Links quantum particles for 15% chance of duplicating resources",
      "Enables parallel computing increasing all production by 20%"
    ],
    "artifact-2": [
      "Improves fuel consumption for 15% faster travel between cosmic nodes",
      "Overclocks engines for 25% boost to tap value",
      "Enables space exploration with 10% chance to discover rare elements"
    ],
    "artifact-3": [
      "Extends scanning range by 20% for better resource detection",
      "Improves element detection algorithms by 30% for higher yields",
      "Locates ultra-rare materials with 15% chance of bonus essence"
    ],
    "artifact-4": [
      "Maps nearby stars for 15% reduction in navigation costs",
      "Images deep space for 20% more efficient resource allocation",
      "Provides celestial navigation for 25% faster resource gathering"
    ],
    "artifact-5": [
      "Focuses energy for 15% more efficient resource conversion",
      "Amplifies light-based technologies for 20% production boost",
      "Splits light into prismatic components for 25% more diverse resources"
    ],
    "artifact-6": [
      "Channels cosmic energy for 20% boost to all production",
      "Absorbs cosmic radiation for 15% chance of bonus resources",
      "Manipulates neutrons for 30% more stable element production"
    ],
    "artifact-7": [
      "Stabilizes molecules for 25% more consistent resource generation",
      "Catalyzes chemical reactions for 20% faster processing",
      "Transmutes basic elements into valuable ones with 15% efficiency"
    ],
    "artifact-8": [
      "Enhances quantum resolution for 30% more precise resource targeting",
      "Enables nanoscale viewing for 25% more efficient micro-harvesting",
      "Allows atomic manipulation for 20% chance of creating perfect elements"
    ],
    "artifact-9": [
      "Provides global coverage for 20% faster resource location",
      "Boosts signals for 25% more accurate resource detection",
      "Creates data network for 30% more efficient resource management"
    ],
    "artifact-10": [
      "Regulates power for 25% more stable energy output",
      "Converts energy types with 30% greater efficiency",
      "Taps into infinite power for 5% chance of free upgrades"
    ]
  };
  
  return descriptions[artifactId]?.[tier-1] || `Enhances artifact capabilities at tier ${tier}`;
}

function getArtifactAbilityIcon(artifactId: string, tier: number) {
  // Map of icons by tier (simplified for implementation)
  const tierIcons = [
    [<Flame size={16} className="text-red-400" />, <Diamond size={16} className="text-blue-400" />, <Eye size={16} className="text-purple-400" />],
    [<Brain size={16} className="text-green-400" />, <Zap size={16} className="text-yellow-400" />, <Shield size={16} className="text-indigo-400" />],
    [<Rocket size={16} className="text-orange-400" />, <Star size={16} className="text-amber-400" />, <Compass size={16} className="text-cyan-400" />],
    [<TargetIcon size={16} className="text-pink-400" />, <Gauge size={16} className="text-teal-400" />, <HandCoins size={16} className="text-emerald-400" />],
    [<Trophy size={16} className="text-purple-400" />, <Heart size={16} className="text-red-400" />, <CloudLightning size={16} className="text-blue-400" />],
    [<Gem size={16} className="text-amber-400" />, <Sparkles size={16} className="text-green-400" />, <Flower size={16} className="text-pink-400" />],
    [<Shield size={16} className="text-indigo-400" />, <Zap size={16} className="text-cyan-400" />, <Brain size={16} className="text-orange-400" />],
    [<Rocket size={16} className="text-emerald-400" />, <Star size={16} className="text-purple-400" />, <Compass size={16} className="text-red-400" />],
    [<TargetIcon size={16} className="text-blue-400" />, <Gauge size={16} className="text-amber-400" />, <HandCoins size={16} className="text-teal-400" />],
    [<Trophy size={16} className="text-green-400" />, <Heart size={16} className="text-indigo-400" />, <CloudLightning size={16} className="text-pink-400" />]
  ];
  
  // Get artifact index (default to 0)
  const artifactIndex = parseInt(artifactId.replace("artifact-", "")) % 10;
  // Get tier index (1-based to 0-based)
  const tierIndex = tier - 1;
  
  // Get the icon or return a default
  return tierIcons[artifactIndex]?.[tierIndex] || <Gem size={16} className="text-purple-400" />;
}

export const artifacts: Artifact[] = [
  {
    id: "artifact-default",
    name: "Ordinary Rock",
    description: "Just a regular rock you found on your first day",
    bonus: "Provides absolutely no benefit whatsoever",
    avatar: "https://api.dicebear.com/7.x/bottts/svg?seed=rock",
    cost: 0
  },
  {
    id: "artifact-1",
    name: "Quantum Computer",
    description: "Advanced computational device using quantum mechanics",
    bonus: "Increases all production by 10%",
    avatar: "https://api.dicebear.com/7.x/bottts/svg?seed=computer",
    cost: 1,
    effect: {
      type: "production",
      value: 0.1
    }
  },
  {
    id: "artifact-2",
    name: "Space Rocket",
    description: "Propulsion system for interstellar mining",
    bonus: "1.5x tap multiplier",
    avatar: "https://api.dicebear.com/7.x/bottts/svg?seed=rocket",
    cost: 2,
    effect: {
      type: "tap",
      value: 1.5
    }
  },
  {
    id: "artifact-3",
    name: "Element Scanner",
    description: "High precision detection of rare elements",
    bonus: "125% more essence from prestiging",
    avatar: "https://api.dicebear.com/7.x/bottts/svg?seed=scanner",
    cost: 4,
    effect: {
      type: "essence",
      value: 1.25
    }
  },
  {
    id: "artifact-4",
    name: "Telescope Array",
    description: "Network of deep space observation instruments",
    bonus: "Reduces upgrade costs by 10%",
    avatar: "https://api.dicebear.com/7.x/bottts/svg?seed=telescope",
    cost: 8,
    effect: {
      type: "cost",
      value: 0.1
    }
  },
  {
    id: "artifact-5",
    name: "Crystalline Gem",
    description: "Focus crystal that amplifies mining energy",
    bonus: "Start with 100,000 coins after each prestige",
    avatar: "https://api.dicebear.com/7.x/bottts/svg?seed=gem",
    cost: 16,
    effect: {
      type: "startingCoins",
      value: 100000
    }
  },
  {
    id: "artifact-6",
    name: "Neutron Wand",
    description: "Channels cosmic energy into a powerful beam",
    bonus: "Increases all production by 25%",
    avatar: "https://api.dicebear.com/7.x/bottts/svg?seed=wand",
    cost: 32,
    effect: {
      type: "production",
      value: 0.25
    }
  },
  {
    id: "artifact-7",
    name: "Molecular Flask",
    description: "Contains rare element transmutation formulae",
    bonus: "2.5x tap multiplier",
    avatar: "https://api.dicebear.com/7.x/bottts/svg?seed=flask",
    cost: 64,
    effect: {
      type: "tap",
      value: 2.5
    }
  },
  {
    id: "artifact-8",
    name: "Quantum Microscope",
    description: "Views matter at the subatomic level",
    bonus: "225% more essence from prestiging",
    avatar: "https://api.dicebear.com/7.x/bottts/svg?seed=microscope",
    cost: 128,
    effect: {
      type: "essence",
      value: 2.25
    }
  },
  {
    id: "artifact-9",
    name: "Satellite Network",
    description: "Orbital array of mining assistance devices",
    bonus: "Reduces upgrade costs by 25%",
    avatar: "https://api.dicebear.com/7.x/bottts/svg?seed=satellite",
    cost: 256,
    effect: {
      type: "cost",
      value: 0.25
    }
  },
  {
    id: "artifact-10",
    name: "Energy Core",
    description: "The heart of an extinct alien civilization",
    bonus: "Start with 1,000,000 coins after each prestige",
    avatar: "https://api.dicebear.com/7.x/bottts/svg?seed=core",
    cost: 512,
    effect: {
      type: "startingCoins",
      value: 1000000
    }
  }
];

// Add artifact abilities as a separate export
export const artifactAbilities = createArtifactAbilities();
