
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
    <header className="w-full py-4 px-6 glass-effect sticky top-0 z-10 mb-6">
      <div className="flex justify-between items-center max-w-4xl mx-auto">
        <h1 className="text-xl font-medium">
          <span className="text-game-accent">Tap</span>
          <span className="text-game-text">Joy</span>
        </h1>
        
        <div className="flex items-center gap-4">
          <div className="text-right flex items-center">
            <Sparkles size={16} className="text-purple-500 mr-1" />
            <p className="text-sm text-game-text-secondary">Essence</p>
            <p className="text-lg font-medium ml-1 text-purple-500">{formatNumber(state.essence)}</p>
          </div>
          
          <div className="h-10 w-px bg-game-upgrade-border mx-2"></div>
          
          <div className="text-right">
            <p className="text-sm text-game-text-secondary">Total Coins</p>
            <p className="text-lg font-medium">{formatNumber(state.totalEarned)}</p>
          </div>
          
          <div className="h-10 w-px bg-game-upgrade-border mx-2"></div>
          
          <div className="text-right">
            <p className="text-sm text-game-text-secondary">Coins</p>
            <p className="text-lg font-medium animate-fade-in">
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
