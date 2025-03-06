
import React from 'react';
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useGame } from '@/context/GameContext';
import { managers } from '@/utils/managersData';
import { formatNumber } from '@/utils/gameLogic';
import AbilityButton from './AbilityButton';
import { Sparkles } from 'lucide-react';

const Managers: React.FC = () => {
  const { state, unlockManagerAbility } = useGame();
  
  return (
    <div className="w-full max-w-md mx-auto pb-8">
      <div className="flex items-center justify-center gap-2 mb-4">
        <h2 className="text-lg font-medium text-center text-slate-100">Element Managers</h2>
        <div className="flex items-center gap-1 px-2 py-1 bg-indigo-900/30 rounded-full">
          <Sparkles size={14} className="text-yellow-300" />
          <span className="text-xs font-medium text-yellow-300">{state.skillPoints}</span>
        </div>
      </div>
      
      <div className="space-y-4">
        {managers.map((manager, index) => {
          const isOwned = state.ownedManagers.includes(manager.id);
          
          // Get abilities for this manager
          const managerAbilities = state.managerAbilities.filter(a => a.managerId === manager.id);
          
          return (
            <div 
              key={manager.id}
              className={`bg-slate-800/40 backdrop-blur-sm rounded-xl border ${isOwned ? 'border-indigo-500/40' : 'border-slate-700/40'} p-4 transition-all
                ${!isOwned ? 'opacity-50' : 'hover:shadow-md hover:shadow-indigo-500/20'}`}
              style={{ 
                animationDelay: `${index * 0.1}s`,
                transform: `translateY(${isOwned ? '0' : '0'}px)`,
                transition: 'all 0.3s ease'
              }}
            >
              <div className="flex items-start gap-4">
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
                
                {isOwned && (
                  <div className="flex flex-col items-center gap-2">
                    {managerAbilities.map((ability) => (
                      <AbilityButton
                        key={ability.id}
                        id={ability.id}
                        name={ability.name}
                        description={ability.description}
                        cost={ability.cost}
                        icon={ability.icon}
                        unlocked={ability.unlocked}
                        onUnlock={unlockManagerAbility}
                        canAfford={state.skillPoints >= ability.cost}
                      />
                    ))}
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default Managers;
