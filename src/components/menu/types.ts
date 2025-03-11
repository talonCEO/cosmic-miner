
export type MenuType = "none" | "main" | "achievements" | "prestige" | "shop" | "techTree" | "premium" | "profile";

export interface Ability {
  id: string;
  name: string;
  description: string;
  unlocked: boolean;
  cooldown?: number;
  duration?: number;
  effect?: string;
  icon?: string;
}
