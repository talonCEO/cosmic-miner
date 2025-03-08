import React from 'react';
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useGame } from '@/context/GameContext';
import PerkButton from './PerkButton';
import { artifacts } from '@/utils/artifactsData';
import { useBoostManager } from '@/hooks/useBoostManager';
import { 
  Beaker, 
  Star, 
  Diamond,
  Zap,
  DollarSign,
  BarChart,
  Clock,
  Shield,
  TrendingUp,
  Battery,
  Gem,
  Sparkles,
  Trophy,
  Settings,
  Users,
  Lightbulb,
  Brain,
  Heart,
} from 'lucide-react';

const ArtifactsTab: React.FC = () => {
  const { state, unlockPerk } = useGame();
  const { getHighestUnlockedPerkValue, formatEffectDescription } = useBoostManager();
  
  // Define a list of icons with random colors for perks
  const perkIcons = [
    <Zap size={16} className="text-yellow-400" />,
    <DollarSign size={16} className="text-green-500" />,
    <BarChart size={16} className="text-blue-400" />,
    <Clock size={16} className="text-amber-300" />,
    <Shield size={16} className="text-red-400" />,
    <Star size={16} className="text-purple-500" />,
    <TrendingUp size={16} className="text-indigo-400" />,
    <Battery size={16} className="text-cyan-300" />,
    <Gem size={16} className="text-teal-400" />,
    <Sparkles size={16} className="text-amber-400" />,
    <Trophy size={16} className="text-yellow-500" />,
    <Settings size={16} className="text-gray-400" />,
    <Users size={16} className="text-green-300" />,
    <Lightbulb size={16} className="text-orange-400" />,
    <Brain size={16} className="text-blue-500" />,
    <Heart size={16} className="text-pink-400" />,
  ];

  // Flatten all perks across all artifacts and assign icons
  const allPerks = artifacts.flatMap(artifact => 
    artifact.perks ? artifact.perks.map(perk => ({ ...perk, artifactId: artifact.id })) : []
  );
  
  // Create a mapping of perk IDs to icons
  const perkIconMap = new Map<string, React.ReactNode>();
  allPerks.forEach((perk, index) => {
    perkIconMap.set(perk.id, perkIcons[index % perkIcons.length]);
  });
  
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
                  {artifact.perks.map(perk => (
                    <PerkButton 
                      key={perk.id}
                      perk={perk}
                      parentId={artifact.id}
                      onUnlock={unlockPerk}
                      disabled={!isOwned}
                      icon={perkIconMap.get(perk.id)} // Assign unique icon
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
