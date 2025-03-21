import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAd } from '@/context/AdContext';F
import { useGame } from '@/context/GameContext';
import { X, Plus, Gem, Clock } from 'lucide-react';
import FilmIcon from '@/assets/images/icons/film.png'; // Import the custom image

const AdNotification: React.FC = () => {
  const {
    showAdNotification,
    adBoostActive,
    adBoostTimeRemaining,
    adBoostMultiplier,
    handleWatchAd,
    dismissAdNotification,
    selectedAdType,
  } = useAd();
  const { state } = useGame();

  // Ad type configurations
  const adConfigs = {
    income: {
      name: 'Income Boost',
      description: `${adBoostMultiplier}x Income for 10min!`,
      icon: <Plus className="h-3 w-3" />,
    },
    gems: {
      name: 'Gems Bonus',
      description: '+20 Bonus Gems!',
      icon: <Gem className="h-3 w-3" />,
    },
    timeWarp: {
      name: 'Time Warp',
      description: '+1hr passive earnings! ',
      icon: <Clock className="h-3 w-3" />,
    },
  };

  const selectedAd = adConfigs[selectedAdType];

  // Format time remaining as mm:ss
  const formatTimeRemaining = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  return (
    <>
      {/* Ad notification */}
      <AnimatePresence>
        {showAdNotification && (
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -50, transition: { duration: 0.5 } }}
            transition={{ duration: 0.3 }}
            className="fixed left-4 top-[11vh] md:top-[11vh] md:-translate-y-1/2 z-[50]"
          >
            <motion.div
              className="bg-indigo-900/80 backdrop-blur-sm border border-yellow-400 rounded-lg shadow-lg overflow-hidden max-w-[90vw] md:max-w-none"
              animate={{
                scale: [1, 1.05, 1],
                boxShadow: [
                  '0 4px 6px -1px rgba(255, 215, 0, 0.1), 0 2px 4px -1px rgba(255, 215, 0, 0.06)',
                  '0 10px 15px -3px rgba(255, 215, 0, 0.2), 0 4px 6px -2px rgba(255, 215, 0, 0.1)',
                  '0 4px 6px -1px rgba(255, 215, 0, 0.1), 0 2px 4px -1px rgba(255, 215, 0, 0.06)',
                ],
              }}
              transition={{ repeat: Infinity, duration: 2 }}
            >
              <div className="p-3 md:p-4 flex items-center gap-2 md:gap-3">
                <div className="relative">
                  <motion.div
                    animate={{
                      scale: [1, 1.2, 1],
                      opacity: [0.7, 1, 0.7],
                    }}
                    transition={{
                      repeat: Infinity,
                      duration: 1.5,
                    }}
                    className="absolute inset-0 bg-yellow-400 rounded-full blur-md"
                  />
                  <motion.div
                    className="relative z-10"
                    animate={{ rotate: 360 }}
                    transition={{
                      repeat: Infinity,
                      duration: 8,
                      ease: 'linear',
                    }}
                  >
                    <img
                      src={FilmIcon}
                      alt="Ad Icon"
                      className="h-6 w-6 md:h-8 md:w-8 object-contain"
                    />
                  </motion.div>
                </div>

                <div className="flex-1">
                  <div className="text-yellow-300 font-semibold text-xs md:text-sm">
                    {selectedAd.name}
                  </div>
                  <div className="text-blue-200 text-[10px] md:text-xs flex items-center gap-1">
                    {selectedAd.icon} {selectedAd.description}
                  </div>
                </div>

                <button
                  onClick={handleWatchAd}
                  className="bg-yellow-400 hover:bg-yellow-300 text-slate-900 px-2 md:px-3 py-1 rounded-md text-[10px] md:text-xs font-semibold transition-colors"
                >
                  {state.hasNoAds ? 'Claim' : 'Watch'}
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

      {/* Active boost indicator (only for Income Boost) */}
      <AnimatePresence>
        {adBoostActive && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20, transition: { duration: 0.5 } }}
            transition={{ duration: 0.3 }}
            className="fixed bottom-4 left-4 z-[50]"
          >
            <div className="bg-indigo-900/80 backdrop-blur-sm border border-yellow-400 rounded-lg shadow-lg p-2 flex items-center gap-2">
              <motion.div
                animate={{ scale: [1, 1.1, 1] }}
                transition={{ repeat: Infinity, duration: 1.5 }}
              >
                <div className="bg-yellow-400 text-slate-900 rounded-full p-1">
                  <Plus className="h-3 w-3 md:h-4 md:w-4" />
                </div>
              </motion.div>
              <div>
                <div className="text-yellow-300 text-[10px] md:text-xs font-medium">
                  {adBoostMultiplier}x Income Boost
                </div>
                <div className="text-blue-200 text-[10px] md:text-xs">
                  {formatTimeRemaining(adBoostTimeRemaining)} remaining
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default AdNotification;
