'use client';

import { useState, useCallback } from 'react';
import { GameState, Player } from './types';
import { makeMove, getGameStatus } from './gameLogic';

const INITIAL_STATE: GameState = {
  board: Array(9).fill(null) as Player[],
  currentPlayer: 'X',
  status: 'playing',
  winner: null,
};

export function useGame() {
  const [gameState, setGameState] = useState<GameState>(INITIAL_STATE);

  const handleCellClick = useCallback((position: number) => {
    setGameState((prev) => {
      if (prev.status === 'finished') {
        return prev;
      }

      if (prev.board[position] !== null) {
        return prev;
      }

      const newBoard = makeMove(prev.board, position, prev.currentPlayer);
      const { status, winner } = getGameStatus(newBoard);
      const nextPlayer = prev.currentPlayer === 'X' ? 'O' : 'X';

      return {
        board: newBoard,
        currentPlayer: status === 'playing' ? nextPlayer : prev.currentPlayer,
        status,
        winner,
      };
    });
  }, []);

  const resetGame = useCallback(() => {
    setGameState(INITIAL_STATE);
  }, []);

  return {
    gameState,
    handleCellClick,
    resetGame,
  };
}
