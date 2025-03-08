import React from 'react';
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useGame } from '@/context/GameContext';
import { managers } from '@/utils/managersData';
import { formatNumber } from '@/utils/gameLogic';
import PerkButton from './PerkButton';
import { useBoostManager } from '@/hooks/useBoostManager';
import { 
  UserCog, 
  Briefcase,
  Zap,          // Speed/energy
  DollarSign,   // Cost/money
  BarChart,     // Production
  Clock,        // Time/passive
  Shield,       // Protection
  Star,         // Special/bonus
  TrendingUp,   // Growth
  Battery,      // Energy
  Gem,          // Resources
  Sparkles,     // Enhancement
  Trophy,       // Achievement
  Settings,     // Optimization
  Users,        // Team
  Lightbulb,    // Innovation
  Brain,        // Intelligence
  Diamond,      // Premium
} from 'lucide-react';

const Managers: React.FC = () => {
  const { state, unlockPerk } = useGame();
  const { getElementName, getHighestUnlockedPerkValue } = useBoostManager();
  
  const handleUnlockPerk = (perkId: string, parentId: string) => {
    unlockPerk(perkId, parentId);
  };

  // Define a comprehensive list of unique icons with colors
  const perkIcons = [
    <Zap size={16} className="text-yellow-400" />,          // 0
    <DollarSign size={16} className="text-green-400" />,    // 1
    <BarChart size={16} className="text-blue-400" />,       // 2
    <Clock size={16} className="text-amber-400" />,         // 3
    <Shield size={16} className="text-red-400" />,          // 4
    <Star size={16} className="text-purple-400" />,         // 5
    <TrendingUp size={16} className="text-indigo-400" />,   // 6
    <Battery size={16} className="text-cyan-400" />,        // 7
    <Gem size={16} className="text-teal-400" />,            // 8
    <Sparkles size={16} className="text-amber-300" />,      // 9
    <Trophy size={16} className="text-gold-400" />,         // 10
    <Settings size={16} className="text-gray-400" />,       // 11
    <Users size={16} className="text-green-500" />,         // 12
    <Lightbulb size={16} className="text-yellow-300" />,    // 13
    <Brain size={16} className="text-blue-500" />,          // 14
    <Diamond size={16} className="text-purple-500" />,      // 15
  ];

  // Flatten all perks across all managers and assign icons
  const allPerks = managers.flatMap(manager => 
    manager.perks ? manager.perks.map(perk => ({ ...perk, managerId: manager.id })) : []
  );
  
  // Create a mapping of perk IDs to icons
  const perkIconMap = new Map<string, React.ReactNode>();
  allPerks.forEach((perk, index) => {
    perkIconMap.set(perk.id, perkIcons[index % perkIcons.length]);
  });
  
  return (
    <div className="w-full max-w-md mx-auto pb-8">
      <h2 className="text-lg font-medium mb-4 text-center text-slate-100">Element Managers</h2>
      
      <div className="space-y-4">
        {managers.map((manager) => {
          const isOwned = state.ownedManagers.includes(manager.id);
          const highestPerk = isOwned ? getHighestUnlockedPerkValue(manager.id) : null;
          
          let bonusDescription = manager.bonus;
          if (manager.boosts && manager.boosts.length > 0) {
            const boostedElements = manager.boosts.map(getElementName).join(' and ');
            const boostValue = highestPerk && highestPerk.effect.type === "elementBoost" 
              ? highestPerk.effect.value * 100 
              : 50;
            bonusDescription = `Increases ${boostedElements} production by ${boostValue}%`;
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
                  {manager.perks.map((perk) => (
                    <PerkButton 
                      key={perk.id}
                      perk={perk}
                      parentId={manager.id}
                      onUnlock={handleUnlockPerk}
                      disabled={!isOwned}
                      icon={perkIconMap.get(perk.id)} // Use unique icon from map
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
