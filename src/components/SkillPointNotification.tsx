
import React, { useState, useEffect } from 'react';
import { Gem } from 'lucide-react';
import { AnimatePresence, motion } from 'framer-motion';

interface SkillPointNotificationProps {
  show: boolean;
  onComplete: () => void;
}

const SkillPointNotification: React.FC<SkillPointNotificationProps> = ({ 
  show, 
  onComplete 
}) => {
  const [visible, setVisible] = useState(show);
  
  useEffect(() => {
    if (show) {
      setVisible(true);
      const timer = setTimeout(() => {
        setVisible(false);
        setTimeout(onComplete, 300); // Wait for exit animation to complete
      }, 2500);
      
      return () => clearTimeout(timer);
    }
  }, [show, onComplete]);
  
  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ y: -50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: -50, opacity: 0 }}
          transition={{ duration: 0.3 }}
          className="fixed top-5 left-1/2 transform -translate-x-1/2 z-50"
        >
          <div className="bg-slate-800/90 backdrop-blur-sm border border-indigo-500/30 rounded-lg px-4 py-2 shadow-lg shadow-indigo-500/10 flex items-center gap-3">
            <div className="animate-pulse">
              <Gem className="text-blue-400" size={24} />
            </div>
            <div className="text-blue-100 font-medium">Skill Point +1</div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default SkillPointNotification;
