
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { UserPlus, Trash2, Users, AlertTriangle } from 'lucide-react';
import { Player } from '@/types/Player';
import { validatePlayerName, sanitizeInput, logSecurityEvent } from '@/utils/security';

interface PlayerManagementProps {
  players: Player[];
  onAddPlayer: (name: string) => void;
  onRemovePlayer: (playerId: string) => void;
}

const PlayerManagement: React.FC<PlayerManagementProps> = ({
  players,
  onAddPlayer,
  onRemovePlayer,
}) => {
  const [newPlayerName, setNewPlayerName] = useState('');
  const [validationError, setValidationError] = useState<string>('');

  const handleAddPlayer = () => {
    const sanitizedName = sanitizeInput(newPlayerName.trim());
    const validation = validatePlayerName(sanitizedName);
    
    if (!validation.isValid) {
      setValidationError(validation.error || 'Invalid name');
      logSecurityEvent('Invalid player name attempt', { name: newPlayerName });
      return;
    }

    // Check for duplicate names
    if (players.some(player => player.name.toLowerCase() === sanitizedName.toLowerCase())) {
      setValidationError('A player with this name already exists');
      return;
    }

    setValidationError('');
    onAddPlayer(sanitizedName);
    setNewPlayerName('');
    logSecurityEvent('Player added successfully', { name: sanitizedName });
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setNewPlayerName(e.target.value);
    if (validationError) {
      setValidationError('');
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Users className="h-5 w-5" />
          Player Management
        </CardTitle>
      </CardHeader>
      <CardContent>
        {/* Add Player Form */}
        <div className="mb-6 p-4 bg-slate-50 rounded-lg">
          <h3 className="font-semibold mb-3 flex items-center gap-2">
            <UserPlus className="h-4 w-4" />
            Add New Player
          </h3>
          <div className="space-y-3">
            <div className="flex gap-2">
              <Input
                placeholder="Enter player name (2-50 characters)..."
                value={newPlayerName}
                onChange={handleInputChange}
                onKeyPress={(e) => e.key === 'Enter' && handleAddPlayer()}
                className={`flex-1 ${validationError ? 'border-red-500' : ''}`}
                maxLength={50}
              />
              <Button onClick={handleAddPlayer} disabled={!newPlayerName.trim()}>
                Add Player
              </Button>
            </div>
            {validationError && (
              <Alert variant="destructive">
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription>{validationError}</AlertDescription>
              </Alert>
            )}
          </div>
        </div>

        {/* Players List */}
        <div className="space-y-3">
          <h3 className="font-semibold">Current Players ({players.length})</h3>
          {players.map((player) => (
            <div
              key={player.id}
              className="flex items-center gap-3 p-3 border rounded-lg hover:bg-slate-50 transition-colors"
            >
              <img
                src={player.avatar}
                alt={player.name}
                className="w-10 h-10 rounded-full object-cover"
                onError={(e) => {
                  logSecurityEvent('Avatar image failed to load', { playerId: player.id });
                  e.currentTarget.src = 'https://via.placeholder.com/40x40?text=?';
                }}
              />
              
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <span className="font-medium">{player.name}</span>
                  <Badge variant={player.isOnline ? "default" : "secondary"} className="text-xs">
                    {player.isOnline ? "Online" : "Offline"}
                  </Badge>
                </div>
                <div className="text-sm text-slate-600">
                  Rank #{player.rank} • {player.score.toLocaleString()} points
                </div>
              </div>

              <Button
                variant="outline"
                size="sm"
                onClick={() => onRemovePlayer(player.id)}
                className="text-red-600 hover:text-red-700 hover:bg-red-50"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default PlayerManagement;
