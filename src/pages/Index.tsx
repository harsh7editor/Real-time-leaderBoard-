import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Trophy, Users, TrendingUp, Settings } from 'lucide-react';
import Leaderboard from '@/components/Leaderboard';
import PlayerManagement from '@/components/PlayerManagement';
import ScoreSimulator from '@/components/ScoreSimulator';
import LiveStats from '@/components/LiveStats';
import { Player } from '@/types/Player';
import { validatePlayerName, validateImageUrl, logSecurityEvent } from '@/utils/security';

const Index = () => {
  const [players, setPlayers] = useState<Player[]>([
    { id: '1', name: 'Alice Johnson', score: 2850, rank: 1, avatar: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=150&h=150&fit=crop&crop=face', isOnline: true },
    { id: '2', name: 'Bob Smith', score: 2730, rank: 2, avatar: 'https://images.unsplash.com/photo-1599566150163-29194dcaad36?w=150&h=150&fit=crop&crop=face', isOnline: true },
    { id: '3', name: 'Carol Davis', score: 2680, rank: 3, avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop&crop=face', isOnline: false },
    { id: '4', name: 'David Wilson', score: 2590, rank: 4, avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face', isOnline: true },
    { id: '5', name: 'Eva Brown', score: 2510, rank: 5, avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&h=150&fit=crop&crop=face', isOnline: true },
  ]);
  
  const [activeTab, setActiveTab] = useState<'leaderboard' | 'players' | 'simulator'>('leaderboard');
  const [isLive, setIsLive] = useState(true);

  // Simulate real-time score updates
  useEffect(() => {
    if (!isLive) return;

    const interval = setInterval(() => {
      setPlayers(prevPlayers => {
        const updatedPlayers = prevPlayers.map(player => {
          // Random chance of score update
          if (Math.random() < 0.3) {
            const scoreChange = Math.floor(Math.random() * 100) - 30; // -30 to +70 points
            return {
              ...player,
              score: Math.max(0, player.score + scoreChange)
            };
          }
          return player;
        });

        // Recalculate rankings
        const sortedPlayers = [...updatedPlayers].sort((a, b) => b.score - a.score);
        return sortedPlayers.map((player, index) => ({
          ...player,
          rank: index + 1
        }));
      });
    }, 3000); // Update every 3 seconds

    return () => clearInterval(interval);
  }, [isLive]);

  const updatePlayerScore = (playerId: string, newScore: number) => {
    setPlayers(prevPlayers => {
      const updatedPlayers = prevPlayers.map(player =>
        player.id === playerId ? { ...player, score: newScore } : player
      );
      
      // Recalculate rankings
      const sortedPlayers = [...updatedPlayers].sort((a, b) => b.score - a.score);
      return sortedPlayers.map((player, index) => ({
        ...player,
        rank: index + 1
      }));
    });
  };

  const addPlayer = (name: string) => {
    const validation = validatePlayerName(name);
    if (!validation.isValid) {
      logSecurityEvent('Failed to add player - validation error', { name, error: validation.error });
      return;
    }

    // Check for duplicate names
    if (players.some(player => player.name.toLowerCase() === name.toLowerCase())) {
      logSecurityEvent('Failed to add player - duplicate name', { name });
      return;
    }

    // Generate a secure avatar URL
    const avatarUrl = `https://images.unsplash.com/photo-${1500000000000 + Math.floor(Math.random() * 1000000000)}?w=150&h=150&fit=crop&crop=face`;
    
    if (!validateImageUrl(avatarUrl)) {
      logSecurityEvent('Invalid avatar URL generated', { url: avatarUrl });
    }

    const newPlayer: Player = {
      id: Date.now().toString(),
      name,
      score: 0,
      rank: players.length + 1,
      avatar: avatarUrl,
      isOnline: true
    };
    
    setPlayers(prev => [...prev, newPlayer]);
    logSecurityEvent('Player added successfully', { playerId: newPlayer.id, name });
  };

  const removePlayer = (playerId: string) => {
    const playerToRemove = players.find(p => p.id === playerId);
    if (playerToRemove) {
      setPlayers(prev => prev.filter(player => player.id !== playerId));
      logSecurityEvent('Player removed', { playerId, name: playerToRemove.name });
    }
  };

  const totalPlayers = players.length;
  const onlinePlayers = players.filter(p => p.isOnline).length;
  const averageScore = Math.round(players.reduce((sum, p) => sum + p.score, 0) / totalPlayers);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-bold text-slate-900 mb-2">Live Rank Arena</h1>
              <p className="text-slate-600">Real-time leaderboard with live score updates</p>
            </div>
            <div className="flex items-center gap-3">
              <Badge variant={isLive ? "default" : "secondary"} className="px-3 py-1">
                {isLive ? "🔴 LIVE" : "⏸️ PAUSED"}
              </Badge>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsLive(!isLive)}
              >
                {isLive ? "Pause Updates" : "Resume Updates"}
              </Button>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <Users className="h-5 w-5 text-blue-600" />
                </div>
                <div>
                  <p className="text-sm text-slate-600">Total Players</p>
                  <p className="text-2xl font-bold">{totalPlayers}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-green-100 rounded-lg">
                  <div className="h-5 w-5 bg-green-500 rounded-full"></div>
                </div>
                <div>
                  <p className="text-sm text-slate-600">Online Now</p>
                  <p className="text-2xl font-bold">{onlinePlayers}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-yellow-100 rounded-lg">
                  <TrendingUp className="h-5 w-5 text-yellow-600" />
                </div>
                <div>
                  <p className="text-sm text-slate-600">Avg Score</p>
                  <p className="text-2xl font-bold">{averageScore}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-purple-100 rounded-lg">
                  <Trophy className="h-5 w-5 text-purple-600" />
                </div>
                <div>
                  <p className="text-sm text-slate-600">Top Score</p>
                  <p className="text-2xl font-bold">{players[0]?.score || 0}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Navigation Tabs */}
        <div className="flex gap-2 mb-6">
          <Button
            variant={activeTab === 'leaderboard' ? 'default' : 'outline'}
            onClick={() => setActiveTab('leaderboard')}
            className="flex items-center gap-2"
          >
            <Trophy className="h-4 w-4" />
            Leaderboard
          </Button>
          <Button
            variant={activeTab === 'players' ? 'default' : 'outline'}
            onClick={() => setActiveTab('players')}
            className="flex items-center gap-2"
          >
            <Users className="h-4 w-4" />
            Manage Players
          </Button>
          <Button
            variant={activeTab === 'simulator' ? 'default' : 'outline'}
            onClick={() => setActiveTab('simulator')}
            className="flex items-center gap-2"
          >
            <Settings className="h-4 w-4" />
            Score Simulator
          </Button>
        </div>

        {/* Content */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          <div className="lg:col-span-3">
            {activeTab === 'leaderboard' && <Leaderboard players={players} />}
            {activeTab === 'players' && (
              <PlayerManagement
                players={players}
                onAddPlayer={addPlayer}
                onRemovePlayer={removePlayer}
              />
            )}
            {activeTab === 'simulator' && (
              <ScoreSimulator
                players={players}
                onUpdateScore={updatePlayerScore}
              />
            )}
          </div>

          <div className="lg:col-span-1">
            <LiveStats players={players} isLive={isLive} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Index;
