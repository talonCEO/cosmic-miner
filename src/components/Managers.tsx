
import React from 'react';
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useGame } from '@/context/GameContext';
import { managers } from '@/utils/managersData';
import { formatNumber } from '@/utils/gameLogic';

const Managers: React.FC = () => {
  const { state } = useGame();
  
  return (
    <div className="w-full max-w-md mx-auto pb-8">
      <h2 className="text-lg font-medium mb-4 text-center">Element Managers</h2>
      
      <div className="space-y-3">
        {managers.map((manager, index) => {
          const isOwned = state.ownedManagers.includes(manager.id);
          
          return (
            <div 
              key={manager.id}
              className={`bg-white rounded-xl border border-slate-200 p-4 flex items-start gap-4 transition-all
                ${!isOwned ? 'opacity-50' : 'hover:shadow-md'}`}
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
                </div>
                <p className="text-sm text-slate-500 mt-1">{manager.description}</p>
                <p className="text-xs text-indigo-500 mt-2">
                  {manager.bonus}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default Managers;
