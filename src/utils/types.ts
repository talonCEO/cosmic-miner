
import { ReactNode } from 'react';

// Perk Interface - Unlockable bonuses for managers and artifacts
export interface Perk {
  id: string;                  // Unique identifier
  name: string;                // Display name
  description: string;         // Describes what the perk does
  cost: number;                // Skill points required
  icon: string;                // Visual representation (emoji)
  unlocked: boolean;           // Whether user has unlocked it
  category?: string;           // Category for the perk (for icon mapping)
  effect: {
    // Effect type determines which game mechanic is affected:
    // - "tap": Increases tap value
    // - "production": Increases production of specific elements
    // - "allProduction": Increases all production
    // - "passive": Increases passive income
    // - "cost": Reduces upgrade costs
    // - "essence": Increases essence from prestige
    // - "startingCoins": Provides starting coins after prestige
    // - "critChance": Increases critical hit chance
    // - "critMultiplier": Increases critical hit multiplier
    // - "elementBoost": Increases production of specific elements
    type: string;
    
    // Value represents the magnitude of the effect:
    // - For percentage increases (production, passive, etc): 0.05 = 5%
    // - For multipliers (tap, etc): 1.5 = 1.5x
    // - For flat values (startingCoins): direct amount
    value: number;
    
    // Optional list of element IDs that are affected by this perk
    elements?: string[];
  };
}

// Ability Interface - For TechTree component
export interface Ability {
  id: string;
  name: string;
  description: string;
  icon: ReactNode;
  unlocked: boolean;
  cost: number;
  requiredAbilities: string[];
  row: number;
  column?: number;
  cooldown?: number;
  duration?: number;
  effect?: string;
}
