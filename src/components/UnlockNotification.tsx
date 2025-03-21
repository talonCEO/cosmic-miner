import React, { useEffect, useRef } from 'react';
import { useGame } from '@/context/GameContext';
import { managers } from '@/utils/managersData';
import { artifacts } from '@/utils/artifactsData';
import { Achievement, GameState } from '@/context/GameContext';
import { motion } from 'framer-motion';
import { gsap } from 'gsap';
import { X } from 'lucide-react';

// Props for the notification
interface UnlockNotificationProps {
  type: 'manager' | 'artifact' | 'achievement';
  id: string;
  onClose: () => void;
}

const UnlockNotification: React.FC<UnlockNotificationProps> = ({ type, id, onClose }) => {
  const { state } = useGame();
  const notificationRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Find the unlocked item
  const getUnlockedItem = () => {
    switch (type) {
      case 'manager':
        return managers.find((m) => m.id === id);
      case 'artifact':
        return artifacts.find((a) => m.id === id);
      case 'achievement':
        return state.achievements.find((a) => a.id === id);
      default:
        return null;
    }
  };

  const unlockedItem = getUnlockedItem();

  // Determine image and content
  const getImage = () => {
    if (type === 'manager') return (unlockedItem as typeof managers[0])?.avatar;
    if (type === 'artifact') return (unlockedItem as typeof artifacts[0])?.avatar;
    if (type === 'achievement') {
      const achievement = unlockedItem as Achievement;
      return achievement?.rewards?.image || (achievement?.rewards?.type === 'gems' ? '/gem-icon.png' : '');
    }
    return '';
  };

  const getContent = () => {
    if (type === 'manager') {
      const manager = unlockedItem as typeof managers[0];
      return { title: manager?.name || 'Unknown Manager', detail: manager?.bonus || 'No bonus' };
    }
    if (type === 'artifact') {
      const artifact = unlockedItem as typeof artifacts[0];
      return { title: artifact?.name || 'Unknown Artifact', detail: artifact?.bonus || 'No bonus' };
    }
    if (type === 'achievement') {
      const achievement = unlockedItem as Achievement;
      return {
        title: achievement?.name || 'Unknown Achievement',
        detail: achievement?.description || 'No requirement',
      };
    }
    return { title: '', detail: '' };
  };

  const image = getImage();
  const { title, detail } = getContent();

  // Auto-close after 3 seconds
  useEffect(() => {
    const timer = setTimeout(() => {
      handleClose();
    }, 3000);
    return () => clearTimeout(timer);
  }, []);

  // GSAP Entrance Animation
  useEffect(() => {
    if (notificationRef.current) {
      gsap.fromTo(
        notificationRef.current,
        { y: 100, scale: 0.8, opacity: 0 },
        { y: 0, scale: 1, opacity: 1, duration: 0.5, ease: 'back.out(1.7)' }
      );
    }
  }, []);

  // Canvas Sparkles
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    canvas.width = 300;
    canvas.height = 80;
    const particles: { x: number; y: number; size: number; speedX: number; speedY: number; life: number }[] = [];

    for (let i = 0; i < 20; i++) {
      particles.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        size: Math.random() * 5 + 2,
        speedX: (Math.random() - 0.5) * 2,
        speedY: (Math.random() - 0.5) * 2,
        life: Math.random() * 60 + 30,
      });
    }

    const animateParticles = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      particles.forEach((p, i) => {
        p.x += p.speedX;
        p.y += p.speedY;
        p.life -= 1;
        ctx.fillStyle = `rgba(255, 215, 0, ${p.life / 60})`;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fill();
        if (p.life <= 0) particles.splice(i, 1);
      });
      if (particles.length > 0) requestAnimationFrame(animateParticles);
    };
    animateParticles();
  }, []);

  // Handle close with GSAP exit
  const handleClose = () => {
    if (notificationRef.current) {
      gsap.to(notificationRef.current, {
        opacity: 0,
        y: 50,
        rotate: 5,
        duration: 0.4,
        ease: 'power2.in',
        onComplete: onClose,
      });
    } else {
      onClose();
    }
  };

  if (!unlockedItem) return null;

  return (
    <div
      className="fixed inset-0 z-[100] flex justify-center items-end"
      onClick={handleClose}
    >
      <motion.div
        ref={notificationRef}
        className="relative bg-gradient-to-r from-indigo-900 to-purple-900 border border-yellow-400 rounded-lg p-3 mb-4 max-w-[90vw] md:max-w-md shadow-lg overflow-hidden"
        style={{ boxShadow: '0 0 15px rgba(255, 215, 0, 0.5)' }}
        onClick={(e) => e.stopPropagation()}
        animate={{ scale: [1, 1.02, 1], transition: { duration: 1, repeat: Infinity } }}
      >
        {/* Canvas Sparkles */}
        <canvas
          ref={canvasRef}
          className="absolute inset-0 pointer-events-none"
          style={{ opacity: 0.7 }}
        />

        {/* Content */}
        <div className="relative flex items-center z-10">
          {/* Left: Title and Detail */}
          <div className="flex-1 pr-3">
            <h3 className="text-yellow-300 font-bold text-sm md:text-base animate-pulse">
              {title}
            </h3>
            <p className="text-blue-200 text-xs md:text-sm">
              {type === 'achievement' ? 'Requirement:' : 'Bonus:'} {detail}
            </p>
          </div>

          {/* Right: Image */}
          <div className="flex-shrink-0">
            <motion.img
              src={image}
              alt={title}
              className="h-10 w-10 md:h-12 md:w-12 rounded-full border-2 border-yellow-400 object-cover"
              initial={{ rotate: -10 }}
              animate={{ rotate: 10 }}
              transition={{ duration: 0.5, yoyo: Infinity }}
            />
          </div>

          {/* Close Button */}
          <button
            onClick={handleClose}
            className="absolute top-1 right-1 text-yellow-300 hover:text-yellow-100 transition-colors"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* CSS Keyframe Glow */}
        <style jsx>{`
          @keyframes glow {
            0% { box-shadow: 0 0 5px rgba(255, 215, 0, 0.5); }
            50% { box-shadow: 0 0 20px rgba(255, 215, 0, 0.8); }
            100% { box-shadow: 0 0 5px rgba(255, 215, 0, 0.5); }
          }
          .glow-effect {
            animation: glow 1.5s infinite;
          }
        `}</style>
        <div className="absolute inset-0 glow-effect pointer-events-none" />
      </motion.div>
    </div>
  );
};

