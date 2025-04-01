import React from 'react';
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useGame } from '@/context/GameContext';
import { managers, getElementName } from '@/utils/managersData';
import { useBoostManager } from '@/hooks/useBoostManager';
import { formatNumber } from '@/utils/gameLogic';
import PerkButton from './PerkButton';
import { 
  UserCog, Briefcase, FlaskConical, Atom, Radiation, Leaf, Dna, Microscope,
  Wind, Flame, Filter, Cpu, Zap, Brain, Hammer, Thermometer, Wrench, Eye,
  Battery, Pickaxe, Shield, TestTube, Moon, RefreshCw, Globe, CircleDot, Sparkles, Star
} from 'lucide-react';

const Managers: React.FC = () => {
  const { state, unlockPerk } = useGame();
  const { getHighestUnlockedPerkValue } = useBoostManager();
  
  const handleUnlockPerk = (perkId: string, parentId: string) => {
    unlockPerk(perkId, parentId);
  };

  const perkIconMap = new Map<string, React.ReactNode>([
    ["manager-1-perk-1", <FlaskConical size={16} className="text-blue-500" />],
    ["manager-1-perk-2", <Atom size={16} className="text-blue-500" />],
    ["manager-1-perk-3", <Radiation size={16} className="text-blue-500" />],
    ["manager-2-perk-1", <Leaf size={16} className="text-blue-500" />],
    ["manager-2-perk-2", <Dna size={16} className="text-blue-500" />],
    ["manager-2-perk-3", <Microscope size={16} className="text-blue-500" />],
    ["manager-3-perk-1", <Wind size={16} className="text-blue-500" />],
    ["manager-3-perk-2", <Flame size={16} className="text-blue-500" />],
    ["manager-3-perk-3", <Filter size={16} className="text-blue-500" />],
    ["manager-4-perk-1", <Cpu size={16} className="text-blue-500" />],
    ["manager-4-perk-2", <Zap size={16} className="text-blue-500" />],
    ["manager-4-perk-3", <Brain size={16} className="text-blue-500" />],
    ["manager-5-perk-1", <Hammer size={16} className="text-blue-500" />],
    ["manager-5-perk-2", <Thermometer size={16} className="text-blue-500" />],
    ["manager-5-perk-3", <Wrench size={16} className="text-blue-500" />],
    ["manager-6-perk-1", <Eye size={16} className="text-blue-500" />],
    ["manager-6-perk-2", <Battery size={16} className="text-blue-500" />],
    ["manager-6-perk-3", <Pickaxe size={16} className="text-blue-500" />],
    ["manager-7-perk-1", <Shield size={16} className="text-blue-500" />],
    ["manager-7-perk-2", <TestTube size={16} className="text-blue-500" />],
    ["manager-7-perk-3", <Radiation size={16} className="text-blue-500" />],
    ["manager-8-perk-1", <Filter size={16} className="text-blue-500" />],
    ["manager-8-perk-2", <FlaskConical size={16} className="text-blue-500" />],
    ["manager-8-perk-3", <Sparkles size={16} className="text-blue-500" />],
    ["manager-9-perk-1", <Moon size={16} className="text-blue-500" />],
    ["manager-9-perk-2", <Zap size={16} className="text-blue-500" />],
    ["manager-9-perk-3", <Globe size={16} className="text-blue-500" />],
    ["manager-10-perk-1", <Star size={16} className="text-blue-500" />],
    ["manager-10-perk-2", <RefreshCw size={16} className="text-blue-500" />],
    ["manager-10-perk-3", <CircleDot size={16} className="text-blue-500" />],
  ]);

  return (
    <div className="w-full max-w-md mx-auto pb-8">
      <h2 className="text-lg font-medium mb-4 text-center text-slate-100">Element Managers</h2>
      
      <div className="space-y-4">
        {managers.map((manager) => {
          const isOwned = state.ownedManagers.includes(manager.id);
          const highestPerk = isOwned ? getHighestUnlockedPerkValue(manager.id) : null;
          
          let bonusDescription = manager.bonus;
          if (manager.boosts && manager.boosts.length > 0 && isOwned) {
            const boostedElements = manager.boosts.map(getElementName).join(' and ');
            const baseBoost = 0.5;
            const perkBoost = highestPerk && highestPerk.effect.type === "elementBoost" 
              ? highestPerk.effect.value 
              : 0;
            const totalBoostPercentage = (baseBoost + perkBoost) * 100;
            bonusDescription = `Increases ${boostedElements} production by ${formatNumber(totalBoostPercentage)}%`;
          }
          
          const shouldShowPerks = manager.perks && manager.id !== "manager-default";
          
          return (
            <div 
              key={manager.id}
              className={`bg-slate-800/40 backdrop-blur-sm rounded-xl border 
                ${isOwned ? 'border-indigo-500/40' : 'border-slate-700/40'} 
                p-4 flex items-start gap-4 transition-all
                ${isOwned ? 'hover:shadow-md hover:shadow-indigo-500/20' : ''}
                ${isOwned ? 'opacity-100' : 'opacity-50'}`}
            >
              <Avatar className="h-16 w-16 rounded-xl border-2 border-indigo-500/30 shadow-lg shadow-indigo-500/10">
                <AvatarImage src={manager.avatar} alt={manager.name} />
                <AvatarFallback className="bg-indigo-900/50 text-indigo-300 rounded-xl">
                  {manager.id.includes("manager-1") ? (
                    <UserCog size={24} />
                  ) : (
                    <Briefcase size={24} />
                  )}
                </AvatarFallback>
              </Avatar>
              
              <div className="flex-1">
                <div className="flex justify-between items-start">
                  <h3 className="font-bold text-slate-100">{manager.name}</h3>
                </div>
                <p className="text-sm text-slate-300 mt-1">{manager.description}</p>
                <p className="text-xs text-indigo-400 mt-2 font-medium">
                  {bonusDescription}
                </p>
              </div>
              
              {shouldShowPerks && (
              <div className="flex flex-col items-center justify-center ml-auto">
                {manager.perks.map((perk, index) => (
                  <PerkButton 
                    key={perk.id}
                    perk={perk}
                    parentId={manager.id}
                    onUnlock={handleUnlockPerk}
                    disabled={!isOwned}
                    icon={perkIconMap.get(perk.id)}
                    perkIndex={index}
                    parentPerks={manager.perks}
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

export default Managers;