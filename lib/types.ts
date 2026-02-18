export type Player = 'X' | 'O' | null;
export type Board = Player[];
export type GameStatus = 'playing' | 'finished';
export type Winner = 'X' | 'O' | 'draw' | null;

export interface GameState {
  board: Board;
  currentPlayer: 'X' | 'O';
  status: GameStatus;
  winner: Winner;
}
