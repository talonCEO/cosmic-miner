import React from 'react';
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useGame } from '@/context/GameContext';
import PerkButton from './PerkButton';
import { artifacts } from '@/utils/artifactsData';
import { useBoostManager } from '@/hooks/useBoostManager';
import Artifact1Icon from '@/assets/images/icons/perk1.png';
import Artifact2Icon from '@/assets/images/icons/perk2.png';
import Artifact3Icon from '@/assets/images/icons/perk3.png';

const ArtifactsTab: React.FC = () => {
  const { state, unlockPerk } = useGame();
  const { getHighestUnlockedPerkValue, formatEffectDescription } = useBoostManager();
  
  const handleUnlockPerk = (perkId: string, parentId: string) => {
    unlockPerk(perkId, parentId);
  };
  
  return (
    <div className="w-full max-w-md mx-auto pb-8">
      <h2 className="text-lg font-medium mb-4 text-center text-slate-100">Powerful Artifacts</h2>
      
      <div className="space-y-4">
        {artifacts.map((artifact) => {
          const isOwned = state.ownedArtifacts.includes(artifact.id);
          const highestPerk = isOwned ? getHighestUnlockedPerkValue(artifact.id) : null;
          const effectDescription = formatEffectDescription(artifact, highestPerk);
          
          return (
            <div 
              key={artifact.id}
              className={`bg-slate-800/40 backdrop-blur-sm rounded-xl border 
                ${isOwned ? 'border-purple-500/40' : 'border-slate-700/40'} 
                p-4 flex items-start gap-4 transition-all
                ${isOwned ? 'hover:shadow-md hover:shadow-purple-500/20' : ''}
                ${isOwned ? 'opacity-100' : 'opacity-50'}`}
            >
              <Avatar className="h-16 w-16 rounded-xl border-2 border-purple-500/30 shadow-lg shadow-purple-500/10">
                <AvatarImage src={artifact.avatar} alt={artifact.name} />
                <AvatarFallback className="bg-purple-900/50 text-purple-300 rounded-xl">
                  {artifact.id.includes("artifact-1") ? (
                    <img src={Artifact1Icon} alt="Artifact 1" className="w-6 h-6" />
                  ) : artifact.id.includes("artifact-2") ? (
                    <img src={Artifact2Icon} alt="Artifact 2" className="w-6 h-6" />
                  ) : (
                    <img src={Artifact3Icon} alt="Artifact 3" className="w-6 h-6" />
                  )}
                </AvatarFallback>
              </Avatar>
              
              <div className="flex-1">
                <div className="flex justify-between items-start">
                  <h3 className="font-bold text-slate-100">{artifact.name}</h3>
                </div>
                <p className="text-sm text-slate-300 mt-1">{artifact.description}</p>
                <p className="text-xs text-purple-400 mt-2 font-medium">
                  {effectDescription}
                </p>
              </div>
              
              {artifact.perks && artifact.id !== "artifact-default" && (
                <div className="flex flex-col items-center justify-center ml-auto">
                  {artifact.perks.map(perk => (
                    <PerkButton 
                      key={perk.id}
                      perk={perk}
                      parentId={artifact.id}
                      onUnlock={handleUnlockPerk}
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
