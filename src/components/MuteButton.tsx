
import React from 'react';
import { Volume2, VolumeX } from 'lucide-react';
import { useAudio } from '@/context/AudioContext';
import { Button } from '@/components/ui/button';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

const MuteButton: React.FC = () => {
  const { isMuted, toggleMute } = useAudio();
  
  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={toggleMute}
            className="p-2 rounded-full bg-slate-800/40 hover:bg-slate-700/60 backdrop-blur-sm border border-indigo-500/20"
          >
            {isMuted ? (
              <VolumeX size={20} className="text-slate-300" />
            ) : (
              <Volume2 size={20} className="text-indigo-400" />
            )}
          </Button>
        </TooltipTrigger>
        <TooltipContent side="bottom" className="bg-slate-800 border-slate-700 p-2">
          <p>{isMuted ? 'Unmute Music' : 'Mute Music'}</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};

export default MuteButton;
