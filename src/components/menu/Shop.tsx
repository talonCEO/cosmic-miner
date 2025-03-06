
import React from 'react';
import { Sparkles } from 'lucide-react';
import { DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { formatNumber } from '@/utils/gameLogic';
import ShopItem from './ShopItem';
import ArtifactShopItem from './ArtifactShopItem';
import { Manager } from '@/utils/managersData';
import { GameState } from '@/context/GameContext';
import { ScrollArea } from "@/components/ui/scroll-area";
import { ManagerAbility, ArtifactAbility } from '@/utils/types';

interface ShopProps {
  essence: number;
  managers: Manager[];
  artifacts: GameState['artifacts'];
  ownedManagers: string[];
  ownedArtifacts: string[];
  managerAbilities: ManagerAbility[];
  artifactAbilities: ArtifactAbility[];
  skillPoints: number;
  onBuyManager: (managerId: string, name: string) => void;
  onBuyArtifact: (artifactId: string, name: string) => void;
  onUnlockManagerAbility: (abilityId: string) => void;
  onUnlockArtifactAbility: (abilityId: string) => void;
}

const Shop: React.FC<ShopProps> = ({ 
  essence, 
  managers, 
  artifacts, 
  ownedManagers, 
  ownedArtifacts,
  managerAbilities,
  artifactAbilities,
  skillPoints,
  onBuyManager, 
  onBuyArtifact,
  onUnlockManagerAbility,
  onUnlockArtifactAbility
}) => {
  return (
    <>
      <DialogHeader className="p-4 border-b border-indigo-500/20">
        <DialogTitle className="text-xl">Shop</DialogTitle>
      </DialogHeader>
      
      <ScrollArea className="h-[60vh]">
        <div className="p-4">
          <div className="flex items-center justify-between mb-4 bg-indigo-900/30 rounded-lg p-2">
            <div className="flex items-center">
              <Sparkles size={16} className="text-purple-400 mr-1" />
              <p className="font-medium text-purple-300">{formatNumber(essence)} Essence Available</p>
            </div>
            <div className="flex items-center">
              <Sparkles size={16} className="text-yellow-300 mr-1" />
              <p className="font-medium text-yellow-300">{skillPoints} Skill Points</p>
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-3">
              <h3 className="font-semibold text-center border-b border-indigo-500/30 pb-1">Managers</h3>
              {managers.map(manager => {
                const isOwned = ownedManagers.includes(manager.id);
                const canAfford = essence >= manager.cost;
                const managerSpecificAbilities = managerAbilities.filter(a => a.managerId === manager.id);
                
                return (
                  <ShopItem
                    key={manager.id}
                    id={manager.id}
                    name={manager.name}
                    description={manager.description}
                    bonus={manager.bonus}
                    avatar={manager.avatar}
                    cost={manager.cost}
                    isOwned={isOwned}
                    canAfford={canAfford}
                    onBuy={() => onBuyManager(manager.id, manager.name)}
                    abilities={managerSpecificAbilities}
                    skillPoints={skillPoints}
                    onUnlockAbility={onUnlockManagerAbility}
                  />
                );
              })}
            </div>
            
            <div className="space-y-3">
              <h3 className="font-semibold text-center border-b border-indigo-500/30 pb-1">Artifacts</h3>
              {artifacts.map(artifact => {
                const isOwned = ownedArtifacts.includes(artifact.id);
                const canAfford = essence >= artifact.cost;
                const artifactSpecificAbilities = artifactAbilities.filter(a => a.artifactId === artifact.id);
                
                return (
                  <ArtifactShopItem
                    key={artifact.id}
                    id={artifact.id}
                    name={artifact.name}
                    description={artifact.description}
                    bonus={artifact.bonus}
                    avatar={artifact.avatar}
                    cost={artifact.cost}
                    isOwned={isOwned}
                    canAfford={canAfford}
                    onBuy={() => onBuyArtifact(artifact.id, artifact.name)}
                    abilities={artifactSpecificAbilities}
                    skillPoints={skillPoints}
                    onUnlockAbility={onUnlockArtifactAbility}
                  />
                );
              })}
            </div>
          </div>
        </div>
      </ScrollArea>
    </>
  );
};

export default Shop;
