import { ReactNode } from 'react';

// PNG imports for gem packages
import Gems1 from '@/assets/images/icons/gems1.png';
import Gems2 from '@/assets/images/icons/gems2.png';
import Gems3 from '@/assets/images/icons/gems3.png';
import Gems4 from '@/assets/images/icons/gems4.png';
import Gems5 from '@/assets/images/icons/gems5.png';
import Gems6 from '@/assets/images/icons/gems6.png';
// Gems7 and Gems8 are unused unless you add more packages
import Gems7 from '@/assets/images/icons/gems7.png';
import Gems8 from '@/assets/images/icons/gems8.png';

export interface GemPackage {
  id: string;
  name: string;
  amount: number;
  price: string;
  description: string;
  image: string; // Added image field for PNGs
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
  refreshTime?: number;
  isPermanent?: boolean;
  imageSrc?: string;
}

export const gemPackages: GemPackage[] = [
  {
    id: "gems_small",
    name: "Asteroid Gems",
    amount: 100,
    price: "$0.99",
    description: "A small pouch of precious space gems",
    image: Gems1,
  },
  {
    id: "gems_medium",
    name: "Nebula Cache",
    amount: 550,
    price: "$4.99",
    description: "A glowing collection of rare gems",
    image: Gems2,
  },
  {
    id: "gems_large",
    name: "Galactic Hoard",
    amount: 1200,
    price: "$9.99",
    description: "An impressive chest of premium gems",
    image: Gems3,
  },
  {
    id: "gems_huge",
    name: "Cosmic Treasure",
    amount: 2500,
    price: "$19.99",
    description: "A massive collection of exotic gems",
    image: Gems4,
  },
  {
    id: "gems_mega",
    name: "Solar Fortune",
    amount: 6500,
    price: "$49.99",
    description: "An extraordinary wealth of precious gems",
    image: Gems5,
  },
  {
    id: "gems_ultra",
    name: "Universal Vault",
    amount: 15000,
    price: "$99.99",
    description: "The ultimate gem collection for space moguls",
    image: Gems6,
  },
];

// Initial boost items (unchanged)
export const initialBoostItems = [
  {
    id: "boost_no_ads",
    name: "No Ads",
    description: "Permanently removes all ads from the game",
    effect: "Never see ads again!",
    cost: 250,
    icon: null,
    purchasable: true,
    purchased: false,
    isPermanent: true,
  },
  {
    id: "boost_quantum_accelerator",
    name: "Quantum Accelerator",
    description: "Accelerates mining operations by manipulating quantum fields",
    effect: "2x tap income for 4 hours",
    cost: 50,
    icon: null,
    purchasable: true,
    purchased: false,
  },
  {
    id: "boost_nebula_enhancer",
    name: "Nebula Enhancer",
    description: "Harnesses nebula energy to enhance mineral extraction",
    effect: "3x passive income for 2 hours",
    cost: 75,
    icon: null,
    purchasable: true,
    purchased: false,
  },
  {
    id: "boost_cosmic_catalyst",
    name: "Cosmic Catalyst",
    description: "Catalyzes cosmic reactions in your mining equipment",
    effect: "All upgrades 20% cheaper for 6 hours",
    cost: 100,
    icon: null,
    purchasable: true,
    purchased: false,
  },
  {
    id: "boost_void_extractor",
    name: "Void Extractor",
    description: "Extracts resources from the void between stars",
    effect: "Gain 500 coins per second for 1 hour",
    cost: 125,
    icon: null,
    purchasable: true,
    purchased: false,
  },
  {
    id: "boost_supernova_surge",
    name: "Supernova Surge",
    description: "Channels the energy of a distant supernova",
    effect: "Next prestige gives 50% more essence",
    cost: 150,
    icon: null,
    purchasable: true,
    purchased: false,
  },
  {
    id: "boost_galactic_magnet",
    name: "Galactic Magnet",
    description: "Magnetically attracts valuable resources from across the galaxy",
    effect: "Doubles all income for 30 minutes",
    cost: 175,
    icon: null,
    purchasable: true,
    purchased: false,
  },
  {
    id: "boost_temporal_distortion",
    name: "Temporal Distortion",
    description: "Warps time around your mining operations",
    effect: "Auto-clicks 5 times per second for 2 hours",
    cost: 200,
    icon: null,
    purchasable: true,
    purchased: false,
  },
  {
    id: "boost_stellar_fusion",
    name: "Stellar Fusion",
    description: "Initiates a controlled stellar fusion reaction in your mining equipment",
    effect: "Gain a free upgrade level every minute for 1 hour",
    cost: 150,
    icon: null,
    purchasable: true,
    purchased: false,
  },
  {
    id: "boost_dark_matter_infusion",
    name: "Dark Matter Infusion",
    description: "Infuses your equipment with mysterious dark matter",
    effect: "25% chance for critical taps (5x value) for 3 hours",
    cost: 180,
    icon: null,
    purchasable: true,
    purchased: false,
  },
  {
    id: "boost_asteroid_locator",
    name: "Asteroid Locator",
    description: "Advanced technology that locates resource-rich asteroids",
    effect: "Instant boost of 5000 coins and +10% income for 4 hours",
    cost: 160,
    icon: null,
    purchasable: true,
    purchased: false,
  },
  {
    id: "boost_wormhole_generator",
    name: "Wormhole Generator",
    description: "Creates temporary shortcuts to distant resource-rich galaxies",
    effect: "All resource collection is tripled for 1 hour",
    cost: 220,
    icon: null,
    purchasable: true,
    purchased: false,
  },
];
