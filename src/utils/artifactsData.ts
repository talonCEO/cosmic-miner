import { Perk } from './types';

// Static image imports for artifacts (keeping your existing imports)
import ArtifactDefault from '@/assets/images/artifacts/art.png';
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
  };
  perks?: Perk[];
}

export const artifacts: Artifact[] = [
  {
    id: "artifact-default",
    name: "Stray Pebble Pup",
    description: "A small, rocky creature that follows you around.",
    bonus: "Provides a friendly nudge but no real mining help",
    avatar: ArtifactDefault,
    cost: 0
  },
  {
    id: "artifact-1",
    name: "Luminos Drake",
    description: "A glowing dragon whelp that lights up dark mines.",
    bonus: "Increases all production by 10%",
    avatar: Artifact1,
    cost: 2,
    effect: {
      type: "production",
      value: 0.1
    },
    perks: [
      {
        id: "artifact-1-perk-1",
        name: "Radiant Scales",
        description: "Its shimmering scales boost production by 20%",
        cost: 3,
        icon: "✨",
        unlocked: false,
        effect: { type: "production", value: 0.2 }
      },
      {
        id: "artifact-1-perk-2",
        name: "Ember Breath",
        description: "Fiery exhales melt ore faster, increasing production by 30%",
        cost: 6,
        icon: "🔥",
        unlocked: false,
        effect: { type: "production", value: 0.3 }
      },
      {
        id: "artifact-1-perk-3",
        name: "Solar Flare",
        description: "Unleashes a burst of light, boosting production by 40%",
        cost: 12,
        icon: "☀️",
        unlocked: false,
        effect: { type: "production", value: 0.4 }
      }
    ]
  },
  {
    id: "artifact-2",
    name: "Skybound Griffin",
    description: "A majestic bird-beast that dives into stone.",
    bonus: "1.5x tap multiplier",
    avatar: Artifact2,
    cost: 4,
    effect: {
      type: "tap",
      value: 1.5
    },
    perks: [
      {
        id: "artifact-2-perk-1",
        name: "Talon Strike",
        description: "Sharp talons increase tap multiplier to 2x",
        cost: 3,
        icon: "🦅",
        unlocked: false,
        effect: { type: "tap", value: 2.0 }
      },
      {
        id: "artifact-2-perk-2",
        name: "Wind Rush",
        description: "Swift wings boost tap multiplier to 2.5x",
        cost: 6,
        icon: "💨",
        unlocked: false,
        effect: { type: "tap", value: 2.5 }
      },
      {
        id: "artifact-2-perk-3",
        name: "Aerial Assault",
        description: "A powerful dive raises tap multiplier to 3x",
        cost: 12,
        icon: "🌪️",
        unlocked: false,
        effect: { type: "tap", value: 3.0 }
      }
    ]
  },
  {
    id: "artifact-3",
    name: "Ethereal Salamander",
    description: "A mystical amphibian that senses hidden essence.",
    bonus: "125% more essence from prestiging",
    avatar: Artifact3,
    cost: 8,
    effect: {
      type: "essence",
      value: 1.25
    },
    perks: [
      {
        id: "artifact-3-perk-1",
        name: "Spirit Glow",
        description: "Its luminescence increases essence gain to 150%",
        cost: 3,
        icon: "🌟",
        unlocked: false,
        effect: { type: "essence", value: 1.5 }
      },
      {
        id: "artifact-3-perk-2",
        name: "Astral Dance",
        description: "Graceful movements boost essence to 175%",
        cost: 6,
        icon: "💃",
        unlocked: false,
        effect: { type: "essence", value: 1.75 }
      },
      {
        id: "artifact-3-perk-3",
        name: "Cosmic Tail",
        description: "A starry tail whips up 200% essence gain",
        cost: 12,
        icon: "🌌",
        unlocked: false,
        effect: { type: "essence", value: 2.0 }
      }
    ]
  },
  {
    id: "artifact-4",
    name: "Stoneback Tortoise",
    description: "A sturdy shelled friend that streamlines mining.",
    bonus: "Reduces upgrade costs by 5%",
    avatar: Artifact4,
    cost: 16,
    effect: {
      type: "cost",
      value: 0.05
    },
    perks: [
      {
        id: "artifact-4-perk-1",
        name: "Rock Polish",
        description: "Smooth shell reduces upgrade costs by 7.5%",
        cost: 3,
        icon: "🪨",
        unlocked: false,
        effect: { type: "cost", value: 0.075 }
      },
      {
        id: "artifact-4-perk-2",
        name: "Burrow Efficiency",
        description: "Digging prowess cuts costs by 10%",
        cost: 6,
        icon: "⛏️",
        unlocked: false,
        effect: { type: "cost", value: 0.1 }
      },
      {
        id: "artifact-4-perk-3",
        name: "Ancient Wisdom",
        description: "Old instincts lower costs by 12.5%",
        cost: 12,
        icon: "🐢",
        unlocked: false,
        effect: { type: "cost", value: 0.125 }
      }
    ]
  },
  {
    id: "artifact-5",
    name: "Gemtail Fox",
    description: "A sly creature with a jewel-encrusted tail.",
    bonus: "Start with 100,000 coins after each prestige",
    avatar: Artifact5,
    cost: 32,
    effect: {
      type: "startingCoins",
      value: 100000
    },
    perks: [
      {
        id: "artifact-5-perk-1",
        name: "Crystal Hoard",
        description: "Stashes 250,000 starting coins after prestige",
        cost: 3,
        icon: "💎",
        unlocked: false,
        effect: { type: "startingCoins", value: 250000 }
      },
      {
        id: "artifact-5-perk-2",
        name: "Treasure Sniff",
        description: "Sniffs out 500,000 starting coins",
        cost: 6,
        icon: "🦊",
        unlocked: false,
        effect: { type: "startingCoins", value: 500000 }
      },
      {
        id: "artifact-5-perk-3",
        name: "Jewel Cache",
        description: "Hides away 1,000,000 starting coins",
        cost: 12,
        icon: "💰",
        unlocked: false,
        effect: { type: "startingCoins", value: 1000000 }
      }
    ]
  },
  {
    id: "artifact-6",
    name: "Thunderhoof Stallion",
    description: "A powerful horse that stomps ore loose.",
    bonus: "Increases all production by 25%",
    avatar: Artifact6,
    cost: 64,
    effect: {
      type: "production",
      value: 0.25
    },
    perks: [
      {
        id: "artifact-6-perk-1",
        name: "Storm Kick",
        description: "Charged hooves boost production by 35%",
        cost: 3,
        icon: "⚡",
        unlocked: false,
        effect: { type: "production", value: 0.35 }
      },
      {
        id: "artifact-6-perk-2",
        name: "Galloper’s Might",
        description: "Strong legs increase production by 45%",
        cost: 6,
        icon: "🐎",
        unlocked: false,
        effect: { type: "production", value: 0.45 }
      },
      {
        id: "artifact-6-perk-3",
        name: "Tempest Charge",
        description: "A stormy run boosts production by 60%",
        cost: 12,
        icon: "🌩️",
        unlocked: false,
        effect: { type: "production", value: 0.6 }
      }
    ]
  },
  {
    id: "artifact-7",
    name: "Crimson Phoenix",
    description: "A fiery bird reborn to peck at rocks.",
    bonus: "2.5x tap multiplier",
    avatar: Artifact7,
    cost: 128,
    effect: {
      type: "tap",
      value: 2.5
    },
    perks: [
      {
        id: "artifact-7-perk-1",
        name: "Flame Peck",
        description: "Burning beak raises tap multiplier to 3x",
        cost: 3,
        icon: "🔥",
        unlocked: false,
        effect: { type: "tap", value: 3.0 }
      },
      {
        id: "artifact-7-perk-2",
        name: "Ashen Wings",
        description: "Hot wings boost tap multiplier to 4x",
        cost: 6,
        icon: "🕊️",
        unlocked: false,
        effect: { type: "tap", value: 4.0 }
      },
      {
        id: "artifact-7-perk-3",
        name: "Rebirth Strike",
        description: "A fiery revival increases tap multiplier to 5x",
        cost: 12,
        icon: "🌅",
        unlocked: false,
        effect: { type: "tap", value: 5.0 }
      }
    ]
  },
  {
    id: "artifact-8",
    name: "Mistveil Serpent",
    description: "A ghostly snake that slithers through essence veins.",
    bonus: "225% more essence from prestiging",
    avatar: Artifact8,
    cost: 256,
    effect: {
      type: "essence",
      value: 2.25
    },
    perks: [
      {
        id: "artifact-8-perk-1",
        name: "Fog Fang",
        description: "Misty bites increase essence to 250%",
        cost: 3,
        icon: "🌫️",
        unlocked: false,
        effect: { type: "essence", value: 2.5 }
      },
      {
        id: "artifact-8-perk-2",
        name: "Spectral Coil",
        description: "Ethereal grip boosts essence to 275%",
        cost: 6,
        icon: "🐍",
        unlocked: false,
        effect: { type: "essence", value: 2.75 }
      },
      {
        id: "artifact-8-perk-3",
        name: "Void Slither",
        description: "Slips through dimensions for 300% essence",
        cost: 12,
        icon: "🌀",
        unlocked: false,
        effect: { type: "essence", value: 3.0 }
      }
    ]
  },
  {
    id: "artifact-9",
    name: "Ironclaw Badger",
    description: "A tenacious digger that optimizes your efforts.",
    bonus: "Reduces upgrade costs by 10%",
    avatar: Artifact9,
    cost: 512,
    effect: {
      type: "cost",
      value: 0.1
    },
    perks: [
      {
        id: "artifact-9-perk-1",
        name: "Claw Sharpen",
        description: "Keener claws reduce costs by 12.5%",
        cost: 3,
        icon: "🦡",
        unlocked: false,
        effect: { type: "cost", value: 0.125 }
      },
      {
        id: "artifact-9-perk-2",
        name: "Burrow Mastery",
        description: "Expert digging lowers costs by 15%",
        cost: 6,
        icon: "⛏️",
        unlocked: false,
        effect: { type: "cost", value: 0.15 }
      },
      {
        id: "artifact-9-perk-3",
        name: "Steel Snout",
        description: "A tough nose cuts costs by 20%",
        cost: 12,
        icon: "⚙️",
        unlocked: false,
        effect: { type: "cost", value: 0.2 }
      }
    ]
  },
  {
    id: "artifact-10",
    name: "Starborn Unicorn",
    description: "A celestial steed that blesses your restarts.",
    bonus: "Start with 1,000,000 coins after each prestige",
    avatar: Artifact10,
    cost: 1024,
    effect: {
      type: "startingCoins",
      value: 1000000
    },
    perks: [
      {
        id: "artifact-10-perk-1",
        name: "Lunar Horn",
        description: "Glowing horn grants 2,500,000 starting coins",
        cost: 3,
        icon: "🌙",
        unlocked: false,
        effect: { type: "startingCoins", value: 2500000 }
      },
      {
        id: "artifact-10-perk-2",
        name: "Astral Gallop",
        description: "Starry strides provide 5,000,000 starting coins",
        cost: 6,
        icon: "🦄",
        unlocked: false,
        effect: { type: "startingCoins", value: 5000000 }
      },
      {
        id: "artifact-10-perk-3",
        name: "Galactic Blessing",
        description: "Cosmic grace offers 10,000,000 starting coins",
        cost: 12,
        icon: "⭐",
        unlocked: false,
        effect: { type: "startingCoins", value: 10000000 }
      }
    ]
  }
];