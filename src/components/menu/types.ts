
export type MenuType = "main" | "achievements" | "prestige" | "shop" | "techTree" | "none";

// Define the Ability type used in TechTree component
export interface Ability {
  id: string;
  name: string;
  description: string;
  cost: number;
  icon: React.ReactNode;
  unlocked: boolean;
  requiredAbilities: string[];
  row: number;
  column: number;
}
