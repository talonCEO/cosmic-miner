
import React from 'react';
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { PlayerFriendsProps } from '@/utils/types';

const PlayerFriends: React.FC<PlayerFriendsProps> = ({ friends }) => {
  // Show placeholder if no friends
  if (!friends || friends.length === 0) {
    return (
      <div className="bg-white/10 backdrop-blur-lg rounded-xl p-6 shadow-lg">
        <h3 className="text-xl font-bold mb-4">Friends</h3>
        <div className="flex flex-col items-center justify-center py-6 text-gray-400">
          <p className="mb-2">No friends yet</p>
          <p className="text-sm">Connect with other players to see them here</p>
        </div>
      </div>
    );
  }
  
  return (
    <div className="bg-white/10 backdrop-blur-lg rounded-xl p-6 shadow-lg">
      <h3 className="text-xl font-bold mb-4">Friends</h3>
      <div className="space-y-3">
        {friends.map((friend, index) => (
          <div key={index} className="flex items-center p-2 rounded-lg hover:bg-white/5 transition-colors">
            <Avatar className="h-10 w-10 mr-3">
              <AvatarImage src={friend.avatar} />
              <AvatarFallback>{friend.username.substring(0, 2)}</AvatarFallback>
            </Avatar>
            <div>
              <h4 className="font-medium text-sm">{friend.username}</h4>
              <p className="text-xs text-gray-400">Level {friend.level}</p>
            </div>
            <div className="ml-auto text-xs text-gray-400">
              {friend.status === 'online' ? (
                <span className="flex items-center">
                  <span className="h-2 w-2 rounded-full bg-green-500 mr-1"></span>
                  Online
                </span>
              ) : (
                <span>Last seen {friend.lastSeen}</span>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default PlayerFriends;
