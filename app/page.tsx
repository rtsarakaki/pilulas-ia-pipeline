'use client';

import { useGame } from '@/lib/useGame';
import { Board } from '@/components/Board';
import { GameStatus } from '@/components/GameStatus';

export default function Home() {
  const { gameState, handleCellClick, resetGame } = useGame();

  return (
    <main className="min-h-screen flex flex-col items-center justify-center p-8 bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="bg-white rounded-lg shadow-xl p-8 max-w-md w-full">
        <h1 className="text-4xl font-bold text-center mb-6 text-gray-800">
          Jogo da Velha
        </h1>
        
        <GameStatus
          status={gameState.status}
          currentPlayer={gameState.currentPlayer}
          winner={gameState.winner}
        />
        
        <Board
          board={gameState.board}
          onCellClick={handleCellClick}
          disabled={gameState.status === 'finished'}
        />
        
        {gameState.status === 'finished' && (
          <div className="mt-6 text-center">
            <button
              onClick={resetGame}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-semibold"
            >
              Jogar Novamente
            </button>
          </div>
        )}
      </div>
    </main>
  );
}
