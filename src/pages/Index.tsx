
import React from 'react';
import Header from '@/components/Header';
import ClickArea from '@/components/ClickArea';
import GameTabs from '@/components/GameTabs';
import { Toaster } from "@/components/ui/toaster";
import SkiaBackground from '@/components/SkiaBackground';
import AdNotification from '@/components/AdNotification';

const Index: React.FC = () => {
  return (
    <div className="min-h-screen flex flex-col overflow-hidden relative">
      <SkiaBackground />
      
      <div className="relative z-10">
        <Header />
      </div>
      
      <main className="flex-1 max-w-4xl mx-auto w-full px-4 relative z-10">
        <div className="py-4">
          <ClickArea />
          <div className="backdrop-blur-sm bg-opacity-20 bg-slate-900 rounded-xl p-4 shadow-2xl border border-indigo-500/20">
            <GameTabs />
          </div>
        </div>
      </main>
      
      <footer className="py-4 text-center text-sm text-slate-300 relative z-10 backdrop-blur-sm">
        <p>Mine elements from asteroids across the galaxy! Discover all 50 rare elements!</p>
        <p className="text-xs mt-1">Auto-buy: purchases the cheapest available upgrade automatically</p>
      </footer>
      
      <AdNotification />
      <Toaster />
    </div>
  );
};

export default Index;
