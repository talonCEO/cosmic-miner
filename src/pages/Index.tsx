import React from 'react';
import { GameProvider } from '@/context/GameContext';
import Header from '@/components/Header';
import ClickArea from '@/components/ClickArea';
import GameTabs from '@/components/GameTabs';
import { Toaster } from "@/components/ui/toaster";

const BackgroundElements = () => {
  const elements = [];
  const elementShapes = ['circle', 'square', 'triangle', 'hexagon'];
  
  // Create 20 random element shapes
  for (let i = 0; i < 20; i++) {
    const size = Math.floor(Math.random() * 30) + 10; // 10-40px
    const shape = elementShapes[Math.floor(Math.random() * elementShapes.length)];
    const top = Math.floor(Math.random() * 100);
    const left = Math.floor(Math.random() * 100);
    const opacity = (Math.random() * 0.07) + 0.02; // Very subtle: 0.02-0.09
    const delay = Math.random() * 5; // 0-5s delay for animation
    const duration = (Math.random() * 30) + 20; // 20-50s for full animation
    
    let shapeClass = '';
    switch (shape) {
      case 'circle': 
        shapeClass = 'rounded-full'; 
        break;
      case 'square': 
        shapeClass = 'rounded-md'; 
        break;
      case 'triangle': 
        shapeClass = 'clip-triangle'; 
        break;
      case 'hexagon': 
        shapeClass = 'clip-hexagon'; 
        break;
    }
    
    elements.push(
      <div 
        key={i}
        className={`absolute ${shapeClass} bg-black pointer-events-none`}
        style={{
          width: `${size}px`,
          height: `${size}px`,
          top: `${top}%`,
          left: `${left}%`,
          opacity: opacity,
          animation: `float-vertical ${duration}s ease-in-out infinite`,
          animationDelay: `${delay}s`
        }}
      />
    );
  }
  
  return elements;
};

const Index: React.FC = () => {
  return (
    <GameProvider>
      <div className="min-h-screen flex flex-col bg-gradient-to-b from-slate-50 to-slate-100 overflow-hidden relative">
        {/* Background element particles */}
        <div className="absolute inset-0 overflow-hidden">
          <BackgroundElements />
        </div>
        
        <Header />
        
        <main className="flex-1 max-w-4xl mx-auto w-full px-4 relative z-10">
          <div className="py-4">
            <ClickArea />
            <GameTabs />
          </div>
        </main>
        
        <footer className="py-4 text-center text-sm text-slate-500 relative z-10">
          <p>Mine elements from the periodic table! Discover all 50 rare elements!</p>
          <p className="text-xs mt-1">Auto-buy: purchases the cheapest available upgrade automatically</p>
        </footer>
        
        <Toaster />
      </div>
    </GameProvider>
  );
};

export default Index;
