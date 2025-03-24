
import { GameState, Ability } from '@/context/GameContext';

// Calculate tap value (coins per click)
export const calculateTapValue = (state: GameState): number => {
  // Base tap value
  let tapValue = state.coinsPerClick;
  
  // Apply passively learned abilities that affect tap value
  if (state.abilities) {
    state.abilities.forEach(ability => {
      if (ability.unlocked) {
        switch (ability.id) {
          case 'ability-2': // Quantum Vibration Enhancer
            tapValue *= 1.5;
            break;
          case 'ability-5': // Laser-Guided Extraction System
            // 15% chance of 5x normal yield
            if (Math.random() < 0.15) {
              tapValue *= 5;
            }
            break;
          case 'ability-8': // Plasma Discharge Excavator
            tapValue *= 1.85;
            break;
          case 'ability-11': // Supernova Core Extractor
            tapValue *= 2.2;
            break;
        }
      }
    });
  }

  // Apply world multiplier
  if (state.worlds && state.currentWorld && state.worlds[state.currentWorld - 1]) {
    tapValue *= state.worlds[state.currentWorld - 1].multiplier;
  }
  
  return tapValue;
};

// Calculate passive income multiplier
export const calculatePassiveIncome = (state: GameState): number => {
  let passiveMultiplier = 1;
  
  // Apply passively learned abilities that affect passive income
  if (state.abilities) {
    state.abilities.forEach(ability => {
      if (ability.unlocked) {
        switch (ability.id) {
          case 'ability-2': // Quantum Vibration Enhancer
            passiveMultiplier *= 1.25;
            break;
          case 'ability-4': // Graviton Shield Generator
            passiveMultiplier *= 1.2;
            break;
          case 'ability-6': // Dark Matter Attractor
            passiveMultiplier *= 1.3;
            break;
          case 'ability-8': // Plasma Discharge Excavator
            passiveMultiplier *= 1.55;
            break;
          case 'ability-9': // Nano-Bot Mining Swarm
            passiveMultiplier *= 1.65;
            break;
          case 'ability-12': // Quantum Tunneling Drill
            passiveMultiplier *= 2;
            break;
        }
      }
    });
  }
  
  // Apply world multiplier
  if (state.worlds && state.currentWorld && state.worlds[state.currentWorld - 1]) {
    passiveMultiplier *= state.worlds[state.currentWorld - 1].multiplier;
  }
  
  return passiveMultiplier;
};

// Calculate auto-tap income
export const calculateAutoTapIncome = (state: GameState): number => {
  // If auto tap is not enabled, return 0
  if (!state.autoTap) return 0;
  
  // Base auto tap income is 10% of tap value
  return calculateTapValue(state) * 0.1;
};

// Calculate cost reduction from abilities
export const calculateCostReduction = (state: GameState): number => {
  let costMultiplier = 1;
  
  // Apply passively learned abilities that affect costs
  if (state.abilities) {
    state.abilities.forEach(ability => {
      if (ability.unlocked) {
        switch (ability.id) {
          case 'ability-3': // Neural Mining Matrix
            costMultiplier *= 0.95; // 5% reduction
            break;
          case 'ability-4': // Graviton Shield Generator
            costMultiplier *= 0.85; // 15% reduction
            break;
          case 'ability-9': // Nano-Bot Mining Swarm
            costMultiplier *= 0.7; // 30% reduction
            break;
          case 'ability-12': // Quantum Tunneling Drill
            costMultiplier *= 0.55; // 45% reduction
            break;
        }
      }
    });
  }
  
  return costMultiplier;
};

// Calculate essence reward for prestige
export const calculateEssenceReward = (totalEarned: number, state: GameState): number => {
  // Base essence calculation
  let essenceReward = Math.max(1, Math.floor(Math.sqrt(totalEarned / 1e6)));
  
  // Apply ability bonuses
  if (state.abilities) {
    state.abilities.forEach(ability => {
      if (ability.unlocked) {
        switch (ability.id) {
          case 'ability-7': // Galactic Achievement Scanner
            essenceReward = Math.floor(essenceReward * 1.15);
            break;
          case 'ability-10': // Interstellar Navigation AI
            essenceReward = Math.floor(essenceReward * 1.2);
            break;
          case 'ability-13': // Cosmic Singularity Engine
            essenceReward = Math.floor(essenceReward * 1.35);
            break;
        }
      }
    });
  }
  
  return essenceReward;
};

// Calculate starting coins after prestige
export const calculateStartingCoins = (ownedArtifacts: string[]): number => {
  // Default starting coins
  let startingCoins = 0;
  
  // Add bonuses from artifacts
  if (ownedArtifacts.includes('artifact-1')) {
    startingCoins += 100;
  }
  
  if (ownedArtifacts.includes('artifact-2')) {
    startingCoins += 500;
  }
  
  if (ownedArtifacts.includes('artifact-3')) {
    startingCoins += 2000;
  }
  
  if (ownedArtifacts.includes('artifact-4')) {
    startingCoins += 10000;
  }
  
  return startingCoins;
};

// Check if upgrading to a new level should award a skill point
export const checkUpgradeMilestone = (oldLevel: number, newLevel: number): boolean => {
  const milestones = [10, 25, 50, 100, 200, 300, 400, 500, 600, 700, 800, 900, 1000];
  
  return milestones.some(milestone => oldLevel < milestone && newLevel >= milestone);
};

// Calculate cost for bulk purchase of upgrades
export const calculateBulkPurchaseCost = (
  baseCost: number, 
  currentLevel: number, 
  quantity: number, 
  growthRate: number
): number => {
  if (quantity <= 0) return 0;
  
  let totalCost = 0;
  for (let i = 0; i < quantity; i++) {
    totalCost += Math.floor(baseCost * Math.pow(growthRate, currentLevel + i));
  }
  
  return totalCost;
};

// Calculate maximum affordable quantity of upgrades
export const calculateMaxAffordableQuantity = (
  availableCoins: number,
  cost: number,
  currentLevel: number,
  growthRate: number
): number => {
  let quantity = 0;
  let totalCost = 0;
  let nextCost = cost;
  
  while (totalCost + nextCost <= availableCoins) {
    quantity++;
    totalCost += nextCost;
    nextCost = Math.floor(cost * Math.pow(growthRate, currentLevel + quantity));
  }
  
  return quantity;
};
