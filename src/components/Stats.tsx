
import React, { useState, useEffect } from 'react';
import { useGame } from '@/context/GameContext';
import { formatNumber, calculateClickMultiplier } from '@/utils/gameLogic';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { ShieldQuestion } from 'lucide-react';
import { 
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogClose
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";

const Stats: React.FC = () => {
  const { state } = useGame();
  const [resourceData, setResourceData] = useState<{ time: string; gross: number; net: number; coinsPerSecond: number; essence: number }[]>([]);
  
  useEffect(() => {
    const savedData = localStorage.getItem('resourceHistory');
    if (savedData) {
      try {
        const parsedData = JSON.parse(savedData);
        const convertedData = parsedData.map((item: any) => ({
          time: item.time,
          gross: item.totalEarned || 0,
          net: (item.totalEarned || 0) - ((item.totalEarned || 0) - (item.coins || 0)),
          coinsPerSecond: item.coinsPerSecond || 0,
          essence: item.essence || 0
        }));
        setResourceData(convertedData);
      } catch (e) {
        console.error("Error parsing saved data:", e);
        initializeData();
      }
    } else {
      initializeData();
    }
  }, []);

  const initializeData = () => {
    const initialData = {
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      gross: state.totalEarned,
      net: state.coins,
      coinsPerSecond: state.coinsPerSecond,
      essence: state.essence
    };
    setResourceData([initialData]);
  };

  useEffect(() => {
    const interval = setInterval(() => {
      const newDataPoint = {
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        gross: state.totalEarned,
        net: state.coins,
        coinsPerSecond: state.coinsPerSecond,
        essence: state.essence
      };
      
      setResourceData(prev => {
        const updatedData = [...prev, newDataPoint];
        const trimmedData = updatedData.slice(-20);
        localStorage.setItem('resourceHistory', JSON.stringify(trimmedData));
        return trimmedData;
      });
    }, 30000);
    
    return () => clearInterval(interval);
  }, [state.coins, state.totalEarned, state.coinsPerSecond, state.essence]);
  
  useEffect(() => {
    const handlePrestige = () => {
      const newDataPoint = {
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) + " (Prestige)",
        gross: 0,
        net: 0,
        coinsPerSecond: 0,
        essence: state.essence
      };
      
      setResourceData([newDataPoint]);
      localStorage.setItem('resourceHistory', JSON.stringify([newDataPoint]));
    };
    
    if (resourceData.length > 1) {
      const lastPoint = resourceData[resourceData.length - 1];
      if (lastPoint && state.totalEarned < lastPoint.gross * 0.5) {
        handlePrestige();
      }
    }
  }, [state.totalEarned, resourceData, state.essence]);
  
  const calculateActualCoinsPerTap = () => {
    // Get tap multiplier from tap power upgrade
    const tapPowerUpgrade = state.upgrades.find(u => u.id === 'tap-power-1');
    const tapBoostMultiplier = tapPowerUpgrade ? 1 + (tapPowerUpgrade.level * tapPowerUpgrade.coinsPerClickBonus) : 1;
    
    const clickMultiplier = calculateClickMultiplier(state.ownedArtifacts);
    
    // Match exact formula used in the CLICK action in GameContext
    const baseClickValue = state.coinsPerClick;
    const coinsPerSecondBonus = state.coinsPerSecond * 0.05;
    
    // Apply all ability boosts that affect tap income
    let tapIncomeMultiplier = 1;
    if (state.abilities.find(a => a.id === "ability-2" && a.unlocked)) {
      tapIncomeMultiplier += 0.5; // Quantum Vibration Enhancer: +50% tap power
    }
    if (state.abilities.find(a => a.id === "ability-5" && a.unlocked)) {
      // Not applying random critical chance here, just showing average value
    }
    if (state.abilities.find(a => a.id === "ability-8" && a.unlocked)) {
      tapIncomeMultiplier += 0.85; // Plasma Discharge Excavator: +85% tap value
    }
    if (state.abilities.find(a => a.id === "ability-11" && a.unlocked)) {
      tapIncomeMultiplier += 1.2; // Supernova Core Extractor: +120% tap value
    }
    
    return (baseClickValue + coinsPerSecondBonus) * state.incomeMultiplier * clickMultiplier * tapBoostMultiplier * tapIncomeMultiplier;
  };
  
  const calculateActualCoinsPerSecond = () => {
    // Apply all ability boosts that affect passive income
    let passiveIncomeMultiplier = 1;
    if (state.abilities.find(a => a.id === "ability-2" && a.unlocked)) {
      passiveIncomeMultiplier += 0.25; // Quantum Vibration Enhancer: +25% passive income
    }
    if (state.abilities.find(a => a.id === "ability-4" && a.unlocked)) {
      passiveIncomeMultiplier += 0.2; // Graviton Shield Generator: +20% passive income
    }
    if (state.abilities.find(a => a.id === "ability-6" && a.unlocked)) {
      passiveIncomeMultiplier += 0.3; // Dark Matter Attractor: +30% passive income
    }
    if (state.abilities.find(a => a.id === "ability-8" && a.unlocked)) {
      passiveIncomeMultiplier += 0.55; // Plasma Discharge Excavator: +55% passive income
    }
    if (state.abilities.find(a => a.id === "ability-9" && a.unlocked)) {
      passiveIncomeMultiplier += 0.65; // Nano-Bot Mining Swarm: +65% passive income
    }
    if (state.abilities.find(a => a.id === "ability-12" && a.unlocked)) {
      passiveIncomeMultiplier += 1.0; // Quantum Tunneling Drill: doubles passive income
    }
    
    return state.coinsPerSecond * state.incomeMultiplier * passiveIncomeMultiplier;
  };

  const stats = [
    { label: 'Global Multiplier', value: formatNumber(state.incomeMultiplier || 1) + 'x' },
    { label: 'Coins Earned', value: formatNumber(state.totalEarned) },
    { label: 'CPT (Coins Per Tap)', value: formatNumber(calculateActualCoinsPerTap()) },
    { label: 'CPS (Coins Per Sec)', value: formatNumber(calculateActualCoinsPerSecond()) }
  ];
  
  const formatYAxis = (value: number) => {
    if (value >= 1000000) return `${(value / 1000000).toFixed(1)}M`;
    if (value >= 1000) return `${(value / 1000).toFixed(1)}K`;
    return value.toString();
  };
  
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-slate-900/90 p-3 border border-indigo-500/30 rounded-lg">
          <p className="text-indigo-300 font-medium">{label}</p>
          {payload.map((entry: any, index: number) => (
            <p key={index} style={{ color: entry.color }}>
              {entry.name}: {formatNumber(entry.value)}
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  const calculateIncomeMultiplier = () => {
    let multiplier = 1.0;
    
    if (state.ownedArtifacts.includes("artifact-1")) {
      multiplier += 0.1;
    }
    if (state.ownedArtifacts.includes("artifact-6")) {
      multiplier += 0.25;
    }
    
    // Add ability bonuses to the overall multiplier
    if (state.abilities.find(a => a.id === "ability-3" && a.unlocked)) {
      multiplier += 0.4; // Neural Mining Matrix: +40% all income
    }
    if (state.abilities.find(a => a.id === "ability-6" && a.unlocked)) {
      multiplier += 0.45; // Dark Matter Attractor: +45% all income
    }
    if (state.abilities.find(a => a.id === "ability-10" && a.unlocked)) {
      multiplier += 0.55; // Interstellar Navigation AI: +55% global income
    }
    if (state.abilities.find(a => a.id === "ability-11" && a.unlocked)) {
      multiplier += 0.8; // Supernova Core Extractor: +80% all income
    }
    if (state.abilities.find(a => a.id === "ability-13" && a.unlocked)) {
      multiplier += 1.0; // Cosmic Singularity Engine: +100% all income
    }
    
    return multiplier.toFixed(2);
  };

  const allGameStats = [
    { category: "Resources", icon: "💰", name: "Coins", value: formatNumber(state.coins) },
    { category: "Resources", icon: "✨", name: "Essence", value: formatNumber(state.essence) },
    { category: "Resources", icon: "💵", name: "Gross Revenue", value: formatNumber(state.totalEarned) },
    { category: "Resources", icon: "📊", name: "Net Revenue", value: formatNumber(state.coins) },
    { category: "Production", icon: "👆", name: "Coins per Click", value: formatNumber(calculateActualCoinsPerTap()) },
    { category: "Production", icon: "⏱️", name: "Coins per Second", value: formatNumber(calculateActualCoinsPerSecond()) },
    { category: "Production", icon: "⚡", name: "Income Multiplier", value: `x${calculateIncomeMultiplier()}` },
    { category: "Interactions", icon: "🖱️", name: "Total Clicks", value: formatNumber(state.totalClicks) },
    { category: "Interactions", icon: "🔄", name: "Prestige Count", value: state.prestigeCount || 0 },
    { category: "Collections", icon: "👨‍💼", name: "Managers Owned", value: state.ownedManagers.length },
    { category: "Collections", icon: "🔮", name: "Artifacts Owned", value: state.ownedArtifacts.length },
    { category: "Achievements", icon: "🏆", name: "Achievements Unlocked", value: state.achievements.filter(a => a.unlocked).length },
  ];

  return (
    <div className="w-full mb-8 max-w-md mx-auto">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-lg font-medium text-white">Statistics</h2>
      </div>
      
      <div className="grid grid-cols-2 gap-4 mb-6">
        {stats.map((stat, index) => (
          <div 
            key={index}
            className="bg-game-upgrade-bg rounded-xl p-4 shadow-sm border border-game-upgrade-border card-hover animate-scale-in"
            style={{ animationDelay: `${index * 0.1}s` }}
          >
            <p className="text-sm text-slate-300 mb-1">{stat.label}</p>
            <p className="text-lg font-medium text-white">{stat.value}</p>
          </div>
        ))}
      </div>
      
      <div className="mt-8 bg-slate-800/40 rounded-xl p-4 border border-indigo-500/20">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-md font-medium text-white">Analytics</h3>
          
          <Dialog>
            <DialogTrigger asChild>
              <button className="p-2 rounded-md bg-slate-800/50 hover:bg-slate-700/50 transition-colors border border-slate-600/30">
                <ShieldQuestion size={18} className="text-slate-300" />
              </button>
            </DialogTrigger>
            <DialogContent className="max-w-md bg-slate-900 border border-indigo-500/30">
              <DialogHeader className="flex justify-between items-center border-b border-indigo-500/30 pb-4 mb-2">
                <DialogTitle className="text-xl font-bold text-white">Game Statistics</DialogTitle>
              </DialogHeader>
              <ScrollArea className="h-[60vh] pr-4">
                <div className="pr-4">
                  {Object.entries(
                    allGameStats.reduce((acc: { [key: string]: any[] }, stat) => {
                      if (!acc[stat.category]) acc[stat.category] = [];
                      acc[stat.category].push(stat);
                      return acc;
                    }, {})
                  ).map(([category, stats]) => (
                    <div key={category} className="mb-6">
                      <h3 className="text-md font-medium text-indigo-400 mb-2">{category}</h3>
                      <div className="bg-slate-800/50 rounded-lg border border-slate-700/50">
                        <table className="w-full">
                          <thead className="border-b border-slate-700/50">
                            <tr>
                              <th className="p-2 text-left text-xs text-slate-400">Name</th>
                              <th className="p-2 text-right text-xs text-slate-400">Value</th>
                            </tr>
                          </thead>
                          <tbody>
                            {(stats as any[]).map((stat, index) => (
                              <tr key={index} className="border-t border-slate-700/30 first:border-0">
                                <td className="p-3 text-left">
                                  <div className="flex items-center gap-2">
                                    <span className="text-lg">{stat.icon}</span>
                                    <span className="text-slate-200">{stat.name}</span>
                                  </div>
                                </td>
                                <td className="p-3 text-right font-medium text-slate-300">{stat.value}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </DialogContent>
          </Dialog>
        </div>
        
        <div className="h-64 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart
              data={resourceData}
              margin={{ top: 5, right: 5, left: 5, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
              <XAxis 
                dataKey="time" 
                tick={{ fill: '#94a3b8' }} 
                tickLine={{ stroke: '#4b5563' }}
                axisLine={{ stroke: '#4b5563' }}
              />
              <YAxis 
                tickFormatter={formatYAxis} 
                tick={{ fill: '#94a3b8' }} 
                tickLine={{ stroke: '#4b5563' }}
                axisLine={{ stroke: '#4b5563' }}
              />
              <Tooltip content={<CustomTooltip />} />
              <Legend wrapperStyle={{ paddingTop: '8px' }} />
              <Line 
                type="monotone" 
                dataKey="gross" 
                name="Gross" 
                stroke="#34d399" 
                strokeWidth={2} 
                dot={{ fill: '#34d399', r: 3 }}
                activeDot={{ r: 5 }}
              />
              <Line 
                type="monotone" 
                dataKey="net" 
                name="Net" 
                stroke="#60a5fa" 
                strokeWidth={2}
                dot={{ fill: '#60a5fa', r: 3 }}
                activeDot={{ r: 5 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
        
        <div className="mt-4 grid grid-cols-2 gap-2">
          <div className="text-center">
            <p className="text-xs text-slate-400">Gross</p>
            <p className="font-medium text-green-400">{formatNumber(state.totalEarned)}</p>
          </div>
          <div className="text-center">
            <p className="text-xs text-slate-400">Net</p>
            <p className="font-medium text-blue-400">{formatNumber(state.coins)}</p>
          </div>
        </div>
        
        <p className="text-xs text-slate-400 mt-2 text-center">
          {resourceData.length <= 1 
            ? "Tracking financial data over time. More data will appear soon..." 
            : `Showing the last ${resourceData.length} data points. Updated every 30 seconds.`}
        </p>
      </div>
    </div>
  );
};

export default Stats;
