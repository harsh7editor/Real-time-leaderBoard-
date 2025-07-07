
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Activity, TrendingUp, TrendingDown, Clock } from 'lucide-react';
import { Player } from '@/types/Player';

interface LiveStatsProps {
  players: Player[];
  isLive: boolean;
}

const LiveStats: React.FC<LiveStatsProps> = ({ players, isLive }) => {
  const [recentChanges, setRecentChanges] = useState<Array<{
    playerId: string;
    playerName: string;
    oldScore: number;
    newScore: number;
    timestamp: Date;
  }>>([]);

  const [lastUpdate, setLastUpdate] = useState<Date>(new Date());

  useEffect(() => {
    setLastUpdate(new Date());
  }, [players]);

  // Track score changes
  useEffect(() => {
    const prevScores = JSON.parse(localStorage.getItem('prevScores') || '{}');
    
    players.forEach(player => {
      const prevScore = prevScores[player.id];
      if (prevScore !== undefined && prevScore !== player.score) {
        setRecentChanges(prev => [
          {
            playerId: player.id,
            playerName: player.name,
            oldScore: prevScore,
            newScore: player.score,
            timestamp: new Date()
          },
          ...prev.slice(0, 9) // Keep only 10 most recent changes
        ]);
      }
    });

    // Update stored scores
    const currentScores = players.reduce((acc, player) => {
      acc[player.id] = player.score;
      return acc;
    }, {} as Record<string, number>);
    localStorage.setItem('prevScores', JSON.stringify(currentScores));
  }, [players]);

  const topPlayer = players[0];
  const onlineCount = players.filter(p => p.isOnline).length;
  const totalScore = players.reduce((sum, p) => sum + p.score, 0);

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('en-US', { 
      hour12: false, 
      hour: '2-digit', 
      minute: '2-digit', 
      second: '2-digit' 
    });
  };

  const getScoreChange = (oldScore: number, newScore: number) => {
    const change = newScore - oldScore;
    return change > 0 ? `+${change}` : change.toString();
  };

  return (
    <div className="space-y-4">
      {/* Live Status */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-lg flex items-center gap-2">
            <Activity className="h-5 w-5" />
            Live Stats
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-sm text-slate-600">Status</span>
            <Badge variant={isLive ? "default" : "secondary"}>
              {isLive ? "🔴 Live" : "⏸️ Paused"}
            </Badge>
          </div>
          
          <div className="flex items-center justify-between">
            <span className="text-sm text-slate-600">Last Update</span>
            <span className="text-sm font-mono">{formatTime(lastUpdate)}</span>
          </div>

          <div className="flex items-center justify-between">
            <span className="text-sm text-slate-600">Online Players</span>
            <span className="font-semibold">{onlineCount}/{players.length}</span>
          </div>

          <div className="flex items-center justify-between">
            <span className="text-sm text-slate-600">Total Points</span>
            <span className="font-semibold">{totalScore.toLocaleString()}</span>
          </div>
        </CardContent>
      </Card>

      {/* Current Leader */}
      {topPlayer && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-lg">Current Leader</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-3">
              <img
                src={topPlayer.avatar}
                alt={topPlayer.name}
                className="w-12 h-12 rounded-full object-cover"
              />
              <div>
                <div className="font-semibold">{topPlayer.name}</div>
                <div className="text-2xl font-bold text-yellow-600">
                  {topPlayer.score.toLocaleString()}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Recent Changes */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-lg flex items-center gap-2">
            <Clock className="h-5 w-5" />
            Recent Changes
          </CardTitle>
        </CardHeader>
        <CardContent>
          {recentChanges.length > 0 ? (
            <div className="space-y-3 max-h-64 overflow-y-auto">
              {recentChanges.map((change, index) => {
                const scoreDiff = change.newScore - change.oldScore;
                const isPositive = scoreDiff > 0;
                
                return (
                  <div key={index} className="flex items-center gap-2 text-sm">
                    <div className={`p-1 rounded ${isPositive ? 'bg-green-100' : 'bg-red-100'}`}>
                      {isPositive ? (
                        <TrendingUp className="h-3 w-3 text-green-600" />
                      ) : (
                        <TrendingDown className="h-3 w-3 text-red-600" />
                      )}
                    </div>
                    <div className="flex-1">
                      <div className="font-medium truncate">{change.playerName}</div>
                      <div className="text-xs text-slate-500">
                        {formatTime(change.timestamp)}
                      </div>
                    </div>
                    <div className={`font-semibold ${isPositive ? 'text-green-600' : 'text-red-600'}`}>
                      {getScoreChange(change.oldScore, change.newScore)}
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="text-center text-slate-500 py-4">
              No recent changes
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default LiveStats;
