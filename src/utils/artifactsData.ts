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

import { Perk } from './types';

export const artifacts: Artifact[] = [
  {
    id: "artifact-default",
    name: "Ordinary Rock",
    description: "Just a regular rock you found on your first day",
    bonus: "Provides absolutely no benefit whatsoever",
    avatar: "https://api.dicebear.com/7.x/bottts/svg?seed=rock",
    cost: 0,
    perks: [
      {
        id: "artifact-default-perk-1",
        name: "Lucky Rock",
        description: "The rock might be lucky after all, increasing tap value by 5%",
        cost: 3,
        icon: "🍀",
        unlocked: false,
        effect: { type: "tap", value: 0.05 }
      },
      {
        id: "artifact-default-perk-2",
        name: "Polished Surface",
        description: "A polished rock reflects cosmic energy, increasing production by 10%",
        cost: 6,
        icon: "✨",
        unlocked: false,
        effect: { type: "production", value: 0.1 }
      },
      {
        id: "artifact-default-perk-3",
        name: "Ancient Power",
        description: "The rock contains ancient energy, reducing upgrade costs by 5%",
        cost: 12,
        icon: "🔮",
        unlocked: false,
        effect: { type: "cost", value: 0.05 }
      }
    ]
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
