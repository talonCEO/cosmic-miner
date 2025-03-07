
import React from 'react';
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useGame } from '@/context/GameContext';
import PerkButton from './PerkButton';
import { artifacts } from '@/utils/artifactsData';

/**
 * ArtifactsTab Component
 * 
 * Displays all artifacts available in the game, both owned and unowned.
 * For owned artifacts, displays their perks that can be unlocked with skill points.
 * 
 * Artifacts provide special bonuses that affect gameplay in various ways:
 * - Production multipliers
 * - Tap value increases
 * - Essence rewards
 * - Cost reductions
 * - Starting coins after prestige
 */
const ArtifactsTab: React.FC = () => {
  const { state, unlockPerk } = useGame();
  
  // Function to get the most powerful unlocked perk
  const getHighestUnlockedPerkValue = (artifactId: string) => {
    const artifact = state.artifacts.find(a => a.id === artifactId);
    if (!artifact || !artifact.perks) return null;
    
    const unlockedPerks = artifact.perks.filter(p => p.unlocked);
    if (unlockedPerks.length === 0) return null;
    
    // Return the highest value perk
    return unlockedPerks.reduce((prev, current) => 
      prev.effect.value > current.effect.value ? prev : current
    );
  };
  
  // Function to format effect description based on perk
  const formatEffectDescription = (artifact, highestPerk = null) => {
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
  
  return (
    <div className="w-full max-w-md mx-auto pb-8">
      <h2 className="text-lg font-medium mb-4 text-center text-slate-100">Powerful Artifacts</h2>
      
      <div className="space-y-4">
        {artifacts.map((artifact, index) => {
          const isOwned = state.ownedArtifacts.includes(artifact.id);
          
          // Get the highest unlocked perk if any
          const highestPerk = isOwned ? getHighestUnlockedPerkValue(artifact.id) : null;
          
          // Get the actual effect description based on the artifact's effect type and highest perk
          const effectDescription = formatEffectDescription(artifact, highestPerk);
          
          return (
            <div 
              key={artifact.id}
              className={`bg-slate-800/40 backdrop-blur-sm rounded-xl border ${isOwned ? 'border-purple-500/40' : 'border-slate-700/40'} p-4 flex items-start gap-4 transition-all
                ${!isOwned ? 'opacity-50' : 'hover:shadow-md hover:shadow-purple-500/20'}`}
            >
              {/* Artifact Avatar */}
              <Avatar className="h-16 w-16 rounded-xl border-2 border-purple-500/30 shadow-lg shadow-purple-500/10">
                <AvatarImage src={artifact.avatar} alt={artifact.name} />
                <AvatarFallback className="bg-purple-900/50 text-purple-300 rounded-xl">
                  {artifact.name.substring(0, 2)}
                </AvatarFallback>
              </Avatar>
              
              {/* Artifact Info */}
              <div className="flex-1">
                <div className="flex justify-between items-start">
                  <h3 className="font-bold text-slate-100">{artifact.name}</h3>
                </div>
                <p className="text-sm text-slate-300 mt-1">{artifact.description}</p>
                <p className="text-xs text-purple-400 mt-2 font-medium">
                  {effectDescription}
                </p>
              </div>
              
              {/* Perk Buttons - Show for all artifacts that have perks, not just owned ones */}
              {artifact.perks && artifact.id !== "artifact-default" && (
                <div className="flex flex-col items-center justify-center ml-auto">
                  {artifact.perks.map(perk => (
                    <PerkButton 
                      key={perk.id}
                      perk={perk}
                      parentId={artifact.id}
                      onUnlock={unlockPerk}
                      disabled={!isOwned}
                    />
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default ArtifactsTab;
