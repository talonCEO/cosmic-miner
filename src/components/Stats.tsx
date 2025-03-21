
import React, { useState, useEffect } from 'react';
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
          <p className="text-sm font-medium text-white">{boost.name}</p>
          <p className="text-xs text-slate-400">Used: {boost.quantity}x</p>
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
  
  // Updated tracked boost IDs to include cheap-upgrades and exclude time-warp
  const trackedBoostIds = [
    'boost-double-coins', 'boost-auto-tap',
    'boost-tap-boost', 'boost-cheap-upgrades', 'boost-essence-boost', 
    'boost-perma-tap', 'boost-perma-passive'
  ];
  
  // Filter out time-warp from active boosts display
  const activeBoosts = state.activeBoosts.filter(boost => 
    trackedBoostIds.includes(boost.id)
  );
  
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
        
        {/* Active Boosts Section */}
        {activeBoosts && activeBoosts.length > 0 && (
          <div className="mt-4">
            <h3 className="text-lg font-semibold mb-2 text-indigo-400">Active Boosts</h3>
            <div className="space-y-2">
              {activeBoosts.map((boost) => {
                const remainingTimeText = boost.remainingTime 
                  ? `${Math.floor(boost.remainingTime / 60)}m ${Math.floor(boost.remainingTime % 60)}s` 
                  : 'Permanent';
                  
                return (
                  <div key={boost.id} className="flex items-center justify-between p-2 bg-slate-800/40 rounded-md border border-indigo-500/20">
                    <div className="flex items-center">
                      <div className="mr-2">{boost.icon}</div>
                      <div>
                        <div className="font-medium">{boost.name}</div>
                        <div className="text-xs text-slate-400">{boost.description}</div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-green-400 font-medium">×{boost.quantity}</div>
                      {boost.remainingTime !== undefined && (
                        <div className="text-xs text-yellow-400">{remainingTimeText}</div>
                      )}
                    </div>
                  </div>
                );
              })}
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
            
            {/* Active Boosts Section in Dialog - filtered to exclude time-warp */}
            {activeBoosts && activeBoosts.length > 0 && (
              <div className="bg-slate-700/50 p-3 rounded-lg">
                <h3 className="text-sm font-semibold text-slate-300 mb-2 flex items-center">
                  <Sparkles size={16} className="text-indigo-400 mr-2" />
                  Active Boosts
                </h3>
                <div className="space-y-2 mt-2">
                  {activeBoosts.map(boost => (
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
