
import React, { useState, useEffect } from 'react';
import { DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useFirebase } from '@/context/FirebaseContext';
import { Loader2, Trophy, Sparkles, Users, Search } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { getFirestore, collection, query, orderBy, limit, getDocs, where } from 'firebase/firestore';

interface LeaderboardPlayer {
  userId: string;
  username: string;
  level: number;
  exp: number;
  title: string;
  avatarUrl?: string;
}

const Leaderboard: React.FC = () => {
  const { profile } = useFirebase();
  const [players, setPlayers] = useState<LeaderboardPlayer[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [leaderboardType, setLeaderboardType] = useState<'level' | 'friends'>('level');

  useEffect(() => {
    const fetchLeaderboard = async () => {
      try {
        setLoading(true);
        const db = getFirestore();
        
        if (leaderboardType === 'level') {
          // Fetch global leaderboard
          const leaderboardQuery = query(
            collection(db, 'users'),
            orderBy('level', 'desc'),
            orderBy('exp', 'desc'),
            limit(20)
          );
          
          const querySnapshot = await getDocs(leaderboardQuery);
          const leaderboardData: LeaderboardPlayer[] = [];
          
          querySnapshot.forEach((doc) => {
            const data = doc.data();
            leaderboardData.push({
              userId: doc.id,
              username: data.username || 'Unknown Player',
              level: data.level || 1,
              exp: data.exp || 0,
              title: data.title || 'Space Pilot',
              avatarUrl: data.avatarUrl
            });
          });
          
          setPlayers(leaderboardData);
        } else {
          // Fetch friends leaderboard
          // This would need to be implemented based on your friend system
          // For now, we'll just display a mock friends leaderboard
          setPlayers([
            {
              userId: 'friend1',
              username: 'SpaceBuddy',
              level: 42,
              exp: 78500,
              title: 'Stellar Prospector'
            },
            {
              userId: 'friend2',
              username: 'CosmicPal',
              level: 38,
              exp: 62300,
              title: 'Galactic Engineer'
            },
            {
              userId: 'friend3',
              username: 'AsteroidFriend',
              level: 27,
              exp: 41900,
              title: 'Cosmic Excavator'
            }
          ]);
        }
      } catch (error) {
        console.error("Error fetching leaderboard:", error);
        setPlayers([]);
      } finally {
        setLoading(false);
      }
    };

    fetchLeaderboard();
  }, [leaderboardType]);

  const filteredPlayers = players.filter(player => 
    player.username.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
  };

  return (
    <>
      <DialogHeader className="p-4 border-b border-indigo-500/20">
        <DialogTitle className="text-center text-xl">Leaderboard</DialogTitle>
      </DialogHeader>

      <div className="p-4 space-y-4">
        {/* Leaderboard tabs */}
        <div className="flex space-x-2 border-b border-indigo-500/20 pb-2">
          <button
            onClick={() => setLeaderboardType('level')}
            className={`px-4 py-2 rounded-t-lg flex items-center space-x-1 ${
              leaderboardType === 'level'
                ? 'bg-indigo-600/50 text-white font-medium'
                : 'text-slate-300 hover:bg-indigo-600/30'
            }`}
          >
            <Trophy size={16} />
            <span>Global</span>
          </button>
          <button
            onClick={() => setLeaderboardType('friends')}
            className={`px-4 py-2 rounded-t-lg flex items-center space-x-1 ${
              leaderboardType === 'friends'
                ? 'bg-indigo-600/50 text-white font-medium'
                : 'text-slate-300 hover:bg-indigo-600/30'
            }`}
          >
            <Users size={16} />
            <span>Friends</span>
          </button>
        </div>

        {/* Search bar */}
        <div className="relative">
          <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 text-slate-400" size={16} />
          <Input
            placeholder="Search players..."
            className="bg-slate-800/50 border-slate-700 pl-8"
            value={searchTerm}
            onChange={handleSearch}
          />
        </div>

        {/* Leaderboard list */}
        {loading ? (
          <div className="flex flex-col items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-indigo-500" />
            <p className="mt-2 text-slate-300">Loading leaderboard...</p>
          </div>
        ) : (
          <div className="space-y-1 max-h-[400px] overflow-y-auto pr-1">
            {filteredPlayers.length > 0 ? (
              filteredPlayers.map((player, index) => (
                <div
                  key={player.userId}
                  className={`flex items-center p-2 rounded-lg ${
                    player.userId === profile?.userId
                      ? 'bg-indigo-600/30 border border-indigo-500/50'
                      : 'bg-slate-800/50 hover:bg-slate-700/50'
                  }`}
                >
                  <div className="w-8 text-center font-bold text-slate-400">
                    {index + 1}
                  </div>
                  <div className="relative">
                    <Avatar className="h-9 w-9 border border-slate-600">
                      <AvatarImage src={player.avatarUrl || "/placeholder.svg"} />
                      <AvatarFallback className="bg-indigo-700/50 text-white">
                        {player.username.substring(0, 2).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    {index < 3 && (
                      <div className="absolute -top-1 -right-1 bg-amber-500 rounded-full p-0.5">
                        <Trophy size={12} className="text-white" />
                      </div>
                    )}
                  </div>
                  <div className="ml-3 flex-1">
                    <div className="flex items-center">
                      <span className="font-medium text-white">{player.username}</span>
                      {player.userId === profile?.userId && (
                        <span className="ml-2 text-xs px-1.5 py-0.5 bg-indigo-500/50 rounded text-white">You</span>
                      )}
                    </div>
                    <div className="text-xs text-slate-400">{player.title}</div>
                  </div>
                  <div className="flex flex-col items-end">
                    <div className="flex items-center text-sm font-medium text-amber-400">
                      <Sparkles size={14} className="mr-1" />
                      <span>Lvl {player.level}</span>
                    </div>
                    <div className="text-xs text-slate-400">
                      {(player.exp / 1000).toFixed(1)}K XP
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-8 text-slate-400">
                No players found with that name
              </div>
            )}
          </div>
        )}
      </div>
    </>
  );
};

export default Leaderboard;
