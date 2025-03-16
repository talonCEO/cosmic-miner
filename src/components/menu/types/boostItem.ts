
import { ReactNode } from 'react';

// Define the BoostItemType interface
export interface BoostItemType {
  id: string;
  name: string;
  description: string;
  effect: string;
  cost: number;
  icon: ReactNode | null;
  purchasable: boolean;
  purchased: number;
  isPermanent?: boolean;
  maxPurchases: number;
  refreshTime?: number;
}
