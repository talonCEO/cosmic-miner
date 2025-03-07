
import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAd } from '@/context/AdContext';
import { X, Plus, PlayCircle, Clock, Zap, MousePointerClick } from 'lucide-react';

const AdNotification: React.FC = () => {
  const { 
    showAdNotification,
    adBoostActive,
    adBoostTimeRemaining,
    activeBoostType,
    currentBoostConfig,
    handleWatchAd,
    dismissAdNotification
  } = useAd();
  
  const [showTimeWarpFlash, setShowTimeWarpFlash] = useState(false);
  
  // Listen for time warp activation events
  useEffect(() => {
    const handleTimeWarp = () => {
      setShowTimeWarpFlash(true);
      setTimeout(() => setShowTimeWarpFlash(false), 1000);
    };
    
    document.addEventListener('timeWarpActivated', handleTimeWarp);
    return () => {
      document.removeEventListener('timeWarpActivated', handleTimeWarp);
    };
  }, []);
  
  // Format time remaining as mm:ss
  const formatTimeRemaining = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };
  
  // Get the appropriate icon for the active boost
  const getBoostIcon = () => {
    if (!currentBoostConfig) return <Plus className="h-3 w-3 md:h-4 md:w-4" />;
    
    return currentBoostConfig.icon || (
      activeBoostType === 'income' ? <Plus className="h-3 w-3 md:h-4 md:w-4" /> :
      activeBoostType === 'autoTap' ? <MousePointerClick className="h-3 w-3 md:h-4 md:w-4" /> :
      <Clock className="h-3 w-3 md:h-4 md:w-4" />
    );
  };
  
  return (
    <>
      {/* Time Warp Flash Animation */}
      <AnimatePresence>
        {showTimeWarpFlash && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.7 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 bg-white z-[9999]"
          />
        )}
      </AnimatePresence>
      
      {/* Ad notification - responsive positioning for both web and mobile */}
      <AnimatePresence>
        {showAdNotification && (
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -50, transition: { duration: 0.5 } }}
            transition={{ duration: 0.3 }}
            className="fixed left-4 top-[11vh] md:top-[11vh] md:-translate-y-1/2 z-[999]"
          >
            <motion.div 
              className="bg-indigo-900/80 backdrop-blur-sm border border-yellow-400 rounded-lg shadow-lg overflow-hidden max-w-[90vw] md:max-w-none"
              animate={{ 
                scale: [1, 1.05, 1],
                boxShadow: [
                  "0 4px 6px -1px rgba(255, 215, 0, 0.1), 0 2px 4px -1px rgba(255, 215, 0, 0.06)",
                  "0 10px 15px -3px rgba(255, 215, 0, 0.2), 0 4px 6px -2px rgba(255, 215, 0, 0.1)",
                  "0 4px 6px -1px rgba(255, 215, 0, 0.1), 0 2px 4px -1px rgba(255, 215, 0, 0.06)"
                ]
              }}
              transition={{ 
                repeat: Infinity, 
                duration: 2
              }}
            >
              <div className="p-3 md:p-4 flex items-center gap-2 md:gap-3">
                <div className="relative">
                  <motion.div
                    animate={{ 
                      scale: [1, 1.2, 1],
                      opacity: [0.7, 1, 0.7]
                    }}
                    transition={{ 
                      repeat: Infinity, 
                      duration: 1.5
                    }}
                    className="absolute inset-0 bg-yellow-400 rounded-full blur-md"
                  />
                  <motion.div 
                    className="relative z-10"
                    animate={{ rotate: 360 }}
                    transition={{ 
                      repeat: Infinity, 
                      duration: 8, 
                      ease: "linear" 
                    }}
                  >
                    <PlayCircle className="text-yellow-300 h-6 w-6 md:h-8 md:w-8" />
                  </motion.div>
                </div>
                
                <div className="flex-1">
                  <div className="text-yellow-300 font-semibold text-xs md:text-sm">Watch Ad</div>
                  <div className="text-blue-200 text-[10px] md:text-xs flex items-center gap-1">
                    {currentBoostConfig?.icon || <Plus className="h-3 w-3" />} {currentBoostConfig?.description || "2x Income for 10min"}
                  </div>
                </div>
                
                <button 
                  onClick={handleWatchAd} 
                  className="bg-yellow-400 hover:bg-yellow-300 text-slate-900 px-2 md:px-3 py-1 rounded-md text-[10px] md:text-xs font-semibold transition-colors"
                >
                  Watch
                </button>
                
                <button 
                  onClick={dismissAdNotification}
                  className="text-blue-300 hover:text-blue-100 transition-colors p-1"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
      
      {/* Active boost indicator - responsive for mobile */}
      <AnimatePresence>
        {adBoostActive && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20, transition: { duration: 0.5 } }}
            transition={{ duration: 0.3 }}
            className="fixed bottom-4 left-4 z-50"
          >
            <div className="bg-indigo-900/80 backdrop-blur-sm border border-yellow-400 rounded-lg shadow-lg p-2 flex items-center gap-2">
              <motion.div
                animate={{ scale: [1, 1.1, 1] }}
                transition={{ repeat: Infinity, duration: 1.5 }}
              >
                <div className="bg-yellow-400 text-slate-900 rounded-full p-1">
                  {getBoostIcon()}
                </div>
              </motion.div>
              <div>
                <div className="text-yellow-300 text-[10px] md:text-xs font-medium">
                  {activeBoostType === 'income' ? '2x Income Boost' : 
                   activeBoostType === 'autoTap' ? 'Auto Tap Active' : 
                   'Boost Active'}
                </div>
                <div className="text-blue-200 text-[10px] md:text-xs">{formatTimeRemaining(adBoostTimeRemaining)} remaining</div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default AdNotification;
