
import { ReactNode } from 'react';

export interface GemPackage {
  id: string;
  name: string;
  amount: number;
  price: string;
  description: string;
}

export interface BoostItem {
  id: string;
  name: string;
  description: string;
  effect: string;
  cost: number;
  icon: ReactNode;
  purchasable: boolean;
  purchased: boolean;
  refreshTime?: number; // Timestamp when this item will refresh
  isPermanent?: boolean; // If true, this item can only be purchased once and is permanently enabled
  imageSrc?: string; // Optional image source for the boost
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
    amount: 550,
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
    amount: 6500,
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

// Initial boost items with default values (not purchased, refreshable)
export const initialBoostItems = [
  {
    id: "boost_no_ads",
    name: "No Ads",
    description: "Permanently removes all ads from the game",
    effect: "Never see ads again!",
    cost: 250,
    icon: null, // Will be set in PremiumStore component
    purchasable: true,
    purchased: false,
    isPermanent: true
  },
  {
    id: "boost_quantum_accelerator",
    name: "Quantum Accelerator",
    description: "Accelerates mining operations by manipulating quantum fields",
    effect: "2x tap income for 4 hours",
    cost: 50,
    icon: null, // Will be set in PremiumStore component
    purchasable: true,
    purchased: false
  },
  {
    id: "boost_nebula_enhancer",
    name: "Nebula Enhancer",
    description: "Harnesses nebula energy to enhance mineral extraction",
    effect: "3x passive income for 2 hours",
    cost: 75,
    icon: null,
    purchasable: true,
    purchased: false
  },
  {
    id: "boost_cosmic_catalyst",
    name: "Cosmic Catalyst",
    description: "Catalyzes cosmic reactions in your mining equipment",
    effect: "All upgrades 20% cheaper for 6 hours",
    cost: 100,
    icon: null,
    purchasable: true,
    purchased: false
  },
  {
    id: "boost_void_extractor",
    name: "Void Extractor",
    description: "Extracts resources from the void between stars",
    effect: "Gain 500 coins per second for 1 hour",
    cost: 125,
    icon: null,
    purchasable: true,
    purchased: false
  },
  {
    id: "boost_supernova_surge",
    name: "Supernova Surge",
    description: "Channels the energy of a distant supernova",
    effect: "Next prestige gives 50% more essence",
    cost: 150,
    icon: null,
    purchasable: true,
    purchased: false
  },
  {
    id: "boost_galactic_magnet",
    name: "Galactic Magnet",
    description: "Magnetically attracts valuable resources from across the galaxy",
    effect: "Doubles all income for 30 minutes",
    cost: 175,
    icon: null,
    purchasable: true,
    purchased: false
  },
  {
    id: "boost_temporal_distortion",
    name: "Temporal Distortion",
    description: "Warps time around your mining operations",
    effect: "Auto-clicks 5 times per second for 2 hours",
    cost: 200,
    icon: null,
    purchasable: true,
    purchased: false
  },
  {
    id: "boost_stellar_fusion",
    name: "Stellar Fusion",
    description: "Initiates a controlled stellar fusion reaction in your mining equipment",
    effect: "Gain a free upgrade level every minute for 1 hour",
    cost: 150,
    icon: null,
    purchasable: true,
    purchased: false
  },
  {
    id: "boost_dark_matter_infusion",
    name: "Dark Matter Infusion",
    description: "Infuses your equipment with mysterious dark matter",
    effect: "25% chance for critical taps (5x value) for 3 hours",
    cost: 180,
    icon: null,
    purchasable: true,
    purchased: false
  },
  {
    id: "boost_asteroid_locator",
    name: "Asteroid Locator",
    description: "Advanced technology that locates resource-rich asteroids",
    effect: "Instant boost of 5000 coins and +10% income for 4 hours",
    cost: 160,
    icon: null,
    purchasable: true,
    purchased: false
  },
  {
    id: "boost_wormhole_generator",
    name: "Wormhole Generator",
    description: "Creates temporary shortcuts to distant resource-rich galaxies",
    effect: "All resource collection is tripled for 1 hour",
    cost: 220,
    icon: null,
    purchasable: true,
    purchased: false
  }
];
