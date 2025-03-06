
import React from 'react';

export interface Ability {
  id: string;
  name: string;
  description: string;
  cost: number;
  icon: React.ReactNode;
  unlocked: boolean;
}

export interface ManagerAbility extends Ability {
  managerId: string;
}

export interface ArtifactAbility extends Ability {
  artifactId: string;
}