// Wrapper component
const UnlockNotificationWrapper: React.FC = () => {
  const { state } = useGame();
  const [notifications, setNotifications] = useState<
    { type: 'manager' | 'artifact' | 'achievement'; id: string }[]
  >([]);
  const [prevState, setPrevState] = useState<GameState | null>(null);

  useEffect(() => {
    if (!prevState) {
      setPrevState(state);
      return;
    }

    const newManagers = state.ownedManagers.filter(
      (m) => !prevState.ownedManagers.includes(m) && m !== 'manager-default'
    );
    if (newManagers.length > 0) {
      setNotifications((prev) => [...prev, { type: 'manager', id: newManagers[0] }]);
    }

    const newArtifacts = state.ownedArtifacts.filter(
      (a) => !prevState.ownedArtifacts.includes(a) && a !== 'artifact-default'
    );
    if (newArtifacts.length > 0) {
      setNotifications((prev) => [...prev, { type: 'artifact', id: newArtifacts[0] }]);
    }

    const newAchievements = state.achievements.filter(
      (a) => a.unlocked && !prevState.achievements.find((pa) => pa.id === a.id)?.unlocked
    );
    if (newAchievements.length > 0) {
      setNotifications((prev) => [...prev, { type: 'achievement', id: newAchievements[0].id }]);
    }

    setPrevState(state);
  }, [state, prevState]);

  const handleClose = (index: number) => {
    setNotifications((prev) => prev.filter((_, i) => i !== index));
  };

  return (
    <>
      {notifications.map((n, index) => (
        <UnlockNotification
          key={`${n.type}-${n.id}-${index}`}
          type={n.type}
          id={n.id}
          onClose={() => handleClose(index)}
        />
      ))}
    </>
  );
};

export default UnlockNotificationWrapper;
