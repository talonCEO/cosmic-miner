
export type MenuType = "none" | "main" | "achievements" | "prestige" | "shop" | "techTree" | "premium";

export interface Ability {
  id: string;
  name: string;
  description: string;
  cost: number;
  row: number;
  unlocked: boolean;
  requiredAbilities: string[];
  icon: JSX.Element;
}
