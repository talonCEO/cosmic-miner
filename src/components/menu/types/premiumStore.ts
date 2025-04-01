import { ReactNode } from 'react';
import Gems1 from '@/assets/images/icons/gems1.png';
import Gems2 from '@/assets/images/icons/gems4.png';
import Gems3 from '@/assets/images/icons/gems5.png';
import Gems4 from '@/assets/images/icons/gems6.png';
import Gems5 from '@/assets/images/icons/gems7.png';
import Gems6 from '@/assets/images/icons/gems8.png';

export interface GemPackage {
  id: string; // Google Play product ID
  name: string;
  amount: number;
  price: string;
  description: string;
  image: string;
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
  maxPurchases?: number;
}

export const gemPackages: GemPackage[] = [
  {
    id: "com.yourapp.gems_small", // Placeholder product ID
    name: "Asteroid Gems",
    amount: 100,
    price: "$0.99",
    description: "A small pouch of precious space gems",
    image: Gems1,
  },
  {
    id: "com.yourapp.gems_medium",
    name: "Nebula Cache",
    amount: 550,
    price: "$4.99",
    description: "A glowing collection of rare gems",
    image: Gems2,
  },
  {
    id: "com.yourapp.gems_large",
    name: "Galactic Hoard",
    amount: 1200,
    price: "$9.99",
    description: "An impressive chest of premium gems",
    image: Gems3,
  },
  {
    id: "com.yourapp.gems_huge",
    name: "Cosmic Treasure",
    amount: 2500,
    price: "$19.99",
    description: "A massive collection of exotic gems",
    image: Gems4,
  },
  {
    id: "com.yourapp.gems_mega",
    name: "Solar Fortune",
    amount: 6500,
    price: "$49.99",
    description: "An extraordinary wealth of precious gems",
    image: Gems5,
  },
  {
    id: "com.yourapp.gems_ultra",
    name: "Universal Vault",
    amount: 15000,
    price: "$99.99",
    description: "The ultimate gem collection for space moguls",
    image: Gems6,
  },
];