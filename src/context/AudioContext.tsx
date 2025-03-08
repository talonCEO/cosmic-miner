
import React, { createContext, useContext, useState, useEffect, useRef } from 'react';

interface AudioContextType {
  isMuted: boolean;
  toggleMute: () => void;
  isPlaying: boolean;
}

const AudioContext = createContext<AudioContextType | undefined>(undefined);

export const AudioProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isMuted, setIsMuted] = useState(() => {
    // Check if user has previously set a preference
    const savedMute = localStorage.getItem('audioMuted');
    return savedMute === 'true';
  });
  
  const [isPlaying, setIsPlaying] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    // Create audio element for background music
    const audio = new Audio('/src/assets/music/background-music.mp3');
    audio.loop = true;
    audio.volume = 0.3; // Set to a quiet level
    audioRef.current = audio;
    
    // Start playing on component mount if not muted
    if (!isMuted) {
      const playPromise = audio.play();
      if (playPromise !== undefined) {
        playPromise
          .then(() => {
            setIsPlaying(true);
          })
          .catch(error => {
            // Auto-play was prevented, need user interaction first
            console.warn('Audio playback prevented by browser:', error);
            setIsPlaying(false);
          });
      }
    }
    
    return () => {
      // Cleanup on unmount
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.src = '';
      }
    };
  }, []);

  useEffect(() => {
    // Handle mute/unmute changes
    if (!audioRef.current) return;
    
    if (isMuted) {
      audioRef.current.pause();
      setIsPlaying(false);
    } else {
      const playPromise = audioRef.current.play();
      if (playPromise !== undefined) {
        playPromise
          .then(() => {
            setIsPlaying(true);
          })
          .catch(() => {
            setIsPlaying(false);
          });
      }
    }
    
    // Save preference to localStorage
    localStorage.setItem('audioMuted', isMuted.toString());
  }, [isMuted]);

  const toggleMute = () => {
    setIsMuted(prev => !prev);
  };

  return (
    <AudioContext.Provider value={{ isMuted, toggleMute, isPlaying }}>
      {children}
    </AudioContext.Provider>
  );
};

export const useAudio = (): AudioContextType => {
  const context = useContext(AudioContext);
  if (context === undefined) {
    throw new Error('useAudio must be used within an AudioProvider');
  }
  return context;
};
