'use client';

import { GameStatus as GameStatusType, Winner, Player } from '@/lib/types';

interface GameStatusProps {
  status: GameStatusType;
  currentPlayer: Player;
  winner: Winner;
}

export function GameStatus({ status, currentPlayer, winner }: GameStatusProps) {
  const getStatusMessage = (): string => {
    if (status === 'finished') {
      if (winner === 'draw') {
        return 'Empate!';
      }
      return `Jogador ${winner} venceu! 🎉`;
    }
    return `Vez do jogador: ${currentPlayer}`;
  };

  return (
    <div className="text-center mb-6">
      <div className={`text-2xl font-bold ${
        status === 'finished' 
          ? winner === 'draw' 
            ? 'text-yellow-600' 
            : 'text-green-600'
          : 'text-blue-600'
      }`}>
        {getStatusMessage()}
      </div>
      {status === 'playing' && (
        <div className="text-sm text-gray-600 mt-2">
          Clique em uma célula vazia para fazer sua jogada
        </div>
      )}
    </div>
  );
}
