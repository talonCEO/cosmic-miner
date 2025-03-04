
import React, { useState } from 'react';
import { useGame } from '@/context/GameContext';
import { toast } from "sonner";
import { 
  Dialog,
  DialogContent, 
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { 
  ServerCog, 
  Zap,
  MousePointer,
  Coins,
  Sparkles
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";

const AdminPanel: React.FC = () => {
  const { state, toggleAutoTap, setIncomeMultiplier, addCoins, addEssence } = useGame();
  const [multiplierInput, setMultiplierInput] = useState("1.0");
  
  const handleGiveUnlimitedCoins = () => {
    addCoins(1000000000);
    toast.success("Added 1,000,000,000 coins!", {
      position: "top-center",
    });
  };
  
  const handleGiveUnlimitedEssence = () => {
    addEssence(1000000);
    toast.success("Added 1,000,000 essence!", {
      position: "top-center",
    });
  };
  
  const handleMultiplierChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setMultiplierInput(e.target.value);
  };
  
  const handleSetMultiplier = () => {
    const multiplier = parseFloat(multiplierInput);
    if (isNaN(multiplier) || multiplier <= 0) {
      toast.error("Please enter a valid positive number for the multiplier");
      return;
    }
    
    setIncomeMultiplier(multiplier);
    toast.success(`Income multiplier set to ${multiplier}x`, {
      position: "top-center",
    });
  };
  
  return (
    <Dialog>
      <DialogTrigger asChild>
        <button className="flex items-center gap-2 bg-red-500/20 hover:bg-red-500/30 text-red-200 px-3 py-2 rounded-md border border-red-500/30 transition-colors">
          <ServerCog size={18} />
          <span className="font-medium">Admin Panel</span>
        </button>
      </DialogTrigger>
      <DialogContent className="bg-slate-900 border border-red-500/30 max-w-md">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold text-white flex items-center gap-2">
            <ServerCog className="text-red-400" /> Admin Panel
          </DialogTitle>
        </DialogHeader>
        
        <div className="mt-4 space-y-6">
          <div className="bg-slate-800/50 rounded-lg p-4 border border-slate-700/50">
            <h3 className="text-md font-medium text-red-400 mb-3">Game Controls</h3>
            
            {/* Auto Tap Toggle */}
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <MousePointer size={18} className="text-slate-300" />
                <Label htmlFor="auto-tap" className="text-slate-300">Auto Tap</Label>
              </div>
              <Switch 
                id="auto-tap" 
                checked={state.autoTap || false} 
                onCheckedChange={toggleAutoTap}
              />
            </div>
            
            {/* Income Multiplier Control */}
            <div className="mb-4">
              <div className="flex items-center gap-2 mb-2">
                <Zap size={18} className="text-slate-300" />
                <Label htmlFor="multiplier" className="text-slate-300">Income Multiplier</Label>
              </div>
              <div className="flex gap-2">
                <Input 
                  id="multiplier" 
                  type="number"
                  min="0.1"
                  step="0.1"
                  value={multiplierInput} 
                  onChange={handleMultiplierChange}
                  className="bg-slate-800 border-slate-700 text-white"
                />
                <button 
                  onClick={handleSetMultiplier}
                  className="px-3 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-md transition-colors"
                >
                  Set
                </button>
              </div>
              <p className="text-xs text-slate-400 mt-1">Current multiplier: {state.incomeMultiplier || "1.0"}x</p>
            </div>
          </div>
          
          <div className="bg-slate-800/50 rounded-lg p-4 border border-slate-700/50">
            <h3 className="text-md font-medium text-red-400 mb-3">Resource Cheats</h3>
            
            <div className="grid grid-cols-2 gap-3">
              <button 
                onClick={handleGiveUnlimitedCoins}
                className="flex items-center justify-center gap-2 bg-amber-600/20 hover:bg-amber-600/30 text-amber-200 px-3 py-3 rounded-md border border-amber-500/30 transition-colors"
              >
                <Coins size={18} />
                <span>Unlimited Coins</span>
              </button>
              
              <button 
                onClick={handleGiveUnlimitedEssence}
                className="flex items-center justify-center gap-2 bg-purple-600/20 hover:bg-purple-600/30 text-purple-200 px-3 py-3 rounded-md border border-purple-500/30 transition-colors"
              >
                <Sparkles size={18} />
                <span>Unlimited Essence</span>
              </button>
            </div>
          </div>
          
          <div className="bg-slate-800/50 rounded-lg p-4 border border-slate-700/50">
            <h3 className="text-md font-medium text-red-400 mb-3">Debug Information</h3>
            <div className="text-xs text-slate-400 space-y-1">
              <p>Game Version: DEV-1.0.0</p>
              <p>Debugging Mode: Enabled</p>
              <p>Admin Controls: Active</p>
            </div>
          </div>
        </div>
        
        <p className="text-xs text-red-400 italic mt-2 text-center">
          For development purposes only. These controls will be disabled in production.
        </p>
      </DialogContent>
    </Dialog>
  );
};

export default AdminPanel;
