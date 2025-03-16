
import React, { useState, useEffect } from 'react';
import { useGame } from '@/context/GameContext';
import { 
  Gem, 
  TrendingUp, 
  Zap, 
  Sparkles, 
  Trophy, 
  Battery, 
  ShieldCheck,
  Settings, 
  Users, 
  BarChart, 
  Clock,
  Lightbulb,
  Brain,
  Diamond,
  Lock
} from 'lucide-react';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"

interface PerkProps {
  perk: {
    id: string;
    name: string;
    description: string;
    cost: number;
    unlocked?: boolean;
    category?: string;
    effect: {
      type: string;
      value: number;
    };
  };
  parentId: string;
  onUnlock: (perkId: string, parentId: string) => void;
  disabled?: boolean;
  icon?: React.ReactNode;
}

const PerkButton: React.FC<PerkProps> = ({ perk, parentId, onUnlock, disabled = false, icon }) => {
  const { state } = useGame();
  const [isTooltipOpen, setIsTooltipOpen] = useState(false);
  const [tooltipTimer, setTooltipTimer] = useState<NodeJS.Timeout | null>(null);
  const canAfford = state.skillPoints >= perk.cost;
  const isUnlocked = state.unlockedPerks.includes(perk.id) || perk.unlocked;
  
  const isManagerPerk = parentId.includes("manager");
  const borderColor = isManagerPerk ? 'border-indigo-500' : 'border-purple-500';
  const hoverBgColor = isManagerPerk ? 'hover:bg-indigo-700/30' : 'hover:bg-purple-700/30';
  const activeBgColor = isManagerPerk ? 'bg-indigo-500/20' : 'bg-purple-500/20';
  
  const getPerkIcon = () => {
    if (icon) return icon;
    
    const categoryIcons: Record<string, React.ReactNode> = {
      'production': <TrendingUp size={16} className={isManagerPerk ? "text-indigo-400" : "text-purple-400"} />,
      'power': <Zap size={16} className="text-yellow-400" />,
      'bonus': <Sparkles size={16} className="text-amber-400" />,
      'collection': <Trophy size={16} className="text-green-400" />,
      'energy': <Battery size={16} className="text-blue-400" />,
      'protection': <ShieldCheck size={16} className="text-red-400" />,
      'efficiency': <Settings size={16} className="text-cyan-400" />,
      'management': <Users size={16} className="text-green-400" />,
      'cost': <Gem size={16} className={isManagerPerk ? "text-indigo-400" : "text-purple-400"} />,
      'optimization': <BarChart size={16} className="text-blue-400" />,
      'time': <Clock size={16} className="text-amber-400" />
    };
    
    if (perk.id.includes('quantum')) return <Brain size={16} className="text-blue-400" />;
    if (perk.id.includes('crystal')) return <Diamond size={16} className="text-purple-400" />;
    if (perk.id.includes('acceleration')) return <Zap size={16} className="text-yellow-400" />;
    if (perk.id.includes('catalyst')) return <Lightbulb size={16} className="text-yellow-400" />;
    
    return categoryIcons[perk.category || 'bonus'] || <Gem size={16} className={isManagerPerk ? "text-indigo-400" : "text-purple-400"} />;
  };
  
  useEffect(() => {
    return () => {
      if (tooltipTimer) clearTimeout(tooltipTimer);
    };
  }, [tooltipTimer]);
  
  const handleClick = () => {
    setIsTooltipOpen(true);
    if (tooltipTimer) clearTimeout(tooltipTimer);
    const timer = setTimeout(() => {
      setIsTooltipOpen(false);
    }, 5000);
    setTooltipTimer(timer);
    
    if (!(disabled || isUnlocked || !canAfford)) {
      onUnlock(perk.id, parentId);
    }
  };
  
  const perkIcon = getPerkIcon();
  
  return (
    <TooltipProvider>
      <Tooltip open={isTooltipOpen} onOpenChange={setIsTooltipOpen}>
        <TooltipTrigger asChild>
          <button
            onClick={handleClick}
            className={`w-9 h-9 rounded-full flex items-center justify-center mb-2 transition-all relative
              ${isUnlocked
                ? `${activeBgColor} border-2 ${borderColor} opacity-100`
                : disabled
                  ? 'bg-slate-800/40 border-2 border-slate-700/40 cursor-not-allowed opacity-50'
                  : canAfford
                    ? `bg-slate-800/40 border-2 ${isManagerPerk ? 'border-indigo-500/40' : 'border-purple-500/40'} ${hoverBgColor} opacity-100`
                    : 'bg-slate-800/40 border-2 border-slate-600/40 cursor-not-allowed opacity-75'
              }`}
          >
            {perkIcon}
            {!isUnlocked && (
              <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-40 rounded-full">
                <Lock size={14} className="text-slate-300 opacity-90" />
              </div>
            )}
          </button>
        </TooltipTrigger>
        <TooltipContent 
          side="top" 
          className="bg-slate-800 border-slate-700 p-2 w-48"
        >
          <div className="space-y-1">
            <p className="font-semibold text-white">{perk.name}</p>
            <p className="text-xs text-slate-300">{perk.description}</p>
            {!isUnlocked && (
              <p className={`text-xs mt-1 ${canAfford ? 'text-green-400' : 'text-red-400'}`}>
                Cost: {perk.cost} skill points
              </p>
            )}
            {isUnlocked && (
              <p className={`text-xs ${isManagerPerk ? 'text-indigo-400' : 'text-purple-400'}`}>Unlocked</p>
            )}
          </div>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};

export default PerkButton;
