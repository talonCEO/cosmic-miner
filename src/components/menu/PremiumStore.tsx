
import React from 'react';
import { Sparkles } from 'lucide-react';
import { DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import GemPackage from './GemPackage';
import { gemPackages } from './types/premiumStore';

const PremiumStore: React.FC = () => {
  return (
    <>
      <DialogHeader className="p-4 border-b border-indigo-500/20">
        <DialogTitle className="text-xl">Premium Store</DialogTitle>
      </DialogHeader>
      
      <ScrollArea className="h-[60vh]">
        <div className="p-4">
          <div className="flex items-center mb-4 bg-amber-900/30 rounded-lg p-2">
            <Sparkles size={16} className="text-yellow-400 mr-1" />
            <p className="font-medium text-yellow-300">Premium Currency</p>
          </div>
          
          <div className="space-y-4">
            <h3 className="font-semibold text-center border-b border-amber-500/30 pb-1">
              Gem Packages
            </h3>
            <div className="grid grid-cols-3 gap-3">
              {gemPackages.map(pack => (
                <GemPackage key={pack.id} pack={pack} />
              ))}
            </div>
          </div>
        </div>
      </ScrollArea>
    </>
  );
};

export default PremiumStore;
