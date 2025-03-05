
import React from 'react';
import { GlobeIcon } from 'lucide-react';
import { DialogClose, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";

const planetColors = [
  "#8E9196", // Grey for the first planet (as requested)
  "#6E59A5", // Dark Purple
  "#F97316", // Bright Orange
  "#0EA5E9", // Ocean Blue
  "#D946EF", // Magenta Pink
  "#33C3F0", // Sky Blue
  "#D3E4FD", // Soft Blue
  "#FEC6A1", // Soft Orange
  "#E5DEFF", // Soft Purple
  "#FDE1D3"  // Soft Peach
];

const Planets: React.FC = () => {
  return (
    <>
      <DialogHeader className="p-4 border-b border-indigo-500/20">
        <DialogTitle className="text-center text-xl">Planets</DialogTitle>
        <DialogDescription className="text-center text-slate-300">
          Explore the cosmic frontiers
        </DialogDescription>
      </DialogHeader>
      
      <ScrollArea className="h-[60vh] relative">
        {/* Animated solar system background */}
        <div className="absolute inset-0 overflow-hidden opacity-20 pointer-events-none">
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-indigo-900 via-slate-900 to-black"></div>
          {/* Sun */}
          <div className="absolute left-1/2 top-1/2 w-12 h-12 rounded-full bg-yellow-300 -translate-x-1/2 -translate-y-1/2"></div>
          
          {/* Orbital rings and planets */}
          {[...Array(10)].map((_, i) => (
            <React.Fragment key={i}>
              {/* Orbital ring */}
              <div 
                className="absolute left-1/2 top-1/2 border border-slate-700/30 rounded-full opacity-40"
                style={{
                  width: `${(i+1) * 40}px`,
                  height: `${(i+1) * 40}px`,
                  transform: 'translate(-50%, -50%)',
                }}
              ></div>
              
              {/* Planet */}
              <div 
                className="absolute rounded-full"
                style={{
                  width: `${6 + i}px`,
                  height: `${6 + i}px`,
                  backgroundColor: planetColors[i] || "#ffffff",
                  left: `calc(50% + ${Math.cos(i * 0.8) * ((i+1) * 20)}px)`,
                  top: `calc(50% + ${Math.sin(i * 0.8) * ((i+1) * 20)}px)`,
                  animation: `orbit-${i} ${15 + i * 3}s linear infinite`,
                }}
              ></div>
              
              {/* Add keyframes for each planet's orbit - This will be handled by CSS in the real app */}
              <style>
                {`
                  @keyframes orbit-${i} {
                    0% {
                      transform: rotate(0deg) translateX(${(i+1) * 20}px);
                    }
                    100% {
                      transform: rotate(360deg) translateX(${(i+1) * 20}px);
                    }
                  }
                `}
              </style>
            </React.Fragment>
          ))}
        </div>
        
        {/* Planet buttons */}
        <div className="flex flex-col p-4 gap-3 relative z-10">
          {[...Array(10)].map((_, i) => (
            <button 
              key={i}
              className="bg-opacity-50 text-white py-3 px-4 rounded-lg font-medium hover:bg-opacity-75 transition-colors flex items-center justify-center gap-2 border border-white/10"
              style={{ 
                backgroundColor: planetColors[i] || "#ffffff",
                opacity: 0.5
              }}
            >
              <GlobeIcon size={20} />
              <span>Planet {i + 1}</span>
            </button>
          ))}
        </div>
      </ScrollArea>
      
      <div className="p-4 border-t border-indigo-500/20">
        <DialogClose className="w-full bg-slate-700/80 text-slate-200 py-3 px-4 rounded-lg font-medium hover:bg-slate-600 transition-colors">
          Back
        </DialogClose>
      </div>
    </>
  );
};

export default Planets;
