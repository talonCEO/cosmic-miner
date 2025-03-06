
export interface Perk {
  id: string;
  name: string;
  description: string;
  cost: number;
  icon: string;
  unlocked: boolean;
  effect: {
    type: string;
    value: number;
  };
}
