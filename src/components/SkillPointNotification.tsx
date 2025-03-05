
import React, { useEffect, useState } from 'react';
import { Gem } from 'lucide-react';

interface SkillPointNotificationProps {
  message: string;
  onClose: () => void;
}

const SkillPointNotification: React.FC<SkillPointNotificationProps> = ({ message, onClose }) => {
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(false);
      setTimeout(onClose, 300); // Allow time for fade-out animation
    }, 3000);

    return () => clearTimeout(timer);
  }, [onClose]);

  return (
    <div 
      className={`fixed top-4 left-1/2 transform -translate-x-1/2 z-50 transition-opacity duration-300 ${
        isVisible ? 'opacity-100' : 'opacity-0'
      }`}
    >
      <div className="bg-indigo-900/80 border border-indigo-400 shadow-lg px-4 py-2 rounded-lg flex items-center gap-2">
        <div className="animate-pulse">
          <Gem className="text-blue-400" size={20} />
        </div>
        <span className="text-blue-200 font-medium">{message}</span>
      </div>
    </div>
  );
};

export default SkillPointNotification;
