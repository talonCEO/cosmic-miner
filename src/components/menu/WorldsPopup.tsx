import React from 'react';
import { DialogHeader, DialogTitle, DialogDescription, DialogClose } from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useGame } from '@/context/GameContext';
import { MenuType } from './types';
import WorldItem from './WorldItem';

interface WorldsPopupProps {
  setMenuType: (menuType: MenuType) => void;
}

const WorldsPopup: React.FC<WorldsPopupProps> = ({ setMenuType }) => {
  const { state, travelToWorld } = useGame();

  return (
    <>
      <DialogHeader className="p-4 border-b border-indigo-500/20">
        <DialogTitle className="text-center text-xl">Worlds</DialogTitle>
        <DialogDescription className="text-center text-slate-300">
          Travel to different worlds to mine unique resources.
        </DialogDescription>
      </DialogHeader>
      <ScrollArea className="h-[50vh]">
        <div className="flex flex-col p-4 gap-3">
          {state.worlds.map((world) => (
            <WorldItem
              key={world.id}
              world={world}
              isCurrent={state.currentWorld === world.id}
              onTravel={() => travelToWorld(world.id)}
            />
          ))}
        </div>
      </ScrollArea>
      <div className="p-4 border-t border-indigo-500/20">
        <DialogClose className="w-full bg-slate-700/80 text-slate-200 py-3 px-4 rounded-lg font-medium hover:bg-slate-600 transition-colors">
          Back
        </DialogClose>
      </div>
    </>
  );
};

export default WorldsPopup;