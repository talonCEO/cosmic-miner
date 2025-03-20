// stats.tsx
// ... (existing imports)

const ActiveBoost: React.FC<{ boost: BoostEffect }> = ({ boost }) => {
  const [timeLeft, setTimeLeft] = useState<number>(boost.remainingTime || 0);
  
  React.useEffect(() => {
    if (!boost.duration) return;
    
    const interval = setInterval(() => {
      if (boost.remainingTime !== undefined) {
        setTimeLeft(boost.remainingTime);
      }
    }, 1000);
    
    return () => clearInterval(interval);
  }, [boost]);import React, { useState, useEffect } from 'react';
import { useGame } from '@/context/GameContext';
import { formatNumber } from '@/utils/gameLogic';
import { 
  Bitcoin, 
  MousePointer, 
  Sparkles, 
  Gauge, 
  Recycle, 
  BarChart,
  Gem,
  Timer 
} from 'lucide-react';
import { useBoostManager } from '@/hooks/useBoostManager';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle 
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { calculateTapValue } from '@/utils/GameMechanics';
import { BoostEffect } from '@/components/menu/types';

const ActiveBoost: React.FC<{ boost: BoostEffect }> = ({ boost }) => {
  const [timeLeft, setTimeLeft] = useState<number>(boost.remainingTime || 0);
  
  React.useEffect(() => {
    if (!boost.duration) return;
    
    const interval = setInterval(() => {
      if (boost.remainingTime !== undefined) {
        setTimeLeft(boost.remainingTime);
      }
    }, 1000);
    
    return () => clearInterval(interval);
  }, [boost]);
  
  const formatTime = (seconds: number) => {
    if (seconds <= 0) return "Expired";
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  return (
    <div className="bg-slate-900/60 border border-slate-700/60 rounded-lg p-2 mb-2 flex justify-between items-center">
      <div className="flex items-center">
        <div className="mr-2 text-lg">
          {boost.icon}
        </div>
        <div>
          <p className="text-sm font-medium text-white">{boost.name} (x{boost.quantity})</p>
          <p className="text-xs text-slate-400">{boost.description}</p>
        </div>
      </div>
      {boost.duration ? (
        <div className="flex items-center text-xs text-slate-300">
          <Timer size={14} className="mr-1" />
          {formatTime(timeLeft)}
        </div>
      ) : (
        <div className="text-xs text-indigo-400 font-medium">
          Permanent
        </div>
      )}
    </div>
  );
};

const Stats: React.FC = () => {
  const { state, calculatePotentialEssenceReward } = useGame();
  const { calculateTotalCPS, calculateGlobalIncomeMultiplier } = useBoostManager();
  const [showStatsDialog, setShowStatsDialog] = useState(false);
  
  const totalCPS = calculateTotalCPS();
  const globalMultiplier = calculateGlobalIncomeMultiplier();
  const tapPower = calculateTapValue(state);
  
  // Sort activeBoosts: boosts with duration first, then permanent ones
  const sortedActiveBoosts = [...state.activeBoosts].sort((a, b) => {
    if (a.duration && !b.duration) return -1; // a has duration, b doesn't
    if (!a.duration && b.duration) return 1;  // b has duration, a doesn't
    return 0; // both have/no duration, maintain order
  });
  
  return (
    <div className="w-full max-w-md mx-auto pb-12">
      <div className="p-4 rounded-xl bg-slate-800/40 backdrop-blur-sm border border-slate-700/40 relative">
        <h2 className="text-lg font-medium mb-4 text-center text-slate-100">Game Statistics</h2>
        
        <Button 
          variant="ghost" 
          size="icon" 
          onClick={() => setShowStatsDialog(true)}
          className="absolute right-2 top-2 text-slate-300 hover:text-white hover:bg-slate-700/50"
        >
          <BarChart size={18} />
        </Button>
        
        <div className="grid grid-cols-2 gap-4">
          <div className="flex flex-col items-center justify-center bg-slate-900/30 p-3 rounded-lg border border-slate-700/30">
            <div className="flex items-center mb-1">
              <MousePointer size={18} className="text-yellow-400 mr-2" />
              <span className="text-xs font-medium text-slate-300">Drill Power</span>
            </div>
            <span className="text-lg font-bold text-yellow-300">{formatNumber(tapPower)}</span>
            <span className="text-xs text-slate-500 mt-1">Clicks: {formatNumber(state.totalClicks)}</span>
          </div>
          
          <div className="flex flex-col items-center justify-center bg-slate-900/30 p-3 rounded-lg border border-slate-700/30">
            <div className="flex items-center mb-1">
              <Gauge size={18} className="text-blue-400 mr-2" />
              <span className="text-xs font-medium text-slate-300">Mining Rate</span>
            </div>
            <span className="text-lg font-bold text-blue-300">{formatNumber(totalCPS)}/s</span>
            <span className="text-xs text-slate-500 mt-1">Passive Income</span>
          </div>
          
          <div className="flex flex-col items-center justify-center bg-slate-900/30 p-3 rounded-lg border border-slate-700/30">
            <div className="flex items-center mb-1">
              <Sparkles size={18} className="text-purple-400 mr-2" />
              <span className="text-xs font-medium text-slate-300">Global Multiplier</span>
            </div>
            <span className="text-lg font-bold text-purple-300">x{formatNumber(globalMultiplier)}</span>
            <span className="text-xs text-slate-500 mt-1">Boosts All Income</span>
          </div>
          
          <div className="flex flex-col items-center justify-center bg-slate-900/30 p-3 rounded-lg border border-slate-700/30">
            <div className="flex items-center mb-1">
              <Sparkles size={18} className="text-purple-300 mr-2" />
              <span className="text-xs font-medium text-slate-300">Essence</span>
            </div>
            <span className="text-lg font-bold text-purple-300">{formatNumber(state.essence)}</span>
            <span className="text-xs text-slate-500 mt-1">+{formatNumber(calculatePotentialEssenceReward())}</span>
          </div>
          
          <div className="col-span-2 flex flex-col items-center justify-center bg-slate-900/30 p-3 rounded-lg border border-slate-700/30">
            <div className="flex items-center mb-1">
              <Recycle size={18} className="text-indigo-400 mr-2" />
              <span className="text-xs font-medium text-slate-300">Prestige Level</span>
            </div>
            <span className="text-lg font-bold text-indigo-300">{state.prestigeCount}</span>
            <span className="text-xs text-slate-500 mt-1">Coins Earned: {formatNumber(state.totalEarned)}</span>
          </div>
        </div>
        
        {sortedActiveBoosts.length > 0 && (
          <div className="mt-4">
            <h3 className="text-lg font-semibold mb-2 text-indigo-400">Active Boosts</h3>
            <div className="space-y-2">
              {sortedActiveBoosts.map((boost) => (
                <ActiveBoost key={boost.id} boost={boost} />
              ))}
            </div>
          </div>
        )}
      </div>

      <Dialog open={showStatsDialog} onOpenChange={setShowStatsDialog}>
        <DialogContent className="bg-slate-800 border-slate-700 text-white max-w-md mx-auto">
          <DialogHeader>
            <DialogTitle className="text-center text-xl font-bold text-white">Deep Space Mining Corp. Performance Metrics</DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4 p-2">
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-slate-700/50 p-3 rounded-lg">
                <h3 className="text-sm font-semibold text-slate-300 mb-1">Galactic Treasury</h3>
                <p className="text-lg font-bold text-yellow-300">{formatNumber(state.coins)}</p>
              </div>
              
              <div className="bg-slate-700/50 p-3 rounded-lg">
                <h3 className="text-sm font-semibold text-slate-300 mb-1">Lifetime Revenue</h3>
                <p className="text-lg font-bold text-yellow-300">{formatNumber(state.totalEarned)}</p>
              </div>
              
              <div className="bg-slate-700/50 p-3 rounded-lg">
                <h3 className="text-sm font-semibold text-slate-300 mb-1">Asteroid Demolisher</h3>
                <p className="text-lg font-bold text-green-300">{formatNumber(tapPower)}</p>
              </div>
              
              <div className="bg-slate-700/50 p-3 rounded-lg">
                <h3 className="text-sm font-semibold text-slate-300 mb-1">Excavation Events</h3>
                <p className="text-lg font-bold text-green-300">{formatNumber(state.totalClicks)}</p>
              </div>
              
              <div className="bg-slate-700/50 p-3 rounded-lg">
                <h3 className="text-sm font-semibold text-slate-300 mb-1">Automated Yield</h3>
                <p className="text-lg font-bold text-blue-300">{formatNumber(totalCPS)}/s</p>
              </div>
              
              <div className="bg-slate-700/50 p-3 rounded-lg">
                <h3 className="text-sm font-semibold text-slate-300 mb-1">Company Efficiency</h3>
                <p className="text-lg font-bold text-purple-300">x{formatNumber(globalMultiplier)}</p>
              </div>
              
              <div className="bg-slate-700/50 p-3 rounded-lg">
                <h3 className="text-sm font-semibold text-slate-300 mb-1">Mystical Essence</h3>
                <p className="text-lg font-bold text-indigo-300">{formatNumber(state.essence)}</p>
              </div>
              
              <div className="bg-slate-700/50 p-3 rounded-lg">
                <h3 className="text-sm font-semibold text-slate-300 mb-1">Corporate Resets</h3>
                <p className="text-lg font-bold text-indigo-300">{state.prestigeCount}</p>
              </div>
            </div>
            
            <div className="bg-slate-700/50 p-3 rounded-lg">
              <h3 className="text-sm font-semibold text-slate-300 mb-2">Pending Liquidation Value</h3>
              <p className="text-md font-bold text-indigo-300">+{formatNumber(calculatePotentialEssenceReward())} Essence</p>
            </div>
            
            {sortedActiveBoosts.length > 0 && (
              <div className="bg-slate-700/50 p-3 rounded-lg">
                <h3 className="text-sm font-semibold text-slate-300 mb-2 flex items-center">
                  <Sparkles size={16} className="text-indigo-400 mr-2" />
                  Active Boosts
                </h3>
                <div className="space-y-2 mt-2">
                  {sortedActiveBoosts.map(boost => (
                    <ActiveBoost key={boost.id} boost={boost} />
                  ))}
                </div>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Stats;
  
  const formatTime = (seconds: number) => {
    if (seconds <= 0) return "Expired";
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  return (
    <div className="bg-slate-900/60 border border-slate-700/60 rounded-lg p-2 mb-2 flex justify-between items-center">
      <div className="flex items-center">
        <div className="mr-2 text-lg">
          {boost.icon}
        </div>
        <div>
          <p className="text-sm font-medium text-white">{boost.name} (x{boost.quantity})</p>
          <p className="text-xs text-slate-400">{boost.description}</p>
        </div>
      </div>
      {boost.duration ? (
        <div className="flex items-center text-xs text-slate-300">
          <Timer size={14} className="mr-1" />
          {formatTime(timeLeft)}
        </div>
      ) : (
        <div className="text-xs text-indigo-400 font-medium">
          Permanent
        </div>
      )}
    </div>
  );
};

const Stats: React.FC = () => {
  const { state, calculatePotentialEssenceReward } = useGame();
  const { calculateTotalCPS, calculateGlobalIncomeMultiplier } = useBoostManager();
  const [showStatsDialog, setShowStatsDialog] = useState(false);
  
  const totalCPS = calculateTotalCPS();
  const globalMultiplier = calculateGlobalIncomeMultiplier();
  const tapPower = calculateTapValue(state);
  
  // Sort activeBoosts: boosts with duration first, then permanent ones
  const sortedActiveBoosts = [...state.activeBoosts].sort((a, b) => {
    if (a.duration && !b.duration) return -1; // a has duration, b doesn't
    if (!a.duration && b.duration) return 1;  // b has duration, a doesn't
    return 0; // both have/no duration, maintain order
  });
  
  return (
    <div className="w-full max-w-md mx-auto pb-12">
      <div className="p-4 rounded-xl bg-slate-800/40 backdrop-blur-sm border border-slate-700/40 relative">
        {/* ... (rest of the existing code until Active Boosts Section) */}
        
        {sortedActiveBoosts.length > 0 && (
          <div className="mt-4">
            <h3 className="text-lg font-semibold mb-2 text-indigo-400">Active Boosts</h3>
            <div className="space-y-2">
              {sortedActiveBoosts.map((boost) => (
                <ActiveBoost key={boost.id} boost={boost} />
              ))}
            </div>
          </div>
        )}
      </div>

      <Dialog open={showStatsDialog} onOpenChange={setShowStatsDialog}>
        <DialogContent className="bg-slate-800 border-slate-700 text-white max-w-md mx-auto">
          {/* ... (rest of the dialog content) */}
          {sortedActiveBoosts.length > 0 && (
            <div className="bg-slate-700/50 p-3 rounded-lg">
              <h3 className="text-sm font-semibold text-slate-300 mb-2 flex items-center">
                <Sparkles size={16} className="text-indigo-400 mr-2" />
                Active Boosts
              </h3>
              <div className="space-y-2 mt-2">
                {sortedActiveBoosts.map(boost => (
                  <ActiveBoost key={boost.id} boost={boost} />
                ))}
              </div>
            </div>
          )}
          {/* ... (rest of dialog) */}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Stats;
