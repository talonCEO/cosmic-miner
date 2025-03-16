
import React from 'react';
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { UserPlus } from 'lucide-react';

interface Friend {
  id: string;
  name: string;
  level: number;
  online: boolean;
}

interface PlayerFriendsProps {
  friends?: Friend[];
}

const PlayerFriends: React.FC<PlayerFriendsProps> = ({ friends = [] }) => {
  // Use provided friends array or default to empty array
  const playerFriends = friends.length > 0 ? friends : [
    { id: '1', name: 'CosmicMiner42', level: 27, online: true },
    { id: '2', name: 'StardustCollector', level: 19, online: false },
    { id: '3', name: 'GalacticDriller', level: 31, online: true }
  ];
  
  return (
    <div className="mt-4">
      <div className="flex justify-between items-center mb-2">
        <h3 className="text-white font-medium">Friends</h3>
        <Button size="sm" variant="ghost" className="h-8 px-2 text-xs text-indigo-300">
          <UserPlus size={14} className="mr-1" />
          Add Friend
        </Button>
      </div>
      
      <div className="bg-indigo-600/10 rounded-lg border border-indigo-500/20 overflow-hidden">
        {playerFriends.map(friend => (
          <div key={friend.id} className="flex items-center p-2 border-b border-indigo-500/20 last:border-b-0">
            <div className="relative">
              <Avatar className="h-8 w-8">
                <AvatarImage src="/placeholder.svg" alt={friend.name} />
                <AvatarFallback className="bg-indigo-800/80 text-white text-xs">
                  {friend.name.substring(0, 2).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div className={`absolute -bottom-0.5 -right-0.5 h-2.5 w-2.5 rounded-full border border-gray-800 ${
                friend.online ? 'bg-green-500' : 'bg-gray-500'
              }`}></div>
            </div>
            <div className="ml-2">
              <div className="text-sm text-white">{friend.name}</div>
              <div className="text-xs text-gray-400">Level {friend.level}</div>
            </div>
            <div className="ml-auto">
              <Button variant="ghost" className="h-7 px-2 text-xs text-indigo-300">
                Invite
              </Button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default PlayerFriends;
