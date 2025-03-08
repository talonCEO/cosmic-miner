
import React from 'react';
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useGame } from '@/context/GameContext';
import PerkButton from './PerkButton';
import { artifacts } from '@/utils/artifactsData';
import { useBoostManager } from '@/hooks/useBoostManager';

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
  const { getHighestUnlockedPerkValue, formatEffectDescription } = useBoostManager();
  
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
          
          // Check if artifact has any unlocked perks
          const hasUnlockedPerks = isOwned && artifact.perks && artifact.perks.some(p => p.unlocked);
          
          return (
            <div 
              key={artifact.id}
              className={`bg-slate-800/40 backdrop-blur-sm rounded-xl border 
                ${isOwned ? 'border-purple-500/40' : 'border-slate-700/40'} 
                p-4 flex items-start gap-4 transition-all
                ${isOwned ? 'hover:shadow-md hover:shadow-purple-500/20' : ''}
                ${isOwned ? 'opacity-100' : 'opacity-50'}`}
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
