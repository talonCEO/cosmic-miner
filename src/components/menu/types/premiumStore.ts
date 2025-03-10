
export interface GemPackage {
  id: string;
  name: string;
  amount: number;
  price: string;
  description: string;
}

export const gemPackages: GemPackage[] = [
  {
    id: "gems_small",
    name: "Asteroid Gems",
    amount: 100,
    price: "$0.99",
    description: "A small pouch of precious space gems"
  },
  {
    id: "gems_medium",
    name: "Nebula Cache",
    amount: 500,
    price: "$4.99",
    description: "A glowing collection of rare gems"
  },
  {
    id: "gems_large",
    name: "Galactic Hoard",
    amount: 1200,
    price: "$9.99",
    description: "An impressive chest of premium gems"
  },
  {
    id: "gems_huge",
    name: "Cosmic Treasure",
    amount: 2500,
    price: "$19.99",
    description: "A massive collection of exotic gems"
  },
  {
    id: "gems_mega",
    name: "Solar Fortune",
    amount: 6000,
    price: "$49.99",
    description: "An extraordinary wealth of precious gems"
  },
  {
    id: "gems_ultra",
    name: "Universal Vault",
    amount: 15000,
    price: "$99.99",
    description: "The ultimate gem collection for space moguls"
  }
];
