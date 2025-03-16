
import React, { useState, useEffect } from 'react';
import { useFirebase } from '../../context/FirebaseContext';
import PlayerCard from './PlayerCard';
import PlayerFriends from './PlayerFriends';
import { StorageService } from '../../services/StorageService';
import { toast } from 'sonner';
import { useGameContext } from '../../context/GameContext';
import { calculateLevelInfo } from '../../utils/levelUpHandler';

const Profile = () => {
  const { isLoading: firebaseLoading } = useFirebase();
  const { gameState, updateGameState } = useGameContext();
  const [isLoading, setIsLoading] = useState(true);
  const [playerData, setPlayerData] = useState({
    username: 'Cosmic Miner',
    avatar: '/placeholder.svg',
    level: 1,
    experience: 0,
    nextLevelExp: 100,
    achievements: [],
    friends: [],
    stats: {
      totalClicks: 0,
      totalResources: 0,
      totalUpgrades: 0,
      totalPlayTime: 0,
    }
  });

  useEffect(() => {
    const loadPlayerData = async () => {
      try {
        // First try to get data from local storage
        const storedData = await StorageService.getData('playerData');
        
        if (storedData) {
          console.log('Loaded player data from local storage:', storedData);
          
          // Make sure level info is calculated correctly
          const { level, experience, nextLevelExp } = calculateLevelInfo(
            storedData.experience || 0, 
            storedData.level || 1
          );
          
          setPlayerData({
            ...storedData,
            level,
            experience,
            nextLevelExp
          });
          
          // Update game state with loaded level and XP
          updateGameState({
            playerLevel: level,
            playerExperience: experience,
            playerNextLevelExperience: nextLevelExp
          });
        } else {
          // If no stored data, initialize with gameState data
          const { playerLevel, playerExperience } = gameState;
          const { level, experience, nextLevelExp } = calculateLevelInfo(
            playerExperience || 0, 
            playerLevel || 1
          );
          
          const initialPlayerData = {
            ...playerData,
            level,
            experience,
            nextLevelExp,
            stats: {
              totalClicks: gameState.clickCount || 0,
              totalResources: gameState.resources || 0,
              totalUpgrades: gameState.upgradesPurchased || 0,
              totalPlayTime: gameState.playTime || 0,
            }
          };
          
          setPlayerData(initialPlayerData);
          await StorageService.saveData('playerData', initialPlayerData);
          
          // Update game state
          updateGameState({
            playerLevel: level,
            playerExperience: experience,
            playerNextLevelExperience: nextLevelExp
          });
        }
      } catch (error) {
        console.error('Error loading player data:', error);
        toast.error('Failed to load profile data');
      } finally {
        setIsLoading(false);
      }
    };

    loadPlayerData();
  }, [gameState, updateGameState]);

  // Update player data whenever game state changes
  useEffect(() => {
    const updatePlayerDataFromGameState = async () => {
      if (!isLoading) {
        const { playerLevel, playerExperience, clickCount, resources, upgradesPurchased, playTime } = gameState;
        
        // Calculate level info
        const { level, experience, nextLevelExp } = calculateLevelInfo(
          playerExperience || 0, 
          playerLevel || 1
        );
        
        // Only update if there are actual changes
        if (level !== playerData.level || 
            experience !== playerData.experience || 
            clickCount !== playerData.stats?.totalClicks ||
            resources !== playerData.stats?.totalResources) {
          
          const updatedPlayerData = {
            ...playerData,
            level,
            experience,
            nextLevelExp,
            stats: {
              ...playerData.stats,
              totalClicks: clickCount || 0,
              totalResources: resources || 0,
              totalUpgrades: upgradesPurchased || 0,
              totalPlayTime: playTime || 0,
            }
          };
          
          setPlayerData(updatedPlayerData);
          
          // Save to local storage
          await StorageService.saveData('playerData', updatedPlayerData);
          
          // If level increased, show a toast
          if (level > playerData.level) {
            toast.success(`Level Up! You are now level ${level}`);
          }
        }
      }
    };
    
    updatePlayerDataFromGameState();
  }, [gameState, isLoading, playerData]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="w-16 h-16 border-t-4 border-blue-500 border-solid rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="p-4 space-y-6 max-w-4xl mx-auto">
      <PlayerCard 
        username={playerData.username} 
        avatar={playerData.avatar} 
        level={playerData.level}
        experience={playerData.experience}
        nextLevelExp={playerData.nextLevelExp}
        achievements={playerData.achievements || []}
      />
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white/10 backdrop-blur-lg rounded-xl p-6 shadow-lg">
          <h3 className="text-xl font-bold mb-4">Player Stats</h3>
          <ul className="space-y-2">
            <li className="flex justify-between">
              <span>Total Clicks:</span>
              <span className="font-semibold">{playerData.stats?.totalClicks?.toLocaleString() || 0}</span>
            </li>
            <li className="flex justify-between">
              <span>Resources Collected:</span>
              <span className="font-semibold">{playerData.stats?.totalResources?.toLocaleString() || 0}</span>
            </li>
            <li className="flex justify-between">
              <span>Upgrades Purchased:</span>
              <span className="font-semibold">{playerData.stats?.totalUpgrades || 0}</span>
            </li>
            <li className="flex justify-between">
              <span>Play Time:</span>
              <span className="font-semibold">
                {Math.floor((playerData.stats?.totalPlayTime || 0) / 3600)}h {Math.floor(((playerData.stats?.totalPlayTime || 0) % 3600) / 60)}m
              </span>
            </li>
          </ul>
        </div>
        
        <PlayerFriends friends={playerData.friends || []} />
      </div>
    </div>
  );
};

export default Profile;
