
import React from 'react';
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useGame } from '@/context/GameContext';
import { managers } from '@/utils/managersData';
import { formatNumber } from '@/utils/gameLogic';
import { ScrollArea } from "@/components/ui/scroll-area";

const Managers: React.FC = () => {
  const { state } = useGame();
  
  // For demonstration, we'll consider a manager as "owned" if the player has 
  // earned at least the manager's required coins
  const isOwned = (requiredCoins: number) => {
    return state.totalEarned >= requiredCoins;
  };
  
  return (
    <div className="w-full max-w-md mx-auto pb-8">
      <h2 className="text-lg font-medium mb-4 text-center">Element Managers</h2>
      
      <ScrollArea className="h-[400px] pr-4">
        <div className="space-y-3">
          {managers.map((manager, index) => (
            <div 
              key={manager.id}
              className={`bg-white rounded-xl border border-slate-200 p-4 flex items-start gap-4 transition-all
                ${!isOwned(manager.requiredCoins) ? 'opacity-50' : 'hover:shadow-md'}`}
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              <Avatar className="h-16 w-16 rounded-xl">
                <AvatarImage src={manager.avatar} alt={manager.name} />
                <AvatarFallback className="bg-indigo-100 text-indigo-500 rounded-xl">
                  {manager.name.substring(0, 2)}
                </AvatarFallback>
              </Avatar>
              
              <div className="flex-1">
                <div className="flex justify-between items-start">
                  <h3 className="font-bold text-slate-800">{manager.name}</h3>
                  {!isOwned(manager.requiredCoins) && (
                    <span className="text-xs bg-slate-100 px-2 py-1 rounded-full">
                      {formatNumber(manager.requiredCoins)} coins
                    </span>
                  )}
                </div>
                <p className="text-sm text-slate-500 mt-1">{manager.description}</p>
                <p className="text-xs text-indigo-500 mt-2">
                  {manager.bonus}
                </p>
              </div>
            </div>
          ))}
        </div>
      </ScrollArea>
    </div>
  );
};

export default Managers;
