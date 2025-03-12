
import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';
import { ReactNode } from 'react';

interface UnlockAnimationProps {
  show: boolean;
  title: string;
  description: string;
  icon: ReactNode;
  imageSrc?: string;
  onClose: () => void;
  autoClose?: boolean;
  autoCloseDelay?: number;
}

const UnlockAnimation: React.FC<UnlockAnimationProps> = ({
  show,
  title,
  description,
  icon,
  imageSrc = 'https://images.unsplash.com/photo-1618160702438-9b02ab6515c9?auto=format&fit=crop&w=400&h=400&q=80',
  onClose,
  autoClose = false,
  autoCloseDelay = 3000, // Default to 3 seconds
}) => {
  // Auto-close the animation after the specified delay
  useEffect(() => {
    if (show && autoClose) {
      const timer = setTimeout(() => {
        onClose();
      }, autoCloseDelay);
      
      return () => clearTimeout(timer);
    }
  }, [show, autoClose, autoCloseDelay, onClose]);

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          className="absolute inset-0 z-50 bg-black/80 flex flex-col items-center justify-center p-6"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
        >
          {!autoClose && (
            <motion.button
              className="absolute top-4 right-4 p-2 rounded-full hover:bg-white/10 transition-colors"
              onClick={onClose}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
            >
              <X className="w-6 h-6 text-white/70" />
            </motion.button>
          )}

          <motion.div
            className="flex flex-col items-center justify-center gap-4 relative"
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.8, opacity: 0 }}
            transition={{ 
              type: "spring", 
              stiffness: 300, 
              damping: 25,
              delay: 0.1
            }}
          >
            <div className="relative">
              {/* Glow effect */}
              <motion.div 
                className="absolute inset-0 rounded-full bg-amber-500/30 blur-xl"
                animate={{ 
                  scale: [1, 1.2, 1],
                  opacity: [0.5, 0.8, 0.5]
                }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  repeatType: "reverse"
                }}
              />
              
              {/* Particle effects */}
              <div className="absolute inset-0 flex items-center justify-center">
                {[...Array(12)].map((_, i) => (
                  <motion.div
                    key={i}
                    className="absolute w-2 h-2 rounded-full bg-amber-400"
                    initial={{ x: 0, y: 0, opacity: 0 }}
                    animate={{ 
                      x: Math.cos(i * 30 * (Math.PI / 180)) * 100,
                      y: Math.sin(i * 30 * (Math.PI / 180)) * 100,
                      opacity: [0, 1, 0]
                    }}
                    transition={{ 
                      duration: 1.5 + (i % 3) * 0.5,
                      repeat: Infinity,
                      repeatType: "loop",
                      ease: "easeOut",
                      delay: i * 0.1
                    }}
                  />
                ))}
              </div>
              
              <motion.div
                className="w-40 h-40 rounded-full overflow-hidden border-4 border-amber-500 shadow-lg shadow-amber-500/50 z-10 relative flex items-center justify-center"
                animate={{ 
                  boxShadow: ["0 0 20px 0px #f59e0b50", "0 0 40px 10px #f59e0b80", "0 0 20px 0px #f59e0b50"]
                }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  repeatType: "reverse"
                }}
              >
                {imageSrc ? (
                  <img 
                    src={imageSrc}
                    alt={title}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="text-amber-400 transform scale-[2.5]">
                    {icon}
                  </div>
                )}
              </motion.div>
            </div>
            
            <motion.div
              className="text-center"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
            >
              <h2 className="text-2xl font-bold text-amber-400 mb-2">
                {title}
              </h2>
              <p className="text-green-400 font-semibold mb-4">
                {description}
              </p>
            </motion.div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default UnlockAnimation;
