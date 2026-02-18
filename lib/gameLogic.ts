import { Player, Board, Winner } from './types';

const WINNING_COMBINATIONS = [
  [0, 1, 2], // linha superior
  [3, 4, 5], // linha do meio
  [6, 7, 8], // linha inferior
  [0, 3, 6], // coluna esquerda
  [1, 4, 7], // coluna do meio
  [2, 5, 8], // coluna direita
  [0, 4, 8], // diagonal principal
  [2, 4, 6], // diagonal secundária
];

export function checkWinner(board: Board): Winner {
  for (const combination of WINNING_COMBINATIONS) {
    const [a, b, c] = combination;
    const firstCell = board[a];
    
    if (firstCell && firstCell === board[b] && firstCell === board[c]) {
      return firstCell;
    }
  }
  
  return null;
}

export function checkDraw(board: Board): boolean {
  return board.every(cell => cell !== null) && checkWinner(board) === null;
}

export function isValidMove(board: Board, position: number): boolean {
  return position >= 0 && position < 9 && board[position] === null;
}

export function makeMove(
  board: Board,
  position: number,
  player: 'X' | 'O'
): Board {
  if (!isValidMove(board, position)) {
    return board;
  }
  
  const newBoard = [...board];
  newBoard[position] = player;
  return newBoard;
}

export function getGameStatus(board: Board): {
  status: 'playing' | 'finished';
  winner: Winner;
} {
  const winner = checkWinner(board);
  const isDraw = checkDraw(board);
  
  if (winner) {
    return { status: 'finished', winner };
  }
  
  if (isDraw) {
    return { status: 'finished', winner: 'draw' };
  }
  
  return { status: 'playing', winner: null };
}
