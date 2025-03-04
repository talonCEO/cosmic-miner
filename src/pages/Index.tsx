
import React from 'react';
import { GameProvider } from '@/context/GameContext';
import Header from '@/components/Header';
import ClickArea from '@/components/ClickArea';
import Stats from '@/components/Stats';
import Upgrades from '@/components/Upgrades';
import { Toaster } from "@/components/ui/toaster";

const Index: React.FC = () => {
  return (
    <GameProvider>
      <div className="min-h-screen flex flex-col">
        <Header />
        
        <main className="flex-1 max-w-4xl mx-auto w-full px-4">
          <div className="py-4">
            <ClickArea />
            <Stats />
            <Upgrades />
          </div>
        </main>
        
        <footer className="py-4 text-center text-sm text-game-text-secondary">
          <p>Tap for joy. Tap for fun. Unlock all 50+ upgrades!</p>
        </footer>
        
        <Toaster />
      </div>
    </GameProvider>
  );
};

export default Index;
