import React from 'react';
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useGame } from '@/context/GameContext';
import PerkButton from './PerkButton';
import { artifacts } from '@/utils/artifactsData';
import { useBoostManager } from '@/hooks/useBoostManager';
import { 
  Beaker, Star, Diamond, Sparkles, Flame, Sun, Bird, Wind, Zap, Music, Globe,
  Gem, Pickaxe, Book, Banknote, Eye, CloudLightning, RefreshCw, Cloud,
  Waves, CircleDot, PawPrint, Wrench, Moon
} from 'lucide-react';

const ArtifactsTab: React.FC = () => {
  const { state, unlockPerk } = useGame();
  const { getHighestUnlockedPerkValue, formatEffectDescription } = useBoostManager();

  const perkIconMap = new Map<string, React.ReactNode>([
    ["artifact-1-perk-1", <Sparkles size={16} className="text-purple-500" />],
    ["artifact-1-perk-2", <Flame size={16} className="text-purple-500" />],
    ["artifact-1-perk-3", <Sun size={16} className="text-purple-500" />],
    ["artifact-2-perk-1", <Bird size={16} className="text-purple-500" />],
    ["artifact-2-perk-2", <Wind size={16} className="text-purple-500" />],
    ["artifact-2-perk-3", <Zap size={16} className="text-purple-500" />],
    ["artifact-3-perk-1", <Star size={16} className="text-purple-500" />],
    ["artifact-3-perk-2", <Music size={16} className="text-purple-500" />],
    ["artifact-3-perk-3", <Globe size={16} className="text-purple-500" />],
    ["artifact-4-perk-1", <Gem size={16} className="text-purple-500" />],
    ["artifact-4-perk-2", <Pickaxe size={16} className="text-purple-500" />],
    ["artifact-4-perk-3", <Book size={16} className="text-purple-500" />],
    ["artifact-5-perk-1", <Diamond size={16} className="text-purple-500" />],
    ["artifact-5-perk-2", <Eye size={16} className="text-purple-500" />],
    ["artifact-5-perk-3", <Banknote size={16} className="text-purple-500" />],
    ["artifact-6-perk-1", <Zap size={16} className="text-purple-500" />],
    ["artifact-6-perk-2", <PawPrint size={16} className="text-purple-500" />], // Replaced Horse with PawPrint
    ["artifact-6-perk-3", <CloudLightning size={16} className="text-purple-500" />],
    ["artifact-7-perk-1", <Flame size={16} className="text-purple-500" />],
    ["artifact-7-perk-2", <Bird size={16} className="text-purple-500" />],
    ["artifact-7-perk-3", <RefreshCw size={16} className="text-purple-500" />],
    ["artifact-8-perk-1", <Cloud size={16} className="text-purple-500" />],
    ["artifact-8-perk-2", <Waves size={16} className="text-purple-500" />],
    ["artifact-8-perk-3", <CircleDot size={16} className="text-purple-500" />],
    ["artifact-9-perk-1", <PawPrint size={16} className="text-purple-500" />],
    ["artifact-9-perk-2", <Pickaxe size={16} className="text-purple-500" />],
    ["artifact-9-perk-3", <Wrench size={16} className="text-purple-500" />],
    ["artifact-10-perk-1", <Moon size={16} className="text-purple-500" />],
    ["artifact-10-perk-2", <PawPrint size={16} className="text-purple-500" />], // Replaced Horse with PawPrint
    ["artifact-10-perk-3", <Star size={16} className="text-purple-500" />],
  ]);

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
                    <Diamond size={24} />
                  ) : artifact.id.includes("artifact-2") ? (
                    <Star size={24} />
                  ) : (
                    <Beaker size={24} />
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
                  {artifact.perks.map((perk, index) => (
                    <PerkButton 
                      key={perk.id}
                      perk={perk}
                      parentId={artifact.id}
                      onUnlock={unlockPerk}
                      disabled={!isOwned}
                      icon={perkIconMap.get(perk.id)}
                      perkIndex={index}
                      parentPerks={artifact.perks}
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