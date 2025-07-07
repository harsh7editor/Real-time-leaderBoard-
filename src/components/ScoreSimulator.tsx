
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Settings, Plus, Minus, Zap, AlertTriangle } from 'lucide-react';
import { Player } from '@/types/Player';
import { validateScore, logSecurityEvent } from '@/utils/security';

interface ScoreSimulatorProps {
  players: Player[];
  onUpdateScore: (playerId: string, newScore: number) => void;
}

const ScoreSimulator: React.FC<ScoreSimulatorProps> = ({
  players,
  onUpdateScore,
}) => {
  const [selectedPlayerId, setSelectedPlayerId] = useState<string>('');
  const [scoreChange, setScoreChange] = useState<string>('100');
  const [validationError, setValidationError] = useState<string>('');

  const handleScoreUpdate = (playerId: string, change: number) => {
    const player = players.find(p => p.id === playerId);
    if (player) {
      const newScore = Math.max(0, player.score + change);
      const validation = validateScore(newScore);
      
      if (!validation.isValid) {
        setValidationError(validation.error || 'Invalid score');
        logSecurityEvent('Invalid score update attempt', { 
          playerId, 
          currentScore: player.score, 
          change, 
          newScore 
        });
        return;
      }

      setValidationError('');
      onUpdateScore(playerId, newScore);
      logSecurityEvent('Score updated', { playerId, oldScore: player.score, newScore });
    }
  };

  const handleBulkScoreUpdate = () => {
    const change = parseInt(scoreChange) || 0;
    if (selectedPlayerId) {
      // Validate the score change amount
      if (Math.abs(change) > 10000) {
        setValidationError('Score change cannot exceed ±10,000 points');
        logSecurityEvent('Excessive score change attempt', { change });
        return;
      }
      
      handleScoreUpdate(selectedPlayerId, change);
    }
  };

  const simulateRandomUpdates = () => {
    let updatedCount = 0;
    players.forEach(player => {
      if (Math.random() < 0.7) { // 70% chance for each player
        const change = Math.floor(Math.random() * 200) - 50; // -50 to +150 points
        handleScoreUpdate(player.id, change);
        updatedCount++;
      }
    });
    logSecurityEvent('Random score simulation completed', { playersUpdated: updatedCount });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Settings className="h-5 w-5" />
          Score Simulator
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {validationError && (
          <Alert variant="destructive">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>{validationError}</AlertDescription>
          </Alert>
        )}

        {/* Bulk Update Section */}
        <div className="p-4 bg-slate-50 rounded-lg">
          <h3 className="font-semibold mb-3">Bulk Score Update</h3>
          <div className="space-y-3">
            <Select value={selectedPlayerId} onValueChange={setSelectedPlayerId}>
              <SelectTrigger>
                <SelectValue placeholder="Select a player..." />
              </SelectTrigger>
              <SelectContent>
                {players.map((player) => (
                  <SelectItem key={player.id} value={player.id}>
                    {player.name} (Current: {player.score.toLocaleString()})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            
            <div className="flex gap-2">
              <Input
                type="number"
                placeholder="Score change (±10,000 max)"
                value={scoreChange}
                onChange={(e) => {
                  setScoreChange(e.target.value);
                  if (validationError) setValidationError('');
                }}
                className="flex-1"
                min="-10000"
                max="10000"
              />
              <Button onClick={handleBulkScoreUpdate} disabled={!selectedPlayerId}>
                Update Score
              </Button>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="p-4 bg-blue-50 rounded-lg">
          <h3 className="font-semibold mb-3 flex items-center gap-2">
            <Zap className="h-4 w-4" />
            Quick Actions
          </h3>
          <Button onClick={simulateRandomUpdates} className="w-full">
            Simulate Random Score Updates
          </Button>
        </div>

        {/* Individual Player Controls */}
        <div>
          <h3 className="font-semibold mb-3">Individual Controls</h3>
          <div className="space-y-3 max-h-96 overflow-y-auto">
            {players.map((player) => (
              <div
                key={player.id}
                className="flex items-center gap-3 p-3 border rounded-lg"
              >
                <img
                  src={player.avatar}
                  alt={player.name}
                  className="w-8 h-8 rounded-full object-cover"
                  onError={(e) => {
                    logSecurityEvent('Avatar image failed to load', { playerId: player.id });
                    e.currentTarget.src = 'https://via.placeholder.com/32x32?text=?';
                  }}
                />
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="font-medium truncate">{player.name}</span>
                    <Badge variant="outline" className="text-xs">
                      #{player.rank}
                    </Badge>
                  </div>
                  <div className="text-sm text-slate-600">
                    {player.score.toLocaleString()} points
                  </div>
                </div>

                <div className="flex gap-1">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleScoreUpdate(player.id, -50)}
                  >
                    <Minus className="h-3 w-3" />
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleScoreUpdate(player.id, 50)}
                  >
                    <Plus className="h-3 w-3" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default ScoreSimulator;
