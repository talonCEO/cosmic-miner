
import React from 'react';
import { useGame } from '@/context/GameContext';
import { formatNumber } from '@/utils/gameLogic';
import GameMenu from '@/components/GameMenu';
import { Sparkles } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';

const Header: React.FC = () => {
  const { state } = useGame();
  const { toast } = useToast();
  
  // Check for newly unlocked achievements and show notification
  const previousUnlockedCountRef = React.useRef(state.achievements.filter(a => a.unlocked).length);
  
  React.useEffect(() => {
    const currentUnlockedCount = state.achievements.filter(a => a.unlocked).length;
    
    // If we've unlocked new achievements
    if (currentUnlockedCount > previousUnlockedCountRef.current) {
      // Find newly unlocked achievements
      const newlyUnlocked = state.achievements.filter((a, i) => {
        return a.unlocked && i >= previousUnlockedCountRef.current;
      });
      
      // Show notifications for each
      newlyUnlocked.forEach(achievement => {
        toast({
          title: "Achievement Unlocked!",
          description: `${achievement.name}: ${achievement.description}`,
          duration: 3000,
        });
      });
    }
    
    previousUnlockedCountRef.current = currentUnlockedCount;
  }, [state.achievements, toast]);
  
  return (
    <header className="w-full py-4 px-6 backdrop-blur-sm bg-slate-900/50 border-b border-indigo-500/20 sticky top-0 z-30 mb-6 shadow-lg">
      <div className="flex justify-between items-center max-w-4xl mx-auto">
        <h1 className="text-xl font-medium flex items-center">
          <span className="bg-clip-text text-transparent bg-gradient-to-r from-purple-400 to-indigo-600 font-semibold">
            Cosmic
          </span>
          <span className="text-white ml-1">Miner</span>
          
          {/* Animated star next to logo */}
          <span className="inline-block ml-1 animate-pulse">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z" 
                fill="url(#star-gradient)" />
              <defs>
                <linearGradient id="star-gradient" x1="2" y1="2" x2="22" y2="21.02" gradientUnits="userSpaceOnUse">
                  <stop stopColor="#FFC107" />
                  <stop offset="1" stopColor="#FF6B00" />
                </linearGradient>
              </defs>
            </svg>
          </span>
        </h1>
        
        <div className="flex items-center gap-4">
          <div className="text-right flex flex-col items-end px-3 py-1.5">
            <p className="text-sm text-slate-400">Essence</p>
            <div className="flex items-center">
              <Sparkles size={16} className="text-purple-400 mr-1 animate-pulse" />
              <p className="text-lg font-medium text-purple-300">{formatNumber(state.essence)}</p>
            </div>
          </div>
          
          <div className="h-10 w-px bg-indigo-500/20 mx-2"></div>
          
          <div className="text-right">
            <p className="text-sm text-slate-400">Total Coins</p>
            <p className="text-lg font-medium text-slate-200">{formatNumber(state.totalEarned)}</p>
          </div>
          
          <div className="h-10 w-px bg-indigo-500/20 mx-2"></div>
          
          <div className="text-right">
            <p className="text-sm text-slate-400">Coins</p>
            <p className="text-lg font-medium animate-fade-in text-slate-200">
              {formatNumber(state.coins)}
            </p>
          </div>
          
          <div className="ml-4">
            <GameMenu />
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
