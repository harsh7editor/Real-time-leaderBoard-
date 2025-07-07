
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Trophy, Medal, Award } from 'lucide-react';
import { Player } from '@/types/Player';

interface LeaderboardProps {
  players: Player[];
}

const Leaderboard: React.FC<LeaderboardProps> = ({ players }) => {
  const getRankIcon = (rank: number) => {
    switch (rank) {
      case 1:
        return <Trophy className="h-6 w-6 text-yellow-500" />;
      case 2:
        return <Medal className="h-6 w-6 text-gray-400" />;
      case 3:
        return <Award className="h-6 w-6 text-orange-500" />;
      default:
        return <div className="h-6 w-6 flex items-center justify-center text-slate-600 font-bold">#{rank}</div>;
    }
  };

  const getRankBadgeColor = (rank: number) => {
    switch (rank) {
      case 1:
        return "bg-gradient-to-r from-yellow-400 to-yellow-600";
      case 2:
        return "bg-gradient-to-r from-gray-300 to-gray-500";
      case 3:
        return "bg-gradient-to-r from-orange-400 to-orange-600";
      default:
        return "bg-slate-500";
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Trophy className="h-5 w-5" />
          Live Leaderboard
        </CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        <div className="space-y-2">
          {players.map((player, index) => (
            <div
              key={player.id}
              className={`flex items-center gap-4 p-4 transition-all duration-300 hover:bg-slate-50 ${
                index < 3 ? 'bg-gradient-to-r from-slate-50 to-transparent' : ''
              }`}
            >
              {/* Rank */}
              <div className="flex-shrink-0">
                {getRankIcon(player.rank)}
              </div>

              {/* Avatar */}
              <div className="relative">
                <img
                  src={player.avatar}
                  alt={player.name}
                  className="w-12 h-12 rounded-full object-cover border-2 border-white shadow-md"
                />
                {player.isOnline && (
                  <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-white"></div>
                )}
              </div>

              {/* Player Info */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <h3 className="font-semibold text-slate-900 truncate">{player.name}</h3>
                  {player.rank <= 3 && (
                    <Badge className={`text-white text-xs ${getRankBadgeColor(player.rank)}`}>
                      TOP {player.rank}
                    </Badge>
                  )}
                </div>
                <div className="flex items-center gap-2 mt-1">
                  <span className="text-sm text-slate-600">Rank #{player.rank}</span>
                  <span className="text-xs text-slate-400">•</span>
                  <Badge variant={player.isOnline ? "default" : "secondary"} className="text-xs">
                    {player.isOnline ? "Online" : "Offline"}
                  </Badge>
                </div>
              </div>

              {/* Score */}
              <div className="text-right">
                <div className="text-2xl font-bold text-slate-900">
                  {player.score.toLocaleString()}
                </div>
                <div className="text-sm text-slate-500">points</div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default Leaderboard;
