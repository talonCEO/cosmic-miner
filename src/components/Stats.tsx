import React, { useState, useEffect } from 'react';
import { useGame } from '@/context/GameContext';
import { formatNumber } from '@/utils/gameLogic';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';

const Stats: React.FC = () => {
  const { state } = useGame();
  const [resourceData, setResourceData] = useState<{ time: string; coins: number; totalEarned: number; coinsPerSecond: number }[]>([]);
  
  useEffect(() => {
    const savedData = localStorage.getItem('resourceHistory');
    if (savedData) {
      setResourceData(JSON.parse(savedData));
    } else {
      const initialData = {
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        coins: state.coins,
        totalEarned: state.totalEarned,
        coinsPerSecond: state.coinsPerSecond
      };
      setResourceData([initialData]);
    }
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      const newDataPoint = {
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        coins: state.coins,
        totalEarned: state.totalEarned,
        coinsPerSecond: state.coinsPerSecond
      };
      
      setResourceData(prev => {
        const updatedData = [...prev, newDataPoint];
        const trimmedData = updatedData.slice(-20);
        localStorage.setItem('resourceHistory', JSON.stringify(trimmedData));
        return trimmedData;
      });
    }, 30000);
    
    return () => clearInterval(interval);
  }, [state.coins, state.totalEarned, state.coinsPerSecond]);
  
  useEffect(() => {
    const handlePrestige = () => {
      const newDataPoint = {
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) + " (Prestige)",
        coins: 0,
        totalEarned: 0,
        coinsPerSecond: 0
      };
      
      setResourceData([newDataPoint]);
      localStorage.setItem('resourceHistory', JSON.stringify([newDataPoint]));
    };
    
    if (resourceData.length > 1) {
      const lastPoint = resourceData[resourceData.length - 1];
      if (lastPoint && state.totalEarned < lastPoint.totalEarned * 0.5) {
        handlePrestige();
      }
    }
  }, [state.totalEarned, resourceData]);
  
  const stats = [
    { label: 'Total Taps', value: formatNumber(state.totalClicks) },
    { label: 'Total Earned', value: formatNumber(state.totalEarned) },
    { label: 'Coins per Tap', value: formatNumber(state.coinsPerClick) },
    { label: 'Coins per Second', value: formatNumber(state.coinsPerSecond) }
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
  
  return (
    <div className="w-full mb-8 max-w-md mx-auto">
      <h2 className="text-lg font-medium mb-4 text-center text-white">Statistics</h2>
      
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
        <h3 className="text-md font-medium mb-4 text-center text-white">Resource History</h3>
        
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
                dataKey="coins" 
                name="Coins" 
                stroke="#60a5fa" 
                strokeWidth={2} 
                dot={{ fill: '#60a5fa', r: 3 }}
                activeDot={{ r: 5 }}
              />
              <Line 
                type="monotone" 
                dataKey="totalEarned" 
                name="Total Earned" 
                stroke="#a78bfa" 
                strokeWidth={2}
                dot={{ fill: '#a78bfa', r: 3 }}
                activeDot={{ r: 5 }}
              />
              <Line 
                type="monotone" 
                dataKey="coinsPerSecond" 
                name="CPS" 
                stroke="#34d399" 
                strokeWidth={2}
                dot={{ fill: '#34d399', r: 3 }}
                activeDot={{ r: 5 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
        
        <p className="text-xs text-slate-400 mt-2 text-center">
          {resourceData.length <= 1 
            ? "Tracking resource changes over time. More data will appear soon..." 
            : `Showing the last ${resourceData.length} data points. Updated every 30 seconds.`}
        </p>
      </div>
    </div>
  );
};

export default Stats;
