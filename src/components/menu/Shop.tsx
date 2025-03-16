
import React from 'react';
import { DialogClose, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { formatNumber } from '@/utils/gameLogic';
import { Sparkles } from 'lucide-react';
import ShopItem from './ShopItem';
import ArtifactShopItem from './ArtifactShopItem';
import { GameStateType } from '@/utils/GameTypes';

interface ShopProps {
  essence: number;
  managers: any[];
  artifacts: any[];
  ownedManagers: string[];
  ownedArtifacts: string[];
  onBuyManager: (managerId: string, name: string) => void;
  onBuyArtifact: (artifactId: string, name: string) => void;
}

const Shop: React.FC<ShopProps> = ({ 
  essence, 
  managers, 
  artifacts, 
  ownedManagers, 
  ownedArtifacts, 
  onBuyManager, 
  onBuyArtifact 
}) => {
  return (
    <>
      <DialogHeader className="p-4 border-b border-indigo-500/20">
        <div className="flex items-center justify-between">
          <DialogTitle className="text-xl">Essence Shop</DialogTitle>
          <div className="flex items-center gap-1 bg-purple-900/30 px-3 py-1 rounded-full border border-purple-500/30">
            <Sparkles size={16} className="text-purple-400" />
            <span className="font-medium text-purple-200">{formatNumber(essence)}</span>
          </div>
        </div>
        <DialogDescription className="text-slate-400 mt-1">
          Spend essence to unlock powerful managers and artifacts
        </DialogDescription>
      </DialogHeader>

      <Tabs defaultValue="managers" className="w-full">
        <div className="px-4 pt-3">
          <TabsList className="w-full bg-slate-800/50 border border-slate-700/50">
            <TabsTrigger value="managers" className="w-1/2">Managers</TabsTrigger>
            <TabsTrigger value="artifacts" className="w-1/2">Artifacts</TabsTrigger>
          </TabsList>
        </div>
        
        <ScrollArea className="h-[50vh]">
          <TabsContent value="managers" className="px-4 py-3 space-y-3">
            {managers.map((manager) => (
              <ShopItem
                key={manager.id}
                item={manager}
                isOwned={ownedManagers.includes(manager.id)}
                canAfford={essence >= manager.cost}
                onBuy={() => onBuyManager(manager.id, manager.name)}
              />
            ))}
            {managers.length === 0 && (
              <div className="text-center py-12 text-slate-500">
                <p>No managers available</p>
              </div>
            )}
          </TabsContent>
          
          <TabsContent value="artifacts" className="px-4 py-3 space-y-3">
            {artifacts.map((artifact) => (
              <ArtifactShopItem
                key={artifact.id}
                artifact={artifact}
                isOwned={ownedArtifacts.includes(artifact.id)}
                canAfford={essence >= artifact.cost}
                onBuy={() => onBuyArtifact(artifact.id, artifact.name)}
              />
            ))}
            {artifacts.length === 0 && (
              <div className="text-center py-12 text-slate-500">
                <p>No artifacts available</p>
              </div>
            )}
          </TabsContent>
        </ScrollArea>
        
        <div className="p-4 border-t border-indigo-500/20 mt-3">
          <DialogClose className="w-full bg-slate-700/80 text-slate-200 py-3 px-4 rounded-lg font-medium hover:bg-slate-600 transition-colors">
            Back
          </DialogClose>
        </div>
      </Tabs>
    </>
  );
};

export default Shop;
