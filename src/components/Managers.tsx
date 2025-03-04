
import React from 'react';
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useGame } from '@/context/GameContext';
import { managers } from '@/utils/managersData';
import { formatNumber } from '@/utils/gameLogic';

const Managers: React.FC = () => {
  const { state } = useGame();
  
  return (
    <div className="w-full max-w-md mx-auto pb-8">
      <h2 className="text-lg font-medium mb-4 text-center text-slate-100">Element Managers</h2>
      
      <div className="space-y-4">
        {managers.map((manager, index) => {
          const isOwned = state.ownedManagers.includes(manager.id);
          
          return (
            <div 
              key={manager.id}
              className={`bg-slate-800/40 backdrop-blur-sm rounded-xl border ${isOwned ? 'border-indigo-500/40' : 'border-slate-700/40'} p-4 flex items-start gap-4 transition-all
                ${!isOwned ? 'opacity-50' : 'hover:shadow-md hover:shadow-indigo-500/20'}`}
              style={{ 
                animationDelay: `${index * 0.1}s`,
                transform: `translateY(${isOwned ? '0' : '0'}px)`,
                transition: 'all 0.3s ease'
              }}
            >
              <Avatar className="h-16 w-16 rounded-xl border-2 border-indigo-500/30 shadow-lg shadow-indigo-500/10">
                <AvatarImage src={manager.avatar} alt={manager.name} />
                <AvatarFallback className="bg-indigo-900/50 text-indigo-300 rounded-xl">
                  {manager.name.substring(0, 2)}
                </AvatarFallback>
              </Avatar>
              
              <div className="flex-1">
                <div className="flex justify-between items-start">
                  <h3 className="font-bold text-slate-100">{manager.name}</h3>
                </div>
                <p className="text-sm text-slate-300 mt-1">{manager.description}</p>
                <p className="text-xs text-indigo-400 mt-2 font-medium">
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
