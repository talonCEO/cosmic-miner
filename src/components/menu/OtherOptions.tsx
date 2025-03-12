import React from 'react';
import { DialogClose } from "@/components/ui/dialog";
import { useToast } from "@/components/ui/use-toast";
import { StorageService } from '@/services/StorageService';

interface OtherOptionsProps {
  onClose: () => void;
}

const OtherOptions: React.FC<OtherOptionsProps> = ({ onClose }) => {
  const { toast } = useToast();
  
  // Add a function to reset game progress
  const resetGameProgress = async () => {
    if (confirm("Are you sure you want to reset all game progress? This cannot be undone.")) {
      await StorageService.clearGameState();
      // Reload the page to start fresh
      window.location.reload();
    }
  };
  
  return (
    <>
      <div className="p-4 space-y-4">
        <p className="text-slate-300">
          Here you can find other options related to the game.
        </p>
        
        <button
          onClick={resetGameProgress}
          className="w-full bg-red-700/80 text-slate-200 py-3 px-4 rounded-lg font-medium hover:bg-red-600 transition-colors"
        >
          Reset Game Progress
        </button>
      </div>
      
      <div className="p-4 mt-auto border-t border-indigo-500/20">
        <DialogClose className="w-full bg-slate-700/80 text-slate-200 py-3 px-4 rounded-lg font-medium hover:bg-slate-600 transition-colors">
          Back
        </DialogClose>
      </div>
    </>
  );
};

export default OtherOptions;
