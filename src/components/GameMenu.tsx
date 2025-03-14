import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { useGame } from '@/context/GameContext';
import { Menu } from 'lucide-react';
import Profile from './menu/Profile';
import Achievements from './menu/Achievements';
import Leaderboard from './menu/Leaderboard';

const GameMenu: React.FC = () => {
  const { state, dispatch } = useGame();
  
  const renderActiveMenu = () => {
    switch (state.menuType) {
      case 'profile':
        return <Profile />;
      
      case 'achievements':
        return <Achievements />;

      case 'leaderboard':
        return <Leaderboard />;
        
      default:
        return (
          <>
            <DialogHeader>
              <DialogTitle>Cosmic Miner</DialogTitle>
              <DialogDescription>
                Manage your cosmic mining operations.
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              {/* Your main menu content here */}
              <p>Welcome to the game menu!</p>
            </div>
          </>
        );
    }
  };
  
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline">
          <Menu className="mr-2 h-4 w-4" />
          Menu
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        {renderActiveMenu()}
      </DialogContent>
    </Dialog>
  );
};

export default GameMenu;
