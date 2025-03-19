import React, { useState } from 'react';
import { useGame } from '@/context/GameContext';
import { formatNumber } from '@/utils/gameLogic';
import { 
  Bitcoin, 
  MousePointer, 
  Sparkles, 
  Gauge, 
  Recycle, 
  BarChart,
  Gem 
} from 'lucide-react';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle 
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';

const Stats: React.FC = () => {
  const { state, calculatePotentialEssenceReward, activeBoosts } = useGame();
  const [showStatsDialog, setShowStatsDialog] = useState(false);
  
  const tapPower = state.coinsPerClick;
  const totalCPS = state.coinsPerSecond;
  const globalMultiplier = state.incomeMultiplier;

  // Robust time formatting
  const formatTime = (seconds?: number) => {
    if (typeof seconds !== 'number' || isNaN(seconds) || seconds < 0) return '0:00';
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  // Debug log to inspect activeBoosts
  console.log('Active Boosts in Stats:', activeBoosts);

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

        {/* Active Boosts Section with Safety Checks */}
        {Array.isArray(activeBoosts) && activeBoosts.length > 0 ? (
          <div className="mt-4">
            <h3 className="text-sm font-medium text-slate-300 mb-2">Active Boosts</h3>
            <div className="space-y-2">
              {activeBoosts.map((boost, index) => (
                <div key={boost.id || index} className="bg-slate-900/50 p-2 rounded-lg flex justify-between items-center">
                  <span className="text-sm text-white">
                    {boost.id === 'boost-double-coins' ? 'Double Coins (x2)' : boost.id || 'Unknown Boost'}
                  </span>
                  <span className="text-sm text-slate-400">
                    {boost.remainingTime !== undefined ? formatTime(boost.remainingTime) : 'Permanent'}
                  </span>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="mt-4 text-sm text-slate-400">No active boosts</div>
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
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Stats;
