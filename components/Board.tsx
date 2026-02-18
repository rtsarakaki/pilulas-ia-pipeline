'use client';

import { Board as BoardType, Player } from '@/lib/types';

interface BoardProps {
  board: BoardType;
  onCellClick: (position: number) => void;
  disabled: boolean;
}

export function Board({ board, onCellClick, disabled }: BoardProps) {
  return (
    <div className="grid grid-cols-3 gap-2 w-96 h-96 mx-auto">
      {board.map((cell, index) => {
        const isDisabled = disabled || cell !== null;
        
        return (
          <button
            key={index}
            onClick={() => onCellClick(index)}
            disabled={isDisabled}
            className={`
              text-5xl font-bold border-2 border-gray-300 rounded-lg
              transition-all duration-200
              ${isDisabled 
                ? 'bg-gray-100 cursor-not-allowed' 
                : 'bg-white hover:bg-gray-50 cursor-pointer hover:scale-105 active:scale-95'
              }
              ${cell === 'X' ? 'text-blue-600' : ''}
              ${cell === 'O' ? 'text-red-600' : ''}
            `}
          >
            {cell || ''}
          </button>
        );
      })}
    </div>
  );
}
