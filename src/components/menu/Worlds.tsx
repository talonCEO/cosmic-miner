
import React from 'react';
import { useGame } from '@/context/GameContext';
import { Button } from "@/components/ui/button";
import { Check, Lock, Navigation } from "lucide-react";
import { toast } from '@/components/ui/use-toast';

interface WorldsProps {
  setMenuType: (menuType: string) => void;
}

const Worlds: React.FC<WorldsProps> = ({ setMenuType }) => {
  const { state, changeWorld } = useGame();
  
  const handleWorldChange = (worldId: number) => {
    if (worldId === state.currentWorld) {
      return;
    }
    
    if (!state.worlds[worldId - 1].unlocked) {
      toast({
        title: "World Locked",
        description: `You need to unlock 75% of element upgrades in your current world first.`,
        variant: "destructive",
      });
      return;
    }
    
    toast({
      title: `Traveling to ${state.worlds[worldId - 1].name}`,
      description: "Your progress in the previous world has been reset, but you keep your multiplier!",
    });
    
    changeWorld(worldId);
    setMenuType("main");
  };
  
  return (
    <div className="space-y-6 px-6 py-4">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-center w-full">Worlds</h2>
        <Button variant="ghost" className="absolute right-4" onClick={() => setMenuType("main")}>
          ×
        </Button>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {state.worlds.map((world) => (
          <div 
            key={world.id}
            className={`
              relative p-4 rounded-lg cursor-pointer transition-all
              ${world.unlocked ? 'bg-indigo-900/60 hover:bg-indigo-800/80' : 'bg-gray-800/50 cursor-not-allowed'}
              ${world.id === state.currentWorld ? 'border-2 border-green-500' : 'border border-indigo-500/30'}
            `}
            onClick={() => handleWorldChange(world.id)}
          >
            <div className="flex justify-between items-start">
              <div>
                <h3 className="font-bold text-lg">{world.name}</h3>
                <p className="text-sm text-gray-300 mt-1">{world.description}</p>
                <p className="text-sm text-indigo-300 mt-2">
                  Income Multiplier: <span className="font-medium">×{world.multiplier.toFixed(1)}</span>
                </p>
              </div>
              
              <div className="ml-4 flex-shrink-0">
                {world.id === state.currentWorld ? (
                  <div className="h-8 w-8 rounded-full bg-green-500/20 flex items-center justify-center">
                    <Check className="h-5 w-5 text-green-500" />
                  </div>
                ) : world.unlocked ? (
                  <div className="h-8 w-8 rounded-full bg-indigo-500/20 flex items-center justify-center">
                    <Navigation className="h-5 w-5 text-indigo-400" />
                  </div>
                ) : (
                  <div className="h-8 w-8 rounded-full bg-gray-700/50 flex items-center justify-center">
                    <Lock className="h-5 w-5 text-gray-500" />
                  </div>
                )}
              </div>
            </div>
            
            {world.id === state.currentWorld && (
              <div className="absolute -top-2 -right-2 bg-green-500 text-white text-xs px-2 py-1 rounded-full">
                Current
              </div>
            )}
            
            {!world.unlocked && (
              <div className="absolute inset-0 bg-black/60 rounded-lg flex items-center justify-center">
                <div className="text-center">
                  <Lock className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                  <p className="text-sm text-gray-400">Unlock 75% of upgrades in your current world</p>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
      
      <div className="text-sm text-gray-400 text-center mt-4">
        <p>Changing worlds resets your elemental upgrades but keeps your multiplier.</p>
        <p>Each world gives an additional multiplier to your income.</p>
      </div>
    </div>
  );
};

export default Worlds;
