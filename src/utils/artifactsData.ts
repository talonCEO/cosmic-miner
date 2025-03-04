
export interface Artifact {
  id: string;
  name: string;
  description: string;
  bonus: string;
  avatar: string;
  cost: number;
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
    bonus: "Increases all production by 25%",
    avatar: "https://api.dicebear.com/7.x/bottts/svg?seed=computer",
    cost: 25
  },
  {
    id: "artifact-2",
    name: "Space Rocket",
    description: "Propulsion system for interstellar mining",
    bonus: "Doubles click power",
    avatar: "https://api.dicebear.com/7.x/bottts/svg?seed=rocket",
    cost: 50
  },
  {
    id: "artifact-3",
    name: "Element Scanner",
    description: "High precision detection of rare elements",
    bonus: "Reveals hidden resources automatically",
    avatar: "https://api.dicebear.com/7.x/bottts/svg?seed=scanner",
    cost: 100
  },
  {
    id: "artifact-4",
    name: "Telescope Array",
    description: "Network of deep space observation instruments",
    bonus: "Shows resources 5x further away",
    avatar: "https://api.dicebear.com/7.x/bottts/svg?seed=telescope",
    cost: 200
  },
  {
    id: "artifact-5",
    name: "Crystalline Gem",
    description: "Focus crystal that amplifies mining energy",
    bonus: "All clicks have 10% chance to give double rewards",
    avatar: "https://api.dicebear.com/7.x/bottts/svg?seed=gem",
    cost: 400
  },
  {
    id: "artifact-6",
    name: "Neutron Wand",
    description: "Channels cosmic energy into a powerful beam",
    bonus: "Passive income +50%",
    avatar: "https://api.dicebear.com/7.x/bottts/svg?seed=wand",
    cost: 800
  },
  {
    id: "artifact-7",
    name: "Molecular Flask",
    description: "Contains rare element transmutation formulae",
    bonus: "Converts lower elements to higher ones periodically",
    avatar: "https://api.dicebear.com/7.x/bottts/svg?seed=flask",
    cost: 1600
  },
  {
    id: "artifact-8",
    name: "Quantum Microscope",
    description: "Views matter at the subatomic level",
    bonus: "Reveals weaknesses in elements, increasing mining efficiency by 30%",
    avatar: "https://api.dicebear.com/7.x/bottts/svg?seed=microscope",
    cost: 3200
  },
  {
    id: "artifact-9",
    name: "Satellite Network",
    description: "Orbital array of mining assistance devices",
    bonus: "Automatically mines asteroids in nearby systems",
    avatar: "https://api.dicebear.com/7.x/bottts/svg?seed=satellite",
    cost: 6400
  },
  {
    id: "artifact-10",
    name: "Energy Core",
    description: "The heart of an extinct alien civilization",
    bonus: "All production bonuses are increased by an additional 50%",
    avatar: "https://api.dicebear.com/7.x/bottts/svg?seed=core",
    cost: 12800
  }
];
