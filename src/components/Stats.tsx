import React, { useState, useEffect } from 'react';
import { useGame } from '@/context/GameContext';
import { formatNumber } from '@/utils/gameLogic';
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogHeader, 
  DialogTitle,
  DialogTrigger,
  DialogClose
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";

const Stats: React.FC = () => {
  const { state } = useGame();
  const [chartData, setChartData] = useState<any[]>([]);
  const [resourceData, setResourceData] = useState<any[]>([]);
  
  // Record data points for the chart
  useEffect(() => {
    const now = new Date();
    const newDataPoint = {
      time: now.toLocaleTimeString(),
      coins: state.coins,
      essence: state.essence
    };
    
    setChartData(prev => {
      const updated = [...prev, newDataPoint];
      // Keep only the last 10 data points
      if (updated.length > 10) {
        return updated.slice(updated.length - 10);
      }
      return updated;
    });
  }, [state.coins, state.essence]);
  
  // Record resource data
  useEffect(() => {
    const topUpgrades = state.upgrades
      .filter(u => u.level > 0)
      .sort((a, b) => b.level - a.level)
      .slice(0, 5);
    
    const topUpgradesData = topUpgrades.map(upgrade => ({
      name: upgrade.name,
      level: upgrade.level,
      contribution: upgrade.coinsPerSecondBonus * upgrade.level
    }));
    
    setResourceData(topUpgradesData);
  }, [state.upgrades]);
  
  // Calculate distribution for the pie chart
  const calculateResourceDistribution = () => {
    const totalContribution = resourceData.reduce((sum, item) => sum + item.contribution, 0);
    
    if (totalContribution === 0) return [];
    
    return resourceData.map(item => ({
      ...item,
      percentage: Math.round((item.contribution / totalContribution) * 100)
    }));
  };
  
  // Effect to maintain chart data over time
  useEffect(() => {
    const interval = setInterval(() => {
      const now = new Date();
      const newDataPoint = {
        time: now.toLocaleTimeString(),
        coins: state.coins,
        essence: state.essence
      };
      
      setChartData(prev => {
        const updated = [...prev, newDataPoint];
        if (updated.length > 10) {
          return updated.slice(updated.length - 10);
        }
        return updated;
      });
    }, 30000); // Update every 30 seconds
    
    return () => clearInterval(interval);
  }, [state.totalEarned, resourceData, state.essence]);
  
  const stats = [
    { label: 'Global Multiplier', value: formatNumber(state.incomeMultiplier || 1, 2) + 'x' },
    { label: 'Coins Earned', value: formatNumber(state.totalEarned) },
    { label: 'CPT (Coins Per Tap)', value: formatNumber(state.coinsPerClick) },
    { label: 'CPS (Coins Per Sec)', value: formatNumber(state.coinsPerSecond) }
  ];
  
  const distribution = calculateResourceDistribution();
  
  return (
    <Dialog>
      <DialogTrigger asChild>
        <button className="flex items-center gap-2 bg-indigo-600/20 hover:bg-indigo-600/30 px-4 py-2 rounded-lg text-indigo-100 transition-colors">
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M3 3v18h18" />
            <path d="m19 9-5 5-4-4-3 3" />
          </svg>
          <span>Stats</span>
        </button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md bg-slate-900/90 border-indigo-500/30 p-0 backdrop-blur-sm shadow-xl">
        <DialogHeader className="p-4 border-b border-indigo-500/20">
          <div className="flex items-center justify-between">
            <DialogTitle className="text-xl">Game Statistics</DialogTitle>
            <DialogClose className="rounded-full p-1.5 hover:bg-slate-800/70 transition-colors">
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M12 4L4 12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                <path d="M4 4L12 12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
              </svg>
            </DialogClose>
          </div>
          <DialogDescription className="text-slate-300">
            Track your mining progress
          </DialogDescription>
        </DialogHeader>
        
        <ScrollArea className="h-[70vh] p-4">
          <div className="grid grid-cols-2 gap-4 mb-6">
            {stats.map((stat, i) => (
              <div key={i} className="bg-slate-800/60 p-3 rounded-lg flex flex-col">
                <span className="text-xs text-slate-400">{stat.label}</span>
                <span className="text-lg mt-1 font-medium text-indigo-300">{stat.value}</span>
              </div>
            ))}
          </div>
          
          <div className="mb-6">
            <h3 className="text-lg font-medium mb-3 text-white">Resource Breakdown</h3>
            {distribution.length > 0 ? (
              <div className="space-y-2">
                {distribution.map((item, i) => (
                  <div key={i} className="flex items-center">
                    <div className="w-1/3 text-sm text-slate-300 truncate">{item.name}</div>
                    <div className="w-1/3">
                      <div className="h-2 bg-slate-700 rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-indigo-500 rounded-full"
                          style={{ width: `${item.percentage}%` }}
                        ></div>
                      </div>
                    </div>
                    <div className="w-1/3 text-right text-xs text-slate-400">
                      {item.percentage}% (Lvl {item.level})
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-slate-500">Start collecting resources to see data</p>
            )}
          </div>
          
          <div>
            <h3 className="text-lg font-medium mb-3 text-white">Progress Over Time</h3>
            {chartData.length > 1 ? (
              <div className="h-64 relative">
                <div className="absolute inset-0 flex flex-col">
                  <div className="flex-1 border-b border-slate-700/50 relative">
                    <span className="absolute right-0 top-0 text-xs text-slate-500">Max</span>
                  </div>
                  <div className="flex-1 relative">
                    <span className="absolute right-0 bottom-0 text-xs text-slate-500">Min</span>
                  </div>
                </div>
                <div className="absolute bottom-0 left-0 right-0 flex items-end h-56 gap-1">
                  {chartData.map((point, i) => {
                    const maxCoin = Math.max(...chartData.map(d => d.coins));
                    const height = maxCoin ? (point.coins / maxCoin) * 100 : 0;
                    
                    return (
                      <div key={i} className="flex flex-col items-center flex-1">
                        <div 
                          className="w-full bg-indigo-600/70 rounded-t"
                          style={{ height: `${height}%` }}
                        ></div>
                        <span className="text-[9px] text-slate-500 rotate-90 mt-1 origin-top-left absolute -bottom-6 truncate">{point.time}</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            ) : (
              <p className="text-sm text-slate-500">Keep playing to see your progress over time</p>
            )}
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
};

export default Stats;
