
import { useGame } from '@/context/GameContext';
import { formatNumber } from '@/utils/gameLogic';
import { isBoostItem } from '@/components/menu/types';
import { Timer, Zap, DollarSign, ArrowTrendingUp, Percent, Star } from 'lucide-react';

/**
 * Centralized hook for managing all boosts in the game
 */
export const useBoostManager = () => {
  const { state, calculateTotalCoinsPerSecond } = useGame();
  
  /**
   * Calculate total tap/click multiplier from all sources
   */
  const calculateTapMultiplier = (): number => {
    let multiplier = 1;
    
    // Check for tap multiplier boosts
    const tapBoost = state.activeBoosts.find(boost => boost.type === 'tapMultiplier' && boost.remainingUses && boost.remainingUses > 0);
    if (tapBoost) {
      multiplier *= tapBoost.value;
    }
    
    // Add abilities and other sources
    const abilities = state.abilities.filter(a => a.unlocked);
    abilities.forEach(ability => {
      // Apply ability bonuses (this would be based on your game design)
      if (ability.id === 'ability-2' && ability.unlocked) multiplier *= 1.5;
      if (ability.id === 'ability-5' && ability.unlocked) multiplier *= 1.15;
      if (ability.id === 'ability-8' && ability.unlocked) multiplier *= 1.85;
      if (ability.id === 'ability-11' && ability.unlocked) multiplier *= 2.2;
    });
    
    return multiplier;
  };
  
  /**
   * Calculate total global income multiplier from all sources
   */
  const getGlobalIncomeMultiplier = (): number => {
    let multiplier = 1;
    
    // Check for global multiplier boosts
    const coinMultiplierBoost = state.activeBoosts.find(boost => boost.type === 'coinMultiplier');
    if (coinMultiplierBoost) {
      multiplier *= coinMultiplierBoost.value;
    }
    
    // Add other global multipliers
    multiplier *= state.incomeMultiplier;
    
    return multiplier;
  };
  
  /**
   * Calculate total cost reduction from all sources
   */
  const calculateTotalCostReduction = (): number => {
    let reduction = 1;
    
    // Check for cost reduction boosts
    const costReductionBoost = state.activeBoosts.find(boost => boost.type === 'costReduction');
    if (costReductionBoost) {
      reduction *= costReductionBoost.value;
    }
    
    // Add abilities and other sources of cost reduction
    const abilities = state.abilities.filter(a => a.unlocked);
    abilities.forEach(ability => {
      // Apply ability bonuses (this would be based on your game design)
      if (ability.id === 'ability-3' && ability.unlocked) reduction *= 0.95;
      if (ability.id === 'ability-4' && ability.unlocked) reduction *= 0.85;
      if (ability.id === 'ability-9' && ability.unlocked) reduction *= 0.7;
      if (ability.id === 'ability-12' && ability.unlocked) reduction *= 0.55;
    });
    
    return reduction;
  };
  
  /**
   * Calculate total passive income multiplier from artifacts
   */
  const calculatePassiveIncomeMultiplier = (): number => {
    let multiplier = 1;
    
    // Add passive multipliers from artifacts and managers
    state.ownedArtifacts.forEach(artifactId => {
      const artifact = state.artifacts.find(a => a.id === artifactId);
      if (artifact && artifact.effect?.type === 'production') {
        multiplier += artifact.effect.value;
      }
    });
    
    // Apply ability bonuses
    const abilities = state.abilities.filter(a => a.unlocked);
    abilities.forEach(ability => {
      if (ability.id === 'ability-2' && ability.unlocked) multiplier *= 1.25;
      if (ability.id === 'ability-4' && ability.unlocked) multiplier *= 1.2;
      if (ability.id === 'ability-6' && ability.unlocked) multiplier *= 1.3;
      if (ability.id === 'ability-8' && ability.unlocked) multiplier *= 1.55;
      if (ability.id === 'ability-9' && ability.unlocked) multiplier *= 1.65;
      if (ability.id === 'ability-12' && ability.unlocked) multiplier *= 2;
    });
    
    return multiplier;
  };
  
  /**
   * Check if user has active boosts
   */
  const hasActiveBoosts = (): boolean => {
    return state.activeBoosts.length > 0;
  };
  
  /**
   * Get active boosts with remaining time for display
   */
  const getActiveBoostsInfo = () => {
    return state.activeBoosts.map(boost => {
      // Format remaining time
      let timeDisplay = '';
      if (boost.remainingTime) {
        const minutes = Math.floor(boost.remainingTime / 60);
        const seconds = Math.floor(boost.remainingTime % 60);
        timeDisplay = `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
      } else if (boost.remainingUses) {
        timeDisplay = `${boost.remainingUses} uses left`;
      } else {
        timeDisplay = 'Permanent';
      }
      
      // Get icon based on boost type
      let icon;
      switch (boost.type) {
        case 'coinMultiplier':
          icon = <DollarSign className="text-green-500" size={16} />;
          break;
        case 'autoTap':
          icon = <Zap className="text-yellow-500" size={16} />;
          break;
        case 'tapMultiplier':
          icon = <Zap className="text-purple-500" size={16} />;
          break;
        case 'costReduction':
          icon = <Percent className="text-blue-500" size={16} />;
          break;
        case 'essenceMultiplier':
          icon = <Star className="text-amber-500" size={16} />;
          break;
        default:
          icon = <ArrowTrendingUp className="text-indigo-500" size={16} />;
      }
      
      // Get formatted description
      let description = boost.description || '';
      if (boost.type === 'coinMultiplier') {
        description = `Income x${boost.value}`;
      } else if (boost.type === 'tapMultiplier') {
        description = `Tap x${boost.value}`;
      } else if (boost.type === 'costReduction') {
        description = `Costs -${Math.round((1 - boost.value) * 100)}%`;
      } else if (boost.type === 'autoTap') {
        description = `${boost.value} taps/sec`;
      } else if (boost.type === 'essenceMultiplier') {
        description = `Essence +${Math.round((boost.value - 1) * 100)}%`;
      } else if (boost.type === 'baseTapBoost') {
        description = `Tap +${boost.value} (Permanent)`;
      } else if (boost.type === 'basePassiveBoost') {
        description = `Passive +${boost.value} (Permanent)`;
      }
      
      return {
        id: boost.id,
        type: boost.type,
        description,
        timeRemaining: timeDisplay,
        icon: icon || boost.icon,
        remainingTime: boost.remainingTime,
        remainingUses: boost.remainingUses
      };
    });
  };
  
  /**
   * Get boost summary for stats display
   */
  const getBoostSummary = () => {
    return {
      tapMultiplier: calculateTapMultiplier(),
      incomeMultiplier: getGlobalIncomeMultiplier(),
      costReduction: calculateTotalCostReduction(),
      passiveMultiplier: calculatePassiveIncomeMultiplier(),
      totalCPS: calculateTotalCoinsPerSecond(state)
    };
  };
  
  return {
    calculateTapMultiplier,
    calculateGlobalIncomeMultiplier: getGlobalIncomeMultiplier,
    calculateTotalCostReduction,
    calculatePassiveIncomeMultiplier,
    hasActiveBoosts,
    getActiveBoostsInfo,
    getBoostSummary
  };
};

export default useBoostManager;
