import React, { useState } from 'react';
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { UserCircle, Search, Plus, UserPlus } from 'lucide-react';

interface Friend {
  id: string;
  name: string;
  level: number;
  rank: string;
  online: boolean;
}

// Mock friends data for demonstration
const mockFriends: Friend[] = [
  { id: '1', name: 'StarGazer', level: 42, rank: 'Galaxy Explorer', online: true },
  { id: '2', name: 'NebulaNinja', level: 37, rank: 'Cosmic Hunter', online: false },
  { id: '3', name: 'AstroAdventurer', level: 45, rank: 'Space Pioneer', online: true },
];

// Mock search results
const mockSearchResults: Friend[] = [
  { id: '4', name: 'CosmicCrusader', level: 51, rank: 'Stellar Champion', online: true },
  { id: '5', name: 'GalacticGamer', level: 29, rank: 'Star Voyager', online: false },
];

const PlayerFriends: React.FC = () => {
  const [friends] = useState<Friend[]>(mockFriends);
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState<Friend[]>([]);
  const [isSearching, setIsSearching] = useState(false);

  const handleSearch = () => {
    if (searchTerm.trim()) {
      setIsSearching(true);
      // Simulate API search
      setTimeout(() => {
        setSearchResults(mockSearchResults.filter(friend =>
          friend.name.toLowerCase().includes(searchTerm.toLowerCase())
        ));
        setIsSearching(false);
      }, 500);
    }
  };

  const handleAddFriend = (friend: Friend) => {
    console.log(`Added friend: ${friend.name}`);
    // Here you would update the actual friends list
  };

  return (
    <div className="bg-indigo-600/20 rounded-lg p-3 border border-indigo-500/30">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-semibold text-white flex items-center">
          <UserCircle size={16} className="mr-1.5 text-blue-400" />
          Friends
        </h3>
      </div>

      {/* Two-Column Layout */}
      <div className="grid grid-cols-2 gap-4">
        {/* Column 1: Friends List */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <h4 className="text-xs text-slate-300">Your Friends</h4>
            <span className="text-xs text-slate-300">{friends.length} online</span>
          </div>
          {friends.map(friend => (
            <div key={friend.id} className="flex items-center p-1.5 bg-indigo-700/30 rounded-md">
              <div className="relative">
                <Avatar className="h-8 w-8">
                  <AvatarImage src="/placeholder.svg" alt={friend.name} />
                  <AvatarFallback className="bg-indigo-800/50 text-xs">
                    {friend.name.substring(0, 2).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div className={`absolute bottom-0 right-0 w-2 h-2 rounded-full ${friend.online ? 'bg-green-500' : 'bg-gray-500'}`}></div>
              </div>
              <div className="ml-2 flex-1">
                <div className="text-xs font-medium text-white">{friend.name}</div>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] text-slate-300">Lvl {friend.level}</span>
                  <span className="text-[10px] text-indigo-300">{friend.rank}</span>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Column 2: Search Input and Results */}
        <div>
          {/* Add Friends Heading */}
          <div className="flex items-center mb-2">
            <h4 className="text-xs text-slate-300 flex items-center">
              <UserPlus size={14} className="mr-1 text-green-400" />
              Add Friends
            </h4>
          </div>

          {/* Search Input */}
          <div className="flex items-center gap-1 mb-3">
            <Input
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search friends..."
              className="h-8 text-xs bg-indigo-900/30 border-indigo-600/50 text-white"
            />
            <Button
              size="sm"
              variant="ghost"
              className="h-8 w-8 p-0"
              onClick={handleSearch}
              disabled={isSearching}
            >
              <Search size={14} className="text-slate-300" />
            </Button>
          </div>

          {/* Search Results */}
          {searchResults.length > 0 && (
            <div className="space-y-2">
              <h4 className="text-xs text-slate-300 mb-1">Search Results</h4>
              {searchResults.map(result => (
                <div key={result.id} className="flex items-center p-1.5 bg-indigo-700/30 rounded-md">
                  <Avatar className="h-6 w-6">
                    <AvatarImage src="/placeholder.svg" alt={result.name} />
                    <AvatarFallback className="bg-indigo-800/50 text-[10px]">
                      {result.name.substring(0, 2).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div className="ml-2 flex-1">
                    <div className="text-xs font-medium text-white">{result.name}</div>
                    <div className="text-[10px] text-slate-300">Lvl {result.level}</div>
                  </div>
                  <Button
                    size="sm"
                    variant="ghost"
                    className="h-6 w-6 p-0"
                    onClick={() => handleAddFriend(result)}
                  >
                    <Plus size={12} className="text-green-400" />
                  </Button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default PlayerFriends;
