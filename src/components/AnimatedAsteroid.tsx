
import React from 'react';
import { motion } from 'framer-motion';

interface AnimatedAsteroidProps {
  onClick: () => void;
  isAnimating: boolean;
}

const AnimatedAsteroid: React.FC<AnimatedAsteroidProps> = ({ onClick, isAnimating }) => {
  return (
    <motion.div
      className="w-full h-full flex items-center justify-center"
      onClick={onClick}
      animate={isAnimating ? { scale: 0.95 } : { scale: 1 }}
      transition={{ duration: 0.1 }}
    >
      <div className="relative w-full h-full">
        {/* Outer Glow */}
        <div className="absolute inset-0 rounded-full bg-indigo-500/20 blur-xl" />
        
        {/* Asteroid Image */}
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-48 h-48 md:w-64 md:h-64 rounded-full overflow-hidden border-4 border-indigo-500/30 shadow-lg shadow-indigo-500/30 relative">
            <div className="absolute inset-0 bg-gradient-to-br from-slate-700 to-slate-900" />
            <div className="absolute inset-0 opacity-50 bg-[url('/placeholder.svg')] bg-cover" />
            <div className="absolute inset-0 bg-gradient-to-br from-transparent to-slate-900/80" />
            
            {/* Crater Details */}
            <div className="absolute top-1/4 left-1/4 w-4 h-4 rounded-full bg-slate-800/80" />
            <div className="absolute top-1/3 right-1/4 w-6 h-6 rounded-full bg-slate-800/80" />
            <div className="absolute bottom-1/3 left-1/3 w-5 h-5 rounded-full bg-slate-800/80" />
            
            {/* Sparkles - only visible when actively clicking */}
            {isAnimating && (
              <>
                <div className="absolute top-1/4 left-1/4 w-2 h-2 bg-yellow-400 rounded-full animate-ping" />
                <div className="absolute top-1/2 right-1/4 w-2 h-2 bg-yellow-400 rounded-full animate-ping" style={{ animationDelay: '0.1s' }} />
                <div className="absolute bottom-1/4 left-1/3 w-2 h-2 bg-yellow-400 rounded-full animate-ping" style={{ animationDelay: '0.2s' }} />
              </>
            )}
          </div>
        </div>
        
        {/* Clickable Indicator */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div className="relative w-16 h-16">
            <div className="absolute inset-0 rounded-full border-2 border-indigo-400/50 animate-ping-slow" />
            <div className="absolute inset-2 rounded-full border-2 border-indigo-300/40 animate-ping-slow" style={{ animationDelay: '0.5s' }} />
            <div className="absolute inset-4 rounded-full border-2 border-indigo-200/30 animate-ping-slow" style={{ animationDelay: '1s' }} />
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default AnimatedAsteroid;
