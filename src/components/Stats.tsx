import React, { useState, useEffect } from 'react';
import { useGame } from '@/context/GameContext';
import { formatNumber } from '@/utils/gameLogic';
import * as GameMechanics from '@/utils/GameMechanics';

const Stats: React.FC = () => {
  const { state } = useGame();
  const [tapPower, setTapPower] = useState(GameMechanics.calculateTapValue(state));
  const [totalCPS, setTotalCPS] = useState(GameMechanics.calculateTotalCoinsPerSecond(state));

  // Update tapPower and totalCPS whenever state changes, and log for debugging
  useEffect(() => {
    const newTapPower = GameMechanics.calculateTapValue(state);
    const newTotalCPS = GameMechanics.calculateTotalCoinsPerSecond(state);
    setTapPower(newTapPower);
    setTotalCPS(newTotalCPS);

    // Debugging logs
    console.log('Tap Power:', newTapPower);
    console.log('Total CPS:', newTotalCPS);
    console.log('Active Boosts:', state.activeBoosts);
  }, [state]);

  return (
    <div className="stats-container p-4 bg-gray-800 text-white rounded-lg shadow-md">
      <h2 className="text-xl font-bold mb-2">Stats</h2>
      <div className="stat-item flex justify-between mb-1">
        <span>Coins:</span>
        <span>{formatNumber(state.coins)}</span>
      </div>
      <div className="stat-item flex justify-between mb-1">
        <span>Tap Power:</span>
        <span>{formatNumber(tapPower)}</span>
      </div>
      <div className="stat-item flex justify-between mb-1">
        <span>Coins Per Second:</span>
        <span>{formatNumber(totalCPS)}</span>
      </div>
      <div className="stat-item flex justify-between mb-1">
        <span>Total Clicks:</span>
        <span>{formatNumber(state.totalClicks)}</span>
      </div>
      <div className="stat-item flex justify-between mb-1">
        <span>Total Earned:</span>
        <span>{formatNumber(state.totalEarned)}</span>
      </div>
      <div className="stat-item flex justify-between mb-1">
        <span>Essence:</span>
        <span>{formatNumber(state.essence)}</span>
      </div>
      <div className="stat-item flex justify-between mb-1">
        <span>Gems:</span>
        <span>{formatNumber(state.gems)}</span>
      </div>
      <div className="stat-item flex justify-between">
        <span>Prestige Count:</span>
        <span>{state.prestigeCount}</span>
      </div>
    </div>
  );
};

export default Stats;
