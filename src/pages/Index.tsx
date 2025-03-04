
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
      <div className="min-h-screen flex flex-col bg-slate-100">
        <Header />
        
        <main className="flex-1 max-w-4xl mx-auto w-full px-4">
          <div className="py-4">
            <ClickArea />
            <Stats />
            <Upgrades />
          </div>
        </main>
        
        <footer className="py-4 text-center text-sm text-slate-500">
          <p>Mine elements from the periodic table! Discover all 50 rare elements!</p>
        </footer>
        
        <Toaster />
      </div>
    </GameProvider>
  );
};

export default Index;
