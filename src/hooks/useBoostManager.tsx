
import { useGame } from '@/context/GameContext';
import { Perk } from '@/utils/types';

/**
 * useBoostManager Hook
 * 
 * This hook centralizes all boost calculations from:
 * - Managers
 * - Artifacts
 * - Abilities (Tech Tree)
 * - Perks
 * 
 * It provides methods to calculate various boost types affecting gameplay:
 * - Production multipliers
 * - Tap value boosts
 * - Passive income increases
 * - Cost reductions
 * - Essence rewards
 * - Starting coins after prestige
 */
export const useBoostManager = () => {
  const { state } = useGame();

  /**
   * Get element name from element ID
   */
  const getElementName = (elementId: string): string => {
    const element = state.upgrades.find(u => u.id === elementId);
    return element ? element.name : elementId;
  };

  /**
   * Get the most powerful unlocked perk for a manager or artifact
   */
  const getHighestUnlockedPerkValue = (itemId: string) => {
    // Check if it's a manager
    let item = state.managers.find(m => m.id === itemId);
    if (!item || !item.perks) {
      // If not a manager, check if it's an artifact
      item = state.artifacts.find(a => a.id === itemId);
    }
    
    if (!item || !item.perks) return null;
    
    const unlockedPerks = item.perks.filter(p => p.unlocked);
    if (unlockedPerks.length === 0) return null;
    
    // Return the highest value perk
    return unlockedPerks.reduce((prev, current) => 
      prev.effect.value > current.effect.value ? prev : current
    );
  };

  /**
   * Format effect description based on artifact type and highest perk
   */
  const formatEffectDescription = (artifact: any, highestPerk: Perk | null = null) => {
    if (!artifact.effect) return artifact.bonus;
    
    // If we have a highest perk, use its value instead of the base
    const effectValue = highestPerk ? highestPerk.effect.value : artifact.effect.value;
    
    switch(artifact.effect.type) {
      case 'production':
        return `Increases all production by ${effectValue * 100}%`;
      case 'tap':
        return `${effectValue}x tap multiplier`;
      case 'essence':
        return `${effectValue * 100}% more essence from prestiging`;
      case 'cost':
        return `Reduces upgrade costs by ${effectValue * 100}%`;
      case 'startingCoins':
        return `Start with ${effectValue.toLocaleString()} coins after each prestige`;
      default:
        return artifact.bonus;
    }
  };

  /**
   * Calculate tap multiplier from all sources
   */
  const calculateTapMultiplier = () => {
    let multiplier = 1.0;
    
    // 1. Apply artifact boosts
    if (state.ownedArtifacts.includes("artifact-2")) { // Space Rocket
      multiplier += 0.5; // Base 1.5x multiplier
      
      // Check for Space Rocket perks
      const rocketArtifact = state.artifacts.find(a => a.id === "artifact-2");
      if (rocketArtifact && rocketArtifact.perks) {
        const unlockedPerks = rocketArtifact.perks.filter(p => p.unlocked);
        if (unlockedPerks.length > 0) {
          // Use the highest unlocked perk value
          const highestPerk = unlockedPerks.reduce((prev, current) => 
            prev.effect.value > current.effect.value ? prev : current
          );
          multiplier = highestPerk.effect.value; // Override with highest perk value
        }
      }
    }
    
    // Check for Molecular Flask and its perks (artifact-7)
    if (state.ownedArtifacts.includes("artifact-7")) {
      multiplier += 2.5; // Molecular Flask base bonus
      
      const flaskArtifact = state.artifacts.find(a => a.id === "artifact-7");
      if (flaskArtifact && flaskArtifact.perks) {
        const unlockedPerks = flaskArtifact.perks.filter(p => p.unlocked);
        if (unlockedPerks.length > 0) {
          // Use the highest unlocked perk value
          const highestPerk = unlockedPerks.reduce((prev, current) => 
            prev.effect.value > current.effect.value ? prev : current
          );
          multiplier = highestPerk.effect.value; // Use highest value instead
        }
      }
    }
    
    // 2. Apply ability boosts to tap value
    if (state.abilities.find(a => a.id === "ability-2" && a.unlocked)) {
      multiplier += 0.5; // Quantum Vibration Enhancer: +50% tap power
    }
    if (state.abilities.find(a => a.id === "ability-8" && a.unlocked)) {
      multiplier += 0.85; // Plasma Discharge Excavator: +85% tap value
    }
    if (state.abilities.find(a => a.id === "ability-11" && a.unlocked)) {
      multiplier += 1.2; // Supernova Core Extractor: +120% tap value
    }
    
    return multiplier;
  };

  /**
   * Calculate passive income multiplier from all sources
   */
  const calculatePassiveIncomeMultiplier = () => {
    let multiplier = 1.0;
    
    // Apply manager production boosts
    state.ownedManagers.forEach(managerId => {
      const manager = state.managers.find(m => m.id === managerId);
      if (manager && manager.boosts) {
        // Manager's base boost is applied by default
        
        // Check if manager has perks that boost production
        if (manager.perks) {
          const productionPerks = manager.perks.filter(p => 
            p.unlocked && p.effect.type === 'elementBoost'
          );
          
          if (productionPerks.length > 0) {
            // Find the highest production boost perk
            const highestPerk = productionPerks.reduce((prev, current) => 
              prev.effect.value > current.effect.value ? prev : current
            );
            
            // Apply the highest perk boost (specific to manager's elements)
            // This is applied separately in the element-specific calculations
          }
        }
      }
    });
    
    // Apply ability boosts to passive income
    if (state.abilities.find(a => a.id === "ability-2" && a.unlocked)) {
      multiplier += 0.25; // Quantum Vibration Enhancer: +25% passive income
    }
    if (state.abilities.find(a => a.id === "ability-4" && a.unlocked)) {
      multiplier += 0.2; // Graviton Shield Generator: +20% passive income
    }
    if (state.abilities.find(a => a.id === "ability-6" && a.unlocked)) {
      multiplier += 0.3; // Dark Matter Attractor: +30% passive income
    }
    if (state.abilities.find(a => a.id === "ability-8" && a.unlocked)) {
      multiplier += 0.55; // Plasma Discharge Excavator: +55% passive income
    }
    if (state.abilities.find(a => a.id === "ability-9" && a.unlocked)) {
      multiplier += 0.65; // Nano-Bot Mining Swarm: +65% passive income
    }
    if (state.abilities.find(a => a.id === "ability-12" && a.unlocked)) {
      multiplier += 1.0; // Quantum Tunneling Drill: doubles passive income
    }
    
    return multiplier;
  };

  /**
   * Calculate cost reduction from all sources
   */
  const calculateCostReduction = () => {
    let costReduction = 1.0; // No reduction by default
    
    // Apply artifact cost reduction
    if (state.ownedArtifacts.includes("artifact-5")) { // Time Dilator
      costReduction -= 0.1; // 10% reduction
      
      // Check for perks
      const timeDilatorArtifact = state.artifacts.find(a => a.id === "artifact-5");
      if (timeDilatorArtifact && timeDilatorArtifact.perks) {
        const unlockedPerks = timeDilatorArtifact.perks.filter(p => p.unlocked);
        if (unlockedPerks.length > 0) {
          // Get highest reduction
          const highestPerk = unlockedPerks.reduce((prev, current) => 
            prev.effect.value > current.effect.value ? prev : current
          );
          costReduction = 1 - highestPerk.effect.value; // Apply highest reduction
        }
      }
    }
    
    // Apply ability cost reduction effects
    if (state.abilities.find(a => a.id === "ability-3" && a.unlocked)) {
      costReduction -= 0.05; // Neural Mining Matrix: 5% cost reduction
    }
    if (state.abilities.find(a => a.id === "ability-4" && a.unlocked)) {
      costReduction -= 0.15; // Graviton Shield Generator: 15% cost reduction
    }
    if (state.abilities.find(a => a.id === "ability-9" && a.unlocked)) {
      costReduction -= 0.30; // Nano-Bot Mining Swarm: 30% cost reduction
    }
    if (state.abilities.find(a => a.id === "ability-12" && a.unlocked)) {
      costReduction -= 0.45; // Quantum Tunneling Drill: 45% cost reduction
    }
    
    // Ensure cost reduction doesn't go below 50%
    return Math.max(0.5, costReduction);
  };

  /**
   * Calculate essence bonus multiplier from all sources
   */
  const calculateEssenceMultiplier = () => {
    let multiplier = 1.0;
    
    // Apply artifact essence bonuses
    if (state.ownedArtifacts.includes("artifact-3")) { // Element Scanner
      multiplier += 0.25; // 25% more essence
      
      // Check for Element Scanner perks
      const scannerArtifact = state.artifacts.find(a => a.id === "artifact-3");
      if (scannerArtifact && scannerArtifact.perks) {
        const unlockedPerks = scannerArtifact.perks.filter(p => p.unlocked);
        if (unlockedPerks.length > 0) {
          // Use highest essence bonus
          const highestPerk = unlockedPerks.reduce((prev, current) => 
            prev.effect.value > current.effect.value ? prev : current
          );
          multiplier = highestPerk.effect.value; // Use the highest multiplier value
        }
      }
    }
    
    if (state.ownedArtifacts.includes("artifact-8")) { // Quantum Microscope
      multiplier += 0.5; // 50% more essence
      
      // Check for Quantum Microscope perks
      const microscopeArtifact = state.artifacts.find(a => a.id === "artifact-8");
      if (microscopeArtifact && microscopeArtifact.perks) {
        const unlockedPerks = microscopeArtifact.perks.filter(p => p.unlocked);
        if (unlockedPerks.length > 0) {
          // Use highest essence bonus
          const highestPerk = unlockedPerks.reduce((prev, current) => 
            prev.effect.value > current.effect.value ? prev : current
          );
          multiplier = highestPerk.effect.value; // Use the highest multiplier value
        }
      }
    }
    
    // Apply ability bonuses for essence rewards
    if (state.abilities.find(a => a.id === "ability-7" && a.unlocked)) {
      multiplier += 0.15; // Galactic Achievement Scanner: +15% essence
    }
    if (state.abilities.find(a => a.id === "ability-10" && a.unlocked)) {
      multiplier += 0.2; // Interstellar Navigation AI: +20% essence rewards
    }
    if (state.abilities.find(a => a.id === "ability-13" && a.unlocked)) {
      multiplier += 0.35; // Cosmic Singularity Engine: +35% essence gain
    }
    
    return multiplier;
  };

  /**
   * Calculate starting coins after prestige
   */
  const calculateStartingCoins = () => {
    let startingCoins = 0; // Default is 0
    
    // Check if player has the Quantum Vault artifact
    if (state.ownedArtifacts.includes("artifact-4")) {
      startingCoins = 1000; // Base starting coins
      
      // Check for perks
      const vaultArtifact = state.artifacts.find(a => a.id === "artifact-4");
      if (vaultArtifact && vaultArtifact.perks) {
        const unlockedPerks = vaultArtifact.perks.filter(p => p.unlocked);
        if (unlockedPerks.length > 0) {
          // Get highest starting coins value
          const highestPerk = unlockedPerks.reduce((prev, current) => 
            prev.effect.value > current.effect.value ? prev : current
          );
          startingCoins = highestPerk.effect.value; // Use highest value
        }
      }
    }
    
    return startingCoins;
  };

  /**
   * Calculate global income multiplier from all sources
   */
  const calculateGlobalIncomeMultiplier = () => {
    let multiplier = 1.0;
    
    // Apply artifact global income multipliers
    if (state.ownedArtifacts.includes("artifact-6")) { // Crystal Matrix
      multiplier += 0.5; // 50% global income boost
      
      // Check for Crystal Matrix perks
      const matrixArtifact = state.artifacts.find(a => a.id === "artifact-6");
      if (matrixArtifact && matrixArtifact.perks) {
        const unlockedPerks = matrixArtifact.perks.filter(p => p.unlocked);
        if (unlockedPerks.length > 0) {
          // Get highest multiplier
          const highestPerk = unlockedPerks.reduce((prev, current) => 
            prev.effect.value > current.effect.value ? prev : current
          );
          multiplier += highestPerk.effect.value - 1; // Apply highest global boost
        }
      }
    }
    
    // Apply ability global income boosts
    if (state.abilities.find(a => a.id === "ability-3" && a.unlocked)) {
      multiplier += 0.4; // Neural Mining Matrix: +40% all income
    }
    if (state.abilities.find(a => a.id === "ability-6" && a.unlocked)) {
      multiplier += 0.45; // Dark Matter Attractor: +45% all income
    }
    if (state.abilities.find(a => a.id === "ability-10" && a.unlocked)) {
      multiplier += 0.55; // Interstellar Navigation AI: +55% global income
    }
    if (state.abilities.find(a => a.id === "ability-11" && a.unlocked)) {
      multiplier += 0.8; // Supernova Core Extractor: +80% all income
    }
    if (state.abilities.find(a => a.id === "ability-13" && a.unlocked)) {
      multiplier += 1.0; // Cosmic Singularity Engine: +100% all income
    }
    
    return multiplier;
  };

  /**
   * Calculate element-specific production multipliers
   */
  const calculateElementMultiplier = (elementId: string) => {
    let multiplier = 1.0;
    
    // Apply manager element boost
    state.ownedManagers.forEach(managerId => {
      const manager = state.managers.find(m => m.id === managerId);
      if (manager && manager.boosts && manager.boosts.includes(elementId)) {
        // Base boost is 50%
        let boostValue = 0.5;
        
        // Check if manager has perks that boost this element
        if (manager.perks) {
          const elementBoostPerks = manager.perks.filter(p => 
            p.unlocked && 
            p.effect.type === 'elementBoost' && 
            (!p.effect.elements || p.effect.elements.includes(elementId))
          );
          
          if (elementBoostPerks.length > 0) {
            // Find the highest element boost perk
            const highestPerk = elementBoostPerks.reduce((prev, current) => 
              prev.effect.value > current.effect.value ? prev : current
            );
            
            // Replace base boost with perk boost
            boostValue = highestPerk.effect.value;
          }
        }
        
        multiplier += boostValue;
      }
    });
    
    return multiplier;
  };

  /**
   * Calculate critical hit chance and multiplier
   */
  const calculateCriticalStats = () => {
    let critChance = 0;
    let critMultiplier = 5; // Default crit multiplier
    
    // Apply ability-5 (Laser-Guided Extraction) critical hit chance
    if (state.abilities.find(a => a.id === "ability-5" && a.unlocked)) {
      critChance = 0.15; // 15% chance of critical strike
    }
    
    return { critChance, critMultiplier };
  };

  return {
    getElementName,
    getHighestUnlockedPerkValue,
    formatEffectDescription,
    calculateTapMultiplier,
    calculatePassiveIncomeMultiplier,
    calculateCostReduction,
    calculateEssenceMultiplier,
    calculateStartingCoins,
    calculateGlobalIncomeMultiplier,
    calculateElementMultiplier,
    calculateCriticalStats
  };
};
