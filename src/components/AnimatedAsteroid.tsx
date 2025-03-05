
import React, { useState, useEffect } from 'react';
import { useGame } from '@/context/GameContext';
import { Sparkles } from 'lucide-react';

interface AnimatedAsteroidProps {
  onClick: () => void;
  isAnimating: boolean;
}

const AnimatedAsteroid: React.FC<AnimatedAsteroidProps> = ({ onClick, isAnimating }) => {
  const { state } = useGame();
  const [rotation, setRotation] = useState(0);
  const [scale, setScale] = useState(1);
  
  // Rotate the asteroid slowly
  useEffect(() => {
    const rotationInterval = setInterval(() => {
      setRotation(prev => (prev + 0.1) % 360);
    }, 50);
    
    return () => clearInterval(rotationInterval);
  }, []);
  
  // Handle click animation
  useEffect(() => {
    if (isAnimating) {
      setScale(0.95);
      const timeout = setTimeout(() => {
        setScale(1);
      }, 150);
      return () => clearTimeout(timeout);
    }
  }, [isAnimating]);
  
  // Get asteroid color based on current coins
  const getAsteroidColor = () => {
    const coins = state.coins;
    if (coins < 100) return "#81D4FA"; // Blue asteroid
    if (coins < 1000) return "#424242"; // Carbon asteroid
    if (coins < 10000) return "#90CAF9"; // Ice asteroid
    if (coins < 100000) return "#CB8D73"; // Iron asteroid
    if (coins < 1000000) return "#D87F46"; // Copper asteroid
    if (coins >= 1000000) return "#FFC107"; // Gold asteroid
    return "#BA68C8"; // Default: rare element (purple)
  };
  
  return (
    <div 
      className="w-full h-full rounded-full flex items-center justify-center cursor-pointer transition-transform relative overflow-visible"
      onClick={onClick}
      style={{
        background: `radial-gradient(circle at 30% 30%, ${getAsteroidColor()}, #1a1a2e)`,
        boxShadow: `0 0 20px 5px rgba(${getAsteroidColor() === '#FFC107' ? '255, 193, 7' : '186, 104, 200'}, 0.3)`,
        transform: `scale(${scale}) rotate(${rotation}deg)`,
        transition: 'transform 0.15s ease-out',
        opacity: '1',
        animation: 'pulse-opacity 3s infinite alternate',
      }}
    >
      {/* Asteroid texture overlay */}
      <div 
        className="absolute inset-0 rounded-full opacity-40"
        style={{
          backgroundImage: 'radial-gradient(circle at 70% 20%, transparent 0%, #00000070 80%)',
          mixBlendMode: 'multiply',
        }}
      ></div>
      
      {/* Asteroid craters */}
      <div 
        className="absolute w-10 h-10 rounded-full bg-black opacity-20" 
        style={{ top: '20%', left: '30%' }}
      ></div>
      <div 
        className="absolute w-6 h-6 rounded-full bg-black opacity-20" 
        style={{ top: '50%', left: '20%' }}
      ></div>
      <div 
        className="absolute w-8 h-8 rounded-full bg-black opacity-20" 
        style={{ top: '60%', left: '60%' }}
      ></div>
      
      {/* Subtle sparkle effect */}
      <div className="absolute inset-0 flex items-center justify-center opacity-30 pointer-events-none animate-pulse">
        <Sparkles className="w-36 h-36 text-white" />
      </div>
      
      {/* Small floating particles around the asteroid */}
      <div className="absolute w-4 h-4 rounded-full bg-white/20 animate-ping"
           style={{ top: '-10%', left: '20%', animationDuration: '3s' }}></div>
      <div className="absolute w-3 h-3 rounded-full bg-white/20 animate-ping"
           style={{ bottom: '10%', right: '-5%', animationDuration: '4s' }}></div>
      <div className="absolute w-2 h-2 rounded-full bg-white/20 animate-ping"
           style={{ top: '30%', right: '-8%', animationDuration: '5s' }}></div>
    </div>
  );
};

export default AnimatedAsteroid;
